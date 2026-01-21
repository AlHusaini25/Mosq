document.addEventListener("DOMContentLoaded", () => {
  /* ================= AUDIO ================= */
  const beepAudio = document.getElementById("beepAudio");
  if (beepAudio) beepAudio.volume = 0.7;
  let beepInterval = null;

  // ===== TEST ADZAN MANUAL =====
window.testAdzan = function(sholat) {
  // langsung tampilkan adzan
  tampilkanAdzan(sholat);
};


  function startBeep() {
    if (beepInterval) return;
    beepInterval = setInterval(() => {
      beepAudio.currentTime = 0;
      beepAudio.play().catch(() => {});
    }, 3000);
  }

  function stopBeep() {
    clearInterval(beepInterval);
    beepInterval = null;
  }

  /* ================= JAM ================= */
  function updateJam() {
    const now = new Date();
    document.getElementById("jam").innerText = now.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  setInterval(updateJam, 1000);
  updateJam();

  /* ================= TANGGAL ================= */
  fetch("https://api.aladhan.com/v1/gToH")
    .then((r) => r.json())
    .then((h) => {
      const masehi = new Date().toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      document.getElementById("tanggal").innerHTML =
        `${masehi}<br>${h.data.hijri.day} ${h.data.hijri.month.en} ${h.data.hijri.year} H`;
    });

  /* ================= JADWAL SHOLAT ================= */
  let jadwalHariIni = {};
  let mode = "adzan"; // adzan | iqomah
  let adzanAktif = false;
  let iqomahTarget = null;

  const IQOMAH = {
    subuh: 5,
    dzuhur: 8,
    ashar: 8,
    maghrib: 5,
    isya: 8,
  };

  async function ambilJadwal() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const t = String(d.getDate()).padStart(2, "0");

    const res = await fetch(
      `https://api.myquran.com/v2/sholat/jadwal/1403/${y}/${m}/${t}`,
    );
    const data = await res.json();

    if (data.status) {
      jadwalHariIni = data.data.jadwal;
      ["imsak", "subuh", "dzuhur", "ashar", "maghrib", "isya"].forEach((s) => {
        document.querySelector(`#${s} .prayer-time`).innerText =
          jadwalHariIni[s];
      });
    }
  }

  ambilJadwal();
  setInterval(ambilJadwal, 3600000);

  /* ================= ADZAN ================= */
  function tampilkanAdzan(sholat) {
    adzanAktif = true;
    stopBeep();

    document.getElementById("slideAdzan").classList.add("active");
    document.getElementById("judulAdzan").innerText =
      "ADZAN " + sholat.toUpperCase();

    setTimeout(() => {
      document.getElementById("slideAdzan").classList.remove("active");
      mulaiIqomah(sholat);
    }, 15000);
  }

  /* ================= IQOMAH ================= */
  function mulaiIqomah(sholat) {
    mode = "iqomah";
    iqomahTarget = new Date(Date.now() + IQOMAH[sholat] * 60000);

    document.getElementById("nextSholatNama").innerText = "MENUJU IQOMAH";
    document.getElementById("nextSholatTime").innerText = "";
  }

  function selesaiIqomah() {
    mode = "adzan";
    adzanAktif = false;
    iqomahTarget = null;

    document.getElementById("nextSholatNama").innerText = "-";
    document.getElementById("nextSholatCountdown").innerText = "00:00:00";
  }

  /* ================= COUNTDOWN ================= */
  function updateCountdown() {
    const now = new Date();

    /* ===== MODE IQOMAH ===== */
    if (mode === "iqomah") {
      let diff = Math.floor((iqomahTarget - now) / 1000);
      diff = Math.max(0, diff);

      const cd = document.getElementById("nextSholatCountdown");
      cd.innerText = new Date(diff * 1000).toISOString().substr(11, 8);

      cd.classList.toggle("blink-red", diff <= 60);

      if (diff === 0) selesaiIqomah();
      return;
    }

    /* ===== MODE ADZAN ===== */
    if (!jadwalHariIni.subuh || adzanAktif) return;

    const nowMin = now.getHours() * 60 + now.getMinutes();
    const urutan = ["imsak", "subuh", "dzuhur", "ashar", "maghrib", "isya"];
    let next = "subuh";

    // Hapus highlight sebelumnya
    document.querySelectorAll(".prayer-box").forEach((el) => {
      el.classList.remove("next");
    });

    // Tentukan sholat berikutnya
    for (let s of urutan) {
      const [h, m] = jadwalHariIni[s].split(":").map(Number);
      if (nowMin < h * 60 + m) {
        next = s;
        break;
      }
    }

    // Tambahkan highlight pada kotak sholat berikutnya
    const boxNext = document.getElementById(next);
    if (boxNext) boxNext.classList.add("next");

    const [nh, nm] = jadwalHariIni[next].split(":").map(Number);
    let target = new Date();
    target.setHours(nh, nm, 0);
    if (next === "subuh" && nowMin > 1200) target.setDate(target.getDate() + 1);

    let diff = Math.max(0, Math.floor((target - now) / 1000));

    document.getElementById("nextSholatNama").innerText = next.toUpperCase();
    document.getElementById("nextSholatTime").innerText =
      target.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      });
    document.getElementById("nextSholatCountdown").innerText = new Date(
      diff * 1000,
    )
      .toISOString()
      .substr(11, 8);

    if (diff <= 60 && diff > 0) startBeep();
    else stopBeep();

    if (diff === 0) tampilkanAdzan(next);
  }

  setInterval(updateCountdown, 1000);

  /* ================= JUMAT MODE ================= */
  function updateJumatMode() {
    const now = new Date();
    const hari = now.getDay(); // 5 = Jumat
    const jamMenit = now.getHours() * 60 + now.getMinutes();

    const boxDzuhur = document.getElementById("dzuhur");
    const labelDzuhur = boxDzuhur?.querySelector(".prayer-label");
    const marquee = document.querySelector("marquee");

    // Default
    boxDzuhur?.classList.remove("jumat");
    if (labelDzuhur) labelDzuhur.innerText = "DHUHUR";

    // Jumat
    if (hari === 5) {
      // Aktif dari Subuh s.d Ashar
      if (jamMenit < 15 * 60) {
        boxDzuhur?.classList.add("jumat");
        if (labelDzuhur) labelDzuhur.innerText = "JUMAT";

        if (marquee) {
          marquee.innerText =
            "Hari ini SHOLAT JUMAT • Mohon datang lebih awal • Matikan / silent HP • Perbanyak sholawat";
        }
      }
    }
  }

  setInterval(updateJumatMode, 60000);
  updateJumatMode();
  // ===== TEST ADZAN MANUAL =====
  function testAdzan(sholat) {
    // langsung tampilkan adzan
    tampilkanAdzan(sholat);
  }
  
  // Contoh pemakaian:
  // testAdzan("subuh");  // akan langsung tampil adzan Subuh + mulai iqomah
  // testAdzan("dzuhur"); // langsung adzan Dzuhur
});

