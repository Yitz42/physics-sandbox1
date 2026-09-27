// rigid-body.js — a rigid body held by supports (Unit 7 on).
//
// Isolate the body: replace every support by its reactions (supports.js),
// keep every load, and add the body's weight. In a plane the body can move
// three ways — slide in x, slide in y, turn — so there are three equations:
//   ΣF_x = 0,   ΣF_y = 0,   ΣM_P = 0   (about a point P, often a support)
// Classification (CLAUDE.md):
//   fewer than 3 unknown reactions, or improper supports (all parallel, or all
//   through one point), or a roller/cable asked to pull/push → "unstable"
//   more than 3 → "indeterminate" (equilibrium alone can't find them)
//   exactly 3, properly placed → "determinate": solve them.
//
// setup = {
//   body:     { points: [[x, y], …], mass?: kg, cg?: [x, y] }  (weight W at cg, default the middle)
//   supports: [...]  (see supports.js)
//   forces:   applied loads [{ id, symbol, magnitude, direction, at, push? }]
//   loads:    distributed loads (see distributed-loads.js) — each piece becomes its resultant
//   moments:  applied couple moments [{ id, symbol, magnitude, sense: ±1, at }]
//   about:    "A" (a support id) or { at, label } — the moment point (default: the
//             support with the most reactions). Any point works, on the body or off it.
//   analysis: "equilibrium" (default) or "count" (just count the unknowns; status "resultant")
//   fbdEdits: a deliberately wrong FBD (debug stages, see supports.js)
//   Drawing only: grounds, dims, texts, showReactions ("always" | "reveal"), weightLabel,
//             showMomentPoint (mark the moment point), showMomentUnknowns (a line under
//             the equations: which unknowns ΣM contains — Unit 4.2's "smart point")
// }
//
// result.values: every reaction by id (signed, in its assumed direction: +x, +y,
// counterclockwise, or push/pull for rollers and cables), "n_<supportId>" (its
// number of unknowns), "n" (total unknowns), "nM" (how many unknowns the moment
// equation contains: reactions whose line of action misses the moment point).

import { add, sub, scale, mag, unit, cross2 } from "../../core/vector.js";
import { sigFig } from "../../core/units.js";
import { solveEquations } from "../../core/equations.js";
import { magnitudeOf } from "./particle.js";
import { componentFactors } from "./directions.js";
import { armOf } from "./moment.js";
import { allReactions, countBySupport, SUPPORT_NAMES } from "./supports.js";
import { namedParts } from "./distributed.js";

const numM = (v) => `(${sigFig(Math.abs(v), 3)}\\,\\text{m})`;

// The body's weight W (if it has a mass), acting at its centre of gravity.
export function weightOf(setup) {
  const b = setup.body || {};
  if (!b.mass || (setup.fbdEdits && (setup.fbdEdits.remove || []).includes("W"))) return null;
  const pts = b.points || [[0, 0]];
  const cg = b.cg || [(pts[0][0] + pts[pts.length - 1][0]) / 2, (pts[0][1] + pts[pts.length - 1][1]) / 2];
  return { id: "W", symbol: "W", kind: "weight", mass: b.mass, at: cg, fbd: true };
}

// Every KNOWN force on the body: applied loads, each piece of a distributed load
// (its area, at its centroid), and the weight.
export function knownForces(setup) {
  const out = [...(setup.forces || [])];
  for (const p of namedParts(setup, { alone: false })) {
    out.push({ id: p.id, symbol: p.symbol, magnitude: p.F, direction: "down", at: [p.x, p.y], fromLoad: true });
  }
  const W = weightOf(setup);
  if (W) out.push(W);
  return out;
}

// The moment point P: a support's position, or a given point.
export function momentPoint(setup) {
  const sup = setup.supports || [];
  if (setup.about && typeof setup.about === "object") return { at: setup.about.at, label: setup.about.label || "P" };
  const counts = countBySupport(setup);
  const s = typeof setup.about === "string" ? sup.find((q) => q.id === setup.about) : sup.slice().sort((a, b) => counts[b.id] - counts[a.id])[0];
  return s ? { at: s.at, label: s.id } : { at: [0, 0], label: "O" };
}

// A symbol's moment-arm name: d_B for a reaction at B, d_P for load P, d_1 for F_1.
function armSymbol(f) {
  if (f.support) return `d_{${f.support}}`;
  const m = String(f.symbol).match(/_\{?([^}]*)\}?$/);
  return m ? `d_{${m[1]}}` : `d_{${f.symbol}}`;
}

// ---- Equations as data (see core/equations.js) -----------------------------

export function rigidBodyEquations(setup) {
  const P = momentPoint(setup);
  const eqs = [
    { id: "sumFx", lhs: "\\Sigma F_x", form: "zero", terms: [] },
    { id: "sumFy", lhs: "\\Sigma F_y", form: "zero", terms: [] },
    { id: "sumM", lhs: `\\Sigma M_{${P.label}}`, form: "zero", terms: [] },
  ];
  const [fx, fy, mm] = eqs;
  // One force's terms. value null = an unknown reaction.
  const addForce = (f, direction, value, unit = "N") => {
    const c = f.kind === "weight" ? { x: null, y: { sign: -1, factor: null } } : componentFactors(direction);
    if (c.x) fx.terms.push({ id: f.id, sign: c.x.sign, symbol: f.symbol, value, unit, factor: c.x.factor });
    if (c.y) fy.terms.push({ id: f.id, sign: c.y.sign, symbol: f.symbol, value, unit, factor: c.y.factor });
    const a = armOf({ about: { at: P.at } }, { kind: f.kind, direction }, f.at);
    if (a.d < 1e-9) return; // its line of action passes through P: no moment
    const factor = { tex: armSymbol(f), numTex: numM(a.d), value: a.d };
    if (Math.abs(a.rLen - a.d) > 1e-6) {
      factor.alt = { tex: armSymbol(f).replace(/^d/, "r"), numTex: numM(a.rLen), value: a.rLen };
      factor.swapLabel = "Use the perpendicular distance d";
      factor.swapReason = `uses the distance to ${P.label} instead of the perpendicular distance to the line of action`;
      factor.swapKind = "momentArm"; // the kind of mistake (core/diagnosis.js)
    }
    mm.terms.push({ id: f.id, sign: Math.sign(a.perNewton), symbol: f.symbol, value, unit, factor });
  };
  for (const f of knownForces(setup)) addForce(f, f.direction, magnitudeOf(f));
  for (const m of setup.moments || []) mm.terms.push({ id: m.id, sign: m.sense, symbol: m.symbol, value: m.magnitude, unit: "N·m" });
  for (const r of allReactions(setup)) {
    if (r.moment) mm.terms.push({ id: r.id, sign: r.sense, symbol: r.symbol, value: null });
    else addForce(r, r.direction, null);
  }
  // Two arms with the same name (both of a pin's components, about a point off
  // both their lines) get the component's own name: d_{A_x} and d_{A_y}.
  const names = mm.terms.filter((t) => t.factor).map((t) => t.factor.tex);
  for (const t of mm.terms) {
    if (!t.factor || names.filter((n) => n === t.factor.tex).length < 2) continue;
    const own = `d_{${t.symbol}}`;
    t.factor = { ...t.factor, tex: own, ...(t.factor.alt ? { alt: { ...t.factor.alt, tex: own.replace(/^d/, "r") } } : {}) };
  }
  return eqs;
}

// ---- Solve and classify --------------------------------------------------------

export function solveRigidBody(setup) {
  const equations = rigidBodyEquations(setup);
  const reactions = allReactions(setup);
  const ids = reactions.map((r) => r.id);
  const values = { n: ids.length };
  const counts = countBySupport(setup);
  for (const [id, n] of Object.entries(counts)) values[`n_${id}`] = n;
  for (const f of knownForces(setup)) values[f.id] = magnitudeOf(f);
  // The unknowns in ΣM_P: a reaction through P has no moment about it, so a
  // smart choice of P leaves as few as possible (one, and ΣM gives it directly).
  const momentUnknowns = equations.find((e) => e.id === "sumM").terms.filter((t) => t.value == null).map((t) => t.id);
  values.nM = momentUnknowns.length;
  const names = ids.map((id) => `$${reactions.find((r) => r.id === id).symbol}$`);
  const list = names.length ? names.join(", ") : "none";

  let status, message;
  if (ids.length < 3) {
    status = "unstable";
    message = `Only ${ids.length} unknown reaction${ids.length === 1 ? "" : "s"} (${list}), but a body in a plane can move three ways: slide sideways, slide up and down, and turn. ` +
      "The supports can't stop all three, so the body moves.";
  } else if (ids.length > 3) {
    status = "indeterminate";
    message = `${ids.length} unknown reactions (${list}) but only 3 equations ($\\Sigma F_x = 0$, $\\Sigma F_y = 0$, $\\Sigma M = 0$). ` +
      "Equilibrium alone can't find them all: the structure is statically indeterminate.";
  } else {
    const sol = solveEquations(equations, ids);
    if (sol.status !== "unique") {
      status = "unstable";
      message = improperMessage(reactions);
    } else {
      status = "determinate";
      Object.assign(values, sol.values);
      message = liftOff(reactions, values);
      if (message) status = "unstable";
    }
  }
  if (setup.analysis === "count") {
    // Counting only: nothing is solved, but say what the count means.
    if (status === "determinate") message = `${ids.length} unknowns (${list}) and 3 equations: the reactions can all be found — the beam is statically determinate.`;
    status = "resultant";
  }
  return { status, message, values, equations, unknowns: ids, reactions, momentUnknowns };
}

// Three reactions that still can't hold the body: all parallel, or all through one point.
function improperMessage(reactions) {
  const forces = reactions.filter((r) => !r.moment);
  const parallel = forces.length === reactions.length && forces.every((r) => Math.abs(cross2(r.dir, forces[0].dir)) < 1e-9);
  if (parallel) return "The reactions are all parallel, so nothing stops the body sliding across them. It has 3 unknowns but is improperly supported: it moves.";
  return "The reactions' lines of action all pass through one point, so nothing stops the body turning about it. It has 3 unknowns but is improperly supported: it moves.";
}

// A roller or surface can only push, a cable can only pull.
function liftOff(reactions, values) {
  for (const r of reactions) {
    if (values[r.id] >= -1e-6) continue;
    if (r.kind === "push") return `$${r.symbol}$ would have to pull (${sigFig(values[r.id], 3)} N), but a ${SUPPORT_NAMES[r.supportType] || "roller"} can only push: the body lifts off it.`;
    if (r.kind === "pull") return `Cable ${r.support} would have to push (${sigFig(values[r.id], 3)} N), but a cable can only pull: it goes slack.`;
  }
  return null;
}

// Names and units for result.values (answer boxes and labels).
export function rigidBodyQuantities(setup) {
  const q = { n: { label: "\\text{unknowns}", unit: "" }, nM: { label: "\\text{unknowns in } \\Sigma M", unit: "" } };
  for (const s of setup.supports || []) q[`n_${s.id}`] = { label: `\\text{unknowns at } ${s.id}`, unit: "" };
  for (const r of allReactions(setup)) q[r.id] = { label: r.symbol, unit: r.moment ? "N·m" : "N" };
  for (const f of knownForces(setup)) q[f.id] = { label: f.symbol, unit: "N" };
  return q;
}

// Distance helper for pictures: the body's overall size.
export function bodySize(setup) {
  const pts = [...((setup.body && setup.body.points) || []), ...(setup.supports || []).map((s) => s.at)];
  let s = 0;
  for (const a of pts) for (const b of pts) s = Math.max(s, mag(sub(a, b)));
  return s || 1;
}

// The body's middle (the average of its outline points).
export function bodyCentre(setup) {
  const pts = (setup.body && setup.body.points) || (setup.supports || []).map((s) => s.at);
  return scale(pts.reduce((a, p) => add(a, p), [0, 0]), 1 / Math.max(1, pts.length));
}

// Which way is "outside the body" at a support: away from the body's middle
// and toward the support's side. A cable's reaction lies along the cable.
export function outwardAt(setup, r) {
  if (r.kind === "pull") return r.dir;
  const s = (setup.supports || []).find((q) => q.id === r.support);
  const n = (s && s.normal) || [0, 1];
  const away = sub(r.at, bodyCentre(setup));
  const v = add(scale(n, -1), mag(away) > 1e-9 ? scale(unit(away), 0.7) : [0, 0]);
  return mag(v) > 1e-9 ? unit(v) : scale(n, -1);
}
