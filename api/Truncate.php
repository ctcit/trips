<?php
	define( '_VALID_MOS', 1 );
	require_once( '/home1/ctcweb9/public_html/includes/alastair.php' );

	SqlExecOrDie($con,"TRUNCATE TABLE ctcweb9_trip.participants");
	SqlExecOrDie($con,"TRUNCATE TABLE ctcweb9_trip.changehistory");
	SqlExecOrDie($con,"TRUNCATE TABLE ctcweb9_trip.trips");

	echo "ctcweb9_ctc.trips etc is truncated\n";

?>