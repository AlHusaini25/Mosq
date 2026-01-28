document.addEventListener("DOMContentLoaded", () => {

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

  // ================= JAM & TANGGAL =================
  function updateJam() {
    const now = new Date();
    document.getElementById("jam").innerText =
      now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  }
  setInterval(updateJam, 1000);
  updateJam();

  fetch("https://api.aladhan.com/v1/gToH")
    .then(r => r.json())
    .then(h => {
      const masehi = new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
      document.getElementById("tanggal").innerHTML = `${masehi}<br>${h.data.hijri.day} ${h.data.hijri.month.en} ${h.data.hijri.year} H`;
    });

  // ================= JADWAL SHOLAT =================
  let jadwalHariIni = {};
  let mode = "NORMAL"; // NORMAL | ADZAN | IQOMAH
  let iqomahTarget = null;

  const IQOMAH = { subuh: 0.3, dzuhur: 8, ashar: 8, maghrib: 5, isya: 8 };

  async function ambilJadwal() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const t = String(d.getDate()).padStart(2, "0");

    try {
      const res = await fetch(`https://api.myquran.com/v2/sholat/jadwal/1403/${y}/${m}/${t}`);
      const data = await res.json();
      if (data.status) {
        jadwalHariIni = data.data.jadwal;
        ["imsak", "subuh", "dzuhur", "ashar", "maghrib", "isya"].forEach(s => {
          const el = document.querySelector(`#${s} .prayer-time`);
          if (el) el.innerText = jadwalHariIni[s];
        });
      }
    } catch (e) {
      console.error("Gagal ambil jadwal", e);
    }
  }

  ambilJadwal();
  setInterval(ambilJadwal, 3600000);

  // ================= HIGHLIGHT =================
  function clearHighlight() {
    document.querySelectorAll(".prayer-card").forEach(el => el.classList.remove("next", "active"));
  }

  function highlightNext(sholat) {
    clearHighlight();
    document.getElementById(sholat)?.classList.add("next");
  }

  function highlightActive(sholat) {
    clearHighlight();
    document.getElementById(sholat)?.classList.add("active");
  }

  // ================= ADZAN =================
  function tampilkanAdzan(sholat) {
    mode = "ADZAN";
    beepStop();
    highlightActive(sholat);

    document.getElementById("slideAdzan").style.display = "flex";
    document.getElementById("judulAdzan").innerText = "ADZAN " + sholat.toUpperCase();

    document.getElementById("normalCountdown").style.display = "none";
    document.getElementById("iqomahSection").style.display = "none";

    // tampilkan nama imam
    updateImam(sholat);

    setTimeout(() => {
      document.getElementById("slideAdzan").style.display = "none";
      mulaiIqomah(sholat);
    }, 15000);
  }
  window.testAdzan = tampilkanAdzan;

  // ================= IQOMAH =================
  function mulaiIqomah(sholat) {
    mode = "IQOMAH";
    iqomahTarget = new Date(Date.now() + (IQOMAH[sholat] || 10) * 60000);
    document.getElementById("iqomahSection").style.display = "flex";
    document.getElementById("normalCountdown").style.display = "none";
    highlightActive(sholat);
  }

  function selesaiIqomah() {
    beepStop();
    mode = "NORMAL";
    iqomahTarget = null;

    // hide iqomah, show normal countdown
    document.getElementById("iqomahSection").style.display = "none";
    document.getElementById("normalCountdown").style.display = "flex";

    // hilangkan nama imam
    document.getElementById("imamNama").innerText = "-";

    // refresh countdown normal
    updateCountdown();
  }

  // ================= COUNTDOWN UTAMA =================
  function updateCountdown() {
    const now = new Date();

    if (mode === "IQOMAH" && iqomahTarget) {
      let diff = Math.max(0, Math.floor((iqomahTarget - now) / 1000));
      const m = String(Math.floor(diff / 60)).padStart(2, "0");
      const s = String(diff % 60).padStart(2, "0");
      document.getElementById("nextSholatCountdown").innerText = `${m}:${s}`;
      diff <= 10 && diff > 0 ? beepStart() : beepStop();
      if (diff === 0) selesaiIqomah();
      return;
    }

    if (!jadwalHariIni.subuh || mode !== "NORMAL") return;

    const nowMin = now.getHours() * 60 + now.getMinutes();
    const urutan = ["subuh", "dzuhur", "ashar", "maghrib", "isya"];
    let next = urutan.find(s => {
      const [h, m] = jadwalHariIni[s].split(":").map(Number);
      return nowMin < h * 60 + m;
    }) || "subuh";

    // highlight waktu sholat saat ini
    clearHighlight();
    document.getElementById(next)?.classList.add("next");

    const [nh, nm] = jadwalHariIni[next].split(":").map(Number);
    const target = new Date();
    target.setHours(nh, nm, 0, 0);
    if (next === "subuh" && nowMin > 1200) target.setDate(target.getDate() + 1);

    const diff = Math.max(0, Math.floor((target - now) / 1000));
    document.getElementById("countdownTimer").innerText =
      new Date(diff * 1000).toISOString().substr(11, 8);
    document.getElementById("nextSholatNama").innerText = "MENUJU " + next.toUpperCase();

    diff <= 60 && diff > 0 ? beepStart() : beepStop();

    if (diff === 0) tampilkanAdzan(next);
  }
  setInterval(updateCountdown, 1000);

  // ================= IMAM =================
  async function updateImam(sholat) {
    try {
      const res = await fetch("api/imam.php?sholat=" + sholat);
      const data = await res.json();
      document.getElementById("imamNama").innerText = data.imam ?? "-";
    } catch (err) {
      console.error("Gagal load imam", err);
      document.getElementById("imamNama").innerText = "-";
    }
  }
  window.updateImam = updateImam;
});
