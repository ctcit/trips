<?php
define('_JEXEC', 1);
require_once( 'alastair.php' );
require_once( 'trips.config.php' );
require_once( 'trips.inc.php' );

// make sure that characters above 0x7F don't screw up json_encode()
mysqli_query($con, "SET CHARACTER SET utf8");

$tripid   		= intval($_GET["tripid"]);
$logondetails	= GetLogonDetails($con,$username);
$changes 		= SqlResultArray($con,"
		SELECT	id,line,memberid,`timestamp`,`action`,`column`,`before`,`after`,`subject`,`body`,`emailAudit`,`guid`
		FROM ".TripConfig::TripDB.".changehistory
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

header('Content-Type: application/json');
echo json_encode($result);
?>