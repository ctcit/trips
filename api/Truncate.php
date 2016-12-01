<?php
	define( '_JEXEC', 1 );
	require_once( 'alastair.php' );
	require_once( 'trips.config.php' );

	GetLogonDetails($con,$username);

	SqlExecOrDie($con,"TRUNCATE TABLE ".TripConfig::TripDB.".participants");
	SqlExecOrDie($con,"TRUNCATE TABLE ".TripConfig::TripDB.".changehistory");
	SqlExecOrDie($con,"TRUNCATE TABLE ".TripConfig::TripDB.".trips");

	echo "".TripConfig::CtcDB.".trips etc is truncated\n";

?>