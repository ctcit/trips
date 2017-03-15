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
	
	// this column is for internal use only
	unset($metadata["participants"]["isEmailPending"]);
	return $metadata;		
}

function GetTrips($con,$where) {
	return SqlResultArray($con,"
		SELECT 
			t.id as tripid, 
			e.id as eventid,
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
		
function GetParticipants($con,$where) {
	return SqlResultArray($con,"
		SELECT 	
			p.id as participantid,
			p.line,
			p.isRemoved,
			p.memberid,
			p.isLeader,
			COALESCE(p.name,concat(trim(m.firstname),' ',trim(m.lastname))) as name,
			COALESCE(p.email, m.primaryemail) as email,
			COALESCE(p.phone, 
				(CASE p.isleader WHEN 1 THEN e.leaderphone ELSE null END), 
				(CASE ms.homephone WHEN '' THEN null ELSE ms.homephone END), 
				(CASE m.mobilephone WHEN '' THEN null ELSE m.mobilephone END), 
				(CASE m.workphone WHEN '' THEN null ELSE m.workphone END)) as phone,
			p.isVehicleProvider,
			COALESCE(p.vehiclerego,'') as vehicleRego,
			COALESCE(p.status,'') as status
		FROM      ".TripConfig::TripDB.".trips         t 
		JOIN      ".TripConfig::TripDB.".participants  p  ON p.tripid = t.id
		LEFT JOIN ".TripConfig::NewsletterDB.".events  e  ON e.id = t.eventid
		LEFT JOIN ".TripConfig::CtcDB.".members        m  ON m.id = p.memberid
		LEFT JOIN ".TripConfig::CtcDB.".memberships    ms ON ms.id = m.membershipid 
		WHERE $where
		ORDER BY e.date desc, line
		LOCK IN SHARE MODE");
}
		
function SendEmail($con,$recipients,$subject,$bodyparts,$tripid,$changeid,$guid) {
		
	$guid = str_replace("-","",$guid);
	$participantids = array();
	$emailaudit = array();
	$headers = "MIME-Version: 1.0\r\n".
			   "Content-type: text/html;charset=UTF-8\r\n".
			   "From: <noreply@ctc.org.nz>\r\n";
	$trip = GetTrips($con,"t.id = $tripid");
	$imgtitle = "Click here to go to the ".htmlentities($trip[0]["title"])." trip list";
	
	foreach ($recipients as $recipient) {

		$participantid = $recipient["participantid"];
		$participantids []= $participantid;
		$bodyparts["greeting"] = "<p>Dear ".htmlentities($recipient["name"]).",</p>";
		$bodyparts["image"] = "
			<p>
				<a href='".TripConfig::BaseUrl."?goto=trip/showtrip/$tripid'>
					<img src='".TripConfig::EmailImageUrl."?changeid=$changeid&participantid=$participantid&guid=$guid' title='$imgtitle'/>
				</a>
			</p>"; 		
					
		if (preg_match(TripConfig::EmailFilter, $recipient["email"])) {
			$emailaudit []= "$recipient[name] ($recipient[email])";
			if (!mail($recipient["email"], $subject, implode("",$bodyparts), $headers)) {
				die("mail() failed");
			}
		} else {
			$emailaudit []= "$recipient[name] ($recipient[email] FILTERED)";
		}
	} 
	
	$emailauditSql = SqlVal("Email recipients: ".implode(", ",$emailaudit));
	$participantidsSql = count($participantids) == 0 ? "-1" : implode(",",$participantids);
	SqlExecOrDie($con,"UPDATE ".TripConfig::TripDB.".changehistory SET emailAudit = $emailauditSql WHERE id = $changeid");
	SqlExecOrDie($con,"UPDATE ".TripConfig::TripDB.".participants  SET isEmailPending = 1 WHERE id in ($participantidsSql)");
}
		
?>