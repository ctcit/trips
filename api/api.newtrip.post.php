<?php
define( '_JEXEC', 1 );
require_once( 'alastair.php' );
require_once( 'trips.config.php' );
require_once( 'trips.inc.php' );

$logondetails	= GetLogonDetails($con,$username);
$userid = $logondetails['userid'];
$title = $logondetails['firstname']." ".$logondetails['lastname']."'s new trip";

SqlExecOrDie($con,
	"INSERT ".TripConfig::TripDB.".trips(title,length,date,closedate,isAdHoc) 
		values(".SqlVal($title).",'Day', DATE_ADD(now(), INTERVAL 1 DAY), DATE_ADD(now(), INTERVAL 1 DAY),1)");
$tripid = ((is_null($___mysqli_res = mysqli_insert_id($con))) ? false : $___mysqli_res);
SqlExecOrDie($con,
	"INSERT ".TripConfig::TripDB.".participants(tripid,line,memberid,isLeader) 
		values($tripid,0,$userid,1)");

header('Content-Type: application/json');
echo json_encode(array("result"=>"1 trip inserted","tripid"=>$tripid));
?>