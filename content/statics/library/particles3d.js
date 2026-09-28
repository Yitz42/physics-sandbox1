// library/particles3d.js — the lesson library's particles in equilibrium in 3D (Unit 3.4; see
// src/subjects/statics/force3d-balance.js). A ring A hangs below a ceiling (z = 9 m) on three
// cables; ΣF_x = 0, ΣF_y = 0, ΣF_z = 0 find the three unknown sizes.
// Questions:
//   tensions   predict the unknown forces            solve   equations, then answers
// Hand checks (default numbers; z is up, coordinates in m):
//   crate on three cables: A (0, 0, 3); B (−3, −2, 9), C (2, −3, 9), D (2, 3, 9) — each 7 m from A,
//            so u_AB = (−3, −2, 6)/7, u_AC = (2, −3, 6)/7, u_AD = (2, 3, 6)/7. W = 50(9.81) = 490.5 N.
//            ΣF_x: −3T_AB + 2T_AC + 2T_AD = 0;  ΣF_y: −2T_AB − 3T_AC + 3T_AD = 0
//            → T_AD = 2.6 T_AC, T_AB = 2.4 T_AC;  ΣF_z: (6/7)(6 T_AC) = 490.5
//            → T_AC = 95.4 N, T_AB = 228.9 N, T_AD = 248.0 N.
//            (D (0, 4, 9): 138.7, 208.1, 232.2 N; D (1, 4, 9): 185.1, 168.3, 227.6 N;
//             D (−1, 4, 9): 89.4, 250.4, 241.8 N — all pulling.)
//   spring AD instead of the cable (k = 800 N/m): the same forces; s_AD = 248.0 / 800 = 0.310 m.
//   crate pulled aside: P = 150 N, azimuth 120°, elevation 10° → {−73.9 i + 127.9 j + 26.0 k} N;
//            T_AB = 113.3 N, T_AC = 325.7 N, T_AD = 102.8 N. Every version (P 100–175 N,
//            azimuth 115°–125°, 45–80 kg) keeps all three pulling (smallest 42.6 N).
//   lamp in the hall (solve): A (1, 1, 3); B (−1, −2, 9), C (4, −1, 9), D (−1, 4, 9) — 7 m each;
//            60 kg → T_AB = 114.4 N, T_AC = 274.7 N, T_AD = 297.6 N. (D (1, 5, 9), r = 7.21 m:
//            249.7, 166.5, 278.7 N.)
// (The same numbers are tested in tests/statics/force3d.test.js.)

import { scenario, edit } from "../../../src/core/library.js";

const cable = (id, to) => ({ id, symbol: `T_{A${to}}`, kind: "cable", magnitude: null, dir: { from: "A", to } });

// The standard room: ring A 3 m up, three anchors on the 9 m ceiling.
export const roomSetup = ({ D = [2, 3, 9], mass = 50 } = {}) => ({
  analysis: "equilibrium",
  points: { A: [0, 0, 3], B: [-3, -2, 9], C: [2, -3, 9], D }, // (no O: the crate hangs where it would be drawn)
  cables: [["A", "B"], ["A", "C"], ["A", "D"]],
  forces: [cable("T_AB", "B"), cable("T_AC", "C"), cable("T_AD", "D"), { id: "W", symbol: "W", kind: "weight", mass, at: "A" }],
});

const TENSIONS_ASK = [{ quantity: "T_AB", min: 0 }, { quantity: "T_AC", min: 0 }, { quantity: "T_AD", min: 0 }];
const TENSION_HINTS = [
  "For each cable: $\\mathbf{r} = \\mathbf{r}_{anchor} - \\mathbf{r}_A$, its length $r$, then $\\mathbf{u} = \\mathbf{r}/r$. The tension pulls along $\\mathbf{u}$.",
  "The FBD of ring A: three tensions and the weight $W = mg$ straight down ($-z$). Write $\\Sigma F_x = 0$, $\\Sigma F_y = 0$, $\\Sigma F_z = 0$.",
  "Three equations, three unknowns: use two of them to write two tensions in terms of the third, then substitute into the last.",
];

export const crateThreeCables = scenario({
  name: "crate on three cables",
  story: "A crate hangs from ring A, held by three cables to anchors B, C and D on the ceiling. The coordinates are in the key (metres; z is up).",
  setup: roomSetup(),
  vary: [
    { path: "forces.#W.mass", min: 20, max: 80, step: 5 },
    { path: "points.D", values: [[2, 3, 9], [0, 4, 9], [1, 4, 9], [-1, 4, 9]] },
  ],
  questions: {
    tensions: { instruction: "Predict the tension in each cable, then press **Test**.", ask: TENSIONS_ASK, hints: TENSION_HINTS },
    solve: {
      instruction: "Write the three equilibrium equations, then solve them for the three tensions.",
      ask: TENSIONS_ASK,
      solve: { steps: ["equations", "answer"] },
      hints: TENSION_HINTS,
    },
  },
});

// The same room with a spring from A to D instead of cable AD.
const springRoom = roomSetup();
springRoom.cables = [["A", "B"], ["A", "C"]];
springRoom.springs = [["A", "D"]];
springRoom.forces[2] = { id: "F_AD", symbol: "F_{AD}", kind: "spring", k: 800, magnitude: null, dir: { from: "A", to: "D" } };

export const crateOnSpring = scenario({
  name: "crate on two cables and a spring",
  story: "A crate hangs from ring A, held by cables AB and AC and by a spring AD (stiffness $k$ in the key) to the ceiling. Coordinates in the key (metres; z is up).",
  setup: springRoom,
  vary: [
    { path: "forces.#W.mass", min: 20, max: 80, step: 5 },
    { path: "forces.#F_AD.k", values: [500, 600, 800, 1000, 1200] },
  ],
  questions: {
    tensions: {
      instruction: "Predict the two cable tensions and how far the spring is **stretched**, $s_{AD}$, then press **Test**.",
      ask: [{ quantity: "T_AB", min: 0 }, { quantity: "T_AC", min: 0 }, { quantity: "F_AD.s", min: 0, precision: 0.01 }],
      hints: [
        "Treat the spring like a cable for the equilibrium: its force $F_{AD}$ pulls A toward D. Three unknowns: $T_{AB}$, $T_{AC}$, $F_{AD}$.",
        "Unit vectors from the coordinates, then $\\Sigma F_x = 0$, $\\Sigma F_y = 0$, $\\Sigma F_z = 0$.",
        "Then the spring law: $s = F_{AD}/k$ (metres, with $k$ in N/m).",
      ],
    },
  },
});

export const cratePulledAside = edit(crateThreeCables, {
  name: "crate pulled aside",
  story: "A crate hangs from ring A on three cables to the ceiling, and a worker steadies it with a rope pulling with $P$, given by an azimuth θ and an elevation φ. Coordinates in the key (metres; z is up).",
  set: { "points.D": [2, 3, 9] },
  fix: ["points.D"],
  add: { forces: [{ id: "P", symbol: "P", magnitude: 150, at: "A", dir: { azimuth: 120, elevation: 10 }, showAngles: { theta: "given", phi: "given" } }] },
  vary: [
    { path: "forces.#P.magnitude", min: 100, max: 175, step: 25 },
    { path: "forces.#P.dir.azimuth", values: [115, 120, 125] },
    { path: "forces.#W.mass", min: 45, max: 80, step: 5 },
  ],
  questions: {
    solve: null,
    tensions: {
      instruction: "Predict the tension in each cable, then press **Test**.",
      hints: [
        "$P$ is known: $P_z = P\\sin\\phi$, $P' = P\\cos\\phi$, then $P_x = P'\\cos\\theta$, $P_y = P'\\sin\\theta$.",
        "Each cable: $\\mathbf{u} = \\mathbf{r}/r$ from the coordinates. Four forces on A, three of them unknown.",
        "$\\Sigma F_x = 0$, $\\Sigma F_y = 0$, $\\Sigma F_z = 0$ — with $P$'s components as known numbers.",
      ],
    },
  },
});

export const hallLamp = scenario({
  name: "lamp in a hall",
  story: "A heavy lamp hangs from ring A in a hall, held by three cables to anchors B, C and D on the ceiling. Coordinates in the key (metres; z is up).",
  setup: {
    analysis: "equilibrium",
    points: { A: [1, 1, 3], B: [-1, -2, 9], C: [4, -1, 9], D: [-1, 4, 9] },
    cables: [["A", "B"], ["A", "C"], ["A", "D"]],
    forces: [cable("T_AB", "B"), cable("T_AC", "C"), cable("T_AD", "D"), { id: "W", symbol: "W", kind: "weight", mass: 60, at: "A" }],
  },
  vary: [
    { path: "forces.#W.mass", min: 30, max: 90, step: 2 },
    { path: "points.D", values: [[-1, 4, 9], [1, 5, 9]] },
  ],
  questions: {
    solve: {
      instruction: "Choose the correct equilibrium equations, then solve them for the three cable tensions.",
      ask: TENSIONS_ASK,
      solve: { steps: ["equations", "answer"] },
      hints: TENSION_HINTS,
    },
  },
});
