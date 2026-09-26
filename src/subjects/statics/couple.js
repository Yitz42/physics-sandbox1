// couple.js — couples (Unit 4).
//
// A COUPLE is two forces that are equal in size, opposite in direction, and
// act along parallel lines a distance d apart. They add up to zero force, so
// they don't push the body anywhere — they only turn it. Its moment
//   M = F·d        (d = perpendicular distance between the two lines of action)
// is the same about EVERY point. That is the key idea of this unit.
//
// setup = {
//   about:   { at: [x, y], label: "P" }   optional reference point. When given,
//            the moment of every force about it is shown too (M_P = ΣFd), so
//            students can see M_P = M wherever P is. about.hidden: no picture/equation.
//   forces:  plain forces, as in moment.js: { id, symbol, magnitude, direction, at }
//   couples: [{ id, symbol, ... }] each couple is EITHER
//     inline:     { magnitude, direction, at, opposite, pointLabels: ["B", "A"] }
//                 → a force F at `at` in `direction`, and an equal, opposite
//                   force at `opposite` (always a true couple, even with sliders)
//     or a pair:  { forces: ["F_A", "F_B"] } → two of the plain forces above
//     dSymbol: "d'" name of its separation (default d, d_1 …)
//     push: [true, false]  draw force a (or b) as a push: arrowhead at the point
//     dimShift: where d is drawn: this far from force a's point along the lines
//               of action, + meaning up (or right, for horizontal lines)
//     equivalentTo: "C1" with magnitude: null → an unknown REPLACEMENT couple:
//                 its forces are found so that it has the same moment as C1.
//                 (It replaces C1, so it is not added to the totals.)
//   moments: [{ id, symbol, magnitude, sense: +1 | -1, at }]  couple moments
//            given directly (a curved arrow), counterclockwise +1
//   netForce: true   also show F_R = ΣF (x and y), which is zero for couples
//   Drawing only: plates [{ from, to }], body, texts, dims, momentAt (where the
//   total moment's curved arrow goes), showSeparation / hideSeparation (d between
//   each couple's lines), target: { value, at } (a goal moment, build stages)
// }
//
// result.values:
//   "M"            total moment (about P if given, else about the origin — for
//                  couples it's the same number anywhere)
//   "<coupleId>"   the size F of the couple's forces;  "M_<coupleId>" its moment
//   "d_<coupleId>" separation d;  "r_<coupleId>" straight distance between its two points
//   "<forceId>", "M_<forceId>", "d_<forceId>"   each force's size, moment and arm about P
//   "R.x", "R.y", "R"   the net force

import { add, scale, mag } from "../../core/vector.js";
import { sigFig } from "../../core/units.js";
import { magnitudeOf, directionOf, buildEquations } from "./particle.js";
import { armOf } from "./moment.js";
import { named, refPoint, showsAbout, allForces, coupleGeometry, dSymbolOf, armSymbolOf } from "./couple-geometry.js";

const numM = (v) => `(${sigFig(Math.abs(v), 3)}\\,\\text{m})`; // a distance, with its unit

// Equations as data (see core/equations.js).
export function coupleEquations(setup, values) {
  const eqs = [];
  const forces = allForces(setup).filter((f) => !f.replacement);
  const moments = setup.moments || [];

  // Moment about P, force by force: M_P = ΣFd (plus any couple moments given directly).
  if (showsAbout(setup)) {
    const P = setup.about.label || "P";
    const eq = { id: "Mp", lhs: `M_{${P}} = \\Sigma F d`, form: "define", terms: [], result: { value: values.M, unit: "N·m" } };
    for (const f of forces) {
      const a = armOf(setup, f, f.at);
      if (a.d < 1e-9) continue; // its line of action passes through P: no moment
      const factor = { tex: armSymbolOf(f), numTex: numM(a.d), value: a.d };
      if (Math.abs(a.rLen - a.d) > 1e-6) {
        factor.alt = { tex: named("r", armSymbolOf(f)), numTex: numM(a.rLen), value: a.rLen };
        factor.swapLabel = "Use the perpendicular distance d";
        factor.swapReason = `uses the distance to ${P} instead of the perpendicular distance to the line of action`;
      }
      eq.terms.push({ id: f.id, sign: Math.sign(a.perNewton), symbol: f.symbol, value: values[f.id], unit: "N", factor });
    }
    for (const m of moments) eq.terms.push({ id: m.id, sign: m.sense, symbol: m.symbol, value: m.magnitude, unit: "N·m" });
    eqs.push(eq);
  }

  // Couple by couple: M = Σ(±F d), d = distance BETWEEN the two lines of action.
  const couples = (setup.couples || []).filter((c) => !c.equivalentTo);
  if (couples.length + moments.length) {
    const single = couples.length === 1 && moments.length === 0;
    const eq = { id: "Mc", lhs: single ? "M" : "M_R = \\Sigma M", form: "define", terms: [], result: { value: 0, unit: "N·m" } };
    for (const c of couples) {
      const g = coupleGeometry(setup, c);
      const factor = { tex: dSymbolOf(c), numTex: numM(g.d), value: g.d };
      if (Math.abs(g.rLen - g.d) > 1e-6) {
        factor.alt = { tex: c.rSymbol || named("r", c.symbol), numTex: numM(g.rLen), value: g.rLen };
        factor.swapLabel = "Use the perpendicular distance between the lines";
        factor.swapReason = "uses the distance between the two points instead of the perpendicular distance between the lines of action";
      }
      eq.terms.push({ id: c.id, sign: Math.sign(g.perNewton) || 1, symbol: c.symbol, value: values[c.id], unit: "N", factor });
    }
    for (const m of moments) eq.terms.push({ id: m.id, sign: m.sense, symbol: m.symbol, value: m.magnitude, unit: "N·m" });
    eq.result.value = eq.terms.reduce((s, t) => s + t.sign * t.value * (t.factor ? t.factor.value : 1), 0);
    eqs.push(eq);
  }

  // Net force F_R = ΣF: zero for a true couple (reuses the particle equations).
  if (setup.netForce) {
    for (const eq of buildEquations({ analysis: "resultant", forces })) {
      eq.result.value = values[eq.valueKey];
      eqs.push(eq);
    }
  }
  return eqs;
}

// Solve. Returns { status, message, values, equations, unknowns }.
export function solveCouple(setup) {
  const values = {};
  const couples = setup.couples || [];
  let message;

  // Sizes of the couples' forces. A replacement couple gets F' = |M| / d'.
  for (const c of couples) {
    const g = coupleGeometry(setup, c);
    values[`d_${c.id}`] = g.d;
    values[`r_${c.id}`] = g.rLen;
    if (!c.equivalentTo) values[c.id] = magnitudeOf(g.a);
  }
  for (const c of couples) {
    if (!c.equivalentTo) continue;
    const target = couples.find((x) => x.id === c.equivalentTo);
    const Mt = coupleGeometry(setup, target).perNewton * values[target.id];
    const g = coupleGeometry(setup, c);
    values[c.id] = Math.abs(Mt) / g.d;
    if (Math.sign(g.perNewton) !== Math.sign(Mt)) message = `Couple ${c.id} turns the other way from ${target.id}, so no force size makes it equivalent.`;
  }
  for (const c of couples) values[`M_${c.id}`] = coupleGeometry(setup, c).perNewton * values[c.id];

  // Every force's moment about the reference point, and the net force.
  const ref = { about: { at: refPoint(setup) } };
  let M = 0;
  let R = [0, 0];
  for (const f of allForces(setup)) {
    const F = magnitudeOf(f) ?? values[f.couple];
    const a = armOf(ref, f, f.at);
    values[f.id] = F;
    values[`M_${f.id}`] = F * a.perNewton;
    values[`d_${f.id}`] = a.d;
    if (f.replacement) continue; // a replacement acts INSTEAD of its original, not as well
    M += F * a.perNewton;
    R = add(R, scale(directionOf(f), F));
  }
  for (const m of setup.moments || []) {
    values[m.id] = m.magnitude;
    values[`M_${m.id}`] = m.sense * m.magnitude;
    M += m.sense * m.magnitude;
  }
  values.M = M;
  values["R.x"] = R[0];
  values["R.y"] = R[1];
  values.R = mag(R);

  const equations = coupleEquations(setup, values);
  return { status: "resultant", message, values, equations, unknowns: [], net: R };
}

// Names and units for result.values (answer boxes and labels).
export function coupleQuantities(setup) {
  const parts = (setup.couples || []).filter((c) => !c.equivalentTo).length + (setup.moments || []).length;
  const q = {
    M: { label: showsAbout(setup) ? `M_{${setup.about.label || "P"}}` : parts > 1 ? "M_R" : "M", unit: "N·m" },
    "R.x": { label: "F_{Rx}", unit: "N" },
    "R.y": { label: "F_{Ry}", unit: "N" },
    R: { label: "F_R", unit: "N" },
  };
  for (const c of setup.couples || []) {
    q[c.id] = { label: c.symbol, unit: "N" };
    q[`M_${c.id}`] = { label: named("M", c.symbol), unit: "N·m" };
    q[`d_${c.id}`] = { label: dSymbolOf(c), unit: "m" };
  }
  for (const f of allForces(setup)) {
    q[f.id] = { label: f.symbol, unit: "N" };
    q[`M_${f.id}`] = { label: named("M", f.symbol), unit: "N·m" };
    q[`d_${f.id}`] = { label: armSymbolOf(f), unit: "m" };
  }
  for (const m of setup.moments || []) q[m.id] = { label: m.symbol, unit: "N·m" };
  return q;
}
