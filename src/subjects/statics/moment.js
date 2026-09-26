// moment.js — moments of forces about a point O (Unit 3).
//
// The moment of a force F about O measures how hard it turns things about O:
//   M_O = ± F·d        d = perpendicular distance from O to F's line of action
//   M_O = x·F_y − y·F_x  (the same number, found from components)
// Counterclockwise is positive (CLAUDE.md), so clockwise moments are negative.
//
// setup.analysis:
//   "moment"   add up the moments:  M_O = ΣM  (both methods shown)
//   "balance"  the body is balanced: ΣM_O = 0, and one force's position is
//              unknown (e.g. where must the second child sit on the seesaw?)
//
// setup = {
//   about: { at: [0, 0], label: "O", pivot: true },  // the moment centre
//   body:  { points: [[x, y], ...] },                  // drawing only
//   forces: [{ id, symbol, magnitude | mass (kind "weight"), direction,
//              at: [x, y]   — where the force acts, or
//              at: null, along: { dir: [1, 0] }, posSymbol: "x_B"  — unknown
//                position along a line through O (balance problems) }],
// }

import { sub, add, scale, cross2, mag } from "../../core/vector.js";
import { solveEquations } from "../../core/equations.js";
import { sigFig } from "../../core/units.js";
import { magnitudeOf, directionOf } from "./particle.js";
import { componentFactors } from "./directions.js";

// "F_1" → "d_{1}", "W_A" → "x_{A}", "F" → "d"
function named(letter, symbol) {
  const m = String(symbol).match(/_\{?([^}]*)\}?$/);
  return m ? `${letter}_{${m[1]}}` : letter;
}
// Numbers substituted into the equations, with units so students see what each is.
const num = (v) => `(${sigFig(Math.abs(v), 3)}\\,\\text{m})`; // a distance
const numN = (v) => `(${sigFig(Math.abs(v), 4)}\\,\\text{N})`; // a force

// Where a force acts (null if its position is the unknown and not yet solved).
export function forcePoint(setup, f, values = {}) {
  if (f.at) return f.at;
  const s = values[`${f.id}.pos`];
  return s == null ? null : add(setup.about.at, scale(f.along.dir, s));
}

// Geometry of the moment arm for force f acting at P:
//   r: vector from O to P, rLen: its length, d: perpendicular distance,
//   perNewton: signed moment per newton (CCW +), foot: nearest point on the line of action
export function armOf(setup, f, P) {
  const O = setup.about.at;
  const r = sub(P, O);
  const u = directionOf(f);
  const perNewton = cross2(r, u);
  const along = -(r[0] * u[0] + r[1] * u[1]);
  return { r, rLen: mag(r), d: Math.abs(perNewton), perNewton, foot: add(P, scale(u, along)) };
}

// Moment of one force about O. `setup._armMode = "r"` deliberately uses the
// straight-line distance |r| instead of d — used only to predict that mistake.
function momentOf(setup, f, P) {
  const a = armOf(setup, f, P);
  const arm = setup._armMode === "r" ? a.rLen : a.d;
  return (magnitudeOf(f) ?? 0) * Math.sign(a.perNewton) * arm;
}

// Equations as data (see core/equations.js).
export function momentEquations(setup) {
  const balance = setup.analysis === "balance";
  const Md = balance
    ? { id: "Md", lhs: "\\Sigma M_O", form: "zero", terms: [] }
    : { id: "Md", lhs: "M_O = \\Sigma F d", form: "define", terms: [], result: { value: 0, unit: "N·m" } };
  for (const f of setup.forces) {
    const F = magnitudeOf(f);
    if (!f.at) {
      // Unknown position s along a line through O: its moment is s·(u × F), linear in s.
      const c = cross2(f.along.dir, directionOf(f));
      Md.terms.push({ id: f.id, sign: Math.sign(c) || 1, symbol: f.posSymbol || named("x", f.symbol), value: null,
        factor: { tex: f.symbol, numTex: numN(F), value: Math.abs(c) * F, pre: true } });
      continue;
    }
    const a = armOf(setup, f, f.at);
    if (a.d < 1e-9) continue; // line of action passes through O: no moment
    const arm = setup._armMode === "r" ? a.rLen : a.d;
    const factor = { tex: named("d", f.symbol), numTex: num(arm), value: arm };
    if (Math.abs(a.rLen - a.d) > 1e-6) {
      factor.alt = { tex: named("r", f.symbol), numTex: num(a.rLen), value: a.rLen };
      factor.swapLabel = "Use the perpendicular distance d";
      factor.swapReason = "uses the distance to O instead of the perpendicular distance d to the line of action";
    }
    Md.terms.push({ id: f.id, sign: Math.sign(a.perNewton), symbol: f.symbol, value: F, unit: "N", factor });
  }
  if (balance) return [Md];

  // Second way: components.  M_O = Σ (x F_y − y F_x)
  const Mxy = { id: "Mxy", lhs: "M_O = \\Sigma (x F_y - y F_x)", form: "define", terms: [], result: { value: 0, unit: "N·m" } };
  for (const f of setup.forces) {
    const [x, y] = sub(f.at, setup.about.at);
    const c = componentFactors(f.kind === "weight" ? "down" : f.direction);
    const term = (coord, letter, comp, sign) => {
      const trig = comp.factor;
      const factor = {
        tex: `\\,${named(letter, f.symbol)}${trig ? trig.tex : ""}`,
        numTex: `${num(coord)}${trig ? trig.tex : ""}`,
        value: Math.abs(coord) * (trig ? trig.value : 1),
      };
      if (trig && trig.alt) factor.alt = { tex: `\\,${named(letter, f.symbol)}${trig.alt.tex}`, numTex: `${num(coord)}${trig.alt.tex}`, value: Math.abs(coord) * trig.alt.value };
      Mxy.terms.push({ id: f.id, sign, symbol: f.symbol, value: magnitudeOf(f), unit: "N", factor });
    };
    if (c.y && Math.abs(x) > 1e-9) term(x, "x", c.y, Math.sign(x) * c.y.sign); // + x·F_y
    if (c.x && Math.abs(y) > 1e-9) term(y, "y", c.x, -Math.sign(y) * c.x.sign); // − y·F_x
  }
  return [Md, Mxy];
}

// Solve. Returns { status, message, values, equations, unknowns }.
// values: "M" (total M_O), and per force "<id>" size, "M_<id>" its moment,
//         "d_<id>" its moment arm, "r_<id>" distance to O, "<id>.pos" solved position
export function solveMoment(setup) {
  const equations = momentEquations(setup);
  const values = {};
  const unknowns = setup.forces.filter((f) => !f.at).map((f) => f.id);
  let status = "resultant";
  let message;
  if (setup.analysis === "balance") {
    if (unknowns.length !== 1) {
      status = "indeterminate";
      message = "A balance problem needs exactly one unknown position.";
    } else {
      const sol = solveEquations(equations, unknowns);
      if (sol.status === "unique") {
        values[`${unknowns[0]}.pos`] = sol.values[unknowns[0]];
        status = "determinate";
      } else {
        status = "unstable";
        message = "No position balances it: that force has no moment about O wherever it sits.";
      }
    }
  }
  let total = 0;
  for (const f of setup.forces) {
    const P = forcePoint(setup, f, values);
    values[f.id] = magnitudeOf(f);
    if (!P) continue;
    const a = armOf(setup, f, P);
    const M = momentOf(setup, f, P);
    values[`M_${f.id}`] = M;
    values[`d_${f.id}`] = setup._armMode === "r" ? a.rLen : a.d;
    values[`r_${f.id}`] = a.rLen;
    total += M;
  }
  values.M = total;
  for (const eq of equations) if (eq.result) eq.result.value = total;
  return { status, message, values, equations, unknowns, net: [0, 0] };
}

// Names and units for result.values (answer boxes and labels).
export function momentQuantities(setup) {
  const q = { M: { label: "M_O", unit: "N·m" } };
  for (const f of setup.forces) {
    q[f.id] = { label: f.symbol, unit: "N" };
    q[`M_${f.id}`] = { label: named("M", f.symbol), unit: "N·m" };
    q[`d_${f.id}`] = { label: named("d", f.symbol), unit: "m" };
    q[`r_${f.id}`] = { label: named("r", f.symbol), unit: "m" };
    if (!f.at) q[`${f.id}.pos`] = { label: f.posSymbol || named("x", f.symbol), unit: "m" };
  }
  return q;
}
