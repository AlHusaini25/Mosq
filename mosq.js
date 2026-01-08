/* =====================
   SETTING IQOMAH (MENIT)
===================== */
const iqomahSetting = {
  subuh: 0.1,
  dzuhur: 8,
  ashar: 8,
  maghrib: 5,
  isya: 8
};

/* =====================
   JAM REALTIME
===================== */
function updateJam() {
  const now = new Date();
  document.getElementById("jam").innerHTML =
    now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}
setInterval(updateJam, 1000);
updateJam();

/* =====================
   TANGGAL
===================== */
function updateTanggal() {
  fetch("https://api.aladhan.com/v1/gToH")
    .then(r => r.json())
    .then(h => {
      const masehi = new Date().toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      const hijri = `${h.data.hijri.day} ${h.data.hijri.month.en} ${h.data.hijri.year} H`;
      document.getElementById("tanggal").innerHTML = `${masehi} | ${hijri}`;
    });
}
updateTanggal();

/* =====================
   JADWAL SHOLAT
===================== */
let jadwalHariIni = {};

async function ambilJadwal() {
  const ID_BATANG = "1403";
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const t = String(d.getDate()).padStart(2, "0");

  const url = `https://api.myquran.com/v2/sholat/jadwal/${ID_BATANG}/${y}/${m}/${t}`;
  const res = await fetch(url);
  const data = await res.json();

  if (data.status) {
    jadwalHariIni = data.data.jadwal;
    for (const key in jadwalHariIni) {
      const el = document.querySelector(`#${key} .time`);
      if (el) el.innerText = jadwalHariIni[key];
    }
  }
}
ambilJadwal();
setInterval(ambilJadwal, 3600000);

/* =====================
   SLIDE CONTROL
===================== */
const slides = document.querySelectorAll(".slide");
let slideIndex = 0;
let slideInterval = null;

function startSlideshow() {
  slideInterval = setInterval(() => {
    slides.forEach(s => s.classList.remove("active"));
    slideIndex = (slideIndex + 1) % slides.length;
    slides[slideIndex].classList.add("active");
  }, 15000);
}
function stopSlideshow() { clearInterval(slideInterval); }
startSlideshow();

/* =====================
   HELPER FORMAT WAKTU
===================== */
function formatWaktu(detik) {
  const m = String(Math.floor(detik / 60)).padStart(2, "0");
  const s = String(detik % 60).padStart(2, "0");
  return `${m}:${s}`;
}

/* =====================
   IQOMAH COUNTDOWN
===================== */
let iqomahTimer = null;
let iqomahAktif = false;

function tampilkanIqomah() {
  stopSlideshow();
  slides.forEach(s => s.classList.remove("active"));
  document.getElementById("slideIqomah").classList.add("active");
}

function kembaliNormal() {
  document.getElementById("slideIqomah").classList.remove("active");
  document.getElementById("slideJadwal").classList.add("active");
  startSlideshow();
}

function mulaiIqomah(namaSholat) {
  if (iqomahAktif) return;
  const menit = iqomahSetting[namaSholat];
  if (!menit) return;

  iqomahAktif = true;
  tampilkanIqomah();

  let sisaDetik = menit * 60;
  const el = document.getElementById("iqomahCountdown");
  const judul = document.getElementById("judulIqomah");
  judul.innerHTML = "IQOMAH " + namaSholat.toUpperCase();

  iqomahTimer = setInterval(() => {
    el.innerHTML = formatWaktu(sisaDetik);

    if (sisaDetik <= 0) {
      clearInterval(iqomahTimer);
      el.innerHTML = "SHALAT DIMULAI";

      setTimeout(() => {
        iqomahAktif = false;
        kembaliNormal();
      }, 60000);
    }
    sisaDetik--;
  }, 1000);
}

/* =====================
   CEK WAKTU SHOLAT
===================== */
function cekMasukWaktuSholat() {
  if (!jadwalHariIni) return;

  const now = new Date();
  const jam = String(now.getHours()).padStart(2, "0");
  const menit = String(now.getMinutes()).padStart(2, "0");
  const sekarang = `${jam}:${menit}`;

  for (const sholat in iqomahSetting) {
    if (jadwalHariIni[sholat] === sekarang) {
      mulaiIqomah(sholat);
    }
  }
}
setInterval(cekMasukWaktuSholat, 1000);

/* =====================
   TAHUN
===================== */
document.getElementById("tahun").innerHTML = new Date().getFullYear();

