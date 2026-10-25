/* Qabulga yozilish anketasi: barcha [data-cta] tugmalar shu oynani ochadi (boshqa saytga o'tkazilmaydi).

   Arizalar qayerga ketishi: LEAD_ENDPOINT. U bo'sh bo'lsa, forma DEMO rejimida ishlaydi (ariza hech qayerga yuborilmaydi,
   oynada shu haqida yozib qo'yiladi). Haqiqiy sayt uchun manzilni qo'ying: masalan Formspree (https://formspree.io/f/XXXX),
   Google Apps Script yoki o'z serveringiz. Forma JSON (POST) yuboradi: name, phone, service, time, note, page, sent_at. */
const LEAD_ENDPOINT = "";

(function () {
  const dlg = document.getElementById("leadModal");
  if (!dlg || typeof dlg.showModal !== "function") return; // eski brauzer: tugmalar #aloqa bo'limiga tushadi
  const form = document.getElementById("leadForm");
  const done = document.getElementById("leadDone");
  const err = document.getElementById("leadErr");
  const submit = document.getElementById("leadSubmit");

  const open = () => {
    form.hidden = false; done.hidden = true; err.textContent = "";
    submit.disabled = false; submit.textContent = "Arizani yuborish";
    dlg.showModal();
    form.elements.name.focus({ preventScroll: true });
  };
  const close = () => dlg.close();

  document.addEventListener("click", (e) => {
    const cta = e.target.closest("[data-cta]");
    if (cta) { e.preventDefault(); open(); return; }
    if (e.target.closest("[data-close]")) close();
    else if (e.target === dlg) close(); // qora fonga bosish
  });

  // telefon: +998 XX XXX XX XX
  const phone = form.elements.phone;
  phone.addEventListener("input", () => {
    let d = phone.value.replace(/\D/g, "");
    if (d.startsWith("998")) d = d.slice(3);
    d = d.slice(0, 9);
    const p = [d.slice(0, 2), d.slice(2, 5), d.slice(5, 7), d.slice(7, 9)].filter(Boolean);
    phone.value = d ? "+998 " + p.join(" ") : "";
  });
  phone.addEventListener("focus", () => { if (!phone.value) phone.value = "+998 "; });
  phone.addEventListener("blur", () => { if (phone.value.trim() === "+998") phone.value = ""; });

  const mark = (el, bad) => el.classList.toggle("bad", bad);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = form.elements;
    const name = f.name.value.trim();
    const digits = f.phone.value.replace(/\D/g, "");
    const okName = name.length >= 2, okPhone = digits.length === 12, okAgree = f.agree.checked;
    mark(f.name, !okName); mark(f.phone, !okPhone);
    form.querySelector(".modal__check").classList.toggle("bad", !okAgree);
    if (!okName || !okPhone || !okAgree) {
      err.textContent = !okName ? "Ismingizni yozing." : !okPhone ? "Telefon raqamini to'liq kiriting." : "Rozilik belgisini qo'ying.";
      return;
    }
    if (f.website.value) return; // spam tuzog'i

    err.textContent = "";
    submit.disabled = true; submit.textContent = "Yuborilmoqda…";
    const data = {
      name, phone: "+" + digits, service: f.service.value, time: f.time.value, note: f.note.value.trim(),
      page: location.href, sent_at: new Date().toISOString(),
    };
    try {
      if (LEAD_ENDPOINT) {
        const r = await fetch(LEAD_ENDPOINT, {
          method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(data),
        });
        if (!r.ok) throw new Error("HTTP " + r.status);
      } else {
        console.warn("lead.js: LEAD_ENDPOINT bo'sh, ariza yuborilmadi (demo rejim).", data);
      }
      document.getElementById("leadDemo").hidden = !!LEAD_ENDPOINT;
      form.hidden = true; done.hidden = false; form.reset();
      done.querySelector("button").focus({ preventScroll: true });
    } catch (x) {
      err.textContent = "Yuborib bo'lmadi. Internetni tekshirib, qayta urinib ko'ring.";
      submit.disabled = false; submit.textContent = "Arizani yuborish";
    }
  });
})();
