# ASTRA // Autonomous Astronaut Health & Digital Twin System

**NASA Space Apps Challenge Cairo 2026**
**Mission Track:** * ARTEMIS LUNAR & ARES MARS TRANSIT // Onboard Biometric Stream, VR EVA Helmet HUD & 3D Physiological Digital Twin*

---

## 1. System Overview

**ASTRA** is an offline-first spacecraft medical workstation and EVA visor telemetry simulator built for deep-space crew autonomy where one-way light time to Earth ranges from **1.3 seconds (Lunar surface)** to **3–22 minutes (Mars transit)**.

Website link = https://astra-lemon-chi.vercel.app/#twin

Instead of comparing astronauts only against static population averages, ASTRA evaluates each crew member against their own pre-flight and early-mission personal baseline while enforcing clinical safety floors (AHA 2017 blood pressure limits, ADA 2024 hypoglycemia floors, and NEWS2 respiratory/SpO2 bounds) and a deterministic **Motion Artifact Signal Gate (`<70%`)** that suppresses false physiological alarms during active EVA movement.

### Core Capabilities
1. **Native 3D VR EVA Helmet Visor Simulation (`#helmet` // `src/vrHelmetSim.js`)**:
   - First-person Three.js WebGL planetary surface renderer supporting **Lunar Crater & LRV Rover (`MOON 0.16g`)** and **Martian Red-Ochre & 6-Wheel Science Rover (`MARS 0.38g`)** environments.
   - Mouse-drag look, `WASD`/Arrow walking with gravity-scaled gait physics, `Shift` sprint, `Space` jump, and a stereoscopic **VR Split-Screen Headset Mode**.
   - Curved glassmorphic visor HUD (`#02050c`, `#071326`, `#7fe3ff`) displaying 16-segment telemetry bars for **Heart Rate vs. EVA Baseline (`Δ%`)**, **Blood Pressure & SANS Ocular Risk**, **Respiration & SpO2**, **Core Temp, Sleep & Radiation Dose (`mGy/day`)**, and **Signal Quality (`%`)** with automatic motion-artifact gating.
2. **Standby (`--`) / Live Telemetry Override & Two-Way Sync (`src/astraLink.js`)**:
   - Operators can reset all channels to blank standby (`--`) to demonstrate live sensor injection from scratch, adjust individual vitals sliders, trigger 1-click flight scenarios (`Nominal EVA`, `Motion Noise 42%`, `SANS Fluid Shift`, `Acute Tachycardia`, `Solar Radiation Spike`), or upload multi-row **CSV / JSON** telemetry datasets.
   - Synchronizes immediately across **VR Helmet HUD**, **Today**, **My Health**, and **Ground Control (Crew)** via shared state and `BroadcastChannel("astra_digital_twin")`.
3. **Interactive 3D Anatomical Digital Twin (`src/twinScene.js` & `src/twinApp.js`)**:
   - Renders the Z-Anatomy / BodyParts3D musculoskeletal and cardiovascular atlas with pulse-synchronized cardiac animation, weight-bearing skeletal unloading curves, and Euler–Bernoulli tibial impact stress reconstruction with 10,000-run Monte Carlo demand/capacity simulation.
4. **Daily Self-Check & Optical Capture (`src/selfCheckPanel.js` & `lab.html`)**:
   - Combines a 3-minute Psychomotor Vigilance Test (`PVT-B`), Samn–Perelli fatigue scoring, MediaPipe pose-tracked knee extension/ROM with quality gating (`>= 0.70`), and webcam rPPG pulse estimation.

---

## 2. Team ASTRA // 6-Member Crew Roster

Every member of Team ASTRA is represented in the onboard flight roster (`src/crewDemo.js` & `src/elenaMissionScenario.js`) with a distinct physiological profile sorted automatically by clinical priority for the Crew Medical Officer and Ground Flight Surgeon:

| Crew Member | Mission Role | Telemetry Profile & Operational Focus |
| --- | --- | --- |
| **Cmdr. Laila Yasser** | Mission Commander | Primary active digital twin profile (`ARTEMIS LUNAR & ARES MARS TRANSIT`); multisystem baseline tracking across 147 mission days |
| **Ibrahim Salah** | Network & Systems Architect | Elevated blood pressure (`144/92 mmHg`, AHA Stage 2) and Spaceflight-Associated Neuro-ocular Syndrome (SANS) headward fluid-shift watch |
| **Mahmoud Abdelnaby** | EVA Hardware & AR Specialist | Active lunar EVA suit motion artifact check (`Signal Quality 54% < 70%` gate holds false tachycardia alarm and requests a still re-check) |
| **Mohand Abdo** | Onboard Web Systems Engineer | Nominal steady telemetry across musculoskeletal, cardiovascular, and metabolic domains |
| **Marwan Hassan** | Bio-Analytics & ML Specialist | Sleep duration (`5.5 h`) and HRV/vigilance drift review (`RE-CHECK` at next window) |
| **Omar** | VR & Simulation Specialist | Lunar EVA surface profile (`MOON 0.16g`, `1.37 mGy/day` surface dosimetry baseline) |

---

## 3. Official NASA & CSA Evidence Architecture

All environmental rates, hazard mappings, and biological context tables in ASTRA trace directly to published NASA and Canadian Space Agency (CSA) sources (`src/healthEvidenceData.js`):

- **NASA Planetary Data System (PDS)**: https://pds.nasa.gov
- **NASA HRP 5 Hazards of Human Spaceflight**: https://www.nasa.gov/hrp/hazards/
- **NASA Ongoing HRP Research (SANS & Countermeasures)**: https://www.nasa.gov/hrp/ongoing-hrp-research/
- **CSA 2026 Radiation & Astronaut Health Monitoring**: https://www.asc-csa.gc.ca/eng/news/articles/2026/2026-02-26-monitoring-radiation-astronaut-health.asp
- **CSA ISS Space Health Science**: https://www.asc-csa.gc.ca/eng/iss/science/why-do-we-conduct-science-experiments-in-space.asp
- **NASA Open Science Data Repository (OSDR)**: Studies `OSD-804`, `OSD-656`, `OSD-569`, `OSD-575`, and `OSD-435`, plus **NASA DONKI** solar energetic particle (SEP) telemetry and **MSL/RAD** Mars cruise dosimetry (`0.458 mGy/day`, Guo et al. 2015).

---

## 4. Color Palette & Flight Console Standards

ASTRA enforces a strict deep-space cockpit palette across both CSS (`src/uiV5.css`, `src/twin.css`, `src/vrHelmet.css`) and WebGL overlays (`.antigravity/rules.md`):

- **Deep Space Navy**: `#02050c` / `#071326` / `rgba(8, 17, 34, 0.84)` / `rgba(7, 19, 38, 0.78)`
- **Primary Telemetry Cyan**: `#7fe3ff` / `#38bdf8`
- **Nominal Green**: `#34d399`
- **Caution Amber**: `#fbbf24`
- **Critical Red**: `#f87171`

Every coloured status indicator pairs its hue with an explicit console state word (`NOMINAL`, `CAUTION`, `CRITICAL`, `HELD`, `STANDBY`).

---

## 5. Run & Build Locally

### Prerequisites
- Node.js 20+ and npm

### Commands
```bash
# Install dependencies
npm install

# Start local development server (http://127.0.0.1:5173)
npm run dev

# Build production bundle into dist/
npm run build

# Run unit & telemetry verification suite
npm test
```

---

## 6. Attribution & License

Released under the MIT License (`LICENSE`). Anatomical meshes derive from Z-Anatomy / BodyParts3D (`CC BY-SA 4.0`, documented in `public/models/anatomy/SOURCE-LICENSE.txt` and `THIRD_PARTY_NOTICES.md`). Engineered by Team ASTRA for NASA Space Apps Cairo 2026.
