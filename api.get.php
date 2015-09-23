<?php
define( '_VALID_MOS', 1 );
require_once( '../includes/alastair.php' );
require_once( 'trips.config.php' );
require_once( 'trips.inc.php' );

// make sure that characters above 0x7F don't screw up json_encode()
mysql_query("SET CHARACTER SET utf8",$con);

$action   	= strval($_GET["action"]);
$tripid   	= intval($_GET["tripid"]);
$editid   	= intval($_GET["editid"]);
$logondetails	= GetLogonDetails($con,$username,$tripid == null ? "redirect=trips" : "tripid=$tripid&redirect=trips/ShowTrip.html");
$userid 	= intval($logondetails["userid"]);
$config 	= new ReflectionClass("TripConfig");
$metadata	= GetMetadata($con);

if ($action == "gettrips") {
	$where = "COALESCE(t.date, e.date) > DATE_ADD(now(),INTERVAL -7 DAY)";
	$trips = GetTrips($con,$where);
	$leaders = SqlResultArray($con,"
		SELECT t.id as tripid, 
			COALESCE(p.name,concat(trim(m.firstname),' ',trim(m.lastname))) as name
		FROM      ctcweb9_trip.trips t 
		JOIN      ctcweb9_trip.participants p ON p.tripid = t.id and p.isleader = 1
		LEFT JOIN ctcweb9_newsletter.events e ON e.id = t.eventid
		LEFT JOIN ctcweb9_ctc.members       m ON m.id = p.memberid
		WHERE $where
		order by tripid");
	$roles = SqlResultArray($con,"
		SELECT tripid, 'Editor'      as role FROM ctcweb9_trip.changehistory WHERE memberid = $userid
		UNION
		SELECT tripid, 'Participant' as role FROM ctcweb9_trip.participants WHERE memberid = $userid and isleader = 0
		UNION
		SELECT tripid, 'Leader'      as role FROM ctcweb9_trip.participants WHERE memberid = $userid and isleader = 1","tripid");
			
	$result = array("action" => $action,"config" => $config->getConstants(), "userid" => $userid, "metadata" => $metadata);
	$result["groups"] = array(array("name"=>"My Trips","isMyTrips"=>true),array("name"=>"Open Trips"),array("name"=>"Closed Trips"));
	foreach ($trips as $trip)
	{
		$tripleaders = array();
		foreach ($leaders as $leader)
		{
			if ($leader["tripid"] == $trip["tripid"]) {
				$tripleaders []= $leader["name"];
			}
		}
		
		$trip["leader"] = implode(", ",$tripleaders);
		
		if (array_key_exists($trip["tripid"],$roles)) {
			$trip["role"] = $roles[$trip["tripid"]]["role"];
			$result["groups"][0]["trips"] []= $trip;
		} else {
			$result["groups"][$trip["isOpen"] ? 1 : 2]["trips"] []= $trip;
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
			FROM ctcweb9_trip.changehistory
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
			FROM ctcweb9_ctc.members             m
			JOIN ctcweb9_ctc.memberships         ms  on ms.id = m.membershipid 
			LEFT JOIN 
				(SELECT mr.memberid, max(r.role) as role
				FROM	ctcweb9_ctc.members_roles  mr
				JOIN 	ctcweb9_ctc.roles          r   on r.id = mr.roleid and r.role in (".TripConfig::EditorRoles.")
		                GROUP BY mr.memberid) 	     q   on q.memberid = m.id
			WHERE ms.statusAdmin = 'Active'
			ORDER BY name");	
	$nonmembers = GetParticipants($con,"p.memberid is null and t.date > DATE_ADD(now(),INTERVAL -180 DAY)");
	
	$result["nonmembers"] = array();
	foreach ($nonmembers as $nonmember) {
		$result["nonmembers"][$nonmember["name"]] = array("name" => $nonmember["name"], "email" => $nonmember["email"], "phone" => $nonmember["phone"]);
	}
			
	// we assume that the user now knows about this trip
	SqlExecOrDie($con,"	UPDATE ctcweb9_trip.participants 
				SET isEmailPending = 0 
				WHERE tripid = $tripid and memberid = $userid");
				
	if ($editid == null) {
		SqlExecOrDie($con,"	INSERT ctcweb9_trip.edit(tripid,memberid,`read`,`current`)
					VALUES($tripid,$userid,utc_timestamp(),utc_timestamp())");
		$result["editid"] = mysql_insert_id($con);
	} else {
		SqlExecOrDie($con,"	UPDATE ctcweb9_trip.edit 
					SET `current` = utc_timestamp(),
					    `read` = utc_timestamp() WHERE id=$editid");
		$result["editid"] = $editid;
	}
	
} else if ($action == "editrefresh") {
	SqlExecOrDie($con,"UPDATE ctcweb9_trip.edit SET `current` = utc_timestamp() WHERE id=$editid");
	
	$result = array("action" => $action);
	$result["edits"] = SqlResultArray($con,"select memberid
						from ctcweb9_trip.edit
						where tripid = $tripid 
						/*and id <> $editid*/
						and `current` >  DATE_ADD(utc_timestamp(),INTERVAL ".(TripConfig::EditRefreshInSec*-2)." SECOND)");
	$result["modifications"] = SqlResultArray($con,"Select h.memberid, h.timestamp
							from ctcweb9_trip.changehistory h
							join ctcweb9_trip.edit e on h.timestamp > e.read 
							where h.tripid = $tripid and e.id = $editid");
} else if ($action == "editend") {
	SqlExecOrDie($con,"DELETE FROM ctcweb9_trip.edit WHERE id=$editid or `current` < DATE_ADD(utc_timestamp(),INTERVAL -1 DAY)");
	$result = array("action" => $action);
} else {
	die("invalid action - '$action'");
}

header('Content-Type: application/json');
echo json_encode($result);
?>