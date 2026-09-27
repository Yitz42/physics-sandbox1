// couple-tools.js — the interactive extras for couple problems (Unit 4):
//   dragging the reference point P, common-mistake predictions, the "shadow"
//   of a wrong answer, and the lines shown under the equations.

import { add, scale } from "../../core/vector.js";
import { clone } from "../../core/paths.js";
import { fixedTex, format, sigFig, unitTex } from "../../core/units.js";
import { swapTrig } from "./directions.js";
import { momentHandles, momentDrag } from "./moment-tools.js";
import { solveCouple } from "./couple.js";
import { coupleGeometry, dSymbolOf, armSymbolOf, allForces, refPoint, isSlanted } from "./couple-geometry.js";

// ---- Dragging: the point P, and arrow tips (as in Unit 3) -------------------------

export function coupleHandles(setup, ids = []) {
  const out = setup.forces ? momentHandles(setup, ids) : []; // arrow tips of plain forces
  if (setup.about && ids.includes("P")) out.push({ id: "P", at: setup.about.at });
  return out;
}

// P snaps to a grid (about.step, default 0.05 m) and stays inside about.bounds.
export function coupleDrag(setup, id, point) {
  if (id !== "P") return momentDrag(setup, id, point);
  const step = setup.about.step || 0.05;
  const b = setup.about.bounds || { xmin: -Infinity, xmax: Infinity, ymin: -Infinity, ymax: Infinity };
  const snap = (v, lo, hi) => Math.min(hi, Math.max(lo, Number((Math.round(v / step) * step).toFixed(6))));
  setup.about.at = [snap(point[0], b.xmin, b.xmax), snap(point[1], b.ymin, b.ymax)];
  return setup;
}

// ---- Common mistakes ---------------------------------------------------------------

const pretty = (symbol) => String(symbol).replace(/[{}]/g, "").replace(/_/g, "");

// [{ value, message }] for quantity `name` ("M", or a replacement couple's force).
export function coupleMistakes(setup, name) {
  const base = solveCouple(setup);
  const correct = base.values[name];
  const list = [];
  const add1 = (value, message, kind, withSign = true) => {
    if (!Number.isFinite(value) || Math.abs(value - correct) < 1e-6 * Math.max(1, Math.abs(correct))) return;
    list.push({ value, kind, message });
    if (withSign && Math.abs(value) > 1e-9) list.push({ value: -value, kind, also: "sign", message: `${message} Also check the sign: counterclockwise is positive.` });
  };
  const couples = setup.couples || [];

  // Sin and cos swapped on every angled force.
  const s = clone(setup);
  let angled = false;
  for (const f of [...(s.forces || []), ...(s.couples || [])]) {
    if (f.direction && typeof f.direction === "object") {
      f.direction = swapTrig(f.direction);
      angled = true;
    }
  }
  if (angled) add1(solveCouple(s).values[name], "It looks like sin and cos are swapped. Check which axis each angle is measured from.", "trig");

  const replacement = couples.find((c) => c.id === name && c.equivalentTo);
  if (replacement) {
    // Finding the force of an equivalent couple: F' = M / d'.
    const orig = couples.find((c) => c.id === replacement.equivalentTo);
    const M = Math.abs(base.values[`M_${orig.id}`]);
    const d0 = base.values[`d_${orig.id}`], d1 = base.values[`d_${name}`], r1 = base.values[`r_${name}`];
    const F0 = base.values[orig.id];
    const dp = dSymbolOf(replacement);
    add1(M, `That is the couple moment M (in N·m), not the force. Divide it by the distance ${dp} between the new forces.`, "algebra", false);
    add1(M * d1, `Multiplying by ${dp} gives the wrong thing: the new forces must satisfy F·${dp} = M, so F = M / ${dp}.`, "algebra", false);
    add1(F0, "Equal forces only give the same moment when the distances are the same too. Here the distances differ.", "concept", false);
    add1((F0 * d1) / d0, "The ratio looks upside down: when the forces are CLOSER together they must be BIGGER to make the same moment.", "algebra", false);
    add1((2 * M) / d1, `It looks like you used half the distance (from the middle to one force). ${dp} is the distance between the two lines of action.`, "momentArm", false);
    add1(M / (2 * d1), "It looks like you split the moment between the two forces. A couple's moment is F × d once, not once per force.", "concept", false);
    if (Math.abs(r1 - d1) > 1e-6) add1(M / r1, "Use the perpendicular distance between the two lines of action, not the distance between the two points.", "momentArm", false);
    return list;
  }

  if (name === "M") {
    // Couple by couple: wrong distance, left out, wrong way round, counted twice.
    for (const c of couples.filter((x) => !x.equivalentTo)) {
      const Mc = base.values[`M_${c.id}`];
      const F = base.values[c.id], r = base.values[`r_${c.id}`], d = base.values[`d_${c.id}`];
      if (Math.abs(r - d) > 1e-6) {
        add1(correct + Math.sign(Mc) * F * (r - d), `For ${pretty(c.symbol)}, use the perpendicular distance between the two lines of action, not the distance between the two points where the forces act.`, "momentArm");
      }
      if (couples.length + (setup.moments || []).length > 1) {
        add1(correct - Mc, `Did you leave out the couple of ${pretty(c.symbol)}? Every couple on the body adds its moment.`, "missing");
        add1(correct - 2 * Mc, `Check which way the ${pretty(c.symbol)} couple turns the body: clockwise is negative, counterclockwise positive.`, "direction");
      }
      add1(correct + Mc, `A couple's moment is F × d, counted once — not once for each of its two forces.`, "concept");
    }
    for (const m of setup.moments || []) {
      add1(correct - m.sense * m.magnitude, `Did you leave out the couple moment ${pretty(m.symbol)}? It acts on the body too.`, "missing");
      add1(correct - 2 * m.sense * m.magnitude, `Check the sign of ${pretty(m.symbol)}: its curved arrow shows which way it turns.`, "direction");
    }
  }
  if (Math.abs(correct) > 1e-9) list.push({ value: -correct, kind: "sign", message: "Right size, wrong sign. Counterclockwise moments are positive, clockwise negative." });
  return list;
}

// ---- Shadow of a wrong answer (see particle-shadow.js for the idea) ---------------

export function coupleShadow(setup, result, guesses, { k, size, center }) {
  const g = (key) => (Number.isFinite(guesses[key]) ? guesses[key] : null);
  const shapes = [];
  const turn = (M) => (M > 0 ? "counterclockwise" : "clockwise");

  // Their force for a replacement couple → dashed arrows of that size, and the moment it makes.
  for (const c of (setup.couples || []).filter((x) => x.equivalentTo)) {
    const F = g(c.id);
    if (F == null) continue;
    const geo = coupleGeometry(setup, c);
    for (const f of [geo.a, geo.b]) {
      const u = f === geo.a ? geo.u : scale(geo.u, -1);
      shapes.push({ type: "arrow", id: `shadow-${f.id}`, from: f.at, to: add(f.at, scale(u, Math.max(0.05 * size, Math.abs(F) * k))), role: "shadow", label: f === geo.a ? `your ${c.symbol} = ${format(F, "N")}` : "" });
    }
    const M = F * geo.perNewton;
    const want = result.values[`M_${c.equivalentTo}`];
    const mid = scale(add(geo.a.at, geo.b.at), 0.5);
    shapes.push({ type: "moment", center: mid, sense: Math.sign(M) || 1, rPx: 40, role: "shadow", label: `your couple: ${M.toFixed(1)} N·m (needs ${want.toFixed(1)})` });
  }

  // Their moment → a dashed curved arrow with their size and turning sense.
  const M = g("M");
  if (M != null && Math.abs(M) > 1e-9) {
    shapes.push({ type: "moment", center, sense: Math.sign(M), rPx: 50, role: "shadow", label: `your M = ${M.toFixed(1)} N·m (${turn(M)})` });
  }
  return shapes;
}

// ---- Lines under the equations ------------------------------------------------------

export function coupleSummary(setup, result, { mode = "symbolic", reveal = true } = {}) {
  const lines = [];
  const v = result.values;
  const couples = setup.couples || [];
  const about = setup.about && !setup.about.hidden;
  const P = about ? setup.about.label || "P" : null;

  if (mode === "symbolic") {
    const arms = allForces(setup).filter((f) => !f.replacement).map(armSymbolOf).join(", ");
    if (about) lines.push(`${arms} = \\perp \\text{ distances from } ${P} \\text{ to each line of action}`);
    if (couples.some((c) => !c.equivalentTo)) lines.push("d = \\perp \\text{ distance between the two lines of action}");
  }
  if (!reveal) return lines;

  // M_P equals the couple moment, wherever P is.
  // (Only when every force belongs to a couple; a lone force's moment does depend on P.)
  const paired = new Set(couples.flatMap((c) => c.forces || []));
  if (about && couples.length && (setup.forces || []).every((f) => paired.has(f.id))) {
    lines.push(`M_{${P}} = ${fixedTex(v.M, "N·m")} = M \\text{ — the same for every point } ${P}`);
  }
  for (const c of couples) {
    const d = v[`d_${c.id}`], r = v[`r_${c.id}`];
    const ds = dSymbolOf(c);
    if (isSlanted(coupleGeometry(setup, c).u)) {
      // Angled couple: show how its d is found, d = r sin φ.
      lines.push(`${ds} = r\\sin\\varphi = ${fixedTex(r, "m", 3)}\\,\\sin ${phiOf(setup, c).toFixed(1)}^\\circ = ${fixedTex(d, "m", 3)}`);
    }
    if (c.equivalentTo) {
      const M = Math.abs(v[`M_${c.equivalentTo}`]);
      lines.push(`${c.symbol} = \\dfrac{M}{${ds}} = \\dfrac{${sigFig(M, 4)}\\,${unitTex("N·m")}}{${sigFig(d, 3)}\\,\\text{m}} = ${fixedTex(v[c.id], "N")}`);
    }
  }
  if (setup.netForce && v.R > 1e-6) lines.push(`F_R = ${fixedTex(v.R, "N")} \\ne 0 \\text{: not a pure couple}`);
  return lines;
}

// The acute angle φ between the line joining a couple's two points and its
// lines of action: d = r sin φ.
export function phiOf(setup, c) {
  const g = coupleGeometry(setup, c);
  if (g.rLen < 1e-12) return 0;
  const cos = Math.min(1, Math.abs(g.r[0] * g.u[0] + g.r[1] * g.u[1]) / g.rLen);
  return (Math.acos(cos) * 180) / Math.PI;
}

// Where the total moment is drawn: where the stage says, else at P, else in
// the middle of the forces. (A couple's moment is the same about every point,
// so it can be drawn anywhere on the body.)
export function momentCenter(setup) {
  if (setup.momentAt) return setup.momentAt;
  if (setup.about && !setup.about.hidden) return setup.about.at;
  const pts = allForces(setup).map((f) => f.at);
  if (!pts.length) return refPoint(setup);
  return scale(pts.reduce((s, p) => add(s, p), [0, 0]), 1 / pts.length);
}
