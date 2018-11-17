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
$trips 			= GetTrips($con,null,$tripid,$logondetails);
$isadhoc        = intval($trips[0]["isAdHoc"]) == 1;
$participants 	= GetParticipants($con,null,$tripid,$logondetails);
$subject		= "RE: ".$trips[0]["title"]." on ".$trips[0]["date"];
$body			= array("greeting"=>"","updatetrip"=>"","updateparticipant"=>"","insertparticipant"=>"",
						"link"=>"","detail"=>"","editinfo"=>$post["editinfo"]);
$recipientall	= false;
$recipientlines	= array();
$stats			= array();
$statcounts		= array("diff"=>0,"diff"=>0,"email"=>0);
$guid			= MakeGuid();
$nextline		= SqlResultScalar($con,"select max(line) from ".TripConfig::TripDB.".participants where tripid = $tripid");
$newlines       = array();
$cols			= array("guid","action","column","line","before","after","subject","body");
$event			= array("title"=>SqlVal($trips[0]["title"]),
					    "date"=>SqlVal($trips[0]["date"]),
					    "closeDate"=>SqlVal($trips[0]["closeDate"]),
					    "length"=>SqlVal($trips[0]["length"]),
					    "departurePoint"=>SqlVal($trips[0]["departurePoint"]),
					    "grade"=>SqlVal($trips[0]["grade"]),
					    "cost"=>SqlVal($trips[0]["cost"]),
					    "status"=>SqlVal($trips[0]["status"]),
					    "isRemoved"=>SqlVal($trips[0]["isRemoved"]),
					    "leader"=>SqlVal($participants[0]["name"]),
					    "email"=>SqlVal($participants[0]["email"]));
$eventid        = $trip[0]["eventid"];

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

		if ($isadhoc) {
			if (array_key_exists($column,$event)) {
				$event[$column] = SqlVal($diff['after']); 
			}
		} else {

			$body[$diff["action"]] = $column != "isRemoved" ? "<p>Trip details in this trip have just changed</p>" :
										($insert["`after`"] == 1 ? "<p>Trip has been deleted</p>" 
																	: "<p>Trip has been un-deleted</p>");
			$recipientall = true;		
			SqlExecOrDie($con,"
				UPDATE ".TripConfig::TripDB.".trips 
				SET `$column` = ".$insert["`after`"]." WHERE id = $tripid");
		}
        break;
        
    case "updateparticipant":
    case "insertparticipant":
        if (!array_key_exists($column,$metadata["participants"]) || $metadata["participants"][$column]["IsReadOnly"]) {
            die("can't $action with column' `$column` ".json_encode($post));
        }
        
		if ($isadhoc) {
			if ($column == "name" && $line == 0) {
				$event["leader"] = SqlVal($diff['after']);
			} else if ($column == "email" && $line == 0) {
				$event["email"] = SqlVal($diff['after']);
			}
		} else {
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
		}
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

if ($eventid == null) {
    SqlExecOrDie($con,"
            insert ".TripConfig::NewsletterDB.".events(title,date,leaderEmail,departurePoint,closeText,qc)
            values(".$event["title"].",
			       ".$event["date"].",
				   ".$event["email"].",
				   ".$event["departurePoint"].",'',0)");
    $eventid = ((is_null($___mysqli_res = mysqli_insert_id($con))) ? false : $___mysqli_res);
}

if ($tripid >= TripConfig::NewTripId) {
	SqlExecOrDie($con,"
			insert ".TripConfig::TripDB.".trips(date,closeDate,isAdHoc,eventid)
			values(".$event["date"].",".$event["closeDate"].",1,$eventid)");
	$tripid = ((is_null($___mysqli_res = mysqli_insert_id($con))) ? false : $___mysqli_res);
}

if ($isadhoc) {
	SqlExecOrDie($con,"
		UPDATE ".TripConfig::TripDB.".trips
		SET date           = ".$event["date"].",
			closeDate      = ".$event["date"].",
			originalDate   = ".$event["date"].",
			length         = null,
			departurePoint = null,
			grade          = null,
			cost           = null,
			title          = null,
			status         = null,
			mapHtml        = null,
			isAdHoc        = 1,
			isRemoved      = ".$event["isRemoved"].",
			eventid        = $eventid
		WHERE id = $tripid");
    SqlExecOrDie($con,$eventsql = "
        update ".TripConfig::NewsletterDB.".events
        set title          =       ".$event["title"].",
            date           =       ".$event["date"].",
            triplength     = (case ".$event["length"]." when 'Day' then 1 when 'Weekend' then 2 else 3 end),
            departurePoint =       ".$event["departurePoint"].",
            grade          =       ".$event["grade"].",
            cost           =       ".$event["cost"].",
            text           =       ".$event["status"].",
            leader         =       ".$event["leader"]."
        where id = $eventid");
}

if ($recipientall || count($recipientlines) > 0) {
	$recipientsql = "p.tripid = $tripid and p.isRemoved = 0".
					($recipientall ? "" : (" and (p.isLeader = 1 or p.line in (".implode(",",$recipientlines)."))"));
	$recipients = GetParticipants($con,$recipientsql,null,null);	
	$changeid = $diffs[0]["id"];

	SendEmail($con,$recipients,$subject,$body,$tripid,$changeid,$guid);
}

header('Content-Type: application/json');
echo json_encode(array("result"=>implode(", ",$stats)." recipients:".count($recipients),
                       "tripid"=>$tripid,"eventid"=>$eventid,"event"=>$event,"trips[0]"=>$trips[0],
					   "isadhoc"=>$isadhoc,"eventsql"=>$eventsql));

?>