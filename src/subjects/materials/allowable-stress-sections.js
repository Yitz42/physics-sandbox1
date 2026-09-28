// allowable-stress-sections.js — the right-hand panel of the allowable-stress picture (Unit 1.4):
// the pin's shear plane (a hatched circle) and the plate's projected bearing area (a hatched
// t × d rectangle), each named — with its capacity once the answer is revealed. Split from
// allowable-stress-scene.js to keep that file small; the geometry comes from there.

export function sectionShapes({ v, xR, R_pin, pinW, tH, dPin, tPlate, isDouble, reveal }) {
  const out = [];
  const yPinSection = 0.38;
  const yBearingSection = -0.30;

  // 1. Pin shear plane cross-section (hatched circle)
  out.push({
    type: "circle",
    at: [xR, yPinSection],
    r: R_pin,
    fill: "#dce0e8",
    hatched: true,
    passable: true,
  });

  // Centerlines for pin cross-section
  out.push({
    type: "line",
    from: [xR - R_pin - 0.12, yPinSection],
    to: [xR + R_pin + 0.12, yPinSection],
    dashed: true,
    style: "reference",
  });
  out.push({
    type: "line",
    from: [xR, yPinSection - R_pin - 0.12],
    to: [xR, yPinSection + R_pin + 0.12],
    dashed: true,
    style: "reference",
  });

  // Label above pin section
  out.push({
    type: "text",
    at: [xR, yPinSection + R_pin + 0.16],
    // (The capacities are what the stages ask for: shown only once the answer is revealed.)
    text: reveal ? `Pin Shear: ${v.P_shear.toFixed(1)} kN${v.governing === "shear" ? " (GOVERNS)" : ""}` : "Pin Shear",
  });
  out.push({
    type: "text",
    at: [xR, yPinSection - R_pin - 0.14],
    text: `(⌀ ${dPin} mm, ${isDouble ? "2 planes" : "1 plane"})`,
  });


  // 2. Plate bearing contact area (hatched rectangle t × d)
  out.push({
    type: "box",
    at: [xR, yBearingSection],
    w: pinW,
    h: tH,
    fill: "#dce0e8",
    hatched: true,
    passable: true,
  });

  // Label above bearing area
  out.push({
    type: "text",
    at: [xR, yBearingSection + tH / 2 + 0.14],
    text: reveal ? `Plate Bearing: ${v.P_bearing.toFixed(1)} kN${v.governing === "bearing" ? " (GOVERNS)" : ""}` : "Plate Bearing",
  });
  out.push({
    type: "text",
    at: [xR, yBearingSection - tH / 2 - 0.14],
    text: `(t = ${tPlate} mm, d = ${dPin} mm)`,
  });


  // Right panel caption
  out.push({
    type: "text",
    at: [xR, -0.68],
    text: "Critical Connection Sections",
    caption: true,
  });

  return out;
}
