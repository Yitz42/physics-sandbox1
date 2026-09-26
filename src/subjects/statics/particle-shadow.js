// particle-shadow.js — "what would your answer look like?"
//
// After a wrong answer, the picture shows faint dashed "shadow" arrows built
// from the numbers the student typed, next to the real arrows:
//   • typed components (F_x, F_y)  → the force those components make
//   • typed tensions (T_AB …)      → arrows of that size along each cable,
//     plus the unbalanced force they'd leave (ΣF ≠ 0) — so the student
//     can SEE that their numbers don't hold the ring still
//   • typed resultant (F_Rx, F_Ry, F_R, θ) → the resultant they'd get
//   • typed unit vector (u_x, u_y)  → F times their u: too long or too short
//     if their u doesn't have length 1
// Shadows use the same scale as the real arrows (k = picture metres per newton).

import { add, scale, mag, sum, DEG } from "../../core/vector.js";
import { format } from "../../core/units.js";
import { directionOf, magnitudeOf } from "./particle.js";

const MAX_LEN = 2.3; // very wrong answers are drawn capped (so they stay in view), still pointing their way

const MIN_LEN = 0.25; // tiny answers still get a visible arrow (the label gives the real size)

// An arrow drawn shorter than its true size says so in its label, so a
// capped arrow never looks like a smaller answer than the student typed.
// minX: arrows pointing left stop before this x (the divider beside the FBD).
function shadowArrow(at, v, k, label, id, minLen = MIN_LEN, minX = -Infinity) {
  const m = mag(v);
  if (m < 1e-9) return [];
  const room = v[0] < 0 ? (at[0] - minX) / (-v[0] / m) : Infinity; // length until it reaches minX
  const max = Math.max(minLen, Math.min(MAX_LEN, room));
  const len = Math.max(minLen, Math.min(max, m * k));
  const note = m * k > max ? " (drawn shorter)" : "";
  return [{ type: "arrow", id, from: at, to: add(at, scale(v, len / m)), role: "shadow", label: label + note }];
}

// guesses: { quantityName: number } typed by the student
export function shadowShapes(setup, result, at, guesses, k, minX = -Infinity) {
  const vals = result ? result.values : {};
  const g = (key) => (Number.isFinite(guesses[key]) ? guesses[key] : null);
  const shapes = [];
  const vectors = []; // every force, using the student's numbers where they gave one
  let complete = true;

  for (const f of setup.forces) {
    // (Forces sharing one unknown — both sides of a cable over a pulley — use its name.)
    const gx = g(`${f.id}.x`), gy = g(`${f.id}.y`), gm = g(f.id) ?? (f.shared ? g(f.shared) : null);
    const gux = g(`${f.id}.ux`), guy = g(`${f.id}.uy`);
    if ((gux != null || guy != null) && magnitudeOf(f) != null) {
      // Their unit vector, scaled by the force's size.
      const u = [gux ?? vals[`${f.id}.ux`], guy ?? vals[`${f.id}.uy`]];
      const v = scale(u, magnitudeOf(f));
      shapes.push(...shadowArrow(at, v, k, `your ${f.symbol}·u (|u| = ${+mag(u).toFixed(2)})`, `shadow-${f.id}`, MIN_LEN, minX));
      vectors.push(v);
    } else if (gx != null || gy != null) {
      // Their components → the force they describe, plus its dashed components.
      const v = [gx ?? vals[`${f.id}.x`], gy ?? vals[`${f.id}.y`]];
      const main = shadowArrow(at, v, k, `your ${f.symbol} = ${format(mag(v), "N")}`, `shadow-${f.id}`, MIN_LEN, minX);
      shapes.push(...main);
      // Its dashed components end exactly at the shadow arrow's tip.
      if (main.length) {
        const tip = main[0].to;
        const corner = [tip[0], at[1]];
        if (Math.abs(tip[0] - at[0]) > 1e-6) shapes.push({ ...main[0], id: `shadow-${f.id}-x`, to: corner, label: "" });
        if (Math.abs(tip[1] - at[1]) > 1e-6) shapes.push({ ...main[0], id: `shadow-${f.id}-y`, from: corner, to: tip, label: "" });
      }
      vectors.push(v);
    } else if (gm != null && magnitudeOf(f) == null) {
      // Their size for an unknown force, along its known direction.
      const v = scale(directionOf(f), gm);
      shapes.push(...shadowArrow(at, v, k, `your ${f.symbol} = ${format(gm, "N")}`, `shadow-${f.id}`, MIN_LEN, minX));
      vectors.push(v);
    } else {
      const m = magnitudeOf(f);
      if (m == null) complete = false;
      else vectors.push(scale(directionOf(f), m));
    }
  }

  // Equilibrium: with the student's numbers, do the forces cancel?
  if (setup.analysis === "equilibrium" && complete && vectors.length) {
    const net = sum(vectors);
    const biggest = Math.max(...vectors.map(mag));
    if (mag(net) > 0.005 * biggest) {
      // It starts at the point like every other force on the FBD. If it lies
      // along another arrow, that's fine: shadows are faint, so both show.
      shapes.push(...shadowArrow(at, net, k, `ΣF = ${format(mag(net), "N")} ≠ 0`, "shadow-net", MIN_LEN, minX));
    }
  }

  // Resultant: their F_Rx / F_Ry, or their size F_R and angle θ.
  if (g("R.x") != null || g("R.y") != null) {
    const v = [g("R.x") ?? vals["R.x"], g("R.y") ?? vals["R.y"]];
    shapes.push(...shadowArrow(at, v, k, `your F_R = ${format(mag(v), "N")}`, "shadow-R", MIN_LEN, minX));
  } else if (g("R") != null || g("R.angle") != null) {
    const size = g("R") ?? vals.R;
    const angle = (g("R.angle") ?? vals["R.angle"]) * DEG; // from the x-axis, same quarter as the real one
    const v = [Math.sign(vals["R.x"] || 1) * size * Math.cos(angle), Math.sign(vals["R.y"] || 1) * size * Math.sin(angle)];
    shapes.push(...shadowArrow(at, v, k, "your F_R", "shadow-R", MIN_LEN, minX));
  }
  return shapes;
}
