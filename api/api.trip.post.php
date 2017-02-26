<?php
define( '_JEXEC', 1 );
require_once( 'alastair.php' );
require_once( 'trips.config.php' );
require_once( 'trips.inc.php' );

// make sure that characters above 0x7F don't screw up json_encode()
mysqli_query($con, "SET CHARACTER SET utf8");

$logondetails	= GetLogonDetails($con,$username);
$metadata		= GetMetadata($con);
$post 			= json_decode(file_get_contents('php://input'),true);
$tripid			= intval($post["tripid"]);
$diffs			= $post["diffs"];
$userid			= $logondetails["userid"];
$trips 			= GetTrips($con,"t.id = $tripid");
$subject		= "RE: ".$trips[0]["title"]." on ".$trips[0]["date"];
$bodyparts		= array("email"=>"","diff"=>"");
$where			= array("p.tripid = $tripid"=>1,"p.isRemoved = 0"=>1,"p.isEmailPending = 0"=>1,"p.memberid <> $userid"=>1);
$cols			= array("guid","action","column","line","before","after","subject","body");
$stats			= array();
$statcounts		= array("diff"=>0,"diff"=>0,"email"=>0);
$guid			= MakeGuid();
$nextline		= SqlResultScalar($con,"select max(line) from ".TripConfig::TripDB.".participants where tripid = $tripid");
$newlines       = array();

(count($diffs) > 0 && count($trips) > 0) || die("invalid post ".json_encode($post));

foreach ($diffs as &$diff) {
	$action = strval($diff["action"]);
	$column = strval($diff["column"]);
	$line = intval($diff["line"]);
	$diff["guid"] = $guid;
	$insert = array();
	
	foreach ($cols as $col) {
		$insert["`$col`"] = SqlVal($diff[$col]);
	}
	
	switch ($action)
	{
	case "email":
		$subject = strval($diff["subject"]);
		$body = strval($diff["body"]);
		if ($subject == "" || $body == "") {
			die("missing subject or body ".json_encode($post));
		}
		
		$bodyparts["email"] = "<p>".htmlentities($body)."</p>";
		unset($where["p.isEmailPending = 0"]);
		unset($where["p.memberid <> $userid"]);
		break;
		
	case "updatetrip":
		
		if (!array_key_exists($column,$metadata["trips"]) || $metadata["trips"][$column]["IsReadOnly"]) {
			die("can't $action with column' `$column` ".json_encode($post));
		}
		
		$bodyparts["diff"] = "<p>This trip list has just been updated</p>";
		SqlExecOrDie($con,"
			UPDATE ".TripConfig::TripDB.".trips 
			SET `$column` = ".$insert["`after`"]." WHERE id = $tripid");
		break;
		
	case "updateparticipant":
	case "insertparticipant":
		if (!array_key_exists($column,$metadata["participants"]) || $metadata["participants"][$column]["IsReadOnly"]) {
			die("can't $action with column' `$column` ".json_encode($post));
		}
		
		$bodyparts["diff"] = "<p>This trip list has just been updated</p>";
		
		if($diff["action"] == "insertparticipant") {
			unset($where["p.memberid <> $userid"]);
			if (!array_key_exists($line,$newlines)) {
				$newlines[$line] = ++$nextline;
			}
			$line = $newlines[$line];
		}
		
		SqlExecOrDie($con,"
			INSERT ".TripConfig::TripDB.".participants(tripid,line,`$column`) 
			VALUES($tripid,$line,".$insert["`after`"].") 
			ON DUPLICATE KEY UPDATE `$column` = ".$insert["`after`"]);
		break;
		
	default:
		die("invalid action `$action` ".json_encode($post));
	}
	
	SqlExecOrDie($con,"
		INSERT ".TripConfig::TripDB.".changehistory(tripid,memberid,timestamp,".implode(",",array_keys($insert)).")
		VALUES(	$tripid,$userid,UTC_TIMESTAMP(),".implode(",",$insert).")");
		
	$diff["id"] = ((is_null($___mysqli_res = mysqli_insert_id($con))) ? false : $___mysqli_res);	
	$stat = substr($action,0,6);
	$stats[$stat] = (++$statcounts[$stat])." $stat(s)";
}

$wheresql = implode(" and ",array_keys($where));
$recipients = GetParticipants($con,$wheresql);	
$guid = str_replace("-","",$guid);
$changeid = $diffs[0]["id"];
$emailaudit = array();
$headers = "MIME-Version: 1.0\r\n".
	   "Content-type: text/html;charset=UTF-8\r\n".
	   "From: <noreply@ctc.org.nz>\r\n";

foreach ($recipients as $recipient) {

	$bodyparts["image"] = "<p><a href='".TripConfig::BaseUrl."/ShowTrip.php?tripid=$tripid'>
		   		<img src='".TripConfig::EmailImageUrl."?changeid=$changeid&memberid=$recipient[memberid]&guid=$guid'
	   				title='Click here to go to the trip list'/></a></p>"; 		
	   			
	if (preg_match(TripConfig::EmailFilter, $recipient["email"])) {
		$emailaudit []= "$recipient[name] ($recipient[email])";
		if (!mail($recipient["email"], $subject, implode("",$bodyparts), $headers)) {
			die("mail() failed");
		}
	} else {
		$emailaudit []= "$recipient[name] ($recipient[email] FILTERED)";
	}
} 

$emailauditsql = SqlVal("Email recipients: ".implode(", ",$emailaudit));
SqlExecOrDie($con,"UPDATE ".TripConfig::TripDB.".changehistory SET emailAudit = $emailauditsql WHERE id = $changeid");
SqlExecOrDie($con,"UPDATE ".TripConfig::TripDB.".participants SET isEmailPending = 1 WHERE ".str_replace("p.","",$wheresql));
	
header('Content-Type: application/json');
echo json_encode(array("result"=>implode(", ",$stats)));
?>