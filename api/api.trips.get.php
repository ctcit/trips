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
$where 			= "COALESCE(t.date, e.date) > DATE_ADD(now(),INTERVAL -7 DAY)";
$trips 			= GetTrips($con,$where);
$leaders = SqlResultArray($con,"
	SELECT	t.id as tripid, 
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

header('Content-Type: application/json');
echo json_encode($result);
?>