<?php
require "../api/config.php";
if (!isset($_SESSION['admin'])) exit;

if ($_POST) {
  $conn->query("INSERT INTO slide (judul, isi) VALUES ('$_POST[judul]','$_POST[isi]')");
}

$data = $conn->query("SELECT * FROM slide");
?>

<h3>Slide Pengumuman</h3>
<form method="post">
  <input name="judul" placeholder="Judul">
  <textarea name="isi" placeholder="Isi"></textarea>
  <button>Simpan</button>
</form>

<?php while($r=$data->fetch_assoc()): ?>
  <div>
    <b><?= $r['judul'] ?></b><br>
    <?= $r['isi'] ?>
  </div>
<?php endwhile ?>
