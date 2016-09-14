<?php
define( '_JEXEC', 1 );
require_once( 'alastair.php' );
require_once( 'trips.config.php' );
require_once( 'trips.inc.php' );

$logondetails	= GetLogonDetails($con,$username);
$userid = $logondetails['userid'];
$title = $logondetails['firstname']." ".$logondetails['lastname']."'s new trip";

SqlExecOrDie($con,
	"INSERT ctcweb9_trip.trips(title,length,date,closedate,isAdHoc) 
		values(".SqlVal($title).",'Day', DATE_ADD(now(), INTERVAL 1 DAY), DATE_ADD(now(), INTERVAL 1 DAY),1)");
$tripid = mysql_insert_id($con);
SqlExecOrDie($con,
	"INSERT ctcweb9_trip.participants(tripid,line,memberid,isLeader) 
		values($tripid,0,$userid,1)");

header('Content-Type: application/json');
echo json_encode(array("result"=>"1 trip inserted","tripid"=>$tripid));
?>