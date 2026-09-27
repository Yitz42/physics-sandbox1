// truss.js — plane trusses by the method of joints (Unit 5.1).
//
// A truss is made of straight members pinned together at joints, loaded only
// at the joints. Each member is then a two-force member: it simply pulls on
// its two joints (tension) or pushes on them (compression). Each joint is a
// particle in equilibrium, so it gives two equations, ΣF_x = 0 and ΣF_y = 0.
//   j joints → 2j equations;  m members + r reactions unknowns.
//   m + r < 2j → unstable (it collapses);  m + r > 2j → statically indeterminate;
//   m + r = 2j → solve (unless the arrangement is improper: then it's unstable).
// Sign convention (the textbook's): every member force is assumed to be
// TENSION, pulling the joint toward the member's other end; a negative answer
// means compression.
//
// setup = {
//   joints:   { A: [x, y], B: [x, y], … }
//   members:  ["AB", "AC", …]            pairs of joint names (one letter each)
//   supports: [{ id: "A", type: "pin" | "roller", normal? }]   at the joint with that name
//   forces:   loads [{ id, symbol, magnitude, direction, joint, push? }]
//   joint:    "C" (optional) the joint a stage works on: the equations shown are
//             only its two, and a free-body diagram is of that joint
//   knownReactions: true — the joint's support reactions are shown as already found
//   Drawing only: showReactions ("always" | "reveal"), dims, texts
// }
// result.values: every member force "F_AB" (tension +), every reaction, every
// load, "n" (unknowns), "m", "j"; result.states: { F_AB: "tension" | "compression" | "zero" }.

import { sub } from "../../core/vector.js";
import { solveEquations } from "../../core/equations.js";
import { componentFactors } from "./directions.js";
import { magnitudeOf } from "./particle.js";
import { reactionsOf, textbookDirection } from "./supports.js";

// ---- The truss, tidied: support and load positions, member ids --------------------

export const memberId = (m) => `F_${m}`;
export const memberSymbol = (m) => `F_{${m}}`;

// The members meeting at joint J, each with the joint at its other end.
export function membersAt(setup, J) {
  return (setup.members || []).filter((m) => m.includes(J)).map((m) => ({ m, other: m[0] === J ? m[1] : m[0] }));
}

export function trussSupports(setup) {
  return (setup.supports || []).map((s) => ({ ...s, at: s.at || setup.joints[s.joint || s.id] }));
}

export function trussLoads(setup) {
  return (setup.forces || []).map((f) => ({ ...f, at: f.at || setup.joints[f.joint] }));
}

export function trussReactions(setup) {
  return trussSupports(setup).flatMap(reactionsOf);
}

// A member's direction as the textbook writes it: a word along an axis, else the
// smallest whole-number slope triangle (2 : 1.5 → 4 : 3, so its parts read 4/5 and 3/5).
function memberDirection(v) {
  const d = textbookDirection(v);
  if (typeof d === "string") return d;
  const [x, y] = d.slope;
  const gcd = (a, b) => (b ? gcd(b, a % b) : a);
  for (let k = 1; k <= 20; k++) {
    const a = x * k, b = y * k;
    if (Math.abs(a - Math.round(a)) < 1e-6 && Math.abs(b - Math.round(b)) < 1e-6) {
      const g = gcd(Math.abs(Math.round(a)), Math.abs(Math.round(b))) || 1;
      return { slope: [Math.round(a) / g, Math.round(b) / g] };
    }
  }
  return d;
}

const jointOf = (setup, at) => Object.keys(setup.joints).find((J) => Math.hypot(setup.joints[J][0] - at[0], setup.joints[J][1] - at[1]) < 1e-9);

// ---- Equations as data -------------------------------------------------------------

// Both equations of joint J. known: { id: value } for unknowns treated as found.
function jointEquations(setup, J, known = {}) {
  const fx = { id: `${J}_x`, lhs: `\\text{${J}: } \\Sigma F_x`, form: "zero", terms: [] };
  const fy = { id: `${J}_y`, lhs: `\\text{${J}: } \\Sigma F_y`, form: "zero", terms: [] };
  const put = (id, symbol, direction, value, unit) => {
    const c = componentFactors(direction);
    if (c.x) fx.terms.push({ id, sign: c.x.sign, symbol, value, unit, factor: c.x.factor });
    if (c.y) fy.terms.push({ id, sign: c.y.sign, symbol, value, unit, factor: c.y.factor });
  };
  // Loads first, then the members (tension: pulling J toward the other end), then reactions.
  for (const f of trussLoads(setup)) if (jointOf(setup, f.at) === J) put(f.id, f.symbol, f.direction, magnitudeOf(f), "N");
  for (const { m, other } of membersAt(setup, J)) {
    const id = memberId(m);
    put(id, memberSymbol(m), memberDirection(sub(setup.joints[other], setup.joints[J])), known[id] ?? null, "N");
  }
  for (const r of trussReactions(setup)) if (jointOf(setup, r.at) === J) put(r.id, r.symbol, r.direction, known[r.id] ?? null, "N");
  return [fx, fy];
}

// Every joint's equations, or (setup.joint) just that joint's two.
export function trussEquations(setup, result = null) {
  if (setup.joint) {
    const known = {};
    if (setup.knownReactions && result && result.status === "determinate") for (const r of trussReactions(setup)) known[r.id] = result.values[r.id];
    return jointEquations(setup, setup.joint, known);
  }
  return Object.keys(setup.joints).flatMap((J) => jointEquations(setup, J));
}

// ---- Solve and classify --------------------------------------------------------------

export function solveTruss(setup) {
  const joints = Object.keys(setup.joints);
  const members = setup.members || [];
  const reactions = trussReactions(setup);
  const ids = [...members.map(memberId), ...reactions.map((r) => r.id)];
  const values = { j: joints.length, m: members.length, n: ids.length };
  for (const f of trussLoads(setup)) values[f.id] = magnitudeOf(f);
  const equations = joints.flatMap((J) => jointEquations(setup, J));
  const eqs = 2 * joints.length;
  let status, message;
  const count = `${members.length} members + ${reactions.length} reactions = ${ids.length} unknowns, and ${joints.length} joints × 2 = ${eqs} equations`;
  if (ids.length < eqs) {
    status = "unstable";
    message = `${count}: too few members or supports — the truss collapses.`;
  } else if (ids.length > eqs) {
    status = "indeterminate";
    message = `${count}: more unknowns than equations, so the truss is statically indeterminate.`;
  } else {
    const sol = solveEquations(equations, ids);
    if (sol.status !== "unique") {
      status = "unstable";
      message = `${count}, but the members and supports are arranged so the truss can still move: it's unstable.`;
    } else {
      status = "determinate";
      Object.assign(values, sol.values);
      // A roller can only push: if it would have to pull, the truss lifts off it.
      const pulled = reactions.find((r) => r.kind === "push" && values[r.id] < -1e-6);
      if (pulled) {
        status = "unstable";
        message = `$${pulled.symbol}$ would have to pull (${values[pulled.id].toFixed(1)} N), but a roller can only push: the truss lifts off it.`;
      }
    }
  }
  const states = {};
  if (status === "determinate") {
    for (const m of members) {
      const v = values[memberId(m)];
      states[memberId(m)] = Math.abs(v) < 1e-6 ? "zero" : v > 0 ? "tension" : "compression";
    }
  }
  return { status, message, values, states, equations, unknowns: ids, reactions };
}

// Names and units for result.values (answer boxes and labels).
export function trussQuantities(setup) {
  const q = { n: { label: "\\text{unknowns}", unit: "" }, m: { label: "m", unit: "" }, j: { label: "j", unit: "" } };
  for (const m of setup.members || []) q[memberId(m)] = { label: memberSymbol(m), unit: "N" };
  for (const r of trussReactions(setup)) q[r.id] = { label: r.symbol, unit: "N" };
  for (const f of trussLoads(setup)) q[f.id] = { label: f.symbol, unit: "N" };
  return q;
}

// The truss's overall size (for arrow lengths and the picture).
export function trussSize(setup) {
  const pts = Object.values(setup.joints);
  let s = 0;
  for (const a of pts) for (const b of pts) s = Math.max(s, Math.hypot(a[0] - b[0], a[1] - b[1]));
  return s || 1;
}
