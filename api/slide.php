<?php
require "config.php";
$q = $conn->query("SELECT * FROM slide WHERE aktif=1");
$rows = [];
while($r=$q->fetch_assoc()) $rows[] = $r;
echo json_encode($rows);
