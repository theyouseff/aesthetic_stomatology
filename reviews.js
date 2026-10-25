/* Haqiqiy bemor sharhlari. Ro'yxat bo'sh bo'lsa, "Sharhlar" bo'limi saytda ko'rinmaydi.
   Faqat haqiqiy sharhlarni, bemorning roziligi bilan qo'shing (Google xaritalar, Instagram yoki yozma rozilik).
   Namuna:
   { name: "Ism F.", service: "Vinirlar", date: "2026-09", text: "Sharh matni" },
*/
const REVIEWS = [
];

/* NAMUNA matnlar: faqat dizaynni ko'rish uchun. Ular faqat lokal ochilganda (file:// yoki localhost) yoki manzilga ?demo qo'shilganda
   ko'rinadi, jonli saytda ko'rinmaydi. REVIEWS ga haqiqiy sharh qo'shilishi bilan ular avtomatik o'chadi. */
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
  const demo = location.protocol === "file:" || ["localhost", "127.0.0.1", ""].includes(location.hostname) || /[?&]demo\b/.test(location.search);
  const items = REVIEWS.length ? REVIEWS : demo ? SAMPLE_REVIEWS : [];
  if (!sec || !list || !items.length) return;
  const esc = (t) => String(t).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  list.innerHTML = items.map((r) => `
    <figure class="review reveal in">
      <blockquote>${esc(r.text)}</blockquote>
      <figcaption><b>${esc(r.name)}</b>${r.service ? `<span>${esc(r.service)}</span>` : ""}${r.date ? `<time>${esc(r.date)}</time>` : ""}</figcaption>
    </figure>`).join("");
  sec.hidden = false;
  const nav = document.getElementById("navReviews");
  if (nav) nav.hidden = false;
})();
