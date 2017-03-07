<?php
define('_JEXEC', 1);
require_once( 'alastair.php' );
require_once( 'trips.config.php' );
require_once( 'trips.inc.php' );

$logondetails	= GetLogonDetails($con,$username);
$result["members"] = SqlResultArray($con,"
		SELECT	m.id,
			concat(trim(m.firstname),' ',trim(m.lastname)) as name,
			m.primaryemail as email,
			COALESCE((CASE ms.homephone WHEN '' THEN null ELSE ms.homephone end), 
				(CASE m.mobilephone WHEN '' THEN null ELSE m.mobilephone end), 
				(CASE m.workphone WHEN '' THEN null ELSE m.workphone end)) as phone,
			q.role			
		FROM ctcweb9_ctc.members             m
		JOIN ctcweb9_ctc.memberships         ms  on ms.id = m.membershipid 
		LEFT JOIN 
			(SELECT mr.memberid, max(r.role) as role
			FROM	ctcweb9_ctc.members_roles  mr
			JOIN 	ctcweb9_ctc.roles          r   on r.id = mr.roleid and r.role in (".TripConfig::EditorRoles.")
					GROUP BY mr.memberid) 	     q   on q.memberid = m.id
		WHERE ms.statusAdmin = 'Active'
		ORDER BY name");	
		
header('Content-Type: application/json');
echo json_encode($result);
?>