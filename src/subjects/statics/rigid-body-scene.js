// rigid-body-scene.js — the picture for a rigid body on supports (Unit 7 on).
//
// Draws the body, its supports (textbook symbols), its loads and — as on a
// free-body diagram — the reactions that replace the supports, plus the
// body's weight. Whenever the reactions are drawn, the supports fade: on an
// FBD the supports are gone, and their reactions act instead.
//   setup.massLabel: { at, text } a caption "40 kg beam" that follows the mass
//   setup.showReactions: "always" (default: drawn with "?" until solved) or
//                        "reveal" (hidden until the answer is shown, e.g. predict)
//   opts: { reveal, hide: [ids] (the student is drawing these), fbdSetup (draw a
//           deliberately wrong FBD, debug), guesses (a shadow of wrong answers) }

import { add, sub, scale, mag } from "../../core/vector.js";
import { format } from "../../core/units.js";
import { magnitudeOf, directionOf } from "./particle.js";
import { placeArrow } from "../../render/fbd.js";
import { allReactions } from "./supports.js";
import { solveRigidBody, weightOf, knownForces, bodySize, outwardAt, momentPoint } from "./rigid-body.js";
import { pointNamed } from "./rigid-body-sets.js";
import { loadShape, heightPerLoad } from "./distributed-scene.js";
import { intensityAt } from "./distributed-loads.js";
import { rigidBodyShadow } from "./rigid-body-tools.js";
import { concurrency } from "./rigid-body-count.js";
import { angleMarks } from "./particle-scene.js";
import { spreadPanels, shiftShape, panelShift } from "../../render/panels.js";

// Picture metres per newton: the biggest force drawn 0.3 of the body's size
// (setup.arrowSize: another fraction, e.g. shorter arrows above a beam's diagrams).
export function lengthPerNewton(setup, result, size) {
  const known = knownForces(setup).filter((f) => !f.fromLoad).map(magnitudeOf);
  const reactions = result && result.status === "determinate" ? (result.unknowns || []).map((id) => Math.abs(result.values[id] || 0)) : [];
  return ((setup.arrowSize ?? 0.3) * size) / Math.max(1, ...known, ...reactions);
}

// The picture (agreed with the owner): the full MODEL on the left — the body as it
// really is, its supports, loads and dimensions — and on the right its FREE-BODY
// DIAGRAM: the body simplified to a plain thin bar with no details, the supports
// replaced by their reactions (their letters kept), the loads and the weight.
// opts.overlay: the old single picture, the FBD drawn over the sketch with the
// supports faded (the beam above a shear and moment diagram, Unit 8.2, uses it).
export function rigidBodyScene(setup, result, opts = {}) {
  if (opts.overlay) return overlayScene(setup, result, opts);
  const res = result || solveRigidBody(setup);
  const lay = fbdLayout(setup);
  // The sketch: no reactions and no weight arrow (those belong to the FBD).
  const sketch = overlayScene({ ...setup, showReactions: "reveal" }, res, { ...opts, reveal: false, hide: [], fbdSetup: null, guesses: null })
    .filter((sh) => sh.type !== "axes");
  // The FBD only when it's needed: its reactions are shown (or being drawn by the
  // student, or a debug stage's FBD is being checked). Until then — e.g. a predict
  // stage before its answer — the model alone, with a frame of its own.
  const needed = setup.showReactions !== "reveal" || opts.reveal || opts.showFbd || !!opts.fbdSetup || (opts.hide || []).length > 0 || !!opts.guesses;
  if (!needed) {
    const frame = { xmin: lay.left[0], xmax: lay.left[1], ymin: lay.capY + 0.1 * bodySize(setup), ymax: lay.y[1] };
    return [{ type: "axes" }, ...sketch, { type: "frame", frame }];
  }
  // The FBD: everything that acts on the body, on a plain body — nothing else.
  const full = overlayScene(setup, res, opts);
  const extras = new Set(setup.extras || []);
  const fbd = [];
  for (const sh of full) {
    if (sh.type === "axes" || extras.has(sh)) continue;
    if (["support", "supportSymbol", "dim", "text"].includes(sh.type)) continue;
    // (No caption, no details. An end built into a wall stays square, as in the model.)
    if (sh.type === "beam") fbd.push({ type: "beam", points: sh.points, width: 7, flat: wallEnds(setup, sh.points) });
    else fbd.push(sh);
  }
  // The supports' letters stay on the FBD, at their points.
  // (At a wall the body's square end shows the point: the letter alone.)
  for (const q of setup.supports || []) if (q.type !== "none") fbd.push({ type: "point", at: q.at, label: q.id, style: q.type === "fixed" ? "none" : "dot" });
  const captions = [
    { type: "text", at: [(lay.left[0] + lay.left[1]) / 2, lay.capY], text: "Model" },
    { type: "text", at: [(lay.left[0] + lay.left[1]) / 2 + lay.offset, lay.capY], text: "Free-body diagram" },
  ];
  const shapes = [{ type: "axes" }, ...sketch.map((sh) => ({ ...sh, panel: "left" })), ...fbd.map((sh) => ({ ...shiftShape(sh, lay.offset), panel: "right" })),
    { ...captions[0], panel: "left" }, { ...captions[1], panel: "right" }];
  return spreadPanels(shapes, { divider: lay.divider, left: lay.left, right: lay.right, y: lay.y, margin: 0.3, size: opts.canvasSize });
}

// Where the two diagrams go (metres, from the geometry only — not from arrow
// lengths — so revealing an answer never moves the picture): the sketch where the
// setup puts it, the FBD `offset` to its right; each diagram's [xmin, xmax] with
// room for arrows and labels; the divider between them; the captions' height.
export function fbdLayout(setup) {
  const size = bodySize(setup);
  const pts = [...((setup.body && setup.body.points) || []), ...(setup.supports || []).flatMap((q) => [q.at, q.anchor].filter(Boolean)),
    ...(setup.forces || []).map((f) => f.at)];
  for (const l of setup.loads || []) pts.push([l.from, l.y ?? 0], [l.to, l.y ?? 0]);
  for (const x of setup.extras || []) for (const p of [x.at, x.from, x.to, ...(x.points || [])]) if (Array.isArray(p)) pts.push(p);
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  const padX = 0.2 * size, padY = 0.36 * size; // room round each diagram for arrows and their labels
  const x0 = Math.min(...xs) - padX, x1 = Math.max(...xs) + padX;
  const offset = x1 - x0 + 0.12 * size;
  const capY = Math.min(...ys) - 0.66 * size; // (under the model's dimension lines)
  return { offset, left: [x0, x1], right: [x0 + offset, x1 + offset], divider: x1 + 0.06 * size, capY, y: [capY - 0.06 * size, Math.max(...ys) + padY] };
}

// How far the FBD is drawn from where the setup puts the body (metres), for the
// FBD drawing tool: the offset plus the panels' slide for this canvas size.
export function fbdShiftX(setup, sceneOpts = {}) {
  const lay = fbdLayout(setup);
  return lay.offset + panelShift({ divider: lay.divider, left: lay.left, right: lay.right, y: lay.y, margin: 0.3, size: sceneOpts.canvasSize }).dxR;
}

function overlayScene(setup, result, opts = {}) {
  const res = result || solveRigidBody(setup);
  const size = bodySize(setup);
  const k = lengthPerNewton(setup, res, size);
  const hide = opts.hide || [];
  const fs = opts.fbdSetup || setup; // the FBD to draw (a wrong one in debug stages)
  const shown = setup.showReactions !== "reveal" || opts.reveal || !!opts.fbdSetup;
  const shapes = [{ type: "axes" }];

  for (const g of setup.grounds || []) shapes.push({ type: "support", from: g.from, to: g.to, normal: g.normal });
  for (const x of setup.extras || []) shapes.push(x);
  // The body: a wide bar, so its caption fits inside it. setup.massLabel: a
  // caption such as "40 kg beam" that follows the (random) mass, written IN the
  // beam at massLabel.at's x (the stage picks a spot clear of the loads).
  if (setup.body && setup.body.points) {
    const pts = setup.body.points;
    const ml = setup.massLabel && setup.body.mass ? setup.massLabel : null;
    const inside = ml && pts.length === 2 && Math.abs(pts[0][1] - pts[1][1]) < 1e-9;
    shapes.push({ type: "beam", points: pts, width: 20, ...(setup.body.look ? { look: setup.body.look } : {}), ...(inside ? { text: { at: [ml.at[0], pts[0][1]], text: `${setup.body.mass} kg ${ml.text || ""}`.trim() } } : {}) });
    if (ml && !inside) shapes.push({ type: "text", at: ml.at, text: `${setup.body.mass} kg ${ml.text || ""}`.trim() });
  }
  for (const t of setup.texts || []) shapes.push({ type: "text", at: t.at, text: t.text });
  for (const d of roomyDims(setup, size)) shapes.push({ type: "dim", from: d.from, to: d.to, label: d.label || format(mag(sub(d.to, d.from)), "m"), labelSide: d.side || 1 });
  if (!setup.dims) shapes.push(...autoDims(setup, size));

  // Supports: faint whenever their reactions are drawn (or being drawn by the student).
  const faint = shown || hide.length > 0;
  for (const s of setup.supports || []) {
    if (s.type === "none") shapes.push({ type: "point", at: s.at, label: s.id, style: "dot" });
    else shapes.push({ type: "supportSymbol", kind: s.type, at: s.at, normal: s.normal || [0, 1], anchor: s.anchor, anchorLabel: s.anchorLabel, anchorNormal: anchorNormal(setup, s), label: s.id, alpha: faint ? 0.28 : 1 });
  }

  // Loads: point forces (a push has its arrowhead on the body), distributed loads, couples.
  const H = heightPerLoad(setup, size);
  for (const f of setup.forces || []) {
    // A push down through a distributed load starts above the load, so it shows as its own force.
    const over = f.push ? overLoad(setup, f, H, size) : 0;
    const len = Math.max((setup.arrowSize ? 0.06 : 0.1) * size, magnitudeOf(f) * k, over);
    const u = directionOf(f);
    const tail = f.push ? add(f.at, scale(u, -len)) : f.at;
    shapes.push({ type: "arrow", id: f.id, from: tail, to: add(tail, scale(u, len)), role: "known", label: `${f.symbol} = ${format(magnitudeOf(f), "N")}` });
    // A slanted load shows its direction: a slope triangle (3-4-5 …) or an angle,
    // at the arrow's outer end, where there's room (setup.hideAngles turns it off).
    if (!setup.hideAngles) shapes.push(...angleMarks(f, tail, len, 0, { onBody: true }));
  }
  for (const l of setup.loads || []) shapes.push(loadShape(l, H));
  for (const m of setup.moments || []) shapes.push({ type: "moment", id: m.id, center: m.at, sense: m.sense, rPx: 30, role: "known", label: `${m.symbol} = ${format(m.magnitude, "N·m")}` });

  // The weight, at the centre of gravity (part of the FBD).
  const W = weightOf(fs);
  if (W && shown && !hide.includes("W")) {
    const F = magnitudeOf(W);
    shapes.push({ type: "arrow", id: "W", ...placeArrow(W.at, [0, -1], Math.max(0.1 * size, F * k), [0, -1]), role: "known", label: `W = ${format(F, "N")}` });
    shapes.push({ type: "point", at: W.at, label: "", style: "dot" });
  }

  // Reactions: "?" until solved; once solved, drawn the way they really act.
  const solved = opts.reveal && !opts.fbdSetup && res.status === "determinate";
  if (shown) {
    for (const r of allReactions(fs)) {
      if (hide.includes(r.id)) continue;
      const v = solved ? res.values[r.id] : null;
      if (r.moment) {
        const text = v == null ? "?" : format(Math.abs(v), "N·m");
        shapes.push({ type: "moment", id: r.id, center: r.at, sense: v == null ? r.sense : Math.sign(v) || 1, rPx: 24, role: "unknown", label: `${r.symbol} = ${text}` });
        continue;
      }
      const dir = v != null && v < 0 ? scale(r.dir, -1) : r.dir;
      const len = v == null ? (setup.arrowSize ? 0.12 : 0.2) * size : Math.max((setup.arrowSize ? 0.06 : 0.1) * size, Math.abs(v) * k);
      const text = v == null ? "?" : format(Math.abs(v), "N");
      shapes.push({ type: "arrow", id: r.id, ...placeArrow(r.at, dir, len, outwardAt(fs, { ...r, dir })), role: "unknown", label: `${r.symbol} = ${text}` });
    }
  }
  if (opts.guesses) shapes.push(...rigidBodyShadow(setup, res, opts.guesses, { k, size }));
  // setup.showConcurrency: a three-force body's lines of action, meeting at O
  // (faint dashed lines; the pin's force must point along A → O).
  // "reveal": only once the answer is shown (a predict stage's question is O itself).
  if (setup.showConcurrency && (setup.showConcurrency !== "reveal" || opts.reveal)) {
    const c = concurrency(setup);
    if (c) {
      for (const l of c.lines) shapes.push({ type: "line", from: l.from, to: l.to, style: "action" });
      shapes.push({ type: "point", at: c.at, label: "O", style: "ring" });
    }
  }
  // setup.showMomentPoint: mark the point moments are taken about (a ring; named
  // unless it's a support, which has its own letter).
  // With a chosen equation set (setup.sums, Unit 5.3), every moment point in it.
  if (setup.showMomentPoint) {
    const Ps = setup.sums ? setup.sums.filter((q) => q.M).map((q) => pointNamed(setup, q.M)) : [momentPoint(setup)];
    for (const P of Ps) {
      const isSupport = (setup.supports || []).some((q) => q.id === P.label);
      shapes.push({ type: "point", at: P.at, label: isSupport ? "" : P.label, style: "ring" });
    }
  }
  return shapes;
}

// Which way a link's anchor pin faces: s.anchorNormal if given; else, when
// another support is on the same wall (a vertical wall through the anchor),
// that wall's direction — so both pins sit square on the wall; else null
// (the pin lines up with the link).
function anchorNormal(setup, s) {
  if (s.type !== "link" || !s.anchor) return null;
  if (s.anchorNormal) return s.anchorNormal;
  const wall = (setup.supports || []).find((q) => q !== s && q.normal && Math.abs(q.normal[1]) < 1e-9 && Math.abs(q.at[0] - s.anchor[0]) < 1e-9);
  return wall ? wall.normal : null;
}

// A stage that gives no dimensions gets them drawn for it, for a straight
// horizontal beam: a chain of distances between the ends, the supports and
// the point loads (they follow the sliders), plus the overall length below it.
function autoDims(setup, size) {
  const pts = (setup.body && setup.body.points) || [];
  if (pts.length !== 2 || Math.abs(pts[0][1] - pts[1][1]) > 1e-9) return [];
  const y = pts[0][1];
  const on = (P) => Math.abs(P[1] - y) < 1e-9;
  const xs = [pts[0][0], pts[1][0], ...(setup.supports || []).filter((q) => on(q.at)).map((q) => q.at[0]),
    ...(setup.forces || []).filter((f) => on(f.at)).map((f) => f.at[0])];
  for (const l of setup.loads || []) xs.push(l.from, l.to);
  const stops = [...new Set(xs.map((x) => +x.toFixed(6)))].sort((a, b) => a - b);
  const out = [];
  // Rows below the beam — and below any link or cable anchored under it, so a
  // prop doesn't run through the dimension lines.
  const under = (setup.supports || []).filter((q) => (q.type === "link" || q.type === "cable") && q.anchor && q.anchor[1] < y).map((q) => q.anchor[1]);
  const floor = Math.min(y, ...under);
  const row1 = floor - 0.24 * size, row2 = row1 - Math.max(0.09 * size, 0.45); // well below the support symbols (room round the model); rows far enough apart for their labels
  // A link or cable anchored on a wall at the beam's end: its height on the wall.
  for (const q of setup.supports || []) {
    if (!(q.type === "link" || q.type === "cable") || !q.anchor || Math.abs(q.anchor[1] - y) < 1e-9) continue;
    const end = [pts[0][0], pts[1][0]].find((x) => Math.abs(x - q.anchor[0]) < 1e-9);
    if (end == null) continue;
    const side = end === Math.min(pts[0][0], pts[1][0]) ? -1 : 1;
    const x = end + side * 0.1 * size;
    out.push({ type: "dim", from: [x, Math.min(y, q.anchor[1])], to: [x, Math.max(y, q.anchor[1])], label: format(Math.abs(q.anchor[1] - y), "m") });
  }
  for (let i = 1; i < stops.length; i++) out.push({ type: "dim", from: [stops[i - 1], row1], to: [stops[i], row1], label: format(stops[i] - stops[i - 1], "m") });
  if (stops.length > 2) out.push({ type: "dim", from: [stops[0], row2], to: [stops[stops.length - 1], row2], label: format(stops[stops.length - 1] - stops[0], "m") });
  return out;
}

// How long a push must be to start above a distributed load under it (0 if none):
// the load's drawn height where the force acts, and a little more.
export function overLoad(setup, f, H, size) {
  const u = directionOf(f);
  if (u[1] > -0.5) return 0; // (only forces pushing down onto a load)
  const h = Math.max(0, ...(setup.loads || []).filter((l) => Math.abs((l.y ?? 0) - f.at[1]) < 1e-9).map((l) => intensityAt(l, f.at[0]) * H));
  return h > 0 ? (h + 0.07 * size) / -u[1] : 0;
}

// A stage's own dimensions, with room round the model (agreed with the owner): the
// level rows below the body move down together, if need be, so the highest is as far
// below the body and its supports as the automatic ones (0.24 × its size).
function roomyDims(setup, size) {
  const dims = setup.dims || [];
  const body = [...((setup.body && setup.body.points) || []), ...(setup.supports || []).map((q) => q.at)];
  if (!body.length) return dims;
  const floor = Math.min(...body.map((p) => p[1]));
  const below = (d) => Math.abs(d.from[1] - d.to[1]) < 1e-9 && d.from[1] < floor - 1e-9;
  const rows = dims.filter(below).map((d) => d.from[1]);
  if (!rows.length) return dims;
  const drop = Math.max(0, Math.max(...rows) - (floor - 0.24 * size));
  if (drop < 1e-9) return dims;
  return dims.map((d) => (below(d) ? { ...d, from: [d.from[0], d.from[1] - drop], to: [d.to[0], d.to[1] - drop] } : d));
}

// Which ends of a body are built into a wall (a fixed support there): [start, end].
function wallEnds(setup, pts) {
  const fixed = (setup.supports || []).filter((q) => q.type === "fixed").map((q) => q.at);
  const at = (E) => fixed.some((F) => Math.hypot(E[0] - F[0], E[1] - F[1]) < 1e-6);
  return [at(pts[0]), at(pts[pts.length - 1])];
}
