// allowable-stress-assembly.js — the left-hand panel of the allowable-stress picture (Unit 1.4):
// the connection itself — the tension rod, the bracket plate(s), the pin through them and the
// load P pulling them apart — single or double shear. Split from allowable-stress-scene.js to
// keep that file small; the sizes come from there.

import { format } from "../../core/units.js";

export function assemblyShapes({ v, hRod, R_pin, pinW, tH, plateLen, rodLen, dRod, dPin, tPlate, isDouble }) {
  const out = [];
  // =========================================================================
  // LEFT PANEL: Structural Connection Assembly
  // =========================================================================
  if (isDouble) {
    // Clevis connection (double shear)
    const gap = 0.04;
    const yTop = hRod / 2 + gap + tH / 2;
    const yBot = -yTop;

    // Center tension rod (pulled right by load P)
    out.push({
      type: "box",
      layer: "zone",
      at: [rodLen / 2, 0],
      w: rodLen,
      h: hRod,
      fill: "#b89468", // brass / bronze tone for rod
      passable: true,
    });

    // Top bracket plate
    out.push({
      type: "box",
      layer: "zone",
      at: [-plateLen / 2, yTop],
      w: plateLen,
      h: tH,
      passable: true,
    });

    // Bottom bracket plate
    out.push({
      type: "box",
      layer: "zone",
      at: [-plateLen / 2, yBot],
      w: plateLen,
      h: tH,
      passable: true,
    });

    // Bracket base connecting the two plates at the left
    out.push({
      type: "box",
      layer: "zone",
      at: [-plateLen, 0],
      w: 0.14,
      h: 2 * (yTop + tH / 2),
      passable: true,
    });

    // Vertical pin passing through all 3 members at x = 0
    const pinH = 2 * (yTop + tH / 2) + 0.12;
    out.push({
      type: "box",
      at: [0, 0],
      w: pinW,
      h: pinH,
      fill: "#c8ccd4", // metallic gray steel pin
      passable: true,
    });

    // Pin centerlines
    out.push({
      type: "line",
      from: [0, -pinH / 2 - 0.10],
      to: [0, pinH / 2 + 0.10],
      dashed: true,
      style: "reference",
    });

    // Load arrow P pulling rod right
    const arrowLen = 0.55;
    out.push({
      type: "arrow",
      id: "P",
      from: [rodLen, 0],
      to: [rodLen + arrowLen, 0],
      role: "known",
      label: `P = ${format(v.P, "kN")}`,
    });

    // Reaction arrow on the bracket base to the left
    out.push({
      type: "arrow",
      from: [-plateLen - 0.07, 0],
      to: [-plateLen - 0.07 - arrowLen, 0],
      role: "known",
      label: `P = ${format(v.P, "kN")}`,
    });

    // Leaders
    out.push({
      type: "leader",
      at: [rodLen / 2 + 0.1, hRod / 2],
      dir: [0.7, 0.7],
      label: `Rod ⌀ ${dRod} mm`,
    });
    out.push({
      type: "leader",
      at: [-pinW / 2, yTop + tH / 2 + 0.05],
      dir: [-0.85, 0.75],
      label: `Pin ⌀ ${dPin} mm`,
    });


    // Caption under left panel
    out.push({
      type: "text",
      at: [0, yBot - tH / 2 - 0.28],
      text: "Connection Assembly (Double Shear)",
      caption: true,
    });

  } else {
    // Lap joint (single shear)
    const yTop = tH / 2;
    const yBot = -tH / 2;

    out.push({
      type: "box",
      layer: "zone",
      at: [rodLen / 2, yTop],
      w: rodLen,
      h: tH,
      passable: true,
    });

    out.push({
      type: "box",
      layer: "zone",
      at: [-plateLen / 2, yBot],
      w: plateLen,
      h: tH,
      passable: true,
    });

    const pinH = 2 * tH + 0.22;
    out.push({
      type: "box",
      at: [0, 0],
      w: pinW,
      h: pinH,
      fill: "#c8ccd4",
      passable: true,
    });

    const arrowLen = 0.55;
    out.push({
      type: "arrow",
      id: "P",
      from: [rodLen, yTop],
      to: [rodLen + arrowLen, yTop],
      role: "known",
      label: `P = ${format(v.P, "kN")}`,
    });
    out.push({
      type: "arrow",
      from: [-plateLen, yBot],
      to: [-plateLen - arrowLen, yBot],
      role: "known",
      label: `P = ${format(v.P, "kN")}`,
    });

    out.push({
      type: "leader",
      at: [-pinW / 2, yTop + tH / 2 + 0.02],
      dir: [-0.75, 0.65],
      label: `Pin ⌀ ${dPin} mm`,
    });

    out.push({
      type: "text",
      at: [0, yBot - tH / 2 - 0.28],
      text: "Connection Assembly (Single Shear)",
      caption: true,
    });
  }

  return out;
}
