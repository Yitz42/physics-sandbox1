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
import { loadShape, heightPerLoad } from "./distributed-scene.js";
import { rigidBodyShadow } from "./rigid-body-tools.js";

// Picture metres per newton: the biggest force drawn 0.3 of the body's size.
export function lengthPerNewton(setup, result, size) {
  const known = knownForces(setup).filter((f) => !f.fromLoad).map(magnitudeOf);
  const reactions = result && result.status === "determinate" ? (result.unknowns || []).map((id) => Math.abs(result.values[id] || 0)) : [];
  return (0.3 * size) / Math.max(1, ...known, ...reactions);
}

export function rigidBodyScene(setup, result, opts = {}) {
  const res = result || solveRigidBody(setup);
  const size = bodySize(setup);
  const k = lengthPerNewton(setup, res, size);
  const hide = opts.hide || [];
  const fs = opts.fbdSetup || setup; // the FBD to draw (a wrong one in debug stages)
  const shown = setup.showReactions !== "reveal" || opts.reveal || !!opts.fbdSetup;
  const shapes = [{ type: "axes" }];

  for (const g of setup.grounds || []) shapes.push({ type: "support", from: g.from, to: g.to, normal: g.normal });
  for (const x of setup.extras || []) shapes.push(x);
  if (setup.body && setup.body.points) shapes.push({ type: "beam", points: setup.body.points });
  for (const t of setup.texts || []) shapes.push({ type: "text", at: t.at, text: t.text });
  // setup.massLabel: a caption such as "40 kg beam" that follows the (random) mass.
  if (setup.massLabel && setup.body && setup.body.mass) shapes.push({ type: "text", at: setup.massLabel.at, text: `${setup.body.mass} kg ${setup.massLabel.text || ""}`.trim() });
  for (const d of setup.dims || []) shapes.push({ type: "dim", from: d.from, to: d.to, label: d.label || format(mag(sub(d.to, d.from)), "m"), labelSide: d.side || 1 });
  if (!setup.dims) shapes.push(...autoDims(setup, size));

  // Supports: faint whenever their reactions are drawn (or being drawn by the student).
  const faint = shown || hide.length > 0;
  for (const s of setup.supports || []) {
    if (s.type === "none") shapes.push({ type: "point", at: s.at, label: s.id, style: "dot" });
    else shapes.push({ type: "supportSymbol", kind: s.type, at: s.at, normal: s.normal || [0, 1], anchor: s.anchor, label: s.id, alpha: faint ? 0.28 : 1 });
  }

  // Loads: point forces (a push has its arrowhead on the body), distributed loads, couples.
  for (const f of setup.forces || []) {
    const len = Math.max(0.1 * size, magnitudeOf(f) * k);
    const u = directionOf(f);
    const tail = f.push ? add(f.at, scale(u, -len)) : f.at;
    shapes.push({ type: "arrow", id: f.id, from: tail, to: add(tail, scale(u, len)), role: "known", label: `${f.symbol} = ${format(magnitudeOf(f), "N")}` });
  }
  const H = heightPerLoad(setup, size);
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
      const len = v == null ? 0.2 * size : Math.max(0.1 * size, Math.abs(v) * k);
      const text = v == null ? "?" : format(Math.abs(v), "N");
      shapes.push({ type: "arrow", id: r.id, ...placeArrow(r.at, dir, len, outwardAt(fs, { ...r, dir })), role: "unknown", label: `${r.symbol} = ${text}` });
    }
  }
  if (opts.guesses) shapes.push(...rigidBodyShadow(setup, res, opts.guesses, { k, size }));
  // setup.showMomentPoint: mark the point moments are taken about (a ring; named
  // unless it's a support, which has its own letter).
  if (setup.showMomentPoint) {
    const P = momentPoint(setup);
    const isSupport = (setup.supports || []).some((q) => q.id === P.label);
    shapes.push({ type: "point", at: P.at, label: isSupport ? "" : P.label, style: "ring" });
  }
  return shapes;
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
  const row1 = y - 0.12 * size, row2 = y - 0.2 * size;
  for (let i = 1; i < stops.length; i++) out.push({ type: "dim", from: [stops[i - 1], row1], to: [stops[i], row1], label: format(stops[i] - stops[i - 1], "m") });
  if (stops.length > 2) out.push({ type: "dim", from: [stops[0], row2], to: [stops[stops.length - 1], row2], label: format(stops[stops.length - 1] - stops[0], "m") });
  return out;
}
