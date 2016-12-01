<?php
	define( '_JEXEC', 1 );
	require_once( 'alastair.php' );
	require_once( 'trips.config.php' );

	GetLogonDetails($con,$username);
	
	$tbefore = SqlResultScalar($con,"select count(*) count from ".TripConfig::TripDB.".trips");
	$pbefore = SqlResultScalar($con,"select count(*) count from ".TripConfig::TripDB.".participants");

	// Insert date for upcoming trips that haven't already been added.
	// we use nulls for most columns, but we need dates for ordering
	$trows = SqlExecOrDie($con,"
				INSERT ".TripConfig::TripDB.".trips(eventid,date,originalDate,closeDate)
				SELECT e.id, e.date, e.date, e.date
				FROM ".TripConfig::NewsletterDB.".events e
				left join ".TripConfig::TripDB.".trips    t on t.eventid = e.id
				where e.date > now() and e.leader is not null AND t.id is null
				order by e.date");
				
	// Update the dates if they've changed in the events table
	$trows2 = SqlExecOrDie($con,"
				UPDATE t
				SET closeDate = date_add(e.date, interval datediff(t.closeDate,t.Date) day)
				,	date = e.Date
				FROM ".TripConfig::NewsletterDB.".events e
				JOIN ".TripConfig::TripDB.".trips    t on t.eventid = e.id
				WHERE e.date > now() AND e.leader is not null 
				AND e.date <> t.date AND t.date = t.originalDate ");
				
	// this excludes non-unique firstname/lastname joins
	$prows1 = SqlExecOrDie($con,"
					INSERT ".TripConfig::TripDB.".participants(tripid,line,memberid,isLeader)
	    			SELECT t.id tripid, 0 line, max(m.id) memberid, 1 isLeader
	    			FROM ".TripConfig::NewsletterDB.".events          e
	    			JOIN ".TripConfig::TripDB.".trips                 t  on t.eventid = e.id
	    			JOIN ".TripConfig::CtcDB.".members                m  on concat(trim(m.firstname),' ',trim(m.lastname)) = e.leader
	    			LEFT JOIN ".TripConfig::TripDB.".participants tp on tp.tripid = t.id
	    			WHERE e.date > now() and tp.tripid is null 
	    			GROUP by t.id 
	    			HAVING count(*) = 1");
	    			
	// If the above missed any due to non-unique firstname/lastname joins, then this will match on email
	$prows2 = SqlExecOrDie($con,"
					INSERT ".TripConfig::TripDB.".participants(tripid,line,memberid,isLeader)
	    			SELECT t.id tripid, 0 line, max(m.id) memberid, 1 isLeader
	    			FROM ".TripConfig::NewsletterDB.".events          e
	    			JOIN ".TripConfig::TripDB.".trips                 t  on t.eventid = e.id
	    			JOIN ".TripConfig::CtcDB.".members                m  on m.primaryemail = e.leaderEmail
	    			LEFT JOIN ".TripConfig::TripDB.".participants tp on tp.tripid = t.id
	    			WHERE e.date > now() and tp.tripid is null
					GROUP by t.id 
	    			HAVING count(*) = 1");
	
	$tafter = SqlResultScalar($con,"select count(*) count from ".TripConfig::TripDB.".trips");
	$pafter = SqlResultScalar($con,"select count(*) count from ".TripConfig::TripDB.".participants");

	echo "".TripConfig::CtcDB.".trips is up to date - trips/participants".
		" before:$tbefore/$pbefore".
		" after:$tafter/$pafter".
		" added:".($tafter-$tbefore)."/".($pafter-$pbefore).
		" affected: $trows/$prows1+$prows2\n";

?>