<?php
define( '_VALID_MOS', 1 );
require_once( '../includes/alastair.php' );
require_once( 'trips.config.php' );
require_once( 'trips.inc.php' );

$memberid 	= intval($_GET["memberid"]);
$changeid     	= intval($_GET["changeid"]);
$guid	 	= strval($_GET["guid"]);
$tables = array();
$change = SqlResultArray($con,"SELECT guid, timestamp, tripid FROM ctcweb9_trip.changehistory WHERE id = $changeid");
			
// validate the parameters
if (count($change) == 1 && str_replace("-","",$change[0]["guid"]) == str_replace("-","",$guid)) {
	
	$tripid   = $change[0]["tripid"];
	$updates = SqlResultArray($con,"	SELECT concat(`column`,coalesce(`line`,'')) as `key`
						FROM ctcweb9_trip.changehistory
						WHERE tripid = $tripid and id >= $changeid and action = 'update'","key");
	$inserts = SqlResultArray($con,"	SELECT `line` as `key`
						FROM ctcweb9_trip.changehistory
						WHERE tripid = $tripid and id >= $changeid and action = 'insert'","key");
		
	// we assume that the user now knows about this trip
	SqlExecOrDie($con,"	UPDATE ctcweb9_trip.participants 
				SET isEmailPending = 0 
				WHERE tripid = $tripid and memberid = $memberid");
	
	$metadata = GetMetadata($con);
	$trips = GetTrips($con,"t.id = $tripid");
	$participants = GetParticipants($con,"t.id = $tripid");
	
	// Add trip details
	$table = array();
	foreach ($metadata["trips"] as $field => $col)
	{
		if ($col["Display"] != "") {
			$table []= array("cells"=>array(
				array("value"=>$col["Display"],"selector"=>"th"),
				array("value"=>$trips[0][$field],"selector"=>array_key_exists($field,$updates)?".updated":"")));
		}
	}
	$tables []= $table;
	
	// Add participant column headers
	$table = array();
	$line = array("cells"=>array());
	foreach ($metadata["trip_participants"] as $field => &$col)
	{
		if ($field == "line" || $col["Display"] != "") {
			$line["cells"] []= array("value"=>$col["Display"],"selector"=>"th");
		}
	}
	$table []= $line;
	
	// Add participant details
	foreach ($participants as $participant)
	{
		$line = array("isRemoved"=>$participant["isRemoved"]);
		foreach ($metadata["trip_participants"] as $field => $col)
		{
			if ($field == "line") {
				$line["cells"] []= array("value"=>$participant[$field]+1,
							"selector"=>"th");
			} else if ($col["Display"] != "") {
				$line["cells"] []= array("value"=>$participant[$field],
							 "type"=>$col["Type"],
							 "selector"=>	(array_key_exists($participant["line"],$inserts)?".inserted":
							 		(array_key_exists($field.$participant["line"],$updates)?".updated":"")));
			}
		}
		
		$table []= $line;
	}
	$tables []= $table;
	
	// Add footer
	$now = new DateTime();
	$now->setTimezone(new DateTimeZone("Pacific/Auckland"));
	$date = new DateTime($change[0]["timestamp"]."Z");
	$date->setTimezone(new DateTimeZone("Pacific/Auckland"));
	$tables []= array(array("cells"=>array(	array("value"=>"(As at ".$now->format("Y-m-d H:i")." - "),
						array("value"=>" updates","selector"=>".updated"),
						array("value"=>" and"),
						array("value"=>" sign ups","selector"=>".inserted"),
						array("value"=>" since ".$date->format("Y-m-d H:i")." are highlighed)"))));
} else {
	$tables []= array(array("cells"=>array(	array("value"=>"This trip is no longer current","selector"=>".error"))));
}

// measure the tables
$css		= ParseCss(file_get_contents("/home1/ctcweb9/public_html/trips/trips.css"));
$lineheight	= $css[".imageCell"]["height"];
$gap		= $css[".imageGap"]["height"];
$fontfile	= "arial.ttf";
$fontsize	= $lineheight * 0.6;
$sizey		= 0;
$sizey		= 0;
foreach ($tables as &$table)
{
	// Get the cell widths
	$widths = array();
	foreach ($table as &$line)
	{
		$i = 0;
		foreach ($line["cells"] as &$cell)
		{
			$cell["values"] = explode("\n",$cell["value"]);
			foreach ($cell["values"] as $value) {
				$box = imagettfbbox( $fontsize, 0, $fontfile, $value );
				$widths[$i] = max($widths[$i],$box[2]+$gap);
			}
			$i++;
		}
	}
	
	// add all the sizes up
	$sizey += $gap;
	foreach ($table as &$line)
	{
		$line["y"] = $sizey;
		$linesizey = $lineheight;
		$linesizex = $gap;
		$i = 0;
		foreach ($line["cells"] as &$cell)
		{
			$cell["x"] = $linesizex;
			$cell["sizex"] = $widths[$i];
			$cell["sizey"] = $lineheight;
			$linesizey = max($linesizey,count($cell["values"])*$lineheight);
			$linesizex += $widths[$i];
			$i++;
		}
		$sizex = max($sizex,$linesizex+$gap);
		$sizey += $linesizey;
	}
	$sizey += $gap;
}


$checkbox0 = @imagecreatefrompng("checkbox0.png") or die("cannot create png image - checkbox0.png");
$checkbox1 = @imagecreatefrompng("checkbox1.png") or die("cannot create png image - checkbox1.png");
$removed = @imagecreatefrompng("removed.png") or die("cannot create png image - removed.png");
$image = @imagecreatetruecolor($sizex,$sizey) or die("cannot create image");
$silver = GetColor($image, "silver");

imagefilledrectangle($image,0,0,$sizex,$sizey,GetColor($image, "white"));
imagefilledrectangle($image,0,0,1,$sizey,$silver);
imagefilledrectangle($image,$sizex-1,0,$sizex,$sizey,$silver);
imagefilledrectangle($image,0,0,$sizex,1,$silver);
imagefilledrectangle($image,0,$sizey-1,$sizex,$sizey,$silver);

// draw each table
foreach ($tables as &$table)
{
	foreach ($table as &$line)
	{
		foreach ($line["cells"] as &$cell)
		{
			$y = $line["y"];
			$x = $cell["x"];
			
			foreach ($cell["values"] as $value) {
				$style = array("color" => "black", "background" => "white", "font-weight" => "");
				
				foreach (explode(" ",$cell["selector"]) as $selector) {
					if (array_key_exists($selector,$css)) {
						foreach ($css[$selector] as $attr => $attrvalue) {
							$style[$attr] = $attrvalue;
						}
					}
				}
				
				imagefilledrectangle($image,$x,$y,$x+$cell["sizex"],$y+$cell["sizey"],GetColor($image, $style["background"]));
				
				if ($cell["type"] == "tinyint(1)") {
					$icon = $value ? $checkbox1 : $checkbox0;
					$x = $cell["x"] + $cell["sizex"]/2 - imagesx($icon)/2;
					imagecopyresized($image,$icon,$x,$y,0,0,imagesx($icon),imagesy($icon),imagesx($icon),imagesy($icon));
				} else {
					imagettftext($image,$fontsize,0,$x,$y+$lineheight*0.8,GetColor($image, $style["color"]),$fontfile,$value);
					if ($style["font-weight"] == "bold") {
						imagettftext($image,$fontsize,0,$x+1,$y+$lineheight*0.8,GetColor($image, $style["color"]),$fontfile,$value);
					}
				}
				$y += $lineheight;
			}
		}
		
		if ($line["isRemoved"]) {
			$y = $line["y"];
			$icon = $removed;
			for ($x = 0; $x < $sizex; $x += imagesx($icon)) {
				imagecopyresized($image,$icon,$x,$y,0,0,imagesx($icon),imagesy($icon),imagesx($icon),imagesy($icon));
			}
		}
	}
}
	
header("Content-type: image/png");
imagepng($image);
imagedestroy($image);
imagedestroy($checkbox0);
imagedestroy($checkbox1);
imagedestroy($removed);

?>