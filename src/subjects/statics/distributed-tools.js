// distributed-tools.js — extras for distributed loads (Unit 6):
//   the answers common mistakes give (with what went wrong), the lines
//   under the equations, and the "shadow" of a student's wrong answer.

import { fixedTex, sigFig, format } from "../../core/units.js";
import { magnitudeOf } from "./particle.js";
import { solveDistributed } from "./distributed.js";
import { wrongCentroid, endValues } from "./distributed-loads.js";

// [{ value, message }] for quantity `name` ("R", "pos", or a piece's id).
export function distributedMistakes(setup, name) {
  const res = solveDistributed(setup);
  const v = res.values, parts = res.parts;
  const O = setup.about ? setup.about.at[0] : 0;
  const list = [];
  const add = (value, message) => {
    const correct = v[name];
    if (!Number.isFinite(value) || Math.abs(value - correct) < 1e-6 * Math.max(1, Math.abs(correct))) return;
    if (!list.some((m) => Math.abs(m.value - value) < 1e-9)) list.push({ value, message });
  };
  const tris = parts.filter((p) => p.kind === "tri"), curves = parts.filter((p) => p.kind === "curve");
  const triF = tris.reduce((s, p) => s + p.F, 0);

  // A single piece's own resultant (asked for by its id).
  const part = parts.find((p) => p.id === name);
  if (part) {
    if (part.kind === "tri") add(2 * part.F, "Did you forget the ½? A triangle's area is ½ × base × height.");
    return list;
  }

  if (name === "R") {
    if (tris.length) add(v.R + triF, "Did you forget the ½? A triangular load's resultant is ½ × base × height — the area of the triangle.");
    for (const c of curves) {
      add(v.R - c.F + (c.height * c.L) / 2, "That treats the curve as a straight-sided triangle (½w₀L). For a curved load, integrate: F_R = ∫w dx.");
      add(v.R - c.F + c.height * c.L, "That's w₀L, a rectangle's area — but the load isn't uniform. Integrate: F_R = ∫w dx.");
    }
    for (const l of setup.loads || []) {
      const [a, b] = endValues(l);
      if (l.shape === "linear" && a > 0 && b > 0 && Math.abs(a - b) > 1e-9) add(v.R - parts.filter((p) => p.load === l.id).reduce((s, p) => s + p.F, 0) + Math.max(a, b) * (l.to - l.from), "That treats the whole load as a rectangle at its biggest value. Split it: a rectangle under the smaller end plus a triangle on top.");
    }
    if (parts.length + (setup.forces || []).length > 1) {
      for (const p of parts) add(v.R - p.F, `Did you leave out ${pretty(p.symbol)}? Every piece of the load adds to F_R.`);
      for (const f of setup.forces || []) add(v.R - magnitudeOf(f), `Did you leave out ${pretty(f.symbol)}? The point loads count too.`);
    }
    add(v.R / 1000, "Check your units: the answer is in newtons (N), not kN.");
    return list;
  }

  if (name === "pos") {
    const withMoment = (M) => (v.R ? M / v.R : NaN);
    // A triangle's (or curve's) resultant put at the wrong spot.
    for (const p of [...tris, ...curves]) {
      const wrong = wrongCentroid(p);
      if (p.kind === "tri") {
        add(withMoment(v.M + p.F * (wrong - p.x)), "The triangle's resultant acts ⅓ of the base from its TALL end (⅔ from the pointed end) — that's where the load is heaviest.");
        add(withMoment(v.M + p.F * (p.from + p.L / 2 - p.x)), "A triangular load's resultant isn't at the middle: the load is heavier at one end, so its resultant sits closer to that end — ⅓ of the base from the tall end.");
      } else {
        add(withMoment(v.M + p.F * (wrong - p.x)), "A curved load's resultant isn't at the middle of its span. Find its centroid: x̄ = ∫x w dx / ∫w dx.");
        const triX = p.peak === "left" ? p.from + p.L / 3 : p.to - p.L / 3;
        add(withMoment(v.M + p.F * (triX - p.x)), "That's a triangle's centroid (⅔ of the way to the tall end). This curve rises more steeply, so integrate: x̄ = ∫x w dx / ∫w dx.");
      }
    }
    // Measured from the wrong end of the beam.
    const pts = (setup.body && setup.body.points) || (setup.loads || []).map((l) => [l.to, 0]);
    if (pts.length) {
      const end = Math.max(...pts.map((q) => q[0]));
      add(end - O - v.pos, "That's measured from the other end of the beam. Measure x̄ from O.");
    }
    if (parts.length + (setup.forces || []).length > 1) {
      // Plain average of where the pieces act (ignores how big each one is).
      const xs = [...parts.map((p) => p.x), ...(setup.forces || []).map((f) => f.at[0])];
      add(xs.reduce((s, x) => s + x, 0) / xs.length - O, "That's the plain average of the positions. Bigger pieces pull the resultant toward them: x̄ = ΣF x̃ / F_R.");
      for (const p of parts) add((v.M - p.F * (p.x - O)) / v.R, `Did you leave ${pretty(p.symbol)} out of ΣF x̃? Every piece's moment counts.`);
    }
    return list;
  }
  return list;
}

const pretty = (symbol) => String(symbol).replace(/[{}]/g, "").replace(/_/g, "");

// Lines under the equations.
export function distributedSummary(setup, result, { mode = "symbolic", reveal = true } = {}) {
  const v = result.values, parts = result.parts;
  const O = (setup.about && setup.about.label) || "O";
  const lines = [];
  const one = parts.length === 1 && !(setup.forces || []).length ? parts[0] : null;
  if (mode === "symbolic") {
    if (!one) lines.push("\\text{Every load pushes down, so down is taken as positive.}");
    lines.push(`\\bar{x}\\text{: where the single resultant acts, measured from } ${O}`);
  }
  if (!reveal || v.pos == null) return lines;
  if (one && one.kind !== "curve") {
    // A single rectangle or triangle: x̄ is simply its centroid.
    const where = one.kind === "rect" ? "\\tfrac{1}{2}L \\text{ (the middle)}" : "\\tfrac{1}{3}L \\text{ from the tall end}";
    lines.push(`\\bar{x}\\text{: the centroid, } ${where} \\;\\Rightarrow\\; \\bar{x} = ${fixedTex(v.pos, "m", 2)}`);
  } else {
    lines.push(`\\bar{x} = \\dfrac{F_R\\,\\bar{x}}{F_R} = \\dfrac{${sigFig(v.M, 5)}}{${sigFig(v.R, 5)}} = ${fixedTex(v.pos, "m", 2)}`);
  }
  return lines;
}

// Their numbers as a faint red shadow: a dashed resultant at their x̄
// (their F_R's size if they gave one).
export function distributedShadow(setup, res, guesses, { size, y, reach, O }) {
  const g = (k) => (Number.isFinite(guesses[k]) ? guesses[k] : null);
  const v = res.values;
  const out = [];
  const x = g("pos") != null ? O[0] + g("pos") : v.pos != null ? O[0] + v.pos : null;
  if (x == null || (g("pos") == null && g("R") == null)) return out;
  // Their F_R drawn longer or shorter than the true one would be (capped to stay in the picture).
  const ratio = g("R") != null && v.R > 0 ? Math.max(0.4, Math.min(1.25, g("R") / v.R)) : 1;
  const len = (reach + 0.1 * size) * ratio;
  const bits = [];
  if (g("R") != null) bits.push(`F_R = ${format(g("R"), "N")}`);
  if (g("pos") != null) bits.push(`x̄ = ${g("pos").toFixed(2)} m`);
  out.push({ type: "arrow", id: "shadow-R", from: [x, y + len], to: [x, y], role: "shadow", label: `your ${bits.join(", ")}` });
  return out;
}
