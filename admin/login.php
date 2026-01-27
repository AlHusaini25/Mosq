<?php
require "../api/config.php";

if ($_POST) {
    $u = $_POST['username'];
    $p = hash('sha256', $_POST['password']);

    $q = $conn->query("SELECT * FROM admin WHERE username='$u' AND password='$p'");
    if ($q->num_rows) {
        $_SESSION['admin'] = true;
        header("Location: dashboard.php");
    } else {
        $err = "Login gagal";
    }
}
?>

<!doctype html>
<html>

<head>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
</head>

<body class="bg-light">
    <div class="container mt-5 col-md-4">
        <h3>Admin Masjid</h3>
        <?php if (isset($err)) echo "<div class='alert alert-danger'>$err</div>"; ?>
        <form method="post">
            <input class="form-control mb-2" name="username" placeholder="Username">
            <input class="form-control mb-2" name="password" type="password" placeholder="Password">
            <button class="btn btn-primary w-100">Login</button>
        </form>
    </div>
</body>

</html>