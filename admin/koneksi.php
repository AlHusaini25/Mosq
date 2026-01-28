<?php
$conn = new mysqli("localhost", "root", "", "masjid");

if ($conn->connect_error) {
    die("Koneksi gagal: " . $conn->connect_error);
}
