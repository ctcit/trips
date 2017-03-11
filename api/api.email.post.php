<?php
define( '_JEXEC', 1 );
require_once( 'alastair.php' );
require_once( 'trips.config.php' );
require_once( 'trips.inc.php' );

$logondetails	= GetLogonDetails($con,$username);
$metadata		= GetMetadata($con);
$userid			= $logondetails["userid"];
$post 			= json_decode(file_get_contents('php://input'),true);
$tripid			= intval($post["tripid"]);
$subject		= strval($post["subject"]);
$body			= strval($post["body"]);
$bodyparts		= array("greeting"=>"","email"=>"<p>".htmlentities($body)."</p>");
$wheresql		= "p.tripid = $tripid and p.isRemoved = 0";
$recipients 	= GetParticipants($con,$wheresql);	
$guid			= MakeGuid();

SqlExecOrDie($con,"
	INSERT ".TripConfig::TripDB.".changehistory(tripid,memberid,timestamp,guid,action,subject,body)
	VALUES(	$tripid,$userid,UTC_TIMESTAMP(),".SqlVal($guid).",'email',".SqlVal($subject).",".SqlVal($body).")");
	
$changeid = ((is_null($___mysqli_res = mysqli_insert_id($con))) ? false : $___mysqli_res);	

SendEmail($con,$recipients,$subject,$bodyparts,$tripid,$changeid,$guid);
	
header('Content-Type: application/json');
echo json_encode(array("result"=>"email sent"));
?>