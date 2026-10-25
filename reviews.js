/* Haqiqiy bemor sharhlari. Ro'yxat bo'sh bo'lsa, "Sharhlar" bo'limi saytda ko'rinmaydi.
   Faqat haqiqiy sharhlarni, bemorning roziligi bilan qo'shing (Google xaritalar, Instagram yoki yozma rozilik).
   Namuna:
   { name: "Ism F.", service: "Vinirlar", date: "2026-09", text: "Sharh matni" },
*/
const REVIEWS = [
];

(function () {
  const sec = document.getElementById("sharhlar");
  const list = document.getElementById("reviewsList");
  if (!sec || !list || !REVIEWS.length) return;
  const esc = (t) => String(t).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  list.innerHTML = REVIEWS.map((r) => `
    <figure class="review reveal in">
      <blockquote>${esc(r.text)}</blockquote>
      <figcaption><b>${esc(r.name)}</b>${r.service ? `<span>${esc(r.service)}</span>` : ""}${r.date ? `<time>${esc(r.date)}</time>` : ""}</figcaption>
    </figure>`).join("");
  sec.hidden = false;
  const nav = document.getElementById("navReviews");
  if (nav) nav.hidden = false;
})();
