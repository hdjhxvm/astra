// Flight profile for the primary active astronaut, Cmdr. Laila Yasser (Team ASTRA).
// Every value in this file is a simulated training value (SIM). It is never joined to NASA subject data.
const field = (value, unit, boundary = "SIM PROFILE // authored training value") =>
  ({ value, unit, provenance: "SYNTHETIC DEMO", boundary });
// Cabin dosimeter accrues at the mean absorbed dose rate in water that MSL/RAD measured inside the
// Curiosity cruise stage on the way to Mars (Dec 2011 to Jul 2012): 458 +/- 32 uGy/day,
// Guo et al., A&A 577, A58 (2015). Zeroed on day 1. ISS area dosimeters in NASA OSDR read 0.204-0.355.
const TRANSIT_DOSE_RATE = 0.458;
const transitDose = day => Number((TRANSIT_DOSE_RATE * (day - 1)).toFixed(2));
const frame = (day, stage, extension, rom, heart, dose = transitDose(day)) => ({
  day: field(day, "mission day"), stage: field(stage, "label"),
  kneeExtension: field(extension, "deg"), kneeRom: field(rom, "deg"),
  heartRate: field(heart, "bpm"), absorbedDose: field(dose, "mGy", "SIM DOSIMETER // absorbed dose history at the MSL/RAD cruise rate"),
  trackingQuality: field(.94, "fraction", "SIM // input-quality indicator for the capture"),
  sampleCount: field(120, "samples"), heartQuality: field(.95, "fraction"),
});
export const ELENA = {
  schema: "astra-flight-profile-v1",
  identity: { id: field("DEMO-ELENA", "identifier"), name: field("Cmdr. Laila Yasser", "name"),
    mission: field("ARTEMIS LUNAR & ARES MARS TRANSIT", "mission"), destination: field("Earth-Moon-Mars transit", "context"),
    duration: field(240, "days"), currentDay: field(147, "mission day"), gravity: field("microgravity", "context") },
  protocol: field("restrained-knee-extension-demo-v1", "protocol"),
  model: field("synthetic-script-v2", "input source"),
  observations: [
    frame(1, "EVA baseline locked", 165, 80, 64),
    frame(30, "Early observation", 165, 80, 65),
    frame(60, "Movement observation", 163, 78, 66),
    frame(90, "Dosimeter update", 160, 74, 69),
    frame(120, "Cardiovascular follow-up", 157, 69, 72),
    frame(147, "Multisystem review", 151, 62, 76),
    frame(180, "Planned scenario checkpoint", 153, 66, 73),
    frame(240, "Planned scenario endpoint", 160, 74, 68),
  ],
  doseRate: field(TRANSIT_DOSE_RATE, "mGy/day", "Mean absorbed dose rate in water measured by MSL/RAD during the 2011-2012 Mars cruise (Guo et al., A&A 577, A58, 2015). Drives the SIM cabin dosimeter."),
  event: { label: field("Space-weather scenario", "label"), increment: field(10, "mGy", "Tabletop increment for the training scenario.") },
  whatIf: { poorQuality: field(.35, "fraction"), reducedExtension: field(140, "deg"),
    stableExtension: field(165, "deg"), exposureMax: field(150, "mGy", "Scenario control bound for the slider.") },
  boundary: "SIM PROFILE // Team ASTRA training mission. Checkpoints after Day 147 are planned scenarios. External research cohorts stay separate from crew telemetry.",
};
