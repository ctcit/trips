<?php

class TripConfig
{
	const EditorRoles = "'Webmaster','Overnight Trip Organiser','Day Trip Organiser','Club Captain'";
	const EmailFilter = "/^.+@.+$/";
	const BaseUrl = "http://www.ctc.org.nz/index.php/current-trips";
	const EmailImageUrl = "http://www.ctc.org.nz/tripsignup.dev/api/EmailImage.php";
	const EmailHasLink = true;
	const EmailHasDetails = true;
	const ShowDebugUpdate = false;
	const AdditionalLines = 5;
	const PrintLines = 25;
	const EditRefreshInSec = 30;
	const CtcDB = "ctc";
	const TripDB = "trip";
	const NewsletterDB = "newsletter";
}

?>
