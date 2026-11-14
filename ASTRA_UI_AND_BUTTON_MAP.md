# ASTRA UI, NAVIGATION & BUTTON AUDIT REPORT
**System:** ASTRA (Autonomous Astronaut Health & Digital Twin System)  
**Classification:** Read-Only Engineering Telemetry & Systems Audit  
**Target:** NASA Space Apps Cairo 2026 // Exploration Crew Health  

---

## 1. Exact File & Entry-Point Architecture

### 1.1 Web Entry Points & Script Bootloaders
| Entry Point HTML | Script Bootloader | Target Mounting Element | Runtime Scope & Role |
| :--- | :--- | :--- | :--- |
| `index.html` | `/src/twinMain.js` | `<div id="twin-root"></div>` | Main digital twin application, 3D anatomical viewer, astronaut self-check console, crew health dashboard, VR EVA helmet visor HUD, mission briefing tour, and evidence explorer. |
| `lab.html` | `/src/main.js` | `<div id="app"></div>` (and `#astro-particles`) | Live camera workspace, MediaPipe 3D pose retargeting, MotionGuard kinematic tracking, experimental respiratory monitor, Level-A impact reconstruction lab, and Astra telemetry copilot. |
| `public/twin.html` | Embedded redirect script | `document.location` | Legacy standalone redirect stub pointing directly back to `index.html#twin`. |

### 1.2 Stylesheet Bundles Loaded
* **`index.html` Bundle (via `src/twinMain.js`, `src/missionUpgrade.js`, and `src/vrHelmetSim.js`):**
  1. `src/twin.css`: Core layout, WebGL background canvas, 3D viewport anchors, landing overlay (`.tw-intro`), timeline scrubber, and system selector aside rail.
  2. `src/selfCheck.css`: 6-step astronaut self-check forms, camera preview, PVT-B reaction testing canvas, rPPG pulse scanner, and escalation ladder.
  3. `src/dashboard.css`: "My Health" personal dashboard, 6-member crew roster cards, adherence matrix, and telemetry summary tiles.
  4. `src/crewmate.css`: Acute pain triage workflow, warning sign chips, VAD speech analysis display, and handoff report pre-block.
  5. `src/missionUpgrade.css`: ASTRA telemetry banners, brand logo badging, full-screen evidence modal dialog (`.ab-evidence-dialog`), and personal dashboard grid.
  6. `src/vrHelmet.css`: 3D EVA helmet simulation container, curved visor glass overlays, HUD dual-eye split-screen renderer, 11-channel telemetry override drawer, and live telemetry strip.

* **`lab.html` Bundle (via `src/main.js`, `src/uiV5.js`, and modular component imports):**
  1. `src/styles.css`: Legacy base grid, topbar, workspace panes, camera video stream container, and utility classes.
  2. `src/uiV5.css`: ASTRA flight telemetry styling, deep space navy cards, status indicators, and modal review styling.
  3. `src/respiratoryIntegration.css`: Embedded daily breathing monitor shortcut and camera respiratory waveform cards.
  4. `src/technicalHuman.css`: Technical 3D rigged avatar wireframe framing, landmark overlay markers, and kinematic metrics.
  5. `src/companion.css`: Astra research copilot chat drawer and sliding side sheet.
  6. `src/healthEvidence.css`: NASA OSDR-804 gene expression charts and biological evidence summaries.
  7. `src/respiratoryPanel.css`: Standalone camera respiratory validation charts and spectral analysis.
  8. `src/researchWorkspace.css`: 4-stage workflow tabs, impact mechanics workbench, and bone capacity calculators.
  9. `src/anatomyAtlas.css`: Interactive anatomical structure drill-down cards.
  10. `src/densePose.css`: DensePose UV surface mesh mapping overlays.
  11. `src/anatomicalMotion.css`: Joint angle limit gauges and kinematic range trackers.
  12. `src/labTheme.css`: Cohesive dark telemetry theme overrides across `lab.html`.

### 1.3 3D Models, AI Weights, and Dataset Assets
| Category | File Path | Format / Size | Consumer Module | Operational Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **3D Anatomy** | `public/models/anatomy/musculoskeletal.glb` | glTF Binary (11.6 MB) | `src/twinScene.js` | 3D skeleton and muscle atlas used for reference anatomy and Euler-Bernoulli bending stress rendering. |
| **3D Anatomy** | `public/models/anatomy/musculoskeletal-rigged.glb` | glTF Binary (10.6 MB) | `src/selfCheckPanel.js` | Rigged skeletal mesh overlaid on real-time webcam pose during knee extension self-check. |
| **3D Anatomy** | `public/models/anatomy/cardiovascular.glb` | glTF Binary (2.3 MB) | `src/twinScene.js` | 3D pulmonary and systemic vascular tree pulsing at heart rate frequency. |
| **3D Human** | `public/models/human_body_clothed.glb` | glTF Binary (14.2 MB) | `src/main.js`, `src/humanRig.js` | 3D rigged astronaut avatar in `lab.html` driven by MediaPipe motion retargeting. |
| **AI Vision** | `public/models/pose_landmarker_lite.task` | MediaPipe Task (5.8 MB) | `src/poseRuntime.js` | 33-point real-time 3D skeletal pose estimator. |
| **AI Vision** | `public/models/face_landmarker.task` | MediaPipe Task (3.8 MB) | `src/faceCues.js` | 468-point facial mesh tracker for eye closure and mouth asymmetry analysis. |
| **AI Vision** | `public/models/hand_landmarker.task` | MediaPipe Task (7.8 MB) | `src/detailObservations.js` | 21-point hand articulation tracker. |
| **AI Vision** | `public/models/efficientdet_lite0_uint8.tflite` | TFLite (4.6 MB) | `src/objectDetection.worker.js` | Loose object detection in live video feed. |
| **AI Vision / Signal** | `public/models/me-rppg/model.onnx` | ONNX (2.5 MB) | `src/meRppg.js` | Deep neural network for remote photoplethysmography (contactless facial heart rate tracking). |
| **AI Audio** | `public/models/silero-vad/silero_vad.onnx` | ONNX (2.3 MB) | `src/speechCheck.js` | Voice activity detection model measuring speech pauses and syllable cadence. |
| **WASM Runtimes** | `public/mediapipe/vision_wasm_internal.wasm` | WebAssembly (11.8 MB) | MediaPipe Web Tasks | SIMD-threaded accelerated vision processing engine. |
| **Telemetry Sim** | `public/simulations/astra-level-a-v1.json` | JSON (31.0 KB) | `src/twinImpact.js` | Level-A impact dynamics benchmark data and 5,000-run Monte Carlo scenario reference. |
| **NASA OSDR** | `public/data/osdr-804-summary.json` | JSON (22.3 KB) | `src/healthLayers.js` | NASA Open Science Data Repository dataset on microgravity skeletal unloading. |
| **Flight Crew** | `public/data/i4-crew-blood.json` | JSON (30.4 KB) | `src/crewReplay.js` | Real pre/post-flight biometric analytes for baseline benchmarking. |
| **Radiation Data** | `public/data/donki-sep.json` | JSON (68.6 KB) | `src/spaceWeather.js` | Solar energetic particle records from NASA DONKI space weather observatory. |

---

## 2. Main Navigation & Screen-by-Screen Map (`index.html`)

### 2.1 State 0: Cinematic Landing Mode (`isLandingMode = true`)
* **Trigger Condition:** Initial application load or clicking the top-left `"ASTRA"` brand logo.
* **Visual Architecture:**
  * Top navigation bar (`.tw-header`) is hidden.
  * All background dashboard cards and stages (`.tw-stage`, `.ab-mission-overview`, `.ab-health-dashboard`) are hidden.
  * Full-screen WebGL canvas (`#tw-canvas`) runs an uninterrupted, smooth orbital rotation of the 3D musculoskeletal digital twin and space particle grid.
  * Centered hero overlay (`.tw-intro`) displays the 72x72px ASTRA mark, `"ASTRA TELEMETRY  FLIGHT BUILD"`, mission description, and 4 direct action buttons.
* **Transition Pathways:**
  * Click `"Start my check"`: Exits landing mode -> Selects `"you"` profile -> Switches to `selfcheck` view.
  * Click `"Open VR Helmet HUD"`: Exits landing mode -> Switches to `helmet` view.
  * Click `"Run flight briefing"`: Exits landing mode -> Switches to `mission` view -> Initiates guided demo tour.
  * Click `"Enter Console"`: Exits landing mode -> Switches to `mission` view (`Cmdr. Laila Yasser` flight telemetry console).

---

### 2.2 Top-Bar Navigation Experiences

#### Tab 1: Today (`experience = "mission"`)
* **Exact Label:** `Today`
* **Visual Layout:**
  * *Top Hero Strip:* Overview header with kicker `"ASTRA TELEMETRY  FLIGHT BUILD"`, crew profile notice, and quick CTA links to VR Helmet HUD, Daily Self-Check, and NASA Open Science Evidence.
  * *Left Telemetry Column:* 3 dual-row cards (`Musculoskeletal`, `Functional`, `Behavioral health`) connected to 3D anatomical anchor points via animated SVG bezier lines.
  * *Center 3D Viewport:* Full interactive 3D WebGL anatomical digital twin (`#tw-canvas`). Supports OrbitControls pan, zoom, rotate, and clickable anatomical structures.
  * *Right Telemetry Column:* 3 dual-row cards (`Cardiovascular`, `Immune`, `Radiation`) with SVG bezier anchor curves to heart, thorax, and whole-body tracks.
  * *Personal Dashboard (when `"you"` profile selected):* Switches into a personalized checklist displaying saved check counts, open follow-up actions, and vital sign status cards.
  * *Bottom Rail:* Interactive mission day timeline scrubber (Days 1 to 240) with Play/Pause animation controls and checkpoint jump buttons (`D1`, `D30`, `D60`, `D90`, `D120`, `D147`, `D180`, `D240`).
* **Transition Targets:** Clicking any body part opens the Part Card dialog (`.tw-partcard`); clicking left/right node cards switches to specific system views; timeline scrubber updates state dynamically.

#### Tab 2: VR Helmet HUD (`experience = "helmet"`)
* **Exact Label:** `VR Helmet HUD`
* **Visual Layout:**
  * *Left/Center Stage:* 3D first-person planetary surface EVA simulation rendered inside a curved helmet visor frame. Features procedural terrain (Moon craters or Mars dunes), animated rover with rotating antenna, landed exploration module, interactive reticle, and walking controls (WASD/Drag).
  * *Visor HUD Overlay:* Real-time flight telemetry head-up display showing MET mission elapsed time, waypoint distance, heart rate, blood pressure, SANS ocular risk score, respiration rate, SpO2, core body temperature, radiation dosimeter stream, and motion artifact signal gate alert (`HOLD STILL FOR RE-CHECK`).
  * *Top Control Bar:* 6-crew profile switcher buttons (`Laila`, `Ibrahim`, `Mahmoud`, `Mohand`, `Marwan`, `Omar`), surface environment toggle (`0.16g MOON` vs `0.38g MARS`), `VR Split-Screen Headset Mode` toggle, `Reset view`, and `Fullscreen`.
  * *Right Telemetry Override Drawer:* Comprehensive manual injection deck with 11 dual range/number sliders, `Standby (--)` emergency wipe button, `Reload crew profile` button, 4 one-click NASA incident preset buttons (`EVA Exercise`, `Tachycardia Warning`, `Hypertension Spike`, `Hypoxia Alert`), CSV/JSON file uploader, and sample dataset download link.
* **Transition Targets:** Real-time data syncs across the entire application via `astraLink` and `BroadcastChannel("astra-link")`.

#### Tab 3: My Health (`experience = "health"`)
* **Exact Label:** `My Health`
* **Visual Layout:**
  * *Top Profile Switcher:* Toggle between `Cmdr. Yasser / flight profile`, `Crew / 6`, and `You / this device`.
  * *Hero Banner:* Overall flight readiness status (`NOMINAL`, `CAUTION`, `CRITICAL`), active medical escalation directives, routine check streak counters, and earned mission badges.
  * *Telemetry Sync Strip:* Live synchronized HUD strip with vital signs, current gravity regime, and direct `"Open VR Helmet HUD"` shortcut.
  * *Standby / Live Override Panel:* Compact version of the 11-channel manual vital sign injection deck.
  * *System Domain Cards:* Multisystem status cards (`Musculoskeletal`, `Cardiovascular`, `Behavioral`, `Metabolic`, `Immune`).
  * *Telemetry Tile Grid:* 10 clickable biometric sparkline cards (Resting HR, Systolic BP, Diastolic BP, SpO2, Core Temp, Sleep, Glucose, Knee Extension, Reaction Speed, Reaction Lapses).
  * *Bottom Split Section:* Detailed SVG longitudinal history chart with 95% tolerance bands and safety limits on the left; bounded clinical action steps, radiation dosimeter cabin summary, and `"Report for flight surgeon"` text generator on the right.
  * *Crew View Sub-mode:* Ranks all 6 crew members by clinical priority (most acute flags first), displaying individual sparklines, adherence rates, and a 1.2 kB deep-space flight surgeon transmission text packet.
* **Transition Targets:** Clicking any sparkline tile loads its full history chart; clicking `"Open dashboard"` on any crew row loads that member; clicking `"VR Helmet HUD"` navigates directly to the helmet simulation with that crew member loaded.

#### Tab 4: Self-Check (`experience = "selfcheck"`)
* **Exact Label:** `Self-Check`
* **Visual Layout:**
  * *Top Control Rail:* Profile switch (`Cmdr. Yasser` vs `You`), Mission Environment selector (`Station`, `Lunar Surface`, `Mars Transit`, `Mars Surface`), and device storage encryption status.
  * *Security / Encryption Drawer:* PBKDF2/AES-GCM passcode encryption controls (`Add a passcode`, `Lock now`, `Unlock`, `Backup encrypted health record`, `Restore from backup`).
  * *6-Step Step Bar:* Numbered progressive pipeline:
    1. `Safety`: Immediate red flag symptom screening, adherence streak cards, and NASA HRP protocol schedules.
    2. `Movement`: 10-second seated knee extension camera test with MediaPipe skeleton tracking, real-time joint angle HUD, and optional X-ray bone overlay. Includes synthetic demo capture triggers (`Poor framing` vs `Usable`).
    3. `Reaction`: Validated 3-minute PVT-B psychomotor vigilance test with millisecond counter, practice mode, and synthetic demo injector.
    4. `Sleep & mood`: Hours slept input, sleep source protocol toggle, Samn-Perelli 7-point fatigue scale, mood and stress sliders, and subjective notes.
    5. `Body`: Immune symptom checklist, face camera rPPG resting pulse scan (60-second ME-rPPG hybrid), typed/Bluetooth vitals entry (BP, SpO2, Glucose, Temp), flight surgeon customizable safety limits, and respiratory motion link.
    6. `Result & action`: Overall status badge, flight surgeon escalation ladder, multisystem domain breakdown with expandable evidence drawers, action plan checklist, and export actions (`Save check`, `Report for flight surgeon`, `Export JSON`).
* **Transition Targets:** Transitions between steps 1-6; navigates to `lab.html#respiratory-monitor`; updates 3D scene focus camera to match the active anatomical domain.

#### Tab 5: Crewmate (`experience = "crewmate"`)
* **Exact Label:** `Crewmate`
* **Visual Layout:**
  * *Header & Intake:* Crewmate identification input, mission environment dropdown, and synthetic worked demo trigger button.
  * *Step 1 (Pain):* Interactive clickable anatomical location chips (`Chest`, `Left arm`, `Abdomen`, `Flank / back`, `Leg`, `Head`), onset type chips (`Sudden`, `Gradual`), pain quality chips (`Crushing`, `Sharp`, `Aching`, `Burning`), radiation chips (`Jaw`, `Back`, `Arm`), pain scale slider (0-10), and elapsed minutes input.
  * *Step 2 (Warning Signs):* Associated symptom chips (`Short of breath`, `Sweating / pale`, `Nausea / vomiting`, `Dizziness / faint`, `Weakness on one side`, `Trouble speaking`, `Fever`).
  * *Step 3 (Camera Minute):* 60-second webcam stream assessing rPPG facial pulse and bilateral facial symmetry (mouth droop, eye closure); manual 30-second breath count timer.
  * *Step 4 (Speech Analysis):* Reading aloud standardized passage (`The Rainbow Passage`) analyzed locally via Silero VAD ONNX neural network for speech pause ratios and cadence.
  * *Real-Time Triage Assessment:* Dynamic urgency level (`CONTACT FLIGHT SURGEON NOW`, `TELL FLIGHT SURGEON TODAY`, `WATCH AND RE-CHECK`), target anatomical systems to inspect on the twin, prioritized medical checklist, and pre-formatted plain-text clinical handoff summary for deep-space transmission.
* **Transition Targets:** Clicking target system buttons (`Heart and vessels`, `Bones`, `Kidneys`, `Head and nerves`) redirects 3D scene camera and highlights that system in the digital twin.

#### Tab 6: Anatomy (`experience = "twin"`)
* **Exact Label:** `Anatomy`
* **Visual Layout:**
  * *Left System Rail:* Vertical selector rail with buttons for 8 anatomical systems (`Body`, `Skeleton`, `Muscle`, `Nervous system`, `Cardiovascular`, `Renal`, `Radiation`, `Multisystem`) and `"Day 1 vs now"` comparative ghost mode button.
  * *Center Viewport:* 3D WebGL Three.js musculoskeletal and cardiovascular model. Visualizes capacity degradation tints, dynamic cardiac pulse animations, and interactive body part raycasting.
  * *Right Telemetry Cards:* System-specific telemetry parameters (e.g. Bone capacity change percentage, Knee extension angle, Resting heart rate, Cumulative radiation mGy, Model vs Observed comparison).
  * *Bottom Timeline:* Mission day timeline scrubber with playback controls.
* **Transition Targets:** Clicking any body part opens the Part Card dialog (`.tw-partcard`); clicking system buttons shifts 3D camera focus to target organs.

#### Tab 7: Evidence (`experience = "evidence"`)
* **Exact Label:** `Evidence`
* **Visual Layout:**
  * *Header:* Detailed scientific provenance summary explaining what every visual is constructed from (`MODEL`, `SYNTHETIC`, `ATLAS`, `CHECK`, `DERIVED`, `NONE`).
  * *Validation Proof Charts:* 3 embedded SVG figures with expandable raw numerical data tables:
    1. Knee angle accuracy vs motion capture (REHAB24-6 dataset, 9 subjects).
    2. Contactless camera pulse vs finger photoplethysmography sensor (MCD-rPPG, 40 subjects).
    3. False alarm and real change detection rates (Monte Carlo simulation across 1,000 astronauts).
  * *NASA & CSA Official Evidence Catalog:* Hyperlinks to peer-reviewed flight data accessions and DONKI solar events.
  * *NASA HRP Five Hazards Matrix:* Cross-reference table mapping Space Radiation, Isolation, Distance from Earth, Gravity Fields, and Hostile Closed Environments to ASTRA self-check telemetry indicators.
* **Transition Targets:** Outbound links to NASA OSDR repository and shortcut link to `lab.html#mission-demo`.

---

### 2.3 Secondary Navigation Menus & Overlay Drawers

#### Research Tools Dropdown Menu (`.ab-research-menu`)
* Located in `.tw-header` navigation bar:
  1. `Functional Scan / demo`: Opens drawer displaying knee extension seated kinematics comparison chart, table of Day 1 vs current observations, and trend forecasting lines.
  2. `Impact Lab / demo`: Opens drawer displaying reconstructed Level-A loose object impact event, Euler-Bernoulli beam bending stress simulation, and 10,000-run Monte Carlo distribution canvas.
  3. `Physiology / demo`: Opens drawer displaying sub-tabs for Cardiovascular heart rate drift, Renal mineral mobilization pathways, Radiation cumulative dose steps, and Predicted vs Observed linear trend extrapolation.
  4. `Live Capture ↗`: Navigates directly to `lab.html#movement-capture`.

#### Full-Screen NASA Evidence Modal Dialog (`.ab-evidence-dialog`)
* Triggered via `"NASA & CSA evidence ↗"` button in the Overview banner:
  * Modal dialog displaying searchable catalog of NASA Open Science Data Repository (OSDR) accessions, DONKI solar event datasets, and CSA mission research studies.
  * Includes text search bar, domain filter dropdown (`Cardiovascular`, `Radiation`, `Musculoskeletal`, `Genomics`), source cards with integration status, and an embedded NASA expansion panel.

---

## 3. Exhaustive Button, Slider, Dropdown & Toggle Inventory (`index.html`)

| Tab / Panel Location | Exact Visible Text / Label on Screen | DOM ID / Selector | Source File & Function Triggered | Exact Visual & Data Effect When Clicked/Changed | Current Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Global Header** | `ASTRA AUTONOMOUS ASTRONAUT HEALTH...` | `.tw-brand` | `src/twinApp.js` -> `enterLandingMode()` | Returns application to full-screen cinematic landing mode, hides navbar and dashboard cards, restores 3D auto-rotation. | `WORKING` |
| **Global Header** | `Today` | `nav button[data-experience="mission"]` | `src/twinApp.js` -> `setExperience("mission")` | Switches active view to Today mission control dashboard; reveals SVG telemetry anchor lines. | `WORKING` |
| **Global Header** | `VR Helmet HUD` | `nav button[data-experience="helmet"]` | `src/twinApp.js` -> `setExperience("helmet")` | Mounts and displays 3D EVA helmet simulation and telemetry override deck. | `WORKING` |
| **Global Header** | `My Health` | `nav button[data-experience="health"]` | `src/twinApp.js` -> `setExperience("health")` | Opens personal health dashboard and 6-member crew console. | `WORKING` |
| **Global Header** | `Self-Check` | `nav button[data-experience="selfcheck"]` | `src/twinApp.js` -> `setExperience("selfcheck")` | Opens 6-step astronaut self-check workflow drawer. | `WORKING` |
| **Global Header** | `Crewmate` | `nav button[data-experience="crewmate"]` | `src/twinApp.js` -> `setExperience("crewmate")` | Opens acute crew triage and warning sign workflow drawer. | `WORKING` |
| **Global Header** | `Anatomy` | `nav button[data-experience="twin"]` | `src/twinApp.js` -> `setExperience("twin")` | Switches to full 3D interactive reference anatomy view; enables system rail. | `WORKING` |
| **Global Header** | `Evidence` | `nav button[data-experience="evidence"]` | `src/twinApp.js` -> `setExperience("evidence")` | Opens NASA Open Science and validation proof report drawer. | `WORKING` |
| **Global Header** | `Research tools` | `.ab-research-menu summary` | Native HTML `<details>` toggle | Opens dropdown menu containing secondary research experiences and Live Capture link. | `WORKING` |
| **Global Header** | `Functional Scan / demo` | `.ab-research-menu button (0)` | `src/twinApp.js` -> `setExperience("functional")` | Selects flight profile and opens functional knee kinematics drawer. | `WORKING` |
| **Global Header** | `Impact Lab / demo` | `.ab-research-menu button (1)` | `src/twinApp.js` -> `setExperience("impact")` | Selects flight profile and opens Level-A impact reconstruction drawer. | `WORKING` |
| **Global Header** | `Physiology / demo` | `.ab-research-menu button (2)` | `src/twinApp.js` -> `setExperience("physiology")` | Selects flight profile and opens cardiovascular/renal/radiation physiology drawer. | `WORKING` |
| **Global Header** | `Live Capture` | `.ab-research-menu a` | Hyperlink (`lab.html#movement-capture`) | Navigates browser to standalone `lab.html` camera workspace. | `WORKING` |
| **Global Header** | `My health` | `.ab-profile-switch button[data-profile="you"]` | `src/twinApp.js` -> `selectProfile("you")` | Switches data profile to local astronaut ("you"), unlocking local self-checks. | `WORKING` |
| **Global Header** | `Flight profile` | `.ab-profile-switch button[data-profile="elena"]` | `src/twinApp.js` -> `selectProfile("elena")` | Switches data profile to Cmdr. Laila Yasser synthetic 240-day Mars mission dataset. | `WORKING` |
| **Global Header** | `Lightweight view` | `.ab-lightweight-toggle` | `src/twinApp.js` -> `setLightweight(!state.lightweight)` | Toggles WebGL 3D rendering pause to save GPU power and battery on mobile/laptops. | `WORKING` |
| **Global Header** | `Guided demo` | `.tw-start` | `src/twinApp.js` -> `runDemo()` / `stopDemo()` | Starts 8-chapter autonomous tour of ASTRA capabilities with audio-timed captions. | `WORKING` |
| **Landing Screen** | `Start my check` | `.tw-intro .ab-welcome-actions button (0)` | `src/twinApp.js` -> `finishIntro()` + `setExperience("selfcheck")` | Dismisses landing screen overlay and navigates directly to astronaut self-check. | `WORKING` |
| **Landing Screen** | `Open VR Helmet HUD` | `.tw-intro .ab-welcome-actions button (1)` | `src/twinApp.js` -> `finishIntro()` + `setExperience("helmet")` | Dismisses landing screen overlay and launches 3D EVA helmet simulation. | `WORKING` |
| **Landing Screen** | `Run flight briefing` | `.tw-intro .ab-welcome-actions button (2)` | `src/twinApp.js` -> `finishIntro()` + `runDemo()` | Dismisses landing screen overlay and starts guided walkthrough tour. | `WORKING` |
| **Landing Screen** | `Enter Console` | `.tw-intro .tw-enter-console` | `src/twinApp.js` -> `finishIntro()` + `setExperience("mission")` | Dismisses landing screen overlay and opens Cmdr. Laila Yasser Today dashboard. | `WORKING` |
| **Today Hero** | `Open VR Helmet HUD →` | `.ab-overview-top a[data-ab-action="helmet"]` | `src/missionUpgrade.js` -> `app.setExperience("helmet")` | Direct shortcut link entering VR Helmet HUD. | `WORKING` |
| **Today Hero** | `Open daily self-check →` | `.ab-overview-top a[data-ab-action="selfcheck"]` | `src/missionUpgrade.js` -> `app.setExperience("selfcheck")` | Direct shortcut link entering Daily Self-Check. | `WORKING` |
| **Today Hero** | `Breathing check ↗` | `.ab-breathing-cta` | Hyperlink (`lab.html#respiratory-monitor`) | Navigates to live camera breathing rate tracker in `lab.html`. | `WORKING` |
| **Today Hero** | `NASA & CSA evidence ↗` | `button[data-ab-action="evidence"]` | `src/missionUpgrade.js` -> `openEvidence()` | Opens full-screen NASA evidence modal dialog (`.ab-evidence-dialog`). | `WORKING` |
| **Evidence Modal** | `×` (Close) | `.ab-dialog-close` | `src/missionUpgrade.js` -> `evidenceDialog.close()` | Closes NASA evidence modal dialog and resumes 3D twin rendering. | `WORKING` |
| **Evidence Modal** | Search input | `#ab-evidence-search` | `src/missionUpgrade.js` -> `search.oninput` | Filters displayed NASA datasets in real time by keywords. | `WORKING` |
| **Evidence Modal** | Research domain | `#ab-evidence-domain` | `src/missionUpgrade.js` -> `selector.onchange` | Filters displayed NASA datasets by clinical domain. | `WORKING` |
| **Today / Anatomy** | Timeline scrubber | `.tw-timeline input[type="range"]` | `src/twinApp.js` -> `setDay(value)` | Scrubs mission timeline across Days 1-240, updating skeletal bone loss tint and heart rate. | `WORKING` |
| **Today / Anatomy** | `Play` / `Pause` | `.tw-play` | `src/twinApp.js` -> `play()` / `stopPlay()` | Starts/stops automated playback of mission days 1 through 240. | `WORKING` |
| **Today / Anatomy** | Checkpoint ticks (`D1`..`D240`) | `.tw-ticks button` | `src/twinApp.js` -> `animateDay(day)` | Smoothly animates timeline position to clicked milestone day. | `WORKING` |
| **Anatomy Rail** | System buttons (8 systems) | `.tw-systems button[data-system]` | `src/twinApp.js` -> `setExperience("twin", {system})` | Filters anatomical display to chosen system and focuses 3D camera. | `WORKING` |
| **Anatomy Rail** | `Day 1 vs now` | `.tw-compare` | `src/twinApp.js` -> `toggleCompare()` | Renders ghost baseline skeleton next to current degraded skeleton for visual comparison. | `WORKING` |
| **Part Card Modal** | `×` (Close) | `.tw-partcard-close` | `src/twinApp.js` -> `hidePart()` | Closes clicked body part modal dialog. | `WORKING` |
| **Part Card Modal** | `Measure now` | `.tw-partcard-actions .tw-primary` | `src/twinApp.js` -> `selfCheck.openStep(part.step)` | Redirects to Self-Check step corresponding to this organ. | `WORKING` |
| **Part Card Modal** | `Open analysis` | `.tw-partcard-actions .tw-secondary` | `src/twinApp.js` -> `navigateFromBody(name)` | Redirects to Impact Lab, Physiology, or Functional scan depending on part. | `WORKING` |
| **VR Helmet HUD** | Crew selector (6 buttons) | `.vr-crew button[data-crew]` | `src/vrHelmetSim.js` -> `link.setCrew(id)` | Loads selected crew member's telemetry into visor HUD and override panel. | `WORKING` |
| **VR Helmet HUD** | Gravity toggle (Moon/Mars) | `.vr-seg-toggle button[data-terrain]` | `src/vrHelmetSim.js` -> `link.setTerrain(key)` | Switches 3D world terrain, sky, and gravity between Moon (0.16g) and Mars (0.38g). | `WORKING` |
| **VR Helmet HUD** | `VR Split-Screen Headset Mode` | `.vr-tools button:nth-child(2)` | `src/vrHelmetSim.js` -> `setSplit(!split)` | Splits WebGL canvas into stereoscopic binocular viewport with dual HUDs. | `WORKING` |
| **VR Helmet HUD** | `Reset view` | `.vr-tools button:nth-child(3)` | `src/vrHelmetSim.js` -> `resetPlayer()` | Resets astronaut position to starting coordinates facing forward. | `WORKING` |
| **VR Helmet HUD** | `Fullscreen` | `.vr-tools button:nth-child(4)` | `src/vrHelmetSim.js` -> `requestFullscreen()` | Toggles native browser fullscreen mode on helmet container. | `WORKING` |
| **VR Helmet HUD** | Touch Pad (5 buttons) | `.vr-pad button` | `src/vrHelmetSim.js` -> `keys.add(code)` | Simulates WASD/Space walking and jumping controls for touch displays. | `WORKING` |
| **VR Override** | `Standby (--)` | `.vr-btn-standby` | `src/astraLink.js` -> `link.standby()` | Wipes all 11 telemetry channels to null (`--`) and raises STANDBY HUD alert. | `WORKING` |
| **VR Override** | `Reload crew profile` | `.vr-actions button:nth-child(2)` | `src/astraLink.js` -> `link.resetProfile()` | Restores selected crew member's nominal pre-loaded biometric profile. | `WORKING` |
| **VR Override** | Preset buttons (4 buttons) | `.vr-presets button[data-preset]` | `src/astraLink.js` -> `link.applyPreset(key)` | Injects one-click clinical crisis scenarios (Exercise, Tachycardia, BP Spike, Hypoxia). | `WORKING` |
| **VR Override** | 11 Vital range sliders | `.vr-field input[type="range"]` | `src/astraLink.js` -> `link.setVitals(...)` | Live updates HR, BP, RR, SpO2, Temp, Sleep, Dose, Signal, SANS in HUD & Dashboard. | `WORKING` |
| **VR Override** | 11 Vital numeric inputs | `.vr-field input[type="number"]` | `src/astraLink.js` -> `link.setVitals(...)` | Exact value typed entry syncing immediately to sliders and HUD stream. | `WORKING` |
| **VR Override** | `Upload CSV / JSON` | `.vr-file` (file input) | `src/vrHelmetSim.js` -> `link.loadDataset(...)` | Parses uploaded telemetry stream and executes 1 row/second replay into HUD. | `WORKING` |
| **VR Override** | `Sample CSV` | `.vr-upload .vr-link` | Dynamic blob download | Downloads formatted 5-row sample telemetry CSV file for testing. | `WORKING` |
| **VR Override** | `Stop replay` | `.vr-upload button` | `src/astraLink.js` -> `link.stopReplay()` | Halts active CSV/JSON time-series streaming. | `WORKING` |
| **My Health** | Profile switch (`Laila`/`Crew`/`You`) | `.db-profile button` | `src/dashboardPanel.js` -> `pick(key)` | Switches between astronaut personal view, 6-member crew roster, and local station device. | `WORKING` |
| **My Health** | Telemetry tile buttons (10 tiles) | `.db-tile` | `src/dashboardPanel.js` -> `chartKey = t.key` | Highlights clicked biometric parameter and scrolls to its historical trend chart. | `WORKING` |
| **My Health** | `Start my first self-check` | `.db-hero .tw-primary` | `src/dashboardPanel.js` -> `onMeasure()` | Redirects to Self-Check tab when local device has no prior records. | `WORKING` |
| **My Health** | `Open Laila's self-check` | `.db-buttons .tw-primary` | `src/dashboardPanel.js` -> `onMeasure()` | Opens Cmdr. Laila Yasser's Day 147 pre-loaded self-check. | `WORKING` |
| **My Health** | `Open VR Helmet HUD` | `.db-buttons .tw-secondary` | `src/dashboardPanel.js` -> `onOpenHud()` | Opens VR Helmet HUD with active crew member loaded. | `WORKING` |
| **My Health** | `Report for flight surgeon` | `.db-buttons .tw-secondary` | `src/dashboardPanel.js` -> `report = !report` | Toggles generation of plain-text deep-space clinical handoff report. | `WORKING` |
| **My Health Crew** | `Open dashboard` | `.db-crew-meta button.tw-secondary` | `src/dashboardPanel.js` -> `link.setCrew(id)` | Loads selected crew member into single-astronaut view mode. | `WORKING` |
| **My Health Crew** | `VR Helmet HUD` | `.db-crew-meta button.tw-primary` | `src/dashboardPanel.js` -> `onOpenHud()` | Loads selected crew member and immediately switches to VR Helmet HUD. | `WORKING` |
| **Self-Check** | Profile switch (`Laila`/`You`) | `.sc-profile button` | `src/selfCheckPanel.js` -> `switchProfile(...)` | Toggles between Cmdr. Yasser demo and local authenticated astronaut record. | `WORKING` |
| **Self-Check** | Mission environment selector | `.sc-env select` | `src/selfCheckPanel.js` -> `setEnvironment(...)` | Adjusts clinical communication delay (e.g. Earth 3-22 min delay for Mars transit). | `WORKING` |
| **Self-Check** | `Save my checks on this device` | `.sc-consent input[type="checkbox"]` | `src/selfCheckPanel.js` -> `setHealthConsent(...)` | Toggles persistent browser storage consent for health records. | `WORKING` |
| **Self-Check** | `Add a passcode` / `Lock now` | `.sc-lock button` | `src/selfCheckPanel.js` -> `store.setPasscode()` | Encrypts stored health records with client-side PBKDF2/AES-GCM key derivation. | `WORKING` |
| **Self-Check** | Step nav buttons (`1`..`6`) | `.sc-steps button` | `src/selfCheckPanel.js` -> `go(step)` | Jumps directly to any of the 6 self-check stages. | `WORKING` |
| **Self-Check S1** | Red flag checkboxes | `.sc-checks input[type="checkbox"]` | `src/selfCheckPanel.js` -> updates `check.redFlags` | Flags immediate critical symptoms requiring ground intervention. | `WORKING` |
| **Self-Check S1** | `None of these · continue` | `.sc-step .sc-secondary` | `src/selfCheckPanel.js` -> `go(1)` | Clears red flags and advances to Step 2 (Movement). | `WORKING` |
| **Self-Check S2** | `Start camera` / `Stop camera` | `.sc-camera button` | `src/selfCheckPanel.js` -> `startCamera()` | Activates local webcam for real-time MediaPipe joint angle tracking. | `WORKING` |
| **Self-Check S2** | `Record 10 s` | `.sc-camera .sc-primary` | `src/selfCheckPanel.js` -> `recordCamera()` | Records 10-second knee extension trial and evaluates tracking quality. | `WORKING` |
| **Self-Check S2** | `Demo capture · poor framing` | `button[data-demo="poor"]` | `src/selfCheckPanel.js` -> `demoCapture("poor")` | Injects low-quality tracking trial demonstrating comparison withholding. | `WORKING` |
| **Self-Check S2** | `Demo capture · usable` | `button[data-demo="usable"]` | `src/selfCheckPanel.js` -> `demoCapture("usable")` | Injects validated knee extension trial (151 deg) for flight profile. | `WORKING` |
| **Self-Check S2** | `X-ray bones on the camera` | `#sc-xray-bones` | `src/selfCheckPanel.js` -> `xrayBones.setEnabled(...)` | Overlays rigged 3D skeleton on real-time video feed. | `WORKING` |
| **Self-Check S3** | `Start 3-minute test` | `.sc-row .sc-primary` | `src/selfCheckPanel.js` -> `startPvt(180000)` | Launches official 3-minute psychomotor vigilance reaction test. | `WORKING` |
| **Self-Check S3** | `1-minute practice` | `.sc-row .sc-secondary` | `src/selfCheckPanel.js` -> `startPvt(60000)` | Launches 1-minute practice trial (excluded from longitudinal baseline). | `WORKING` |
| **Self-Check S3** | `Use demo result (3-minute)` | `button[data-demo="pvt"]` | `src/selfCheckPanel.js` -> `applyDemoPvt()` | Injects Laila's authored Day 147 reaction result (9 attention lapses). | `WORKING` |
| **Self-Check S3** | Reaction clicker target | `.sc-pvt-stage` | `src/selfCheckPanel.js` -> `respond(event)` | Registers millisecond-accurate user tap or spacebar press on visual stimulus. | `WORKING` |
| **Self-Check S4** | Sleep hours input | `.sc-body input[type="number"]` | `src/selfCheckPanel.js` -> updates `values.sleepHours` | Enters total sleep in last 24 hours. | `WORKING` |
| **Self-Check S4** | Fatigue radio buttons (1-7) | `input[name="sc-fatigue"]` | `src/selfCheckPanel.js` -> updates `values.fatigue` | Selects Samn-Perelli subjective fatigue rating. | `WORKING` |
| **Self-Check S4** | Mood & Stress sliders | `.sc-slider input[type="range"]` | `src/selfCheckPanel.js` -> updates `values.mood/stress`| Enters subjective 0-10 emotional wellness rating. | `WORKING` |
| **Self-Check S5** | `Measure resting pulse (60 s)` | `.sc-pulse .sc-primary` | `src/selfCheckPanel.js` -> `measurePulse()` | Runs 60-second ME-rPPG contactless optical heart rate extraction from face camera. | `WORKING` |
| **Self-Check S5** | Bluetooth vital readers | `.sc-ble button` | `src/bleVitals.js` -> `readBluetoothVital()` | Connects to Web Bluetooth cuffs, pulse oximeters, and thermometers. | `PARTIAL` *(Requires compatible Bluetooth hardware)* |
| **Self-Check S5** | Vitals typed entries (BP/Temp/etc) | `.sc-vital input` | `src/selfCheckPanel.js` -> updates `check.vitals` | Enters clinical vitals with real-time safety limit boundary checking. | `WORKING` |
| **Self-Check S6** | `Save check & selected actions` | `.sc-actions .sc-primary` | `src/selfCheckPanel.js` -> `saveCheck()` | Commits daily self-check to persistent encrypted store; awards badges. | `WORKING` |
| **Self-Check S6** | `Report for flight surgeon` | `.sc-row button (0)` | `src/selfCheckPanel.js` -> `state.report = !state.report` | Generates plain-text flight surgeon handoff summary block. | `WORKING` |
| **Self-Check S6** | `Export for reviewer (JSON)` | `.sc-row button (1)` | `src/selfCheckPanel.js` -> `exportJson()` | Downloads full clinical JSON audit file. | `WORKING` |
| **Self-Check S6** | `New check` | `.sc-row button (2)` | `src/selfCheckPanel.js` -> `reset()` | Clears current input buffer and restarts Step 1. | `WORKING` |
| **Crewmate Check** | Pain location chips (6 chips) | `.cm-chips button[data-group="site"]`| `src/crewmatePanel.js` -> `toggle("site", key)` | Selects anatomical site and rotates 3D twin to corresponding organ. | `WORKING` |
| **Crewmate Check** | Warning symptom chips (7 chips)| `.cm-chips button[data-group="associated"]`| `src/crewmatePanel.js` -> `toggle("associated", key)`| Selects systemic red flags (dyspnea, diaphoresis, focal weakness). | `WORKING` |
| **Crewmate Check** | `Start the camera minute` | `.cm-cam .tw-primary` | `src/crewmatePanel.js` -> `runCamera()` | Tracks 60 seconds of facial asymmetry (stroke screen) and rPPG pulse. | `WORKING` |
| **Crewmate Check** | `30 s timer` (Breath count) | `.cm-breath .tw-secondary` | `src/crewmatePanel.js` -> `countdown(30)` | Runs 30-second audible countdown to facilitate manual breath count. | `WORKING` |
| **Crewmate Check** | `Start reading` / `Done reading` | `.cm-step .tw-primary` | `src/crewmatePanel.js` -> `runSpeech()` | Captures microphone audio and executes Silero VAD pause analysis. | `WORKING` |
| **Crewmate Check** | `Show a worked example` | `.cm-demo` | `src/crewmatePanel.js` -> `loadDemo()` | Injects acute synthetic cardiac emergency scenario (chest pain, dyspnea, VAD pauses). | `WORKING` |
| **Crewmate Check** | `Copy summary` / `Download` | `.cm-actions button` | `src/crewmatePanel.js` -> clipboard/file | Exports plain-text clinical handoff report for medical officer. | `WORKING` |
| **Impact Lab** | `Run reconstruction` | `drawer .tw-primary` | `src/twinApp.js` -> `runImpact()` | Executes 5-phase Level-A impact animation and Euler-Bernoulli stress calculation. | `WORKING` |
| **Impact Lab** | `Run Monte Carlo` | `.tw-mc .tw-secondary` | `src/twinApp.js` -> `runMonteCarloView()` | Runs 10,000-run stochastic simulation displaying demand/capacity ratio histogram. | `WORKING` |
| **Impact Lab** | `Open functional comparison` | `.tw-post button` | `src/twinApp.js` -> `setExperience("functional")` | Jumps to post-impact knee kinematics drawer. | `WORKING` |
| **Guided Demo** | Demo controller buttons | `.ab-demo-actions button` | `src/twinApp.js` -> `showDemoChapter()` | Steps forward/backward through 8 mission tour chapters or exits demo. | `WORKING` |

---

## 4. Exhaustive Walkthrough of `lab.html`

### 4.1 Layout Architecture & Panes
`lab.html` is the **Live Capture & Engineering Validation Workspace**. Its layout consists of:
1. **Header Topbar:** Displays `"ASTRA"`, `"Mission health evidence for exploration crews"`, live status badges (`Research mode`, `Edge-first architecture`), theme toggle, and the `Implementation status` modal launcher.
2. **Mission Brief & Lifecycle:** Problem definition (`Exploration medicine problem`), objective banner, and 4-step lifecycle strip (`Prevent`, `Assess`, `Respond`, `Monitor & relay`).
3. **Workspace Viewport Split Grid:**
   * *Left Pane (Original Video):* Displays real-time webcam feed or uploaded MP4 exercise video, MediaPipe overlay landmarks, video scrub bar, playback controls, and camera device selector.
   * *Right Pane (3D Rigged Twin):* Three.js rigged human avatar (`human_body_clothed.glb`) mirroring astronaut movements in real time via skeletal retargeting. Includes camera view presets (`Stand`, `Idle`, `Space traveler`, `Camera linked`).
4. **Kinematic & MotionGuard Deck:** Bilateral joint angle traces, range-of-motion gauges, posture deviation warnings, and loose-object awareness toggles.
5. **4-Stage Workflow Container:**
   * Stage 0: `Evidence` (X-ray analysis, API endpoint override, verified held-out benchmark).
   * Stage 1: `Impact Lab` (Mechanics parameters: mass, velocity, angle, contact area, microgravity exposure days).
   * Stage 2: `Bone Fragility` (Skeletal index, microgravity days slider, clinical symptoms).
   * Stage 3: `Decision & Response Plan` (Level-A demand/capacity ratio, countermeasure actions, medical handoff export).
6. **Simulink Level-A & NASA OSDR-804 Section:** Tabular benchmark verification comparing browser JavaScript engine results with official Simulink Level-A mathematical models.
7. **Astra Research Copilot:** Floating drawer providing deterministic answers to scientific questions regarding mechanical index, missing evidence, and NASA flight boundaries.
8. **Mission Review Modal Dialog:** Comprehensive pre-competition submission verification checklist and JSON review packet exporter.

---

### 4.2 Exhaustive Button, Checkbox, Dropdown & Slider Table (`lab.html`)

| Panel / Stage in `lab.html` | Exact Visible Text / Label | DOM ID / Selector | What Happens When Clicked/Changed | Current Status |
| :--- | :--- | :--- | :--- | :--- |
| **Header Topbar** | `Implementation status` | `#open-mission-review` | Opens `#mission-review-dialog` displaying pre-competition submission checks. | `WORKING` |
| **Header Topbar** | `Light` / `Dark` | `#theme-toggle` | Toggles UI color scheme between dark space navy and light mode. | `WORKING` |
| **Mission Brief** | `Explore impact research →` | `#guided-demo` | Automatically selects Stage 1 (Impact Lab) and loads Level-A reference case. | `WORKING` |
| **Source Bar** | `Live camera` | `#source-live` | Selects live webcam input as the motion source. | `WORKING` |
| **Source Bar** | `Recorded exercise` | `#source-video` | Selects local video file as motion input. | `WORKING` |
| **Source Bar** | `Sync twin to every video frame`| `#video-precompute` | Pre-computes video pose landmarks ahead of playback to ensure 60fps twin sync. | `WORKING` |
| **Video Pane** | `Start camera` / `Stop camera` | `#toggle-camera` | Toggles webcam stream and initializes MediaPipe Tasks Vision. | `WORKING` |
| **Video Pane** | `Upload video` | `#upload-video` | Triggers hidden `#exercise-video-file` input to load local MP4/WebM video. | `WORKING` |
| **Video Pane** | Video scrub slider | `#video-scrub` | Scrubs through uploaded exercise video frames. | `WORKING` |
| **Video Pane** | `Pause` / `Play` | `#video-play-pause` | Plays or pauses uploaded video playback. | `WORKING` |
| **Video Pane** | Playback speed dropdown | `#video-speed` | Adjusts video playback rate (0.5x, 1.0x, 1.5x). | `WORKING` |
| **Kinematic Pane** | Joint trace selector | `#motionguard-trace-joint`| Changes which joint angle is plotted in the live canvas trace (Knee, Hip, Shoulder).| `WORKING` |
| **3D Twin Pane** | `Stand` | `.motion-button[data-motion="stand"]`| Sets 3D avatar to static anatomical neutral standing posture. | `WORKING` |
| **3D Twin Pane** | `Idle` | `.motion-button[data-motion="walk"]` | Plays looping idle breathing animation on 3D avatar. | `WORKING` |
| **3D Twin Pane** | `Space traveler` | `.motion-button[data-motion="space"]`| Plays zero-gravity floating animation on 3D avatar. | `WORKING` |
| **3D Twin Pane** | `Camera linked` | `#camera-motion` | Enables live 1:1 mirroring of webcam movement onto 3D rigged avatar. | `WORKING` *(Requires active camera)* |
| **3D Twin Pane** | `Reset` | `#reset-button` | Resets 3D OrbitControls camera position to default framing. | `WORKING` |
| **Workflow Tabs** | `1. Evidence` | `.workflow-tab[data-workflow-stage="0"]`| Switches workflow view to Stage 0 (X-ray analysis & API configuration). | `WORKING` |
| **Workflow Tabs** | `2. Impact mechanics` | `.workflow-tab[data-workflow-stage="1"]`| Switches workflow view to Stage 1 (Impact parameters & dynamics). | `WORKING` |
| **Workflow Tabs** | `3. Bone fragility` | `.workflow-tab[data-workflow-stage="2"]`| Switches workflow view to Stage 2 (Microgravity exposure days & bone reserve). | `WORKING` |
| **Workflow Tabs** | `4. Response plan` | `.workflow-tab[data-workflow-stage="3"]`| Switches workflow view to Stage 3 (Care plan, clinical protocol, handoff). | `WORKING` |
| **Stage 0 Evidence**| `Analyze X-ray` | `#analyze-xray` | Sends uploaded image to inference API or local evaluator for fracture analysis. | `WORKING` |
| **Stage 0 Evidence**| `Verified held-out case` | `#load-demo-prediction` | Loads verified pre-computed X-ray prediction dataset (`IMG0001739`). | `WORKING` |
| **Stage 0 Evidence**| `Clear` | `#clear-prediction` | Clears current X-ray image and segmentation overlay. | `WORKING` |
| **Stage 0 Evidence**| `Save endpoint` | `#save-api-base` | Saves custom external AI inference API endpoint to localStorage. | `WORKING` |
| **Stage 0 Evidence**| `Clear` | `#clear-api-base` | Resets inference API endpoint to local offline fallback. | `WORKING` |
| **Capture Tools** | `Track hands and face` | `#detail-tracking` | Enables secondary high-density face and hand MediaPipe landmarker models. | `WORKING` |
| **Capture Tools** | `Center pose` | `#center-pose` | Offsets 3D skeletal position to center avatar in the viewport. | `WORKING` |
| **Capture Tools** | `Record baseline` | `#record-baseline` | Captures 5 seconds of nominal movement to establish personal kinematic baseline. | `WORKING` |
| **Capture Tools** | `Assess 8 s` | `#record-assessment` | Executes 8-second standardized functional movement assessment trial. | `WORKING` |
| **Capture Tools** | `Replay video` | `#replay-video` | Replays the last recorded assessment trial with synchronized twin animation. | `WORKING` |
| **Capture Tools** | `Export evidence` | `#export-movement-evidence` | Downloads encrypted or raw JSON movement evidence packet with joint angles. | `WORKING` |
| **Capture Tools** | Camera device selector | `#camera-device` | Selects active physical webcam input from detected system video devices. | `WORKING` |
| **Capture Tools** | `Refresh` | `#refresh-cameras` | Probes system to refresh connected USB/integrated webcam device list. | `WORKING` |
| **Capture Tools** | `Crew` (Facing mode) | `.camera-facing-button[data-facing="user"]`| Configures camera constraints for user-facing front camera. | `WORKING` |
| **Capture Tools** | `Environment` (Facing mode)| `.camera-facing-button[data-facing="environment"]`| Configures camera constraints for rear-facing environment camera. | `WORKING` |
| **Capture Tools** | `X-ray skeleton overlay` | `#xray-bones` | Toggles skeletal wireframe overlay on live camera video pane. | `WORKING` |
| **Capture Tools** | `Mirror camera preview` | `#mirror-preview` | Toggles horizontal CSS flip (`scaleX(-1)`) on camera feed. | `WORKING` |
| **MotionGuard** | Analysis mode selector | `#motionguard-mode` | Switches MotionGuard rules (`General exercise`, `Squat`, `Lunge`, `Overhead lift`).| `WORKING` |
| **MotionGuard** | `Reset counters` | `#motionguard-reset` | Resets joint limit violation counts, repetition counters, and warning logs. | `WORKING` |
| **MotionGuard** | `Loose object awareness` | `#object-awareness` | Activates EfficientDet TFLite model to detect flying debris in camera feed. | `WORKING` |
| **MotionGuard** | `Spoken voice alerts` | `#voice-alerts` | Enables Web Speech API synthetic speech synthesis for real-time postural warnings.| `WORKING` |
| **MotionGuard** | Posture threshold dropdown | `#posture-threshold` | Adjusts kinematic sensitivity (`Strict 5°`, `Nominal 10°`, `Permissive 15°`). | `WORKING` |
| **MotionGuard** | `Test voice` | `#test-voice` | Emits test speech synthesis audio (`"ASTRA MotionGuard audio nominal"`). | `WORKING` |
| **Stage 1 Impact** | `Save comparison reference`| `#save-scenario-reference` | Caches current impact sliders as a baseline to compare against subsequent changes.| `WORKING` |
| **Stage 1 Impact** | `Clear reference` | `#clear-scenario-reference`| Clears cached scenario reference comparison. | `WORKING` |
| **Stage 1 Impact** | Impact target region selector | `#target-region` | Selects anatomical impact target (`Mid-tibia`, `Distal radius`, `Femoral neck`). | `WORKING` |
| **Stage 1 Impact** | `Restore EVA tool case` | `.preset-button[data-preset="eva"]`| Resets mass (2.0 kg), speed (4.0 m/s), and angle (75°) to NASA baseline incident. | `WORKING` |
| **Stage 1 Impact** | Mass slider (g) | `#mass` | Adjusts colliding object mass from 1 g to 5,000 g (0.001 - 5.0 kg). | `WORKING` |
| **Stage 1 Impact** | Velocity slider (m/s) | `#speed` | Adjusts impact velocity from 0 to 120 m/s. | `WORKING` |
| **Stage 1 Impact** | Impact angle slider (deg) | `#angle` | Adjusts impact trajectory angle relative to bone surface from 0° to 90°. | `WORKING` |
| **Stage 1 Impact** | Contact area slider (mm²) | `#contact-area` | Adjusts impact contact surface area from 1 to 5,000 mm². | `WORKING` |
| **Stage 2 Bone** | Bone capacity index slider | `#bone-index` | Modifies pre-mission baseline bone mineral density reserve percentage (45-120%). | `WORKING` |
| **Stage 2 Bone** | Days in microgravity slider | `#microgravity-days` | Adjusts cumulative flight duration from 0 to 420 days (applies 1.25%/mo loss rate).| `WORKING` |
| **Stage 2 Bone** | Pain score slider (0-10) | `#pain-score` | Records astronaut-reported localized pain severity following impact. | `WORKING` |
| **Stage 2 Bone** | Swelling dropdown | `#swelling` | Records clinical swelling (`None`, `Mild / localized`, `Moderate`, `Severe`). | `WORKING` |
| **Stage 2 Bone** | Mobility dropdown | `#mobility` | Records functional weight-bearing capacity (`Normal`, `Guarded`, `Non-weight-bearing`).| `WORKING` |
| **Stage 2 Bone** | `Sensation change` checkbox | `#sensation-change` | Flags distal neurological impairment (numbness, tingling, paresthesia). | `WORKING` |
| **Workflow Nav** | `Back` | `#workflow-back` | Moves back to the preceding workflow stage. | `WORKING` |
| **Workflow Nav** | `Next: impact` (or next stage)| `#workflow-next` | Advances to the subsequent workflow stage, validating entered parameters. | `WORKING` |
| **Validation** | `Export competition brief` | `#export-competition-brief`| Generates formatted Markdown technical summary for hackathon judges. | `WORKING` |
| **Validation** | `Load verified Level-A case`| `#load-simulation-case` | Loads stored mathematical simulation benchmark (`public/simulations/astra-level-a-v1.json`).| `WORKING` |
| **Validation** | `Export validation report` | `#export-validation-report`| Exports JSON validation matrix comparing JavaScript math to Simulink Level-A data.| `WORKING` |
| **Response Plan** | `Log observation` | `#log-observation` | Commits current incident scenario to persistent mission log history. | `WORKING` |
| **Response Plan** | `Export handoff` | `#export-handoff` | Generates structured medical handoff packet for Earth ground control review. | `WORKING` |
| **Astra Copilot** | Copilot Launcher Button | `#copilot-launcher` | Opens sliding Astra telemetry copilot research chat drawer. | `WORKING` |
| **Astra Copilot** | `−` (Minimize) | `#copilot-minimize` | Collapses Astra copilot drawer into a compact bottom banner. | `WORKING` |
| **Astra Copilot** | `×` (Close) | `#copilot-close` | Closes Astra copilot chat drawer. | `WORKING` |
| **Astra Copilot** | `Explain current case` | `button[data-prompt="Explain..."]`| Injects pre-built prompt explaining mechanical index and demand/capacity ratio. | `WORKING` |
| **Astra Copilot** | `Missing evidence` | `button[data-prompt="What evidence..."]`| Injects pre-built prompt outlining unmeasured clinical observations. | `WORKING` |
| **Astra Copilot** | `NASA-ready` | `button[data-prompt="What would..."]`| Injects pre-built prompt detailing flight certification gaps and validation steps. | `WORKING` |
| **Astra Copilot** | `Camera boundary` | `button[data-prompt="Explain the..."]`| Injects pre-built prompt explaining why camera video cannot diagnose bone health. | `WORKING` |
| **Astra Copilot** | Chat input box | `#chat-input` | Accepts typed questions regarding ASTRA telemetry state. | `WORKING` |
| **Astra Copilot** | `Send` button | `#chat-form button[type="submit"]`| Submits question to Astra deterministic copilot model and renders markdown reply.| `WORKING` |
| **Review Dialog** | `Close` | `#close-mission-review` | Closes implementation status modal dialog. | `WORKING` |
| **Review Dialog** | `Export review packet` | `#review-export` | Downloads JSON checklist summarizing implementation readiness and NASA alignment. | `WORKING` |

---

## 5. End-to-End Live Data & Sync Flow

### 5.1 Scenario 1: Switching Between the 6 Team ASTRA Members
1. User clicks any of the 6 crew selector buttons (`Laila Yasser`, `Ibrahim Salah`, `Mahmoud Abdelnaby`, `Mohand Abdo`, `Marwan Hassan`, `Omar`) in the VR Helmet HUD, My Health crew roster, or override drawer.
2. The click calls `link.setCrew(crewId)` inside `src/astraLink.js`.
3. `astraLink` retrieves the member's nominal profile from `CREW` in `src/crewDemo.js` (including baseline resting HR, blood pressure, SANS ocular risk, and mission day check history).
4. `astraLink` recalculates clinical statuses using `assess(vitals, member)`:
   * Compares heart rate against the astronaut's personal EVA baseline (`v.hrBase`).
   * Evaluates systolic/diastolic blood pressure against NASA flight surgeon limits.
   * Evaluates SANS score against intracranial hypertension thresholds.
5. `link.notify("crew")` dispatches updates across:
   * Internal memory state (`link.state`).
   * Browser `BroadcastChannel("astra-link")` message posted to all open windows/tabs.
   * `sessionStorage.setItem("astra-link-state", ...)` for reload persistence.
6. **Subscribed UI Components Update Synchronously:**
   * **VR Helmet HUD:** Top crew nameplate shifts to e.g. `"OMAR // EVA SPECIALIST"`, HUD vital sign rows re-render with Omar's baseline, and terrain player coordinates reset to origin.
   * **My Health Dashboard:** Profile card updates to Omar, adherence sparklines redraw from Omar's 147-day check history, and the flight surgeon handoff packet regenerates.
   * **Today Screen:** Top-bar identity badge shifts to `"OMAR // ARTEMIS BASE CAMP"`, and multisystem SVG lines recalculate and point to Omar's active values.

---

### 5.2 Scenario 2: 1-Click NASA Scenarios, Vital Sliders & CSV Dataset Ingestion
1. **1-Click NASA Preset Buttons:**
   * User clicks e.g. `Tachycardia Warning` in `.vr-presets`.
   * `link.applyPreset("tachycardia")` overwrites `vitals.hr = 158 bpm` and `vitals.rr = 28 rpm`.
   * `assess()` flags HR as `CRITICAL` (> 150 bpm limit).
   * Visor HUD flashes red warning banner: `ELEVATED HEART RATE // 158 BPM (+60% VS BASELINE)`.
   * My Health dashboard immediately highlights the Cardiovascular domain in red.
2. **Manual Range / Number Sliders:**
   * Dragging any slider (e.g. `SpO2` down to `88%`) triggers input event -> calls `link.setVitals({ spo2: 88 })`.
   * If `Signal Quality` is dragged below `60%` (the `SIGNAL_GATE` threshold), `a.gated = true`.
   * HUD displays flashing `MOTION ARTIFACT GATE // ALARMS HELD < 60%` and `HOLD STILL FOR RE-CHECK` message to prevent false alarms during high-motion EVA tasks.
3. **CSV / JSON Telemetry Dataset Upload:**
   * User uploads an EVA time-series file via the file input.
   * `parseDataset(text, filename)` parses columns (`crew`, `terrain`, `hr`, `sys`, `dia`, `rr`, `spo2`, `temp`, `dose`, `signal`, `sans`).
   * `link.loadDataset(rows)` initiates an automated 1 row/second replay interval.
   * Every second, the next row of telemetry streams into `link.setVitals()`, causing the visor HUD dials, helmet warning banners, and dashboard charts to animate continuously as if receiving live flight telemetry.
   * The `Stop replay` button appears, allowing the operator to halt playback at any point.

---

### 5.3 Scenario 3: Network Modes & Gravity Regimes
1. **Network Communication Delay Regimes:**
   * Configured via the `Where` dropdown in Self-Check (`station`, `moon`, `marsTransit`, `marsSurface`).
   * `src/missionEnvironment.js` sets the communication latency:
     * `Space Station`: Real-time audio link (0.5 s delay) -> Flight surgeon escalation is immediate; Earth acts as first responder.
     * `Moon (Artemis Base)`: 1.3-second one-way delay -> Ground control participates in clinical decisions.
     * `Mars Transit (Deep Space)`: 3 to 22-minute one-way light speed delay -> Earth is in advisory mode; **Crew Medical Officer acts autonomously onboard**.
   * Escalation ladder (`.sc-ladder`) visually shifts the active response rung from "Ground Surgeon" to "Autonomous Onboard Protocol & Crew Medical Officer".
2. **Planetary Gravity Regimes:**
   * Toggled via `.vr-seg-toggle` in the VR Helmet HUD (`Moon 0.16g`, `Mars 0.38g`, `Earth 1.00g`).
   * Calls `link.setTerrain(key)` in `src/astraLink.js`.
   * **Physics & Visual Pipeline Execution:**
     * `src/vrHelmetSim.js` changes Three.js procedural terrain generation (`WORLDS.moon` white regolith and craters vs `WORLDS.mars` red dunes, ochre sky, and atmospheric fog).
     * Rover model switches between Apollo-style open wire-wheel Lunar Roving Vehicle and Curiosity/Perseverance-style 6-wheel rocker-bogie Mars science rover.
     * Kinematic gravity constant `g` updates to `1.62 m/s²` (Moon) or `3.72 m/s²` (Mars).
     * Walking and jump physics recalculate: astronaut jumping height increases proportionally (`v²/2g`), and head-bob gait oscillation slows to simulate low-gravity loping locomotion.

---

### 5.4 Scenario 4: 3D EVA Helmet Visor HUD & Real-Time Sync
* When the user opens the VR Helmet HUD tab (`#helmet`), `src/vrHelmetSim.js` renders a WebGL canvas inside `.vr-glass`.
* A 2D overlay heads-up display (`.vr-hud`) is positioned directly in front of the 3D camera plane.
* **Dual-Directional Synchronization:**
  * **Dashboard -> HUD:** When the operator alters sliders or uploads a dataset in the override panel, `link.subscribe()` fires inside `createHelmetSim()`. `drawHud()` immediately re-generates the curved visor SVG text, heart rate digital readouts, blood pressure gauges, and critical caution banners at 60 fps.
  * **HUD -> Dashboard:** Moving the astronaut or triggering waypoint navigation updates distance meters. If the user clicks `VR Split-Screen Headset Mode`, the renderer switches to stereoscopic dual-camera viewports (`eyeL` and `eyeR`), rendering dual HUD projections for mobile phone VR goggles (e.g. Google Cardboard).

---

### 5.5 Scenario 5: Live Webcam in `lab.html` vs `index.html` Sync Architecture
* **Operational Independence:**
  * The camera workspace in `lab.html` operates on an isolated runtime (`src/main.js`). When a user activates the webcam in `lab.html`, MediaPipe processes full-body landmarks, retargets them to the 3D clothed astronaut avatar (`human_body_clothed.glb`), and evaluates joint angles in MotionGuard.
  * **No raw video or high-frequency landmark arrays are broadcast across tabs** to preserve performance and prevent memory saturation.
* **Bridge Mechanisms:**
  1. **Direct Navigation Handoffs:** URL hash routes (`lab.html#movement-capture`, `lab.html#respiratory-monitor`) allow seamless jumps between `index.html` and specific tools in `lab.html`.
  2. **Standardized Evidence Packets:** Clicking `Export evidence` in `lab.html` generates a JSON file adhering to `MOVEMENT_EVIDENCE_SCHEMA_VERSION`. This file can be imported into `index.html` under the `Evidence` tab or used to update the astronaut's movement history.
  3. **Shared Local Storage:** Both pages access the same `localStorage` domain for theme preferences (`astra-theme`), flight surgeon limits (`astra-surgeon-limits`), and encrypted health records (`astra-health-records-v1`).

---

## 6. Honest Diagnostic Audit (Leftovers, Dead Buttons & Glitches)

### 6.1 Leftover Pre-Rebrand References & Out-of-Scope Terminology
1. **X-ray Bone Fracture Screener (`lab.html` Lines 328-350):**
   * *Issue:* Stage 0 of the workflow in `lab.html` retains controls for `"Analyze X-ray"`, `"Save endpoint"` for an external inference API, and references to DenseNet121 and U-Net++ fracture segmentation on the FracAtlas dataset.
   * *Assessment:* ASTRA's official core mission is astronaut autonomous health self-monitoring, functional movement tracking, and Level-A microgravity bone loss mechanics. Astronauts on EVA or Mars transit do not carry standard hospital X-ray machines. While technically functional as an offline demo (`#load-demo-prediction`), this feature is a legacy component from early hackathon prototypes.
   * *Demo Guidance:* Avoid lingering on Stage 0 during a 3-minute pitch. Focus directly on the 3D digital twin, the VR Helmet Visor HUD, the seated knee extension self-check, and the crew triage workflow.

2. **Legacy Sliders in `lab.html`:**
   * *Issue:* Sliders for `#mass` (1-5000g), `#speed` (0-120 m/s), and `#contact-area` in Stage 1 duplicate the cleaner Level-A impact model presented in `index.html#impact`.
   * *Assessment:* Having two different impact calculation UIs across the site can confuse judges if both pages are demonstrated.

---

### 6.2 Dead, Disabled, or Unwired Buttons
1. **`#camera-motion` Button in `lab.html` (Line 228):**
   * *Status:* Rendered with the `disabled` HTML attribute by default (`<button id="camera-motion" ... disabled>Camera linked</button>`).
   * *Behavior:* It only becomes enabled after the webcam is started and MediaPipe successfully locks onto a human skeleton. If clicked before starting the camera, it does nothing without providing visual feedback.
2. **`#clear-scenario-reference` in `lab.html` (Line 564):**
   * *Status:* Disabled until `#save-scenario-reference` is clicked first. This is intentional state management, but can appear unresponsive if clicked out of sequence.
3. **`#replay-video` in `lab.html` (Line 412):**
   * *Status:* Rendered with `hidden` attribute. Only un-hides after a full 8-second assessment trial has been recorded.
4. **`Bluetooth Vital Readers` in `src/selfCheckPanel.js` (Line 493):**
   * *Status:* The `"Read from Bluetooth cuff"` buttons will fail gracefully with `"Web Bluetooth is not available in this browser or device"` if opened on browsers without Web Bluetooth enabled (e.g. Firefox or desktop Safari). Chrome and Edge on Windows/Android work properly.

---

### 6.3 Hackathon Demo Risks & Mitigation Protocols
1. **Heavy 3D Asset Loading Times:**
   * *Risk:* `public/models/anatomy/musculoskeletal.glb` is 11.6 MB, and `public/models/human_body_clothed.glb` is 14.2 MB. On slow hotel/venue Wi-Fi, initial page load can take 8-15 seconds.
   * *Mitigation:* The service worker (`sw.js`) and offline cache bundle these files locally. Run `npm run build` or load the site on localhost (`127.0.0.1:5173`) before presenting so all 3D meshes are cached in browser IndexedDB/RAM.
2. **Camera Permission Prompts Interrupting the Pitch:**
   * *Risk:* Clicking `Start camera` during a live 3-minute pitch will pop up the browser webcam permission prompt, stalling the presentation.
   * *Mitigation:* Grant camera permissions beforehand on the demo laptop, or utilize the built-in synthetic demo buttons (`Demo capture · poor framing` and `Demo capture · usable`) which execute instantaneously without requiring active webcam hardware.
3. **Landing Mode Dismissal:**
   * *Observation:* The app boots cleanly into full-screen Landing Mode. Remember that clicking `"Start my check"`, `"Open VR Helmet HUD"`, `"Run flight briefing"`, or `"Enter Console"` immediately enters the working cockpit, while clicking the top-left `"ASTRA"` logo returns to the cinematic landing view.

---
*Report compiled autonomously via ASTRA Systems Auditor under NASA Space Apps Cairo 2026 telemetry guidelines.*
