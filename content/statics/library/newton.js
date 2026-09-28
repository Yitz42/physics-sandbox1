// library/newton.js — the lesson library's Newton's-laws situations (Unit 1.1; see
// src/subjects/statics/newton.js). g = 9.81 m/s² unless said. Up and right positive.
// Questions:
//   weight   the weight (N), and what holds it
//   mass     the mass from a weight
//   accel    the acceleration a net force gives
//   cable    the cable force when the body accelerates
// Hand checks (default numbers):
//   person on a floor: 75 kg → W = 75(9.81) = 735.75 N; at rest N = W = 735.75 N.
//   crate weighing 2.5 kN: m = 2500 / 9.81 = 254.84 kg.
//   rover on the Moon: 1200 kg, g = 1.62 → W = 1944 N (on Earth it'd be 11 772 N).
//   crate pushed on ice: 20 kg, P = 100 N → a = 100/20 = 5 m/s² (N = W = 196.2 N; no friction).
//   elevator speeding up going up: 800 kg, a = 1.5 m/s² up → T − 7848 = 800(1.5) → T = 9048 N.
//   elevator slowing going down: 600 kg, a = 2 m/s² UP (slowing a downward motion) → T = 600(11.81) = 7086 N.

import { scenario } from "../../../src/core/library.js";

export const personOnFloor = scenario({
  name: "person on a floor",
  story: "A person stands still on a floor.",
  setup: { mass: 75, look: "floor", forces: [{ id: "N", symbol: "N", magnitude: null, direction: "up" }] },
  vary: [{ path: "mass", min: 45, max: 110, step: 1 }],
  questions: {
    weight: {
      instruction: "What is their weight W, and how hard does the floor push up on them (N)?",
      ask: [{ quantity: "W" }, { quantity: "N" }],
      hints: ["Weight is a force: $W = mg$, in newtons, with $g = 9.81$ m/s².", "They're at rest, so the forces on them balance (the first law): $\\Sigma F_y = N - W = 0$."],
    },
  },
});

export const heavyCrate = scenario({
  name: "crate weighing 2.5 kN",
  story: "A crate hangs at rest from a crane's cable. A scale in the cable reads its weight.",
  setup: { weight: 2500, look: "hanging", forces: [{ id: "T", symbol: "T", magnitude: null, direction: "up" }] },
  vary: [{ path: "weight", min: 1000, max: 6000, step: 100 }],
  questions: {
    mass: {
      instruction: "The scale reads the weight shown. What is the crate's mass?",
      ask: [{ quantity: "m" }],
      hints: ["$W = mg$, so $m = W/g$.", "A kilonewton is 1000 N. The mass comes out in kilograms."],
    },
  },
});

export const moonRover = scenario({
  name: "rover on the Moon",
  story: "A rover stands on the Moon, where $g = 1.62$ m/s².",
  setup: { mass: 1200, g: 1.62, look: "floor", forces: [{ id: "N", symbol: "N", magnitude: null, direction: "up" }] },
  vary: [{ path: "mass", min: 500, max: 2000, step: 25 }],
  questions: {
    weight: {
      instruction: "What does it weigh there?",
      ask: [{ quantity: "W" }],
      hints: ["Its mass is the same everywhere; its weight depends on g.", "$W = mg$ with the Moon's g."],
    },
  },
});

export const icePush = scenario({
  name: "crate pushed on ice",
  story: "A crate sits on smooth ice (no friction). Someone pushes it level with a force P.",
  setup: { mass: 20, look: "ice", forces: [{ id: "P", symbol: "P", magnitude: 100, direction: "right", push: true }, { id: "N", symbol: "N", magnitude: null, direction: "up" }] },
  vary: [{ path: "mass", min: 10, max: 60, step: 1 }, { path: "forces.#P.magnitude", values: [50, 80, 100, 120, 150] }],
  questions: {
    accel: {
      instruction: "What acceleration does the push give it?",
      ask: [{ quantity: "a", precision: 0.01 }],
      hints: ["Up and down, N and W balance. Sideways only P acts: it's the net force.", "The second law: $F = ma$, so $a = F/m$ — with m in kilograms."],
    },
  },
});

const cableHints = [
  "Draw the car's FBD: the cable pulls up with T, its weight W = mg pulls down.",
  "It's accelerating, so ΣF isn't zero: $\\Sigma F_y = T - W = m a_y$ (up positive).",
  "Speeding up going up, or slowing down going down, both mean the acceleration points UP.",
];

export const elevatorUp = scenario({
  name: "elevator speeding up",
  story: "An elevator car is hauled up by its cable, speeding up.",
  setup: { mass: 800, look: "elevator", accel: [0, 1.5], forces: [{ id: "T", symbol: "T", magnitude: null, direction: "up" }] },
  vary: [{ path: "mass", min: 500, max: 1200, step: 25 }, { path: "accel", values: [[0, 0.5], [0, 1], [0, 1.5], [0, 2]] }],
  // (Only T is asked: the second law's line shows W = mg as a number.)
  questions: { cable: { instruction: "Find the cable's pull T.", ask: [{ quantity: "T" }], hints: cableHints } },
});

export const elevatorSlowing = scenario({
  name: "elevator slowing on the way down",
  story: "An elevator car is going DOWN, and its cable slows it to a stop.",
  setup: { mass: 600, look: "elevator", accel: [0, 2], forces: [{ id: "T", symbol: "T", magnitude: null, direction: "up" }] },
  vary: [{ path: "mass", min: 400, max: 1000, step: 25 }, { path: "accel", values: [[0, 1], [0, 1.5], [0, 2], [0, 2.5]] }],
  questions: { cable: { instruction: "Find the cable's pull T while it slows.", ask: [{ quantity: "T" }], hints: cableHints } },
});
