// BEEP SETTINGS

const beepAudio = document.getElementById("beepAudio");
beepAudio.volume = 0.7;

let beepInterval = null;

function startBeep () {
  if (beepInterval) return;

  beepInterval = setInterval(() => {
    beepAudio.currentTime = 0;
    beepAudio.play().catch(() => {});
  }, 3000 );  //bunyi tiap 3 detik
}

function stopBeep() {
  clearInterval(beepInterval);
  beepInterval = null;
}

//  SETTINGS
const iqomahSetting = { subuh: 0.1, dzuhur: 8, ashar: 8, maghrib: 5, isya: 8 };
let iqomahTimer = null;
let slideInterval = null;

//  JAM REALTIME
function updateJam() {
  const now = new Date();
  const jamElement = document.getElementById("jam");
  if (jamElement) {
    jamElement.innerHTML = now.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  }
  
  // Update jam di header (tanpa detik)
  const currentTimeElement = document.querySelector(".current-time");
  if (currentTimeElement) {
    currentTimeElement.innerHTML = now.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
}
setInterval(updateJam, 1000);
updateJam();

//  TANGGAL
function updateTanggal() {
  fetch("https://api.aladhan.com/v1/gToH")
    .then((r) => r.json())
    .then((h) => {
      const masehi = new Date().toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      const hijri = `${h.data.hijri.day} ${h.data.hijri.month.en} ${h.data.hijri.year} H`;
      const tanggalElement = document.getElementById("tanggal");
      if (tanggalElement) {
        tanggalElement.innerHTML = `${masehi}<br>${hijri}`;
      }
    });
}
updateTanggal();

//  JADWAL
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
      // Update untuk layout lama (jika ada)
      const elOld = document.querySelector(`#${key} .time`);
      if (elOld) elOld.innerText = jadwalHariIni[key];
      
      // Update untuk layout baru (kotak horizontal)
      const elNew = document.querySelector(`#${key} .prayer-time`);
      if (elNew) elNew.innerText = jadwalHariIni[key];
    }
  }
}
ambilJadwal();
setInterval(ambilJadwal, 3600000);

//  SLIDE UTAMA OTOMATIS
const slides = [
  document.getElementById("slideInfo"),
];
let currentSlide = 0;

function showSlide(index) {
  slides.forEach((s) => {
    if (s) s.classList.remove("active");
  });
  if (slides[index]) slides[index].classList.add("active");
}
function startSlideshow() {
  slideInterval = setInterval(() => {
    currentSlide = (currentSlide + 1) % slides.length;
    showSlide(currentSlide);
  }, 10000); // ganti tiap 10 detik
}
function stopSlideshow() {
  clearInterval(slideInterval);
}
// Jangan start slideshow otomatis, karena slideJadwal sekarang selalu terlihat
// startSlideshow();

//  HELPER
function formatWaktu(detik) {
  const m = String(Math.floor(detik / 60)).padStart(2, "0");
  const s = String(detik % 60).padStart(2, "0");
  return `${m}:${s}`;
}

// ADZAN + IQOMAH
function tampilkanSlide(id) {
  document
    .querySelectorAll(".slide, .slide-iqomah, .slide-adzan")
    .forEach((s) => s.classList.remove("active"));
  const slide = document.getElementById(id);
  if (slide) slide.classList.add("active");
  
  // Reset countdown header jika bukan slide iqomah
  if (id !== "slideIqomah") {
    const elHeader = document.getElementById("countdownIqomahHeader");
    if (elHeader) elHeader.innerHTML = "00:00";
  }
}

function tampilkanAdzan(sholat) {
  stopBeep();
  stopSlideshow();
  tampilkanSlide("slideAdzan");

  document.getElementById("judulAdzan").innerHTML =
    "ADZAN " + sholat.toUpperCase();

  setTimeout(() => {
    mulaiIqomah(sholat);
  }, 15000); // 15 detik adzan
}

function mulaiIqomah(sholat) {
  const menit = iqomahSetting[sholat];
  if (!menit) return;

  // tampilkan slide iqomah
  tampilkanSlide("slideIqomah");

  let sisaDetik = menit * 60;
  const el = document.getElementById("iqomahCountdown");
  const elHeader = document.getElementById("countdownIqomahHeader");
  document.getElementById("judulIqomah").innerHTML =
    "IQOMAH " + sholat.toUpperCase();

  clearInterval(iqomahTimer);
  iqomahTimer = setInterval(() => {
    const waktuFormat = formatWaktu(sisaDetik);
    if (el) el.innerHTML = waktuFormat;
    if (elHeader) elHeader.innerHTML = waktuFormat;

    if (sisaDetik <= 0) {
      clearInterval(iqomahTimer);
      if (el) el.innerHTML = "SHALAT DIMULAI";
      if (elHeader) elHeader.innerHTML = "00:00";

      // Setelah 1 menit, langsung kembalikan ke slideshow utama
      setTimeout(() => {
        // HIDE IQOMAH SLIDE
        document.getElementById("slideIqomah").classList.remove("active");

        // SLIDE AWAL
        currentSlide = 0;
        showSlide(currentSlide);

        // START SLIDE UTAMA
        startSlideshow();
        
        // Reset countdown header
        if (elHeader) elHeader.innerHTML = "00:00";
      }, 60000);
    }

    sisaDetik--;
  }, 1000);
}

// CEK WAKTU OTOMATIS
setInterval(() => {
  if (!jadwalHariIni) return;
  const now = new Date();
  const jam = String(now.getHours()).padStart(2, "0");
  const menit = String(now.getMinutes()).padStart(2, "0");
  const sekarang = `${jam}:${menit}`;
  for (const sholat in iqomahSetting) {
    if (jadwalHariIni[sholat] === sekarang) {
      tampilkanAdzan(sholat);
    }
  }
}, 1000);

// TAHUN
document.getElementById("tahun").innerHTML = new Date().getFullYear();

function updateNextSholat() {
  if (!jadwalHariIni) return;

  const now = new Date();
  let next = null;

  // HAPUS highlight lama
  document
    .querySelectorAll(".row-sholat")
    .forEach((el) => el.classList.remove("next"));
  document
    .querySelectorAll(".prayer-box")
    .forEach((el) => el.classList.remove("next", "active"));

  // Tentukan sholat aktif berdasarkan waktu sekarang
  const nowTime = now.getHours() * 60 + now.getMinutes();
  let activeSholat = null;
  const sholatOrder = ["imsak", "subuh", "dzuhur", "ashar", "maghrib", "isya"];
  
  for (let i = 0; i < sholatOrder.length; i++) {
    const s = sholatOrder[i];
    if (!jadwalHariIni[s]) continue;
    
    const [h, m] = jadwalHariIni[s].split(":").map(Number);
    const waktuSholat = h * 60 + m;
    
    // Cek sholat berikutnya
    let waktuSholatNext = null;
    if (i < sholatOrder.length - 1) {
      const sNext = sholatOrder[i + 1];
      if (jadwalHariIni[sNext]) {
        const [hNext, mNext] = jadwalHariIni[sNext].split(":").map(Number);
        waktuSholatNext = hNext * 60 + mNext;
      }
    } else {
      // Jika isya, sholat berikutnya adalah imsak besok
      const sNext = sholatOrder[0];
      if (jadwalHariIni[sNext]) {
        const [hNext, mNext] = jadwalHariIni[sNext].split(":").map(Number);
        waktuSholatNext = (hNext + 24) * 60 + mNext; // +24 jam untuk besok
      }
    }
    
    // Jika waktu sekarang >= waktu sholat ini dan < waktu sholat berikutnya
    if (waktuSholat <= nowTime && (waktuSholatNext === null || nowTime < waktuSholatNext)) {
      activeSholat = s;
      break;
    }
  }
  
  // Highlight sholat aktif
  if (activeSholat) {
    const activeBox = document.getElementById(activeSholat);
    if (activeBox) activeBox.classList.add("active");
  }

  for (let s of ["subuh", "dzuhur", "ashar", "maghrib", "isya"]) {
    if (!jadwalHariIni[s]) continue;

    const [h, m] = jadwalHariIni[s].split(":").map(Number);
    const waktu = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      h,
      m,
      0
    );

    if (waktu > now) {
      next = { nama: s, time: waktu };
      break;
    }
  }

  // Kalau lewat Isya → Subuh besok
  if (!next) {
    const [h, m] = jadwalHariIni.subuh.split(":").map(Number);
    const besok = new Date(now);
    besok.setDate(now.getDate() + 1);
    besok.setHours(h, m, 0);
    next = { nama: "subuh", time: besok };
  }
  
  // const diff = 30; // bakal test
  

  const diff = Math.floor((next.time - now) / 1000);

  const hh = String(Math.floor(diff / 3600)).padStart(2, "0");
  const mm = String(Math.floor((diff % 3600) / 60)).padStart(2, "0");
  const ss = String(diff % 60).padStart(2, "0");

  // Update tampilan
  document.getElementById("nextSholatNama").innerText = next.nama.toUpperCase();
  document.getElementById("nextSholatTime").innerText =
    next.time.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  document.getElementById(
    "nextSholatCountdown"
  ).innerText = `${hh}:${mm}:${ss}`;

  // Highlight row sholat (layout lama)
  const row = document.getElementById(next.nama);
  if (row) row.classList.add("next");
  
  // Highlight kotak sholat (layout baru) - hanya jika bukan sholat aktif
  if (!activeSholat || activeSholat !== next.nama) {
    const prayerBox = document.getElementById(next.nama);
    if (prayerBox) prayerBox.classList.add("next");
  }

  // Countdown merah < 10 menit
  const cd = document.getElementById("nextSholatCountdown");
  if (diff <= 60 && diff > 0) {
    cd.classList.remove("countdown-warning"); 
    void cd.offsetWidth;
    cd.classList.add("countdown-warning");
  } else {
    cd.classList.remove("countdown-warning");
  }

  // BEEP 1 MENIT SEBELUM ADZAN
if (diff <= 60 && diff > 0) {
  startBeep();
} else {
  stopBeep();
}

}

setInterval(updateNextSholat, 1000);