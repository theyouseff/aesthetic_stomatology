/* "3D ko'rik" bo'limi: <model-viewer> boshqaruvi */
(function () {
  // hero: komponent yuklansa, zaxira rasm yashiriladi
  const hero = document.getElementById("hero3d");
  if (hero && window.customElements) customElements.whenDefined("model-viewer").then(() => hero.classList.add("is-ready"));

  const mv = document.getElementById("mv");
  if (!mv) return;
  const stage = mv.parentElement;
  const warn = document.getElementById("mvWarn");
  const spin = document.getElementById("mvSpin");
  const natural = document.getElementById("mvNatural");
  const pearl = document.getElementById("mvPearl");

  // komponent yuklansa, zaxira rasm yashiriladi; yuklanmasa rasm qoladi
  if (window.customElements) customElements.whenDefined("model-viewer").then(() => stage.classList.add("is-ready"));

  const home = () => { mv.cameraOrbit = "0deg 78deg 105%"; mv.fieldOfView = "auto"; };
  document.getElementById("mvReset").onclick = home;

  let spinning = true;
  spin.onclick = () => {
    spinning = !spinning;
    mv.autoRotate = spinning;
    spin.classList.toggle("is-on", spinning);
  };

  // modelning o'z teksturalari saqlanadi, faqat emal va milk jilosi sozlanadi
  function profile(name) {
    if (!mv.model) return;
    const teeth = mv.model.materials.find((m) => /teeth/i.test(m.name));
    const gums = mv.model.materials.find((m) => /gums/i.test(m.name));
    if (name === "pearl") {
      teeth?.pbrMetallicRoughness.setBaseColorFactor([1, 0.99, 0.94, 1]);
      teeth?.pbrMetallicRoughness.setRoughnessFactor(0.18);
      gums?.pbrMetallicRoughness.setBaseColorFactor([1, 0.74, 0.74, 1]);
      mv.exposure = 1.15;
    } else {
      teeth?.pbrMetallicRoughness.setBaseColorFactor([1, 1, 1, 1]);
      teeth?.pbrMetallicRoughness.setRoughnessFactor(0.5);
      gums?.pbrMetallicRoughness.setBaseColorFactor([1, 1, 1, 1]);
      mv.exposure = 1.05;
    }
    natural.classList.toggle("is-on", name !== "pearl");
    pearl.classList.toggle("is-on", name === "pearl");
  }
  natural.onclick = () => profile("natural");
  pearl.onclick = () => profile("pearl");
  mv.addEventListener("error", () => { warn.hidden = false; });
})();
