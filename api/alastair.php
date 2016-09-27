<?php
/*
require_once( '/home1/ctcweb9/public_html/globals.php' );
require_once( '/home1/ctcweb9/public_html/configuration.php' );
require_once( '/home1/ctcweb9/public_html/includes/joomla.php' );
require_once( '/home1/ctcweb9/public_html/includes/sef.php' ); // What is sef.php??


// mainframe is an API workhorse, lots of 'core' interaction routines
$con        = mysql_connect("localhost",   $mosConfig_user, $mosConfig_password);
$mainframe  = new mosMainFrame( $database, '', '.' );
$mainframe->initSession();
$userobj    = $mainframe->getUser();
$username   = array("id"=>$userobj->id,"name"=>$userobj->username);

if (!$con)
{
    die('mysql_connect failed');
}
*/
define('_JEXEC', 1);
define('JPATH_BASE', dirname(dirname(__DIR__)));// Assume we are two leveld down in website
require_once ( JPATH_BASE.'/includes/defines.php' );
require_once ( JPATH_BASE.'/includes/framework.php' );
$app = JFactory::getApplication('site');
$user = JFactory::getUser();
$config = JFactory::getConfig();


$con        = mysql_connect("localhost",   $config->get("user"), $config->get("password"));
// N.B. userid here is the JOOMLA id NOT the db id. The common ground here is username.
$username   = array("id"=>$user->id,"name"=>$user->username);

if (!$con)
{
    die('mysql_connect failed');
}



function GetLogonDetails($con,$username,$params="",$roleclause="1=1")
{
    $userrow = SqlResultArray($con,"
            SELECT primaryEmail,firstName,lastName,m.id
            FROM ctcweb9_ctc.members             m
            LEFT JOIN ctcweb9_ctc.members_roles  mr  on mr.memberid = m.id
            LEFT JOIN ctcweb9_ctc.roles          r   on r.id = mr.roleid
            where loginname = ".SqlVal($username["name"])." and $roleclause");

    if (count($userrow))
    {
        return array(
            "userid"    => $userrow[0]["id"],
            "username"  => $username["name"],
            "email"     => $userrow[0]["primaryEmail"],
            "firstname" => $userrow[0]["firstName"],
            "lastname"  => $userrow[0]["lastName"]);
    }
    else
    {
        die("You are not logged on.");
    }
}

function MakeGuid()
{
    return sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
                  mt_rand(0, 0xffff),
                  mt_rand(0, 0xffff),
                  mt_rand(0, 0xffff),
                  mt_rand(0, 0xffff),
                  mt_rand(0, 0xffff),
                  mt_rand(0, 0xffff),
                  mt_rand(0, 0xffff),
                  mt_rand(0, 0xffff));
}

function ParseCss($text)
{
    $text = preg_replace("/\/\*.*\*\//","",$text);
    $css = array();

    foreach (explode("}",$text) as $style) {
        $stylesplit = explode("{",$style);
        foreach (explode(",",$stylesplit[0]) as $selector) {
            foreach (explode(";",trim($stylesplit[1],"; \t\r\n")) as $val) {
                $valsplit = explode(":",$val);
                $css[trim($selector)][trim($valsplit[0])] = preg_replace("/^([0-9]+)px$/","$1",trim($valsplit[1]));
            }
        }
    }

    return $css;
}

function SqlVal($value) {
    return $value === null ? "null" : "'".addslashes($value)."'";
}

function SqlResultArray($con,$sql,$keycol='')
{
    $cursor = mysql_query($sql,$con);

    if (!$cursor) {
        die("Invalid query: ".mysql_error($con)."\n$sql");
    }

    $array = array();
    while (($row = mysql_fetch_array($cursor,MYSQL_ASSOC))) {
        if ($keycol == '') {
            $array []= $row;
        } else {
            $array[$row[$keycol]] = $row;
        }
    }
    mysql_free_result($cursor);
    return $array;
}

function SqlResultScalar($con,$sql)
{
    $array = SqlResultArray($con,$sql);
    if (!is_array($values) && !is_object($values)) {
      return null;
    }
    foreach ($array[0] as $scalar) {
      return $scalar;
    }
}

function SqlExecOrDie($con,$sql)
{
    if (!mysql_query($sql,$con)) {
        die("Invalid query: ".mysql_error($con)."\n$sql");
    }

    return mysql_affected_rows($con);
}

class Colors {
    public static $colormap =  ARRAY(
"aliceblue"=>0xF0F8FF,"antiquewhite"=>0xFAEBD7,"aqua"=>0x00FFFF,"aquamarine"=>0x7FFFD4,"azure"=>0xF0FFFF,
"beige"=>0xF5F5DC,"bisque"=>0xFFE4C4,"black"=>0x000000,"blanchedalmond"=>0xFFEBCD,"blue"=>0x0000FF,
"blueviolet"=>0x8A2BE2,"brown"=>0xA52A2A,"burlywood"=>0xDEB887,"cadetblue"=>0x5F9EA0,"chartreuse"=>0x7FFF00,
"chocolate"=>0xD2691E,"coral"=>0xFF7F50,"cornflowerblue"=>0x6495ED,"cornsilk"=>0xFFF8DC,"crimson"=>0xDC143C,
"cyan"=>0x00FFFF,"darkblue"=>0x00008B,"darkcyan"=>0x008B8B,"darkgoldenrod"=>0xB8860B,"darkgray"=>0xA9A9A9,
"darkgreen"=>0x006400,"darkkhaki"=>0xBDB76B,"darkmagenta"=>0x8B008B,"darkolivegreen"=>0x556B2F,"darkorange"=>0xFF8C00,
"darkorchid"=>0x9932CC,"darkred"=>0x8B0000,"darksalmon"=>0xE9967A,"darkseagreen"=>0x8FBC8F,"darkslateblue"=>0x483D8B,
"darkslategray"=>0x2F4F4F,"darkturquoise"=>0x00CED1,"darkviolet"=>0x9400D3,"deeppink"=>0xFF1493,"deepskyblue"=>0x00BFFF,
"dimgray"=>0x696969,"dodgerblue"=>0x1E90FF,"firebrick"=>0xB22222,"floralwhite"=>0xFFFAF0,"forestgreen"=>0x228B22,
"fuchsia"=>0xFF00FF,"gainsboro"=>0xDCDCDC,"ghostwhite"=>0xF8F8FF,"gold"=>0xFFD700,"goldenrod"=>0xDAA520,
"gray"=>0x808080,"green"=>0x008000,"greenyellow"=>0xADFF2F,"honeydew"=>0xF0FFF0,"hotpink"=>0xFF69B4,
"indianred "=>0xCD5C5C,"indigo "=>0x4B0082,"ivory"=>0xFFFFF0,"khaki"=>0xF0E68C,"lavender"=>0xE6E6FA,
"lavenderblush"=>0xFFF0F5,"lawngreen"=>0x7CFC00,"lemonchiffon"=>0xFFFACD,"lightblue"=>0xADD8E6,"lightcoral"=>0xF08080,
"lightcyan"=>0xE0FFFF,"lightgoldenrodyellow"=>0xFAFAD2,"lightgray"=>0xD3D3D3,"lightgreen"=>0x90EE90,"lightpink"=>0xFFB6C1,
"lightsalmon"=>0xFFA07A,"lightseagreen"=>0x20B2AA,"lightskyblue"=>0x87CEFA,"lightslategray"=>0x778899,"lightsteelblue"=>0xB0C4DE,
"lightyellow"=>0xFFFFE0,"lime"=>0x00FF00,"limegreen"=>0x32CD32,"linen"=>0xFAF0E6,"magenta"=>0xFF00FF,
"maroon"=>0x800000,"mediumaquamarine"=>0x66CDAA,"mediumblue"=>0x0000CD,"mediumorchid"=>0xBA55D3,"mediumpurple"=>0x9370DB,
"mediumseagreen"=>0x3CB371,"mediumslateblue"=>0x7B68EE,"mediumspringgreen"=>0x00FA9A,"mediumturquoise"=>0x48D1CC,"mediumvioletred"=>0xC71585,
"midnightblue"=>0x191970,"mintcream"=>0xF5FFFA,"mistyrose"=>0xFFE4E1,"moccasin"=>0xFFE4B5,"navajowhite"=>0xFFDEAD,
"navy"=>0x000080,"oldlace"=>0xFDF5E6,"olive"=>0x808000,"olivedrab"=>0x6B8E23,"orange"=>0xFFA500,
"orangered"=>0xFF4500,"orchid"=>0xDA70D6,"palegoldenrod"=>0xEEE8AA,"palegreen"=>0x98FB98,"paleturquoise"=>0xAFEEEE,
"palevioletred"=>0xDB7093,"papayawhip"=>0xFFEFD5,"peachpuff"=>0xFFDAB9,"peru"=>0xCD853F,"pink"=>0xFFC0CB,
"plum"=>0xDDA0DD,"powderblue"=>0xB0E0E6,"purple"=>0x800080,"rebeccapurple"=>0x663399,"red"=>0xFF0000,
"rosybrown"=>0xBC8F8F,"royalblue"=>0x4169E1,"saddlebrown"=>0x8B4513,"salmon"=>0xFA8072,"sandybrown"=>0xF4A460,
"seagreen"=>0x2E8B57,"seashell"=>0xFFF5EE,"sienna"=>0xA0522D,"silver"=>0xC0C0C0,"skyblue"=>0x87CEEB,
"slateblue"=>0x6A5ACD,"slategray"=>0x708090,"snow"=>0xFFFAFA,"springgreen"=>0x00FF7F,"steelblue"=>0x4682B4,
"tan"=>0xD2B48C,"teal"=>0x008080,"thistle"=>0xD8BFD8,"tomato"=>0xFF6347,"turquoise"=>0x40E0D0,
"violet"=>0xEE82EE,"wheat"=>0xF5DEB3,"white"=>0xFFFFFF,"whitesmoke"=>0xF5F5F5,"yellow"=>0xFFFF00,
"yellowgreen"=>0x9ACD32);
};

function GetColor($image,$color1,$color2="")
{
    $rgb1 = Colors::$colormap[strtolower($color1)];
    $rgb2 = Colors::$colormap[strtolower($color2 == "" ? $color1 : $color2)];

    return imagecolorallocate($image,   
		((($rgb1 >> 16) & 0xFF)+(($rgb2 >> 16) & 0xFF))/2,
        ((($rgb1 >>  8) & 0xFF)+(($rgb2 >>  8) & 0xFF))/2,
        ((($rgb1 >>  0) & 0xFF)+(($rgb2 >>  0) & 0xFF))/2);
}


?>