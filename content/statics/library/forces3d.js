// library/forces3d.js — the lesson library's forces in space (Unit 2.3; see
// src/core/library.js and src/subjects/statics/force3d.js).
// Questions:
//   components   predict F_x, F_y, F_z (and γ, when only α and β are given)
//   size         predict the size F and the direction angles from components
// Hand checks (default numbers):
//   eyebolt force: 500 N, α = 60°, β = 45°, γ acute: cos γ = √(1 − 0.25 − 0.5) = 0.5 → γ = 60°;
//            F = {250 i + 353.6 j + 250 k} N.
//   antenna guy force: 600 N, azimuth θ = 120°, elevation φ = 40°: F_z = 385.7 N, F′ = 459.6 N,
//            F_x = 459.6 cos 120° = −229.8 N, F_y = 459.6 sin 120° = 398.0 N.
//   flagpole cable: A (0, 0, 6), B (2, −3, 0): r_AB = {2 i − 3 j − 6 k} m, 7 m; T = 700 N →
//            {200 i − 300 j − 600 k} N.
//   bracket force: {300 i − 200 j + 600 k} N → F = 700 N, α = 64.6°, β = 106.6°, γ = 31.0°.

import { scenario } from "../../../src/core/library.js";

const range = (a, b, s) => Array.from({ length: Math.round((b - a) / s) + 1 }, (_, i) => +(a + i * s).toFixed(6));
// Anchors on the ground 7 m from a point 6 m up the z axis (2² + 3² + 6² = 7²).
export const SEVEN = [[2, -3, 0], [-2, -3, 0], [3, 2, 0], [-3, 2, 0], [3, -2, 0], [2, 3, 0]];

export const eyeboltForce = scenario({
  name: "eyebolt force by direction angles",
  story: "A force $F$ pulls on an eyebolt at O. Its direction is given by two of its coordinate direction angles, α (from +x) and β (from +y); it points UP, so γ is less than 90°.",
  setup: { forces: [{ id: "F", symbol: "F", magnitude: 500, dir: { angles: [60, 45, null], gamma: "acute" } }], showAngles: { alpha: "given", beta: "given", gamma: "ask" }, showComponents: "reveal", axisLength: 3 },
  vary: [
    { path: "forces.0.magnitude", min: 200, max: 800, step: 50 },
    { path: "forces.0.dir.angles", values: [[60, 45, null], [60, 60, null], [45, 60, null], [70, 50, null], [50, 70, null], [120, 60, null], [60, 120, null], [135, 60, null], [110, 40, null]] },
  ],
  questions: {
    components: {
      instruction: "Find γ, then the force's components $F_x$, $F_y$ and $F_z$.",
      ask: [{ quantity: "F.gamma" }, { quantity: "F.x" }, { quantity: "F.y" }, { quantity: "F.z" }],
      hints: [
        "The three direction angles are tied together: $\\cos^2\\alpha + \\cos^2\\beta + \\cos^2\\gamma = 1$.",
        "So $\\cos\\gamma = +\\sqrt{1 - \\cos^2\\alpha - \\cos^2\\beta}$ (plus: the force points up).",
        "Then each component is F times the cosine of its own angle: $F_x = F\\cos\\alpha$, $F_y = F\\cos\\beta$, $F_z = F\\cos\\gamma$.",
      ],
    },
  },
});

export const antennaForce = scenario({
  name: "antenna force by azimuth and elevation",
  story: "A guy wire pulls on the top of an antenna at O with force $F$. Its direction is given by an azimuth θ (in the x-y plane, from +x toward +y) and an elevation φ (up from the x-y plane).",
  setup: { forces: [{ id: "F", symbol: "F", magnitude: 600, dir: { azimuth: 120, elevation: 40 } }], showAngles: { theta: "given", phi: "given" }, showComponents: "reveal", axisLength: 3 },
  vary: [
    { path: "forces.0.magnitude", min: 200, max: 800, step: 50 },
    { path: "forces.0.dir.azimuth", values: [110, 120, 130, 140, 150] }, // (leaning away from the viewer: never end-on)
    { path: "forces.0.dir.elevation", values: [25, 30, 40, 50] },
  ],
  questions: {
    components: {
      instruction: "Find the force's components $F_x$, $F_y$ and $F_z$.",
      ask: [{ quantity: "F.x" }, { quantity: "F.y" }, { quantity: "F.z" }],
      hints: [
        "Split F in two first: up, $F_z = F\\sin\\phi$, and along the x-y plane, $F' = F\\cos\\phi$.",
        "Then split $F'$ in the x-y plane with θ: $F_x = F'\\cos\\theta$, $F_y = F'\\sin\\theta$.",
        "θ is past 90° here, so $\\cos\\theta$ is negative: $F_x < 0$. Check: $F_x^2 + F_y^2 + F_z^2 = F^2$.",
      ],
    },
  },
});

export const flagpoleCable = scenario({
  name: "flagpole cable",
  story: "A cable runs from the top of a flagpole, A, to an anchor B on the ground, pulling on the pole with tension $T$. The coordinates of A and B are in the key (metres).",
  setup: { points: { O: [0, 0, 0], A: [0, 0, 6], B: [2, -3, 0] }, pole: ["O", "A"], cables: [["A", "B"]],
    forces: [{ id: "T", symbol: "T", magnitude: 700, dir: { from: "A", to: "B" } }], showComponents: "reveal" },
  vary: [
    { path: "points.B", values: SEVEN },
    { path: "forces.0.magnitude", min: 300, max: 900, step: 50 },
  ],
  questions: {
    components: {
      instruction: "Find the components $T_x$, $T_y$ and $T_z$ of the cable's pull on the pole at A.",
      ask: [{ quantity: "T.x" }, { quantity: "T.y" }, { quantity: "T.z" }],
      hints: [
        "The position vector from A to B: $\\mathbf{r}_{AB} = \\mathbf{r}_B - \\mathbf{r}_A$ — B's coordinates minus A's.",
        "Its length $r_{AB} = \\sqrt{x^2 + y^2 + z^2}$, and the unit vector $\\mathbf{u}_{AB} = \\mathbf{r}_{AB}/r_{AB}$.",
        "Then $\\mathbf{T} = T\\,\\mathbf{u}_{AB}$: each component is T times the matching part of $\\mathbf{u}_{AB}$.",
      ],
    },
  },
});

export const bracketForce = scenario({
  name: "bracket force by components",
  story: "A force on a bracket at O is given by its components (in the picture).",
  setup: { forces: [{ id: "F", symbol: "F", dir: { components: [300, -200, 600] } }], hideMagnitude: true, showComponents: "always", axisLength: 3 },
  vary: [
    { path: "forces.0.dir.components.0", values: [-400, -300, -200, 200, 300, 400] },
    { path: "forces.0.dir.components.1", values: [-300, -200, -100, 100, 200, 300] },
    { path: "forces.0.dir.components.2", values: [300, 400, 500, 600] },
  ],
  questions: {
    size: {
      instruction: "Find the force's size $F$ and its coordinate direction angles α, β and γ.",
      ask: [{ quantity: "F" }, { quantity: "F.alpha" }, { quantity: "F.beta" }, { quantity: "F.gamma" }],
      hints: [
        "The components are at right angles to each other: $F = \\sqrt{F_x^2 + F_y^2 + F_z^2}$.",
        "Each direction angle is measured from its own positive axis: $\\cos\\alpha = F_x/F$, $\\cos\\beta = F_y/F$, $\\cos\\gamma = F_z/F$.",
        "A negative component gives an angle bigger than 90°.",
      ],
    },
  },
});
