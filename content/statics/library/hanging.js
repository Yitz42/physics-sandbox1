// library/hanging.js — the lesson library's "ring A held by two cables"
// situations (see src/core/library.js). Each is one real picture with its
// story and usual numbers, and the questions it can be asked:
//   tensions  predict both cable tensions (a predict stage)
//   solve     the whole problem: FBD, equations, answers (a solve stage)
// Any stage in any unit can use them: situations: [crate, balloon].map((s) => use(s, "tensions")).
//
// Every scenario names its two cables T_AB (to the left) and T_AC (to the
// right), so the same `ask` works for all of them. Hand checks are in the
// stage files that use them (cables/2-predict.js, cables/6-solve.js).

import { scenario, edit } from "../../../src/core/library.js";
import { crateSetup } from "../shared/crate.js";
import { trafficLightSetup, balloonSetup, lampAsideSetup } from "../shared/hanging.js";

const AB = "forces.#T_AB.direction.angle";
const AC = "forces.#T_AC.direction.angle";
const TENSIONS = "Predict the tension in each cable, then press **Test**.";
const SOLVE = "Work through the full problem: FBD, equations, answers.";
const solveSteps = (candidates) => ({ steps: ["fbd", "equations", "answer"], candidates });

// ---- A crate on two cables -------------------------------------------------------
export const crate = scenario({
  name: "crate",
  story: "The crate hangs at rest from ring A, held by cables AB and AC.",
  setup: crateSetup({ angleAB: 30, angleAC: 45, mass: 60 }),
  vary: [
    { path: AB, values: [20, 25, 30, 35, 40, 50, 55, 60] },
    { path: AC, values: [25, 30, 35, 40, 45, 50, 60, 65] },
    { path: "forces.#W.mass", min: 20, max: 120, step: 5 },
  ],
  questions: {
    tensions: {
      instruction: "Using the angles and mass in the picture, predict the tension in each cable, then press **Test**.",
      hints: [
        "Draw the FBD of ring A: $T_{AB}$ and $T_{AC}$ pull along the cables, $W = mg$ pulls straight down.",
        "$\\Sigma F_x = 0$: $-T_{AB}\\cos\\theta_{AB} + T_{AC}\\cos\\theta_{AC} = 0$. Use it to write $T_{AC}$ in terms of $T_{AB}$.",
        "Substitute into $\\Sigma F_y = 0$: $T_{AB}\\sin\\theta_{AB} + T_{AC}\\sin\\theta_{AC} - W = 0$.",
      ],
    },
  },
});

// ---- A traffic light on two nearly level wires --------------------------------------
export const trafficLight = scenario({
  name: "traffic light",
  story: "A traffic light hangs over the street from two wires strung between poles. The wires are nearly level.",
  setup: trafficLightSetup({ angleAB: 10, angleAC: 15, mass: 25 }),
  vary: [
    { path: AB, values: [6, 8, 10, 12, 15, 18] },
    { path: AC, values: [8, 10, 12, 15, 18, 20] },
    { path: "forces.#W.mass", min: 15, max: 40, step: 1 },
  ],
  questions: {
    tensions: {
      instruction: "Predict the tension in each wire, then press **Test**. (Guess first: more or less than the light's weight?)",
      hints: [
        "Isolate A, where the wires meet: $T_{AB}$ and $T_{AC}$ pull along the wires, $W = mg$ pulls down.",
        "The angles are measured from the level, so the vertical parts are $T\\sin\\theta$ — small, because the angles are small.",
        "$\\Sigma F_y = 0$: $T_{AB}\\sin\\theta_{AB} + T_{AC}\\sin\\theta_{AC} = W$. Small sines mean big tensions!",
      ],
    },
  },
});

// The same traffic light with wire AB on a 5-12-13 slope (its parts read off the slope).
export const trafficLightOnSlope = edit(trafficLight, {
  story: "A traffic light hangs at A from two wires strung between poles. Wire AB rises on a 5-12-13 slope; wire AC is at an angle.",
  set: { "forces.#T_AB.direction": { slope: [-12, 5] }, [AC]: 20, "forces.#W.mass": 20 },
  fix: [AB], // (AB is a slope now: its angle no longer changes)
  questions: {
    tensions: null, // (its hints talk about AB's angle)
    solve: {
      instruction: SOLVE,
      vary: [
        { path: AC, min: 10, max: 30, step: 1 },
        { path: "forces.#W.mass", min: 12, max: 40, step: 1 },
      ],
      solve: solveSteps([
        { id: "T_AB" },
        { id: "T_AC" },
        { id: "W", missing: "A force is missing. What does gravity do to the traffic light hanging from A?" },
        { id: "F_pole", symbol: "F_{pole}", feedback: "The poles don't touch A. They act on A only through the wires — and that pull IS the tension." },
        { id: "F_wind", symbol: "F_{wind}", feedback: "No wind is mentioned, so there's no wind force. Only draw forces the problem gives you (or that come from contact and gravity)." },
      ]),
      hints: [
        "Isolate A, where the wires and the light's cord meet: two wire tensions and the weight $W$.",
        "Wire AB's slope gives its components directly: $-\\tfrac{12}{13}T_{AB}$ in x, $+\\tfrac{5}{13}T_{AB}$ in y.",
        "Solve $\\Sigma F_x = 0$ for $T_{AC}$ in terms of $T_{AB}$, then substitute into $\\Sigma F_y = 0$.",
      ],
    },
  },
});

// ---- A balloon held down by two tethers ---------------------------------------------
export const balloon = scenario({
  name: "balloon",
  story: "A balloon pulls up on ring A with a net lift $F_L$ (its buoyancy minus its own weight). Two tethers hold it down to the ground.",
  setup: balloonSetup({ angleAB: 40, angleAC: 55, lift: 600 }),
  vary: [
    { path: AB, values: [30, 35, 40, 45, 50, 55, 60] },
    { path: AC, values: [30, 35, 40, 45, 50, 55, 60] },
    { path: "forces.#F_L.magnitude", min: 300, max: 900, step: 50 },
  ],
  questions: {
    tensions: {
      instruction: "Predict the tension in each tether, then press **Test**.",
      hints: [
        "Isolate A: $F_L$ pulls up, and each tether pulls DOWN along itself, toward the ground.",
        "$\\Sigma F_y = 0$: $F_L - T_{AB}\\sin\\theta_{AB} - T_{AC}\\sin\\theta_{AC} = 0$. The tethers' vertical parts are negative.",
        "$\\Sigma F_x = 0$: $-T_{AB}\\cos\\theta_{AB} + T_{AC}\\cos\\theta_{AC} = 0$, the same as for a hanging crate.",
      ],
    },
  },
});

// The same balloon with tether AB on a 3-4-5 slope.
export const balloonOnSlope = edit(balloon, {
  story:
    "A balloon pulls up on ring A with a net lift $F_L$ (its buoyancy minus its own weight). Tether AB runs down to the ground on a 3-4-5 slope; " +
    "tether AC is at an angle below the level.",
  set: { "forces.#T_AB.direction": { slope: [-3, -4] }, [AC]: 50, "forces.#F_L.magnitude": 700 },
  fix: [AB], // (AB is a slope now: its angle no longer changes)
  questions: {
    tensions: null, // (its hints talk about AB's angle)
    solve: {
      instruction: SOLVE,
      vary: [
        { path: AC, min: 35, max: 65, step: 1 },
        { path: "forces.#F_L.magnitude", min: 300, max: 900, step: 10 },
      ],
      solve: solveSteps([
        { id: "T_AB" },
        { id: "T_AC" },
        { id: "F_L", missing: "A force is missing. What is keeping the tethers tight? What does the balloon do to ring A?" },
        { id: "W", symbol: "W", feedback: "The balloon's weight is already inside $F_L$: it's the NET lift (buoyancy minus weight). Adding $W$ would count it twice." },
        { id: "N", symbol: "N", feedback: "Nothing is pressed against ring A, so there's no normal force. The ground acts on A only through the tethers." },
      ]),
      hints: [
        "Isolate ring A: the balloon pulls up with $F_L$, and each tether pulls DOWN along itself, toward the ground.",
        "Tether AB's slope gives its components: $-\\tfrac{3}{5}T_{AB}$ in x and $-\\tfrac{4}{5}T_{AB}$ in y (down!).",
        "$\\Sigma F_y = 0$: $F_L - \\tfrac{4}{5}T_{AB} - T_{AC}\\sin\\theta = 0$. Get $T_{AC}$ from $\\Sigma F_x = 0$ first, then substitute.",
      ],
    },
  },
});

// ---- A lamp pulled aside by a level cord ----------------------------------------------
export const lampAside = scenario({
  name: "lamp aside",
  story: "A lamp hangs from cable AB. A level cord AC pulls it aside to the wall.",
  setup: lampAsideSetup({ angleAB: 60, mass: 12 }),
  vary: [
    { path: AB, values: [40, 45, 50, 55, 60, 65, 70] },
    { path: "forces.#W.mass", min: 4, max: 20, step: 1 },
  ],
  questions: {
    tensions: {
      instruction: "Predict the tension in the cable and in the cord, then press **Test**.",
      hints: [
        "Isolate A: $T_{AB}$ pulls up-left along the cable, $T_{AC}$ pulls straight right, $W$ pulls down.",
        "The cord is level, so it has no vertical part. $\\Sigma F_y = 0$ has only $T_{AB}$ in it: $T_{AB}\\sin\\theta = W$.",
        "Then $\\Sigma F_x = 0$: $T_{AC} = T_{AB}\\cos\\theta$.",
      ],
    },
  },
});

// ---- A lamp on a 3-4-5 cable and an angled one ------------------------------------------
export const lamp = scenario({
  name: "lamp",
  story: "A lamp hangs from ring A. Cable AB rises on a 3-4-5 slope; cable AC is at an angle.",
  setup: {
    analysis: "equilibrium",
    point: { at: [0, 0], label: "A" },
    forces: [
      { id: "T_AB", symbol: "T_{AB}", kind: "cable", magnitude: null, direction: { slope: [-4, 3] }, anchor: { label: "B", length: 2.2 } },
      { id: "T_AC", symbol: "T_{AC}", kind: "cable", magnitude: null, direction: { angle: 45, from: "+x", toward: "+y" }, anchor: { label: "C", length: 2 } },
      { id: "W", symbol: "W", kind: "weight", mass: 20, object: "lamp" },
    ],
  },
  vary: [
    { path: AC, min: 30, max: 60, step: 1 },
    { path: "forces.#W.mass", min: 10, max: 40, step: 1 },
  ],
  questions: {
    tensions: {
      instruction: TENSIONS,
      hints: [
        "Isolate ring A: two cable tensions and the lamp's weight $W = mg$.",
        "Cable AB's slope gives its components directly: $-\\tfrac{4}{5}T_{AB}$ in x, $+\\tfrac{3}{5}T_{AB}$ in y.",
        "Solve $\\Sigma F_x = 0$ for $T_{AC}$ in terms of $T_{AB}$, then substitute into $\\Sigma F_y = 0$.",
      ],
    },
    solve: {
      instruction: SOLVE,
      // Forces offered in the palette. The last two don't act on A.
      solve: solveSteps([
        { id: "T_AB" },
        { id: "T_AC" },
        { id: "W", missing: "A force is missing. What does gravity do to the lamp hanging from A?" },
        { id: "N", symbol: "N", feedback: "There's no normal force: nothing is pressed against ring A. Normal forces come from surfaces in contact." },
        { id: "F_ceiling", symbol: "F_{ceiling}", feedback: "The ceiling doesn't touch A. Its effect reaches A only through the cables — that IS the tension." },
      ]),
      hints: [
        "Isolate ring A. What is attached to it? Two cables and the lamp.",
        "Cable AB's slope gives its components directly: $-\\tfrac{4}{5}T_{AB}$ in x, $+\\tfrac{3}{5}T_{AB}$ in y.",
        "Solve $\\Sigma F_x = 0$ for $T_{AC}$ in terms of $T_{AB}$, then substitute into $\\Sigma F_y = 0$.",
      ],
    },
  },
});
