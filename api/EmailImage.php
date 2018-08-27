<?php
define( '_JEXEC', 1 );
require_once( 'alastair.php' );
require_once( 'trips.config.php' );
require_once( 'trips.inc.php' );

function Wrap($text,$linelimit){
	$lines = explode("\n",$text);
	$out = "";
	for ($line = 0; $line < count($lines); $line++){
		$out .= $line == 0 ? "" : "\n";
		$words = explode(" ",$lines[$line]);
		$start = strlen($out);
		for ($word = 0; $word < count($words); $word++){
			if ($word > 0 && strlen($out) - $start + strlen($words[$word]) > $linelimit){
				$out .= "\n";
				$start = strlen($out);
			} else if ($word > 0 ){
				$out .= " ";
			}
			$out .= $words[$word];
		}
	}
	
	return $out;
}

$participantid	= intval($_GET["participantid"]);
$changeid		= intval($_GET["changeid"]);
$guid	 		= strval($_GET["guid"]);
$tables = array();
$change = SqlResultArray($con,"SELECT guid, timestamp, tripid FROM ".TripConfig::TripDB.".changehistory WHERE id = $changeid");
			
// validate the parameters
if (count($change) == 1 && str_replace("-","",$change[0]["guid"]) == str_replace("-","",$guid)) {
	
	$tripid   = $change[0]["tripid"];
	$updates = SqlResultArray($con,"	SELECT concat(`column`,coalesce(`line`,'')) as `key`
						FROM ".TripConfig::TripDB.".changehistory
						WHERE tripid = $tripid and id >= $changeid and action like 'update%'","key");
	$inserts = SqlResultArray($con,"	SELECT `line` as `key`
						FROM ".TripConfig::TripDB.".changehistory
						WHERE tripid = $tripid and id >= $changeid and action like 'insert%'","key");
		
	// we assume that the user now knows about this trip
	SqlExecOrDie($con,"	UPDATE ".TripConfig::TripDB.".participants 
				SET isEmailPending = 0 
				WHERE id = $participantid");
	
	$metadata = GetMetadata($con);
	$trips = GetTrips($con,"t.id = $tripid");
	$participants = GetParticipants($con,"t.id = $tripid");
	
	// Add trip details
	$table = array();
	foreach ($metadata["trips"] as $field => $col)
	{
		if ($col["Display"] != "" && $field != "mapHtml" && $field != "isRemoved") {
			$table []= array("cells"=>array(
				array("value"=>$col["Display"],
					  "selector"=>"th"),
				array("value"=>Wrap($trips[0][$field],80),
					  "selector"=>array_key_exists($field,$updates)?".updated":"")));
		}
	}
	$tables []= $table;
	
	// Add participant column headers
	$table = array();
	$line = array("cells"=>array());
	foreach ($metadata["participants"] as $field => &$col)
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
		foreach ($metadata["participants"] as $field => $col)
		{
			if ($field == "line") {
				$line["cells"] []= array("value"=>$participant[$field]+1,
										 "selector"=>"th");
			} else if ($col["Display"] != "") {
				$line["cells"] []= array("value"=>Wrap($participant[$field],20),
										 "type"=>$col["Type"],
										 "border"=>true,
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
$css		= ParseCss(file_get_contents("../app/styles/trips.css"));
$lineheight	= $css[".imageCell"]["height"];
$gap		= $css[".imageGap"]["height"];
$fontfile	= "../app/assets/arial.ttf";
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
		$line["sizey"] = $linesizey;
	}
	$sizey += $gap;
}


$checkbox0 = @imagecreatefrompng("../app/assets/checkbox0.png") or die("cannot create png image - checkbox0.png");
$checkbox1 = @imagecreatefrompng("../app/assets/checkbox1.png") or die("cannot create png image - checkbox1.png");
$removed = @imagecreatefrompng("../app/assets/removed.png") or die("cannot create png image - removed.png");
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
				$style = array("color" => "black", "background-color" => "white", "font-weight" => "");
				
				foreach (explode(" ",$cell["selector"]) as $selector) {
					if (array_key_exists($selector,$css)) {
						foreach ($css[$selector] as $attr => $attrvalue) {
							$style[$attr] = $attrvalue;
						}
					}
				}
				
				imagefilledrectangle($image,
                                        $x,$y,$x+$cell["sizex"],$y+$cell["sizey"],
                                        GetColor($image, $style["background-color"]));
				
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
			
			if (array_key_exists("border",$cell)){
				imagerectangle($image,$cell["x"],$line["y"],$cell["x"]+$cell["sizex"],$line["y"]+$line["sizey"],GetColor($image,"lightgray"));
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
