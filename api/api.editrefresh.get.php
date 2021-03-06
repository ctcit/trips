<?php
define('_JEXEC', 1);
require_once( 'alastair.php' );
require_once( 'trips.config.php' );
require_once( 'trips.inc.php' );

$tripid   		= intval($_GET["tripid"]);
$editid   		= intval($_GET["editid"]);
$isdirty   		= intval($_GET["isdirty"]);
$logondetails	= GetLogonDetails($con,$username);

SqlExecOrDie($con,"UPDATE ".TripConfig::TripDB.".edit SET `current` = utc_timestamp(), isdirty = $isdirty WHERE id=$editid");

$result["edits"] = SqlResultArray($con,"select memberid, id, isdirty
					from ".TripConfig::TripDB.".edit
					where tripid = $tripid 
					and `current` >  DATE_ADD(utc_timestamp(),INTERVAL ".(TripConfig::EditRefreshInSec*-2)." SECOND)");
$result["modifications"] = SqlResultArray($con,"Select h.memberid, h.timestamp
						from ".TripConfig::TripDB.".changehistory h
						join ".TripConfig::TripDB.".edit e on h.timestamp > e.read 
						where h.tripid = $tripid and e.id = $editid");

header('Content-Type: application/json');
echo json_encode($result);
?>