// centroid-scene.js — the picture of a composite shape (Unit 7.1), and the
// lines under its equations (the textbook's table, in one line per part).
//
// Each part is drawn filled (regions.js) with its number; its own centroid C_1,
// C_2 … as a dot (setup.showParts, or once revealed); the whole shape's centroid
// C (or centre of gravity G, with setup.weigh) as a ring once revealed, with x̄
// and ȳ dimensioned from the origin O. Sizes are dimensioned along the bottom
// and the left side (unless the stage gives its own dims). A pin under the shape
// (setup.pivot) shows whether it balances: the dashed line down from C either
// meets the pin or misses it.

import { format, sigFig } from "../../core/units.js";

// A value with 4 significant figures (centroids are asked to ±0.01 m).
const val = (v, unit) => `${sigFig(v, 4)}\\,\\text{${unit}}`;
import { partInfo, solveCentroid, inPolygon } from "./centroid.js";

export function centroidScene(setup, result, opts = {}) {
  const res = result || solveCentroid(setup);
  const v = res.values;
  const shown = opts.reveal || (setup.alwaysShowCentroid && !opts.preGuess); // (opts.preGuess: not before an explore guess)
  const parts = setup.parts || [];
  const infos = parts.map(partInfo);
  const all = infos.flatMap((i) => i.outline);
  const xs = all.map((p) => p[0]), ys = all.map((p) => p[1]);
  const [xmin, xmax, ymin, ymax] = [Math.min(0, ...xs), Math.max(...xs), Math.min(0, ...ys), Math.max(...ys)];
  const size = Math.max(xmax - xmin, ymax - ymin, 1e-6);
  const shapes = [{ type: "axes" }];
  const G = setup.weigh ? "G" : "C";

  // Each part, with its number (or mass) in the middle — until its centroid C_1, C_2 …
  // is marked there instead.
  // Holes (Unit 7.2) are drawn after the solid parts, cut out of them.
  const dots = setup.showParts || shown;
  const order = parts.map((p, k) => k).sort((a, b) => (parts[a].hole ? 1 : 0) - (parts[b].hole ? 1 : 0));
  for (const k of order) {
    const p = parts[k], i = infos[k];
    const label = setup.weigh && p.mass ? `${p.mass} kg` : p.id;
    const spot = p.hole ? [i.x, i.y] : onPart([i.x, i.y], i, parts, infos);
    shapes.push({ type: "region", points: i.outline, tint: k, hole: !!p.hole, ...(dots && !setup.weigh ? {} : { label, labelAt: dots ? [spot[0], spot[1] + 0.12 * size] : spot }) });
  }
  shapes.push({ type: "point", at: [0, 0], label: "O", style: "dot" });

  // Dimensions: the stage's own, or the parts' corners along the bottom and up the left.
  const dims = setup.dims || autoDims(infos, xmin, xmax, ymin, ymax, size);
  for (const d of dims) shapes.push({ type: "dim", from: d.from, to: d.to, label: d.label || format(Math.hypot(d.to[0] - d.from[0], d.to[1] - d.from[1]), "m") });
  // A round hole's size: its diameter "⌀1 m", on a leader pointing at its edge,
  // slanting up and toward the shape's middle — so the label lands on the
  // material (which labels may cover), not across its outline.
  const mid = [(xmin + xmax) / 2, (ymin + ymax) / 2];
  parts.forEach((p) => {
    if (p.shape !== "circle") return;
    const c = p.at, dx = c[0] - mid[0], dy = c[1] - mid[1];
    const dir = [dx > 1e-6 ? -1 : 1, dy > 0.25 * size ? -1 : 1];
    const at = [c[0] + (dir[0] * p.r) / Math.SQRT2, c[1] + (dir[1] * p.r) / Math.SQRT2];
    shapes.push({ type: "leader", at, dir, label: `⌀${format(2 * p.r, "m")}` });
  });

  // Each part's centroid.
  if (dots) {
    parts.forEach((p, k) => shapes.push({ type: "point", at: [infos[k].x, infos[k].y], label: `${G}_{${p.id}}`, style: "dot" }));
  }
  // The pin it should balance on.
  if (setup.pivot != null) {
    shapes.push({ type: "supportSymbol", kind: "pin", at: [setup.pivot, ymin], normal: [0, 1], label: "" });
  }
  // The whole shape's centroid, and x̄, ȳ from O.
  if (shown) {
    shapes.push({ type: "point", at: [v.xbar, v.ybar], label: G, style: "ring" });
    if (setup.pivot != null) shapes.push({ type: "line", from: [v.xbar, v.ybar], to: [v.xbar, ymin - 0.05 * size], style: "action" });
    // Faint guides from C to the axes: where x̄ and ȳ are measured (their values are
    // under the equations — a dimension this short couldn't hold its label).
    shapes.push({ type: "line", from: [v.xbar, v.ybar], to: [v.xbar, 0], style: "reference" });
    shapes.push({ type: "line", from: [v.xbar, v.ybar], to: [0, v.ybar], style: "reference" });
  }
  for (const t of setup.texts || []) shapes.push({ type: "text", at: t.at, text: t.text });
  return shapes;
}

// Where a solid part's number goes: its centroid — unless that's inside a hole
// (a rounded end around a pin hole), then out from the hole's centre, halfway
// across the material between the hole's edge and the part's own edge.
function onPart(pt, info, parts, infos) {
  const holes = infos.filter((h, k) => parts[k].hole && inPolygon(pt, h.outline));
  if (!holes.length) return pt;
  const h = holes[0];
  let u = [pt[0] - h.x, pt[1] - h.y];
  const n = Math.hypot(u[0], u[1]);
  u = n > 1e-9 ? [u[0] / n, u[1] / n] : [1, 0];
  const at = (t) => [pt[0] + u[0] * t, pt[1] + u[1] * t];
  const span = Math.max(...info.outline.map((q) => Math.hypot(q[0] - pt[0], q[1] - pt[1])));
  let t1 = null, t2 = null;
  for (let t = 0; t <= span; t += span / 200) {
    const q = at(t);
    const inHole = infos.some((x, k) => parts[k].hole && inPolygon(q, x.outline));
    if (t1 == null && !inHole) t1 = t;
    if (t1 != null && !inPolygon(q, info.outline)) { t2 = t; break; }
  }
  return t1 == null ? pt : at((t1 + (t2 ?? span)) / 2);
}

// A chain of dimensions along the bottom (every distinct x of the parts' corners)
// and up the left side (every distinct y), like a drawing's.
function autoDims(infos, xmin, xmax, ymin, ymax, size) {
  // A round part's "corners": a half circle's ends and top, a quarter's corner and ends,
  // a full circle's centre (its size is its diameter, drawn across it).
  const corners = infos.flatMap((i) => (i.kind === "semi" ? [i.outline[0], i.outline[16], i.outline[32]]
    : i.kind === "quarter" ? [i.outline[0], i.outline[1], i.outline[17]]
      : i.kind === "circle" ? [[i.x, i.y]] : i.outline));
  const stops = (vals) => [...new Set(vals.map((x) => +x.toFixed(6)))].sort((a, b) => a - b);
  const sx = stops(corners.map((p) => p[0])), sy = stops(corners.map((p) => p[1]));
  const out = [];
  const yRow = ymin - 0.14 * size, xCol = xmin - 0.14 * size;
  for (let k = 1; k < sx.length; k++) out.push({ from: [sx[k - 1], yRow], to: [sx[k], yRow] });
  for (let k = 1; k < sy.length; k++) out.push({ from: [xCol, sy[k - 1]], to: [xCol, sy[k]] });
  return out;
}

// The table, one line per part: A (or W), x̃, ỹ; then x̄ = ΣxA/ΣA and ȳ.
export function centroidSummary(setup, result, { reveal = true } = {}) {
  const v = result.values;
  const Q = setup.weigh ? "W" : "A", unit = setup.weigh ? "N" : "m²";
  const lines = [];
  if (setup.showTable !== false && (reveal || setup.showTable)) {
    for (const p of setup.parts || []) {
      const i = partInfo(p);
      const q = setup.weigh ? p.mass * 9.81 : i.A;
      lines.push(`\\text{Part ${p.id}${p.hole ? " (hole, subtract)" : ""}: } ${Q}_{${p.id}} = ${val(q, unit)},\\quad \\tilde{x}_{${p.id}} = ${val(i.x, "m")},\\quad \\tilde{y}_{${p.id}} = ${val(i.y, "m")}`);
    }
  }
  if (reveal) {
    lines.push(`\\bar{x} = \\dfrac{\\Sigma \\tilde{x}${Q}}{\\Sigma ${Q}} = ${val(v.xbar, "m")},\\qquad \\bar{y} = \\dfrac{\\Sigma \\tilde{y}${Q}}{\\Sigma ${Q}} = ${val(v.ybar, "m")}`);
    if (setup.pivot != null) {
      lines.push(Math.abs(v.off) < (setup.balanceTolerance ?? 0.02) + 1e-9
        ? `\\text{${setup.weigh ? "G" : "C"} is right above the pin: it balances.}`
        : `\\text{${setup.weigh ? "G" : "C"} is ${Math.abs(v.off).toFixed(2)} m ${v.off > 0 ? "right" : "left"} of the pin: it tips ${v.off > 0 ? "clockwise" : "counterclockwise"}.}`);
    }
  }
  return lines;
}
