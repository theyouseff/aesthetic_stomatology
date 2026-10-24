/* 3D tishlar: foto egilgan "yoy" shaklidagi yuzaga kiydiriladi, yuqori va pastki qator alohida ochiladi.
   Three.js yuklanmasa, WebGL yo'q bo'lsa yoki rasm o'qilmasa, tugma chiqmaydi va oddiy rasm qoladi. */

const IMG = "assets/teeth.webp";
const BITE = 0.52;      // rasmdagi tishlar tutashgan chiziq (yuqoridan, 0..1)
const W = 6, H = W / 1.5, R = 5, GAP = 0.34;

(async () => {
  const host = document.getElementById("viewer");
  const bar = document.getElementById("viewerBar");
  if (!host || !bar) return;

  try {
    const THREE = await import("three");
    const { OrbitControls } = await import("three/addons/controls/OrbitControls.js");

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const tex = await new THREE.TextureLoader().loadAsync(IMG);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = renderer.capabilities.getMaxAnisotropy();

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, 1.5, 0.1, 100);
    const HOME = new THREE.Vector3(0, 0.15, 8.6);
    camera.position.copy(HOME);

    scene.add(new THREE.HemisphereLight(0xffffff, 0xd9b8b0, 1.6));
    const key = new THREE.DirectionalLight(0xffffff, 1.4);
    key.position.set(3, 5, 7);
    scene.add(key);

    // tekis yuzani yoy bo'ylab egish
    const bend = (geo) => {
      const p = geo.attributes.position;
      for (let i = 0; i < p.count; i++) {
        const x = p.getX(i);
        p.setX(i, R * Math.sin(x / R));
        p.setZ(i, -R * (1 - Math.cos(x / R)));
      }
      geo.computeVertexNormals();
      return geo;
    };

    const half = (h, repeatY, offsetY) => {
      const t = tex.clone();
      t.needsUpdate = true;
      t.repeat.set(1, repeatY);
      t.offset.set(0, offsetY);
      const mat = new THREE.MeshStandardMaterial({
        map: t, emissiveMap: t, emissive: 0xffffff, emissiveIntensity: 0.55,
        roughness: 0.35, metalness: 0, transparent: true, alphaTest: 0.04, side: THREE.DoubleSide,
      });
      return new THREE.Mesh(bend(new THREE.PlaneGeometry(W, h, 64, 1)), mat);
    };

    const hu = H * BITE, hl = H * (1 - BITE);
    const upper = new THREE.Group(), lower = new THREE.Group();
    const upMesh = half(hu, BITE, 1 - BITE); upMesh.position.y = hu / 2; upper.add(upMesh);
    const loMesh = half(hl, 1 - BITE, 0); loMesh.position.y = -hl / 2; lower.add(loMesh);

    // ochilganda ko'rinadigan og'iz ichi
    const mc = document.createElement("canvas");
    mc.width = 512; mc.height = 128;
    const g = mc.getContext("2d");
    const grad = g.createLinearGradient(0, 0, 0, 128);
    grad.addColorStop(0, "#2e0e13"); grad.addColorStop(0.5, "#5b1f26"); grad.addColorStop(1, "#2e0e13");
    g.fillStyle = grad;
    g.beginPath(); g.roundRect(0, 0, 512, 128, 64); g.fill();
    const mouthTex = new THREE.CanvasTexture(mc);
    mouthTex.colorSpace = THREE.SRGBColorSpace;
    const mouth = new THREE.Mesh(
      bend(new THREE.PlaneGeometry(W * 0.9, 1, 48, 1)),
      new THREE.MeshBasicMaterial({ map: mouthTex, transparent: true, side: THREE.DoubleSide })
    );
    mouth.position.z = -0.5;
    mouth.scale.y = 0.0001;

    const model = new THREE.Group();
    model.add(mouth, upper, lower);
    model.position.y = 0.05;
    scene.add(model);

    const canvas = renderer.domElement;
    host.appendChild(canvas);

    const orbit = new OrbitControls(camera, canvas);
    orbit.enableDamping = true; orbit.dampingFactor = 0.07; orbit.enablePan = false;
    orbit.minDistance = 5.5; orbit.maxDistance = 11;
    orbit.minAzimuthAngle = -0.75; orbit.maxAzimuthAngle = 0.75;   // orqa tomoni yo'q, shuning uchun cheklaymiz
    orbit.minPolarAngle = 1.15; orbit.maxPolarAngle = 1.85;
    orbit.target.set(0, 0.05, 0);
    orbit.enabled = false;
    canvas.style.touchAction = "pan-y";

    const resize = () => {
      const w = host.clientWidth, h = host.clientHeight;
      if (!w || !h) return;
      camera.aspect = w / h; camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    };
    new ResizeObserver(resize).observe(host);
    resize();

    // tayyor: rasm o'rniga 3D ko'rsatiladi va tugma paydo bo'ladi
    host.classList.add("is-3d");
    bar.hidden = false;

    const toggle = document.getElementById("viewerToggle");
    const tools = document.getElementById("viewerTools");
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let open = 0, target = 0, visible = true;

    const setOpen = (v) => {
      target = v ? 1 : 0;
      orbit.enabled = !!v;
      host.classList.toggle("is-open", !!v);
      canvas.style.touchAction = v ? "none" : "pan-y";
      tools.hidden = !v;
      toggle.textContent = v ? "Yopish" : "3D maketni ochish";
    };
    toggle.onclick = () => setOpen(!target);
    canvas.addEventListener("click", () => { if (!target) setOpen(true); });
    document.getElementById("vZoomIn").onclick = () => { camera.position.multiplyScalar(0.88); orbit.update(); };
    document.getElementById("vZoomOut").onclick = () => { camera.position.multiplyScalar(1.12); orbit.update(); };
    document.getElementById("vReset").onclick = () => { camera.position.copy(HOME); orbit.target.set(0, 0.05, 0); orbit.update(); };

    new IntersectionObserver((e) => (visible = e[0].isIntersecting)).observe(host);

    const clock = new THREE.Clock();
    renderer.setAnimationLoop(() => {
      if (!visible) return;
      const t = clock.getElapsedTime();
      open += (target - open) * (reduce ? 1 : 0.09);
      const k = open * open * (3 - 2 * open);
      upper.position.y = k * GAP;
      lower.position.y = -k * GAP;
      upper.rotation.x = -k * 0.05;
      lower.rotation.x = k * 0.04;
      mouth.scale.y = Math.max(0.0001, k * (GAP * 2 + 0.1));
      if (!target && !reduce) model.rotation.y = Math.sin(t * 0.65) * 0.13;
      else if (target) model.rotation.y *= 0.9;
      orbit.update();
      renderer.render(scene, camera);
    });
  } catch (err) {
    console.warn("3D maket yuklanmadi, oddiy rasm qoldi:", err);
    host.querySelector("canvas")?.remove();
    host.classList.remove("is-3d");
    bar.hidden = true;
  }
})();
