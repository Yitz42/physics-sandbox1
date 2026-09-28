// axial-stress-3d.js — 3D perspective view of an axially loaded bar (Normal Stress Unit 1.1).

import { format } from "../../core/units.js";
import { projector } from "../../render/projection.js";
import { solveAxialStress } from "./axial-stress.js";

const unit2 = (d) => {
  const m = Math.hypot(d[0], d[1]) || 1;
  return [d[0] / m, d[1] / m];
};

export function axialStress3dScene(setup = {}, result, opts = {}) {
  const res = result || solveAxialStress(setup);
  const v = res.values;
  const reveal = !!opts.reveal;
  const bar = setup.bar || {};
  const L = bar.length ?? 2.0; // metres
  const shape = bar.shape || "circle";
  const P_kN = v.P ?? 25;
  const isTension = P_kN >= 0;
  const pMag = Math.abs(P_kN);

  const view = setup.view3d || { yaw: 34, pitch: 20 };
  const P = projector(view);
  const at = P.at;

  const shapes = [];

  // Corner 3D coordinate axes
  shapes.push({
    type: "axes",
    dirs: {
      x: unit2(P.screenDir([1, 0, 0])),
      y: unit2(P.screenDir([0, 1, 0])),
      z: unit2(P.screenDir([0, 0, 1])),
    },
  });

  // Dynamic radius in 3D meters, scaled with diameter d (in mm)
  const dVal = bar.diameter ?? 25;
  const rScale = Math.max(0.4, Math.min(1.8, dVal / 25));
  const r = 0.32 * rScale;

  // 1. Back Wall / Fixed Mounting Block at x = 0 (in y-z plane)
  const wallH = Math.max(0.75, r + 0.45);
  const wallCorners = [
    [0, -wallH, -wallH],
    [0, wallH, -wallH],
    [0, wallH, wallH],
    [0, -wallH, wallH],
  ];
  // Solid wall mounting face (no hatch pattern on 3D perspective base)
  shapes.push({
    type: "polygon",
    points: wallCorners.map(at),
    fill: "#dce0e8",
    stroke: "ink",
    lineWidth: 1.5,
  });
  // Beveled top and side for 3D mounting depth
  const wallBackCorners = wallCorners.map(([x, y, z]) => [-0.2, y, z]);
  shapes.push({
    type: "polygon",
    points: [at(wallBackCorners[3]), at(wallCorners[3]), at(wallCorners[2]), at(wallBackCorners[2])],
    fill: "#c8ccd4",
    stroke: "ink",
    lineWidth: 1.2,
  });
  shapes.push({
    type: "polygon",
    points: [at(wallBackCorners[2]), at(wallCorners[2]), at(wallCorners[1]), at(wallBackCorners[1])],
    fill: "#b8bcc6",
    stroke: "ink",
    lineWidth: 1.2,
  });

  // 2. 3D Bar Body
  if (shape === "circle") {
    // Generate cylindrical points
    const N = 36;
    const pts0 = [];
    const ptsL = [];
    const deg2rad = Math.PI / 180;
    const yawRad = (view.yaw ?? 34) * deg2rad;
    const pitchRad = (view.pitch ?? 20) * deg2rad;

    const vToward = [
      Math.cos(pitchRad) * Math.cos(yawRad),
      Math.cos(pitchRad) * Math.sin(yawRad),
      Math.sin(pitchRad),
    ];

    for (let i = 0; i < N; i++) {
      const theta = (i / N) * Math.PI * 2;
      pts0.push([0, r * Math.cos(theta), r * Math.sin(theta)]);
      ptsL.push([L, r * Math.cos(theta), r * Math.sin(theta)]);
    }

    const dot = (i) => {
      const theta = (i / N) * Math.PI * 2;
      return Math.cos(theta) * vToward[1] + Math.sin(theta) * vToward[2];
    };

    let iTop = 0, iBot = Math.floor(N / 2);
    for (let i = 0; i < N; i++) {
      const d1 = dot(i);
      const d2 = dot((i + 1) % N);
      if (d1 <= 0 && d2 >= 0) iTop = i;
      if (d1 >= 0 && d2 <= 0) iBot = i;
    }

    // Cylindrical body surface between silhouettes
    const bodyArc0 = [];
    const bodyArcL = [];
    for (let j = 0; j <= N; j++) {
      const idx = (iTop + j) % N;
      if (dot(idx) >= -0.01) {
        bodyArc0.push(at(pts0[idx]));
        bodyArcL.push(at(ptsL[idx]));
      }
    }

    // Shaded cylinder body
    shapes.push({
      type: "polygon",
      points: [...bodyArc0, ...bodyArcL.slice().reverse()],
      fill: "#cbb389",
      stroke: "ink",
      lineWidth: 1.5,
    });

    // Silhouette lines
    shapes.push({
      type: "line",
      from: at(pts0[iTop]),
      to: at(ptsL[iTop]),
      lineWidth: 2,
    });
    shapes.push({
      type: "line",
      from: at(pts0[iBot]),
      to: at(ptsL[iBot]),
      lineWidth: 2,
    });

    // Front cross-section face (at x = L)
    shapes.push({
      type: "polygon",
      points: ptsL.map(at),
      fill: "#e0cca0",
      stroke: "ink",
      lineWidth: 2,
      hatched: true,
      hatchStep: 8,
    });

    // Centerlines on the front face
    shapes.push({
      type: "line",
      from: at([L, -r * 1.3, 0]),
      to: at([L, r * 1.3, 0]),
      dashed: true,
      style: "reference",
    });
    shapes.push({
      type: "line",
      from: at([L, 0, -r * 1.3]),
      to: at([L, 0, r * 1.3]),
      dashed: true,
      style: "reference",
    });

    // Diameter leader arrow pointing to the front cross-section face
    const ptLeader = at([L, -r * 0.707, r * 0.707]);
    shapes.push({
      type: "leader",
      at: ptLeader,
      dir: [-0.7, 0.7],
      label: `⌀ ${bar.diameter ?? 25} mm`,
    });

  } else if (shape === "rectangle") {
    const bVal = v.b ?? 40, hVal = v.h ?? 12;
    const dy = 0.35 * Math.max(0.4, Math.min(1.8, bVal / 40));
    const dz = 0.20 * Math.max(0.4, Math.min(1.8, hVal / 12));

    const V = (x, y, z) => at([x, y, z]);
    // Top face
    shapes.push({
      type: "polygon",
      points: [V(0, -dy, dz), V(L, -dy, dz), V(L, dy, dz), V(0, dy, dz)],
      fill: "#d8c49a",
      stroke: "ink",
      lineWidth: 1.5,
    });
    // Side face
    shapes.push({
      type: "polygon",
      points: [V(0, dy, -dz), V(L, dy, -dz), V(L, dy, dz), V(0, dy, dz)],
      fill: "#b89f70",
      stroke: "ink",
      lineWidth: 1.5,
    });
    // Front cross-section face
    shapes.push({
      type: "polygon",
      points: [V(L, -dy, -dz), V(L, dy, -dz), V(L, dy, dz), V(L, -dy, dz)],
      fill: "#e0cca0",
      stroke: "ink",
      lineWidth: 2,
      hatched: true,
      hatchStep: 8,
    });

    // Front dimensions
    shapes.push({
      type: "dim",
      from: V(L, -dy, -dz - 0.18),
      to: V(L, dy, -dz - 0.18),
      label: `b = ${bVal} mm`,
    });
    shapes.push({
      type: "dim",
      from: V(L, dy + 0.18, -dz),
      to: V(L, dy + 0.18, dz),
      label: `h = ${hVal} mm`,
    });
  }

  // 3. Length Dimension in 3D
  shapes.push({
    type: "dim",
    from: at([0, 0, -r - 0.35]),
    to: at([L, 0, -r - 0.35]),
    label: `${L} m`,
  });

  // 4. Axial Load Arrow P along centerline
  const arrowLen = 0.85;
  if (pMag >= 1e-3) {
    const pLabel = `P = ${format(pMag, "kN")}`;
    shapes.push({
      type: "arrow",
      id: "P",
      from: isTension ? at([L, 0, 0]) : at([L + arrowLen, 0, 0]),
      to: isTension ? at([L + arrowLen, 0, 0]) : at([L, 0, 0]),
      role: "known",
      label: pLabel,
    });
  }

  // 5. Distributed Stress Vectors σ over the cross-section
  if (reveal && v.sigma != null && pMag >= 1e-3) {
    const sigLen = 0.35;
    const offsets = shape === "circle" ? [
      [0, 0],
      [r * 0.55, 0],
      [-r * 0.55, 0],
      [0, r * 0.55],
      [0, -r * 0.55],
    ] : [
      [0, 0],
      [0.18, 0.08],
      [-0.18, 0.08],
      [0.18, -0.08],
      [-0.18, -0.08],
    ];

    offsets.forEach(([dy, dz], i) => {
      const fromPt = at([L, dy, dz]);
      const toPt = isTension ? at([L + sigLen, dy, dz]) : at([L - sigLen, dy, dz]);
      shapes.push({
        type: "arrow",
        from: isTension ? fromPt : toPt,
        to: isTension ? toPt : fromPt,
        role: isTension ? "tension" : "compression",
        label: i === 0 ? `σ = ${v.sigma.toFixed(1)} MPa` : "",
        headGap: 0,
      });
    });
  }

  // Caption
  shapes.push({
    type: "text",
    at: at([L / 2, 0, -r - 0.72]),
    text: "3D Perspective View (Axial Bar in Space)",
    caption: true,
  });

  // Corner note with material and stress
  const noteLines = [];
  noteLines.push(`Cross-section: ⌀ ${bar.diameter ?? 25} mm`);
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

  return shapes;
}
