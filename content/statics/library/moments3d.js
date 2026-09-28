// library/moments3d.js — the lesson library's moments in 3D (Units 4.7, 4.8; see
// src/subjects/statics/force3d-moment.js). z is up, coordinates in metres.
// Questions:
//   moment      the moment about O as a Cartesian vector (M_x, M_y, M_z) and its size
// Hand checks (default numbers), M_O = r × F:
//   pipe and rope: pipe O (0, 0, 0) → A (0, 0.5, 0) → B (0.4, 0.5, 0); a rope pulls B toward
//            C (0.8, 0.1, 0.2): r_BC = {0.4 i − 0.4 j + 0.2 k} m (0.6 m), F = 300 N
//            → F = {200 i − 200 j + 100 k} N; r = r_B = {0.4 i + 0.5 j} m.
//            M_x = (0.5)(100) − (0)(−200) = 50;  M_y = (0)(200) − (0.4)(100) = −40;
//            M_z = (0.4)(−200) − (0.5)(200) = −180 N·m;  M_O = 191.05 N·m.
//            (C (0.6, 0.9, −0.4): M = {−100 i + 80 j + 30 k};  C (0, 0.7, 0.4): {100 i − 80 j + 140 k};
//             C (0.8, 0.7, 0.4): {100 i − 80 j − 60 k} N·m, all for 300 N.)
//   flagpole cable as a moment: A (0, 0, 6), B (2, −3, 0), T = 700 N → {200 i − 300 j − 600 k} N;
//            M_O = (0, 0, 6) × F = {1800 i + 1200 j + 0 k} N·m, 2163.3 N·m — no z part: a force
//            whose line crosses the pole's axis can't twist the pole.
//   bracket (solve): O → A (0, 0.3, 0) → B (0.25, 0.3, 0). F_1 = 400 N straight down at A:
//            r_A × F_1 = {−120 i} N·m. A rope from B to D (0.55, 0.1, 0.6): r_BD = {0.3 i − 0.2 j + 0.6 k}
//            (0.7 m), T = 350 N → {150 i − 100 j + 300 k} N; r_B × T = {90 i − 75 j − 70 k} N·m.
//            M_O = {−30 i − 75 j − 70 k} N·m, M_O = 106.9 N·m.
// (The same numbers are tested in tests/statics/moment3d.test.js.)

import { scenario } from "../../../src/core/library.js";

export const pipeAndRope = scenario({
  name: "pipe pulled by a rope",
  story: "A bent pipe is fixed to the wall at O and runs to A, then to B. A rope pulls on its end B toward C with force $F$. Coordinates in the key (metres; z is up).",
  setup: {
    analysis: "moment",
    about: "O",
    points: { O: [0, 0, 0], A: [0, 0.5, 0], B: [0.4, 0.5, 0], C: [0.8, 0.1, 0.2] },
    body: ["O", "A", "B"],
    cables: [["B", "C"]],
    forces: [{ id: "F", symbol: "F", magnitude: 300, dir: { from: "B", to: "C" } }],
    showR: true,
    axisLength: 0.9, // (the picture's scale: a pipe well under a metre)
  },
  vary: [
    { path: "forces.0.magnitude", min: 150, max: 450, step: 25 },
    { path: "points.C", values: [[0.8, 0.1, 0.2], [0.6, 0.9, -0.4], [0, 0.7, 0.4], [0.8, 0.7, 0.4]] },
  ],
  questions: {
    moment: {
      instruction: "Find the rope's moment about O as a Cartesian vector: $M_x$, $M_y$ and $M_z$.",
      ask: [{ quantity: "M.x" }, { quantity: "M.y" }, { quantity: "M.z" }],
      hints: [
        "First the force as a vector: $\\mathbf{F} = F\\,\\mathbf{r}_{BC}/r_{BC}$. Then $\\mathbf{r}$ from O to B, where the rope pulls.",
        "$\\mathbf{M}_O = \\mathbf{r} \\times \\mathbf{F}$: $M_x = r_y F_z - r_z F_y$, $M_y = r_z F_x - r_x F_z$, $M_z = r_x F_y - r_y F_x$.",
        "Watch the middle term of the determinant: $M_y = -(r_x F_z - r_z F_x)$.",
      ],
    },
  },
});

export const poleCableMoment = scenario({
  name: "flagpole cable, as a moment",
  story: "A cable runs from the top A of a flagpole to an anchor B, pulling with tension $T$. How hard does it try to bend the pole over at its base O? Coordinates in the key (metres; z is up).",
  setup: {
    analysis: "moment",
    about: "O",
    points: { O: [0, 0, 0], A: [0, 0, 6], B: [2, -3, 0] },
    pole: ["O", "A"],
    cables: [["A", "B"]],
    forces: [{ id: "T", symbol: "T", magnitude: 700, dir: { from: "A", to: "B" } }],
    showR: true,
  },
  vary: [
    // (Anchors 7 m from A that don't line up with the line of sight, so the cable never hides behind the pole.)
    { path: "points.B", values: [[2, -3, 0], [-2, 3, 0], [3, -2, 0], [-3, 2, 0]] },
    { path: "forces.0.magnitude", min: 400, max: 1000, step: 50 },
  ],
  questions: {
    moment: {
      instruction: "Find the cable's moment about the base O: $M_x$, $M_y$, $M_z$, and its size $M_O$.",
      ask: [{ quantity: "M.x" }, { quantity: "M.y" }, { quantity: "M.z" }, { quantity: "M", min: 0 }],
      hints: [
        "$\\mathbf{T} = T\\,\\mathbf{r}_{AB}/r_{AB}$ (Unit 2.3), and $\\mathbf{r}$ from O to A, where it pulls: $\\{6\\,\\mathbf{k}\\}$ m.",
        "With $\\mathbf{r}$ straight up the z axis, only $r_z$ is non-zero: $M_x = -r_z T_y$, $M_y = r_z T_x$, $M_z = 0$.",
        "$M_O = \\sqrt{M_x^2 + M_y^2 + M_z^2}$.",
      ],
    },
  },
});

export const bracketTwoForces = scenario({
  name: "bracket with a load and a rope",
  story: "A bracket is built into the wall at O and runs to A, then to B. A load $F_1$ hangs straight down from A, and a rope pulls B toward D with tension $T$. Coordinates in the key (metres; z is up).",
  setup: {
    analysis: "moment",
    about: "O",
    points: { O: [0, 0, 0], A: [0, 0.3, 0], B: [0.25, 0.3, 0], D: [0.55, 0.1, 0.6] },
    body: ["O", "A", "B"],
    cables: [["B", "D"]],
    axisLength: 0.8, // (the picture's scale: a small bracket)
    forces: [
      { id: "F_1", symbol: "F_1", magnitude: 400, at: "A", dir: { components: [0, 0, -400] } },
      { id: "T", symbol: "T", magnitude: 350, dir: { from: "B", to: "D" } },
    ],
  },
  vary: [
    // (F_1 hangs straight down: its only component is −F_1 along z.)
    { path: "forces.0.dir.components.2", values: [-200, -250, -300, -350, -400, -450, -500, -550, -600] },
    { path: "forces.1.magnitude", min: 200, max: 500, step: 50 },
  ],
  questions: {
    moment: {
      instruction: "Find the total moment of the two forces about O, $\\mathbf{M}_O = \\Sigma\\,\\mathbf{r} \\times \\mathbf{F}$, and its size.",
      ask: [{ quantity: "M.x" }, { quantity: "M.y" }, { quantity: "M.z" }, { quantity: "M", min: 0 }],
      hints: [
        "Each force gets its own r: from O to the point where IT acts ($\\mathbf{r}_{A}$ for $F_1$, $\\mathbf{r}_{B}$ for $T$).",
        "$\\mathbf{T} = T\\,\\mathbf{r}_{BD}/r_{BD}$; $\\mathbf{F}_1 = \\{-F_1\\,\\mathbf{k}\\}$.",
        "Work out each $\\mathbf{r} \\times \\mathbf{F}$, then add them part by part.",
      ],
    },
  },
});
