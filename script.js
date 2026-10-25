/* ---------- Tabassum illyustratsiyasi (haqiqiy fotolar qo'yilguncha namuna) ----------
   Haqiqiy rasm qo'shish: .ba__layer va .work__img ichidagi <svg> o'rniga <img> qo'ying. */

let uid = 0;

function rng(seed) {
  let s = seed;
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
}

function quadY(t, a, c) {
  return (1 - t) ** 2 * a + 2 * t * (1 - t) * c + t * t * a;
}

function smile({ shade = "#fffdf8", irregular = 0, gaps = 0, chip = -1, skin = "#f4d9cb", seed = 7 }) {
  const id = "s" + ++uid;
  const rand = rng(seed * 997 + 13);
  const lensPath = (c) => `M40 135 Q200 ${c} 360 135`;
  const lens = "M40 135 Q200 40 360 135 Q200 230 40 135 Z";
  const teeth = [];
  const N = 10;

  for (let i = 0; i < N; i++) {
    const u = (i - (N - 1) / 2) / ((N - 1) / 2);
    const au = Math.abs(u);
    const w = 40 - au * 15 - gaps * 2;
    const h = 56 - au * 20;
    let x = 200 + u * 142 - w / 2;
    const t = (x + w / 2 - 40) / 320;
    let top = quadY(t, 135, 40) - 3;
    let rot = 0;
    let hh = h;
    if (irregular) {
      x += (rand() - 0.5) * 9 * irregular + (i === 4 ? -6 * irregular : 0);
      top += (rand() - 0.3) * 12 * irregular;
      rot = (rand() - 0.5) * 16 * irregular;
      hh += (rand() - 0.5) * 12 * irregular;
    }
    const gapShift = gaps && i >= N / 2 ? gaps * 6 : gaps ? -gaps * 6 : 0;
    x += gapShift * (au < 0.2 ? 1 : 0.4);
    const cx = x + w / 2, cy = top + hh / 2;
    teeth.push(`<g transform="rotate(${rot.toFixed(1)} ${cx.toFixed(1)} ${cy.toFixed(1)})">
      <rect x="${x.toFixed(1)}" y="${top.toFixed(1)}" width="${w.toFixed(1)}" height="${hh.toFixed(1)}" rx="${(w * 0.38).toFixed(1)}" fill="url(#${id}t)" stroke="rgba(120,90,60,.28)" stroke-width="1"/>
      <ellipse cx="${(cx - w * 0.14).toFixed(1)}" cy="${(top + hh * 0.38).toFixed(1)}" rx="${(w * 0.12).toFixed(1)}" ry="${(hh * 0.22).toFixed(1)}" fill="#fff" opacity="${irregular ? 0.12 : 0.55}"/>
      ${chip === i ? `<path d="M${(x + w - 2).toFixed(1)} ${(top + hh).toFixed(1)} l-12 0 l12 -14z" fill="#3a1f1f" opacity=".85"/>` : ""}
    </g>`);
  }

  const lower = [];
  const M = 8;
  for (let i = 0; i < M; i++) {
    const u = (i - (M - 1) / 2) / ((M - 1) / 2);
    const au = Math.abs(u);
    const w = 32 - au * 9;
    const h = 34 - au * 8;
    const x = 200 + u * 108 - w / 2;
    const t = (x + w / 2 - 40) / 320;
    const bottom = quadY(t, 135, 230) + 3;
    const jitter = irregular ? (rand() - 0.5) * 6 * irregular : 0;
    lower.push(`<rect x="${(x + jitter).toFixed(1)}" y="${(bottom - h).toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" rx="${(w * 0.35).toFixed(1)}" fill="url(#${id}l)" stroke="rgba(120,90,60,.25)"/>`);
  }

  return `
  <defs>
    <linearGradient id="${id}bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${skin}"/><stop offset="1" stop-color="#e9bfae"/></linearGradient>
    <linearGradient id="${id}t" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${shade}"/><stop offset="1" stop-color="${shade}" stop-opacity=".82"/></linearGradient>
    <linearGradient id="${id}l" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${shade}" stop-opacity=".78"/><stop offset="1" stop-color="${shade}"/></linearGradient>
    <clipPath id="${id}c"><path d="${lens}"/></clipPath>
  </defs>
  <rect width="400" height="260" fill="url(#${id}bg)"/>
  <g transform="translate(200 130) scale(1.18) translate(-200 -135)">
    <path d="${lens}" fill="#5b1f26"/>
    <g clip-path="url(#${id}c)">${lower.join("")}${teeth.join("")}</g>
    <path d="${lens}" fill="none" stroke="#c76f78" stroke-width="22" stroke-linejoin="round"/>
    <path d="M60 128 Q200 52 340 128" fill="none" stroke="#e79aa1" stroke-width="3" stroke-linecap="round" opacity=".6"/>
    <path d="${lens}" fill="none" stroke="#a9545e" stroke-width="1.5" opacity=".5"/>
  </g>`;
}

const CASES = [
  { cap: "Vinirlar: shakl, rang va oralig'larni bir vaqtda to'g'rilash.",
    before: { shade: "#dcc590", irregular: 1, chip: 3, seed: 3 },
    after: { shade: "#fffdf8", seed: 3 } },
  { cap: "Professional oqartirish: tishlar rangini tiklash.",
    before: { shade: "#d1b67e", irregular: 0.15, seed: 5 },
    after: { shade: "#fffefb", irregular: 0.15, seed: 5 } },
  { cap: "Tishlarni tekislash: oralig'larni yopish va shaklni to'g'rilash.",
    before: { shade: "#efe5cd", irregular: 0.9, gaps: 1, seed: 9 },
    after: { shade: "#fcf9f1", seed: 9 } },
];

/* ---------- oldin / keyin ---------- (namunaviy 3D tasvirlar; haqiqiy bemor fotolari qo'yilganda faqat yo'llarni almashtiring) */
const BA_CASES = [
  { cap: "Professional oqartirish: tishlar rangining farqi.",
    before: "assets/ba-yellow.webp", after: "assets/ba-white.webp" },
  { cap: "Tishlarni tekislash: notekis tishlar to'g'rilangan holat.",
    before: "assets/ba-crooked.webp", after: "assets/ba-white.webp" },
  { cap: "Breketlar: notekis tishlarni tekislash jarayoni.",
    before: "assets/ba-crooked.webp", after: "assets/ba-braces.webp" },
];

const baBefore = document.getElementById("baBefore");
const baAfter = document.getElementById("baAfter");
const baWrap = document.getElementById("baBeforeWrap");
const baHandle = document.getElementById("baHandle");
const baRange = document.getElementById("baRange");
const baCap = document.getElementById("baCap");

function setCase(i) {
  baBefore.src = BA_CASES[i].before;
  baAfter.src = BA_CASES[i].after;
  baCap.textContent = BA_CASES[i].cap;
}
function setSlide(v) {
  baWrap.style.clipPath = `inset(0 ${100 - v}% 0 0)`;
  baHandle.style.left = v + "%";
}
baRange.addEventListener("input", (e) => setSlide(e.target.value));
document.querySelectorAll(".ba-tab").forEach((b) =>
  b.addEventListener("click", () => {
    document.querySelectorAll(".ba-tab").forEach((x) => x.classList.toggle("is-on", x === b));
    setCase(+b.dataset.case);
  })
);
setCase(0);
setSlide(50);

/* ---------- portfolio ---------- */
const WORKS = [
  { t: "vinir", title: "Vinirlar — 10 ta tish", d: "Keramik vinirlar, tabiiy shaffoflik", c: 0, seed: 21, skin: "#f4d9cb" },
  { t: "oqartirish", title: "Klinik oqartirish", d: "Tishlar rangini tiklash", c: 1, seed: 22, skin: "#f6dfd2" },
  { t: "tekislash", title: "Diastemani yopish", d: "Kompozit restavratsiya", c: 2, seed: 23, skin: "#f3d4c4" },
  { t: "implant", title: "Implant + qoplama", d: "Oldingi tishni tiklash", c: 0, seed: 24, skin: "#f7e0d3" },
  { t: "vinir", title: "Tabassum dizayni", d: "Digital Smile Design asosida", c: 0, seed: 25, skin: "#f5dbcd" },
  { t: "tekislash", title: "Shaklni to'g'rilash", d: "Minimal invaziv usul", c: 2, seed: 26, skin: "#f4d7c8" },
];
const grid = document.getElementById("grid");
grid.innerHTML = WORKS.map((w, i) => {
  const c = CASES[w.c];
  return `<article class="work reveal" data-t="${w.t}">
    <div class="work__img">
      <svg viewBox="0 0 400 260">${smile({ ...c.after, skin: w.skin, seed: w.seed })}</svg>
      <svg viewBox="0 0 400 260" style="clip-path:inset(0 50% 0 0)">${smile({ ...c.before, skin: w.skin, seed: w.seed })}</svg>
    </div>
    <div class="work__body"><small>${{ vinir: "Vinirlar", oqartirish: "Oqartirish", tekislash: "Tekislash", implant: "Implantatsiya" }[w.t]}</small>
      <h3>${w.title}</h3><p>${w.d}</p></div>
  </article>`;
}).join("");

document.querySelectorAll(".f").forEach((b) =>
  b.addEventListener("click", () => {
    document.querySelectorAll(".f").forEach((x) => x.classList.toggle("is-on", x === b));
    grid.querySelectorAll(".work").forEach((w) =>
      w.classList.toggle("is-hidden", b.dataset.f !== "all" && w.dataset.t !== b.dataset.f)
    );
  })
);

/* ---------- reveal + counters ---------- */
const io = new IntersectionObserver(
  (entries) => entries.forEach((e) => {
    if (!e.isIntersecting) return;
    e.target.classList.add("in");
    const n = e.target.querySelector("[data-count]");
    if (n) count(n);
    io.unobserve(e.target);
  }),
  { threshold: 0.15 }
);
document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

function count(el) {
  const end = +el.dataset.count, suf = el.dataset.suffix || "", t0 = performance.now(), dur = 1600;
  const tick = (t) => {
    const p = Math.min((t - t0) / dur, 1);
    el.textContent = Math.round(end * (1 - (1 - p) ** 3)).toLocaleString("ru-RU").replace(/ /g, " ") + suf;
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

/* ---------- menyu ---------- */
const burger = document.getElementById("burger");
const menu = document.getElementById("menu");
burger.addEventListener("click", () => {
  const open = menu.classList.toggle("open");
  burger.setAttribute("aria-expanded", open);
});
menu.addEventListener("click", (e) => {
  if (e.target.tagName === "A") {
    menu.classList.remove("open");
    burger.setAttribute("aria-expanded", false);
  }
});

/* ---------- forma (hozircha serverga ulanmagan) ---------- */
document.getElementById("form").addEventListener("submit", (e) => {
  e.preventDefault();
  const f = e.target, msg = document.getElementById("formMsg");
  const name = f.name.value.trim(), phone = f.phone.value.replace(/\D/g, "");
  f.name.classList.toggle("err", !name);
  f.phone.classList.toggle("err", phone.length < 9);
  if (!name || phone.length < 9) {
    msg.style.color = "#c0392b";
    msg.textContent = "Ism va telefon raqamini to'g'ri kiriting.";
    return;
  }
  msg.style.color = "";
  msg.textContent = "Rahmat, " + name + "! Tez orada bog'lanamiz.";
  f.reset();
});

document.getElementById("yr").textContent = new Date().getFullYear();
