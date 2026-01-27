<?php
$conn = new mysqli("localhost", "root", "", "masjid");
session_start();

if ($conn->connect_error) {
  die("DB Error");
}
