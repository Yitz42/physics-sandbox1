// bearing-stress-scene.js — 2D engineering diagram for bearing stress (Unit 1.3).
//
// Shows two panels:
//   Left:  Connection Elevation — horizontal plate of thickness t with vertical pin of diameter d.
//   Right: Projected Bearing Area — contact rectangle of width d and height t with bearing stress.

import { format } from "../../core/units.js";
import { spreadPanels } from "../../render/panels.js";
import { solveBearingStress } from "./bearing-stress.js";

export function bearingStressScene(setup = {}, result, opts = {}) {
  const res = result || solveBearingStress(setup);
  const v = res.values;
  const reveal = !!opts.reveal;
  const joint = setup.joint || {};

  const dVal = v.d ?? 20;
  const tVal = v.t ?? 12;

  const shapes = [];

  // =========================================================================
  // GEOMETRY & SCALE
  // =========================================================================
  // Pin diameter in canvas world metres (scaled smoothly with diameter)
  const pinW = 0.36 * Math.max(0.5, Math.min(1.6, dVal / 20));

  // Plate thickness in canvas world metres (scaled smoothly with thickness)
  const tH = 0.28 * Math.max(0.5, Math.min(1.6, tVal / 12));

  const plateLen = 1.35;
  const pinH = tH + 0.38;

  // =========================================================================
  // LEFT PANEL: Connection Elevation
  // =========================================================================
  // Main plate extending to the right
  shapes.push({
    type: "box",
    layer: "zone",
    at: [plateLen / 2, 0],
    w: plateLen,
    h: tH,
    passable: true,
  });

  // Vertical pin passing through the plate at x = 0
  shapes.push({
    type: "box",
    at: [0, 0],
    w: pinW,
    h: pinH,
    fill: "#c8ccd4", // metallic steel pin
    passable: true,
  });

  // Pin centerlines
  shapes.push({
    type: "line",
    from: [0, -pinH / 2 - 0.12],
    to: [0, pinH / 2 + 0.12],
    dashed: true,
    style: "reference",
  });

  // Tensile force P pulling the plate right
  const arrowLen = 0.65;
  shapes.push({
    type: "arrow",
    id: "P",
    from: [plateLen, 0],
    to: [plateLen + arrowLen, 0],
    role: "known",
    label: `P = ${format(v.P, "kN")}`,
  });

  // Reaction force on the pin to the left
  shapes.push({
    type: "arrow",
    from: [-pinW / 2, 0],
    to: [-pinW / 2 - arrowLen, 0],
    role: "known",
    label: `P = ${format(v.P, "kN")}`,
  });

  // Pin diameter drafting leader arrow
  shapes.push({
    type: "leader",
    at: [-pinW / 2, pinH / 2 - 0.05],
    dir: [-0.75, 0.7],
    label: `Pin ⌀ ${dVal} mm`,
  });

  // Plate thickness dimension line on left panel
  shapes.push({
    type: "dim",
    from: [plateLen + 0.12, -tH / 2],
    to: [plateLen + 0.12, tH / 2],
    label: `t = ${tVal} mm`,
  });

  // Left panel caption
  shapes.push({
    type: "text",
    at: [plateLen / 2 - 0.2, -pinH / 2 - 0.25],
    text: "Connection Elevation",
    caption: true,
  });

  // =========================================================================
  // RIGHT PANEL: Projected Bearing Area A_b = t · d
  // =========================================================================
  const dividerX = plateLen + 1.1;
  const xR = plateLen + 2.5;

  // The projected bearing area is a flat rectangle of width d and height t
  // representing the projected contact surface.
  shapes.push({
    type: "box",
    at: [xR, 0],
    w: pinW,
    h: tH,
    fill: "#dce0e8",
    hatched: true,
    passable: true,
  });

  // Bearing pressure distribution arrows pushing into the projected area
  const stressArrowLen = 0.38;
  const arrowYs = [-tH / 3, 0, tH / 3];
  arrowYs.forEach((y, i) => {
    shapes.push({
      type: "arrow",
      from: [xR - pinW / 2 - stressArrowLen, y],
      to: [xR - pinW / 2, y],
      role: "known",
      label: i === 1 ? (reveal ? `σ_b = ${v.sigma_b.toFixed(1)} MPa` : "Bearing stress σ_b") : undefined,
    });
  });

  // Dimension for projected width d (below rectangle)
  shapes.push({
    type: "dim",
    from: [xR - pinW / 2, -tH / 2 - 0.14],
    to: [xR + pinW / 2, -tH / 2 - 0.14],
    label: `d = ${dVal} mm`,
  });

  // Dimension for thickness t (right of rectangle)
  shapes.push({
    type: "dim",
    from: [xR + pinW / 2 + 0.14, -tH / 2],
    to: [xR + pinW / 2 + 0.14, tH / 2],
    label: `t = ${tVal} mm`,
  });

  // Right panel caption
  shapes.push({
    type: "text",
    at: [xR, -pinH / 2 - 0.25],
    text: "Projected Bearing Area (A_b = t · d)",
    caption: true,
  });

  // =========================================================================
  // CORNER NOTE
  // =========================================================================
  const noteLines = [];
  noteLines.push("Pinned Connection");
  noteLines.push(`Pin: ⌀ ${dVal} mm, Plate: t = ${tVal} mm`);
  // (A_b is asked for in the predict, build and solve stages: only once revealed.)
  if (reveal) noteLines.push(`A_b = t · d = ${v.A_b.toFixed(0)} mm²`);
  if (joint.allowableStress != null) noteLines.push(`σ_allow = ${joint.allowableStress} MPa`);
  if (reveal && v.sigma_b != null) {
    noteLines.push(`σ_b = ${v.sigma_b.toFixed(1)} MPa`);
  }
  shapes.push({
    type: "note",
    lines: noteLines,
  });

  // =========================================================================
  // SPREAD PANELS
  // =========================================================================
  const leftReach = [-pinW / 2 - arrowLen - 0.35, plateLen + arrowLen + 0.35];
  const rightReach = [xR - pinW / 2 - stressArrowLen - 0.45, xR + pinW / 2 + 0.55];
  const yReach = [-pinH / 2 - 0.35, pinH / 2 + 0.35];

  return spreadPanels(shapes, {
    divider: dividerX,
    left: leftReach,
    right: rightReach,
    y: yReach,
    margin: 0.35,
    size: opts.canvasSize,
  });
}
