# ASTRA Engineering Rules

Applies to every file touched in this repository. Team ASTRA, NASA Space Apps Cairo 2026.

## 1. Writing style: flight-console voice

- Write UI copy the way a flight controller reads a console: short, specific, present tense.
  Examples: `ASTRA TELEMETRY  FLIGHT BUILD`, `EVA BASELINE`, `ONBOARD BIOMETRIC STREAM`,
  `HOLD STILL FOR RE-CHECK`, `SIGNAL GATE: ALARMS HELD`.
- No em-dashes (`—`). Use a comma, a colon, a full stop or `//`.
- No decorative middle dots (`·`) in new copy. Use `/` or `//` as a separator.
- No four-word slogan stacks (`PREDICT. OBSERVE. UPDATE. PROTECT.`).
- No "not X but Y" contrast sentences. State what the thing is.
- No apologetic or padded disclaimers. When a value is simulated, label it with one short
  console tag (`SIM`, `SIM PROFILE`, `TRAINING DATASET`) so a reviewer can tell simulated
  telemetry from instrument data at a glance. Keep that tag: it is a data-provenance field.
- Units always printed: `bpm`, `mmHg`, `rpm`, `%`, `°C`, `h`, `mGy/day`.
- Missing data prints as `--`, never as zero.

## 2. Palette lock

Use the project palette from `src/uiV5.css` and `src/twin.css`. No new hues.

| Role | Value |
| --- | --- |
| Deep space navy (page) | `#02050c` |
| Navy panel | `#071326` |
| Glass panel | `rgba(8, 17, 34, 0.84)` / `rgba(7, 19, 38, 0.78)` |
| Primary telemetry cyan | `#7fe3ff` |
| Secondary cyan | `#38bdf8` |
| Nominal | `#34d399` |
| Caution | `#fbbf24` |
| Critical | `#f87171` |

Status colour is never the only signal: every coloured state also prints a word
(`NOMINAL`, `CAUTION`, `CRITICAL`, `HELD`, `STANDBY`).

## 3. Engineering

- Keep exported names stable (`ELENA`, `CREW`, `ELENA_HISTORY`) so imports do not break.
- Shared live telemetry goes through `src/astraLink.js` and the
  `BroadcastChannel("astra_digital_twin")`. Views subscribe; they do not keep private copies.
- Thresholds carry a source comment (AHA, NASA HRP, MSL/RAD, Chang'e-4 LND, etc.).
- `npm test` and `npm run build` pass before a change is considered done.

## 4. Attribution

- ASTRA is released under the MIT License (`LICENSE`). Keep `LICENSE` and `THIRD_PARTY_NOTICES.md` intact.
