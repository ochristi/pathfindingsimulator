<?php
$modelsPath = "models/";

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    // save
    $fn = "test.json";
    $f = fopen($modelsPath . $fn, "w");
    fwrite($f, json_encode($data));
    fclose($f);
} elseif ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $entries = array();
    if ($handle = opendir($modelsPath)) {
        while (false !== ($entry = readdir($handle))) {
            if ($entry != "." && $entry != "..") {
//                 array_push($entries, array($entry, filemtime($entry), filesize($entry)));
                array_push($entries, $entry);
            }
        }
        closedir($handle);
    }
    echo json_encode($entries);
}