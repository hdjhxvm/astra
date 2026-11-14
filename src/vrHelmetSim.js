import * as THREE from "three";
import { astraLink, assess, pctDelta, PRESETS, FIELD_DEFS, GRAVITY, SIGNAL_GATE, SANS_WORD, parseDataset } from "./astraLink.js";
import { CREW } from "./crewDemo.js";
import "./vrHelmet.css";

// ASTRA VR EVA helmet. A first-person surface EVA rendered inside a curved visor, with the crew
// member's ONBOARD BIOMETRIC STREAM drawn as a visor HUD. Telemetry comes from the shared ASTRA link
// (src/astraLink.js), so the HUD, My Health, Today and the Crew console always show the same numbers.

function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (value === undefined || value === null || value === false) continue;
    if (key === "class") node.className = value;
    else if (key.startsWith("on")) node.addEventListener(key.slice(2), value);
    else if (key === "style") node.style.cssText = value;
    else node.setAttribute(key, value === true ? "" : value);
  }
  for (const child of children.flat()) if (child !== null && child !== undefined && child !== false) node.append(child?.nodeType ? child : String(child));
  return node;
}
const esc = text => String(text).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const fmtv = (v, digits = 0) => (Number.isFinite(v) ? v.toFixed(digits) : "--");
const WORD = { nominal: "NOMINAL", caution: "CAUTION", critical: "CRITICAL", held: "HELD", standby: "STANDBY" };

// ---------- RTX High-Fidelity 3D Terrain & Assets ----------
const WORLDS = {
  moon: {
    sky: 0x010409,
    fog: [0x030712, 0.0065],
    terrainColor: 0x788496,
    rockColor: 0x525e6e,
    hemi: [0x94a3b8, 0x0f172a, 0.42],
    sun: [0xfffbeb, 2.2, [48, 52, -35]],
    atmoColor: 0x38bdf8,
  },
  mars: {
    sky: 0x280f07,
    fog: [0x3b170c, 0.011],
    terrainColor: 0xb45309,
    rockColor: 0x7c2d12,
    hemi: [0xfdba74, 0x3b170c, 0.52],
    sun: [0xffedd5, 2.4, [48, 52, -35]],
    atmoColor: 0xf97316,
  },
};

function createRegolithTexture() {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 512;
  const ctx = c.getContext("2d");
  const imgData = ctx.createImageData(512, 512);
  const d = imgData.data;
  for (let i = 0; i < d.length; i += 4) {
    const n = 115 + Math.floor((Math.random() - 0.5) * 65);
    d[i] = n;
    d[i + 1] = n;
    d[i + 2] = n;
    d[i + 3] = 255;
  }
  ctx.putImageData(imgData, 0, 0);
  for (let k = 0; k < 60; k++) {
    const cx = Math.random() * 512;
    const cy = Math.random() * 512;
    const r = Math.random() * 18 + 4;
    const grad = ctx.createRadialGradient(cx, cy, r * 0.2, cx, cy, r);
    grad.addColorStop(0, "rgba(40,40,40,0.45)");
    grad.addColorStop(0.8, "rgba(210,210,210,0.35)");
    grad.addColorStop(1, "rgba(128,128,128,0)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(28, 28);
  return tex;
}

function createEarthTexture() {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 256;
  const ctx = c.getContext("2d");
  ctx.fillStyle = "#0c4a6e";
  ctx.fillRect(0, 0, 512, 256);
  for (let i = 0; i < 90; i++) {
    ctx.fillStyle = i % 3 === 0 ? "#15803d" : "#a16207";
    ctx.beginPath();
    ctx.ellipse(Math.random() * 512, Math.random() * 200 + 28, Math.random() * 45 + 10, Math.random() * 25 + 8, Math.random() * 3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = "#f8fafc";
  ctx.fillRect(0, 0, 512, 16);
  ctx.fillRect(0, 240, 512, 16);
  return new THREE.CanvasTexture(c);
}

function getTerrainHeight(x, z) {
  let h = Math.sin(x * 0.032) * Math.cos(z * 0.032) * 3.2 +
          Math.sin(x * 0.09 + z * 0.07) * 0.85 +
          Math.cos(x * 0.22 - z * 0.19) * 0.22;

  const dx1 = x - (-4), dz1 = z - (-16);
  const r1 = Math.sqrt(dx1 * dx1 + dz1 * dz1);
  if (r1 < 11) {
    const norm = r1 / 11;
    h += (norm < 0.75 ? -1.4 * (1 - norm / 0.75) : Math.sin((norm - 0.75) * 4 * Math.PI) * 0.65);
  }

  const distOrigin = Math.sqrt(x * x + (z + 4) * (z + 4));
  if (distOrigin < 9) h *= 0.25;
  return h;
}

function buildDetailedRover() {
  const grp = new THREE.Group();
  const chassisMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.75, roughness: 0.3 });
  const goldFoilMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.85, roughness: 0.22 });
  const darkMetalMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.4 });
  const solarMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9, roughness: 0.15 });

  const body = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.75, 1.5), goldFoilMat);
  body.position.y = 0.85;
  body.castShadow = true;
  body.receiveShadow = true;
  grp.add(body);

  const deck = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.12, 1.6), chassisMat);
  deck.position.y = 1.26;
  deck.castShadow = true;
  grp.add(deck);

  for (const sideZ of [-1.45, 1.45]) {
    const wing = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.05, 1.1), solarMat);
    wing.position.set(0, 1.25, sideZ);
    wing.castShadow = true;
    grp.add(wing);
  }

  const wheelGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.28, 24);
  wheelGeo.rotateX(Math.PI / 2);
  for (const wx of [-0.95, 0, 0.95]) {
    for (const wz of [-0.95, 0.95]) {
      const w = new THREE.Mesh(wheelGeo, darkMetalMat);
      w.position.set(wx, 0.38, wz);
      w.castShadow = true;
      w.receiveShadow = true;
      grp.add(w);

      const strut = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.65, 8), chassisMat);
      strut.position.set(wx, 0.65, wz * 0.75);
      grp.add(strut);
    }
  }

  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 1.15, 12), chassisMat);
  mast.position.set(0.75, 1.8, 0.35);
  mast.castShadow = true;
  grp.add(mast);

  const camHead = new THREE.Group();
  camHead.position.set(0.75, 2.4, 0.35);
  const headBox = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.22, 0.42), chassisMat);
  headBox.castShadow = true;
  camHead.add(headBox);

  const lens = new THREE.Mesh(
    new THREE.SphereGeometry(0.06, 12, 12),
    new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
  );
  lens.position.set(0.16, 0, 0);
  camHead.add(lens);
  grp.add(camHead);

  const dish = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.08, 0.18, 20), chassisMat);
  dish.position.set(-0.7, 1.55, -0.35);
  dish.rotation.z = 0.45;
  dish.castShadow = true;
  grp.add(dish);

  grp.userData.spin = camHead;
  return grp;
}

function buildHabitatBase() {
  const base = new THREE.Group();
  const domeMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.35, metalness: 0.6 });
  const dome = new THREE.Mesh(new THREE.SphereGeometry(5.5, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), domeMat);
  dome.castShadow = true;
  dome.receiveShadow = true;
  base.add(dome);

  const tunnel = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.4, 5, 16), domeMat);
  tunnel.rotation.z = Math.PI / 2;
  tunnel.position.set(5.5, 1.2, 0);
  tunnel.castShadow = true;
  base.add(tunnel);

  const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.25, 11, 8), domeMat);
  tower.position.set(-6.5, 5.5, -2);
  tower.castShadow = true;
  base.add(tower);

  const beacon = new THREE.Mesh(
    new THREE.SphereGeometry(0.28, 12, 12),
    new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
  );
  beacon.position.set(-6.5, 11.2, -2);
  base.add(beacon);

  return base;
}

function buildWorld(kind) {
  const world = WORLDS[kind] ?? WORLDS.moon;
  const group = new THREE.Group();

  const hemiLight = new THREE.HemisphereLight(...world.hemi);
  group.add(hemiLight);

  const sunLight = new THREE.DirectionalLight(world.sun[0], world.sun[1]);
  sunLight.position.set(...world.sun[2]);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.width = 2048;
  sunLight.shadow.mapSize.height = 2048;
  sunLight.shadow.camera.near = 1;
  sunLight.shadow.camera.far = 180;
  const d = 45;
  sunLight.shadow.camera.left = -d;
  sunLight.shadow.camera.right = d;
  sunLight.shadow.camera.top = d;
  sunLight.shadow.camera.bottom = -d;
  sunLight.shadow.bias = -0.0005;
  group.add(sunLight);

  const starGeo = new THREE.BufferGeometry();
  const starCount = 2800;
  const starPos = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount * 3; i += 3) {
    starPos[i] = (Math.random() - 0.5) * 650;
    starPos[i + 1] = Math.random() * 260 + 6;
    starPos[i + 2] = (Math.random() - 0.5) * 650;
  }
  starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
  const dustParticles = new THREE.Points(
    starGeo,
    new THREE.PointsMaterial({ color: 0xf8fafc, size: 0.75, transparent: true, opacity: 0.9 })
  );
  group.add(dustParticles);

  const earthTex = createEarthTexture();
  const earthMesh = new THREE.Mesh(
    new THREE.SphereGeometry(9.5, 48, 48),
    new THREE.MeshStandardMaterial({ map: earthTex, roughness: 0.55, metalness: 0.1 })
  );
  earthMesh.position.set(34, 42, -110);
  group.add(earthMesh);

  const atmoGlow = new THREE.Mesh(
    new THREE.SphereGeometry(10.3, 32, 32),
    new THREE.MeshBasicMaterial({ color: world.atmoColor, transparent: true, opacity: 0.18, side: THREE.BackSide })
  );
  earthMesh.add(atmoGlow);

  const regolithTex = createRegolithTexture();
  const planeGeo = new THREE.PlaneGeometry(260, 260, 180, 180);
  planeGeo.rotateX(-Math.PI / 2);
  const posAttr = planeGeo.attributes.position;
  for (let i = 0; i < posAttr.count; i++) {
    posAttr.setY(i, getTerrainHeight(posAttr.getX(i), posAttr.getZ(i)));
  }
  planeGeo.computeVertexNormals();

  const terrainMesh = new THREE.Mesh(
    planeGeo,
    new THREE.MeshStandardMaterial({
      color: world.terrainColor,
      map: regolithTex,
      bumpMap: regolithTex,
      bumpScale: 0.18,
      roughness: 0.92,
      metalness: 0.06,
    })
  );
  terrainMesh.receiveShadow = true;
  group.add(terrainMesh);

  const roverGroup = buildDetailedRover();
  const roverX = 4.2, roverZ = -6.5;
  roverGroup.position.set(roverX, getTerrainHeight(roverX, roverZ), roverZ);
  roverGroup.rotation.y = -0.55;
  group.add(roverGroup);

  const habitatGroup = buildHabitatBase();
  const habX = -26, habZ = -48;
  habitatGroup.position.set(habX, getTerrainHeight(habX, habZ) - 0.3, habZ);
  group.add(habitatGroup);

  const rockGeo = new THREE.DodecahedronGeometry(0.65, 1);
  const rockMat = new THREE.MeshStandardMaterial({
    color: world.rockColor,
    bumpMap: regolithTex,
    bumpScale: 0.08,
    roughness: 0.9,
    metalness: 0.08,
  });
  const rockCount = 320;
  const rocksInstanced = new THREE.InstancedMesh(rockGeo, rockMat, rockCount);
  rocksInstanced.castShadow = true;
  rocksInstanced.receiveShadow = true;

  const dummy = new THREE.Object3D();
  for (let i = 0; i < rockCount; i++) {
    const rx = (Math.random() - 0.5) * 160;
    const rz = (Math.random() - 0.5) * 160;
    if (Math.abs(rx) < 6 && Math.abs(rz + 2) < 9) continue;
    const ry = getTerrainHeight(rx, rz);
    dummy.position.set(rx, ry + 0.12, rz);
    const s = Math.random() * 1.35 + 0.2;
    dummy.scale.set(s, s * (0.55 + Math.random() * 0.4), s);
    dummy.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
    dummy.updateMatrix();
    rocksInstanced.setMatrixAt(i, dummy.matrix);
  }
  group.add(rocksInstanced);

  const beaconPos = new THREE.Vector3(habX - 6.5, getTerrainHeight(habX, habZ) + 11.2, habZ - 2);

  return {
    group,
    height: getTerrainHeight,
    rover: roverGroup,
    earth: earthMesh,
    beacon: beaconPos,
    half: 130,
    world,
    dispose() {
      regolithTex.dispose();
      earthTex.dispose();
      group.traverse(o => {
        o.geometry?.dispose?.();
        const list = Array.isArray(o.material) ? o.material : o.material ? [o.material] : [];
        list.forEach(mm => mm.dispose());
      });
    },
  };
}

// ---------- HUD ----------
const RANGE = { hr: [40, 200], sys: [80, 200], rr: [0, 40], spo2: [80, 100], temp: [35, 40], sleep: [0, 10], dose: [0, 30, true], signal: [0, 100], sans: [0, 100] };
function segs(key, value, status, n = 16) {
  const [lo, hi, sqrt] = RANGE[key];
  let f = Number.isFinite(value) ? clamp((value - lo) / (hi - lo), 0, 1) : 0;
  if (sqrt) f = Math.sqrt(f);
  const lit = Math.round(f * n);
  return `<span class="vr-seg st-${status}" aria-hidden="true">${Array.from({ length: n }, (_, i) => `<i class="${i < lit ? "on" : ""}"></i>`).join("")}</span>`;
}
const row = (label, value, unit, status, key, raw, extra = "") =>
  `<div class="vr-row st-${status}"><div class="vr-row-head"><span>${label}</span><em>${WORD[status]}</em></div><div class="vr-row-val"><b>${value}</b><small>${unit}</small>${extra}</div>${segs(key, raw, status)}</div>`;

function topNavHTML(snap, nav) {
  const member = snap.member, g = GRAVITY[snap.terrain];
  const heading = nav.heading, ticks = [];
  for (let t = Math.ceil((heading - 60) / 15) * 15; t <= heading + 60; t += 15) {
    const deg = ((t % 360) + 360) % 360, label = { 0: "N", 45: "NE", 90: "E", 135: "SE", 180: "S", 225: "SW", 270: "W", 315: "NW" }[deg];
    ticks.push(`<i style="left:${50 + (t - heading) / 120 * 100}%" class="${label ? "major" : ""}">${label ?? ""}</i>`);
  }
  return `
    <div class="vr-compass"><div class="vr-compass-track">${ticks.join("")}</div><b class="vr-compass-read">${String(Math.round(heading) % 360).padStart(3, "0")}°</b></div>
    <div class="vr-hud-title"><b>ASTRA EVA</b><span>${g.label}</span><span>${nav.met}</span><span>WPT ${nav.waypoint} m</span></div>
    <div class="vr-hud-crew">${esc(member.name.toUpperCase())} // ${esc(member.role.toUpperCase())}</div>`;
}

function hudHTML(snap, nav) {
  const v = snap.vitals, a = snap.assessment, st = a.statuses;
  const bp = Number.isFinite(v.sys) && Number.isFinite(v.dia) ? `${v.sys.toFixed(0)}/${v.dia.toFixed(0)}` : "--";
  const bpStatus = [st.sys, st.dia].includes("critical") ? "critical" : [st.sys, st.dia].includes("caution") ? "caution" : st.sys;
  const top = a.alerts[0];
  return `
  <div class="vr-hud-top">${topNavHTML(snap, nav)}</div>
  <div class="vr-hud-col vr-left">
    <div class="vr-card">${row("HEART RATE", fmtv(v.hr), "bpm", st.hr, "hr", v.hr, `<span class="vr-delta">${pctDelta(v)} vs EVA BASE ${fmtv(v.hrBase)}</span>`)}</div>
    <div class="vr-card">${row("BLOOD PRESSURE", bp, "mmHg", bpStatus, "sys", v.sys)}${row("SANS OCULAR RISK", SANS_WORD(v), Number.isFinite(v.sans) ? `${v.sans.toFixed(0)}/100` : "", st.sans, "sans", v.sans)}</div>
    <div class="vr-card">${row("RESPIRATION", fmtv(v.rr), "rpm", st.rr, "rr", v.rr)}${row("SPO2", fmtv(v.spo2), "%", st.spo2, "spo2", v.spo2)}</div>
  </div>
  <div class="vr-hud-col vr-right">
    <div class="vr-card">${row("CORE TEMP", fmtv(v.temp, 1), "°C", st.temp, "temp", v.temp)}${row("SLEEP", fmtv(v.sleep, 1), "h", st.sleep, "sleep", v.sleep)}</div>
    <div class="vr-card">${row("RADIATION DOSE", fmtv(v.dose, 2), "mGy/day", st.dose, "dose", v.dose)}</div>
    <div class="vr-card vr-signal">${row("SIGNAL QUALITY", fmtv(v.signal), "%", st.signal, "signal", v.signal)}<div class="vr-gate-line ${a.gated ? "on" : ""}">${a.gated ? `MOTION ARTIFACT GATE // ALARMS HELD < ${SIGNAL_GATE}%` : `GATE ARMED // ${SIGNAL_GATE}% THRESHOLD`}</div></div>
  </div>
  <div class="vr-reticle" aria-hidden="true"><i></i></div>
  ${a.gated ? `<div class="vr-gate">HOLD STILL FOR RE-CHECK<small>SIGNAL ${fmtv(v.signal)}% // PHYSIO ALARMS HELD</small></div>` : ""}
  ${a.standby ? `<div class="vr-standby">ONBOARD BIOMETRIC STREAM // STANDBY<small>AWAITING LIVE DATA</small></div>` : ""}
  <div class="vr-hud-bottom">
    <span class="vr-status st-${a.overall}">${WORD[a.overall]}</span>
    <span class="vr-alert st-${top?.level ?? "nominal"}">${top ? esc(top.text) : a.standby ? "ALL CHANNELS --" : "ALL CHANNELS NOMINAL"}</span>
    <span class="vr-src">${esc(snap.source)}</span>
  </div>`;
}

// ---------- Helmet ----------
export function createHelmetSim({ link = astraLink() } = {}) {
  const canvas = el("canvas", { class: "vr-canvas", tabindex: "0", "aria-label": "First-person EVA view. Drag to look, W A S D or arrow keys to walk, Space to jump, Shift to run." });
  const hud = el("div", { class: "vr-hud", "aria-live": "off" });
  const hudL = el("div", { class: "vr-hud" }), hudR = el("div", { class: "vr-hud" });
  const eyes = el("div", { class: "vr-eyes", hidden: true }, el("div", { class: "vr-eye" }, hudL), el("div", { class: "vr-eye" }, hudR));
  const fail = el("div", { class: "vr-fail", hidden: true });
  const glass = el("div", { class: "vr-glass" }, canvas, hud, eyes, fail);
  const helmet = el("div", { class: "vr-helmet", "data-split": "false" }, glass, el("span", { class: "vr-shell-tag" }, "ASTRA EVA VISOR // HUD REV 2"));
  const readout = el("p", { class: "vr-sr", role: "status", "aria-live": "polite" });

  const crewBar = el("div", { class: "vr-crew", role: "group", "aria-label": "Crew member in the HUD" },
    CREW.map(m => el("button", { type: "button", "data-crew": m.id, title: `${m.role} // ${m.focus}`, onclick: () => link.setCrew(m.id) }, m.name)));
  const terrainBar = el("div", { class: "vr-seg-toggle", role: "group", "aria-label": "Surface" },
    Object.entries(GRAVITY).map(([key, g]) => el("button", { type: "button", "data-terrain": key, onclick: () => link.setTerrain(key) }, g.label)));
  const splitButton = el("button", { type: "button", class: "vr-btn", "aria-pressed": "false", onclick: () => setSplit(!split) }, "VR Split-Screen Headset Mode");
  const resetButton = el("button", { type: "button", class: "vr-btn", onclick: () => resetPlayer() }, "Reset view");
  const fullButton = el("button", { type: "button", class: "vr-btn", onclick: () => (document.fullscreenElement ? document.exitFullscreen() : helmet.requestFullscreen?.()) }, "Fullscreen");
  const pad = el("div", { class: "vr-pad", "aria-label": "Touch movement" },
    [["KeyW", "▲", "Walk forward"], ["KeyA", "◀", "Turn left"], ["KeyS", "▼", "Walk back"], ["KeyD", "▶", "Turn right"], ["Space", "JUMP", "Jump"]].map(([code, text, label]) =>
      el("button", { type: "button", "data-code": code, "aria-label": label, onpointerdown: e => { e.preventDefault(); keys.add(code); }, onpointerup: () => keys.delete(code), onpointerleave: () => keys.delete(code), onpointercancel: () => keys.delete(code) }, text)));
  const toolbar = el("div", { class: "vr-toolbar" }, crewBar, el("div", { class: "vr-tools" }, terrainBar, splitButton, resetButton, fullButton),
    el("small", { class: "vr-hint" }, "DRAG LOOK / WASD OR ARROWS WALK / SHIFT RUN / SPACE JUMP"));
  const override = createOverridePanel(link, { title: "Standby (--) / Live Override" });
  const element = el("section", { class: "vr-host", "aria-label": "VR EVA helmet HUD", hidden: true },
    el("div", { class: "vr-layout" }, el("div", { class: "vr-stage" }, el("div", { class: "vr-helmet-wrap" }, helmet, pad), toolbar, readout), el("aside", { class: "vr-side" }, override)));

  let renderer = null, scene = null, camera = null, eyeL = null, eyeR = null, world = null, worldKind = null, raf = 0, active = false, split = false, last = 0, hudAt = 0, lastMoveAt = 0;
  const keys = new Set(), player = { x: 0, z: 7.5, y: 0, vy: 0, yaw: 0, pitch: -0.02, grounded: true, phase: 0 };
  const t0 = performance.now();
  let snap = link.state;

  function initGL() {
    if (renderer) return true;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
    } catch (error) {
      fail.hidden = false; fail.textContent = "WEBGL UNAVAILABLE // HUD TELEMETRY CONTINUES"; console.error(error); return false;
    }
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(64, 1, 0.05, 1200); camera.rotation.order = "YXZ";
    eyeL = new THREE.PerspectiveCamera(78, 1, 0.05, 1200); eyeR = eyeL.clone();
    new ResizeObserver(resize).observe(glass);
    resize();
    return true;
  }
  function setWorld(kind) {
    if (!scene || kind === worldKind) return;
    if (world) { scene.remove(world.group); world.dispose(); }
    world = buildWorld(kind); worldKind = kind; scene.add(world.group);
    scene.background = new THREE.Color(world.world.sky);
    scene.fog = world.world.fog ? new THREE.FogExp2(world.world.fog[0], world.world.fog[1]) : null;
    resetPlayer();
  }
  function resetPlayer() { Object.assign(player, { x: 0, z: 7.5, vy: 0, yaw: 0, pitch: -0.02, grounded: true }); player.y = world ? world.height(0, 7.5) : 0; }
  function resize() {
    if (!renderer) return;
    const w = glass.clientWidth || 800, h = glass.clientHeight || 450;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
    eyeL.aspect = eyeR.aspect = w / 2 / h; eyeL.updateProjectionMatrix(); eyeR.updateProjectionMatrix();
  }
  function setSplit(on) {
    split = on; helmet.dataset.split = String(on); splitButton.setAttribute("aria-pressed", String(on));
    hud.hidden = on; eyes.hidden = !on; drawHud(true);
  }

  function step(now) {
    raf = requestAnimationFrame(step);
    const dt = Math.min(0.05, (now - (last || now)) / 1000); last = now;
    if (!world) return;
    const g = GRAVITY[worldKind].ms2, run = keys.has("ShiftLeft") || keys.has("ShiftRight");
    const fwd = (keys.has("KeyW") || keys.has("ArrowUp") ? 1 : 0) - (keys.has("KeyS") || keys.has("ArrowDown") ? 1 : 0);
    const turn = (keys.has("KeyA") || keys.has("ArrowLeft") ? 1 : 0) - (keys.has("KeyD") || keys.has("ArrowRight") ? 1 : 0);
    player.yaw += turn * dt * 1.3;
    const speed = (run ? 4.2 : 2.2) * fwd;
    if (speed) { player.x -= Math.sin(player.yaw) * speed * dt; player.z -= Math.cos(player.yaw) * speed * dt; player.phase += dt * (run ? 6 : 4) * Math.sqrt(g / 9.81) * 2; }
    const lim = world.half - 25; player.x = clamp(player.x, -lim, lim); player.z = clamp(player.z, -lim, lim);
    const ground = world.height(player.x, player.z);
    if (keys.has("Space") && player.grounded) { player.vy = 2.3; player.grounded = false; }
    if (!player.grounded) { player.vy -= g * dt; player.y += player.vy * dt; if (player.y <= ground) { player.y = ground; player.vy = 0; player.grounded = true; } }
    else player.y = ground;
    // Low gravity: a longer, softer loping gait. Bob amplitude scales with sqrt(9.81/g).
    const bob = speed ? Math.abs(Math.sin(player.phase)) * 0.045 * Math.sqrt(9.81 / g) : 0;
    camera.position.set(player.x, player.y + 1.85 + bob, player.z);
    camera.rotation.set(player.pitch, player.yaw, 0);
    const spin = world.rover.userData.spin; if (spin) spin.rotation.y += dt * 0.4;
    if (world.earth) world.earth.rotation.y += dt * 0.05;

    const w = glass.clientWidth, h = glass.clientHeight;
    if (split) {
      renderer.setScissorTest(true);
      [[eyeL, -1, 0], [eyeR, 1, w / 2]].forEach(([eye, sign, x]) => {
        eye.position.copy(camera.position); eye.quaternion.copy(camera.quaternion); eye.translateX(sign * 0.032);
        renderer.setViewport(x, 0, w / 2, h); renderer.setScissor(x, 0, w / 2, h); renderer.render(scene, eye);
      });
      renderer.setScissorTest(false); renderer.setViewport(0, 0, w, h);
    } else renderer.render(scene, camera);
    if (keys.size > 0 || drag) {
      lastMoveAt = now;
      if (helmet.dataset.moving !== "true") helmet.dataset.moving = "true";
    } else if (helmet.dataset.moving === "true" && now - lastMoveAt > 2200) {
      helmet.dataset.moving = "false";
    }
    if (now - hudAt > 200) drawNav();
  }
  function nav() {
    const heading = ((-player.yaw * 180 / Math.PI) % 360 + 360) % 360;
    const secs = Math.floor((performance.now() - t0) / 1000) + 3 * 3600 + 22 * 60;
    const met = `MET 147:${String(Math.floor(secs / 3600) % 24).padStart(2, "0")}:${String(Math.floor(secs / 60) % 60).padStart(2, "0")}:${String(secs % 60).padStart(2, "0")}`;
    const waypoint = world ? Math.round(Math.hypot(world.beacon.x - player.x, world.beacon.z - player.z)) : "--";
    return { heading, met, waypoint };
  }
  function drawNav() {
    hudAt = performance.now();
    const topMarkup = topNavHTML(snap, nav());
    if (split) {
      const tL = hudL.querySelector(".vr-hud-top"), tR = hudR.querySelector(".vr-hud-top");
      if (tL && tR) { tL.innerHTML = topMarkup; tR.innerHTML = topMarkup; } else drawHud();
    } else {
      const t = hud.querySelector(".vr-hud-top");
      if (t) t.innerHTML = topMarkup; else drawHud();
    }
  }
  function drawHud(force = false) {
    hudAt = performance.now();
    const html = hudHTML(snap, nav());
    if (split) { hudL.innerHTML = html; hudR.innerHTML = html; } else hud.innerHTML = html;
    if (force) readout.textContent = `${snap.member.name}. ${WORD[snap.assessment.overall]}. ${snap.assessment.alerts[0]?.text ?? ""}`;
  }

  link.subscribe(next => {
    const crewChanged = next.crewId !== snap?.crewId;
    snap = next;
    crewBar.querySelectorAll("button").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.crew === next.crewId)));
    terrainBar.querySelectorAll("button").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.terrain === next.terrain)));
    if (active) setWorld(next.terrain);
    if (crewChanged && active) resetPlayer();
    drawHud(true);
  });

  const typing = t => t && (t.isContentEditable || ["INPUT", "TEXTAREA", "SELECT", "BUTTON"].includes(t.tagName));
  const MOVE = new Set(["KeyW", "KeyA", "KeyS", "KeyD", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space", "ShiftLeft", "ShiftRight"]);
  addEventListener("keydown", e => { if (!active || typing(e.target) || !MOVE.has(e.code)) return; keys.add(e.code); e.preventDefault(); });
  addEventListener("keyup", e => keys.delete(e.code));
  addEventListener("blur", () => keys.clear());
  let drag = null;
  canvas.addEventListener("pointerdown", e => { drag = { x: e.clientX, y: e.clientY }; canvas.setPointerCapture?.(e.pointerId); canvas.focus({ preventScroll: true }); });
  canvas.addEventListener("pointermove", e => {
    if (!drag) return;
    player.yaw -= (e.clientX - drag.x) * 0.0035; player.pitch = clamp(player.pitch - (e.clientY - drag.y) * 0.0035, -1.2, 1.2);
    drag = { x: e.clientX, y: e.clientY };
  });
  const endDrag = () => { drag = null; };
  canvas.addEventListener("pointerup", endDrag); canvas.addEventListener("pointercancel", endDrag);

  return {
    element, link,
    show() {
      element.hidden = false; if (active) return; active = true;
      if (initGL()) { setWorld(snap.terrain); resize(); last = 0; raf = requestAnimationFrame(step); }
      drawHud(true);
    },
    hide() { element.hidden = true; active = false; keys.clear(); cancelAnimationFrame(raf); },
  };
}

// ---------- Standby / live override controller ----------
const FIELDS = ["hr", "hrBase", "sys", "dia", "rr", "spo2", "temp", "sleep", "dose", "signal", "sans"];
const SAMPLE_CSV = "crew,terrain,hr,hrBase,sys,dia,rr,spo2,temp,sleep,dose,signal,sans\nomar,moon,96,99,118,76,16,98,36.9,7.3,1.37,96,18\nomar,moon,118,99,121,78,19,97,37.1,7.3,1.37,94,18\nomar,moon,166,99,123,79,30,90,37.2,7.3,1.37,48,18\nomar,moon,131,99,122,78,22,96,37.3,7.3,1.37,91,18\nomar,moon,104,99,120,77,17,97,37.2,7.3,24.6,95,18\n";

export function createOverridePanel(link = astraLink(), { title = "Standby (--) / Live Override", compact = false } = {}) {
  const inputs = {};
  const source = el("span", { class: "vr-chip" }), who = el("b", {}), status = el("span", { class: "vr-chip" }), note = el("small", { class: "vr-note", role: "status" });
  const rows = FIELDS.map(key => {
    const def = FIELD_DEFS[key];
    const range = el("input", { type: "range", min: def.min, max: def.max, step: def.step, "aria-label": `${def.label} slider` });
    const num = el("input", { type: "number", min: def.min, max: def.max, step: def.step, placeholder: "--", "aria-label": `${def.label} (${def.unit})` });
    const push = value => link.setVitals({ [key]: value === "" ? null : Number(value) });
    range.addEventListener("input", () => { num.value = range.value; push(range.value); });
    num.addEventListener("change", () => push(num.value));
    inputs[key] = { range, num, def };
    return el("label", { class: "vr-field", "data-key": key }, el("span", {}, def.label, el("small", {}, def.unit)), range, num);
  });
  const file = el("input", { type: "file", accept: ".csv,.json,application/json,text/csv", class: "vr-file", "aria-label": "Upload telemetry dataset (CSV or JSON)" });
  file.addEventListener("change", async () => {
    const f = file.files?.[0]; if (!f) return;
    try { const rows = parseDataset(await f.text(), f.name); link.loadDataset(rows, f.name.replace(/\.[^.]+$/, "")); note.textContent = `${rows.length} row${rows.length === 1 ? "" : "s"} loaded from ${f.name}${rows.length > 1 ? " // replay 1 row/s" : ""}`; }
    catch (error) { note.textContent = `DATASET REJECTED // ${error.message}`; }
    file.value = "";
  });
  const sample = el("a", { class: "vr-link", href: URL.createObjectURL?.(new Blob([SAMPLE_CSV], { type: "text/csv" })) ?? "#", download: "astra-eva-sample.csv" }, "Sample CSV");
  const stop = el("button", { type: "button", class: "vr-btn", hidden: true, onclick: () => link.stopReplay() }, "Stop replay");
  const element = el("section", { class: `vr-override ${compact ? "vr-override-compact" : ""}`, "aria-label": title },
    el("header", {}, el("span", { class: "vr-eyebrow" }, title), el("div", { class: "vr-override-who" }, who, status, source)),
    el("div", { class: "vr-actions" },
      el("button", { type: "button", class: "vr-btn vr-btn-standby", onclick: () => { link.standby(); note.textContent = "STANDBY // all channels reset to --"; } }, "Standby (--)"),
      el("button", { type: "button", class: "vr-btn", onclick: () => { link.resetProfile(); note.textContent = "Crew SIM profile reloaded"; } }, "Reload crew profile")),
    el("div", { class: "vr-presets", role: "group", "aria-label": "Presets" }, Object.entries(PRESETS).map(([key, p]) =>
      el("button", { type: "button", class: "vr-btn vr-preset", "data-preset": key, onclick: () => { link.applyPreset(key); note.textContent = `PRESET // ${p.label}`; } }, p.label))),
    el("div", { class: "vr-fields" }, rows),
    el("div", { class: "vr-upload" }, el("label", { class: "vr-btn vr-upload-btn" }, "Upload CSV / JSON", file), sample, stop),
    note);

  link.subscribe(snap => {
    who.textContent = snap.member.name;
    source.textContent = snap.source;
    status.textContent = WORD[snap.assessment.overall]; status.className = `vr-chip st-${snap.assessment.overall}`;
    stop.hidden = !snap.replaying;
    for (const [key, { range, num, def }] of Object.entries(inputs)) {
      const v = snap.vitals[key], focused = document.activeElement === range || document.activeElement === num;
      if (focused) continue;
      num.value = Number.isFinite(v) ? Number(v.toFixed(def.digits)) : "";
      range.value = Number.isFinite(v) ? v : def.min;
      range.dataset.blank = String(!Number.isFinite(v));
      range.closest(".vr-field").dataset.status = snap.assessment.statuses[key] ?? "nominal";
    }
  });
  return element;
}

// ---------- Compact telemetry strip (Today, My Health, Crew) ----------
export function createTelemetryStrip(link = astraLink(), { onOpenHud, label = "ONBOARD BIOMETRIC STREAM", compact = false } = {}) {
  const element = el("section", { class: `vr-strip ${compact ? "vr-strip-compact" : ""}`, "aria-label": "Live HUD telemetry", "aria-live": "polite" });
  link.subscribe(snap => {
    const v = snap.vitals, a = snap.assessment, st = a.statuses;
    const bp = Number.isFinite(v.sys) && Number.isFinite(v.dia) ? `${v.sys.toFixed(0)}/${v.dia.toFixed(0)}` : "--";
    const cell = (name, value, unit, status) => el("div", { class: `vr-strip-cell st-${status}` }, el("small", {}, name), el("b", {}, value, el("i", {}, unit)), el("em", {}, WORD[status]));
    element.replaceChildren(
      el("header", {}, el("span", { class: "vr-eyebrow" }, label), el("span", { class: `vr-chip st-${a.overall}` }, WORD[a.overall]),
        el("strong", {}, `${snap.member.name} // ${GRAVITY[snap.terrain].label}`), el("span", { class: "vr-chip" }, snap.source),
        onOpenHud ? el("button", { type: "button", class: "vr-btn", onclick: onOpenHud }, "Open VR Helmet HUD") : null),
      el("div", { class: "vr-strip-cells" },
        cell("HR", fmtv(v.hr), " bpm", st.hr), cell("ΔBASE", pctDelta(v), "", st.hr), cell("BP", bp, " mmHg", [st.sys, st.dia].includes("critical") ? "critical" : [st.sys, st.dia].includes("caution") ? "caution" : st.sys),
        cell("SANS", SANS_WORD(v), "", st.sans), cell("RESP", fmtv(v.rr), " rpm", st.rr), cell("SPO2", fmtv(v.spo2), " %", st.spo2),
        cell("CORE", fmtv(v.temp, 1), " °C", st.temp), cell("SLEEP", fmtv(v.sleep, 1), " h", st.sleep), cell("DOSE", fmtv(v.dose, 2), " mGy/d", st.dose), cell("SIGNAL", fmtv(v.signal), " %", st.signal)),
      a.alerts.length ? el("p", { class: `vr-strip-alert st-${a.alerts[0].level}` }, a.alerts[0].text) : null);
  });
  return element;
}
