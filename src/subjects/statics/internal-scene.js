// internal-scene.js — pictures for internal forces (Units 7.1–7.3).
//
// setup.view:
//   "cut"       (7.1) the beam cut in two at C, the pieces pulled a little apart, as
//               free-body diagrams: supports replaced by their reactions, each piece's
//               loads (a distributed load split at the cut), and on the KEPT piece's cut
//               face N, V and M drawn in their positive directions (tension; down on a
//               left piece's face, up on a right piece's; a smile). The other piece is faint.
//   "diagrams"  (7.2, 7.3) the beam with its loads and reactions, and under it the
//               shear diagram V and the bending-moment diagram M, lined up with it.
//               setup.cut: a section line through all three (7.3's slider), with its values.
//               setup.showSegments: the segment boundaries, dashed, and segment numbers.
// opts: { reveal } — reactions and values shown once the answer is revealed
// (setup.knownReactions: the reactions are given from the start).

import { add, sub, scale, mag, unit } from "../../core/vector.js";
import { format } from "../../core/units.js";
import { placeArrow } from "../../render/fbd.js";
import { magnitudeOf, directionOf } from "./particle.js";
import { directionVector } from "./directions.js";
import { allReactions } from "./supports.js";
import { bodySize, weightOf, outwardAt } from "./rigid-body.js";
import { rigidBodyScene, lengthPerNewton } from "./rigid-body-scene.js";
import { loadShape, heightPerLoad } from "./distributed-scene.js";
import { solveInternal, loadPortion, beamY, beamEnds, evalPoly, eventPoints } from "./internal.js";

export function internalScene(setup, result, opts = {}) {
  const res = result || solveInternal(setup);
  if (setup.view === "cut") return cutScene(setup, res, opts);
  return diagramScene(setup, res, opts);
}

const knownNow = (setup, res, opts) => res.status === "determinate" && (opts.reveal || setup.knownReactions);

// ---- 7.1: the beam cut at C ------------------------------------------------------------

function cutScene(setup, res, opts) {
  const size = bodySize(setup);
  const [x0, x1] = beamEnds(setup);
  const y = beamY(setup);
  const x = setup.cut;
  const keep = setup.keep === "right" ? "right" : "left";
  const gap = setup.cutGap ?? 0.28 * size; // how far apart the two pieces are drawn
  const shift = (side) => (side === "left" ? -gap / 2 : gap / 2);
  const sideOf = (xi) => (xi < x ? "left" : "right");
  const at = (p, side = sideOf(p[0])) => [p[0] + shift(side), p[1]];
  const faint = (side) => side !== keep;
  const rb = res.rigid || res;
  const k = lengthPerNewton(setup, rb, size);
  const known = knownNow(setup, res, opts);
  const shapes = [{ type: "axes" }];

  // The two pieces.
  for (const side of ["left", "right"]) {
    const a = side === "left" ? x0 : x, b = side === "left" ? x : x1;
    shapes.push({ type: "beam", points: [at([a, y], side), at([b, y], side)], width: 20, ...(faint(side) ? { alpha: 0.3 } : {}) });
  }
  // Where the cut is: C on the kept piece's face.
  const face = at([x, y], keep);
  shapes.push({ type: "point", at: face, label: setup.cutName || "C", style: "dot" });

  // Supports (faint: their reactions act instead) and reactions.
  for (const s of setup.supports || []) {
    const side = sideOf(s.at[0]);
    shapes.push({ type: "supportSymbol", kind: s.type, at: at(s.at, side), normal: s.normal || [0, 1], label: s.id, alpha: faint(side) ? 0.12 : 0.28 });
  }
  for (const r of allReactions(setup)) {
    const side = sideOf(r.at[0]);
    const v = known ? res.values[r.id] : null;
    const alpha = faint(side) ? { alpha: 0.3 } : {};
    if (r.moment) {
      shapes.push({ type: "moment", id: r.id, center: at(r.at, side), sense: v == null ? r.sense : Math.sign(v) || 1, rPx: 24, role: "unknown", label: `${r.symbol} = ${v == null ? "?" : format(Math.abs(v), "N·m")}`, ...alpha });
      continue;
    }
    const dir = v != null && v < 0 ? scale(r.dir, -1) : r.dir;
    const len = v == null ? 0.2 * size : Math.max(0.1 * size, Math.abs(v) * k);
    shapes.push({ type: "arrow", id: r.id, ...placeArrow(at(r.at, side), dir, len, outwardAt(setup, { ...r, dir })), role: "unknown", label: `${r.symbol} = ${v == null ? "?" : format(Math.abs(v), "N")}`, ...alpha });
  }
  // Loads on each piece.
  for (const f of setup.forces || []) {
    const side = sideOf(f.at[0]);
    const len = Math.max(0.1 * size, magnitudeOf(f) * k);
    const u = directionOf(f);
    const p = at(f.at, side);
    const tail = f.push ? add(p, scale(u, -len)) : p;
    shapes.push({ type: "arrow", id: f.id, from: tail, to: add(tail, scale(u, len)), role: "known", label: `${f.symbol} = ${format(magnitudeOf(f), "N")}`, ...(faint(side) ? { alpha: 0.3 } : {}) });
  }
  const H = heightPerLoad(setup, size);
  for (const l of setup.loads || []) {
    for (const side of ["left", "right"]) {
      const part = side === "left" ? loadPortion(l, -Infinity, x) : loadPortion(l, x, Infinity);
      if (!part) continue;
      const moved = { ...part, from: part.from + shift(side), to: part.to + shift(side) };
      const sh = loadShape(moved, H, faint(side) ? { alpha: 0.3 } : {});
      if (faint(side)) sh.labels = [];
      shapes.push(sh);
    }
  }
  for (const m of setup.moments || []) {
    const side = sideOf(m.at[0]);
    shapes.push({ type: "moment", id: m.id, center: at(m.at, side), sense: m.sense, rPx: 28, role: "known", label: `${m.symbol} = ${format(m.magnitude, "N·m")}`, ...(faint(side) ? { alpha: 0.3 } : {}) });
  }
  const W = weightOf(setup);
  if (W) {
    const side = sideOf(W.at[0]);
    shapes.push({ type: "arrow", id: "W", ...placeArrow(at(W.at, side), [0, -1], Math.max(0.1 * size, magnitudeOf(W) * k), [0, -1]), role: "known", label: `W = ${format(magnitudeOf(W), "N")}`, ...(faint(side) ? { alpha: 0.3 } : {}) });
  }

  // N, V, M on the kept piece's cut face, in their POSITIVE directions (values signed).
  const s = keep === "left" ? 1 : -1;
  const shown = opts.reveal && res.status === "determinate";
  const val = (id, u) => (shown ? format(res.values[id], u) : "?");
  const len = 0.14 * size;
  shapes.push({ type: "arrow", id: "N", from: face, to: add(face, [s * len, 0]), role: "unknown", label: `N = ${val("N", "N")}` });
  shapes.push({ type: "arrow", id: "V", from: face, to: add(face, [0, -s * len]), role: "unknown", label: `V = ${val("V", "N")}` });
  shapes.push({ type: "moment", id: "M", center: face, sense: s, rPx: 26, role: "unknown", label: `M = ${val("M", "N·m")}` });
  // Dimensions under each piece: a chain between its ends, supports, loads and the cut.
  if (!setup.dims) {
    const xs = [x0, x1, x, ...(setup.supports || []).map((q) => q.at[0]), ...(setup.forces || []).map((f) => f.at[0])];
    for (const l of setup.loads || []) xs.push(l.from, l.to);
    const stops = [...new Set(xs.map((v) => +v.toFixed(6)))].sort((p, q) => p - q);
    const row = y - 0.2 * size;
    for (let i = 1; i < stops.length; i++) {
      const [p, q] = [stops[i - 1], stops[i]];
      const side = p < x - 1e-9 ? "left" : "right";
      shapes.push({ type: "dim", from: [p + shift(side), row], to: [q + shift(side), row], label: format(q - p, "m") });
    }
  }
  for (const d of setup.dims || []) shapes.push({ type: "dim", from: at(d.from), to: at(d.to, sideOf(d.from[0])), label: d.label || format(mag(sub(d.to, d.from)), "m") });
  for (const t of setup.texts || []) shapes.push({ type: "text", at: at(t.at), text: t.text });
  return shapes;
}

// ---- 7.2, 7.3: shear and moment diagrams ------------------------------------------------------

function diagramScene(setup, res, opts) {
  const rb = res.rigid || res;
  const known = knownNow(setup, res, opts);
  const shapes = rigidBodyScene({ ...setup, showReactions: "always" }, rb, { ...opts, reveal: known });
  if (res.status !== "determinate") return shapes;
  const size = bodySize(setup);
  const [x0, x1] = beamEnds(setup);
  const y = beamY(setup);
  const segs = res.segments;
  const show = opts.reveal || setup.showDiagrams;
  const gapV = setup.plotGap ?? 0.62 * size; // beam → V's zero line
  const gapM = gapV + (setup.plotSpacing ?? 0.5 * size); // beam → M's zero line
  const hV = 0.16 * size, hM = 0.18 * size; // the tallest value's height
  const yV = y - gapV, yM = y - gapM;
  const events = eventPoints(setup, res.actions);

  // Faint guides from the beam down through both diagrams, at every event point.
  const bottom = yM - hM - 0.04 * size;
  for (const e of events) shapes.push({ type: "line", from: [e, y - 0.02 * size], to: [e, bottom], style: "reference" });

  if (show) {
    const Vpeak = Math.max(1e-9, ...segs.flatMap((s) => sample(s.V, s.a, s.b).map((p) => Math.abs(p[1]))));
    const Mpeak = Math.max(1e-9, ...segs.flatMap((s) => sample(s.M, s.a, s.b).map((p) => Math.abs(p[1]))));
    shapes.push(plotShape(segs, "V", yV, hV / Vpeak, 0, "N", x0, x1, setup));
    shapes.push(plotShape(segs, "M", yM, hM / Mpeak, 1, "N·m", x0, x1, setup));
  } else {
    // Before the answer: just the two zero lines, named, to sketch on.
    shapes.push({ type: "plot", points: [[x0, yV], [x1, yV]], base: yV, name: "V", tint: 0, marks: [] });
    shapes.push({ type: "plot", points: [[x0, yM], [x1, yM]], base: yM, name: "M", tint: 1, marks: [] });
  }
  if (setup.showSegments) {
    segs.forEach((s, i) => shapes.push({ type: "text", at: [(s.a + s.b) / 2, y - gapV + hV + 0.1 * size], text: `${i + 1}` }));
  }
  // 7.3's section line at x, with V(x) and M(x) marked.
  if (setup.cut != null) {
    const xc = setup.cut;
    shapes.push({ type: "line", from: [xc, y + 0.12 * size], to: [xc, bottom], style: "dashed" });
  }
  return shapes;
}

// Points along one polynomial (enough for a smooth curve).
function sample(p, a, b, n = 24) {
  const out = [];
  for (let i = 0; i <= n; i++) {
    const x = a + ((b - a) * i) / n;
    out.push([x, evalPoly(p, x)]);
  }
  return out;
}

// One diagram as a "plot" shape: the curve (jumps where segments meet), and a value at
// each segment end and at each peak inside a segment (where V = 0 for M).
function plotShape(segs, which, base, perUnit, tint, unitName, x0, x1, setup) {
  const pts = [[x0, base]];
  const marks = [];
  const mark = (x, v) => {
    if (Math.abs(v) < 1e-6) return;
    if (marks.some((m) => Math.abs(m.x - x) < 1e-6 && Math.abs(m.v - v) < 1e-6)) return;
    marks.push({ x, v, at: [x, base + v * perUnit], text: format(v, unitName), below: v < 0 });
  };
  for (const s of segs) {
    const poly = s[which];
    for (const [x, v] of sample(poly, s.a, s.b)) pts.push([x, base + v * perUnit]);
    mark(s.a, evalPoly(poly, s.a));
    mark(s.b, evalPoly(poly, s.b));
    if (which === "M") for (const r of rootsOfV(s)) mark(r, evalPoly(poly, r));
  }
  pts.push([x1, base]);
  // Two values at the same x (a jump): the one before above-left, the one after above-right.
  return { type: "plot", points: pts, base, name: which, tint, marks: marks.map(({ at, text, below }) => ({ at, text, below })) };
}

function rootsOfV(s) {
  const [c, b, a] = s.V;
  const r = [];
  if (Math.abs(a) < 1e-12) { if (Math.abs(b) > 1e-12) r.push(-c / b); }
  else {
    const d = b * b - 4 * a * c;
    if (d >= 0) r.push((-b + Math.sqrt(d)) / (2 * a), (-b - Math.sqrt(d)) / (2 * a));
  }
  return r.filter((x) => x > s.a + 1e-6 && x < s.b - 1e-6);
}
