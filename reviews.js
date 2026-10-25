/* Haqiqiy bemor sharhlari. Ro'yxat bo'sh bo'lsa, "Sharhlar" bo'limi saytda ko'rinmaydi.
   Faqat haqiqiy sharhlarni, bemorning roziligi bilan qo'shing (Google xaritalar, Instagram yoki yozma rozilik).
   Namuna:
   { name: "Ism F.", service: "Vinirlar", date: "2026-09", text: "Sharh matni" },
*/
const REVIEWS = [
];

/* NAMUNA matnlar (shablon/demo uchun). SHOW_SAMPLES = true bo'lsa, REVIEWS bo'sh paytda hamma joyda "NAMUNA" belgisi bilan ko'rinadi.
   Haqiqiy klientga topshirishda: REVIEWS ga haqiqiy sharhlarni qo'shing (namunalar o'zi o'chadi) va SHOW_SAMPLES ni false qiling. */
const SHOW_SAMPLES = true;

const SAMPLE_REVIEWS = [
  { name: "Ism F.", service: "Vinirlar", date: "NAMUNA", text: "Qabulda hamma narsani oldindan tushuntirishdi, davolash jarayonida o'zimni xotirjam his qildim. Natijadan mamnunman." },
  { name: "Ism F.", service: "Tish oqartirish", date: "NAMUNA", text: "Oqartirishdan keyin tishlarim ancha ochiq rangga kirdi. Shifokor parvarish bo'yicha aniq tavsiyalar berdi." },
  { name: "Ism F.", service: "Implantatsiya", date: "NAMUNA", text: "Implantatsiyadan oldin qiynalayotgandim, lekin shifokor har bosqichni tushuntirgani uchun xavotirim yo'qoldi." },
  { name: "Ism F.", service: "Konsultatsiya", date: "NAMUNA", text: "Bepul konsultatsiyada rejani va narxni ochiq aytishdi. Yashirin to'lovlar bo'lmagani menga yoqdi." },
  { name: "Ism F.", service: "Davolash", date: "NAMUNA", text: "Behushlikdan keyin og'riq sezmadim. Xodimlar muloyim, klinika toza va qulay." },
  { name: "Ism F.", service: "Tabassum dizayni", date: "NAMUNA", text: "Tishlarimning shakli va rangi yuzimga mos bo'ldi, endi suratga tushishdan uyalmayman." },
];

(function () {
  const sec = document.getElementById("sharhlar");
  const list = document.getElementById("reviewsList");
  const demo = SHOW_SAMPLES || location.protocol === "file:" || ["localhost", "127.0.0.1", ""].includes(location.hostname) || /[?&]demo\b/.test(location.search);
  const items = REVIEWS.length ? REVIEWS : demo ? SAMPLE_REVIEWS : [];
  if (!sec || !list || !items.length) return;
  const esc = (t) => String(t).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  sec.hidden = false; // o'lchash uchun avval ko'rinadigan qilinadi
  list.innerHTML = `
    <button class="rv__nav rv__prev" type="button" aria-label="Oldingisi">${"<svg viewBox='0 0 24 24' width='18' height='18' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M15 6l-6 6 6 6'/></svg>"}</button>
    <div class="rv__track">${items.map((r) => `
      <figure class="review">
        <figcaption class="review__head">
          <span class="review__ava">${esc(String(r.name).trim().charAt(0).toUpperCase())}</span>
          <span class="review__who"><b>${esc(r.name)}</b>${r.service || r.date ? `<small>${[r.service, r.date].filter(Boolean).map(esc).join(" · ")}</small>` : ""}</span>
        </figcaption>
        <blockquote class="review__text">${esc(r.text)}</blockquote>
        <button class="review__more" type="button" hidden>Ko'proq o'qish <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg></button>
      </figure>`).join("")}</div>
    <button class="rv__nav rv__next" type="button" aria-label="Keyingisi">${"<svg viewBox='0 0 24 24' width='18' height='18' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M9 6l6 6-6 6'/></svg>"}</button>
    <div class="rv__dots">${items.map((_, i) => `<button type="button" aria-label="${i + 1}-sharh" data-i="${i}"></button>`).join("")}</div>`;
  list.className = "rv";

  const track = list.querySelector(".rv__track");
  const cards = [...track.children];
  const dots = [...list.querySelectorAll(".rv__dots button")];
  const prev = list.querySelector(".rv__prev"), next = list.querySelector(".rv__next");
  const step = () => (cards[1] ? cards[1].offsetLeft - cards[0].offsetLeft : track.clientWidth);

  // uzun sharhlar qisqartiriladi: "Ko'proq o'qish" faqat matn sig'masa chiqadi
  const fitMore = () => cards.forEach((c) => {
    const t = c.querySelector(".review__text"), b = c.querySelector(".review__more");
    if (c.classList.contains("is-open")) return;
    b.hidden = !(t.scrollHeight > t.clientHeight + 1);
  });
  cards.forEach((c) => c.querySelector(".review__more").addEventListener("click", (e) => {
    const open = c.classList.toggle("is-open");
    e.currentTarget.firstChild.textContent = open ? "Yig'ish " : "Ko'proq o'qish ";
  }));

  const sync = () => {
    const i = Math.min(cards.length - 1, Math.round(track.scrollLeft / (step() || 1)));
    dots.forEach((d, k) => d.classList.toggle("is-on", k === i));
    prev.disabled = track.scrollLeft <= 2;
    next.disabled = track.scrollLeft >= track.scrollWidth - track.clientWidth - 2;
  };
  prev.addEventListener("click", () => track.scrollBy({ left: -step(), behavior: "smooth" }));
  next.addEventListener("click", () => track.scrollBy({ left: step(), behavior: "smooth" }));
  dots.forEach((d) => d.addEventListener("click", () => track.scrollTo({ left: step() * +d.dataset.i, behavior: "smooth" })));
  track.addEventListener("scroll", sync, { passive: true });
  new ResizeObserver(() => { fitMore(); sync(); }).observe(track);
  fitMore(); sync();

  if (!REVIEWS.length) {
    const note = document.createElement("p");
    note.className = "reviews__note";
    note.textContent = "Quyidagi matnlar namuna: haqiqiy bemor sharhlari bilan almashtiriladi.";
    list.before(note);
  }
  sec.hidden = false;
  const nav = document.getElementById("navReviews");
  if (nav) nav.hidden = false;
})();
