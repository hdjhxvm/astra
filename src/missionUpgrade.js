import "./missionUpgrade.css";
import { NASA_RESPIRATORY_EVIDENCE, SPACE_APPS_2026 } from "./data/nasaRespiratoryEvidence.js";
import { initNasaExpansionPanel } from "./nasaExpansionPanel.js";
import { HEALTH_CONTEXT_SOURCES } from "./healthEvidenceData.js";
import { personalDashboardModel } from "./personalDashboardModel.js";
import { ELENA_HISTORY, elenaDay147 } from "./elenaSelfCheck.js";
import { evaluateSelfCheck } from "./selfCheck.js";

const logoUrl = `${import.meta.env.BASE_URL}brand/astra-logo.png`;
const node = (tag, text, className = "") => {
  const element = document.createElement(tag);
  if (text !== undefined) element.textContent = text;
  element.className = className;
  return element;
};

export function applyASTRABrand(scope = document) {
  for (const brand of scope.querySelectorAll(".tw-brand")) {
    if (brand.querySelector(".ab-brand-logo")) continue;
    const image = new Image(); image.src = logoUrl; image.alt = "ASTRA";
    image.className = "ab-brand-logo";
    brand.querySelector(".tw-mark")?.remove(); brand.prepend(image);
  }
  const title = scope.querySelector(".tw-intro-title");
  if (title && !title.querySelector("img")) {
    const image = new Image(); image.src = logoUrl; image.alt = "ASTRA";
    image.className = "ab-intro-logo";
    title.prepend(image);
  }
}

export function mountMissionUpgrade(root, app) {
  applyASTRABrand(root);
  const overview = node("section", undefined, "ab-mission-overview");
  overview.setAttribute("aria-label", "ASTRA mission overview");
  overview.innerHTML = `<div class="ab-overview-top"><span class="ab-kicker">ASTRA TELEMETRY  FLIGHT BUILD</span><span class="ab-prototype">ONBOARD BIOMETRIC STREAM</span></div>
    <h1>Autonomous crew health, <br><span>in focus.</span></h1>
    <p class="ab-overview-description">Track EVA baselines, live visor telemetry, and multisystem digital twin status across the 6-member Artemis & Ares crew.</p>
    <div class="ab-scope-note"><span aria-hidden="true">◇</span><span><b>Cmdr. Laila Yasser // Flight Profile</b><br>Switch to “You / this device” in Self-Check for local station measurements.</span></div>
    <a class="ab-selfcheck-cta" href="#helmet" data-ab-action="helmet"><span><small>MOON 0.16G // MARS 0.38G</small>Open VR Helmet HUD</span><span aria-hidden="true">→</span></a>
    <a class="ab-selfcheck-cta" href="#selfcheck" data-ab-action="selfcheck" style="margin-top:8px"><span><small>GATHER / EVALUATE / ACT</small>Open daily self-check</span><span aria-hidden="true">→</span></a>
    <div class="ab-overview-actions"><a class="ab-breathing-cta" href="${import.meta.env.BASE_URL}lab.html#respiratory-monitor"><span><small>EXPERIMENTAL</small>Breathing check</span><span aria-hidden="true">↗</span></a><button type="button" data-ab-action="evidence">NASA & CSA evidence <span aria-hidden="true">↗</span></button></div>
    <div class="ab-device-note"><span class="ab-device-dot" aria-hidden="true"></span><span>On-device telemetry & WebGL engine</span></div>`;
  root.append(overview);
  overview.querySelector('[data-ab-action="helmet"]').onclick = event => { event.preventDefault(); app.setExperience("helmet"); };
  overview.querySelector('[data-ab-action="selfcheck"]').onclick = event => { event.preventDefault(); app.setExperience("selfcheck"); };

  const evidenceDialog = node("dialog", undefined, "ab-evidence-dialog");
  evidenceDialog.setAttribute("aria-labelledby", "ab-evidence-title");
  evidenceDialog.innerHTML = `<header class="ab-evidence-heading"><div><span class="ab-kicker">NASA / OPEN SCIENCE</span><h2 id="ab-evidence-title">Trace the evidence.</h2><p>Explore the source, population, and limits behind the research.</p></div><button type="button" class="ab-dialog-close" aria-label="Close NASA evidence">×</button></header>
    <div class="ab-evidence-boundary">These external studies provide research context. They do not validate camera breathing estimates or describe your health.</div>
    <div class="ab-evidence-controls"><label>Find a source<input type="search" id="ab-evidence-search" placeholder="Search datasets, populations, or topics"></label><label>Research domain<select id="ab-evidence-domain"><option value="">All domains</option></select></label></div>
    <p class="ab-evidence-count" role="status"></p><div class="ab-evidence-grid"></div><footer class="ab-evidence-footer"></footer>`;
  root.append(evidenceDialog);
  const expansion = node("section", undefined, "ab-nasa-expansion");
  evidenceDialog.querySelector(".ab-evidence-controls").before(expansion);
  let expansionStarted = false;
  const close = evidenceDialog.querySelector(".ab-dialog-close");
  close.onclick = () => evidenceDialog.close();
  let evidencePausedTwin = false;
  evidenceDialog.addEventListener("close", () => {
    if (evidencePausedTwin) app.updateScenePause?.();
    evidencePausedTwin = false;
  });
  evidenceDialog.addEventListener("click", event => { if (event.target === evidenceDialog) { const rect = evidenceDialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) evidenceDialog.close(); } });
  const sources = [...(Array.isArray(NASA_RESPIRATORY_EVIDENCE) ? NASA_RESPIRATORY_EVIDENCE : []), ...HEALTH_CONTEXT_SOURCES];
  const selector = evidenceDialog.querySelector("#ab-evidence-domain"), search = evidenceDialog.querySelector("#ab-evidence-search");
  [...new Set(sources.map(source => source.domain).filter(Boolean))].forEach(domain => { const option = node("option", domain); option.value = domain; selector.append(option); });
  function renderSources() {
    const query = search.value.trim().toLowerCase();
    const selected = sources.filter(source => (!selector.value || source.domain === selector.value) && (!query || JSON.stringify(source).toLowerCase().includes(query)));
    evidenceDialog.querySelector(".ab-evidence-count").textContent = `${selected.length} of ${sources.length} sources / integration status shown for every source`;
    const grid = evidenceDialog.querySelector(".ab-evidence-grid"); grid.replaceChildren();
    for (const source of selected) {
      const article = node("article", undefined, "ab-source-card");
      const heading = node("div", undefined, "ab-source-meta");
      heading.append(node("span", source.accession || source.id || "NASA"), node("span", source.integrationStatus || "Reference catalog"));
      const title = node("a", source.title); title.href = source.url; title.target = "_blank"; title.rel = "noopener noreferrer";
      const population = node("p", source.population, "ab-source-population");
      const summary = node("p", source.summary);
      const limits = node("details"); limits.append(node("summary", "Use and limitations"), node("p", Array.isArray(source.limits) ? source.limits.join(" ") : source.limits || "External research context; no individual health inference."));
      article.append(heading, node("h3"), population, summary, limits); article.querySelector("h3").append(title); grid.append(article);
    }
    if (!selected.length) grid.append(node("p", "No sources match this search. Try a different topic."));
  }
  search.addEventListener("input", renderSources); selector.addEventListener("change", renderSources);
  const footer = evidenceDialog.querySelector(".ab-evidence-footer");
  const eventLink = node("a", "2026 NASA Space Apps Challenge ↗");
  eventLink.href = SPACE_APPS_2026.sourceUrl || "https://www.spaceappschallenge.org/2026/"; eventLink.target = "_blank"; eventLink.rel = "noopener noreferrer";
  footer.append(node("span", "Open data, clear provenance, honest uncertainty."), eventLink);
  function openEvidence() {
    // The covered anatomical scene can hold its last frame while sources are read.
    evidencePausedTwin = app.state.experience === "mission";
    if (evidencePausedTwin) app.scene.setPaused(true);
    renderSources(); evidenceDialog.showModal(); search.focus();
    if (!expansionStarted) { expansionStarted = true; void initNasaExpansionPanel(expansion); }
  }
  overview.querySelector('[data-ab-action="evidence"]').onclick = openEvidence;

  const respiratoryLink = node("a", undefined, "ab-respiratory-shortcut");
  respiratoryLink.href = `${import.meta.env.BASE_URL}lab.html#respiratory-monitor`;
  respiratoryLink.innerHTML = '<span class="ab-respiratory-glyph" aria-hidden="true">⌁</span><span>Respiratory motion<small>Experimental / camera capture</small></span><span aria-hidden="true">↗</span>';
  root.append(respiratoryLink);
  const healthDashboard = node("section", undefined, "ab-health-dashboard");
  healthDashboard.setAttribute("aria-label", "My health dashboard"); root.append(healthDashboard);
  const goCheck = (result = false) => { app.setExperience("selfcheck"); if (result) { if (app.selfCheck.openFollowUps) app.selfCheck.openFollowUps(); else app.selfCheck.openStep("result"); } };
  function renderPersonalDashboard() {
    const personal = app.state.profile === "you";
    healthDashboard.hidden = !personal || app.state.experience !== "mission";
    overview.querySelector("h1").innerHTML = personal ? 'Your health, <br><span>your next step.</span>' : 'Autonomous crew health, <br><span>in focus.</span>';
    overview.querySelector(".ab-scope-note").innerHTML = personal ? '<span aria-hidden="true">◇</span><span><b>My health / this device</b><br>Active on-device baseline from mission telemetry until a new self-check is saved.</span>' : '<span aria-hidden="true">◇</span><span><b>Cmdr. Laila Yasser // Flight Profile</b><br>Active telemetry stream for Artemis Lunar & Ares Mars Transit.</span>';
    overview.querySelector(".ab-device-note span:last-child").textContent = app.state.lightweight ? "Lightweight view / 3D rendering paused" : "3D anatomical twin / on-device telemetry";
    if (!personal) return;
    const rawSnap = app.selfCheck.snapshot?.("you");
    let effectiveSnap = rawSnap;
    if (!rawSnap?.locked && !rawSnap?.latestCheck) {
      const latest = elenaDay147();
      effectiveSnap = {
        ...rawSnap,
        latestCheck: latest,
        history: [...ELENA_HISTORY, latest],
        evaluation: evaluateSelfCheck(latest, ELENA_HISTORY),
        persist: true,
        followUps: rawSnap?.followUps ?? [],
      };
    }
    const model = personalDashboardModel(effectiveSnap);
    const heading = node("header"); heading.append(node("span", "TODAY / MY HEALTH", "ab-kicker"), node("h2", "A clear view of your day."), node("p", model.summary));
    healthDashboard.replaceChildren(heading);
    if (model.locked) {
      const lock = node("div", undefined, "ab-health-empty"); lock.append(node("h3", "Your health record is locked"), node("p", "Unlock in Self-Check to view saved observations and follow-ups. No empty baseline is substituted."));
      const unlock = node("button", "Unlock my record", "ab-health-action"); unlock.type = "button"; unlock.onclick = () => goCheck(); lock.append(unlock); healthDashboard.append(lock); return;
    }
    const strip = node("div", undefined, "ab-health-summary");
    for (const [label, value] of [["Saved checks", model.checkCount], ["Follow-ups open", model.openCount], ["Record", model.persist ? "Saved on device" : "This session"]]) { const item = node("div"); item.append(node("small", label), node("strong", value)); strip.append(item); }
    healthDashboard.append(strip);
    const cards = node("div", undefined, "ab-health-grid");
    for (const item of model.indicators) {
      const card = node("article", undefined, "ab-health-card"); card.dataset.indicator = item.key; card.dataset.status = item.status;
      card.append(node("span", item.label, "ab-health-label"), node("strong", item.value), node("span", item.statusLabel, "ab-health-status"), node("small", item.detail)); cards.append(card);
    }
    healthDashboard.append(cards);
    const tasks = node("section", undefined, "ab-health-next"); tasks.append(node("h3", "What to do next"));
    if (!model.tasks.length) tasks.append(node("p", model.checkCount ? "Review your last check or start the next one. New follow-ups appear here when you choose and save them." : "Start a daily check. Use instrument readings or self-reports; camera tests are optional. Comparable usable readings build your personal baseline."));
    for (const task of model.tasks.slice(0, 3)) { const button = node("button", undefined, "ab-health-task"); button.type = "button"; button.append(node("strong", task.label), node("span", task.text), node("small", task.due)); button.onclick = () => goCheck(true); tasks.append(button); }
    const next = node("button", model.tasks.length ? "Manage follow-ups →" : "Open daily self-check →", "ab-health-action"); next.type = "button"; next.onclick = () => goCheck(Boolean(model.tasks.length)); tasks.append(next); healthDashboard.append(tasks);
  }
  root.addEventListener("astra-dashboard-render", renderPersonalDashboard);
  window.addEventListener("astra-records-change", renderPersonalDashboard);
  window.addEventListener("astra-open-evidence", openEvidence);
  renderPersonalDashboard();
  return { openEvidence, renderPersonalDashboard };
}
