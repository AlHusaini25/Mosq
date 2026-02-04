document.addEventListener("DOMContentLoaded", () => {

  /* ================= ELEMENT ================= */
  const jamEl = document.getElementById("jam");
  const statusWaktu = document.getElementById("statusWaktu");

  const imamBox = document.getElementById("imamBox");
  const imamNama = document.getElementById("imamNama");

  const slideAdzan = document.getElementById("slideAdzan");
  const judulAdzan = document.getElementById("judulAdzan");

  const iqomahSection = document.getElementById("iqomahSection");
  const nextSholatCountdown = document.getElementById("nextSholatCountdown");

  const normalCountdown = document.getElementById("normalCountdown");
  const nextSholatNama = document.getElementById("nextSholatNama");
  const countdownTimer = document.getElementById("countdownTimer");

  const beepAudio = document.getElementById("beepAudio");

  /* ================= STATE ================= */
  let mode = "NORMAL"; // NORMAL | ADZAN | IQOMAH
  let iqomahTarget = null;
  let jadwalHariIni = {};
  let beepInterval = null;

  /* ================= KONFIG ================= */
  const IQOMAH = {
    subuh: 1,
    dzuhur: 8,
    ashar: 8,
    maghrib: 5,
    isya: 8
  };

  /* ================= STATUS WAKTU ================= */
  function setStatus(type) {
    statusWaktu.className = "status-waktu";

    if (type === "BELUM") {
      statusWaktu.classList.add("belum");
      statusWaktu.innerText = "● BELUM MASUK WAKTU";
    }

    if (type === "MASUK") {
      statusWaktu.classList.add("masuk");
      statusWaktu.innerText = "● SUDAH MASUK WAKTU";
    }

    if (type === "IQOMAH") {
      statusWaktu.classList.add("iqomah");
      statusWaktu.innerText = "● MENUJU IQOMAH";
    }
  }

  /* ================= MODE UI ================= */
  function setMode(newMode) {
    mode = newMode;

    slideAdzan.style.display = "none";
    iqomahSection.style.display = "none";
    normalCountdown.style.display = "none";
    imamBox.style.display = "none";

    if (newMode === "NORMAL") {
      normalCountdown.style.display = "block";
      setStatus("BELUM");
    }

    if (newMode === "ADZAN") {
      slideAdzan.style.display = "flex";
      imamBox.style.display = "block";
      setStatus("MASUK");
    }

    if (newMode === "IQOMAH") {
      iqomahSection.style.display = "block";
      imamBox.style.display = "block";
      setStatus("IQOMAH");
    }
  }

  setMode("NORMAL");

  /* ================= JAM ================= */
  function updateJam() {
    jamEl.innerText = new Date().toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit"
    });
  }
  setInterval(updateJam, 1000);
  updateJam();

  /* ================= BEEP ================= */
  function beepStart() {
    if (beepInterval) return;
    beepInterval = setInterval(() => {
      beepAudio.currentTime = 0;
      beepAudio.play().catch(() => {});
    }, 2500);
  }

  function beepStop() {
    clearInterval(beepInterval);
    beepInterval = null;
  }

  /* ================= JADWAL SHOLAT ================= */
  async function ambilJadwal() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const t = String(d.getDate()).padStart(2, "0");

    try {
      const res = await fetch(
        `https://api.myquran.com/v2/sholat/jadwal/1403/${y}/${m}/${t}`
      );
      const json = await res.json();
      if (json.status) jadwalHariIni = json.data.jadwal;
    } catch (e) {
      console.error("Gagal ambil jadwal", e);
    }
  }

  ambilJadwal();
  setInterval(ambilJadwal, 3600000);

  /* ================= HIGHLIGHT ================= */
  function clearHighlight() {
    document
      .querySelectorAll(".prayer-card")
      .forEach(el => el.classList.remove("next", "active"));
  }

  function highlightActive(sholat) {
    clearHighlight();
    document.getElementById(sholat)?.classList.add("active");
  }

  function highlightNext(sholat) {
    clearHighlight();
    document.getElementById(sholat)?.classList.add("next");
  }

  /* ================= IMAM ================= */
  async function loadImam(sholat) {
    try {
      const res = await fetch(`api/imam.php?sholat=${sholat}`);
      const data = await res.json();
      imamNama.innerText = data.imam ?? "-";
    } catch {
      imamNama.innerText = "-";
    }
  }

  /* ================= ADZAN ================= */
  function tampilkanAdzan(sholat) {
    setMode("ADZAN");
    beepStop();

    highlightActive(sholat);
    judulAdzan.innerText = "ADZAN " + sholat.toUpperCase();
    loadImam(sholat);

    setTimeout(() => {
      mulaiIqomah(sholat);
    }, 15000);
  }

  window.testAdzan = tampilkanAdzan;

  /* ================= IQOMAH ================= */
  function mulaiIqomah(sholat) {
    setMode("IQOMAH");
    iqomahTarget = new Date(Date.now() + IQOMAH[sholat] * 60000);
  }

  function selesaiIqomah() {
    beepStop();
    iqomahTarget = null;
    setMode("NORMAL");

    // refresh bersih (TV-safe)
    setTimeout(() => location.reload(), 800);
  }

  /* ================= COUNTDOWN ================= */
  function updateCountdown() {
    const now = new Date();

    // IQOMAH
    if (mode === "IQOMAH" && iqomahTarget) {
      const diff = Math.max(0, Math.floor((iqomahTarget - now) / 1000));
      nextSholatCountdown.innerText =
        `${String(Math.floor(diff / 60)).padStart(2, "0")}:${String(diff % 60).padStart(2, "0")}`;

      diff <= 10 && diff > 0 ? beepStart() : beepStop();
      if (diff === 0) selesaiIqomah();
      return;
    }

    if (!jadwalHariIni.subuh || mode !== "NORMAL") return;

    const nowMin = now.getHours() * 60 + now.getMinutes();
    const urutan = ["subuh", "dzuhur", "ashar", "maghrib", "isya"];

    let next =
      urutan.find(s => {
        const [h, m] = jadwalHariIni[s].split(":").map(Number);
        return nowMin < h * 60 + m;
      }) || "subuh";

    highlightNext(next);

    const [h, m] = jadwalHariIni[next].split(":").map(Number);
    const target = new Date();
    target.setHours(h, m, 0, 0);
    if (next === "subuh" && nowMin > 1200) target.setDate(target.getDate() + 1);

    const diff = Math.floor((target - now) / 1000);
    countdownTimer.innerText =
      new Date(diff * 1000).toISOString().substr(11, 8);

    nextSholatNama.innerText = "MENUJU " + next.toUpperCase();

    diff <= 60 && diff > 0 ? beepStart() : beepStop();
    if (diff === 0) tampilkanAdzan(next);
  }

  setInterval(updateCountdown, 1000);
});
