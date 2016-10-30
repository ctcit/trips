<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>CTC Trip List</title>
    <link rel="stylesheet" href="app/styles/trips.css">
</head>
<body>
    <!--! ?php var_dump($_POST)?-->
    <h1>Christchurch Tramping Club Trip List</h1>
    <h2><?php echo $_POST['title']?></h2>
    <table class="triplistparams">
        <tr>
            <td class="paramlabel">Leader:</td><td class="leadername"><?php echo $_POST['leadername']?>
            <td class="paramlabel">Date:</td><td class="date"><?php echo $_POST['date']?></td>
            <td class="paramlabel">Length:</td><td class="length"><?php echo $_POST['length']?> days</td>
        </tr>
    </table>
    <h3>Participants</h3>
    <table class="participants">
        <tr>
            <th class="namecol">Name</th>
            <th class="emailcol">Email</th>
            <th class="phonecol">Phone</th>
            <th class="carcol">Car?</th>
        </tr>
        <?php
            $i = 0;
            foreach ($_POST['name'] as $name) { ?>
        <tr>
            <td><?php echo $name?></td>
            <td><?php echo $_POST["email"][$i]?></td>
            <td><?php echo $_POST["phone"][$i]?></td>
            <td><?php echo $_POST["hascar"][$i]?></td>
        </tr>
            <?php
            $i += 1;
            }

            for ($i = 0; $i < 10; $i++) {  // Add 10 blank lines
                echo "<tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>\n";
            }
            ?>
    </table>
    <h3>Notes</h3>
    <?php if (!empty($_POST['note'])) {
        foreach ($_POST['note'] as $note) {
            echo $note;
            echo "\n<br>";
        }
    }
    ?>

</body>
</html>

