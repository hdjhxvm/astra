import { CREW, crewMember } from "./crewDemo.js";

// ASTRA live telemetry link. One shared state for the VR Helmet HUD, My Health, Today and the Crew
// (ground control) view. Every change is broadcast on BroadcastChannel("astra_digital_twin"), so a
// second tab or window (for example the HUD on a headset browser and the flight surgeon console on a
// laptop) stays in step.

export const CHANNEL_NAME = "astra_digital_twin";
export const VITAL_KEYS = ["hr", "hrBase", "sys", "dia", "rr", "spo2", "temp", "sleep", "dose", "signal", "sans"];
export const GRAVITY = { moon: { g: 0.16, ms2: 1.62, label: "MOON 0.16g" }, mars: { g: 0.38, ms2: 3.71, label: "MARS 0.38g" } };
export const SIGNAL_GATE = 70; // % below which physiological alarms are held (motion artifact gate)

export const FIELD_DEFS = {
  hr: { label: "Heart rate", unit: "bpm", min: 30, max: 220, step: 1, digits: 0 },
  hrBase: { label: "EVA baseline HR", unit: "bpm", min: 40, max: 160, step: 1, digits: 0 },
  sys: { label: "Systolic BP", unit: "mmHg", min: 70, max: 220, step: 1, digits: 0 },
  dia: { label: "Diastolic BP", unit: "mmHg", min: 40, max: 140, step: 1, digits: 0 },
  rr: { label: "Respiration", unit: "rpm", min: 4, max: 50, step: 1, digits: 0 },
  spo2: { label: "SpO2", unit: "%", min: 70, max: 100, step: 1, digits: 0 },
  temp: { label: "Core temp", unit: "°C", min: 34, max: 41, step: 0.1, digits: 1 },
  sleep: { label: "Sleep", unit: "h", min: 0, max: 12, step: 0.1, digits: 1 },
  dose: { label: "Radiation dose", unit: "mGy/day", min: 0, max: 60, step: 0.01, digits: 2 },
  signal: { label: "Signal quality", unit: "%", min: 0, max: 100, step: 1, digits: 0 },
  sans: { label: "SANS ocular index", unit: "/100", min: 0, max: 100, step: 1, digits: 0 },
};

const blank = () => Object.fromEntries(VITAL_KEYS.map(key => [key, null]));
const clampField = (key, value) => {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value), def = FIELD_DEFS[key];
  return Number.isFinite(n) ? Math.min(def.max, Math.max(def.min, n)) : null;
};
const profileVitals = member => {
  const { terrain, ...vitals } = member.eva;
  return { terrain, vitals: { ...blank(), ...vitals } };
};

// Operator presets for the demonstration. Each keeps the member's own EVA baseline.
export const PRESETS = {
  nominal: { label: "Nominal EVA", apply: (v, terrain) => ({ hr: Math.round((v.hrBase ?? 92) * 1.04), sys: 122, dia: 78, rr: 16, spo2: 98, temp: 36.9, sleep: 7.1, dose: terrain === "moon" ? 1.37 : 0.64, signal: 96, sans: 18 }) },
  motion: { label: "Motion Noise 42%", apply: v => ({ signal: 42, hr: 168, rr: 31, spo2: 89 }) },
  sans: { label: "SANS Fluid Shift", apply: () => ({ sys: 144, dia: 92, hr: 84, rr: 15, signal: 95, sans: 72 }) },
  tachy: { label: "Acute Tachycardia", apply: () => ({ hr: 158, rr: 26, spo2: 95, temp: 37.4, signal: 93 }) },
  spe: { label: "Solar Radiation Spike", apply: () => ({ dose: 24.6, signal: 95 }) },
};

// Status per field. Sources: AHA 2017 BP categories (stage 2 at 140/90, crisis at 180/120);
// SpO2 and respiration bands from standard adult early-warning scoring (NEWS2, RCP 2017);
// SANS index is an ASTRA composite watch score; dose bands use the lunar surface rate
// (1.37 mGy/day, Chang'e-4 LND) as the upper nominal edge and treat >10 mGy/day as an SPE condition.
export function fieldStatus(key, v) {
  const x = v[key];
  if (x === null || x === undefined) return "standby";
  switch (key) {
    case "hr": {
      if (x >= 150 || x < 40) return "critical";
      const d = v.hrBase ? Math.abs(x - v.hrBase) / v.hrBase : 0;
      return d >= 0.3 ? "critical" : d >= 0.15 ? "caution" : "nominal";
    }
    case "sys": return x >= 180 || x < 85 ? "critical" : x >= 140 || x < 95 ? "caution" : "nominal";
    case "dia": return x >= 120 ? "critical" : x >= 90 ? "caution" : "nominal";
    case "rr": return x > 28 || x < 8 ? "critical" : x > 20 || x < 12 ? "caution" : "nominal";
    case "spo2": return x < 90 ? "critical" : x < 95 ? "caution" : "nominal";
    case "temp": return x >= 38.5 || x < 35.5 ? "critical" : x >= 37.6 || x < 36.0 ? "caution" : "nominal";
    case "sleep": return x < 5 ? "critical" : x < 6 ? "caution" : "nominal";
    case "dose": return x > 10 ? "critical" : x > 1.5 ? "caution" : "nominal";
    case "signal": return x < SIGNAL_GATE ? "critical" : x < 85 ? "caution" : "nominal";
    case "sans": return x >= 70 ? "critical" : x >= 40 ? "caution" : "nominal";
    default: return "nominal";
  }
}
const PHYSIO = ["hr", "sys", "dia", "rr", "spo2", "temp"];
export const SANS_WORD = v => (v.sans === null ? "--" : v.sans >= 70 ? "HIGH" : v.sans >= 40 ? "ELEVATED" : "LOW");

// Whole-picture assessment: the motion artifact gate holds physiological alarms when signal < 70 %.
export function assess(v) {
  const standby = VITAL_KEYS.every(key => key === "hrBase" || v[key] === null);
  const gated = v.signal !== null && v.signal < SIGNAL_GATE;
  const statuses = Object.fromEntries(VITAL_KEYS.map(key => [key, fieldStatus(key, v)]));
  if (gated) for (const key of PHYSIO) if (statuses[key] !== "standby") statuses[key] = "held";
  const rank = { critical: 3, caution: 2, nominal: 1, held: 0, standby: 0 };
  const worst = Object.entries(statuses).filter(([key]) => key !== "signal" && key !== "hrBase").sort((a, b) => rank[b[1]] - rank[a[1]])[0];
  const alerts = [];
  if (gated) alerts.push({ level: "caution", text: `SIGNAL ${Math.round(v.signal)}% // MOTION ARTIFACT GATE // HOLD STILL FOR RE-CHECK` });
  if (statuses.hr === "critical") alerts.push({ level: "critical", text: `HR ${Math.round(v.hr)} BPM // ${v.hrBase ? `${pctDelta(v)} VS EVA BASELINE` : "OUT OF RANGE"} // PAUSE EVA TASK` });
  if (statuses.sys === "critical" || statuses.dia === "critical") alerts.push({ level: "critical", text: `BP ${v.sys}/${v.dia} MMHG // CRISIS RANGE // NOTIFY FLIGHT SURGEON` });
  else if (statuses.sys === "caution" || statuses.dia === "caution") alerts.push({ level: "caution", text: `BP ${v.sys}/${v.dia} MMHG // STAGE 2 // RECHECK SEATED IN 5 MIN` });
  if (statuses.sans !== "nominal" && statuses.sans !== "standby") alerts.push({ level: statuses.sans, text: `SANS INDEX ${v.sans} // HEADWARD FLUID SHIFT // OCULAR CHECK AT NEXT WINDOW` });
  if (statuses.spo2 === "critical") alerts.push({ level: "critical", text: `SPO2 ${v.spo2}% // CHECK SUIT O2 LOOP` });
  if (statuses.rr === "critical") alerts.push({ level: "critical", text: `RESP ${v.rr} RPM // SLOW BREATHING, CHECK CO2 SCRUB` });
  if (statuses.temp === "critical") alerts.push({ level: "critical", text: `CORE ${v.temp} °C // CHECK LCVG COOLING` });
  if (statuses.dose === "critical") alerts.push({ level: "critical", text: `DOSE ${v.dose} MGY/DAY // SOLAR PARTICLE EVENT // RETURN TO SHELTER` });
  else if (statuses.dose === "caution") alerts.push({ level: "caution", text: `DOSE ${v.dose} MGY/DAY // ABOVE SURFACE BACKGROUND // LIMIT EVA TIME` });
  if (statuses.sleep === "critical" || statuses.sleep === "caution") alerts.push({ level: "caution", text: `SLEEP ${v.sleep} H // FATIGUE WATCH // REVIEW TASK LOAD` });
  const order = { critical: 0, caution: 1 };
  alerts.sort((a, b) => order[a.level] - order[b.level]);
  const overall = standby ? "standby" : worst && rank[worst[1]] >= 2 ? worst[1] : gated ? "held" : "nominal";
  return { standby, gated, statuses, alerts, overall };
}
export function pctDelta(v) {
  if (!Number.isFinite(v.hr) || !Number.isFinite(v.hrBase) || !v.hrBase) return "--";
  const d = (v.hr - v.hrBase) / v.hrBase * 100;
  return `${d >= 0 ? "+" : "-"}${Math.abs(d).toFixed(0)}%`;
}

// Parse a CSV or JSON telemetry dataset into rows of {crew?, terrain?, ...vitals}.
const ALIAS = { heart_rate: "hr", heartrate: "hr", bpm: "hr", baseline: "hrBase", hr_base: "hrBase", hrbase: "hrBase", systolic: "sys", diastolic: "dia", resp: "rr", respiration: "rr", core_temp: "temp", temperature: "temp", sleep_hours: "sleep", radiation: "dose", dose_mgy_day: "dose", signal_quality: "signal", quality: "signal", sans_index: "sans" };
const normKey = key => { const k = String(key).trim().replace(/^\uFEFF/, ""); const lower = k.toLowerCase(); return ALIAS[lower] ?? (VITAL_KEYS.find(v => v.toLowerCase() === lower) ?? lower); };
export function parseDataset(text, name = "") {
  const trimmed = text.trim();
  let rows;
  if (/\.json$/i.test(name) || trimmed.startsWith("{") || trimmed.startsWith("[")) {
    const data = JSON.parse(trimmed);
    rows = Array.isArray(data) ? data : Array.isArray(data.rows) ? data.rows : [data];
  } else {
    const lines = trimmed.split(/\r?\n/).filter(line => line.trim());
    if (lines.length < 2) throw new Error("CSV needs a header row and at least one data row.");
    const head = lines[0].split(",").map(h => h.trim());
    rows = lines.slice(1).map(line => Object.fromEntries(line.split(",").map((cell, i) => [head[i], cell.trim()])));
  }
  const out = rows.map(row => {
    const r = {};
    for (const [key, value] of Object.entries(row)) {
      const k = normKey(key);
      if (k === "crew" || k === "terrain") r[k] = String(value).trim().toLowerCase();
      else if (VITAL_KEYS.includes(k)) r[k] = value === "" || value === "--" ? null : Number(value);
    }
    if (typeof row.bp === "string" && row.bp.includes("/")) { const [s, d] = row.bp.split("/").map(Number); r.sys = s; r.dia = d; }
    return r;
  }).filter(r => Object.keys(r).length);
  if (!out.length) throw new Error("No recognised telemetry columns (hr, sys, dia, rr, spo2, temp, sleep, dose, signal, sans).");
  return out;
}

const CREW_ALIASES = Object.fromEntries(CREW.flatMap(m => [[m.id, m.id], [m.name.toLowerCase(), m.id], [m.name.split(" ")[0].toLowerCase(), m.id]]));

function createLink() {
  const sender = Math.random().toString(36).slice(2);
  const first = CREW[0], start = profileVitals(first);
  const state = { crewId: first.id, terrain: start.terrain, vitals: start.vitals, source: "SIM PROFILE", rev: 0, at: Date.now() };
  const listeners = new Set();
  let channel = null;
  try {
    channel = typeof BroadcastChannel === "function" ? new BroadcastChannel(CHANNEL_NAME) : null;
    channel?.unref?.();
  } catch { channel = null; }
  let replay = null;

  const snapshot = () => ({ ...state, vitals: { ...state.vitals }, member: crewMember(state.crewId), assessment: assess(state.vitals), replaying: Boolean(replay) });
  const notify = (origin) => { const snap = snapshot(); for (const fn of listeners) { try { fn(snap, origin); } catch (error) { console.error(error); } } };
  function commit(origin = "local") {
    state.rev += 1; state.at = Date.now();
    if (origin === "local" && channel) channel.postMessage({ type: "astra-state", sender, state: { crewId: state.crewId, terrain: state.terrain, vitals: state.vitals, source: state.source, rev: state.rev, at: state.at } });
    notify(origin);
  }
  channel?.addEventListener("message", event => {
    const msg = event.data;
    if (!msg || msg.sender === sender) return;
    if (msg.type === "astra-state" && msg.state && crewMember(msg.state.crewId)) {
      state.crewId = msg.state.crewId; state.terrain = GRAVITY[msg.state.terrain] ? msg.state.terrain : state.terrain;
      state.vitals = { ...blank(), ...msg.state.vitals }; state.source = msg.state.source ?? "REMOTE";
      notify("remote");
    } else if (msg.type === "astra-hello") channel.postMessage({ type: "astra-state", sender, state: { crewId: state.crewId, terrain: state.terrain, vitals: state.vitals, source: state.source, rev: state.rev, at: state.at } });
  });
  channel?.postMessage({ type: "astra-hello", sender });

  const stopReplay = () => { if (replay) { clearInterval(replay.timer); replay = null; } };
  const api = {
    get state() { return snapshot(); },
    subscribe(fn) {
      listeners.add(fn);
      try { fn(snapshot(), "init"); } catch (error) { console.error(error); }
      return () => listeners.delete(fn);
    },
    setCrew(id, { keepVitals = false } = {}) {
      const member = crewMember(id); if (!member) return;
      stopReplay(); state.crewId = id;
      if (!keepVitals) { const p = profileVitals(member); state.vitals = p.vitals; state.terrain = p.terrain; state.source = "SIM PROFILE"; }
      commit();
    },
    setTerrain(terrain) { if (!GRAVITY[terrain] || terrain === state.terrain) return; state.terrain = terrain; commit(); },
    setVitals(partial, source = "OPERATOR OVERRIDE") {
      for (const [key, value] of Object.entries(partial)) if (VITAL_KEYS.includes(key)) state.vitals[key] = clampField(key, value);
      state.source = source; commit();
    },
    standby() { stopReplay(); const base = state.vitals.hrBase; state.vitals = { ...blank(), hrBase: base }; state.source = "STANDBY"; commit(); },
    applyPreset(key) { const preset = PRESETS[key]; if (!preset) return; stopReplay(); const base = crewMember(state.crewId).eva; if (state.vitals.hrBase === null) state.vitals.hrBase = base.hrBase; api.setVitals(preset.apply(state.vitals, state.terrain), `PRESET // ${preset.label.toUpperCase()}`); },
    resetProfile() { api.setCrew(state.crewId); },
    loadDataset(rows, name = "dataset") {
      stopReplay();
      const applyRow = (row, i) => {
        const id = row.crew ? CREW_ALIASES[row.crew] : null;
        if (id && id !== state.crewId) state.crewId = id;
        if (row.terrain && GRAVITY[row.terrain]) state.terrain = row.terrain;
        const { crew, terrain, ...vitals } = row;
        for (const [key, value] of Object.entries(vitals)) state.vitals[key] = clampField(key, value);
        state.source = `DATASET // ${name.toUpperCase()} ${rows.length > 1 ? `ROW ${i + 1}/${rows.length}` : ""}`.trim();
        commit();
      };
      applyRow(rows[0], 0);
      if (rows.length > 1) {
        let i = 1;
        replay = { timer: setInterval(() => { if (i >= rows.length) { stopReplay(); notify("local"); return; } applyRow(rows[i], i); i += 1; }, 1000) };
      }
    },
    stopReplay() { stopReplay(); notify("local"); },
  };
  return api;
}

let shared = null;
export const astraLink = () => (shared ??= createLink());
