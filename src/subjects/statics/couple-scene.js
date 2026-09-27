// couple-scene.js — the picture for couple problems (Unit 4).
//
// Draws the body (plates, bars), each force at the point where it acts,
// couple moments given as curved arrows, and — when asked —
//   • for each couple: both lines of action and the distance d between them
//     (with the r sin φ working when the forces are angled),
//   • for the point P: the moment arm from P to every line of action,
//   • the total moment as a curved arrow (and the net force if it isn't zero).

import { add, sub, scale, mag } from "../../core/vector.js";
import { format } from "../../core/units.js";
import { magnitudeOf, directionOf } from "./particle.js";
import { angleMarks } from "./particle-scene.js";
import { allForces, coupleGeometry } from "./couple-geometry.js";
import { coupleShadow, momentCenter } from "./couple-tools.js";
import { separation, pointArms } from "./couple-arms.js";
import { spreadPanels } from "../../render/panels.js";

// Overall size of the picture, so arrows scale with it.
export function sizeOf(setup) {
  const pts = allForces(setup).map((f) => f.at);
  for (const p of setup.plates || []) pts.push(p.from, p.to);
  if (setup.body) pts.push(...setup.body.points);
  let s = 0;
  for (const a of pts) for (const b of pts) s = Math.max(s, mag(sub(a, b)));
  return s || 1;
}

// Picture metres per newton: fixed by setup.forceScale, or the biggest KNOWN
// force is drawn setup.arrowFraction (default 0.35) of the picture's size.
export function lengthPerNewton(setup, size) {
  if (setup.forceScale) return 1 / setup.forceScale;
  const known = allForces(setup).map(magnitudeOf).filter((v) => v != null);
  return ((setup.arrowFraction ?? 0.35) * size) / Math.max(1, ...known);
}

const turn = (M) => (M > 0 ? "counterclockwise" : "clockwise");

// opts: { reveal, arms (show d and the arms from P), hideMoment, hideTotal, guesses, canvasSize }
// setup.hideArms: never draw the arms from P (e.g. a beam whose distances are dimensioned)
export function coupleScene(setup, result, opts = {}) {
  const vals = result ? result.values : {};
  const size = sizeOf(setup);
  const k = lengthPerNewton(setup, size);
  const showArms = !!(opts.arms || opts.reveal);
  const shapes = [{ type: "axes" }];

  for (const p of setup.plates || []) {
    shapes.push({ type: "box", at: scale(add(p.from, p.to), 0.5), w: Math.abs(p.to[0] - p.from[0]), h: Math.abs(p.to[1] - p.from[1]), label: p.label || "", passable: true, layer: "zone" }); // under everything
  }
  if (setup.body) shapes.push({ type: "beam", points: setup.body.points });
  for (const t of setup.texts || []) shapes.push({ type: "text", at: t.at, text: t.text });
  for (const d of setup.dims || []) shapes.push({ type: "dim", from: d.from, to: d.to, label: d.label || format(mag(sub(d.to, d.from)), "m"), labelSide: d.side || 1 });

  const arrowSegs = []; // each force's arrow, so P's arms can keep clear of them
  // Forces. An unknown (replacement) force is faint with "?" until revealed.
  // A "push" is drawn the textbook way: arrowhead AT the point, tail outside
  // the body. Otherwise the tail is at the point (a pull, or any applied force).
  allForces(setup).forEach((f) => {
    const known = magnitudeOf(f) != null;
    const show = known || opts.reveal;
    const F = known ? magnitudeOf(f) : vals[f.id];
    const len = show ? Math.max(0.08 * size, F * k) : 0.2 * size;
    const tail = f.push ? add(f.at, scale(directionOf(f), -len)) : f.at;
    const head = add(tail, scale(directionOf(f), len));
    // A couple's second force has the same size, so it just gets its name.
    const label = f.second && show ? f.symbol : `${f.symbol} = ${show ? format(F, "N") : "?"}`;
    shapes.push({ type: "arrow", id: f.id, from: tail, to: head, label, role: known ? "known" : "unknown", alpha: show ? undefined : 0.5 });
    // A weight sits on the body as a box (crate) above the point where it acts.
    if (f.kind === "weight") {
      const b = setup.boxSize ?? 0.12 * size;
      shapes.push({ type: "box", id: f.id, at: add(f.at, [0, b / 2 + 0.02 * size]), w: b, h: b, label: `${+f.mass.toFixed(2)} kg` });
    }
    arrowSegs.push({ id: f.id, tail, head, u: directionOf(f) });
    if (!setup.hideAngles && !f.push) shapes.push(...angleMarks(f, f.at, len));
    if (f.pointLabel) shapes.push({ type: "point", at: f.at, label: f.pointLabel, style: "dot" });
  });

  // Couple moments given directly: a curved arrow, its label kept right beside it.
  for (const m of setup.moments || []) {
    shapes.push({ type: "moment", center: m.at, sense: m.sense, rPx: 30, role: "known", label: `${m.symbol} = ${format(m.magnitude, "N·m")}`, labelMove: 0 });
  }
  if (setup.target) {
    // A goal moment, e.g. a motor's couple: a motor drawing (target.motor) with
    // the curved arrow around its shaft.
    const t = setup.target;
    if (t.motor) shapes.push({ type: "motor", at: t.at });
    shapes.push({ type: "moment", center: t.at, sense: Math.sign(t.value), rPx: t.motor ? 42 : 36, role: "target", label: `goal: ${Math.abs(t.value)} N·m ${turn(t.value)}` });
  }

  // Each couple: its two lines of action and the distance d between them.
  if ((showArms || setup.showSeparation) && !setup.hideSeparation) {
    for (const c of setup.couples || []) shapes.push(...separation(setup, c, size));
  }

  // The point P: its moment arm to every line of action (see couple-arms.js).
  const about = setup.about && !setup.about.hidden;
  if (about && showArms && !setup.hideArms) shapes.push(...pointArms(setup, arrowSegs, size));

  // The total moment: a curved arrow showing which way it turns.
  // (opts.hideTotal: the caller draws its own resultant, e.g. Unit 5's F_R.)
  if (result && !opts.hideTotal && (opts.reveal || (opts.arms && !opts.hideMoment))) {
    const M = vals.M;
    const center = momentCenter(setup);
    const parts = (setup.couples || []).filter((c) => !c.equivalentTo).length + (setup.moments || []).length;
    const name = about ? `M_${setup.about.label || "P"}` : parts > 1 ? "M_R" : "M";
    const text = Math.abs(M) > 1e-9 ? `${name} = ${M.toFixed(1)} N·m (${turn(M)})` : `${name} = 0`;
    if (about && !setup.momentAt) {
      // Around P: a small curved arrow that fits in the gap between the arms,
      // with its value in a tidy box at the side of the picture.
      if (Math.abs(M) > 1e-9) shapes.push({ type: "moment", center, sense: Math.sign(M), rPx: 22, role: "resultant" });
      shapes.push({ type: "note", lines: [{ text, role: "resultant" }] });
    } else if (Math.abs(M) > 1e-9) {
      shapes.push({ type: "moment", center, sense: Math.sign(M), rPx: 44, role: "resultant", label: text });
    } else {
      shapes.push({ type: "text", at: add(center, [0, 0.12 * size]), text });
    }
    // A replacement couple, once solved: its own moment, drawn on its own body.
    for (const c of (setup.couples || []).filter((x) => x.equivalentTo && opts.reveal)) {
      const Mc = vals[`M_${c.id}`];
      const g = coupleGeometry(setup, c);
      shapes.push({ type: "moment", center: scale(add(g.a.at, g.b.at), 0.5), sense: Math.sign(Mc) || 1, rPx: 44, role: "resultant", label: `same: ${Mc.toFixed(1)} N·m (${turn(Mc)})` });
    }
    // A leftover net force means it is NOT a pure couple (build stage).
    if (setup.netForce && vals.R > 0.5) {
      const R = [vals["R.x"], vals["R.y"]];
      shapes.push({ type: "arrow", id: "R", from: center, to: add(center, scale(R, Math.max(0.1 * size, vals.R * k) / vals.R)), role: "resultant", label: `ΣF = ${format(vals.R, "N")} ≠ 0` });
    }
  }

  if (opts.guesses) shapes.push(...coupleShadow(setup, result, opts.guesses, { k, size, center: momentCenter(setup) }));
  if (about) shapes.push({ type: "point", at: setup.about.at, label: setup.about.label || "P", style: "ring" });
  // A curved moment arrow drawn on a plate (the student's "your couple", a
  // revealed couple moment …) stays inside that plate.
  for (const s of shapes) {
    if (s.type !== "moment") continue;
    const p = (setup.plates || []).find((q) => between(s.center[0], q.from[0], q.to[0]) && between(s.center[1], q.from[1], q.to[1]));
    if (p) s.maxR = 0.4 * Math.min(Math.abs(p.to[0] - p.from[0]), Math.abs(p.to[1] - p.from[1]));
  }
  return setup.divider != null ? sideBySide(setup, result, shapes, opts) : shapes;
}

// Two parts side by side (e.g. a couple and its replacement): a soft line
// between them at setup.divider, each part centred in its half of the canvas
// (render/panels.js). Each part's width is measured on the fully revealed
// picture (every arrow at its true length, every distance drawn), so it stays
// the same while the student works and when the answer appears.
// setup.frameY is the height to show; setup.frameMargin the space around each part.
function sideBySide(setup, result, shapes, opts) {
  // Measured on the picture both BEFORE and AFTER the answer is shown: an
  // unknown force is drawn as a longer "?" arrow until it's solved, and every
  // arrow must stay in its own half either way.
  const base = { ...setup, divider: null };
  const full = [...coupleScene(base, result, { reveal: true, arms: true }), ...coupleScene(base, result, { arms: true })];
  // A shape belongs to the part where it starts (a long arrow may reach past the line).
  const groups = { left: [], right: [] };
  for (const s of full) {
    const start = s.at || s.from || s.center || (s.points && s.points[0]);
    if (!start || s.type === "note") continue;
    const pts = [s.at, s.from, s.to, ...(s.points || [])].filter(Boolean);
    if (s.center) pts.push(add(s.center, [-0.12, 0]), add(s.center, [0.12, 0])); // a curved arrow's size
    groups[start[0] < setup.divider ? "left" : "right"].push(...pts);
  }
  const span = (list) => [Math.min(...list), Math.max(...list)];
  const left = span(groups.left.map((p) => p[0]));
  const right = span(groups.right.map((p) => p[0]));
  const y = setup.frameY || span([...groups.left, ...groups.right].map((p) => p[1]));
  return spreadPanels(shapes, { divider: setup.divider, left, right, y, margin: setup.frameMargin ?? 0.25, size: opts.canvasSize });
}


const between = (v, a, b) => v >= Math.min(a, b) && v <= Math.max(a, b);
