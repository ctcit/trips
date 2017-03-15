<?php
define('_JEXEC', 1);
require_once( 'alastair.php' );
require_once( 'trips.config.php' );
require_once( 'trips.inc.php' );

$logondetails	= GetLogonDetails($con,$username);
$nonmembers 	= GetParticipants($con,"p.memberid is null and t.date > DATE_ADD(now(),INTERVAL -180 DAY)");
$result["nonmembers"] = array();

foreach ($nonmembers as $nonmember) {
	$result["nonmembers"][$nonmember["name"]] = array("name" => $nonmember["name"], "email" => $nonmember["email"], "phone" => $nonmember["phone"]);
}

header('Content-Type: application/json');
echo json_encode($result);
?>