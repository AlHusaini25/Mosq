<?php
require "../api/config.php";
if (!isset($_SESSION['admin'])) header("Location: login.php");
?>

<h2>Panel Admin Masjid</h2>
<ul>
    <li><a href="slide.php">Kelola Slide</a></li>
    <li><a href="imam.php">Jadwal Imam</a></li>
    <li><a href="logout.php">Logout</a></li>
</ul>