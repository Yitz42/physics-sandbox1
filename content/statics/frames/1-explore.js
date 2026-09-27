// Unit 5.4, stage 1 — explore: a stepladder (A-frame). Take it apart, raise the crossbar,
// move the load, and watch the forces the parts put on each other.
// The ladder and its hand checks are in the lesson library (library/frames.js):
//   load at the top: F_DE = P/(4 − h)  (h = 1: P/3; h = 2: P/2; > 800 N for P = 1000 once h > 2.75)
//   load on leg AC at (1.5, 3): F_DE = 0.75P/(4 − h)  (h = 2: 0.375P; > 400 N for P = 1000 once h > 2.125)

import { aFrame, A_FRAME_VIEW } from "../library/frames.js";

const LEG = { id: "P", symbol: "P", magnitude: 1000, direction: "down", at: [1.5, 3], body: "AC" };
const TOP = { id: "P", symbol: "P", magnitude: 1000, direction: "down", at: [2, 4], body: "AC" };

export default {
  id: "frames/1-explore",
  challenge: "explore",
  solver: "statics.frame",
  title: "Take It Apart",
  mission: "Take the ladder apart and see how its parts push and pull on each other.",
  instructions:
    "A stepladder is two legs pinned together at the top C, held apart by a crossbar DE. Leg AC stands on a pin at A, leg BC on a roller at B. " +
    "**Take it apart** to see the forces each part puts on the other, raise or lower the crossbar, and move the load.",
  setup: { ...aFrame({ h: 1 }), view: "assembled" },
  view: A_FRAME_VIEW,
  editable: [
    { label: "View", options: [{ label: "Put together", set: { view: "assembled" } }, { label: "Taken apart", set: { view: "apart" } }] },
    { label: "The load", options: [{ label: "Hanging from the top", set: { "forces.0": TOP } }, { label: "Hanging from leg AC", set: { "forces.0": LEG } }] },
    { path: "links.0.height", label: "Crossbar height", min: 0.5, max: 3.5, step: 0.1, unit: "m" },
  ],
  tasks: [
    { text: "Take the ladder apart to see the forces the parts put on each other.", check: (v, s) => s.view === "apart" },
    { text: "Raise the crossbar until it pulls with more than **800 N**.", check: (v) => v.F_DE > 800 },
    { text: "Find the height where the crossbar pulls with exactly **half** the load.", check: (v) => Math.abs(v.F_DE - v.P / 2) < 1 },
    { text: "Hang the load from the leg and make the crossbar pull with more than **400 N**.", check: (v, s) => s.forces[0].at[1] === 3 && v.F_DE > 400 },
  ],
  hints: [
    "Taken apart, the pin at C pushes on AC one way and on BC the exact opposite way — the same symbols, reversed arrows.",
    "The crossbar holds the legs from spreading. The closer it is to the top, the shorter its lever arm about C — so the harder it must pull.",
    "Leg BC, moments about C: the floor's push $B_y$ (2 m out) against the crossbar's pull ($4 - h$ below C).",
  ],
  explanation:
    "Taken apart, every part is its own rigid body. The pin at C puts equal and opposite forces on the two legs, and the crossbar — a two-force member — pulls along itself on both. " +
    "The crossbar stops the legs spreading; the higher it is, the less leverage it has about C, so the harder it must pull.",
};
