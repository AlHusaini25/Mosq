<?php
session_start();
require 'koneksi.php';
if (!isset($_SESSION['admin'])) exit;

$id = $_GET['id'];
$conn->query("DELETE FROM imam WHERE id=$id");

header("Location: imam.php");
