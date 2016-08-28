<?php
	define( '_JEXEC', 1 );
	require_once( 'alastair.php' );
	
	$tbefore = SqlResultScalar($con,"select count(*) count from ctcweb9_trip.trips");
	$pbefore = SqlResultScalar($con,"select count(*) count from ctcweb9_trip.participants");

	$trows = SqlExecOrDie($con,"insert ctcweb9_trip.trips(eventid,date,closeDate)
				SELECT e.id, e.date, e.date
				FROM ctcweb9_newsletter.events e
				left join ctcweb9_trip.trips    t on t.eventid = e.id
				where e.date > now() and e.leader is not null AND t.id is null
				order by e.date");
				
	// this excludes non-unique firstname/lastname joins
	$prows1 = SqlExecOrDie($con,"insert ctcweb9_trip.participants(tripid,line,memberid,isLeader)
	    			SELECT t.id tripid, 0 line, max(m.id) memberid, 1 isLeader
	    			FROM ctcweb9_newsletter.events          e
	    			join ctcweb9_trip.trips                 t  on t.eventid = e.id
	    			join ctcweb9_ctc.members                m  on concat(trim(m.firstname),' ',trim(m.lastname)) = e.leader
	    			left join ctcweb9_trip.participants tp on tp.tripid = t.id
	    			where e.date > now() and tp.tripid is null 
	    			group by t.id 
	    			having count(*) = 1");
	    			
	// If the above missed any due to non-unique firstname/lastname joins, then this will match on email
	$prows2 = SqlExecOrDie($con,"insert ctcweb9_trip.participants(tripid,line,memberid,isLeader)
	    			SELECT t.id tripid, 0 line, m.id memberid, 1 isLeader
	    			FROM ctcweb9_newsletter.events          e
	    			join ctcweb9_trip.trips                 t  on t.eventid = e.id
	    			join ctcweb9_ctc.members                m  on m.primaryemail = e.leaderEmail
	    			left join ctcweb9_trip.participants tp on tp.tripid = t.id
	    			where e.date > now() and tp.tripid is null");
	
	$tafter = SqlResultScalar($con,"select count(*) count from ctcweb9_trip.trips");
	$pafter = SqlResultScalar($con,"select count(*) count from ctcweb9_trip.participants");

	echo "ctcweb9_ctc.trips is up to date - trips/participants".
		" before:$tbefore/$pbefore".
		" after:$tafter/$pafter".
		" added:".($tafter-$tbefore)."/".($pafter-$pbefore).
		" affected: $trows/$prows1+$prows2\n";

?>