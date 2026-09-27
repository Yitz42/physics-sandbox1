// moment-tools.js — the interactive extras for moment problems:
//   drag handles, common-mistake predictions, the "shadow" of a wrong answer,
//   and the lines shown under the equations.

import { add, scale, sub, mag, unit } from "../../core/vector.js";
import { clone } from "../../core/paths.js";
import { fixedTex, format, sigFig } from "../../core/units.js";
import { magnitudeOf, directionOf } from "./particle.js";
import { fromVector, swapTrig } from "./directions.js";
import { solveMoment, armOf, armAngle, momentQuantities, componentSymbol } from "./moment.js";

// ---- Dragging arrow tips (explore/build) ---------------------------------------

export function momentHandles(setup, ids = []) {
  if (!setup.forceScale) return [];
  return setup.forces
    .filter((f) => ids.includes(f.id) && f.at)
    .map((f) => ({ id: f.id, at: add(f.at, scale(directionOf(f), magnitudeOf(f) / setup.forceScale)) }));
}

export function momentDrag(setup, id, point) {
  const f = setup.forces.find((x) => x.id === id);
  if (!f || !f.at) return setup;
  const v = sub(point, f.at);
  const step = setup.dragStep || 10;
  f.magnitude = Math.min(setup.dragMax || Infinity, Math.max(step, Math.round((mag(v) * setup.forceScale) / step) * step));
  f.direction = fromVector(v, 1);
  return setup;
}

// ---- Common mistakes ---------------------------------------------------------------

const pretty = (symbol) => symbol.replace(/[{}]/g, "").replace(/_/g, "");

// [{ value, kind, message }] for quantity `name` ("M", "M_F1", "d_F1", "W_B.pos" …).
export function momentMistakes(setup, name) {
  const base = solveMoment(setup);
  const correct = base.values[name];
  const list = [];
  const add1 = (value, message, kind) => {
    if (!Number.isFinite(value) || Math.abs(value - correct) < 1e-6 * Math.max(1, Math.abs(correct))) return;
    list.push({ value, kind, message });
    if (Math.abs(value) > 1e-9) list.push({ value: -value, kind, also: "sign", message: `${message} Also check the sign: counterclockwise is positive.` });
  };
  const variant = (s, message, kind) => {
    try {
      add1(solveMoment(s).values[name], message, kind);
    } catch {
      /* this mistake doesn't apply */
    }
  };

  const withR = clone(setup);
  withR._armMode = "r";
  variant(withR, "It looks like you used the distance from O to the point where the force acts. Use the perpendicular distance d from O to the force's line of action.", "momentArm");

  const angled = setup.forces.filter((f) => f.direction && typeof f.direction === "object");
  if (angled.length) {
    const s = clone(setup);
    s.forces.forEach((f) => f.direction && typeof f.direction === "object" && (f.direction = swapTrig(f.direction)));
    variant(s, "It looks like sin and cos are swapped. Check which axis each angle is measured from.", "trig");
  }

  if (name === "M" && setup.forces.length > 1) {
    for (const f of setup.forces) {
      const Mf = base.values[`M_${f.id}`];
      if (!Mf) continue;
      add1(correct - Mf, `Did you leave out the moment of ${pretty(f.symbol)}? Every force with a moment arm about O counts.`, "missing");
      add1(correct - 2 * Mf, `Check which way ${pretty(f.symbol)} turns the body about O: clockwise moments are negative, counterclockwise positive.`, "direction");
    }
  }

  // Varignon: the moment of ONE component (F_x or F_y) about O.
  const part = name.match(/^M([xy])_(.+)$/);
  const pf = part && setup.forces.find((f) => f.id === part[2] && f.at);
  if (pf) {
    const [x, y] = sub(pf.at, setup.about.at);
    const Fv = scale(directionOf(pf), magnitudeOf(pf));
    const c = pretty(componentSymbol(pf.symbol, part[1]));
    if (part[1] === "y") add1(y * Fv[1], `${c} is vertical, so its moment arm is the SIDEWAYS distance x from O to its line, not the height y.`, "momentArm");
    else add1(-x * Fv[0], `${c} is horizontal, so its moment arm is the HEIGHT y of its line above or below O, not the sideways distance x.`, "momentArm");
    add1(base.values[`M_${pf.id}`], `That's the moment of the whole force. Here you need only ${c}'s part — Varignon's theorem adds the two parts up afterwards.`, "momentArm");
  }

  // Balance problems: the ratio upside down (the lighter one must sit farther out).
  const unknown = setup.forces.find((f) => !f.at);
  if (unknown && name === `${unknown.id}.pos` && setup.forces.length === 2) {
    const other = setup.forces.find((f) => f !== unknown);
    const flipped = (magnitudeOf(unknown) * Math.abs(other.at[0] - setup.about.at[0])) / magnitudeOf(other);
    add1(Math.sign(correct) * flipped, "The ratio looks upside down: the lighter one has to sit FARTHER from the pivot to balance.", "algebra");
  }

  if (Math.abs(correct) > 1e-9) {
    list.push({
      value: -correct,
      kind: name.endsWith(".pos") ? "direction" : "sign",
      message: name.endsWith(".pos")
        ? "Right distance, wrong side: it has to sit on the other side of the pivot."
        : "Right size, wrong sign. Counterclockwise moments are positive, clockwise negative.",
    });
  }
  return list;
}

// ---- Shadow of a wrong answer (see particle-shadow.js for the idea) ---------------

export function momentShadow(setup, result, guesses, { k, size }) {
  const O = setup.about.at;
  const vals = result ? result.values : {};
  const g = (key) => (Number.isFinite(guesses[key]) ? guesses[key] : null);
  const shapes = [];

  for (const f of setup.forces) {
    // Their position for the unknown force → where it would sit, and the moment left over.
    const pos = !f.at ? g(`${f.id}.pos`) : null;
    if (pos != null) {
      const P = add(O, scale(f.along.dir, pos));
      const b = setup.boxSize ?? 0.12 * size;
      if (f.kind === "weight") shapes.push({ type: "box", at: add(P, [0, b / 2 + 0.02 * size]), w: b, h: b, label: "", alpha: 0.35, dashed: true });
      shapes.push({ type: "arrow", id: `shadow-${f.id}`, from: P, to: add(P, scale(directionOf(f), Math.max(0.12 * size, magnitudeOf(f) * k))), role: "shadow", label: `your ${f.posSymbol} = ${format(pos, "m")}` });
      let net = 0;
      for (const h of setup.forces) {
        const Ph = h === f ? P : h.at;
        net += (magnitudeOf(h) ?? 0) * armOf(setup, h, Ph).perNewton;
      }
      if (Math.abs(net) > 0.05) {
        const way = net > 0 ? "tips counterclockwise" : "tips clockwise";
        shapes.push({ type: "moment", center: O, sense: Math.sign(net), rPx: 46, role: "shadow", label: `with your ${f.posSymbol}: ΣM_O = ${net.toFixed(1)} N·m, it ${way}` });
      }
    }
    // Their moment arm → a dashed arm of that length toward the real line of action.
    const d = f.at ? g(`d_${f.id}`) : null;
    if (d != null) {
      const a = armOf(setup, f, f.at);
      const dir = a.d > 1e-9 ? unit(sub(a.foot, O)) : [0, 1];
      shapes.push({ type: "dim", from: O, to: add(O, scale(dir, d)), role: "shadow", dashed: true, label: `your d = ${format(d, "m")}`, labelSide: -1 });
    }
  }

  // Their moment → a dashed curved arrow with their size and turning sense.
  for (const key of ["M", ...setup.forces.map((f) => `M_${f.id}`)]) {
    const M = g(key);
    if (M == null || Math.abs(M) < 1e-9 || (key !== "M" && vals[key] == null)) continue;
    const sense = M > 0 ? "counterclockwise" : "clockwise";
    shapes.push({ type: "moment", center: O, sense: Math.sign(M), rPx: 48, role: "shadow", label: `your M = ${M.toFixed(1)} N·m (${sense})` });
  }
  return shapes;
}

// ---- Lines under the equations ------------------------------------------------------

export function momentSummary(setup, result, { mode = "symbolic", reveal = true } = {}) {
  const lines = [];
  if (setup.analysis === "balance") {
    const f = setup.forces.find((x) => !x.at);
    if (reveal && f && result.values[`${f.id}.pos`] != null) lines.push(`${f.posSymbol} = ${fixedTex(result.values[`${f.id}.pos`], "m", 2)}`);
    return lines;
  }
  if (mode === "symbolic") lines.push("d = \\perp \\text{ distance from } O \\text{ to line of action}");
  // The second line is Varignon's theorem: name it where it's used.
  if (mode === "symbolic" && setup.forces.some((f) => f.direction && typeof f.direction === "object")) {
    lines.push("\\text{Varignon's theorem: } M_O(F) = M_O(F_x) + M_O(F_y) = -yF_x + xF_y");
  }
  // setup.varignon: each component's moment on its own, then their sum.
  if (setup.varignon && reveal && mode === "numeric") {
    const v = result.values;
    for (const f of setup.forces.filter((x) => x.at)) {
      const [x, y] = sub(f.at, setup.about.at);
      const Fv = scale(directionOf(f), magnitudeOf(f));
      const n = (a) => sigFig(a, 4);
      lines.push(`M_O(${componentSymbol(f.symbol, "y")}) = xF_y = (${n(x)})(${n(Fv[1])}) = ${fixedTex(v[`My_${f.id}`], "N·m")}`);
      lines.push(`M_O(${componentSymbol(f.symbol, "x")}) = -yF_x = -(${n(y)})(${n(Fv[0])}) = ${fixedTex(v[`Mx_${f.id}`], "N·m")}`);
    }
  }
  if (reveal) {
    const names = momentQuantities(setup);
    for (const f of setup.forces) {
      const d = result.values[`d_${f.id}`];
      if (d == null || d < 1e-9) continue;
      const r = result.values[`r_${f.id}`];
      const dl = names[`d_${f.id}`].label;
      // Angled force: show the working, d = r sin φ.
      lines.push(Math.abs(r - d) > 1e-6
        ? `${dl} = r\\sin\\varphi = ${fixedTex(r, "m", 3)}\\,\\sin ${armAngle(setup, f, f.at).toFixed(1)}^\\circ = ${fixedTex(d, "m", 3)}`
        : `${dl} = ${fixedTex(d, "m", 3)}`);
    }
  }
  return lines;
}
