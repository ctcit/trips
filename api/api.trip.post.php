<?php
define( '_JEXEC', 1 );
require_once( 'alastair.php' );
require_once( 'trips.config.php' );
require_once( 'trips.inc.php' );

$logondetails	= GetLogonDetails($con,$username);
$metadata		= GetMetadata($con);
$post 			= json_decode(file_get_contents('php://input'),true);
$tripid			= intval($post["tripid"]);
$diffs			= $post["diffs"];
$userid			= $logondetails["userid"];
$trips 			= GetTrips($con,"t.id = $tripid");
$subject		= "RE: ".$trips[0]["title"]." on ".$trips[0]["date"];
$body			= array("greeting"=>"");
$recipientall	= false;
$recipientlines	= array();
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
	case "updatetrip":
		
		if (!array_key_exists($column,$metadata["trips"]) || $metadata["trips"][$column]["IsReadOnly"]) {
			die("can't $action with column' `$column` ".json_encode($post));
		}

		$body[$diff["action"]] = $column != "isRemoved" ? "<p>Trip details in this trip have just changed</p>" :
									($insert["`after`"] == 1 ? "<p>Trip has been deleted</p>" 
															 : "<p>Trip has been un-deleted</p>");
		$recipientall = true;		
		SqlExecOrDie($con,"
			UPDATE ".TripConfig::TripDB.".trips 
			SET `$column` = ".$insert["`after`"]." WHERE id = $tripid");
		break;
		
	case "updateparticipant":
	case "insertparticipant":
		if (!array_key_exists($column,$metadata["participants"]) || $metadata["participants"][$column]["IsReadOnly"]) {
			die("can't $action with column' `$column` ".json_encode($post));
		}
		
		if($diff["action"] == "insertparticipant") {
			$body[$diff["action"]] = "<p>Someone has just signed up to this trip</p>";
			if (!array_key_exists($line,$newlines)) {
				$newlines[$line] = ++$nextline;
			}
			$line = $newlines[$line];
		}
		else {
			$body[$diff["action"]] = "Participant details in this trip have just changed";
		}

		$recipientlines []= $line;
		
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

$recipientsql = "p.tripid = $tripid and ".
				($recipientall ? "p.isRemoved = 0" 
							   : ("(p.isLeader = 1 or p.line in (".implode(",",$recipientlines)."))"));
$recipients = GetParticipants($con,$recipientsql);	
$changeid = $diffs[0]["id"];
$body["link"] = "";
$body["detail"] = "";
$body["editinfo"] = $post["editinfo"];

SendEmail($con,$recipients,$subject,$body,$tripid,$changeid,$guid);
	
header('Content-Type: application/json');
echo json_encode(array("result"=>implode(", ",$stats)."recipients:".count($recipients)));
?>