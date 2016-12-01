<?php
define('_JEXEC', 1);
require_once( 'alastair.php' );
require_once( 'trips.config.php' );
require_once( 'trips.inc.php' );

// make sure that characters above 0x7F don't screw up json_encode()
mysqli_query($con, "SET CHARACTER SET utf8");

$logondetails	= GetLogonDetails($con,$username);
$result			= array("metadata" => GetMetadata($con));

header('Content-Type: application/json');
echo json_encode($result);
?>