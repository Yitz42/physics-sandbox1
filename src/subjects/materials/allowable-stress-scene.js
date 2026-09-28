// allowable-stress-scene.js — 2D engineering diagram for allowable stress design (Unit 1.4).
//
// Shows two panels:
//   Left:  Structural Connection Assembly — tension rod, clevis plates, pin, and tensile load P.
//   Right: Critical Connection Sections — pin shear plane and plate bearing area.

import { format } from "../../core/units.js";
import { spreadPanels } from "../../render/panels.js";
import { solveAllowableStress } from "./allowable-stress.js";

export function allowableStressScene(setup = {}, result, opts = {}) {
  const res = result || solveAllowableStress(setup);
  const v = res.values;
  const reveal = !!opts.reveal;

  const dRod = v.d_rod ?? 22;
  const dPin = v.d_pin ?? 18;
  const tPlate = v.t_plate ?? 12;
  const isDouble = v.n === 2;

  const shapes = [];

  // =========================================================================
  // GEOMETRY & SCALE
  // =========================================================================
  const hRod = 0.22 * Math.max(0.6, Math.min(1.5, dRod / 22));
  const R_pin = 0.18 * Math.max(0.6, Math.min(1.5, dPin / 18));
  const pinW = 2 * R_pin;
  const tH = 0.22 * Math.max(0.6, Math.min(1.5, tPlate / 12));

  const plateLen = 1.15;
  const rodLen = 1.25;

  // =========================================================================
  // LEFT PANEL: Structural Connection Assembly
  // =========================================================================
  if (isDouble) {
    // Clevis connection (double shear)
    const gap = 0.04;
    const yTop = hRod / 2 + gap + tH / 2;
    const yBot = -yTop;

    // Center tension rod (pulled right by load P)
    shapes.push({
      type: "box",
      layer: "zone",
      at: [rodLen / 2, 0],
      w: rodLen,
      h: hRod,
      fill: "#b89468", // brass / bronze tone for rod
      passable: true,
    });

    // Top bracket plate
    shapes.push({
      type: "box",
      layer: "zone",
      at: [-plateLen / 2, yTop],
      w: plateLen,
      h: tH,
      passable: true,
    });

    // Bottom bracket plate
    shapes.push({
      type: "box",
      layer: "zone",
      at: [-plateLen / 2, yBot],
      w: plateLen,
      h: tH,
      passable: true,
    });

    // Bracket base connecting the two plates at the left
    shapes.push({
      type: "box",
      layer: "zone",
      at: [-plateLen, 0],
      w: 0.14,
      h: 2 * (yTop + tH / 2),
      passable: true,
    });

    // Vertical pin passing through all 3 members at x = 0
    const pinH = 2 * (yTop + tH / 2) + 0.12;
    shapes.push({
      type: "box",
      at: [0, 0],
      w: pinW,
      h: pinH,
      fill: "#c8ccd4", // metallic gray steel pin
      passable: true,
    });

    // Pin centerlines
    shapes.push({
      type: "line",
      from: [0, -pinH / 2 - 0.10],
      to: [0, pinH / 2 + 0.10],
      dashed: true,
      style: "reference",
    });

    // Load arrow P pulling rod right
    const arrowLen = 0.55;
    shapes.push({
      type: "arrow",
      id: "P",
      from: [rodLen, 0],
      to: [rodLen + arrowLen, 0],
      role: "known",
      label: `P = ${format(v.P, "kN")}`,
    });

    // Reaction arrow on the bracket base to the left
    shapes.push({
      type: "arrow",
      from: [-plateLen - 0.07, 0],
      to: [-plateLen - 0.07 - arrowLen, 0],
      role: "known",
      label: `P = ${format(v.P, "kN")}`,
    });

    // Leaders
    shapes.push({
      type: "leader",
      at: [rodLen / 2 + 0.1, hRod / 2],
      dir: [0.7, 0.7],
      label: `Rod ⌀ ${dRod} mm`,
    });
    shapes.push({
      type: "leader",
      at: [-pinW / 2, yTop + tH / 2 + 0.05],
      dir: [-0.85, 0.75],
      label: `Pin ⌀ ${dPin} mm`,
    });


    // Caption under left panel
    shapes.push({
      type: "text",
      at: [0, yBot - tH / 2 - 0.28],
      text: "Connection Assembly (Double Shear)",
      caption: true,
    });

  } else {
    // Lap joint (single shear)
    const yTop = tH / 2;
    const yBot = -tH / 2;

    shapes.push({
      type: "box",
      layer: "zone",
      at: [rodLen / 2, yTop],
      w: rodLen,
      h: tH,
      passable: true,
    });

    shapes.push({
      type: "box",
      layer: "zone",
      at: [-plateLen / 2, yBot],
      w: plateLen,
      h: tH,
      passable: true,
    });

    const pinH = 2 * tH + 0.22;
    shapes.push({
      type: "box",
      at: [0, 0],
      w: pinW,
      h: pinH,
      fill: "#c8ccd4",
      passable: true,
    });

    const arrowLen = 0.55;
    shapes.push({
      type: "arrow",
      id: "P",
      from: [rodLen, yTop],
      to: [rodLen + arrowLen, yTop],
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

    shapes.push({
      type: "leader",
      at: [-pinW / 2, yTop + tH / 2 + 0.02],
      dir: [-0.75, 0.65],
      label: `Pin ⌀ ${dPin} mm`,
    });

    shapes.push({
      type: "text",
      at: [0, yBot - tH / 2 - 0.28],
      text: "Connection Assembly (Single Shear)",
      caption: true,
    });
  }

  // =========================================================================
  // RIGHT PANEL: Critical Failure Sections (Pin Shear & Bearing Area)
  // =========================================================================
  const dividerX = rodLen + 0.95;
  const xR = rodLen + 2.35;

  const yPinSection = 0.38;
  const yBearingSection = -0.30;


  // 1. Pin shear plane cross-section (hatched circle)
  shapes.push({
    type: "circle",
    at: [xR, yPinSection],
    r: R_pin,
    fill: "#dce0e8",
    hatched: true,
    passable: true,
  });

  // Centerlines for pin cross-section
  shapes.push({
    type: "line",
    from: [xR - R_pin - 0.12, yPinSection],
    to: [xR + R_pin + 0.12, yPinSection],
    dashed: true,
    style: "reference",
  });
  shapes.push({
    type: "line",
    from: [xR, yPinSection - R_pin - 0.12],
    to: [xR, yPinSection + R_pin + 0.12],
    dashed: true,
    style: "reference",
  });

  // Label above pin section
  shapes.push({
    type: "text",
    at: [xR, yPinSection + R_pin + 0.16],
    // (The capacities are what the stages ask for: shown only once the answer is revealed.)
    text: reveal ? `Pin Shear: ${v.P_shear.toFixed(1)} kN${v.governing === "shear" ? " (GOVERNS)" : ""}` : "Pin Shear",
  });
  shapes.push({
    type: "text",
    at: [xR, yPinSection - R_pin - 0.14],
    text: `(⌀ ${dPin} mm, ${isDouble ? "2 planes" : "1 plane"})`,
  });


  // 2. Plate bearing contact area (hatched rectangle t × d)
  shapes.push({
    type: "box",
    at: [xR, yBearingSection],
    w: pinW,
    h: tH,
    fill: "#dce0e8",
    hatched: true,
    passable: true,
  });

  // Label above bearing area
  shapes.push({
    type: "text",
    at: [xR, yBearingSection + tH / 2 + 0.14],
    text: reveal ? `Plate Bearing: ${v.P_bearing.toFixed(1)} kN${v.governing === "bearing" ? " (GOVERNS)" : ""}` : "Plate Bearing",
  });
  shapes.push({
    type: "text",
    at: [xR, yBearingSection - tH / 2 - 0.14],
    text: `(t = ${tPlate} mm, d = ${dPin} mm)`,
  });


  // Right panel caption
  shapes.push({
    type: "text",
    at: [xR, -0.68],
    text: "Critical Connection Sections",
    caption: true,
  });

  // =========================================================================
  // CORNER NOTE
  // =========================================================================
  // The allowable stresses are givens of the problem (a build stage varies them), so they are
  // always listed. The capacities they give are what the stages ask for: only once revealed
  // (after Test — or, in the explore stage, after its opening guess).
  const noteLines = [];
  // (Short lines: the note must leave room for the labels round the drawing.)
  noteLines.push(`Rod: σ ≤ ${v.sigma_allow} MPa`);
  noteLines.push(`Pin: τ ≤ ${v.tau_allow} MPa`);
  noteLines.push(`Plate: σb ≤ ${v.sigma_b_allow} MPa`);
  if (reveal) {
    noteLines.push(`Tension: ${v.P_tension.toFixed(1)} kN`);
    noteLines.push(`Allowable: ${v.P_allow.toFixed(1)} kN (${v.governing})`);
  }
  if (reveal && v.FS != null) {
    noteLines.push(`Applied P = ${v.P.toFixed(1)} kN, FS = ${v.FS.toFixed(2)}`);
  }
  shapes.push({
    type: "note",
    lines: noteLines,
  });

  // =========================================================================
  // SPREAD PANELS
  // =========================================================================
  const leftReach = [-plateLen - 0.85, rodLen + 0.85];
  const rightReach = [xR - 0.85, xR + 1.15];
  const yReach = [-0.85, 0.78];


  return spreadPanels(shapes, {
    divider: dividerX,
    left: leftReach,
    right: rightReach,
    y: yReach,
    margin: 0.35,
    size: opts.canvasSize,
  });
}
