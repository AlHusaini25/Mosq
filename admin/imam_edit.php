<?php
session_start();
require 'koneksi.php';
if (!isset($_SESSION['admin'])) exit;

$id = $_GET['id'];
$data = $conn->query("SELECT * FROM imam WHERE id=$id")->fetch_assoc();

if (isset($_POST['update'])) {
    $nama = $_POST['nama'];
    $ket  = $_POST['keterangan'];
    $conn->query("UPDATE imam SET nama='$nama', keterangan='$ket' WHERE id=$id");
    header("Location: imam.php");
}
?>

<!doctype html>
<html>
<head>
  <title>Edit Imam</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
</head>

<body class="bg-light d-flex justify-content-center align-items-center" style="height:100vh">
<div class="card p-4 shadow" style="width:400px">
  <h5>Edit Imam</h5>

  <form method="post">
    <input type="text" name="nama" value="<?= $data['nama'] ?>" class="form-control mb-2" required>
    <input type="text" name="keterangan" value="<?= $data['keterangan'] ?>" class="form-control mb-3">
    <button name="update" class="btn btn-primary w-100">Update</button>
  </form>
</div>
</body>
</html>
