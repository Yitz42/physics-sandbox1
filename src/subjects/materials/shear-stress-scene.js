// shear-stress-scene.js — 2D elevation and cross-section drawing for direct shear (Unit 1.2).

import { format } from "../../core/units.js";
import { spreadPanels } from "../../render/panels.js";
import { solveShearStress } from "./shear-stress.js";

export function shearStressScene(setup = {}, result, opts = {}) {
  const res = result || solveShearStress(setup);
  const v = res.values;
  const reveal = !!opts.reveal;
  const joint = setup.joint || {};
  const isDouble = v.n === 2;
  const dVal = v.d ?? 20;

  const shapes = [];

  // =========================================================================
  // GEOMETRY & SCALE
  // =========================================================================
  // Pin radius in world metres (scale matches cross-section in right panel)
  const R_pin = 0.18 * Math.max(0.4, Math.min(1.8, dVal / 20));
  const pinW = 2 * R_pin;

  const plateLen = 1.3;
  const t_plate = 0.22; // plate thickness in world metres

  // =========================================================================
  // LEFT PANEL: Joint Elevation (Longitudinal View)
  // =========================================================================
  if (isDouble) {
    // -----------------------------------------------------------------------
    // DOUBLE SHEAR (Clevis joint: 3 plates, 2 shear planes)
    // -----------------------------------------------------------------------
    const gap = 0.05;
    const t_center = 0.28;
    const t_outer = 0.18;

    // Center plate (pulled right by load P)
    shapes.push({
      type: "box",
      at: [plateLen / 2, 0],
      w: plateLen,
      h: t_center,
      passable: true,
    });

    // Top bracket plate (pulled left by P/2)
    const yTop = t_center / 2 + gap + t_outer / 2;
    shapes.push({
      type: "box",
      at: [-plateLen / 2, yTop],
      w: plateLen,
      h: t_outer,
      passable: true,
    });

    // Bottom bracket plate (pulled left by P/2)
    const yBot = -yTop;
    shapes.push({
      type: "box",
      at: [-plateLen / 2, yBot],
      w: plateLen,
      h: t_outer,
      passable: true,
    });

    // Pin passing through all 3 plates vertically at x = 0
    const pinH = 2 * (yTop + t_outer / 2) + 0.14;
    shapes.push({
      type: "box",
      at: [0, 0],
      w: pinW,
      h: pinH,
      fill: "#c8ccd4", // metallic gray for steel pin
      passable: true,
    });

    // Two shear planes: dashed reference lines at the interfaces
    const shearY1 = t_center / 2 + gap / 2;
    const shearY2 = -(t_center / 2 + gap / 2);
    shapes.push({
      type: "line",
      from: [-0.4, shearY1],
      to: [0.4, shearY1],
      dashed: true,
      style: "reference",
    });
    shapes.push({
      type: "line",
      from: [-0.4, shearY2],
      to: [0.4, shearY2],
      dashed: true,
      style: "reference",
    });

    // Section markers
    shapes.push({ type: "text", at: [0.48, shearY1], text: "a" });
    shapes.push({ type: "text", at: [0.48, shearY2], text: "b" });

    // Load arrows
    const arrowLen = 0.65;
    // Central pulling force P to the right
    shapes.push({
      type: "arrow",
      id: "P",
      from: [plateLen, 0],
      to: [plateLen + arrowLen, 0],
      role: "known",
      label: `P = ${format(v.P, "kN")}`,
    });
    // Top and bottom reaction forces P/2 to the left
    const halfP_label = `P/2 = ${format(v.P / 2, "kN")}`;
    shapes.push({
      type: "arrow",
      from: [-plateLen, yTop],
      to: [-plateLen - arrowLen, yTop],
      role: "known",
      label: halfP_label,
    });
    shapes.push({
      type: "arrow",
      from: [-plateLen, yBot],
      to: [-plateLen - arrowLen, yBot],
      role: "known",
      label: halfP_label,
    });

    // Pin diameter leader pointing to the pin in elevation
    shapes.push({
      type: "leader",
      at: [-pinW / 2, yTop + t_outer / 2 + 0.04],
      dir: [-0.8, 0.7],
      label: `Pin ⌀ ${dVal} mm`,
    });

    // Caption under left panel
    shapes.push({
      type: "text",
      at: [0, yBot - t_outer / 2 - 0.28],
      text: "Joint Elevation (Double Shear)",
      caption: true,
    });

  } else {
    // -----------------------------------------------------------------------
    // SINGLE SHEAR (Lap joint: 2 plates, 1 shear plane)
    // -----------------------------------------------------------------------
    const yTop = t_plate / 2;
    const yBot = -t_plate / 2;

    // Top plate (pulled right by load P)
    shapes.push({
      type: "box",
      at: [plateLen / 2, yTop],
      w: plateLen,
      h: t_plate,
      passable: true,
    });

    // Bottom plate (pulled left by load P)
    shapes.push({
      type: "box",
      at: [-plateLen / 2, yBot],
      w: plateLen,
      h: t_plate,
      passable: true,
    });

    // Vertical pin passing through both plates at x = 0
    const pinH = 2 * t_plate + 0.18;
    shapes.push({
      type: "box",
      at: [0, 0],
      w: pinW,
      h: pinH,
      fill: "#c8ccd4", // metallic gray
      passable: true,
    });

    // Single shear plane at the interface y = 0
    shapes.push({
      type: "line",
      from: [-0.45, 0],
      to: [0.45, 0],
      dashed: true,
      style: "reference",
    });
    shapes.push({ type: "text", at: [0.52, 0], text: "a" });
    shapes.push({ type: "text", at: [-0.52, 0], text: "a" });

    // Load arrows
    const arrowLen = 0.65;
    shapes.push({
      type: "arrow",
      id: "P",
      from: [plateLen, yTop],
      to: [plateLen + arrowLen, yTop],
      role: "known",
      label: `P = ${format(v.P, "kN")}`,
    });
    shapes.push({
      type: "arrow",
      from: [-plateLen, yBot],
      to: [-plateLen - arrowLen, yBot],
      role: "known",
      label: `P = ${format(v.P, "kN")}`,
    });

    // (No "Pin ⌀" leader here: the cross-section and the corner note already give
    // the diameter, and a third label crowded the lower P label away from its arrow.)

    // Caption under left panel
    shapes.push({
      type: "text",
      at: [0, yBot - t_plate / 2 - 0.28],
      text: "Joint Elevation (Single Shear)",
      caption: true,
    });
  }

  // =========================================================================
  // RIGHT PANEL: Side Profile (Pin Cross-Section at Shear Plane)
  // =========================================================================
  const dividerX = plateLen + 0.9;
  const xR = plateLen + 2.3;

  // Centerlines
  shapes.push({
    type: "line",
    from: [xR - R_pin - 0.16, 0],
    to: [xR + R_pin + 0.16, 0],
    dashed: true,
    style: "reference",
  });
  shapes.push({
    type: "line",
    from: [xR, -R_pin - 0.16],
    to: [xR, R_pin + 0.16],
    dashed: true,
    style: "reference",
  });

  // Cross-hatched circular shear face of the pin
  shapes.push({
    type: "circle",
    at: [xR, 0],
    r: R_pin,
    fill: "#dce0e8",
    hatched: true,
    passable: true,
  });

  // Drafting diameter leader arrow
  const angle = Math.PI / 4;
  shapes.push({
    type: "leader",
    at: [xR + R_pin * Math.cos(angle), R_pin * Math.sin(angle)],
    dir: [1, 0.75],
    label: `⌀ ${dVal} mm`,
  });

  // Shear force vector V pointing tangentially across the shear plane
  const vArrowLen = 0.55;
  shapes.push({
    type: "arrow",
    id: "V",
    from: [xR - vArrowLen / 2, R_pin + 0.18],
    to: [xR + vArrowLen / 2, R_pin + 0.18],
    role: "known",
    label: `V = ${format(v.V, "kN")}`,
  });

  // Caption under right panel
  const captionY = isDouble ? -0.65 : -0.55;
  shapes.push({
    type: "text",
    at: [xR, captionY],
    text: "Pin Cross-Section (Shear Plane)",
    caption: true,
  });

  // =========================================================================
  // CORNER NOTE
  // =========================================================================
  const noteLines = [];
  noteLines.push(`Joint: ${isDouble ? "Double Shear (2 planes)" : "Single Shear (1 plane)"}`);
  noteLines.push(`Pin: ⌀ ${dVal} mm`);
  // (Plain text can't draw a subscript, so not "τ_allow".) A design limit is a given of the problem, so it's always shown (it changes between versions).
  if (joint.allowableStress != null) noteLines.push(`Allowable τ: ${joint.allowableStress} MPa`);
  if (reveal && v.tau != null) {
    noteLines.push(`V = ${v.V.toFixed(1)} kN, τ = ${v.tau.toFixed(1)} MPa`);
  }
  shapes.push({
    type: "note",
    lines: noteLines,
  });

  // =========================================================================
  // SPREAD PANELS
  // =========================================================================
  const leftReach = [-plateLen - 0.95, plateLen + 0.85];
  const rightReach = [xR - 0.85, xR + 1.15];
  const yReach = [captionY - 0.22, 0.75];

  return spreadPanels(shapes, {
    divider: dividerX,
    left: leftReach,
    right: rightReach,
    y: yReach,
    margin: 0.35,
    size: opts.canvasSize,
  });
}
