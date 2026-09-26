// answers.js — number boxes for answers, and checking what the student typed.
//
// Used by predict and solve. Checking has three outcomes:
//   correct     within ± precision of the true value (default ±0.1 in the
//               answer's unit, e.g. ±0.1 N or ±0.1°; a stage can set ask.precision)
//   known slip  close to what a common mistake gives → explain that mistake
//   other       a general nudge (close-but-rounded, or "check your components")

import { el } from "../../ui/controls.js";
import { renderTex } from "../../render/panel.js";
import { unitLabel } from "../../core/units.js";

export const DEFAULT_PRECISION = 0.1;

// Read numbers like "-200", "−200", "1,250", "346.4 N" or "2.5 kN".
export function parseNumber(text) {
  const t = String(text).trim().replace(/−/g, "-").replace(/,/g, "").replace(/°/g, "");
  const m = t.match(/^([-+]?\d*\.?\d+(?:e[-+]?\d+)?)\s*(k?N)?\s*$/i);
  if (!m) return null;
  const v = parseFloat(m[1]);
  return m[2] && m[2].toLowerCase() === "kn" ? v * 1000 : v;
}

// The ± label shown beside the unit, e.g. "±0.1 N".
export function precisionText(precision, unit) {
  const u = unitLabel(unit);
  return `±${precision}${u === "°" ? "°" : u ? " " + u : ""}`;
}

// Returns { ok, message }.
export function checkAnswer(text, correct, { precision = DEFAULT_PRECISION, mistakes = [], unit = "" } = {}) {
  const value = parseNumber(text);
  if (value == null) return { ok: false, empty: true, message: "Type a number (for example 346.4 or -200.0)." };
  // Tiny extra allowance so a correctly rounded answer (e.g. 346.4 for 346.4102) always passes.
  if (Math.abs(value - correct) <= precision + 1e-9) return { ok: true };
  // Which common mistake is this answer closest to? (Diagnosis can be looser
  // than grading: a slip plus rounding still gets its explanation.)
  const near = (target) => Math.abs(value - target) <= Math.max(0.02 * Math.abs(target), precision);
  const slips = mistakes.filter((m) => near(m.value)).sort((a, b) => Math.abs(value - a.value) - Math.abs(value - b.value));
  if (slips.length) return { ok: false, message: slips[0].message };
  if (Math.abs(value - correct) <= Math.max(0.03 * Math.abs(correct), 5 * precision)) {
    return { ok: false, message: `Very close, but it needs to be within ${precisionText(precision, unit)}. Keep more digits in the middle of your working and round only at the end.` };
  }
  return { ok: false, message: "That doesn't match. Re-check each force's components (size and sign) and redo the arithmetic." };
}

// Build one input row per asked quantity.
//   asks: [{ quantity, label?, unit?, precision? }]
//   quantities: solver.quantities(setup) — supplies labels and units
export function answerInputs(container, asks, quantities) {
  // Tell students up front how exact they need to be.
  container.appendChild(el("div", { className: "answer-precision", textContent: "Give at least 1 decimal place: answers must be within the ± shown beside each box." }));
  const rows = asks.map((ask) => {
    const q = quantities[ask.quantity] || {};
    const unit = ask.unit || q.unit || "";
    const label = el("span", { className: "answer-label" });
    renderTex(label, `${ask.label || q.label || ask.quantity} =`);
    const input = el("input", { type: "text", inputMode: "decimal", className: "answer-input", autocomplete: "off", placeholder: "?" });
    const note = el("div", { className: "answer-note" });
    const row = el("div", { className: "answer-row" }, [
      el("div", { className: "answer-line" }, [
        label, input,
        // e.g. "±0.1 N": the unit plus how close the answer must be
        el("span", { className: "answer-tol", title: "How close your answer must be", textContent: precisionText(ask.precision ?? DEFAULT_PRECISION, unit) }),
      ]),
      note,
    ]);
    container.appendChild(row);
    return { ask, input, note, row, unit, done: false };
  });
  return {
    rows,
    focus: () => rows[0] && rows[0].input.focus(),
    // Mark a row right/wrong and show its message.
    mark(row, ok, message = "") {
      row.row.classList.toggle("is-right", ok);
      row.row.classList.toggle("is-wrong", !ok);
      row.note.textContent = message;
      if (ok) {
        row.done = true;
        row.input.readOnly = true;
      }
    },
    // Fill in the correct answers (after "Show answer").
    fill(values) {
      rows.forEach((r) => {
        r.input.value = values[r.ask.quantity].toFixed(2); // two decimals: inside any ±0.1
        r.input.readOnly = true;
        r.row.classList.remove("is-wrong");
        r.row.classList.add("is-shown");
        r.note.textContent = "Answer shown.";
      });
    },
  };
}

// Check every not-yet-correct row. Returns true when all rows are right.
export function checkRows(inputs, result, mistakesFor) {
  let allOk = true;
  for (const r of inputs.rows) {
    if (r.done) continue;
    const correct = result.values[r.ask.quantity];
    const out = checkAnswer(r.input.value, correct, { precision: r.ask.precision ?? DEFAULT_PRECISION, unit: r.unit, mistakes: mistakesFor(r.ask.quantity) });
    inputs.mark(r, out.ok, out.ok ? "✓ Correct" : out.message);
    if (!out.ok) allOk = false;
  }
  return allOk;
}
