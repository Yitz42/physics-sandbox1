// Unit 2, stage 4 — debug: a student's FBD of ring A is wrong.
// Version 1: the weight is missing. Later versions: an arrow points the wrong way.
import { crateSetup } from "./crate.js";

export default {
  id: "02-particle-equilibrium/4-debug",
  challenge: "debug",
  solver: "statics.particle",
  title: "What's Wrong with This FBD?",
  mission: "Find the mistake in a student's free-body diagram of ring A.",
  instructions:
    "A student drew the free-body diagram of ring A (right) and wrote equations from it. Compare the FBD with the real setup (left) and find the mistake.",
  setup: crateSetup({ angleAB: 35, angleAC: 50, mass: 40 }),
  vary: [
    { path: "forces.#T_AB.direction.angle", values: [25, 30, 35, 40, 45] },
    { path: "forces.#T_AC.direction.angle", values: [35, 40, 50, 55, 60] },
    { path: "forces.#W.mass", min: 20, max: 80, step: 5 },
  ],
  debug: {
    view: "fbd",
    intro: "The student's equations (from their FBD):",
    mutations: [
      { kind: "remove", force: "W" },
      { kind: "reverse", force: "T_AB" },
      { kind: "reverse", force: "W" },
      { kind: "reverse", force: "T_AC" },
    ],
    missingChoices: [
      { id: "W", label: "The weight W of the crate" },
      { id: "N", label: "A normal force from the ceiling", feedback: "The ceiling doesn't touch ring A. It only acts on A through the cables — and those are already drawn." },
      { id: "T_AD", label: "A third cable tension", feedback: "Look at the space diagram: only two cables are attached to A." },
      { id: "F_g", label: "A force from the ground pushing up", feedback: "Nothing touches the ground here; the crate hangs freely." },
    ],
    notes: {
      T_AB: "$T_{AB}$ is drawn correctly: cable AB pulls ring A toward B, away from the ring.",
      T_AC: "$T_{AC}$ is drawn correctly: cable AC pulls ring A toward C, away from the ring.",
      W: "$W$ is drawn correctly: the crate's weight pulls A straight down.",
    },
  },
  hints: [
    "List everything attached to ring A in the space diagram. Each one needs an arrow.",
    "Cables can only pull, so a tension arrow always points away from the point, along its cable.",
    "Gravity always pulls straight down.",
  ],
  explanation:
    "A correct FBD shows **every** force on the isolated point, each pointing the way it really acts: cables pull away from the point along the cable, and weight points down. " +
    "One missing or reversed arrow makes both equations wrong, so check the FBD before writing any equation.",
};
