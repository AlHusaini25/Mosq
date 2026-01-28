<?php
session_start();
if (!isset($_SESSION['admin'])) {
  header("Location: login.php");
  exit;
}
?>

<!doctype html>
<html lang="id">

<head>
  <meta charset="UTF-8">
  <title>Dashboard Admin</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">

  <!-- Bootstrap 5 -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
</head>

<body class="bg-light">

  <nav class="navbar navbar-dark bg-primary px-3">
    <span class="navbar-brand">📺 Dashboard Masjid</span>
    <a href="logout.php" class="btn btn-outline-light btn-sm">Logout</a>
  </nav>

  <div class="container mt-4">
    <div class="row g-4">

      <div class="col-md-4">
        <div class="card shadow text-center">
          <div class="card-body">
            <h5>🕌 Imam</h5>
            <p>Kelola data imam</p>
            <a href="imam.php" class="btn btn-success btn-sm">Kelola</a>

          </div>
        </div>
      </div>

      <div class="col-md-4">
        <div class="card shadow text-center">
          <div class="card-body">
            <h5>🎙️ Muadzin</h5>
            <p>Kelola data muadzin</p>
            <a href="#" class="btn btn-success btn-sm">Kelola</a>
          </div>
        </div>
      </div>

      <div class="col-md-4">
        <div class="card shadow text-center">
          <div class="card-body">
            <h5>📢 Pengumuman</h5>
            <p>Slide TV & running text</p>
            <a href="#" class="btn btn-success btn-sm">Kelola</a>
          </div>
        </div>
      </div>

    </div>
  </div>

</body>

</html>