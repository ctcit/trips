<?php
define('_JEXEC', 1);
require_once( 'alastair.php' );
require_once( 'trips.config.php' );
require_once( 'trips.inc.php' );

$action   		= strval($_GET["action"]);
$tripid   		= intval($_GET["tripid"]);
$editid   		= intval($_GET["editid"]);
$logondetails	= GetLogonDetails($con,$username);
$userid 		= intval($logondetails["userid"]);
$config 		= new ReflectionClass("TripConfig");
$metadata		= GetMetadata($con);

if ($action == "gettrips") {
	$where = "COALESCE(t.date, e.date) > DATE_ADD(now(),INTERVAL -7 DAY)";
	$trips = GetTrips($con,$where);
	$leaders = SqlResultArray($con,"
		SELECT t.id as tripid, 
			COALESCE(p.name,concat(trim(m.firstname),' ',trim(m.lastname))) as name
		FROM      ".TripConfig::TripDB.".trips t 
		JOIN      ".TripConfig::TripDB.".participants p ON p.tripid = t.id and p.isleader = 1
		LEFT JOIN ".TripConfig::NewsletterDB.".events e ON e.id = t.eventid
		LEFT JOIN ".TripConfig::CtcDB.".members       m ON m.id = p.memberid
		WHERE $where
		order by tripid");
	$roles = SqlResultArray($con,"
		SELECT tripid, 'Editor'      as role FROM ".TripConfig::TripDB.".changehistory WHERE memberid = $userid
		UNION
		SELECT tripid, 'Participant' as role FROM ".TripConfig::TripDB.".participants WHERE memberid = $userid and isleader = 0 
		UNION
		SELECT tripid, 'Leader'      as role FROM ".TripConfig::TripDB.".participants WHERE memberid = $userid and isleader = 1
		UNION
		SELECT tripid, 'Removed' 	 as role FROM ".TripConfig::TripDB.".participants WHERE memberid = $userid and isremoved = 1","tripid");
			
	$result = array("action" => $action,"config" => $config->getConstants(), "userid" => $userid, "metadata" => $metadata);
	$result["groups"][0] = array("name"=>"My Trips","isMyTrips"=>true);
	$result["groups"][1] = array("name"=>"Open Trips");
	$result["groups"][2] = array("name"=>"Closed Trips");
	
	foreach ($trips as &$trip)
	{
		$tripleaders = array();
		foreach ($leaders as $leader)
		{
			if ($leader["tripid"] == $trip["tripid"]) {
				$tripleaders []= $leader["name"];
			}
		}
		
		$trip["leader"] = implode(", ",$tripleaders);
		
		if (array_key_exists($trip["tripid"],$roles) && $trip["isRemoved"] == 0 && $roles[$trip["tripid"]]["role"] != "Removed") {
			$trip["role"] = $roles[$trip["tripid"]]["role"];
			$result["groups"][0]["trips"] []= $trip;
		} else if ($trip["isOpen"]) {
			$result["groups"][1]["trips"] []= $trip;
		} else {
			$result["groups"][2]["trips"] []= $trip;
		}
	}
} else if ($action == "gettrip") {
	$trips = GetTrips($con,"t.id = $tripid");
	if (count($trips) == 0) {
		die("trip $tripid not found");
	}	
	
	$result = array("action" => $action,"config" => $config->getConstants(), "userid" => $userid, "metadata" => $metadata, "changes" => array());
	$changes = SqlResultArray($con,"
			SELECT	id,line,memberid,`timestamp`,`action`,`column`,`before`,`after`,`subject`,`body`,`emailAudit`,`guid`
			FROM ".TripConfig::TripDB.".changehistory
			WHERE tripid = $tripid
			ORDER BY id desc");
	$guids = array();		
	foreach ($changes as $change)
	{
		$guid = $change["guid"];
		if (!array_key_exists($guid,$guids)) {
			$guids[$guid] = count($guids);
		}
		
		unset($change["guid"]);
		$result["changes"][$guids[$guid]] [] = $change;
	}

	$result["trip"] = $trips[0];
	$result["participants"] = GetParticipants($con,"t.id = $tripid");		
	$result["members"] = SqlResultArray($con,"
			SELECT	m.id,
				concat(trim(m.firstname),' ',trim(m.lastname)) as name,
				m.primaryemail as email,
				COALESCE((CASE ms.homephone WHEN '' THEN null ELSE ms.homephone end), 
					(CASE m.mobilephone WHEN '' THEN null ELSE m.mobilephone end), 
					(CASE m.workphone WHEN '' THEN null ELSE m.workphone end)) as phone,
				q.role			
			FROM ".TripConfig::CtcDB.".members             m
			JOIN ".TripConfig::CtcDB.".memberships         ms  on ms.id = m.membershipid 
			LEFT JOIN 
				(SELECT mr.memberid, max(r.role) as role
				FROM	".TripConfig::CtcDB.".members_roles  mr
				JOIN 	".TripConfig::CtcDB.".roles          r   on r.id = mr.roleid and r.role in (".TripConfig::EditorRoles.")
		                GROUP BY mr.memberid) 	     q   on q.memberid = m.id
			WHERE ms.statusAdmin = 'Active'
			ORDER BY name");	
	$nonmembers = GetParticipants($con,"p.memberid is null and t.date > DATE_ADD(now(),INTERVAL -180 DAY)");
	
	$result["nonmembers"] = array();
	foreach ($nonmembers as $nonmember) {
		$result["nonmembers"][$nonmember["name"]] = array("name" => $nonmember["name"], "email" => $nonmember["email"], "phone" => $nonmember["phone"]);
	}
			
	// we assume that the user now knows about this trip
	SqlExecOrDie($con,"	UPDATE ".TripConfig::TripDB.".participants 
				SET isEmailPending = 0 
				WHERE tripid = $tripid and memberid = $userid");
				
	if ($editid == null) {
		$editid = SqlResultScalar($con,"
					SELECT id
					FROM ".TripConfig::TripDB.".edit
					WHERE tripid=$tripid and memberid=$userid and `read` > DATE_ADD(utc_timestamp(),INTERVAL -10 SECOND)");
					
		if ($editid == null) {
			SqlExecOrDie($con,"
					INSERT ".TripConfig::TripDB.".edit(tripid,memberid,`read`,`current`)
					VALUES($tripid,$userid,utc_timestamp(),utc_timestamp())");
			$editid = ((is_null($___mysqli_res = mysqli_insert_id($con))) ? false : $___mysqli_res);
		}
		
	} else {
		SqlExecOrDie($con,"
					UPDATE ".TripConfig::TripDB.".edit 
					SET `current` = utc_timestamp(),
					    `read` = utc_timestamp() 
					WHERE id=$editid");
	}

	$result["editid"] = $editid;
	
} else if ($action == "editrefresh") {
	SqlExecOrDie($con,"UPDATE ".TripConfig::TripDB.".edit SET `current` = utc_timestamp() WHERE id=$editid");
	
	$result = array("action" => $action);
	$result["edits"] = SqlResultArray($con,"select memberid, id
						from ".TripConfig::TripDB.".edit
						where tripid = $tripid 
						and `current` >  DATE_ADD(utc_timestamp(),INTERVAL ".(TripConfig::EditRefreshInSec*-2)." SECOND)");
	$result["modifications"] = SqlResultArray($con,"Select h.memberid, h.timestamp
							from ".TripConfig::TripDB.".changehistory h
							join ".TripConfig::TripDB.".edit e on h.timestamp > e.read 
							where h.tripid = $tripid and e.id = $editid");
} else if ($action == "editend") {
	SqlExecOrDie($con,"DELETE FROM ".TripConfig::TripDB.".edit WHERE id=$editid or `current` < DATE_ADD(utc_timestamp(),INTERVAL -1 DAY)");
	$result = array("action" => $action);
} else {
	die("invalid action - '$action'");
}

header('Content-Type: application/json');
echo json_encode($result);
?>
