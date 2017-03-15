<?php
define('_JEXEC', 1);
require_once( 'alastair.php' );
require_once( 'trips.config.php' );
require_once( 'trips.inc.php' );

$editid   		= intval($_GET["editid"]);
$logondetails	= GetLogonDetails($con,$username);
$result 		= array("editend" => true);

SqlExecOrDie($con,"DELETE FROM ".TripConfig::TripDB.".edit WHERE id=$editid or `current` < DATE_ADD(utc_timestamp(),INTERVAL -1 DAY)");

header('Content-Type: application/json');
echo json_encode($result);
?>