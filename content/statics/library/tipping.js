// library/tipping.js — the lesson library's tipping-versus-slipping situations (Unit 9.2;
// see src/core/library.js and src/subjects/statics/friction-tip.js).
// A crate of width w and height h; O is the corner it would tip about. At tipping, the
// floor's push N acts right at O, so ΣM_O = 0 gives the tipping push directly.
// Questions:
//   which    the push that starts it slipping, the push that tips it, and which comes first
//   angles   a slope: the angle it starts to slide, the angle it tips, which comes first
// Hand checks (default numbers):
//   tall crate: 600 N, 0.8 m wide, 1.6 m tall, μs = 0.4, pushed level 1.2 m up.
//            slip: P = μs W = 240 N;  tip: P(1.2) = W(0.4) → P = 200 N  → it TIPS first, at 200 N.
//   filing cabinet: 500 N, 0.6 m wide, 1.3 m tall, μs = 0.35, pushed level 0.4 m up.
//            slip: P = 175 N;  tip: P(0.4) = 500(0.3) → P = 375 N  → it SLIPS first, at 175 N.
//   fridge on a truck bed: 0.7 m wide, 1.8 m tall, μs = 0.5.
//            slip: tan θ = μs → θ = 26.57°;  tip: W's line through the lower corner, tan θ = w/h
//            → θ = tan⁻¹(0.7/1.8) = 21.25°  → it TIPS first, at 21.25°.
//   crate on a rope: 500 N, 1.0 m cube, μs = 0.5, rope at the top front corner, 30° above level.
//            slip: P cos 30° = μs(W − P sin 30°) → P = 250 / (0.8660 + 0.25) = 224.0 N;
//            tip (about the front corner O, right under the rope): P cos 30° (1.0) = W (0.5)
//            → P = 250 / 0.8660 = 288.7 N  → it SLIPS first, at 224.0 N.

import { scenario } from "../../../src/core/library.js";

const floor = { angle: 0, length: 3 };
const pushFind = { path: "forces.#P.magnitude", motion: "right", min: 0, max: 5000, symbol: "P", unit: "N" };

const WHICH_HINTS = [
  "Slipping: friction reaches its limit. Here N = W, so $P_{\\text{slip}} = \\mu_s W$ (plus any push's part across the floor).",
  "Tipping: the floor's push N has moved all the way to the corner O. Take moments about O — N and friction both act at O and drop out.",
  "$\\Sigma M_O$: the push's moment (its size × its height above the floor) against the weight's (W × half the width). The smaller of the two pushes is what happens first.",
];

export const tallCrate = scenario({
  name: "tall crate pushed high",
  story: "A worker pushes a tall crate across a level floor, pushing level at a height above the floor. O is its front bottom corner.",
  setup: { ramp: floor, block: { w: 0.8, h: 1.6, at: 1.5 }, weight: 600, mus: 0.4, showFbd: "reveal",
    forces: [{ id: "P", symbol: "P", magnitude: 100, along: "up", height: 1.2 }],
    tipping: { about: "right" }, find: pushFind },
  vary: [
    { path: "weight", min: 400, max: 800, step: 50 },
    { path: "mus", values: [0.35, 0.4, 0.45] },
    { path: "forces.#P.height", values: [1.1, 1.2, 1.4, 1.5] },
  ],
  questions: {
    which: {
      instruction: "Find the push that would start it slipping, the push that would tip it, and so the push at which it first moves.",
      ask: [{ quantity: "criticalSlip" }, { quantity: "criticalTip" }, { quantity: "critical" }],
      hints: WHICH_HINTS,
    },
  },
});

export const filingCabinet = scenario({
  name: "filing cabinet pushed low",
  story: "A filing cabinet stands on a level floor. Someone pushes it level, low down. O is its front bottom corner.",
  setup: { ramp: floor, block: { w: 0.6, h: 1.3, at: 1.5, label: "" }, weight: 500, mus: 0.35, showFbd: "reveal",
    forces: [{ id: "P", symbol: "P", magnitude: 100, along: "up", height: 0.4 }],
    tipping: { about: "right" }, find: pushFind },
  vary: [
    { path: "weight", min: 300, max: 700, step: 50 },
    { path: "mus", values: [0.3, 0.35, 0.4] },
    { path: "forces.#P.height", values: [0.3, 0.4, 0.5] },
  ],
  questions: {
    which: {
      instruction: "Find the push that would start it slipping, the push that would tip it, and so the push at which it first moves.",
      ask: [{ quantity: "criticalSlip" }, { quantity: "criticalTip" }, { quantity: "critical" }],
      hints: WHICH_HINTS,
    },
  },
});

export const truckFridge = scenario({
  name: "fridge on a tipping truck bed",
  story: "A tall fridge stands on a truck's bed, which tilts up slowly. O is the fridge's lower corner, down the slope.",
  setup: { ramp: { angle: 10, length: 4 }, block: { w: 0.7, h: 1.8, at: 2.2 }, weight: 900, mus: 0.5, showFbd: "reveal",
    tipping: { about: "down" },
    find: { path: "ramp.angle", motion: "down", min: 0, max: 70, symbol: "\\theta", unit: "deg" } },
  vary: [
    // (Never a tie: tan θ_tip = w/1.8 is 0.333, 0.389 or 0.444; μs never within 0.03 of those.)
    { path: "mus", values: [0.3, 0.35, 0.5, 0.55] },
    { path: "block.w", values: [0.6, 0.7, 0.8] },
  ],
  questions: {
    angles: {
      instruction: "At what angle would it start to slide? At what angle would it tip? And so at what angle does it first move?",
      ask: [{ quantity: "criticalSlip", precision: 0.1 }, { quantity: "criticalTip", precision: 0.1 }, { quantity: "critical", precision: 0.1 }],
      hints: [
        "Slipping: as for any crate, $\\tan\\theta = \\mu_s$ — the weight cancels.",
        "Tipping: it tips once the weight's line (straight down from the centre) passes outside the lower corner O.",
        "That happens when $\\tan\\theta = \\dfrac{w/2}{h/2} = \\dfrac{w}{h}$. The smaller angle comes first.",
      ],
    },
  },
});

export const ropeCrate = scenario({
  name: "crate pulled by a rope at its top",
  story: "A crate on a level floor is pulled by a rope tied to its top front corner, at an angle above the level. O is its front bottom corner, right under the rope.",
  setup: { ramp: floor, block: { w: 1.0, h: 1.0, at: 1.3, label: "" }, weight: 500, mus: 0.5, showFbd: "reveal",
    forces: [{ id: "P", symbol: "P", magnitude: 100, along: "up", tilt: 30, rope: true, height: 1.0 }],
    tipping: { about: "right" }, find: pushFind },
  vary: [
    { path: "weight", min: 300, max: 700, step: 50 },
    { path: "mus", values: [0.3, 0.4, 0.5, 0.6] },
    { path: "block.w", values: [0.6, 0.8, 1.0] },
    { path: "forces.#P.tilt", values: [20, 30, 40] },
  ],
  questions: {
    which: {
      instruction: "Find the pull that would start it slipping, the pull that would tip it, and so the pull at which it first moves.",
      ask: [{ quantity: "criticalSlip" }, { quantity: "criticalTip" }, { quantity: "critical" }],
      hints: [
        "Slipping: the rope's upward part lifts some weight off the floor, $N = W - P\\sin\\alpha$; then $P\\cos\\alpha = \\mu_s N$.",
        "Tipping: moments about O. The rope's upward part acts straight above O — no arm. Its level part has arm h.",
        "$P\\cos\\alpha\\,h = W\\,\\tfrac{w}{2}$. The smaller of the two pulls happens first.",
      ],
    },
  },
});
