<?php
header('Content-Type: application/json');

// Koneksi database
$host = "localhost";
$db   = "masjid";
$user = "root";
$pass = "";
$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
    echo json_encode(['error' => 'Koneksi gagal']);
    exit;
}

// Ambil parameter sholat
$sholat = $_GET['sholat'] ?? 'subuh';

// Query data imam
$stmt = $conn->prepare("SELECT nama FROM imam WHERE sholat = ? LIMIT 1");
$stmt->bind_param("s", $sholat);
$stmt->execute();
$result = $stmt->get_result();

if ($row = $result->fetch_assoc()) {
    echo json_encode(['imam' => $row['nama']]);
} else {
    echo json_encode(['imam' => '-']);
}

$stmt->close();
$conn->close();
