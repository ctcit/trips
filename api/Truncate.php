<?php
	define( '_JEXEC', 1 );
	require_once( 'alastair.php' );

	SqlExecOrDie($con,"TRUNCATE TABLE ctcweb9_trip.participants");
	SqlExecOrDie($con,"TRUNCATE TABLE ctcweb9_trip.changehistory");
	SqlExecOrDie($con,"TRUNCATE TABLE ctcweb9_trip.trips");

	echo "ctcweb9_ctc.trips etc is truncated\n";

?>