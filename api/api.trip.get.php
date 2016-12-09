<?php
define('_JEXEC', 1);
require_once( 'alastair.php' );
require_once( 'trips.config.php' );
require_once( 'trips.inc.php' );

// make sure that characters above 0x7F don't screw up json_encode()
mysqli_query($con, "SET CHARACTER SET utf8");

$tripid   		= intval($_GET["tripid"]);
$editid   		= intval($_GET["editid"]);
$logondetails	= GetLogonDetails($con,$username);
$userid 		= intval($logondetails["userid"]);
$trips 			= GetTrips($con,"t.id = $tripid");
$result 		= array();

if (count($trips) == 0) {
	die("trip $tripid not found");
}	

// $changes = SqlResultArray($con,"
// 		SELECT	id,line,memberid,`timestamp`,`action`,`column`,`before`,`after`,`subject`,`body`,`emailAudit`,`guid`
// 		FROM ".TripConfig::TripDB.".changehistory
// 		WHERE tripid = $tripid
// 		ORDER BY id desc");

$result["trip"] = $trips[0];
$result["participants"] = GetParticipants($con,"t.id = $tripid");		
		
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

header('Content-Type: application/json');
echo json_encode($result);
?>