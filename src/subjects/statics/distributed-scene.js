// distributed-scene.js — the picture for distributed loads (Unit 6).
//
// Draws the beam, each distributed load as its load curve (a row of small
// arrows under an outline), any point loads, and — when asked —
//   • the pieces a load is split into (a trapezoid → rectangle + triangle),
//     each with its own resultant at its centroid (grey, dashed),
//   • the single resultant F_R at x̄ (purple), with x̄ measured from O,
//   • a faint red "shadow" of the student's wrong F_R and x̄.
// Also used by the rigid-body picture (Unit 7 on) to draw loads on its bodies.

import { format } from "../../core/units.js";
import { magnitudeOf } from "./particle.js";
import { intensityAt, endValues, endSymbols, loadSymbol, spanSymbol } from "./distributed-loads.js";
import { solveDistributed } from "./distributed.js";
import { distributedShadow } from "./distributed-tools.js";

// Overall size of the picture (the beam's length, or the loads' reach).
export function beamSize(setup) {
  const xs = [(setup.about ? setup.about.at[0] : 0), ...((setup.body && setup.body.points) || []).map((p) => p[0]), ...(setup.loads || []).flatMap((l) => [l.from, l.to])];
  return xs.length ? Math.max(...xs) - Math.min(...xs) || 1 : 1;
}

// Picture metres per N/m of load: setup.loadScale (N/m drawn per metre), or the
// biggest load drawn 0.22 of the picture's size tall.
export function heightPerLoad(setup, size = beamSize(setup)) {
  if (setup.loadScale) return 1 / setup.loadScale;
  const biggest = Math.max(1, ...(setup.loads || []).map((l) => Math.max(...endValues(l))));
  return (0.22 * size) / biggest;
}

// "w_0" → "w₀"-style canvas label text (the renderer turns _0 into a subscript).
const plainSym = (s) => String(s).replace(/[{}]/g, "");

// Drawing of one distributed load (a "distload" shape, see render/loads.js).
export function loadShape(load, H, opts = {}) {
  const y = load.y ?? 0;
  const n = load.shape === "power" ? 40 : 1; // curves need many points; straight lines two
  const profile = [];
  for (let i = 0; i <= n; i++) {
    const x = load.from + ((load.to - load.from) * i) / n;
    profile.push([x, y + intensityAt(load, x) * H]);
  }
  const [a, b] = endValues(load);
  const [sa, sb] = endSymbols(load);
  const labels = [];
  const lab = (x, sym, w) => labels.push({ at: [x, y + w * H], text: `${plainSym(sym)} = ${format(w, "N/m")}` });
  if (load.shape === "uniform") lab((load.from + load.to) / 2, loadSymbol(load), a);
  else if (load.shape === "linear") {
    if (a > 0) lab(load.from, sa, a);
    if (b > 0) lab(load.to, sb, b);
  } else {
    lab(a > b ? load.from : load.to, loadSymbol(load), Math.max(a, b));
  }
  if (load.shape === "power") {
    // The curve's equation, beside the curve near its middle.
    const L = spanSymbol(load);
    // In the empty space above the curve's low end.
    const xm = load.peak === "left" ? load.to - 0.3 * (load.to - load.from) : load.from + 0.3 * (load.to - load.from);
    labels.push({ at: [xm, y + 0.55 * load.w * H], text: `w = ${plainSym(loadSymbol(load))}(x/${L})${load.n === 2 ? "²" : load.n === 3 ? "³" : "^" + load.n}` });
  }
  // A trapezoid split into a rectangle and a triangle: a dashed line between them.
  const splits = opts.parts && a > 0 && b > 0 && Math.abs(a - b) > 1e-9 ? [[[load.from, y + Math.min(a, b) * H], [load.to, y + Math.min(a, b) * H]]] : [];
  return { type: "distload", id: load.id, profile, base: y, labels, splits, alpha: opts.alpha };
}

// opts: { reveal, parts (show the pieces), guesses }
export function distributedScene(setup, result, opts = {}) {
  const res = result || solveDistributed(setup);
  const v = res.values;
  const size = beamSize(setup);
  const H = heightPerLoad(setup, size);
  const O = setup.about ? setup.about.at : [0, 0];
  const y = O[1];
  const shapes = [{ type: "axes" }];
  for (const s of setup.extras || []) shapes.push(s); // e.g. a wheel under the beam
  // The beam: setup.body, or (when a stage's random versions change the load's
  // length) a beam from O to the end of the loads.
  const ends = (setup.loads || []).flatMap((l) => [l.from, l.to]);
  const beam = setup.body ? setup.body.points : [[Math.min(O[0], ...ends), y], [Math.max(O[0], ...ends), y]];
  shapes.push({ type: "beam", points: beam });
  for (const t of setup.texts || []) shapes.push({ type: "text", at: t.at, text: t.text });
  for (const d of setup.dims || []) shapes.push({ type: "dim", from: d.from, to: d.to, label: d.label || format(Math.abs(d.to[0] - d.from[0]) || Math.abs(d.to[1] - d.from[1]), "m"), labelSide: d.side || 1, labelOn: true });

  // setup.loadDims: a dimension under each load, e.g. "L = 4 m".
  if (setup.loadDims) {
    for (const l of setup.loads || []) {
      const dy = (l.y ?? 0) + (setup.loadDimOffset ?? -0.08 * size);
      shapes.push({ type: "dim", from: [l.from, dy], to: [l.to, dy], label: `${l.spanSymbol || "L"} = ${format(l.to - l.from, "m")}`, labelSide: 1, labelOn: true });
    }
  }
  // The pieces a load is split into: always (setup.showParts), or once the answer is shown.
  const showParts = !!(opts.parts || setup.showParts || (opts.reveal && setup.partsOnReveal));
  for (const l of setup.loads || []) shapes.push(loadShape(l, H, { parts: showParts }));
  const top = y + Math.max(0, ...(setup.loads || []).flatMap((l) => endValues(l)).map((w) => w * H)); // highest point of any load

  // Point loads push down on the beam (arrowhead on the beam).
  const biggest = Math.max(1, ...(setup.forces || []).map(magnitudeOf), v.R || 0);
  const len = (F) => Math.max(0.12 * size, Math.min(0.4 * size, (F / biggest) * 0.35 * size));
  for (const f of setup.forces || []) {
    const F = magnitudeOf(f), up = f.direction === "up";
    const tip = [f.at[0], f.at[1]];
    // (Down through a distributed load: it starts above the load, as its own force.)
    const h = up ? 0 : Math.max(0, ...(setup.loads || []).map((l) => intensityAt(l, f.at[0]) * H));
    const L = Math.max(len(F), h > 0 ? h + 0.07 * size : 0);
    shapes.push({ type: "arrow", id: f.id, from: [tip[0], tip[1] + (up ? -1 : 1) * L], to: tip, role: "known", label: `${f.symbol} = ${format(F, "N")}` });
  }

  // The pieces' resultants (grey, dashed), from just above the load down to the
  // beam, and where each acts: a dimension x̃ from O, one row per piece, above
  // the arrows (dashed guide lines lead up to it from O and from each arrow).
  let reach = top - y + 0.14 * size; // how far above the beam the resultant starts
  if (showParts && res.parts.length > 1) {
    const tail = top + 0.04 * size;
    const row = (i) => top + (0.1 + 0.065 * i) * size;
    res.parts.forEach((p, i) => {
      shapes.push({ type: "arrow", id: p.id, from: [p.x, tail], to: [p.x, y], role: "component", label: `${plainSym(p.symbol)} = ${format(p.F, "N")}` });
      shapes.push({ type: "line", from: [p.x, tail], to: [p.x, row(i) + 0.02 * size], style: "reference" });
      shapes.push({ type: "dim", noExt: true, from: [O[0], row(i)], to: [p.x, row(i)], label: `${plainSym(p.xSymbol.replace("\\tilde{x}", "x̃"))} = ${format(Math.abs(p.x - O[0]), "m")}`, labelOn: true });
    });
    const last = row(res.parts.length - 1);
    shapes.push({ type: "line", from: O, to: [O[0], last + 0.02 * size], style: "reference" });
    reach = last - y + 0.06 * size; // F_R starts above the dimensions
  }
  // The single resultant, where it must act.
  if ((opts.reveal || setup.showResultant) && v.pos != null) {
    const x = O[0] + v.pos;
    shapes.push({ type: "arrow", id: "R", from: [x, y + reach + 0.1 * size], to: [x, y], role: "resultant", label: `F_R = ${format(v.R, "N")}` });
    const off = setup.resultantDimOffset ?? -0.14 * size;
    shapes.push({ type: "dim", from: [O[0], y + off], to: [x, y + off], role: "resultant", label: `x̄ = ${format(Math.abs(v.pos), "m")}`, labelOn: true });
  }
  if (opts.guesses) shapes.push(...distributedShadow(setup, res, opts.guesses, { size, y: y, reach, O }));
  if (setup.about && !setup.about.hidden) shapes.push({ type: "point", at: O, label: setup.about.label || "O", style: "ring" });
  return shapes;
}
