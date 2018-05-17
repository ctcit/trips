<?php
	define( '_JEXEC', 1 );
	require_once( 'alastair.php' );
	require_once( 'trips.config.php' );

	GetLogonDetails($con, $username, "COALESCE(r.role,'') in (".TripConfig::EditorRoles.")");

	$tbefore = SqlResultScalar($con,"select count(*) count from ".TripConfig::TripDB.".trips");
	$pbefore = SqlResultScalar($con,"select count(*) count from ".TripConfig::TripDB.".participants");

	// Insert date for upcoming trips that haven't already been added.
	// we use nulls for most columns, but we need dates for ordering
	$trows1 = SqlExecOrDie($con,"
				INSERT ".TripConfig::TripDB.".trips(eventid,date,originalDate,closeDate)
				SELECT e.id, e.date, e.date, e.date
				FROM ".TripConfig::NewsletterDB.".events e
				left join ".TripConfig::TripDB.".trips    t on t.eventid = e.id
				where e.date > now() and e.leader is not null AND t.id is null
				order by e.date");

	// Update the dates if they've changed in the events table
	$trows2 = SqlExecOrDie($con, "
			UPDATE " . TripConfig::TripDB . ".trips as t
			JOIN " . TripConfig::NewsletterDB . ".events e ON t.eventid = e.id
			SET t.closeDate = date_add(e.date, interval datediff(t.closeDate,t.Date) day),
				t.date = e.Date
			WHERE e.date > now() AND e.leader is not null
			AND e.date <> t.date AND t.date = t.originalDate ");

	// Update the dates if they've changed in the events table
	$trows2 = SqlExecOrDie($con, "
			UPDATE " . TripConfig::TripDB . ".trips as t
			JOIN " . TripConfig::NewsletterDB . ".events e ON t.eventid = e.id
			SET t.closeDate = date_add(e.date, interval datediff(t.closeDate,t.Date) day),
				t.date = e.Date
			WHERE e.date > now() AND e.leader is not null
			AND e.date <> t.date AND t.date = t.originalDate ");

	// Update the dates if they've changed in the events table
	$trows3 = SqlExecOrDie($con, "
			UPDATE " . TripConfig::TripDB . ".trips as t
			SET t.isAdHoc = 0
			WHERE e.date > now() AND t.isAdHoc = 1");

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

	echo "".TripConfig::CtcDB.".trips is up to date - trips/participants\n".
		" before:$tbefore/$pbefore\n".
		" after:$tafter/$pafter\n".
		" added:".($tafter-$tbefore)."/".($pafter-$pbefore)."\n".
		" affected: $trows1+$trows2+$trows3/$prows1+$prows2\n";
?>