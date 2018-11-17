<?php

// make sure that characters above 0x7F don't trip us up
mysqli_query($con, "SET CHARACTER SET utf8");

function GetMetadata($con) {
	$metadata = array(
		"trips"        => SqlResultArray($con,"show full columns from ".TripConfig::TripDB.".trips","Field"),
		"participants" => SqlResultArray($con,"show full columns from ".TripConfig::TripDB.".participants","Field"));
		
	foreach($metadata as &$table) {
		foreach($table as &$col) {
			$comment = preg_replace("/--.*$/","",$col["Comment"]);
			$col["IsReadOnly"] = preg_match("/READONLY/",$comment) == 1;
			$col["Display"] = trim(preg_replace("/READONLY/","",$comment));
		}
	}
	
	$metadata["trips"]["isOpen"]["IsReadOnly"] = true;
	$metadata["trips"]["isOpen"]["Type"] = "tinyint(1)";
	return $metadata;		
}

function GetTrips($con, $where, $tripid, $logondetails) {
	if ($tripid >= TripConfig::NewTripId) {
		return SqlResultArray($con,"
			SELECT 
				$tripid                          as tripid, 
				null                             as eventid,
				DATE_ADD(now(), INTERVAL 28 DAY) as date,
				DATE_ADD(now(), INTERVAL 28 DAY) as closeDate,
				1                                as isOpen,
				'Day'                            as length,
				'Z Station Papanui'              as departurePoint,
				''                               as grade,
				''                               as cost,
				".SqlVal($logondetails['firstname']." ".$logondetails['lastname']."'s suggested trip")." 
				                                 as title,
				''                               as status,
				''                               as mapHtml,
				1                                as isAdHoc,
				0                                as isRemoved,
				''                               as text");
	} else if ($where == null) {
		$where = "t.id = $tripid";
	}

	return SqlResultArray($con,"
		SELECT 
			t.id as tripid, 
			t.eventid,
			t.date,
			t.closeDate,
			(case when t.closeDate >= now() and t.isRemoved = 0 then 1 else 0 end) isOpen,
			COALESCE(t.length, 
				(case e.triplength when 1 then 'Day'
				                   when 2 then 'Weekend' else '3+ Days' end)) as length,
			COALESCE(t.departurePoint, e.departurePoint) as departurePoint,
			COALESCE(t.grade, e.grade) as grade,
			COALESCE(t.cost, e.cost) as cost,
			COALESCE(t.title, e.title) as title,
			COALESCE(t.status,'') as status,
			COALESCE(t.mapHtml,'') as mapHtml,
			t.isAdHoc,
			t.isRemoved,
			e.text
		FROM      ".TripConfig::TripDB.".trips t 
		LEFT JOIN ".TripConfig::NewsletterDB.".events e on e.id = t.eventid
		WHERE $where
		ORDER BY t.date");
}
		
function GetParticipants($con, $where, $tripid, $logondetails) {
	if ($tripid >= TripConfig::NewTripId) {
		return SqlResultArray($con,"
			SELECT 
				$tripid as participantid,
				0 as line,
				0 as isRemoved,
				".$logondetails["userid"]." as memberid,
				1 as isLeader,
				".SqlVal($logondetails["firstname"]." ".$logondetails["lastname"])." as name,
				m.primaryemail as email,
				COALESCE(
					(CASE ms.homephone WHEN '' THEN null ELSE ms.homephone END), 
					(CASE m.mobilephone WHEN '' THEN null ELSE m.mobilephone END), 
					(CASE m.workphone WHEN '' THEN null ELSE m.workphone END)) as phone,
				0 as isVehicleProvider,
				'' as vehicleRego,
				'' as status
			FROM      ".TripConfig::CtcDB.".members        m
			LEFT JOIN ".TripConfig::CtcDB.".memberships    ms ON ms.id = m.membershipid
			WHERE m.id = ".$logondetails["userid"]);
	} else if ($where == null) {
		$where = "t.id = $tripid";
	}

	return SqlResultArray($con,"
		SELECT 	
			COALESCE(p.id,1) as participantid,
			COALESCE(p.line,0) as line,
			COALESCE(p.isRemoved,0) as isRemoved,
			COALESCE(p.memberid,0) as memberid,
			COALESCE(p.isLeader,t.isAdHoc) as isLeader,
			COALESCE(p.name,concat(trim(m.firstname),' ',trim(m.lastname)),e.leader) as name,
			COALESCE(p.email, m.primaryemail, e.leaderEmail) as email,
			COALESCE(p.phone, 
				(CASE t.isAdHoc WHEN 1 THEN e.leaderphone ELSE null END), 
				(CASE p.isleader WHEN 1 THEN e.leaderphone ELSE null END), 
				(CASE ms.homephone WHEN '' THEN null ELSE ms.homephone END), 
				(CASE m.mobilephone WHEN '' THEN null ELSE m.mobilephone END), 
				(CASE m.workphone WHEN '' THEN null ELSE m.workphone END)) as phone,
			COALESCE(p.isVehicleProvider,0) as isVehicleProvider,
			COALESCE(p.vehiclerego,'') as vehicleRego,
			COALESCE(p.status,'') as status
		FROM      ".TripConfig::TripDB.".trips         t 
		LEFT JOIN ".TripConfig::TripDB.".participants  p  ON p.tripid = t.id
		LEFT JOIN ".TripConfig::NewsletterDB.".events  e  ON e.id = t.eventid
		LEFT JOIN ".TripConfig::CtcDB.".members        m  ON m.id = p.memberid
		LEFT JOIN ".TripConfig::CtcDB.".memberships    ms ON ms.id = m.membershipid 
		WHERE $where
		ORDER BY e.date desc, line
		LOCK IN SHARE MODE");
}
		
function SendEmail($con,$recipients,$subject,$body,$tripid,$changeid,$guid) {
		
	$guid = str_replace("-","",$guid);
	$emailaudit = array();
	$headers = "MIME-Version: 1.0\r\n".
			   "Content-type: text/html;charset=UTF-8\r\n".
			   "From: <noreply@ctc.org.nz>\r\n";
	$trip = GetTrips($con,null,$tripid);
	$body["link"]   = TripConfig::EmailHasLink    ? GetTripLinkHtml($tripid)                     : "";
	$body["detail"] = TripConfig::EmailHasDetails ? GetTripDetailsHtml($con, $tripid, $changeid) : "";
	
	foreach ($recipients as $recipient) {

		$participantid = $recipient["participantid"];
		$bodyparts["greeting"] = "<p>Dear ".htmlentities($recipient["name"]).",</p>";
					
		if (preg_match(TripConfig::EmailFilter, $recipient["email"])) {
			$emailaudit []= "$recipient[name] ($recipient[email])";
			if (!mail($recipient["email"], $subject, implode("",$body), $headers)) {
				die("mail() failed");
			}
		} else {
			$emailaudit []= "$recipient[name] ($recipient[email] FILTERED)";
		}
	} 
	
	$emailauditSql = SqlVal("Email recipients: ".implode(", ",$emailaudit));
	SqlExecOrDie($con,"UPDATE ".TripConfig::TripDB.".changehistory SET emailAudit = $emailauditSql WHERE id = $changeid");
}

function GetTripDetailsHtml($con, $tripid, $changeid)
{
	$updates		= SqlResultArray($con,
					   "SELECT concat(`column`,coalesce(`line`,'')) as `key`
						FROM ".TripConfig::TripDB.".changehistory
						WHERE tripid = $tripid and id >= $changeid and action like 'update%'","key");
	$inserts		= SqlResultArray($con,
					   "SELECT `line` as `key`
						FROM ".TripConfig::TripDB.".changehistory
						WHERE tripid = $tripid and id >= $changeid and action like 'insert%'","key");
	$metadata		= GetMetadata($con);
	$trips			= GetTrips($con,null,$tripid,null);
	$participants	= GetParticipants($con,null,$tripid,null);
	$css			= ParseCss(file_get_contents("../app/styles/trips.css"));
	$updated		= "background-color:".$css[".updated"]["background-color"];
	$inserted		= "background-color:".$css[".inserted"]["background-color"];
	$border			= "border: solid 1px black; border-collapse: collapse;";
	$removed		= "text-decoration: line-through; ";

	$header			= "";
	foreach ($metadata["trips"] as $field => $col) {
		if ($col["Display"] != "" && $field != "mapHtml" && $field != "isRemoved") {
			$style = $border.(array_key_exists($field,$updates) ? $updated : "");
			$header .= 
				"<tr>
					<th style='$style'>".htmlentities($col["Display"])."</th>
					<td style='$style'>".htmlentities($trips[0][$field])."</td>
				</tr>";
		}
	}
		
	$detail = "<tr>";
	foreach ($metadata["participants"] as $field => $col) {
		if ($field == "line" || $col["Display"] != "") {
			$detail .= "<th style='$border'>".htmlentities($col["Display"])."</th>";
		}
	}
	$detail .= "</tr>";

	foreach ($participants as $participant) {
		$detail .= "<tr>";
		foreach ($metadata["participants"] as $field => $col) {
			$style = $border.
						($participant["isRemoved"] ? $removed : "").
						(array_key_exists($participant["line"],$inserts) ? $inserted :
						(array_key_exists($field.$participant["line"],$updates) ? $updated :""));

			if ($field == "line") {
				$detail .= "<td style='$style'>".($participant[$field]+1)."</td>";
			} else if ($col["Display"] != "" && $col["Type"] == "tinyint(1)") {
				$detail .= "<td style='$style'>".($participant[$field] == 1 ? "Yes" : "")."</td>";
			} else if ($col["Display"] != "") {
				$detail .= "<td style='$style'>".htmlentities($participant[$field])."</td>";
			}
		}
		$detail .= "</tr>";
	}

	$legend = "<tr><th>Legend: </th><td style='$border $updated'> Updates </td><td style='$border $inserted'> Additions </td></tr>";

	return "<h3>Current trip details:</h3>
			<table style='$border'>$header</table><br/>
			<table style='$border'>$detail</table><br/>
			<table style='$border'>$legend</table>";
}

function GetTripLinkHtml($tripid)
{
	$url = TripConfig::BaseUrl."?goto=trip/showtrip/$tripid";
	return "<p>Trip link: <a href='$url'>$url</a></p>";
}
?>