<?php
define('_JEXEC', 1);
require_once( 'alastair.php' );
require_once( 'trips.config.php' );
require_once( 'trips.inc.php' );

$tripid   		= intval($_GET["tripid"]);
$editid   		= intval($_GET["editid"]);
$logondetails	= GetLogonDetails($con,$username);
$userid 		= intval($logondetails["userid"]);
$trips 			= GetTrips($con,null,$tripid,$logondetails);
$participants   = GetParticipants($con,null,$tripid,$logondetails);		

if (count($trips) == 0) {
	die("trip $tripid not found");
}

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

$result = Array("trip" => $trips[0], "participants" => $participants, "editid" => $editid);

header('Content-Type: application/json');
echo json_encode($result);
?>