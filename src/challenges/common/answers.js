// answers.js — number boxes for answers, and checking what the student typed.
//
// Used by predict and solve. Checking has three outcomes:
//   correct     within tolerance (default 2%, as in the stage's ask.tolerance)
//   known slip  matches a common mistake → explain that specific mistake
//   other       a general nudge (close-but-rounded, or "check your FBD")

import { el } from "../../ui/controls.js";
import { renderTex } from "../../render/panel.js";
import { unitLabel, format } from "../../core/units.js";

// Read numbers like "-200", "−200", "1,250", "346.4 N" or "2.5 kN".
export function parseNumber(text) {
  const t = String(text).trim().replace(/−/g, "-").replace(/,/g, "").replace(/°/g, "");
  const m = t.match(/^([-+]?\d*\.?\d+(?:e[-+]?\d+)?)\s*(k?N)?\s*$/i);
  if (!m) return null;
  const v = parseFloat(m[1]);
  return m[2] && m[2].toLowerCase() === "kn" ? v * 1000 : v;
}

export function matches(value, target, tolerance = 0.02) {
  // Absolute floor so an answer of 0 can be matched by 0.3 etc.
  const tol = Math.max(tolerance * Math.abs(target), 0.5);
  return Math.abs(value - target) <= tol;
}

// Returns { ok, message }.
export function checkAnswer(text, correct, { tolerance = 0.02, mistakes = [] } = {}) {
  const value = parseNumber(text);
  if (value == null) return { ok: false, empty: true, message: "Type a number (for example 346 or -200)." };
  if (matches(value, correct, tolerance)) return { ok: true };
  const slip = mistakes.find((m) => matches(value, m.value, tolerance));
  if (slip) return { ok: false, message: slip.message };
  if (matches(value, correct, 0.06)) {
    return { ok: false, message: "Very close! Keep at least 4 significant figures until the final step, so rounding doesn't pile up." };
  }
  return { ok: false, message: "That doesn't match. Re-check each force's components (size and sign) and redo the arithmetic." };
}

// Build one input row per asked quantity.
//   asks: [{ quantity, label?, unit?, tolerance? }]
//   quantities: solver.quantities(setup) — supplies labels and units
export function answerInputs(container, asks, quantities) {
  const rows = asks.map((ask) => {
    const q = quantities[ask.quantity] || {};
    const unit = ask.unit || q.unit || "";
    const label = el("span", { className: "answer-label" });
    renderTex(label, `${ask.label || q.label || ask.quantity} =`);
    const input = el("input", { type: "text", inputMode: "decimal", className: "answer-input", autocomplete: "off", placeholder: "?" });
    const note = el("div", { className: "answer-note" });
    const row = el("div", { className: "answer-row" }, [
      el("div", { className: "answer-line" }, [label, input, el("span", { className: "answer-unit", textContent: unitLabel(unit) })]),
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
        r.input.value = format(values[r.ask.quantity], "", 4).replace(/ $/, "");
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
    const out = checkAnswer(r.input.value, correct, { tolerance: r.ask.tolerance ?? 0.02, mistakes: mistakesFor(r.ask.quantity) });
    inputs.mark(r, out.ok, out.ok ? "✓ Correct" : out.message);
    if (!out.ok) allOk = false;
  }
  return allOk;
}
