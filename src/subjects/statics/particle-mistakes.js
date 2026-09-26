// particle-mistakes.js — predicting the wrong answers students typically get.
//
// Instead of just saying "incorrect", the game re-solves the problem with a
// common mistake built in (sin/cos swapped, calculator in radians, mass used
// instead of weight, a force left out, a sign flipped …). If the student's
// number matches one of those, we can tell them exactly what went wrong.

import { clone } from "../../core/paths.js";
import { solveParticle, magnitudeOf, G } from "./particle.js";
import { swapTrig, reverse } from "./directions.js";

const pretty = (symbol) => symbol.replace(/[{}]/g, "").replace(/_/g, "");

// Each builder returns a changed copy of the setup (or null if it doesn't apply)
// and the explanation to show if the student's answer matches it.
function variants(setup) {
  const out = [];
  const angled = setup.forces.filter((f) => f.direction && typeof f.direction === "object");

  if (angled.length) {
    const s = clone(setup);
    s.forces.forEach((f) => { if (f.direction && typeof f.direction === "object") f.direction = swapTrig(f.direction); });
    out.push({ setup: s, message: "It looks like sin and cos are swapped. Use cos for the component along the axis the angle is measured FROM, and sin for the other one." });
  }
  if (angled.length > 1) {
    for (const f of angled) {
      const s = clone(setup);
      const g = s.forces.find((x) => x.id === f.id);
      g.direction = swapTrig(g.direction);
      out.push({ setup: s, message: `Check ${pretty(f.symbol)}: its sin and cos look swapped. Which axis is its angle measured from?` });
    }
  }
  if (angled.some((f) => f.direction.angle != null)) {
    out.push({ setup, radians: true, message: "Is your calculator in radian mode? The angles here are in degrees." });
  }
  for (const f of setup.forces) {
    if (f.kind === "weight" && f.mass != null) {
      const s = clone(setup);
      const w = s.forces.find((x) => x.id === f.id);
      w.magnitude = w.mass; // student used kg as if it were N
      delete w.mass;
      delete w.kind;
      w.direction = "down";
      out.push({ setup: s, message: `Did you use the mass (${f.mass} kg) as the force? The weight is W = mg = ${f.mass}(${G}) N.` });
      const s2 = clone(setup);
      const w2 = s2.forces.find((x) => x.id === f.id);
      w2.magnitude = w2.mass * 9.8; // rounded g
      delete w2.mass;
      delete w2.kind;
      w2.direction = "down";
      out.push({ setup: s2, message: `Close — but use g = ${G} m/s², not 9.8. The small difference matters at ±0.1 N.` });
    }
  }
  for (const f of setup.forces) {
    if (magnitudeOf(f) == null) continue; // leaving out an unknown isn't a meaningful slip
    const s = clone(setup);
    s.forces = s.forces.filter((x) => x.id !== f.id);
    out.push({ setup: s, message: `It looks like ${pretty(f.symbol)} was left out. Every force on the point belongs in both ΣFx and ΣFy.` });
  }
  for (const f of angled) {
    if (f.direction.slope) continue;
    for (const axis of ["x", "y"]) {
      // Flip just one component's sign: mirror the direction across one axis.
      const s = clone(setup);
      const g = s.forces.find((x) => x.id === f.id);
      const d = g.direction;
      const flip = (a) => (a[1] === axis ? (a[0] === "-" ? "+" : "-") + a[1] : a);
      g.direction = { ...d, from: flip(d.from), toward: flip(d.toward) };
      out.push({ setup: s, message: `Check the sign of ${pretty(f.symbol)}'s ${axis}-component. Look at the arrow: does it point ${axis === "x" ? "left or right" : "up or down"}?` });
    }
  }
  for (const f of setup.forces.filter((x) => x.kind === "cable")) {
    const s = clone(setup);
    const g = s.forces.find((x) => x.id === f.id);
    g.direction = reverse(g.direction);
    out.push({ setup: s, message: `Check the direction of ${pretty(f.symbol)}. A cable always pulls: its arrow points away from the point, along the cable.` });
  }
  return out;
}

// Solve with degrees misread as radians (only affects the component factors).
function solveRadians(setup) {
  const s = clone(setup);
  const DEG = Math.PI / 180;
  // Re-express each angle so that "angle in degrees" gives what radians would.
  s.forces.forEach((f) => {
    if (f.direction && f.direction.angle != null) f.direction.angle = f.direction.angle / DEG;
  });
  return solveParticle(s);
}

// List of { value, message } for quantity `name` (e.g. "T_AB" or "R.x").
export function particleMistakes(setup, name) {
  const correct = solveParticle(setup).values[name];
  const list = [];
  for (const v of variants(setup)) {
    let value;
    try {
      value = (v.radians ? solveRadians(v.setup) : solveParticle(v.setup)).values[name];
    } catch {
      continue;
    }
    if (value == null || !Number.isFinite(value)) continue;
    if (correct != null && Math.abs(value - correct) < 1e-6 * Math.max(1, Math.abs(correct))) continue;
    list.push({ value, message: v.message });
    // Two slips at once (this one AND a flipped sign) are common too.
    if (Math.abs(value) > 1e-9) list.push({ value: -value, message: `${v.message} Also check the sign: which way does it point?` });
  }
  if (name === "R.angle" && correct != null) {
    list.push({ value: 90 - correct, message: "That's the angle from the y-axis. θ here is measured from the x-axis." });
  }
  if (correct != null && Math.abs(correct) > 1e-9) {
    list.push({ value: -correct, message: "Right size, wrong sign. Look at which way it points: left and down are negative." });
  }
  return list;
}
