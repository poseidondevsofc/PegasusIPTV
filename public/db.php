<?php
$dbFile = __DIR__ . '/../storage/pegasus.db';
$need_init = !file_exists($dbFile);
try { $db = new PDO('sqlite:' . $dbFile); $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION); } 
catch (Exception $e) { die('DB error: ' . $e->getMessage()); }
if ($need_init) { $db->exec(file_get_contents(__DIR__ . '/../init.sql')); }
?>
