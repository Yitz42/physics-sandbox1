// equivalent-tools.js — extras for equivalent force systems (Unit 5):
//   common-mistake predictions and the lines shown under the equations.

import { add, scale, sub, dot, mag } from "../../core/vector.js";
import { fixedTex, sigFig } from "../../core/units.js";
import { magnitudeOf, directionOf } from "./particle.js";
import { allForces } from "./couple-geometry.js";
import { coupleMistakes } from "./couple-tools.js";
import { solveEquivalent, lineDir } from "./equivalent.js";

const pretty = (symbol) => String(symbol).replace(/[{}]/g, "").replace(/_/g, "");

// [{ value, message }] for quantity `name` ("R", "R.x", "R.y", "M", "pos" …).
export function equivalentMistakes(setup, name) {
  const base = solveEquivalent(setup);
  const v = base.values;
  const correct = v[name];
  const list = [];
  const add1 = (value, message) => {
    if (!Number.isFinite(value) || Math.abs(value - correct) < 1e-6 * Math.max(1, Math.abs(correct))) return;
    list.push({ value, message });
  };
  const forces = allForces(setup);
  const vec = (f) => scale(directionOf(f), magnitudeOf(f));

  if (name === "pos") {
    const O = setup.about.at, u = lineDir(setup);
    const across = (w) => u[0] * w[1] - u[1] * w[0]; // u × w
    const R = [v["R.x"], v["R.y"]];
    // Plain average of where the forces act: ignores that bigger forces pull harder.
    const avg = forces.reduce((s, f) => s + dot(sub(f.at, O), u), 0) / forces.length;
    add1(avg, "That's the average of the positions. Bigger forces pull the resultant toward them: use x̄ = (total moment about O) ÷ (resultant force), counting every force's moment.");
    add1(-correct, "Right distance, wrong side. Check the signs: the single force must turn the body the same way as all the loads together — a downward force to the right of O turns it clockwise.");
    // A force left out of the moment sum (but still in F_R).
    for (const f of forces) add1((v.M - v[`M_${f.id}`]) / across(R), `Did you leave ${pretty(f.symbol)} out of the moment sum? Every force's moment about O counts.`);
    for (const m of setup.moments || []) add1((v.M - m.sense * m.magnitude) / across(R), `Did you leave out the couple moment ${pretty(m.symbol)}? It changes the total moment about O, so it moves the resultant.`);
    // Dividing by the sum of the sizes when forces point different ways.
    const sizes = forces.reduce((s, f) => s + magnitudeOf(f), 0);
    add1(Math.abs(v.M) / sizes * Math.sign(correct || 1), "The resultant is the vector sum of the forces, not the sum of their sizes: forces pointing opposite ways partly cancel.");
    return list;
  }
  if (name === "R") {
    const sizes = forces.reduce((s, f) => s + magnitudeOf(f), 0);
    add1(sizes, "You added the sizes of the forces. Forces add as vectors: add their x-components and y-components, then take √(x² + y²).");
    for (const f of forces) add1(mag(sub([v["R.x"], v["R.y"]], vec(f))), `Did you leave out ${pretty(f.symbol)}? Every force on the body is part of the resultant.`);
    return list;
  }
  if (name === "R.x" || name === "R.y") {
    const i = name === "R.x" ? 0 : 1;
    for (const f of forces) {
      const c = vec(f)[i];
      if (Math.abs(c) < 1e-9) continue;
      add1(correct - c, `Did you leave out ${pretty(f.symbol)}'s ${name === "R.x" ? "x" : "y"}-component?`);
      add1(correct - 2 * c, `Check the sign of ${pretty(f.symbol)}'s ${name === "R.x" ? "x" : "y"}-component: which way does it point?`);
    }
    if (Math.abs(correct) > 1e-9) list.push({ value: -correct, message: "Right size, wrong sign: + is right (x) and up (y)." });
    return list;
  }
  if (name === "M") {
    // Couple-moment slips and sin/cos swaps come from the couple tools; add force-by-force ones.
    list.push(...coupleMistakes(setup, "M"));
    for (const f of forces) {
      const Mf = v[`M_${f.id}`];
      if (!Mf) continue;
      add1(correct - Mf, `Did you leave out the moment of ${pretty(f.symbol)}? Every force with a moment arm about O counts.`);
      add1(correct - 2 * Mf, `Check which way ${pretty(f.symbol)} turns the body about O: clockwise is negative, counterclockwise positive.`);
      const r = mag(sub(f.at, setup.about.at)), d = v[`d_${f.id}`];
      if (d > 1e-9 && Math.abs(r - d) > 1e-6) add1(correct + Mf * (r / d - 1), `For ${pretty(f.symbol)}, use the perpendicular distance from O to its line of action, not the distance to the point where it acts.`);
    }
    return list;
  }
  return list;
}

// Lines under the equations.
export function equivalentSummary(setup, result, { mode = "symbolic", reveal = true } = {}) {
  const v = result.values;
  const O = (setup.about && setup.about.label) || "O";
  const lines = [];
  if (mode === "symbolic") lines.push(`(M_R)_{${O}}: \\text{ every force's moment about } ${O} \\text{, plus every couple moment}`);
  if (!reveal) return lines;
  lines.push(`F_R = \\sqrt{F_{Rx}^2 + F_{Ry}^2} = ${fixedTex(v.R, "N")}, \\quad \\theta = \\tan^{-1}\\left|\\tfrac{F_{Ry}}{F_{Rx}}\\right| = ${fixedTex(v["R.angle"], "deg")}`);
  if (v.pos != null && setup.line !== false) {
    const u = lineDir(setup);
    const across = u[0] * v["R.y"] - u[1] * v["R.x"];
    const sym = setup.posSymbol || "\\bar{x}";
    const comp = Math.abs(u[0]) === 1 && u[1] === 0 ? "F_{Ry}" : "F_{R\\perp}";
    lines.push(`${sym} = \\dfrac{(M_R)_{${O}}}{${comp}} = \\dfrac{${sigFig(v.M, 4)}}{${sigFig(across, 4)}} = ${fixedTex(v.pos, "m", 2)}`);
  }
  return lines;
}

// Their numbers as a faint shadow: their x̄ (a dashed resultant there), their
// (M_R)_O (a dashed curved arrow at O), their F_Rx/F_Ry (a dashed arrow at O).
export function equivalentShadow(setup, result, guesses, { k, size }) {
  const g = (key) => (Number.isFinite(guesses[key]) ? guesses[key] : null);
  const v = result.values;
  const O = setup.about.at;
  const shapes = [];
  const R = [v["R.x"], v["R.y"]];
  // Their F_R if they gave one, else the true one — capped so it stays in the picture.
  const longest = Math.max(...allForces(setup).map((f) => magnitudeOf(f) * k));
  const len = Math.min(1.5 * longest, Math.max(0.1 * size, Math.abs(g("R") ?? v.R) * k));
  if (g("pos") != null && v.R > 1e-9) {
    const P = add(O, scale(lineDir(setup), g("pos")));
    const u = scale(R, 1 / v.R);
    shapes.push({ type: "arrow", id: "shadow-R", from: add(P, scale(u, -len)), to: P, role: "shadow", label: `your x̄ = ${g("pos").toFixed(2)} m` });
  }
  if (g("M") != null && Math.abs(g("M")) > 1e-9) {
    shapes.push({ type: "moment", center: O, sense: Math.sign(g("M")), rPx: 30, role: "shadow", label: `your (M_R)_O = ${g("M").toFixed(1)} N·m` });
  }
  if (g("R.x") != null || g("R.y") != null) {
    const w = [g("R.x") ?? v["R.x"], g("R.y") ?? v["R.y"]];
    const m = mag(w);
    if (m > 1e-9) shapes.push({ type: "arrow", id: "shadow-FR", from: O, to: add(O, scale(w, Math.max(0.1 * size, m * k) / m)), role: "shadow", label: `your F_R = ${m.toFixed(1)} N` });
  }
  return shapes;
}
