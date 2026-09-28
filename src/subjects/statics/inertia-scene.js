// inertia-scene.js — the picture of a beam's cross-section (Unit 10.1): its parts drawn as
// for a composite shape (centroid-scene.js, in mm), and the axis it bends about — the
// horizontal line through its centroid C, once revealed (or always, setup.showAxis). A stage
// that asks about another axis (setup.axis, e.g. the base) has that line drawn too, labelled.

import { centroidScene } from "./centroid-scene.js";
import { partsOf, solveInertia } from "./inertia.js";
import { partInfo } from "./centroid.js";

export function inertiaScene(setup, result, opts = {}) {
  const res = result || solveInertia(setup);
  const v = res.values;
  const parts = partsOf(setup);
  const shown = opts.reveal || setup.showAxis;
  // The section itself (C and its guides only once revealed).
  const shapes = centroidScene({ ...setup, parts, lengthUnit: "mm", showParts: setup.showParts }, { values: { ...v } }, { ...opts, reveal: shown && !opts.preGuess });
  const xs = parts.flatMap((p) => partInfo(p).outline.map((q) => q[0]));
  const x0 = Math.min(0, ...xs), x1 = Math.max(...xs), span = x1 - x0;
  // The bending axis through C: a faint dashed line reaching past both sides, named at its right end.
  if (shown && !opts.preGuess) {
    shapes.push({ type: "line", from: [x0 - 0.12 * span, v.ybar], to: [x1 + 0.12 * span, v.ybar], style: "action" });
    shapes.push({ type: "text", at: [x1 + 0.22 * span, v.ybar], text: "x̄" });
  }
  if (setup.axis && setup.axis.y != null) {
    shapes.push({ type: "line", from: [x0 - 0.12 * span, setup.axis.y], to: [x1 + 0.12 * span, setup.axis.y], style: "reference" });
    shapes.push({ type: "text", at: [x1 + 0.25 * span, setup.axis.y], text: setup.axis.name || "axis" });
  }
  // A design's limits (the build stage): in the key, since they change between versions.
  if (setup.limits) shapes.push({ type: "note", lines: [`area ≤ ${setup.limits.A} mm²`, `Ī_x ≥ ${setup.limits.I} ×10⁶ mm⁴`] });
  return shapes;
}
