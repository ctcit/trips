<?php
define('_JEXEC', 1);
require_once( 'alastair.php' );
require_once( 'trips.config.php' );
require_once( 'trips.inc.php' );

$logondetails	= GetLogonDetails($con,$username);
$userid 		= intval($logondetails["userid"]);
$result 		= array("userid" => $userid);

header('Content-Type: application/json');
echo json_encode($result);
?>
