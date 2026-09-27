// centroid.js — centroids of composite shapes, and centres of gravity (Unit 6.1).
//
// Split the shape into simple parts whose area A and centroid (x̃, ỹ) are known,
// then:   A = ΣA_i,   A x̄ = Σ x̃_i A_i,   A ȳ = Σ ỹ_i A_i.
// A body made of parts of different weights has its centre of gravity where its
// weight acts:   W = ΣW_i,   W x̄ = Σ x̃_i W_i  (setup.weigh: each part's mass).
//
// setup = {
//   parts: [                                                 (lengths in m, from the origin O)
//     { id: "1", shape: "rect", at: [x0, y0], w, h }         lower-left corner at `at`
//     { id: "2", shape: "tri",  at: [x0, y0], w, h }         right triangle, its right angle at `at`;
//                                                            legs w along x, h along y (either may be negative)
//     { id: "3", shape: "semi", at: [cx, cy], r, dir }       half circle on a flat edge centred at `at`,
//                                                            bulging "up" | "down" | "left" | "right"
//     { id: "4", shape: "circle", at: [cx, cy], r }          a full circle centred at `at`
//     { id: "5", shape: "quarter", at: [cx, cy], r, dir }    a quarter circle, its square corner at `at`,
//                                                            reaching "ne" | "nw" | "se" | "sw"
//     … mass?: kg (with weigh: true)
//     … hole: true — a hole cut out of the other parts (Unit 6.2): its area counts NEGATIVE,
//                    A = ΣA_i − A_hole, and so do its first moments
//   ],
//   weigh:  true — centre of gravity of parts with masses (W = mg), not the centroid of the area
//   pivot:  x — a pin under the shape at x (build: does it balance?)
//   Drawing only: showParts (each part's centroid), dims (else drawn automatically), texts
// }
// result.values: A_<id>, x_<id>, y_<id> (and W_<id>); A (or W); Qy = Σx̃A, Qx = Σỹ A; xbar, ybar;
// inside (1 if the centroid lies on the material); off = xbar − pivot (with a pivot).

import { sigFig } from "../../core/units.js";

const G = 9.81;
const SEMI = 4 / (3 * Math.PI); // a half circle's centroid: 4r/3π from its flat edge

// A part's area, centroid, outline (a polygon) and names.
export function partInfo(p) {
  if (p.shape === "rect") {
    const [x0, y0] = p.at;
    return { A: p.w * p.h, x: x0 + p.w / 2, y: y0 + p.h / 2, outline: [[x0, y0], [x0 + p.w, y0], [x0 + p.w, y0 + p.h], [x0, y0 + p.h]], kind: "rect" };
  }
  if (p.shape === "tri") {
    const [x0, y0] = p.at;
    return {
      A: Math.abs(p.w * p.h) / 2, x: x0 + p.w / 3, y: y0 + p.h / 3, outline: [[x0, y0], [x0 + p.w, y0], [x0, y0 + p.h]], kind: "tri",
      // The classic slip: ⅓ measured from the wrong end (⅔ from the right angle).
      wrongX: x0 + (2 * p.w) / 3, wrongY: y0 + (2 * p.h) / 3,
    };
  }
  if (p.shape === "semi") {
    const [cx, cy] = p.at, r = p.r;
    const d = { up: [0, 1], down: [0, -1], left: [-1, 0], right: [1, 0] }[p.dir || "up"];
    const a0 = Math.atan2(d[1], d[0]) - Math.PI / 2;
    const outline = [];
    for (let i = 0; i <= 32; i++) outline.push([cx + r * Math.cos(a0 + (Math.PI * i) / 32), cy + r * Math.sin(a0 + (Math.PI * i) / 32)]);
    return {
      A: (Math.PI * r * r) / 2, x: cx + d[0] * SEMI * r, y: cy + d[1] * SEMI * r, outline, kind: "semi",
      // The slip: halfway out (r/2) instead of 4r/3π.
      wrongX: cx + (d[0] * r) / 2, wrongY: cy + (d[1] * r) / 2,
    };
  }
  if (p.shape === "circle") {
    const [cx, cy] = p.at, r = p.r;
    const outline = [];
    for (let i = 0; i < 48; i++) outline.push([cx + r * Math.cos((Math.PI * i) / 24), cy + r * Math.sin((Math.PI * i) / 24)]);
    return { A: Math.PI * r * r, x: cx, y: cy, outline, kind: "circle" };
  }
  if (p.shape === "quarter") {
    // Its square corner at `at`; its two straight edges along the axes toward `dir`.
    const [cx, cy] = p.at, r = p.r;
    const d = { ne: [1, 1], nw: [-1, 1], se: [1, -1], sw: [-1, -1] }[p.dir || "ne"];
    const outline = [[cx, cy]];
    for (let i = 0; i <= 16; i++) {
      const a = (Math.PI / 2) * (i / 16);
      outline.push([cx + d[0] * r * Math.cos(a), cy + d[1] * r * Math.sin(a)]);
    }
    return {
      A: (Math.PI * r * r) / 4, x: cx + d[0] * SEMI * r, y: cy + d[1] * SEMI * r, outline, kind: "quarter",
      // The slip: halfway along each edge (r/2) instead of 4r/3π.
      wrongX: cx + (d[0] * r) / 2, wrongY: cy + (d[1] * r) / 2,
    };
  }
  throw new Error(`Unknown part shape "${p.shape}"`);
}

const numM = (v) => `(${sigFig(v, 4)}\\,\\text{m})`;

// The three equations: the total, and the two first moments.
export function centroidEquations(setup) {
  const weigh = !!setup.weigh;
  const Q = weigh ? "W" : "A", unit = weigh ? "N" : "m²";
  const size = (p, i) => (weigh ? p.mass * G : i.A);
  const sum = { id: "A", lhs: `${Q} = \\Sigma ${Q}_i`, title: `${Q}`, form: "define", terms: [], result: { value: 0, unit } };
  const my = { id: "Qy", lhs: `${Q}\\,\\bar{x} = \\Sigma \\tilde{x}_i ${Q}_i`, title: `${Q}\\,\\bar{x}`, form: "define", terms: [], result: { value: 0, unit: `${unit}·m`.replace("m²·m", "m³") } };
  const mx = { id: "Qx", lhs: `${Q}\\,\\bar{y} = \\Sigma \\tilde{y}_i ${Q}_i`, title: `${Q}\\,\\bar{y}`, form: "define", terms: [], result: { value: 0, unit: `${unit}·m`.replace("m²·m", "m³") } };
  for (const p of setup.parts || []) {
    const i = partInfo(p);
    const sym = `${Q}_{${p.id}}`;
    const v = size(p, i);
    const hs = p.hole ? -1 : 1; // a hole's area (and its first moments) are taken away
    const term = { id: p.id, sign: hs, symbol: sym, value: v, unit };
    sum.terms.push(term);
    const arm = (value, wrong, axis) => {
      const f = { tex: `\\,\\tilde{${axis}}_{${p.id}}`, numTex: numM(value), value: Math.abs(value) };
      if (wrong != null && Math.abs(wrong - value) > 1e-9) {
        Object.assign(f, {
          alt: { tex: f.tex, numTex: numM(wrong), value: Math.abs(wrong) },
          swapLabel: i.kind === "tri" ? "Measure ⅓ from the right angle" : "Use 4r/3π from the flat edge",
          swapReason: i.kind === "tri" ? "puts the triangle's centroid ⅓ from the wrong end — it's ⅓ of each leg from the RIGHT ANGLE"
            : `puts the ${i.kind === "quarter" ? "quarter" : "half"} circle's centroid halfway out — it's 4r/3π from ${i.kind === "quarter" ? "each straight edge" : "the flat edge"}`,
          swapKind: "centroid",
        });
      }
      return f;
    };
    my.terms.push({ ...term, sign: hs * (Math.sign(i.x) || 1), factor: arm(i.x, i.wrongX, "x") });
    mx.terms.push({ ...term, sign: hs * (Math.sign(i.y) || 1), factor: arm(i.y, i.wrongY, "y") });
  }
  const total = (eq) => eq.terms.reduce((s, t) => s + t.sign * t.value * (t.factor ? t.factor.value : 1), 0);
  for (const e of [sum, my, mx]) e.result.value = total(e);
  return [sum, my, mx];
}

export function solveCentroid(setup) {
  const weigh = !!setup.weigh;
  const values = {};
  let A = 0, Qy = 0, Qx = 0;
  for (const p of setup.parts || []) {
    const i = partInfo(p);
    const a = (weigh ? p.mass * G : i.A) * (p.hole ? -1 : 1); // a hole takes its area away
    values[`A_${p.id}`] = i.A;
    if (weigh) values[`W_${p.id}`] = Math.abs(a);
    values[`x_${p.id}`] = i.x;
    values[`y_${p.id}`] = i.y;
    A += a;
    Qy += i.x * a;
    Qx += i.y * a;
  }
  Object.assign(values, { A, W: A, Qy, Qx, xbar: Qy / A, ybar: Qx / A });
  values.inside = onMaterial(setup.parts || [], [values.xbar, values.ybar]) ? 1 : 0;
  if (setup.pivot != null) values.off = values.xbar - setup.pivot;
  return { status: "resultant", values, equations: centroidEquations(setup), unknowns: [] };
}

// Is a point on the material: inside a solid part, and not inside a hole?
export function onMaterial(parts, pt) {
  const inside = (p) => inPolygon(pt, partInfo(p).outline);
  return parts.some((p) => !p.hole && inside(p)) && !parts.some((p) => p.hole && inside(p));
}

export function inPolygon([x, y], poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

// Names and units for result.values (answer boxes and labels).
export function centroidQuantities(setup) {
  const Q = setup.weigh ? "W" : "A", unit = setup.weigh ? "N" : "m²";
  const q = { A: { label: Q, unit }, W: { label: "W", unit: "N" }, xbar: { label: "\\bar{x}", unit: "m" }, ybar: { label: "\\bar{y}", unit: "m" },
    Qy: { label: `\\Sigma \\tilde{x}${Q}`, unit: setup.weigh ? "N·m" : "m³" }, Qx: { label: `\\Sigma \\tilde{y}${Q}`, unit: setup.weigh ? "N·m" : "m³" },
    off: { label: "\\bar{x} - x_{pin}", unit: "m" } };
  for (const p of setup.parts || []) {
    q[`A_${p.id}`] = { label: `A_{${p.id}}`, unit: "m²" };
    q[`W_${p.id}`] = { label: `W_{${p.id}}`, unit: "N" };
    q[`x_${p.id}`] = { label: `\\tilde{x}_{${p.id}}`, unit: "m" };
    q[`y_${p.id}`] = { label: `\\tilde{y}_{${p.id}}`, unit: "m" };
  }
  return q;
}

// Likely wrong answers for x̄ or ȳ, each with what probably happened.
export function centroidMistakes(setup, name) {
  if (name === "A") return areaMistakes(setup);
  if (name !== "xbar" && name !== "ybar") return [];
  const axis = name === "xbar" ? "x" : "y";
  const weigh = !!setup.weigh;
  const parts = (setup.parts || []).map((p) => ({ p, i: partInfo(p) }));
  // A hole's size counts negative (holeSign: how a slip treats holes: −1 right, +1 added, 0 left out).
  const size = ({ p, i }, holeSign = -1) => (weigh ? p.mass : i.A) * (p.hole ? holeSign : 1);
  const bar = (list, pos, holeSign = -1) => list.reduce((s, x) => s + pos(x) * size(x, holeSign), 0) / list.reduce((s, x) => s + size(x, holeSign), 0);
  const out = [];
  const add = (value, kind, message) => {
    const correct = bar(parts, (x) => x.i[axis]);
    if (Number.isFinite(value) && Math.abs(value - correct) > 1e-6 && !out.some((m) => Math.abs(m.value - value) < 1e-9)) out.push({ value, kind, message });
  };
  if (parts.some((x) => x.p.hole)) {
    add(bar(parts, (x) => x.i[axis], 1), "centroid",
      `It looks like the hole's area was ADDED. A hole is material taken away: subtract its area AND its first moment (${weigh ? "W" : "A"} and ${axis}̃${weigh ? "W" : "A"} both count negative).`);
    add(bar(parts, (x) => x.i[axis], 0), "missing",
      "It looks like the hole was left out. Include it as a part with NEGATIVE area — it moves the centroid away from itself.");
  }
  add(parts.filter((x) => !x.p.hole).reduce((s, x) => s + x.i[axis], 0) / parts.filter((x) => !x.p.hole).length, "concept",
    `That's the plain average of the parts' centroids. Each part counts in proportion to its ${weigh ? "weight" : "area"}: ${name === "xbar" ? "x̄" : "ȳ"} = Σ${axis}̃${weigh ? "W" : "A"} / Σ${weigh ? "W" : "A"}.`);
  const wrongKey = axis === "x" ? "wrongX" : "wrongY";
  if (parts.some((x) => x.i[wrongKey] != null)) {
    add(bar(parts, (x) => (x.i[wrongKey] != null ? x.i[wrongKey] : x.i[axis])), "centroid",
      "Check the triangles and round parts: a right triangle's centroid is ⅓ of each leg from its RIGHT ANGLE, a half (or quarter) circle's is 4r/3π from its flat edge(s).");
  }
  if (!weigh && parts.some((x) => x.i.kind === "tri")) {
    const noHalf = (x) => (x.i.kind === "tri" ? 2 * x.i.A : x.i.A) * (x.p.hole ? -1 : 1);
    const v = parts.reduce((s, x) => s + x.i[axis] * noHalf(x), 0) / parts.reduce((s, x) => s + noHalf(x), 0);
    add(v, "loadArea", "A triangle's area is ½ × base × height — it looks like the ½ is missing.");
  }
  if (weigh) {
    const byArea = parts.reduce((s, x) => s + x.i[axis] * x.i.A * (x.p.hole ? -1 : 1), 0) / parts.reduce((s, x) => s + x.i.A * (x.p.hole ? -1 : 1), 0);
    add(byArea, "weight", "That's the centroid of the AREA. The parts weigh different amounts per square metre, so weigh each by its W (its mass × g), not its area.");
  }
  return out;
}

// Likely wrong total areas: a hole added instead of subtracted, or left out.
function areaMistakes(setup) {
  const parts = (setup.parts || []).map((p) => ({ p, A: partInfo(p).A }));
  if (setup.weigh || !parts.some((x) => x.p.hole)) return [];
  const solid = parts.filter((x) => !x.p.hole).reduce((s, x) => s + x.A, 0);
  const holes = parts.filter((x) => x.p.hole).reduce((s, x) => s + x.A, 0);
  return [
    { value: solid + holes, kind: "sign", message: "That ADDS the hole's area. A hole is material taken away: subtract it." },
    { value: solid, kind: "missing", message: "That's the area without the hole. Take the hole's area away: A = ΣA_solid − A_hole." },
  ];
}
