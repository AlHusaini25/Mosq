document.addEventListener("DOMContentLoaded", () => {
  /* ================= AUDIO ================= */
  const beepAudio = document.getElementById("beepAudio");
  beepAudio.volume = 0.7;

  let beepInterval = null;

  function beepStart() {
    if (beepInterval) return;
    beepInterval = setInterval(() => {
      beepAudio.currentTime = 0;
      beepAudio.play().catch(() => { });
    }, 2500);
  }

  function beepStop() {
    clearInterval(beepInterval);
    beepInterval = null;
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
  let mode = "NORMAL"; // normal | adzan | iqomah
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
    mode = "ADZAN";
    adzanAktif = true;
    beepStop();

    // Tampilkan Overlay Adzan di dalam kartu biru
    document.getElementById("slideAdzan").style.display = "block";
    document.getElementById("judulAdzan").innerText =
      "ADZAN " + sholat.toUpperCase();

    // Sembunyikan countdown normal di kiri
    document.getElementById("normalCountdown").style.display = "none";
    document.getElementById("iqomahSection").style.display = "none";

    highlightActive(sholat);

    setTimeout(() => {
      document.getElementById("slideAdzan").style.display = "none";
      mulaiIqomah(sholat);
    }, 15000); // 15 detik tampilan adzan
  }

  function highlightActive(sholat) {
    document.querySelectorAll(".prayer-card").forEach(el => {
      el.classList.remove("next", "active");
    });

    const el = document.getElementById(sholat);
    if (el) el.classList.add("active");
  }


  /* ================= IQOMAH ================= */
  function mulaiIqomah(sholat) {
    mode = "IQOMAH";

    const menit = IQOMAH[sholat] || 10;
    iqomahTarget = new Date(Date.now() + menit * 60000);

    document.getElementById("iqomahSection").style.display = "block";
    document.getElementById("normalCountdown").style.display = "none";
  }

  /* ================= COUNTDOWN ================= */
  function updateCountdown() {
    const now = new Date();

    /* ===== IQOMAH ===== */
    if (mode === "IQOMAH") {
      let diff = Math.max(0, Math.floor((iqomahTarget - now) / 1000));

      const m = String(Math.floor(diff / 60)).padStart(2, "0");
      const s = String(diff % 60).padStart(2, "0");
      document.getElementById("nextSholatCountdown").innerText = `${m}:${s}`;

      diff <= 10 && diff > 0 ? beepStart() : beepStop();

      if (diff === 0) selesaiIqomah();
      return;
    }

    /* ===== NORMAL ===== */
    if (!jadwalHariIni.subuh || mode !== "NORMAL") return;

    const nowMin = now.getHours() * 60 + now.getMinutes();
    const urutan = ["imsak", "subuh", "dzuhur", "ashar", "maghrib", "isya"];

    let next = urutan.find(s => {
      const [h, m] = jadwalHariIni[s].split(":").map(Number);
      return nowMin < h * 60 + m;
    }) || "subuh";

    document.querySelectorAll(".prayer-card").forEach(el => {
      el.classList.remove("next");
    });

    document.getElementById(next)?.classList.add("next");

    const [nh, nm] = jadwalHariIni[next].split(":").map(Number);
    const target = new Date();
    target.setHours(nh, nm, 0, 0);

    let diff = Math.max(0, Math.floor((target - now) / 1000));

    document.getElementById("countdownTimer").innerText =
      new Date(diff * 1000).toISOString().substr(11, 8);

    document.getElementById("nextSholatNama").innerText =
      "MENUJU " + next.toUpperCase();

    diff <= 60 && diff > 0 ? beepStart() : beepStop();

    if (diff === 0) tampilkanAdzan(next);
  }

  setInterval(updateCountdown, 1000);

  function selesaiIqomah() {
    beepStop();
    mode = "NORMAL";
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
  }, 22240);
  async function loadSlide() {
    const res = await fetch("api/slide.php");
    const data = await res.json();

    let i = 0;
    setInterval(() => {
      if (!data.length) return;
      document.querySelector(".illustration-card").innerHTML = `
      <h2>${data[i].judul}</h2>
      <p>${data[i].isi}</p>
    `;
      i = (i + 1) % data.length;
    }, 15000);
  }
  loadSlide();


});
