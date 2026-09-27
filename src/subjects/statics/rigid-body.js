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
//   sums:     another set of three equations, e.g. [{ M: "A" }, { M: "B" }, { F: "y" }]
//             (Unit 4.3; see rigid-body-sets.js); points: { C: [x, y] } names extra points
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
// equation contains: reactions whose line of action misses the moment point),
// "deg" (degree of indeterminacy: unknowns − 3), and for each pin or fixed
// support "R_<id>" / "theta_<id>": the size of its force and its direction
// (degrees, counterclockwise from +x) — once solved.

import { add, sub, scale, mag, unit, cross2 } from "../../core/vector.js";
import { sigFig } from "../../core/units.js";
import { solveEquations } from "../../core/equations.js";
import { magnitudeOf } from "./particle.js";
import { componentFactors } from "./directions.js";
import { armOf } from "./moment.js";
import { allReactions, countBySupport, SUPPORT_NAMES } from "./supports.js";
import { namedParts } from "./distributed.js";
import { sumsOf, checkSet } from "./rigid-body-sets.js";

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
  // The three equations: ΣF_x, ΣF_y, ΣM_P — or the set a stage chose (setup.sums,
  // Unit 4.3: e.g. ΣM_A, ΣM_B, ΣF_y; see rigid-body-sets.js).
  const sums = sumsOf(setup, momentPoint(setup));
  const eqs = sums.map((q) => ({
    id: q.id, form: "zero", terms: [], sum: q,
    lhs: q.kind === "Fx" ? "\\Sigma F_x" : q.kind === "Fy" ? "\\Sigma F_y" : `\\Sigma M_{${q.P.label}}`,
  }));
  const fxs = eqs.filter((e) => e.sum.kind === "Fx"), fys = eqs.filter((e) => e.sum.kind === "Fy"), mms = eqs.filter((e) => e.sum.kind === "M");
  // One force's terms. value null = an unknown reaction.
  const addForce = (f, direction, value, unit = "N") => {
    const c = f.kind === "weight" ? { x: null, y: { sign: -1, factor: null } } : componentFactors(direction);
    if (c.x) for (const fx of fxs) fx.terms.push({ id: f.id, sign: c.x.sign, symbol: f.symbol, value, unit, factor: c.x.factor });
    if (c.y) for (const fy of fys) fy.terms.push({ id: f.id, sign: c.y.sign, symbol: f.symbol, value, unit, factor: c.y.factor });
    for (const mm of mms) {
      const P = mm.sum.P;
      const a = armOf({ about: { at: P.at } }, { kind: f.kind, direction }, f.at);
      if (a.d < 1e-9) continue; // its line of action passes through P: no moment
      const factor = { tex: armSymbol(f), numTex: numM(a.d), value: a.d };
      if (Math.abs(a.rLen - a.d) > 1e-6) {
        factor.alt = { tex: armSymbol(f).replace(/^d/, "r"), numTex: numM(a.rLen), value: a.rLen };
        factor.swapLabel = "Use the perpendicular distance d";
        factor.swapReason = `uses the distance to ${P.label} instead of the perpendicular distance to the line of action`;
        factor.swapKind = "momentArm"; // the kind of mistake (core/diagnosis.js)
      }
      mm.terms.push({ id: f.id, sign: Math.sign(a.perNewton), symbol: f.symbol, value, unit, factor });
    }
  };
  for (const f of knownForces(setup)) addForce(f, f.direction, magnitudeOf(f));
  for (const m of setup.moments || []) for (const mm of mms) mm.terms.push({ id: m.id, sign: m.sense, symbol: m.symbol, value: m.magnitude, unit: "N·m" });
  for (const r of allReactions(setup)) {
    if (r.moment) for (const mm of mms) mm.terms.push({ id: r.id, sign: r.sense, symbol: r.symbol, value: null });
    else addForce(r, r.direction, null);
  }
  // Two arms with the same name (both of a pin's components, about a point off
  // both their lines) get the component's own name: d_{A_x} and d_{A_y}.
  for (const mm of mms) {
    const names = mm.terms.filter((t) => t.factor).map((t) => t.factor.tex);
    for (const t of mm.terms) {
      if (!t.factor || names.filter((n) => n === t.factor.tex).length < 2) continue;
      const own = `d_{${t.symbol}}`;
      t.factor = { ...t.factor, tex: own, ...(t.factor.alt ? { alt: { ...t.factor.alt, tex: own.replace(/^d/, "r") } } : {}) };
    }
  }
  for (const e of eqs) delete e.sum; // (plain equation data from here on)
  return eqs;
}

// ---- Solve and classify --------------------------------------------------------

export function solveRigidBody(setup) {
  const equations = rigidBodyEquations(setup);
  const reactions = allReactions(setup);
  const ids = reactions.map((r) => r.id);
  const values = { n: ids.length, deg: ids.length - 3 };
  const counts = countBySupport(setup);
  for (const [id, n] of Object.entries(counts)) values[`n_${id}`] = n;
  for (const f of knownForces(setup)) values[f.id] = magnitudeOf(f);
  // The unknowns in ΣM_P: a reaction through P has no moment about it, so a
  // smart choice of P leaves as few as possible (one, and ΣM gives it directly).
  const firstM = equations.find((e) => e.id.startsWith("sumM"));
  const momentUnknowns = firstM ? firstM.terms.filter((t) => t.value == null).map((t) => t.id) : [];
  values.nM = momentUnknowns.length;
  // A chosen equation set (Unit 4.3): the unknowns in each equation, and whether
  // the three can find them all. The answers themselves come from the usual set.
  const setUnknowns = equations.map((e) => [...new Set(e.terms.filter((t) => t.value == null).map((t) => t.id))]);
  let setCheck = null;
  if (setup.sums) {
    setCheck = checkSet(sumsOf(setup, momentPoint(setup)));
    values.setOk = setCheck.ok ? 1 : 0;
    values.setMax = Math.max(...setUnknowns.map((u) => u.length));
  }
  const solveWith = setup.sums ? rigidBodyEquations({ ...setup, sums: null }) : equations;
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
    const sol = solveEquations(solveWith, ids);
    if (sol.status !== "unique") {
      status = "unstable";
      message = improperMessage(reactions);
    } else {
      status = "determinate";
      Object.assign(values, sol.values);
      // A pin's (or fixed support's) two components as one force: size and direction.
      for (const s of setup.supports || []) {
        if (s.type !== "pin" && s.type !== "fixed") continue;
        const x = values[`${s.id}_x`], y = values[`${s.id}_y`];
        values[`R_${s.id}`] = Math.hypot(x, y);
        values[`theta_${s.id}`] = ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
      }
      message = liftOff(reactions, values);
      if (message) status = "unstable";
    }
  }
  if (setup.analysis === "count") {
    // Counting only: nothing is solved, but say what the count means.
    if (status === "determinate") message = `${ids.length} unknowns (${list}) and 3 equations: the reactions can all be found — the beam is statically determinate.`;
    status = "resultant";
  }
  // A set that can't do the job says so (once the body itself is fine).
  if (setCheck && !setCheck.ok && status === "determinate") message = setCheck.message;
  return { status, message, values, equations, unknowns: ids, reactions, momentUnknowns, setUnknowns, setCheck };
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
  q.deg = { label: "\\text{degree of indeterminacy}", unit: "" };
  for (const s of setup.supports || []) {
    q[`n_${s.id}`] = { label: `\\text{unknowns at } ${s.id}`, unit: "" };
    q[`R_${s.id}`] = { label: `R_${s.id}`, unit: "N" };
    q[`theta_${s.id}`] = { label: `\\theta_${s.id}`, unit: "deg" };
  }
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
  // A link: its own line, toward its anchor (a pull starts at the body; a push ends on it).
  if (r.kind === "link") {
    const s = (setup.supports || []).find((q) => q.id === r.support);
    return s && s.anchor ? unit(sub(s.anchor, s.at)) : r.dir;
  }
  const s = (setup.supports || []).find((q) => q.id === r.support);
  const n = (s && s.normal) || [0, 1];
  const away = sub(r.at, bodyCentre(setup));
  const v = add(scale(n, -1), mag(away) > 1e-9 ? scale(unit(away), 0.7) : [0, 0]);
  return mag(v) > 1e-9 ? unit(v) : scale(n, -1);
}
