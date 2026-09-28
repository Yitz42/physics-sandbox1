// force3d-rigid.js — a rigid body in equilibrium in 3D (Unit 5.6), setup.analysis: "rigid".
//
// Six equations: ΣF_x = ΣF_y = ΣF_z = 0 and ΣM_x = ΣM_y = ΣM_z = 0 (moments about the point
// setup.about — pick one where many unknowns act, and their moments vanish). So up to SIX
// unknown sizes. Each force's moment about O is r × F (force3d-moment.js), r from O to the point
// it acts at; in the equations each term is its size times its moment arm about that axis.
//
// setup (points and force directions as force3d.js):
//   forces: [{ id, symbol, magnitude | null, dir, at, kind? }]   loads, weights (dir down) and cables
//           (kind: "cable", magnitude: null, dir: { from, to }: can only pull)
//   supports: [{ id, type, at, axis? }]  each replaced by its reactions (textbook, ch. 5):
//     "ball"     ball-and-socket: three forces  A_x, A_y, A_z
//     "thrust"   thrust bearing: the same three (it also stops sliding along the shaft)
//     "bearing"  journal bearing (or hinge) on a shaft along `axis`: the two forces across it
//     "roller"   a smooth surface or roller: one push along `axis` (default "z", up)
//   about: "A"  the moment point (default: the first support's point)
//   plate: ["A", "B", "C", "D"]  a flat plate's corners (drawn filled);  body: a bent bar (as 4.7)
// values: each unknown's size (by id), and each force's components (id.x …).

import { solveEquations } from "../../core/equations.js";
import { sigFig } from "../../core/units.js";
import { directionOf3, pointOf, describe } from "./force3d.js";
import { cross } from "./force3d-moment.js";

const AX = ["x", "y", "z"];
const n4 = (v) => sigFig(v, 4);
const UNIT = { x: [1, 0, 0], y: [0, 1, 0], z: [0, 0, 1] };
// (A unit vector along an axis, as direction angles — so force3d.js and its picture read it.)
const along = (k) => ({ angles: AX.map((a) => (a === k ? 0 : 90)) });

// The supports, replaced by their reactions: forces with unknown sizes along the axes.
export function reactionsOf3(setup) {
  const out = [];
  for (const s of setup.supports || []) {
    const comps = s.type === "ball" || s.type === "thrust" ? AX
      : s.type === "bearing" ? AX.filter((k) => k !== (s.axis || "y"))
        : s.type === "roller" ? [s.axis || "z"] : [];
    for (const k of comps) out.push({ id: `${s.id}_${k}`, symbol: `${s.id}_${k}`, magnitude: null, dir: along(k), at: s.at, reaction: true, support: s.id });
  }
  return out;
}

export const allForces3 = (setup) => [...(setup.forces || []), ...reactionsOf3(setup)];

const aboutOf = (setup) => setup.about || (setup.supports && setup.supports[0] && setup.supports[0].at) || "O";

// A force's unit vector, the point it acts at (from O), and its size (null if unknown).
// opts.rNotU: a slip — a cable's position vector used as if it were its unit vector.
function partsOf(f, setup, opts = {}) {
  const d = f.kind === "weight" ? { u: [0, 0, -1] } : directionOf3(f, setup);
  if (d.error) return { error: d.error };
  const u = opts.rNotU && d.r ? d.r : d.u;
  const O = pointOf(setup, aboutOf(setup)) || [0, 0, 0];
  const P = pointOf(setup, f.at || (f.dir && f.dir.from));
  if (!P) return { error: `Force ${f.id} needs a point to act at.` };
  const r = [P[0] - O[0], P[1] - O[1], P[2] - O[2]];
  const size = f.kind === "weight" && f.mass != null ? f.mass * 9.81 : f.magnitude ?? null;
  return { u, r, m: cross(r, u), size, d };
}

// The six equations as data. opts: slips (rNotU; drop: [force ids] left out).
export function rigid3dEquations(setup, opts = {}) {
  const forces = allForces3(setup).filter((f) => !(opts.drop || []).includes(f.id));
  const O = aboutOf(setup);
  const eqs = [];
  for (const [kind, i] of [...AX.map((k, i) => ["F", i]), ...AX.map((k, i) => ["M", i])]) {
    const terms = [];
    for (const f of forces) {
      const p = partsOf(f, setup, opts);
      if (p.error) continue;
      const c = kind === "F" ? p.u[i] : p.m[i];
      if (Math.abs(c) < 1e-12) continue;
      const axisAligned = p.u.filter((x) => Math.abs(x) > 1e-12).length === 1;
      let factor = null;
      if (kind === "F" && !axisAligned) {
        // A cable's part along the axis: the fraction Δ/r, with the classic slip (Δ alone) as its alt.
        const r = p.d.r ? p.d.r[i] : c, len = p.d.len || 1;
        factor = p.d.r ? { tex: `\\tfrac{${n4(Math.abs(r))}}{${n4(len)}}`, value: Math.abs(c), pre: true,
          alt: { tex: `(${n4(Math.abs(r))})`, value: Math.abs(r) }, swapKind: "vector",
          swapReason: "uses the cable's position vector part without dividing by its length — use the unit vector, $\\mathbf{u} = \\mathbf{r}/r$" }
          : { tex: `(${n4(Math.abs(c))})`, value: Math.abs(c), pre: true };
      }
      if (kind === "M") {
        // Its moment arm about this axis (for a force along an axis, a plain distance).
        factor = { tex: `(${n4(Math.abs(c))}\\,\\text{m})`, value: Math.abs(c) };
        // (The classic slip: the point's coordinate ALONG the moment axis, not square to it.)
        const wrong = Math.abs(p.r[i]);
        if (axisAligned && Math.abs(wrong - Math.abs(c)) > 1e-9 && wrong > 1e-9) {
          Object.assign(factor, { alt: { tex: `(${n4(wrong)}\\,\\text{m})`, value: wrong }, swapKind: "momentArm",
            swapReason: "uses the wrong distance: the arm about an axis is measured square to both the axis and the force" });
        }
      }
      terms.push({ id: f.id, sign: Math.sign(c), symbol: f.symbol, value: p.size, unit: "N", ...(factor ? { factor } : {}) });
    }
    const k = AX[i];
    eqs.push({ id: `sum${kind}${k}`, lhs: kind === "F" ? `\\Sigma F_${k}` : `\\Sigma (M_${O})_${k}`, form: "zero", terms });
  }
  return eqs;
}

export function solveRigid3d(setup, opts = {}) {
  const forces = allForces3(setup);
  const values = {};
  for (const f of forces) {
    const p = partsOf(f, setup);
    if (p.error) return { status: "unstable", message: p.error, values };
  }
  const unknowns = forces.filter((f) => partsOf(f, setup).size == null).map((f) => f.id);
  if (unknowns.length > 6) {
    return { status: "indeterminate", values, message: `There are ${unknowns.length} unknowns but only six equations: statically indeterminate.` };
  }
  const sol = solveEquations(rigid3dEquations(setup, opts), unknowns);
  // (linear.js: "indeterminate" — unknowns the equations can't separate, e.g. two reactions on one
  // line; "inconsistent" — no set of reactions balances the loads: the body moves.)
  if (sol.status === "indeterminate") {
    return { status: "indeterminate", values, message: "Some reactions can't be told apart by the six equations (they act along one line, or about one axis): improper supports." };
  }
  if (sol.status === "inconsistent") {
    return { status: "unstable", values, message: "These supports can't hold the body against these loads: it would move (improper supports)." };
  }
  Object.assign(values, sol.values);
  for (const f of forces) {
    const p = partsOf(f, setup);
    const F = p.size ?? values[f.id];
    describe(values, `${f.id}v`, p.d.u ? p.d.u.map((c) => c * F) : [0, 0, -F]);
  }
  const slack = forces.find((f) => f.kind === "cable" && values[f.id] < -1e-6);
  return { status: slack ? "unstable" : "determinate", values, unknowns,
    message: slack ? `Cable ${slack.symbol} would have to push — a cable can only pull.` : "" };
}

export function rigid3dQuantities(setup) {
  const q = {};
  for (const f of allForces3(setup)) q[f.id] = { label: f.symbol, unit: "N" };
  return q;
}

// Answers that common slips give: a cable's r used as its unit vector, a force left out
// (the weight, or one reaction), the mass for the weight.
export function rigid3dMistakes(setup, name) {
  const right = solveRigid3d(setup).values[name];
  const list = [];
  const add = (value, message, kind) => {
    if (!Number.isFinite(value) || Math.abs(value - right) < 1e-6 * Math.max(1, Math.abs(right))) return;
    if (!list.some((m) => Math.abs(m.value - value) < 1e-9)) list.push({ value, message, kind });
  };
  const alt = (opts) => {
    const unknowns = allForces3(setup).filter((f) => !(opts.drop || []).includes(f.id) && partsOf(f, setup).size == null).map((f) => f.id);
    return solveEquations(rigid3dEquations(setup, opts), unknowns).values[name];
  };
  if ((setup.forces || []).some((f) => f.kind === "cable")) add(alt({ rNotU: true }), "A cable's force is $T\\,\\mathbf{u}$: divide its position vector by its length first.", "vector");
  for (const f of (setup.forces || []).filter((x) => x.kind === "weight" || x.id === "W")) add(alt({ drop: [f.id] }), "The body's weight is missing: W = mg acts at its centre.", "missing");
  return list;
}
