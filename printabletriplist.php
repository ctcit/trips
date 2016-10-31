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
    <h2><?php
    function input($key, $index=null) {
        // Return the sanitised POST variable with the given key.
        // If the value is an array and a specific index is required, set
        // $index to an int index value. If the whole array is required, set it
        // to the string value 'ALL'.
        if ($index === NULL) {
            return filter_input(INPUT_POST, $key, FILTER_SANITIZE_SPECIAL_CHARS);
        } else {
            $data = filter_input(INPUT_POST, $key, FILTER_SANITIZE_SPECIAL_CHARS, FILTER_REQUIRE_ARRAY);
            if ($index === 'ALL') {
                return $data;
            } else {
                return $data[$index];
            }
        }
    }

    echo input('title');
    ?></h2>

    <table class="triplistparams">
        <tr>
            <td class="paramlabel">Leader:</td><td class="leadername"><?php echo input('leadername')?>
            <td class="paramlabel">Date:</td><td class="date"><?php echo input('date')?></td>
            <td class="paramlabel">Length:</td><td class="length"><?php echo input('length')?></td>
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
            foreach (input('name', 'ALL') as $name) { ?>
        <tr>
            <td><?php echo $name?></td>
            <td><?php echo input("email", $i)?></td>
            <td><?php echo input("phone", $i)?></td>
            <td><?php echo input("hascar", $i)?></td>
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
        foreach (input('note', 'ALL') as $note) {
            echo $note;
            echo "\n<br>";
        }
    }
    ?>

</body>
</html>

