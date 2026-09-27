// library/friction.js — the lesson library's friction situations (Unit 9.1; see
// src/core/library.js and src/subjects/statics/friction.js).
// Axes: x' up the slope, y' away from it; F is positive UP the slope (to the right on a floor).
// Questions:
//   holds     a crate that holds: predict N and the friction F (not μ_s N!)
//   angle     the slope at which a crate starts to slide
//   start     the push (or pull) that just starts a crate moving
// Hand checks (default numbers):
//   crate on a ramp: 500 N, 20°, μs = 0.45: N = 500 cos 20° = 469.8 N; F = 500 sin 20° = 171.0 N up the
//            slope, less than μs N = 211.4 N — it holds.
//   tipping bed: μs = 0.5 → it starts to slide at tan θ = 0.5: θ = 26.6°.
//   floor push: 400 N crate, μs = 0.4, pushed 30° below the level: P cos 30° = μs(W + P sin 30°)
//            → P = 160 / (0.866 − 0.2) = 240.2 N.
//   sled: 300 N, μs = 0.3, rope 30° above the level: P cos 30° = μs(W − P sin 30°) → P = 90 / (0.866 + 0.15) = 88.6 N.
//   push up a ramp: 500 N, 25°, μs = 0.3, push along the slope: P = W(sin 25° + μs cos 25°) = 211.3 + 135.9 = 347.2 N.
//   painter's ladder (the solve stage): see content/statics/dry-friction/6-solve.js.

import { scenario } from "../../../src/core/library.js";

const ramp = (angle) => ({ angle, length: 6 });
const crate = { w: 1.2, h: 0.8, at: 3.2 };
const floorCrate = { w: 1.2, h: 0.9, at: 2.7 };
const floor = { angle: 0, length: 4.5 }; // (shorter than a ramp: the picture is bigger)
const steps = (a, b, s) => Array.from({ length: Math.round((b - a) / s) + 1 }, (_, i) => +(a + i * s).toFixed(6));

const FRICTION_HINTS = [
  "Use axes along the slope (x') and across it (y'). Across it: $N = W\\cos\\theta$ (plus or minus any push's part).",
  "Along it, friction is what equilibrium needs: $F = W\\sin\\theta$ (minus any push up the slope). It is NOT $\\mu_s N$ unless the crate is about to slip.",
  "Then check it: friction can give at most $\\mu_s N$. If $|F| \\le \\mu_s N$, the crate holds.",
];
const START_HINTS = [
  "About to move: friction is at its limit, $F = \\mu_s N$, pointing against the motion.",
  "The push has two parts: along the surface ($P\\cos\\alpha$) and across it ($P\\sin\\alpha$). The part across it changes N.",
  "Write $\\Sigma F_y = 0$ for N (with P in it), then $\\Sigma F_x = 0$ with $F = \\mu_s N$, and solve for P.",
];

export const rampCrate = scenario({
  name: "crate on a ramp",
  story: "A crate rests on a ramp. The coefficient of static friction between them is $\\mu_s$.",
  setup: { ramp: ramp(20), block: crate, weight: 500, mus: 0.45, muk: 0.35, showFbd: "reveal" },
  vary: [
    { path: "ramp.angle", values: [10, 12, 14, 16, 18, 20] },
    { path: "weight", min: 300, max: 800, step: 50 },
    { path: "mus", values: [0.4, 0.45, 0.5, 0.55] },
  ],
  questions: {
    holds: {
      instruction: "It doesn't move. Predict the normal force $N$ and the friction force $F$ on it ($F$ positive up the slope).",
      ask: [{ quantity: "N" }, { quantity: "F" }],
      hints: FRICTION_HINTS,
    },
  },
});

export const tippingBed = scenario({
  name: "tipping truck bed",
  story: "A dump truck's bed tilts up slowly with a crate on it. The coefficient of static friction between the crate and the bed is $\\mu_s$.",
  setup: { ramp: ramp(12), block: crate, weight: 600, mus: 0.5, showFbd: "reveal",
    find: { path: "ramp.angle", motion: "down", min: 0, max: 70, symbol: "\\theta", unit: "deg" } },
  vary: [
    { path: "mus", values: steps(0.3, 0.8, 0.05) },
    { path: "weight", min: 400, max: 900, step: 100 },
  ],
  questions: {
    angle: {
      instruction: "At what angle $\\theta$ does the crate start to slide?",
      ask: [{ quantity: "critical" }],
      hints: [
        "About to slide: $F = \\mu_s N$. Across the slope $N = W\\cos\\theta$; along it $F = W\\sin\\theta$.",
        "So $W\\sin\\theta = \\mu_s W\\cos\\theta$: the weight cancels.",
        "$\\tan\\theta = \\mu_s$, so $\\theta = \\tan^{-1}\\mu_s$ (calculator in degrees).",
      ],
    },
  },
});

export const floorPush = scenario({
  name: "crate pushed on a floor",
  story: "A worker pushes a crate across a level floor, pushing down at an angle to the floor. The coefficient of static friction is $\\mu_s$.",
  setup: { ramp: floor, block: floorCrate, weight: 400, mus: 0.4, showFbd: "reveal",
    forces: [{ id: "P", symbol: "P", magnitude: 150, along: "up", tilt: -30 }],
    find: { path: "forces.#P.magnitude", motion: "right", min: 0, max: 4000, symbol: "P", unit: "N" } },
  vary: [
    { path: "weight", min: 200, max: 600, step: 25 },
    { path: "mus", values: [0.3, 0.35, 0.4, 0.45, 0.5] },
    { path: "forces.#P.tilt", values: [-20, -25, -30] },
  ],
  questions: {
    start: { instruction: "What push $P$ just starts the crate moving?", ask: [{ quantity: "critical" }], hints: START_HINTS },
  },
});

export const sledPull = scenario({
  name: "sled pulled by a rope",
  story: "A loaded sled rests on snow. It is pulled by a rope at an angle above the level. The coefficient of static friction is $\\mu_s$.",
  setup: { ramp: floor, block: { w: 1.4, h: 0.6, at: 1.9, label: "" }, weight: 300, mus: 0.3, showFbd: "reveal",
    forces: [{ id: "P", symbol: "P", magnitude: 60, along: "up", tilt: 30, rope: true }],
    find: { path: "forces.#P.magnitude", motion: "right", min: 0, max: 4000, symbol: "P", unit: "N" } },
  vary: [
    { path: "weight", min: 200, max: 500, step: 25 },
    { path: "mus", values: [0.15, 0.2, 0.25, 0.3, 0.35] },
    { path: "forces.#P.tilt", values: [20, 25, 30, 35] },
  ],
  questions: {
    start: { instruction: "What pull $P$ just starts the sled moving?", ask: [{ quantity: "critical" }], hints: START_HINTS },
  },
});

export const rampPushUp = scenario({
  name: "crate pushed up a ramp",
  story: "A crate sits on a ramp. A worker pushes on it parallel to the slope, to move it UP the ramp. The coefficient of static friction is $\\mu_s$.",
  setup: { ramp: ramp(25), block: crate, weight: 500, mus: 0.3, showFbd: "reveal",
    forces: [{ id: "P", symbol: "P", magnitude: 100, along: "up" }],
    find: { path: "forces.#P.magnitude", motion: "up", min: 0, max: 4000, symbol: "P", unit: "N" } },
  vary: [
    { path: "ramp.angle", values: [15, 20, 25, 30] },
    { path: "weight", min: 300, max: 800, step: 50 },
    { path: "mus", values: [0.2, 0.25, 0.3, 0.35] },
  ],
  questions: {
    start: {
      instruction: "What push $P$ just starts the crate moving up the ramp?",
      ask: [{ quantity: "critical" }],
      hints: [
        "About to move UP: friction is at its limit and points DOWN the slope, against the motion.",
        "Across the slope: $N = W\\cos\\theta$ (the push is along the slope, so it doesn't change N).",
        "Along it: $P - W\\sin\\theta - \\mu_s N = 0$.",
      ],
    },
  },
});
