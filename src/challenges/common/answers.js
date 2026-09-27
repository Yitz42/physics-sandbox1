// answers.js — number boxes for answers, and checking what the student typed.
//
// The boxes only take a plain number: digits, one decimal point and a minus
// sign at the front. Leading zeros are dropped as you type ("090" → "90"),
// and a number outside the answer's range isn't accepted (ask.min / ask.max,
// or a sensible range for its unit). Where a negative answer is possible, a ±
// button flips the sign (phone keypads often lack a minus key). Extra digits
// are rounded to the precision asked for, in the box itself when the student
// leaves it or presses Test: 346.4102 N becomes (and is checked as) 346.4 N.
//
// Used by predict and solve. Checking has three outcomes:
//   correct     within ± precision of the true value (default ±0.1 in the
//               answer's unit, e.g. ±0.1 N or ±0.1°; a stage can set ask.precision).
//               ask.whole: true asks for a whole number (a count), which must match exactly.
//   known slip  close to what a common mistake gives → explain that mistake
//   other       a general nudge (close-but-rounded, or "check your components")

import { el } from "../../ui/controls.js";
import { renderTex, renderMixed } from "../../render/panel.js";
import { unitLabel } from "../../core/units.js";

export const DEFAULT_PRECISION = 0.1;

// The rounding step for an ask: 1 for a whole number, else its precision.
const precisionOf = (ask) => (ask.whole ? 1 : ask.precision ?? DEFAULT_PRECISION);

// Read numbers like "-200", "−200", "1,250", "346.4 N", "2.5 kN", "30 N·m" or "2.25 m".
export function parseNumber(text) {
  const t = String(text).trim().replace(/−/g, "-").replace(/,/g, "").replace(/°/g, "");
  const m = t.match(/^([-+]?\d*\.?\d+(?:e[-+]?\d+)?)\s*(kN|N\s*[·.*]?\s*m|Nm|N|m)?\s*$/i);
  if (!m) return null;
  const v = parseFloat(m[1]);
  return m[2] && m[2].toLowerCase() === "kn" ? v * 1000 : v;
}

// Clean up what's being typed: keep digits, one "." and a leading "-", and drop
// leading zeros ("090" → "90", "-007" → "-7", but "0.5" and "-0.5" stay).
export function cleanNumberText(text) {
  let t = String(text).replace(/−/g, "-").replace(/[^0-9.-]/g, "");
  const minus = t.startsWith("-") ? "-" : "";
  t = t.replace(/-/g, "");
  const dot = t.indexOf(".");
  if (dot >= 0) t = t.slice(0, dot + 1) + t.slice(dot + 1).replace(/\./g, "");
  t = t.replace(/^0+(?=\d)/, "");
  return minus + t;
}

// The range an answer may be typed in: ask.min / ask.max, else by unit.
const UNIT_RANGES = { N: [-100000, 100000], "N·m": [-100000, 100000], m: [-1000, 1000], deg: [0, 360] };
export function answerRange(ask, unit) {
  const [lo, hi] = UNIT_RANGES[unit] || [-1000000, 1000000];
  return [ask.min ?? lo, ask.max ?? hi];
}

// Decimal places a precision needs: 0.1 → 1, 0.01 → 2, 1 → 0.
export const decimalsFor = (precision) => Math.max(0, Math.ceil(-Math.log10(precision) - 1e-9));

// Round to the precision's decimal places, e.g. 346.4102 → 346.4 for ±0.1.
export function roundToPrecision(value, precision) {
  return Number(value.toFixed(decimalsFor(precision)));
}

// What the box should show once the student is done typing: extra digits
// rounded away ("430.8812" → "430.9" for ±0.1), so they can see how many
// decimals the answer needs. Text that already fits is left exactly as typed.
export function tidyNumberText(text, precision) {
  const t = cleanNumberText(text);
  const dot = t.indexOf(".");
  const places = decimalsFor(precision);
  if (dot < 0 || t.length - dot - 1 <= places || !Number.isFinite(Number(t))) return t;
  const r = Number(t).toFixed(places);
  return Number(r) === 0 ? r.replace("-", "") : r; // no "-0.0"
}

// The ± label shown beside the unit, e.g. "±0.1 N".
export function precisionText(precision, unit) {
  const u = unitLabel(unit);
  return `±${precision}${u === "°" ? "°" : u ? " " + u : ""}`;
}

// When a wrong answer matches no known slip: a nudge that fits the kind of
// quantity (a stage can give its own with ask.otherwise).
const OTHERWISE = {
  N: "That doesn't match. Re-check each force's components (size and sign).",
  m: "That doesn't match. Re-check the distance: which two points it runs between, and the differences in their coordinates.",
  "N·m": "That doesn't match. Re-check each moment: force × perpendicular distance, with + for counterclockwise and − for clockwise.",
  "": "That doesn't match. Each part of a unit vector is a component divided by the size, so it lies between −1 and 1 (and u_x² + u_y² = 1).",
  deg: "That doesn't match. Re-check the angle: which axis it is measured from, and tan⁻¹ of which components.",
};

// Returns { ok, message, kinds }. kinds: what sort of mistake a wrong answer
// looks like (see src/core/diagnosis.js) — recorded for the comprehension page.
// exact: a whole number that must match exactly (a count, e.g. of unknowns).
export function checkAnswer(text, correct, { precision = DEFAULT_PRECISION, mistakes = [], unit = "", otherwise, exact = false } = {}) {
  const typed = parseNumber(text);
  if (typed == null) return { ok: false, empty: true, message: "Type a number (for example 346.4 or -200.0)." };
  const value = roundToPrecision(typed, precision); // extra digits beyond the precision don't count
  // Tiny extra allowance so a correctly rounded answer (e.g. 346.4 for 346.4102) always passes.
  if (Math.abs(value - correct) <= (exact ? 0 : precision) + 1e-9) return { ok: true };
  // Which common mistake is this answer closest to? (Diagnosis can be looser
  // than grading: a slip plus rounding still gets its explanation.)
  const near = (target) => Math.abs(value - target) <= Math.max(0.02 * Math.abs(target), precision);
  const slips = mistakes.filter((m) => near(m.value)).sort((a, b) => Math.abs(value - a.value) - Math.abs(value - b.value));
  if (slips.length) return { ok: false, message: slips[0].message, kinds: [slips[0].kind || "unexplained", slips[0].also].filter(Boolean) };
  if (exact) return { ok: false, kinds: ["unexplained"], message: otherwise || "That doesn't match. Count again." };
  if (Math.abs(value - correct) <= Math.max(0.03 * Math.abs(correct), 5 * precision)) {
    return { ok: false, kinds: ["rounding"], message: `Very close, but it needs to be within ${precisionText(precision, unit)}. Keep more digits in the middle of your working and round only at the end.` };
  }
  return { ok: false, kinds: ["unexplained"], message: otherwise || OTHERWISE[unit] || OTHERWISE.N };
}

// Build one input row per asked quantity.
//   asks: [{ quantity, label?, unit?, precision? }]
//   quantities: solver.quantities(setup) — supplies labels and units
export function answerInputs(container, asks, quantities) {
  const rows = asks.map((ask) => {
    const q = quantities[ask.quantity] || {};
    const unit = ask.unit || q.unit || "";
    const label = el("span", { className: "answer-label" });
    renderTex(label, `${ask.label || q.label || ask.quantity} =`);
    const input = el("input", { type: "text", inputMode: "decimal", className: "answer-input", autocomplete: "off", placeholder: "?" });
    const note = el("div", { className: "answer-note" });
    // Only plain numbers inside the range can be typed (see the top of this file).
    const [lo, hi] = answerRange(ask, unit);
    let last = "";
    const pretty = (v) => v.toLocaleString("en-US").replace("-", "−"); // e.g. "−100,000"
    const rangeNote = `Answers here are between ${pretty(lo)} and ${pretty(hi)}${unit ? " " + unitLabel(unit) : ""}.`;
    input.addEventListener("input", () => {
      const clean = cleanNumberText(input.value);
      const v = Number(clean);
      const partial = ["", "-", ".", "-."].includes(clean);
      if (partial || (Number.isFinite(v) && v >= lo && v <= hi)) {
        if (clean !== input.value) {
          // Keep the cursor where it was, less any characters that were removed.
          const pos = Math.max(0, (input.selectionStart ?? clean.length) - (input.value.length - clean.length));
          input.value = clean;
          input.setSelectionRange(pos, pos);
        }
        last = clean;
        if (note.textContent === rangeNote) note.textContent = "";
      } else {
        input.value = last; // out of range: undo that keystroke
        note.textContent = rangeNote;
      }
    });
    // Round extra digits away when the student leaves the box (and before checking).
    const precision = precisionOf(ask);
    const tidy = () => {
      if (input.readOnly) return;
      input.value = last = tidyNumberText(input.value, precision);
    };
    input.addEventListener("blur", tidy);
    // A ± button, only where a negative answer is possible: phone and tablet
    // number keypads often have no minus key.
    const sign = lo < 0 ? el("button", {
      type: "button", className: "answer-sign", title: "Switch between positive and negative", ariaLabel: "plus or minus",
      // Drawn as lines (not the "±" character, which looks smudged at this size).
      innerHTML: '<svg viewBox="0 0 16 16" width="22" height="22" aria-hidden="true"><path d="M8 2v7M4.5 5.5h7M4.5 13h7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" fill="none"/></svg>',
      onmousedown: (e) => e.preventDefault(), // keep the typing cursor in the box
      onclick: () => {
        if (input.readOnly) return;
        const flipped = input.value.startsWith("-") ? input.value.slice(1) : "-" + input.value;
        const v = Number(flipped);
        if (["", "-"].includes(flipped) || (v >= lo && v <= hi)) input.value = last = flipped;
        input.focus();
      },
    }) : null;
    // The unit sits inside the box, at its right end, so it's clear what is being typed.
    const box = el("span", { className: "answer-box" }, [input, unit ? el("span", { className: "answer-box-unit", textContent: unitLabel(unit) }) : null]);
    const row = el("div", { className: "answer-row" }, [
      el("div", { className: "answer-line" }, [
        label, sign, box,
        // e.g. "±0.1 N": the unit plus how close the answer must be
        el("span", { className: "answer-tol", title: "How close your answer must be", textContent: ask.whole ? "whole number" : precisionText(precision, unit) }),
      ]),
      note,
    ]);
    container.appendChild(row);
    return { ask, input, note, row, unit, tidy, done: false };
  });
  return {
    rows,
    focus: () => rows[0] && rows[0].input.focus(),
    // Mark a row right/wrong and show its message.
    mark(row, ok, message = "") {
      row.row.classList.toggle("is-right", ok);
      row.row.classList.toggle("is-wrong", !ok);
      renderMixed(row.note, message); // a note may contain $math$
      if (ok) {
        row.done = true;
        row.input.readOnly = true;
      }
    },
    // Make every box editable again, keeping what's typed (build: the design
    // changed, so the numbers must be checked again).
    reset() {
      rows.forEach((r) => {
        r.done = false;
        r.input.readOnly = false;
        r.row.classList.remove("is-right", "is-wrong", "is-shown");
        r.note.textContent = "";
      });
    },
    // Fill in the correct answers (after "Show answer").
    fill(values) {
      rows.forEach((r) => {
        // Shown to the precision asked for (e.g. one decimal for ±0.1), the way a student would type it.
        r.input.value = values[r.ask.quantity].toFixed(decimalsFor(precisionOf(r.ask)));
        r.input.readOnly = true;
        r.row.classList.remove("is-wrong");
        r.row.classList.add("is-shown");
        r.note.textContent = "Answer shown.";
      });
    },
  };
}

// Check every not-yet-correct row. Returns true when all rows are right.
// otherwise: the nudge for a wrong answer that matches no known slip (a solver
// can give its own, via solver.texts.otherwise; an ask's own wins).
// record (optional): called with { q, ok, kinds } for each row checked — the
// challenges pass ctx.record, so every answer counts toward comprehension.
export function checkRows(inputs, result, mistakesFor, otherwise, record = null) {
  let allOk = true;
  for (const r of inputs.rows) {
    if (r.done) continue;
    if (r.tidy) r.tidy(); // show the rounded number that is actually being checked
    const correct = result.values[r.ask.quantity];
    const out = checkAnswer(r.input.value, correct, { precision: precisionOf(r.ask), exact: !!r.ask.whole, unit: r.unit, mistakes: mistakesFor(r.ask.quantity), otherwise: r.ask.otherwise || otherwise });
    inputs.mark(r, out.ok, out.ok ? "✓ Correct" : out.message);
    if (record && !out.empty) record({ q: r.ask.quantity, ok: out.ok, kinds: out.kinds || [] });
    if (!out.ok) allOk = false;
  }
  return allOk;
}

// The numbers the student typed, by quantity name (for drawing a "shadow"
// of their answer on the picture). Boxes that don't hold a number are left out.
export function guessesFrom(inputs) {
  const out = {};
  for (const r of inputs.rows) {
    const v = parseNumber(r.input.value);
    if (v != null) out[r.ask.quantity] = v;
  }
  return out;
}
