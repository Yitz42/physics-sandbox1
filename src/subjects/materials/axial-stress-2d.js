// axial-stress-2d.js — 2D elevation and side profile cross-section for normal stress.

import { format } from "../../core/units.js";
import { spreadPanels } from "../../render/panels.js";
import { solveAxialStress } from "./axial-stress.js";

export function axialStress2dScene(setup = {}, result, opts = {}) {
  const res = result || solveAxialStress(setup);
  const v = res.values;
  const reveal = !!opts.reveal;
  const bar = setup.bar || {};
  const L = bar.length ?? 2.0; // metres
  const shape = bar.shape || "circle";
  const P_kN = v.P ?? 25;
  const isTension = P_kN >= 0;
  const pMag = Math.abs(P_kN);

  const shapes = [];

  // =========================================================================
  // GEOMETRY & SCALE COORDINATION (1:1 scale between Elevation and View a–a)
  // =========================================================================
  const dVal = bar.diameter ?? 25;
  // Radius R in world metres, dynamically scaled with diameter
  const R = 0.22 * Math.max(0.4, Math.min(1.8, dVal / 25));

  // Determine bar vertical height so Elevation and View a-a match scale exactly
  let barH = 2 * R;
  let W_rect = 0.40, H_rect = 0.22;
  let Ro_tube = 0.24, Ri_tube = 0.18;

  if (shape === "rectangle") {
    const bVal = v.b ?? 40, hVal = v.h ?? 12;
    W_rect = 0.40 * Math.max(0.4, Math.min(1.8, bVal / 40));
    H_rect = 0.22 * Math.max(0.4, Math.min(1.8, hVal / 12));
    barH = H_rect;
  } else if (shape === "tube") {
    const doVal = bar.dOuter ?? 50, diVal = bar.dInner ?? 40;
    Ro_tube = 0.24 * Math.max(0.4, Math.min(1.8, doVal / 50));
    Ri_tube = Ro_tube * (diVal / doVal);
    barH = 2 * Ro_tube;
  }

  const halfH = barH / 2;

  // =========================================================================
  // LEFT PANEL: Bar Elevation (Longitudinal View)
  // =========================================================================

  // 1. Fixed wall support on the left (hatched to the left away from the bar)
  const wallH = Math.max(1.0, barH + 0.45);
  shapes.push({
    type: "support",
    from: [0, -wallH / 2],
    to: [0, wallH / 2],
    normal: [1, 0], // Hatched to the left (wall side)
  });

  // 2. The bar (elevation view) matching the exact height of the cross-section
  shapes.push({
    type: "box",
    at: [L / 2, 0],
    w: L,
    h: barH,
    passable: true,
  });

  // 3. Section cut line through the bar at x = L / 2 (Section a–a)
  const cutX = L / 2;
  const cutSpan = halfH + 0.16;
  shapes.push({
    type: "line",
    from: [cutX, -cutSpan],
    to: [cutX, cutSpan],
    dashed: true,
    style: "reference",
  });
  shapes.push({ type: "text", at: [cutX, cutSpan + 0.08], text: "a" });
  shapes.push({ type: "text", at: [cutX, -cutSpan - 0.08], text: "a" });

  // 4. Axial force arrow P at the right end of the bar (x = L)
  const arrowLen = 0.7;
  if (pMag >= 1e-3) {
    const pLabel = `P = ${format(pMag, "kN")}`;
    shapes.push({
      type: "arrow",
      id: "P",
      from: isTension ? [L, 0] : [L + arrowLen, 0],
      to: isTension ? [L + arrowLen, 0] : [L, 0],
      role: "known",
      label: pLabel,
    });
  }

  // 5. Bar length dimension line
  const dimY = -(halfH + 0.44);
  shapes.push({
    type: "dim",
    from: [0, dimY],
    to: [L, dimY],
    label: `${L} m`,
  });

  // Caption under left panel
  shapes.push({
    type: "text",
    at: [L / 2, dimY - 0.30],
    text: "Bar Elevation",
    caption: true,
  });

  // =========================================================================
  // RIGHT PANEL: Side Profile (Cross-Section View, Section a–a)
  // =========================================================================
  const dividerX = L + 0.9;
  const xR = L + 2.2;

  if (shape === "circle") {
    // Centerlines through the circle
    shapes.push({
      type: "line",
      from: [xR - R - 0.16, 0],
      to: [xR + R + 0.16, 0],
      dashed: true,
      style: "reference",
    });
    shapes.push({
      type: "line",
      from: [xR, -R - 0.16],
      to: [xR, R + 0.16],
      dashed: true,
      style: "reference",
    });

    // Hatched circular cross-section
    shapes.push({
      type: "circle",
      at: [xR, 0],
      r: R,
      hatched: true,
      passable: true,
    });

    // Drafting-standard diameter leader arrow pointing to the circle
    const angle = Math.PI / 4;
    shapes.push({
      type: "leader",
      at: [xR + R * Math.cos(angle), R * Math.sin(angle)],
      dir: [1, 0.75],
      label: `⌀ ${dVal} mm`,
    });

  } else if (shape === "rectangle") {
    const bVal = v.b ?? 40, hVal = v.h ?? 12;

    // Centerlines
    shapes.push({
      type: "line",
      from: [xR - W_rect / 2 - 0.16, 0],
      to: [xR + W_rect / 2 + 0.16, 0],
      dashed: true,
      style: "reference",
    });
    shapes.push({
      type: "line",
      from: [xR, -H_rect / 2 - 0.16],
      to: [xR, H_rect / 2 + 0.16],
      dashed: true,
      style: "reference",
    });

    shapes.push({
      type: "box",
      at: [xR, 0],
      w: W_rect,
      h: H_rect,
      hatched: true,
      passable: true,
    });

    // Width and height dimensions
    shapes.push({
      type: "dim",
      from: [xR - W_rect / 2, -(H_rect / 2 + 0.20)],
      to: [xR + W_rect / 2, -(H_rect / 2 + 0.20)],
      label: `b = ${bVal} mm`,
    });
    shapes.push({
      type: "dim",
      from: [xR + W_rect / 2 + 0.20, -H_rect / 2],
      to: [xR + W_rect / 2 + 0.20, H_rect / 2],
      label: `h = ${hVal} mm`,
    });

  } else if (shape === "tube") {
    const doVal = bar.dOuter ?? 50, diVal = bar.dInner ?? 40;

    shapes.push({
      type: "line",
      from: [xR - Ro_tube - 0.16, 0],
      to: [xR + Ro_tube + 0.16, 0],
      dashed: true,
      style: "reference",
    });
    shapes.push({
      type: "line",
      from: [xR, -Ro_tube - 0.16],
      to: [xR, Ro_tube + 0.16],
      dashed: true,
      style: "reference",
    });

    shapes.push({
      type: "circle",
      at: [xR, 0],
      r: Ro_tube,
      innerR: Ri_tube,
      hatched: true,
      passable: true,
    });

    const angleO = Math.PI / 4;
    shapes.push({
      type: "leader",
      at: [xR + Ro_tube * Math.cos(angleO), Ro_tube * Math.sin(angleO)],
      dir: [1, 0.75],
      label: `do = ${doVal} mm`,
    });
    const angleI = (5 * Math.PI) / 4;
    shapes.push({
      type: "leader",
      at: [xR + Ri_tube * Math.cos(angleI), Ri_tube * Math.sin(angleI)],
      dir: [-1, -0.75],
      label: `di = ${diVal} mm`,
    });
  }

  // Caption under right panel
  shapes.push({
    type: "text",
    at: [xR, dimY - 0.30],
    text: "Side Profile (Section a–a)",
    caption: true,
  });

  // Corner note with material and stress
  const noteLines = [];
  if (bar.material) noteLines.push(`Material: ${bar.material}`);
  // A design limit is a given of the problem, so it's always shown (it changes between versions).
  if (bar.allowableStress != null) noteLines.push(`Allowable σ: ${bar.allowableStress} MPa`);
  if (reveal && v.sigma != null) {
    const kind = pMag < 1e-3 ? "unloaded" : (isTension ? "tension" : "compression");
    noteLines.push(`σ = ${v.sigma.toFixed(1)} MPa (${kind})`);
  }
  if (noteLines.length) {
    shapes.push({
      type: "note",
      lines: noteLines,
    });
  }

  // Spread panels side by side with the divider between them
  const leftReach = [-0.3, L + (pMag >= 1e-3 ? arrowLen + 0.15 : 0)];
  const rightReach = [xR - 0.85, xR + 1.15];
  const yReach = [dimY - 0.45, Math.max(0.65, halfH + 0.35)];

  return spreadPanels(shapes, {
    divider: dividerX,
    left: leftReach,
    right: rightReach,
    y: yReach,
    margin: 0.35,
    size: opts.canvasSize,
  });
}
