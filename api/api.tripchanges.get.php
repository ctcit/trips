<?php
define('_JEXEC', 1);
require_once( 'alastair.php' );
require_once( 'trips.config.php' );
require_once( 'trips.inc.php' );

$tripid   		= intval($_GET["tripid"]);
$logondetails	= GetLogonDetails($con,$username);
$result 		= array("changes" => array());

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