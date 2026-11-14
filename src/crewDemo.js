import { SELF_CHECK_SCHEMA } from "./selfCheck.js";
import { ELENA_HISTORY, ELENA_CHECK_DAYS, VITAL_PROTOCOLS, elenaDay147 } from "./elenaSelfCheck.js";

// Team ASTRA crew roster for the crew medical officer and the ground flight surgeon. Each member is
// judged by the same self-check engine against their own earlier checks, so the crew view sorts six
// people by one rule set. All records are SIM training profiles.
export const CREW_BOUNDARY = "SIM PROFILES // Team ASTRA six-member training roster. Live HUD values come from the VR Helmet stream or the operator override.";

const PROTOCOLS = { kneeExtension: "restrained-knee-extension-demo-v1", kneeRom: "restrained-knee-extension-demo-v1", pvtSpeed: "pvt-b-3min-v2:touch", pvtLapses: "pvt-b-3min-v2:touch", restingHr: "resting-restrained-demo-v1", ...VITAL_PROTOCOLS };
const DAYS = [1, 30, 60, 90, 120, 147];
const KEYS = ["kneeExtension", "kneeRom", "restingHr", "systolicBp", "diastolicBp", "spo2", "glucose", "bodyTemp", "pvtSpeed", "pvtLapses", "sleepHours", "fatigue", "mood", "stress"];

// One row per checkpoint day, values in KEYS order.
function records(profileId, rows) {
  return DAYS.map((day, i) => ({
    schema: SELF_CHECK_SCHEMA, id: `DEMO-${profileId}-day-${day}`, profileId: `DEMO-${profileId}`, missionDay: day, at: `Mission day ${day}`,
    values: Object.fromEntries(KEYS.map((key, k) => [key, rows[i][k]])), protocols: { ...PROTOCOLS },
    quality: Object.fromEntries(KEYS.map(key => [key, true])), sources: { all: "SYNTHETIC DEMO" }, redFlags: {}, symptoms: {}, notes: "", synthetic: true,
  }));
}
const missed = (...days) => Array.from({ length: 147 }, (_, i) => i + 1).filter(day => !days.includes(day));

//                       knee ext, rom, HR, sys, dia, SpO2, glucose, temp, pvt speed, lapses, sleep, fatigue, mood, stress
// Steady telemetry across the whole transit.
const MOHAND = records("MOHAND", [
  [168, 82, 58, 116, 74, 98, 86, 36.6, 4.4, 1, 7.2, 2, 8, 3],
  [167, 81, 59, 114, 73, 98, 87, 36.7, 4.5, 1, 7.0, 2, 8, 3],
  [168, 82, 58, 115, 74, 98, 86, 36.8, 4.4, 1, 7.1, 2, 8, 3],
  [166, 81, 60, 114, 72, 97, 88, 36.8, 4.5, 2, 6.9, 2, 8, 3],
  [167, 80, 59, 115, 73, 98, 87, 36.8, 4.4, 1, 7.0, 2, 8, 3],
  [166, 80, 60, 114, 73, 98, 88, 36.9, 4.4, 1, 7.0, 2, 8, 3],
]);
// Blood pressure climbing with headward fluid shift, over the AHA stage 2 line (140/90) on Day 147.
const IBRAHIM = records("IBRAHIM", [
  [163, 78, 64, 124, 80, 98, 92, 36.7, 4.1, 2, 6.6, 3, 7, 4],
  [162, 78, 65, 126, 81, 98, 93, 36.8, 4.1, 2, 6.5, 3, 7, 4],
  [163, 77, 66, 128, 82, 97, 93, 36.9, 4.0, 2, 6.4, 3, 7, 4],
  [161, 77, 66, 131, 84, 98, 94, 36.9, 4.1, 2, 6.5, 3, 7, 5],
  [162, 76, 67, 134, 86, 98, 94, 37.0, 4.0, 3, 6.4, 3, 7, 5],
  [161, 76, 68, 144, 92, 98, 95, 37.0, 4.0, 3, 6.3, 3, 6, 5],
]);
// One short night after a steady mission: outside his usual range once, re-check at the next check.
const MARWAN = records("MARWAN", [
  [170, 84, 56, 110, 70, 99, 84, 36.5, 4.6, 1, 7.4, 2, 8, 3],
  [169, 84, 57, 109, 70, 99, 85, 36.6, 4.6, 1, 7.3, 2, 8, 3],
  [170, 83, 56, 110, 71, 98, 85, 36.7, 4.5, 1, 7.4, 2, 8, 3],
  [169, 83, 57, 109, 70, 99, 84, 36.7, 4.6, 1, 7.2, 2, 8, 3],
  [169, 84, 57, 110, 70, 99, 85, 36.7, 4.6, 1, 7.3, 2, 8, 3],
  [169, 83, 57, 110, 71, 99, 85, 36.8, 4.5, 1, 5.5, 3, 7, 4],
]);
// EVA hardware tech: today's camera capture failed its quality gate (suit motion), so the knee test is repeated.
const MAHMOUD = records("MAHMOUD", [
  [166, 81, 61, 118, 76, 98, 88, 36.7, 4.3, 1, 7.0, 2, 8, 3],
  [166, 80, 61, 117, 75, 98, 89, 36.7, 4.3, 1, 6.9, 2, 8, 3],
  [165, 80, 62, 118, 76, 98, 88, 36.8, 4.3, 1, 7.0, 2, 8, 3],
  [165, 80, 61, 119, 76, 97, 89, 36.8, 4.2, 1, 6.9, 2, 8, 3],
  [165, 79, 62, 118, 75, 98, 88, 36.8, 4.3, 1, 7.0, 2, 8, 3],
  [138, 41, 62, 118, 76, 98, 89, 36.8, 4.3, 1, 6.9, 2, 8, 3],
]);
MAHMOUD.at(-1).quality.kneeExtension = false; MAHMOUD.at(-1).quality.kneeRom = false;
// Lunar surface EVA profile: steady, slightly higher workload heart rate after surface ops.
const OMAR = records("OMAR", [
  [167, 82, 60, 117, 75, 98, 87, 36.7, 4.5, 1, 7.4, 2, 8, 3],
  [167, 82, 60, 116, 75, 98, 87, 36.7, 4.5, 1, 7.3, 2, 8, 3],
  [166, 81, 61, 117, 76, 98, 88, 36.8, 4.4, 1, 7.4, 2, 8, 3],
  [166, 81, 60, 118, 75, 98, 87, 36.8, 4.5, 1, 7.3, 2, 8, 3],
  [166, 81, 61, 117, 76, 98, 88, 36.8, 4.5, 1, 7.4, 2, 8, 3],
  [166, 81, 61, 118, 76, 98, 88, 36.9, 4.5, 1, 7.3, 2, 8, 3],
]);

// Live EVA telemetry each member brings into the VR Helmet HUD (src/astraLink.js).
// terrain: "moon" (0.16 g) or "mars" (0.38 g). hrBase is the member's own EVA baseline.
// Dose rates: Moon surface 1.37 mGy/day (Chang'e-4 LND, Zhang et al., Sci. Adv. 2020);
// Mars surface 0.64 mGy/day (MSL/RAD, Hassler et al., Science 2014).
const eva = (terrain, hr, hrBase, sys, dia, rr, spo2, temp, sleep, dose, signal, sans) => Object.freeze({ terrain, hr, hrBase, sys, dia, rr, spo2, temp, sleep, dose, signal, sans });

const split = rows => ({ history: rows.slice(0, -1), today: rows.at(-1) });
export const CREW = Object.freeze([
  { id: "elena", name: "Laila Yasser", role: "Mission Commander", focus: "Multisystem baseline tracking", history: ELENA_HISTORY, today: elenaDay147(), checkDays: ELENA_CHECK_DAYS,
    eva: eva("mars", 104, 92, 118, 76, 17, 97, 37.1, 5.2, 0.64, 94, 28) },
  { id: "ibrahim", name: "Ibrahim Salah", role: "Network & Systems Architect", focus: "Elevated BP 144/92 mmHg / SANS fluid-shift watch", ...split(IBRAHIM), checkDays: missed(12, 58, 101),
    eva: eva("mars", 98, 90, 144, 92, 16, 98, 37.0, 6.3, 0.64, 95, 66) },
  { id: "mahmoud", name: "Mahmoud Abdelnaby", role: "EVA Hardware & AR Specialist", focus: "Motion artifact quality gate check", ...split(MAHMOUD), checkDays: missed(44, 45),
    eva: eva("moon", 171, 95, 124, 80, 18, 97, 36.9, 6.9, 1.37, 54, 20) },
  { id: "mohand", name: "Mohand Abdo", role: "Onboard Web Systems Engineer", focus: "Nominal steady telemetry", ...split(MOHAND), checkDays: missed(19, 20, 64, 140),
    eva: eva("moon", 94, 93, 116, 74, 15, 98, 36.8, 7.0, 1.37, 97, 15) },
  { id: "marwan", name: "Marwan Hassan", role: "Bio-Analytics & ML Specialist", focus: "Sleep & HRV drift review", ...split(MARWAN), checkDays: missed(77),
    eva: eva("mars", 101, 90, 114, 72, 17, 98, 36.9, 5.5, 0.64, 93, 22) },
  { id: "omar", name: "Omar", role: "VR & Simulation Specialist", focus: "Lunar EVA surface profile", ...split(OMAR), checkDays: missed(90, 91, 92),
    eva: eva("moon", 112, 99, 120, 78, 19, 97, 37.2, 7.3, 1.37, 92, 18) },
].map(Object.freeze));

export const crewMember = id => CREW.find(m => m.id === id) ?? null;
