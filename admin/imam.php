<?php
session_start();
require 'koneksi.php';
if (!isset($_SESSION['admin'])) {
    header("Location: login.php");
    exit;
}

// SIMPAN DATA
if (isset($_POST['simpan'])) {
    $nama = $_POST['nama'];
    $sholat = $_POST['sholat'];
    $ket = $_POST['keterangan'];
    $conn->query("INSERT INTO imam (nama, sholat, keterangan) VALUES ('$nama','$sholat','$ket')");
}

$data = $conn->query("SELECT * FROM imam ORDER BY id DESC");
?>

<!doctype html>
<html lang="id">

<head>
    <meta charset="UTF-8">
    <title>Data Imam</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
</head>

<body class="bg-light">

    <nav class="navbar navbar-dark bg-primary px-3">
        <span class="navbar-brand">👳 Data Imam</span>
        <a href="dashboard.php" class="btn btn-light btn-sm">← Dashboard</a>
    </nav>

    <div class="container mt-4">

        <!-- FORM TAMBAH -->
        <div class="card shadow mb-4">
            <div class="card-header fw-bold">Tambah Imam</div>
            <div class="card-body">
                <form method="post" class="row g-3">
                    <div class="col-md-4">
                        <input type="text" name="nama" class="form-control" placeholder="Nama Imam" required>
                    </div>

                    <div class="col-md-4">
                        <select name="sholat" class="form-select" required>
                            <option value="">Pilih Sholat</option>
                            <option value="subuh">Subuh</option>
                            <option value="dzuhur">Dzuhur</option>
                            <option value="ashar">Ashar</option>
                            <option value="maghrib">Maghrib</option>
                            <option value="isya">Isya</option>
                            <option value="jumat">Jumat</option>
                        </select>
                    </div>

                    <div class="col-md-3">
                        <input type="text" name="keterangan" class="form-control" placeholder="Catatan (opsional)">
                    </div>

                    <div class="col-md-2">
                        <button name="simpan" class="btn btn-success w-100">Simpan</button>
                    </div>
                </form>
            </div>
        </div>



        <!-- TABEL -->
        <div class="card shadow">
            <div class="card-header fw-bold">Daftar Imam</div>
            <div class="card-body">
                <table class="table table-bordered table-hover">
                    <thead class="table-primary">
                        <tr>
                            <th width="50">#</th>
                            <th>Nama</th>
                            <th>Sholat</th>
                            <th>Keterangan</th>
                            <th width="150">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php $no = 1;
                        while ($r = $data->fetch_assoc()): ?>
                            <tr>
                                <td><?= $no++ ?></td>
                                <td><?= $r['nama'] ?></td>
                                <td><?= $r['sholat'] ?></td>
                                <td><?= $r['keterangan'] ?></td>
                                <td>
                                    <a href="imam_edit.php?id=<?= $r['id'] ?>" class="btn btn-warning btn-sm">Edit</a>
                                    <a href="imam_hapus.php?id=<?= $r['id'] ?>"
                                        class="btn btn-danger btn-sm"
                                        onclick="return confirm('Hapus data ini?')">Hapus</a>
                                </td>
                            </tr>
                        <?php endwhile ?>
                    </tbody>
                </table>
            </div>
        </div>

    </div>
</body>

</html>