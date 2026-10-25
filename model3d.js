/* 3D modellar (<model-viewer>): hero va "3D ko'rik" bo'limi bir xil modeldan foydalanadi */
(function () {
  const hero = document.getElementById("hero3d");
  const heroMv = hero && hero.querySelector("model-viewer");
  const mv = document.getElementById("mv");

  // index.html fayldan (file://) ochilsa, model sahifa ichiga joylangan nusxadan olinadi
  if (location.protocol === "file:") {
    const s = document.createElement("script");
    s.src = "assets/models-data.js";
    s.onload = () => {
      if (heroMv) heroMv.src = window.DENTAL_MODELS.hero;
      if (mv) mv.src = window.DENTAL_MODELS.hero;
    };
    document.head.appendChild(s);
  }

  // Og'iz ochish/yopish: modelning ichidagi "open" animatsiyasi haqiqiy ijro bilan o'ynatiladi.
  // Ochilganda oxirgi kadrda to'xtab og'iz ochiq turadi; yopilganda teskari o'ynaladi va yopiq kadrda to'xtaydi.
  // onReady model yuklangach chaqiriladi (zaxira rasm yashiriladi, tugma ko'rsatiladi).
  function jaw(el, btn, onReady) {
    let isOpen = false;
    const setOpen = (v) => {
      isOpen = v;
      btn.textContent = v ? "Og'izni yopish" : "Og'izni ochish";
      el.animationName = "open";
      el.timeScale = v ? 1 : -1;
      el.play({ repetitions: 1 });
    };
    const ready = () => {
      try {
        el.animationName = "open"; el.timeScale = 1; el.pause(); el.currentTime = 0;
      } catch (e) { return; }
      isOpen = false;
      btn.hidden = false;
      onReady();
    };
    if (el.loaded) ready(); else el.addEventListener("load", ready, { once: true });

    btn.addEventListener("click", () => setOpen(!isOpen));
    // modelga bosish = ochish/yopish; sudrash (aylantirish) bosish hisoblanmaydi
    let down = null;
    el.addEventListener("pointerdown", (e) => (down = [e.clientX, e.clientY]));
    el.addEventListener("click", (e) => {
      if (e.detail > 1) return; // ikki marta bosish ochish/yopishni qayta almashtirmasin
      const moved = down ? Math.hypot(e.clientX - down[0], e.clientY - down[1]) : 0;
      down = null;
      if (moved < 8) setOpen(!isOpen);
    });
  }

  if (heroMv) jaw(heroMv, document.getElementById("heroOpen"), () => hero.classList.add("is-ready"));

  // ---- "3D ko'rik" bo'limi ----
  if (!mv) return;
  const stage = mv.parentElement;
  const warn = document.getElementById("mvWarn");

  jaw(mv, document.getElementById("mvOpen"), () => stage.classList.add("is-ready"));

  mv.addEventListener("error", () => { warn.hidden = false; });
  mv.addEventListener("load", () => { warn.hidden = true; });
})();
