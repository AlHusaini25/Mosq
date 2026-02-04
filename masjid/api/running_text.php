<?php
header("Content-Type: application/json");
include "../config/koneksi.php";

$q = mysqli_query($conn,
  "SELECT isi FROM running_text WHERE aktif=1 ORDER BY id DESC LIMIT 5"
);

$data = [];
while ($r = mysqli_fetch_assoc($q)) {
  $data[] = $r['isi'];
}

echo json_encode([
  "text" => implode(" ••• ", $data)
]);
