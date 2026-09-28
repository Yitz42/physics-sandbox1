// library/mixed-rings.js — the lesson library's equilibrium-of-a-ring situations that
// mix Chapter 3 with Chapter 2 (Unit 3.5, Chapter 3 challenge): cables, springs and
// pulleys whose directions come from COORDINATES (r_AB = r_B − r_A, u = r / r), a
// spring whose length comes from its end points, and the heaviest load two cables
// can hold. ΣFx = 0 and ΣFy = 0 at the ring every time (src/subjects/statics/particle.js).
// Questions:
//   tensions   predict the unknown forces            solve   the whole problem, FBD first
// Hand checks (default numbers):
//   crate, coordinates: A (2, 1), B (−1, 5): u_AB = {−0.6 i + 0.8 j}; C (7, 3): r_AC = {5 i + 2 j} m,
//            r_AC = √29 = 5.385 m, u_AC = {0.9285 i + 0.3714 j}; W = 40(9.81) = 392.4 N.
//            ΣFx: −0.6 T_AB + 0.9285 T_AC = 0 → T_AB = 1.5475 T_AC;
//            ΣFy: 0.8(1.5475) T_AC + 0.3714 T_AC = 392.4 → T_AC = 243.8 N, T_AB = 377.3 N.
//   spring lamp: A (0, 0), B (−1.2, 1.6): the spring is r_AB = 2.0 m long, l₀ = 1.5 m, so
//            s = 0.5 m and F_AB = k s = 200(0.5) = 100 N, pulling along u_AB = {−0.6 i + 0.8 j}.
//            Cable AC at 40° above +x: ΣFx: −60 + T_AC cos 40° = 0 → T_AC = 78.3 N;
//            ΣFy: 80 + 78.3 sin 40° − W = 0 → W = 130.3 N (the lamp weighs 130.3 N, 13.3 kg).
//   pulley, coordinates: A (3, 1), B (0, 5): u_AB = {−0.6 i + 0.8 j}; C (8, 4): r_AC = {5 i + 3 j} m,
//            √34 = 5.831 m, u_AC = {0.8575 i + 0.5145 j}; W = 30(9.81) = 294.3 N; rope AD level, left.
//            ΣFy: T(0.8 + 0.5145) = 294.3 → T = 223.9 N; ΣFx: T(−0.6 + 0.8575) − T_AD = 0 → T_AD = 57.6 N.
//   heaviest crate: cables at 30° (AB) and 50° (AC) above level, each rated 500 N.
//            ΣFx: T_AB cos 30° = T_AC cos 50°, so T_AC = 1.347 T_AB: the STEEPER cable AC carries
//            more and reaches 500 N first. T_AB = 500 cos 50° / cos 30° = 371.1 N,
//            W = 371.1 sin 30° + 500 sin 50° = 568.6 N (58.0 kg). With AB 20°–35° and AC 45°–60°
//            (every version) AC is always the steeper one.
// (The same numbers are tested in tests/statics/particle.test.js.)

import { scenario } from "../../../src/core/library.js";
import { crateSetup } from "../shared/crate.js";

export const crateByCoordinates = scenario({
  name: "crate, cables to coordinates",
  story: "A crate hangs at rest from ring A. Cables run from A to anchors B and C; the coordinates of A, B and C are in the picture (in m).",
  setup: {
    analysis: "equilibrium",
    point: { at: [2, 1], label: "A" },
    forces: [
      { id: "T_AB", symbol: "T_{AB}", kind: "cable", magnitude: null, direction: { points: [[2, 1], [-1, 5]], names: ["A", "B"] } },
      { id: "T_AC", symbol: "T_{AC}", kind: "cable", magnitude: null, direction: { points: [[2, 1], [7, 3]], names: ["A", "C"] } },
      { id: "W", symbol: "W", kind: "weight", mass: 40 },
    ],
  },
  vary: [
    { path: "forces.#W.mass", min: 20, max: 80, step: 5 },
    { path: "forces.#T_AB.direction.points.1", values: [[-1, 5], [0, 5]] },
    { path: "forces.#T_AC.direction.points.1", values: [[7, 3], [6, 4], [8, 5]] },
  ],
  questions: {
    tensions: {
      instruction: "Predict the tension in each cable, then press **Test**.",
      ask: [{ quantity: "T_AB", min: 0 }, { quantity: "T_AC", min: 0 }],
      hints: [
        "No angles are given: each cable's direction comes from coordinates, $\\mathbf{u}_{AB} = \\mathbf{r}_{AB}/r_{AB}$ with $\\mathbf{r}_{AB} = \\mathbf{r}_B - \\mathbf{r}_A$.",
        "Then the usual FBD of ring A: $T_{AB}\\,\\mathbf{u}_{AB} + T_{AC}\\,\\mathbf{u}_{AC} + \\mathbf{W} = \\mathbf{0}$, one equation for x and one for y.",
        "Solve $\\Sigma F_x = 0$ for one tension in terms of the other, then substitute into $\\Sigma F_y = 0$.",
      ],
    },
  },
});

// Spring AB from A (0, 0) to B (−1.2, 1.6): its stretch is the length between them (2.0 m)
// minus l₀, set here to match. (Its size is worked out by the student: shown as "?".)
const springAB = (l0, stretch) => ({ id: "F_AB", symbol: "F_{AB}", kind: "spring", k: 200, unstretched: l0, stretch, hideMagnitude: true,
  direction: { points: [[0, 0], [-1.2, 1.6]], names: ["A", "B"] } });

export const springLampByCoordinates = scenario({
  name: "lamp on a spring between two points",
  story: "A lamp hangs from ring A, held by spring AB and cable AC. The spring's ends are at A and B (coordinates in the picture, in m); its stiffness $k$ and unstretched length $l_0$ are under the picture. The lamp's weight is NOT given.",
  setup: {
    analysis: "equilibrium",
    point: { at: [0, 0], label: "A" },
    forces: [
      springAB(1.5, 0.5),
      { id: "T_AC", symbol: "T_{AC}", kind: "cable", magnitude: null, direction: { angle: 40, from: "+x", toward: "+y" }, anchor: { label: "C", length: 1.8 } },
      { id: "W", symbol: "W", kind: "weight", mass: null, object: "lamp" },
    ],
  },
  vary: [
    // A different spring each version: l₀ and its stretch always add up to the 2.0 m between A and B …
    { path: "forces.#F_AB", values: [[1.5, 0.5], [1.4, 0.6], [1.6, 0.4]].map(([l0, s]) => springAB(l0, s)) },
    // … then its stiffness.
    { path: "forces.#F_AB.k", min: 150, max: 300, step: 25 },
    { path: "forces.#T_AC.direction.angle", min: 30, max: 60, step: 5 },
  ],
  questions: {
    tensions: {
      instruction: "Find the spring's force $F_{AB}$, the cable tension $T_{AC}$ and the lamp's weight $W$, then press **Test**.",
      ask: [{ quantity: "F_AB", min: 0 }, { quantity: "T_AC", min: 0 }, { quantity: "W", min: 0 }],
      hints: [
        "The spring's length is the distance from A to B: $l = r_{AB} = \\sqrt{\\Delta x^2 + \\Delta y^2}$. Its stretch is $s = l - l_0$, so $F_{AB} = k s$.",
        "Now $F_{AB}$ is known. The spring pulls A toward B, along $\\mathbf{u}_{AB} = \\mathbf{r}_{AB}/r_{AB}$.",
        "$\\Sigma F_x = 0$ has only $F_{AB}$ and $T_{AC}$ in it: find $T_{AC}$. Then $\\Sigma F_y = 0$ gives $W$.",
      ],
    },
  },
});

export const pulleyByCoordinates = scenario({
  name: "pulley on a cable to coordinates",
  story: "A crate hangs from pulley A, which rides on cable BAC; the cable's ends are tied at B and C (coordinates in the picture, in m). A level rope AD holds the pulley in place.",
  setup: {
    analysis: "equilibrium",
    point: { at: [3, 1], label: "A", object: "pulley" },
    forces: [
      { id: "T_AB", symbol: "T", shared: "T", kind: "cable", magnitude: null, direction: { points: [[3, 1], [0, 5]], names: ["A", "B"] } },
      { id: "T_AC", symbol: "T", shared: "T", kind: "cable", magnitude: null, direction: { points: [[3, 1], [8, 4]], names: ["A", "C"] } },
      { id: "T_AD", symbol: "T_{AD}", kind: "cable", magnitude: null, direction: "left", anchor: { label: "D", length: 1.4 } },
      { id: "W", symbol: "W", kind: "weight", mass: 30 },
    ],
  },
  // (Every version has the right side flatter than the left, so rope AD always pulls.)
  vary: [
    { path: "forces.#W.mass", min: 10, max: 60, step: 5 },
    { path: "forces.#T_AB.direction.points.1", values: [[0, 5], [1, 5]] },
    { path: "forces.#T_AC.direction.points.1", values: [[8, 4], [7, 4], [9, 5]] },
  ],
  questions: {
    tensions: {
      instruction: "Predict the cable's tension $T$ and the rope's pull $T_{AD}$, then press **Test**.",
      ask: [{ quantity: "T", min: 0 }, { quantity: "T_AD", min: 0 }],
      hints: [
        "The cable runs over the pulley, so it pulls TWICE with the same tension $T$: along $\\mathbf{u}_{AB}$ and along $\\mathbf{u}_{AC}$.",
        "Get both unit vectors from the coordinates, $\\mathbf{u} = \\mathbf{r}/r$.",
        "$\\Sigma F_y = 0$ has only $T$ and $W$ in it (the rope is level). Then $\\Sigma F_x = 0$ gives $T_{AD}$.",
      ],
    },
    solve: {
      instruction: "Work through the full problem: FBD of the pulley, equations, answers.",
      ask: [{ quantity: "T", min: 0 }, { quantity: "T_AD", min: 0 }],
      solve: {
        steps: ["fbd", "equations", "answer"],
        candidates: [
          { id: "T_AB", missing: "A force is missing: the cable pulls the pulley toward B as well as toward C — TWICE, with the same $T$." },
          { id: "T_AC", missing: "A force is missing: the cable pulls the pulley toward C as well as toward B — TWICE, with the same $T$." },
          { id: "T_AD" },
          { id: "W", missing: "A force is missing. What does gravity do to the crate hanging from the pulley?" },
          { id: "r_AB", symbol: "r_{AB}", feedback: "$\\mathbf{r}_{AB}$ is a position vector, in metres: it gives the cable's DIRECTION, not a force. The force along it is $T\\,\\mathbf{u}_{AB}$." },
        ],
      },
      hints: [
        "Isolate the pulley: the cable pulls toward B and toward C (same $T$), the rope pulls left, the crate pulls down.",
        "Each cable side's fractions come from its coordinates: $\\dfrac{x_B - x_A}{r_{AB}}$ and $\\dfrac{y_B - y_A}{r_{AB}}$.",
        "$\\Sigma F_y = 0$ has one unknown, $T$. Then $\\Sigma F_x = 0$ gives $T_{AD}$.",
      ],
    },
  },
});

// The rating check (5-concept-check, 6-solve): which cable reaches its limit first?
// The steeper one, AC, is set at its 500 N rating (shown as "?" until solved); the crate's
// weight W is the unknown.
const heaviest = crateSetup({ angleAB: 30, angleAC: 50, mass: null });
heaviest.forces.find((f) => f.id === "T_AC").magnitude = 500;
heaviest.forces.find((f) => f.id === "T_AC").hideMagnitude = true;

export const heaviestCrate = scenario({
  name: "heaviest crate on two rated cables",
  story: "A crate hangs from ring A on cables AB and AC, at the angles in the picture. **Each cable is rated for 500 N.** How heavy can the crate be?",
  setup: heaviest,
  vary: [
    { path: "forces.#T_AB.direction.angle", min: 20, max: 35, step: 1 },
    { path: "forces.#T_AC.direction.angle", min: 45, max: 60, step: 1 },
  ],
  questions: {
    solve: {
      instruction: "Decide which cable reaches 500 N first, then find the heaviest weight $W$ and the other cable's tension at that load.",
      ask: [{ quantity: "W", min: 0 }, { quantity: "T_AB", min: 0 }],
      solve: {
        steps: ["choices", "equations", "answer"],
        choicesName: "Which cable limits?",
        choices: [
          {
            title: "As the crate gets heavier, both tensions grow in proportion. Which cable reaches **500 N** first?",
            options: [
              { tex: "\\text{AC, the steeper cable}", correct: true },
              { tex: "\\text{AB, the flatter cable}", kind: "concept", feedback: "$\\Sigma F_x = 0$: $T_{AB}\\cos\\theta_{AB} = T_{AC}\\cos\\theta_{AC}$. The steeper cable has the smaller cosine, so it needs the BIGGER tension to match the other's sideways pull." },
              { tex: "\\text{both at the same load}", kind: "concept", feedback: "Only if the two cables made equal angles. Here $\\Sigma F_x = 0$ makes their tensions different: $T_{AC}/T_{AB} = \\cos\\theta_{AB}/\\cos\\theta_{AC}$." },
              { tex: "\\text{it depends on the crate's mass}", kind: "concept", feedback: "The RATIO of the tensions comes from the angles alone ($\\Sigma F_x = 0$); a heavier crate scales both by the same factor. So the same cable always reaches its limit first." },
            ],
          },
        ],
        choicesDone: "So at the heaviest load, $T_{AC} = 500$ N exactly; the unknowns are $T_{AB}$ and $W$.",
      },
      hints: [
        "At the limit, set the cable that fails first to its rating: $T_{AC} = 500$ N. Now the unknowns are $T_{AB}$ and $W$.",
        "$\\Sigma F_x = 0$: $-T_{AB}\\cos\\theta_{AB} + 500\\cos\\theta_{AC} = 0$ gives $T_{AB}$ — check it's under 500 N.",
        "$\\Sigma F_y = 0$: $T_{AB}\\sin\\theta_{AB} + 500\\sin\\theta_{AC} - W = 0$ gives $W$.",
      ],
    },
  },
});
