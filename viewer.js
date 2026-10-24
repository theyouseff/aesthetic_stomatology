/* Hero'dagi 3D tishlar: haqiqiy GLB/GLTF dental model ko'rsatiladi.
   Model fayli bo'lmasa yoki yuklanmasa, hech narsa o'zgarmaydi: oddiy rasm qoladi va boshqaruv tugmalari chiqmaydi.

   Modelni almashtirish: faylni assets/ ga qo'ying va quyidagi sozlamalarni moslang. */

const MODEL_URL = "assets/dental-arch.glb";
const MODEL_ROT_Y = 0;          // model "oldi" +Z ga qaramasa, aylantirish (radian), masalan -Math.PI / 2
const MODEL_ROT_X = 0;          // model "tepa" +Y bo'lmasa (masalan Z-up model uchun -Math.PI / 2)
const BITE_FRACTION = 0.5;      // yuqori va pastki tishlar tutashgan balandlik (modelning balandligidan ulushi)
const OPEN_ANGLE = 0.42;        // og'iz maksimal ochilish burchagi (radian)
const CREDIT_HTML = "";         // CC BY modellar uchun muallif ko'rsatmasi (sayt pastiga qo'yiladi)

(async () => {
  const host = document.getElementById("viewer");
  const bar = document.getElementById("viewerBar");
  if (!host || !bar) return;

  // fayl yo'q bo'lsa jim qolamiz
  try {
    const head = await fetch(MODEL_URL, { method: "HEAD" });
    if (!head.ok) return;
  } catch { return; }

  try {
    const THREE = await import("three");
    const { OrbitControls } = await import("three/addons/controls/OrbitControls.js");
    const { GLTFLoader } = await import("three/addons/loaders/GLTFLoader.js");
    const { RoomEnvironment } = await import("three/addons/environments/RoomEnvironment.js");

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;

    const scene = new THREE.Scene();
    scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;
    const key = new THREE.DirectionalLight(0xffffff, 1.6);
    key.position.set(3, 6, 8);
    scene.add(key);

    const camera = new THREE.PerspectiveCamera(30, 1.5, 0.1, 200);

    // modelni yuklash
    const gltf = await new GLTFLoader().loadAsync(MODEL_URL);
    const root = gltf.scene;
    root.updateMatrixWorld(true);

    // hamma mesh'ni bitta toza koordinatalar tizimiga o'tkazamiz: tepa = +Y, old = +Z, tutashgan tekislik y = 0
    const orient = new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(MODEL_ROT_X, MODEL_ROT_Y, 0));
    const meshes = [];
    root.traverse((o) => {
      if (!o.isMesh) return;
      o.geometry = o.geometry.clone();
      o.geometry.applyMatrix4(o.matrixWorld);
      o.geometry.applyMatrix4(orient);
      o.position.set(0, 0, 0); o.rotation.set(0, 0, 0); o.scale.set(1, 1, 1);
      o.updateMatrix();
      o.frustumCulled = false;
      meshes.push(o);
    });
    const model = new THREE.Group();
    meshes.forEach((m) => { m.removeFromParent(); model.add(m); });

    const box = new THREE.Box3();
    meshes.forEach((m) => { m.geometry.computeBoundingBox(); box.union(m.geometry.boundingBox); });
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const biteY = box.min.y + size.y * BITE_FRACTION;
    const s = 6 / Math.max(size.x, size.y, size.z);
    meshes.forEach((m) => m.geometry.translate(-center.x, -biteY, -center.z));
    model.scale.setScalar(s);
    scene.add(model);

    const depth = size.z * s, height = size.y * s;
    const uni = {
      uOpen: { value: 0 },
      uHinge: { value: new THREE.Vector3(0, 0, -depth * 0.42 / s) },
      uBand: { value: (size.y * 0.035) },
      uMax: { value: OPEN_ANGLE },
    };

    // pastki va yuqori jag' hinge atrofida aylanadi (jag'larni alohida bo'laklarga ajratish shart emas)
    const rot = `
      float w = smoothstep(-uBand, uBand, position.y);
      float ang = mix(0.62, -0.38, w) * uOpen * uMax;
      float sa = sin(ang), ca = cos(ang);
    `;
    meshes.forEach((m) => {
      const mats = Array.isArray(m.material) ? m.material : [m.material];
      mats.forEach((mat) => {
        mat.onBeforeCompile = (sh) => {
          Object.assign(sh.uniforms, uni);
          sh.vertexShader = sh.vertexShader
            .replace("#include <common>", "#include <common>\nuniform float uOpen; uniform vec3 uHinge; uniform float uBand; uniform float uMax;")
            .replace("#include <beginnormal_vertex>", `#include <beginnormal_vertex>
              ${rot}
              objectNormal = vec3(objectNormal.x, objectNormal.y * ca - objectNormal.z * sa, objectNormal.y * sa + objectNormal.z * ca);`)
            .replace("#include <begin_vertex>", `#include <begin_vertex>
              { vec3 p = position - uHinge;
                transformed = vec3(p.x, p.y * ca - p.z * sa, p.y * sa + p.z * ca) + uHinge; }`);
        };
        mat.customProgramCacheKey = () => "jawopen";
        mat.needsUpdate = true;
        if (mat.isMeshStandardMaterial) mat.envMapIntensity = 1.1;
      });
    });

    const canvas = renderer.domElement;
    host.appendChild(canvas);

    const orbit = new OrbitControls(camera, canvas);
    orbit.enableDamping = true; orbit.dampingFactor = 0.07; orbit.enablePan = false;
    orbit.rotateSpeed = 0.9; orbit.zoomSpeed = 0.9;
    orbit.minPolarAngle = 0; orbit.maxPolarAngle = Math.PI;           // 360° to'liq aylanish
    orbit.minDistance = Math.max(depth, height) * 0.9;
    orbit.maxDistance = Math.max(depth, height) * 3.2;
    orbit.target.set(0, 0, 0);

    const home = () => {
      const fit = (Math.max(height * 1.7, depth * 1.05) / 2) / Math.tan((camera.fov * Math.PI) / 360);
      camera.position.set(0, height * 0.12, fit * 1.35);
      orbit.target.set(0, 0, 0);
      orbit.update();
    };

    const resize = () => {
      const w = host.clientWidth, h = host.clientHeight;
      if (!w || !h) return;
      camera.aspect = w / h; camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    };
    new ResizeObserver(resize).observe(host);
    resize(); home();

    // tayyor: rasm o'rniga 3D, boshqaruv tugmalari paydo bo'ladi
    host.classList.add("is-3d", "is-open");
    bar.hidden = false;
    if (CREDIT_HTML) {
      const c = document.getElementById("modelCredit");
      if (c) { c.innerHTML = CREDIT_HTML; c.hidden = false; }
    }

    // bosish = ochish / yopish (sudrash bilan aralashmasligi uchun masofa tekshiriladi)
    let target = 0, down = null;
    canvas.addEventListener("pointerdown", (e) => (down = { x: e.clientX, y: e.clientY, t: performance.now() }));
    canvas.addEventListener("pointerup", (e) => {
      if (!down) return;
      const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y);
      if (moved < 6 && performance.now() - down.t < 500) target = target ? 0 : 1;
      down = null;
    });

    const zoom = (f) => { camera.position.sub(orbit.target).multiplyScalar(f).add(orbit.target); orbit.update(); };
    document.getElementById("vZoomIn").onclick = () => zoom(0.85);
    document.getElementById("vZoomOut").onclick = () => zoom(1.18);
    document.getElementById("vReset").onclick = home;

    let visible = true;
    new IntersectionObserver((e) => (visible = e[0].isIntersecting)).observe(host);
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

    const clock = new THREE.Clock();
    renderer.setAnimationLoop(() => {
      const dt = Math.min(clock.getDelta(), 0.05);
      if (!visible) return;
      uni.uOpen.value += (target - uni.uOpen.value) * (reduce ? 1 : 1 - Math.exp(-dt * 5));
      orbit.update();
      renderer.render(scene, camera);
    });
    window.__dental = { uni, camera, orbit, setOpen: (v) => (target = v) };   // sinash uchun
  } catch (err) {
    console.warn("3D model yuklanmadi, oddiy rasm qoldi:", err);
    host.querySelector("canvas")?.remove();
    host.classList.remove("is-3d", "is-open");
    bar.hidden = true;
  }
})();
