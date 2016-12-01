<?php
define('_JEXEC', 1);
require_once( 'alastair.php' );
require_once( 'trips.config.php' );
require_once( 'trips.inc.php' );

// make sure that characters above 0x7F don't screw up json_encode()
mysqli_query($con, "SET CHARACTER SET utf8");

$logondetails	= GetLogonDetails($con,$username);
$nonmembers 	= GetParticipants($con,"p.memberid is null and t.date > DATE_ADD(now(),INTERVAL -180 DAY)");
$result["nonmembers"] = array();

foreach ($nonmembers as $nonmember) {
	$result["nonmembers"][$nonmember["name"]] = array("name" => $nonmember["name"], "email" => $nonmember["email"], "phone" => $nonmember["phone"]);
}

header('Content-Type: application/json');
echo json_encode($result);
?>