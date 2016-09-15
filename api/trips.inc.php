<?php

// make sure that characters above 0x7F don't trip us up
mysql_query("SET CHARACTER SET utf8",$con);

function GetMetadata($con) {
	$metadata = array(
		"trips"=>SqlResultArray($con,"show full columns from ctcweb9_trip.trips","Field"),
		"participants"=>SqlResultArray($con,"show full columns from ctcweb9_trip.participants","Field"));
		
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
		SELECT t.id as tripid, 
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
		FROM      ctcweb9_trip.trips t 
		LEFT JOIN ctcweb9_newsletter.events e on e.id = t.eventid
		WHERE $where
		ORDER BY t.date");
}
		
function GetParticipants($con,$where) {
	return SqlResultArray($con,"
		SELECT 	p.line,
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
		FROM      ctcweb9_trip.trips         t 
		JOIN      ctcweb9_trip.participants  p  ON p.tripid = t.id
		LEFT JOIN ctcweb9_newsletter.events  e  ON e.id = t.eventid
		LEFT JOIN ctcweb9_ctc.members        m  ON m.id = p.memberid
		LEFT JOIN ctcweb9_ctc.memberships    ms ON ms.id = m.membershipid 
		WHERE $where
		ORDER BY e.date desc, line
		LOCK IN SHARE MODE");
}	
			
?>