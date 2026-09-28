// library/rigid3d.js — rigid bodies in equilibrium in 3D (Unit 5.6; see src/subjects/statics/
// force3d-rigid.js). z is up; coordinates in m. Six equations: ΣF_x,y,z = 0 and ΣM_x,y,z = 0 about
// a support point (its reactions then have no moment).
// Supports: a ball-and-socket gives A_x, A_y, A_z; a thrust bearing the same; a journal bearing on
// a shaft along an axis gives the two forces across the shaft.
// Questions:
//   reactions  predict some of the unknowns            solve   equations, then answers
// Hand checks (default numbers):
//   shelf plate: A (0,0,0) ball, B (3,0,0) bearing on the hinge line (x), plate 3 × 2 m in the x-y plane;
//            W = 490.5 N at G (1.5, 1, 0), a box P = 300 N at F (2.5, 1.5, 0); cable C (3, 2, 0) → E (0, 0, 2):
//            r_CE = (−3, −2, 2), r = √17 = 4.1231, u = (−0.7276, −0.4851, 0.4851).
//            ΣM_x: (2)(T u_z) − 490.5(1) − 300(1.5) = 0 → T u_z = 470.25 → T = 969.45 N
//            ΣM_y: −3B_z − 3(T u_z) + 490.5(1.5) + 300(2.5) = 0 → B_z = (1485.75 − 1410.75)/3 = 25.0 N
//            ΣM_z: 3B_y + [3(T u_y) − 2(T u_x)] = 3B_y + 0 = 0 → B_y = 0
//            ΣF: A_x = 705.4 N, A_y = 470.25 N, A_z = 790.5 − 25 − 470.25 = 295.25 N.
//   windlass: shaft along y on a thrust bearing A (0,0,0) and a journal bearing B (0,1,0); a 500 N
//            load hangs from the drum's edge H (0.1, 0.4, 0); the crank handle C (0, 1.3, 0.25) is
//            pushed with P along −x.
//            ΣM_y: 0.1(500) − 0.25P = 0 → P = 200 N;  ΣM_x: 1·B_z − 0.4(500) = 0 → B_z = 200 N;
//            ΣM_z: −1·B_x + 1.3P = 0 → B_x = 260 N;  ΣF_x: A_x = P − B_x = −60 N;  ΣF_z: A_z = 300 N; A_y = 0.
//   boom: A (0,0,0) ball, B (4,0,0), F = 600 N down at B; cables B → C (0, 2, 2) and B → D (0, −2, 2),
//            each √24 = 4.899 m. By symmetry T_BC = T_BD = T; ΣM_y: 4[2T(2/4.899) − 600] = 0 → T = 734.85 N;
//            ΣF_x: A_x = 2T(4/4.899) = 1200 N; A_y = A_z = 0. (It can spin about its own axis AB, but
//            nothing makes it: ΣM_x is 0 = 0 — five unknowns, five independent equations.)
// (The same numbers are tested in tests/statics/rigid3d.test.js.)

import { scenario } from "../../../src/core/library.js";

const down = { angles: [90, 90, 180] };
const leftX = { angles: [180, 90, 90] };

export const shelfPlate = scenario({
  name: "shelf plate on a cable",
  story: "A plate shelf is hinged along its back edge AB — a ball-and-socket at A and a journal bearing at B — and held level by a cable from its corner C to E on the wall. It weighs W and carries a box P.",
  setup: {
    analysis: "rigid", about: "A",
    points: { A: [0, 0, 0], B: [3, 0, 0], C: [3, 2, 0], D: [0, 2, 0], E: [0, 0, 2], G: [1.5, 1, 0], F: [2.5, 1.5, 0] },
    plate: ["A", "B", "C", "D"], cables: [["C", "E"]],
    supports: [{ id: "A", type: "ball", at: "A" }, { id: "B", type: "bearing", at: "B", axis: "x" }],
    forces: [
      { id: "T", symbol: "T", kind: "cable", magnitude: null, dir: { from: "C", to: "E" } },
      { id: "W", symbol: "W", magnitude: 490.5, dir: down, at: "G" },
      { id: "P", symbol: "P", magnitude: 300, dir: down, at: "F" },
    ],
    steps3d: [{ eq: "sumMx", find: "T" }, { eq: "sumMy", find: "B_z" }, { eq: "sumFz", find: "A_z" }],
  },
  vary: [
    { path: "forces.#P.magnitude", min: 200, max: 400, step: 25 },
    { path: "forces.#W.magnitude", values: [392.4, 441.45, 490.5, 539.55, 588.6] },
    { path: "points.E.2", values: [1.5, 2, 2.5] },
  ],
  questions: {
    reactions: {
      instruction: "Find the cable's tension T and the vertical reactions $B_z$ and $A_z$.",
      ask: [{ quantity: "T", min: 0 }, { quantity: "B_z" }, { quantity: "A_z" }],
      hints: [
        "FBD: $A_x, A_y, A_z$ at the ball-and-socket, $B_y, B_z$ at the bearing (none along its shaft, x), T along CE, W and P down.",
        "Moments about the x axis (the hinge line AB): every reaction passes through it, leaving only T, W and P. $T$'s part up is $T u_z$, its arm about x is 2 m.",
        "Then moments about the y axis (through A) give $B_z$, and $\\Sigma F_z = 0$ gives $A_z$.",
      ],
    },
  },
});

export const windlass = scenario({
  name: "windlass on two bearings",
  story: "A windlass: a shaft along y on a thrust bearing at A and a journal bearing at B. A load hangs from its drum; a worker pushes the crank handle at C level, along −x, to hold it.",
  setup: {
    analysis: "rigid", about: "A",
    points: { A: [0, 0, 0], B: [0, 1, 0], H: [0.1, 0.4, 0], E: [0, 1.3, 0], C: [0, 1.3, 0.25] },
    body: ["A", "E", "C"],
    supports: [{ id: "A", type: "thrust", at: "A" }, { id: "B", type: "bearing", at: "B", axis: "y" }],
    forces: [
      { id: "W", symbol: "W", magnitude: 500, dir: down, at: "H" },
      { id: "P", symbol: "P", magnitude: null, dir: leftX, at: "C" },
    ],
  },
  vary: [
    { path: "forces.#W.magnitude", min: 300, max: 700, step: 25 },
    { path: "points.H.0", values: [0.08, 0.1, 0.12] },
  ],
  questions: {
    reactions: {
      instruction: "Find the push P that holds the load, and the bearing B's reactions $B_x$ and $B_z$.",
      ask: [{ quantity: "P", min: 0 }, { quantity: "B_x" }, { quantity: "B_z" }],
      hints: [
        "FBD: $A_x, A_y, A_z$ at the thrust bearing, $B_x, B_z$ at the journal bearing (none along the shaft), W down at the drum's edge, P along −x at the handle.",
        "Moments about the shaft (the y axis): the bearings drop out — only W (arm = the drum's radius) and P (arm = the crank's length) are left.",
        "Moments about the x and z axes through A give $B_z$ and $B_x$ (their arm is the distance AB along the shaft).",
      ],
    },
  },
});

export const boom3d = scenario({
  name: "boom on two cables",
  story: "A boom AB sticks out from a wall on a ball-and-socket at A, held by cables BC and BD. A load F hangs from its end B.",
  setup: {
    analysis: "rigid", about: "A",
    points: { A: [0, 0, 0], B: [4, 0, 0], C: [0, 2, 2], D: [0, -2, 2] },
    body: ["A", "B"], cables: [["B", "C"], ["B", "D"]],
    supports: [{ id: "A", type: "ball", at: "A" }],
    forces: [
      { id: "T_BC", symbol: "T_{BC}", kind: "cable", magnitude: null, dir: { from: "B", to: "C" } },
      { id: "T_BD", symbol: "T_{BD}", kind: "cable", magnitude: null, dir: { from: "B", to: "D" } },
      { id: "F", symbol: "F", magnitude: 600, dir: down, at: "B" },
    ],
  },
  vary: [
    { path: "forces.#F.magnitude", min: 400, max: 800, step: 25 },
    { paths: ["points.C.2", "points.D.2"], values: [1.5, 2, 2.5] },
  ],
  questions: {
    reactions: {
      instruction: "Find the tension in cable BC and the wall's push along the boom, $A_x$.",
      ask: [{ quantity: "T_BC", min: 0 }, { quantity: "A_x" }],
      hints: [
        "Each cable pulls B along its own unit vector, $\\mathbf{u} = \\mathbf{r}/r$.",
        "Moments about A: A's reactions drop out. The cables and F all act at B, 4 m out along x.",
        "The picture is symmetric, so the two tensions are equal. Then $\\Sigma F_x = 0$ gives $A_x$.",
      ],
    },
  },
});
