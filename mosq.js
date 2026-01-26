document.addEventListener("DOMContentLoaded", () => {
  /* ================= AUDIO ================= */
  const beepAudio = document.getElementById("beepAudio");
  beepAudio.volume = 0.7;

  let beepInterval = null;

  function startBeep() {
    if (beepInterval) return; // sudah bunyi, jangan dobel

    beepInterval = setInterval(() => {
      beepAudio.currentTime = 0;
      beepAudio.play().catch(() => { });
    }, 2500); // beep tiap 2.5 detik
  }

  function stopBeep() {
    if (beepInterval) {
      clearInterval(beepInterval);
      beepInterval = null;
    }
  }


  window.testAdzan = function (sholat) {
    tampilkanAdzan(sholat);
  };


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

    try {
      const res = await fetch(
        `https://api.myquran.com/v2/sholat/jadwal/1403/${y}/${m}/${t}`,
      );
      const data = await res.json();

      if (data.status) {
        jadwalHariIni = data.data.jadwal;
        const urutan = ["imsak", "subuh", "dzuhur", "ashar", "maghrib", "isya"];

        urutan.forEach((s) => {
          const elCard = document.querySelector(`#${s} h3`);
          if (elCard) {
            elCard.innerText = jadwalHariIni[s];
          }
        });
      }
    } catch (error) {
      console.error("Gagal mengambil jadwal:", error);
    }
  }
  ambilJadwal();
  setInterval(ambilJadwal, 3600000);

  /* ================= ADZAN ================= */
  function tampilkanAdzan(sholat) {
    adzanAktif = true;
    stopBeep();

    // Tampilkan Overlay Adzan di dalam kartu biru
    document.getElementById("slideAdzan").style.display = "block";
    document.getElementById("judulAdzan").innerText =
      "ADZAN " + sholat.toUpperCase();

    // Sembunyikan countdown normal di kiri
    document.getElementById("normalCountdown").style.display = "none";

    setTimeout(() => {
      document.getElementById("slideAdzan").style.display = "none";
      mulaiIqomah(sholat);
    }, 15000); // 15 detik tampilan adzan
  }

  /* ================= IQOMAH ================= */
  function mulaiIqomah(sholat) {
    mode = "iqomah";

    const menit = IQOMAH[sholat] || 10;

    iqomahTarget = new Date(Date.now() + menit * 60000);

    document.getElementById("iqomahSection").style.display = "block";
    document.getElementById("normalCountdown").style.display = "none";
  }

  /* ================= COUNTDOWN ================= */

  function updateCountdown() {
    const now = new Date();
    const cdNormal = document.getElementById("countdownTimer");
    const cdIqomah = document.getElementById("nextSholatCountdown");

    if (mode === "iqomah") {
      let diff = Math.floor((iqomahTarget - now) / 1000);
      diff = Math.max(0, diff);

      const m = String(Math.floor(diff / 60)).padStart(2, "0");
      const s = String(diff % 60).padStart(2, "0");
      cdIqomah.innerText = `${m}:${s}`;

      cdIqomah.classList.toggle("blink-red", diff <= 60);

      // 🔔 BEEP IQOMAH (10 DETIK TERAKHIR)
      if (diff <= 10 && diff > 0) {
        startBeep();
      } else {
        stopBeep();
      }

      if (diff === 0) {
        stopBeep();
        selesaiIqomah();
      }
      return;
    }

    /* ===== MODE ADZAN (NORMAL) ===== */
    if (!jadwalHariIni.subuh || adzanAktif) return;

    const nowMin = now.getHours() * 60 + now.getMinutes();
    const urutan = ["imsak", "subuh", "dzuhur", "ashar", "maghrib", "isya"];
    let next = "subuh";

    // Tentukan sholat berikutnya
    for (let s of urutan) {
      const [h, m] = jadwalHariIni[s].split(":").map(Number);
      if (nowMin < h * 60 + m) {
        next = s;
        break;
      }
    }

    document.querySelectorAll(".prayer-card").forEach((el) => {
      el.classList.remove("next");
    });

    const boxNext = document.getElementById(next);
    if (boxNext) {
      boxNext.classList.add("next");
    }

    const [nh, nm] = jadwalHariIni[next].split(":").map(Number);
    let target = new Date();
    target.setHours(nh, nm, 0, 0);

    if (next === "subuh" && nowMin > nh * 60 + nm) {
      target.setDate(target.getDate() + 1);
    }

    let diff = Math.max(0, Math.floor((target - now) / 1000));

    if (cdNormal) {
      cdNormal.innerText = new Date(diff * 1000).toISOString().substr(11, 8);
      cdNormal.classList.toggle("blink-red", diff <= 60);
    }

    const elNama = document.getElementById("nextSholatNama");
    if (elNama) elNama.innerText = "MENUJU " + next.toUpperCase();

    if (diff <= 60 && diff > 0) startBeep();
    else stopBeep();

    if (diff === 0) tampilkanAdzan(next);
  }

  setInterval(updateCountdown, 1000);

  function selesaiIqomah() {
    stopBeep();
    mode = "adzan";
    adzanAktif = false;
    document.getElementById("iqomahSection").style.display = "none";
    document.getElementById("normalCountdown").style.display = "block";
  }


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

  const pesan = [
    "Matikan / silent HP sebelum sholat",
    "Luruskan shaf dan rapatkan barisan",
    "Perbanyak sholawat kepada Nabi ﷺ",
    "Datang lebih awal, pahalanya lebih besar",
    "Sholat berjamaah lebih utama 27 derajat",
  ];

  let pesanIndex = 0;
  setInterval(() => {
    const marquee = document.getElementById("marqueeText");
    if (marquee) {
      marquee.innerText = pesan[pesanIndex];
      pesanIndex = (pesanIndex + 1) % pesan.length;
    }
  }, 30000);

});
