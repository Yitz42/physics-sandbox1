// Unit 4, stage 3 — build: replace a motor's couple with two forces at A and B.
// Hand-worked solutions (O is the middle of the bar, (0.2, 0.15)):
//   150 N down at A (0, 0), 150 N up at B (0.4, 0.3):   d = 0.4 m, M = 150(0.4) = 60 N·m CCW ✓
//   200 N right at A, 200 N left at B:                  d = 0.3 m, M = 200(0.3) = 60 N·m CCW ✓

const TARGET = 60; // N·m, counterclockwise
const TOL = 0.5; // N·m
const DIRECTIONS = ["up", "down", "left", "right"];

// Dropdown that points force `id` up, down, left or right.
const directionMenu = (id, label) => ({
  label,
  options: DIRECTIONS.map((d) => ({ label: d[0].toUpperCase() + d.slice(1), set: { [`forces.#${id}.direction`]: d } })),
});

export default {
  id: "04-couples/3-build",
  challenge: "build",
  solver: "statics.couple",
  title: "Make an Equivalent Couple",
  instructions:
    "A motor turns the bar with a **60 N·m counterclockwise couple** (the green curved arrow). " +
    "Replace it with two forces, one at each end of the bar (A and B), that have exactly the same effect. Press **Test** to check.",
  setup: {
    analysis: "couple",
    netForce: true, // show F_R = ΣF: it must come out zero for a couple
    about: { at: [0.2, 0.15], label: "O" }, // the middle of the bar
    body: { points: [[0, 0], [0.4, 0.3]] }, // a bar from A to B
    forceScale: 800,
    target: { value: TARGET, at: [-0.4, 0.15] },
    texts: [{ at: [-0.4, -0.05], text: "motor's couple" }],
    dims: [
      { from: [0, -0.1], to: [0.4, -0.1], side: -1 },
      { from: [0.52, 0], to: [0.52, 0.3], side: -1 },
    ],
    forces: [
      { id: "F_1", symbol: "F_1", magnitude: 100, direction: "up", at: [0, 0], pointLabel: "A" },
      { id: "F_2", symbol: "F_2", magnitude: 100, direction: "up", at: [0.4, 0.3], pointLabel: "B" },
    ],
  },
  view: { xmin: -0.65, xmax: 0.8, ymin: -0.42, ymax: 0.62 },
  editable: [
    { path: "forces.#F_1.magnitude", label: "F₁ at A", min: 10, max: 250, step: 10, unit: "N" },
    directionMenu("F_1", "F₁ points"),
    { path: "forces.#F_2.magnitude", label: "F₂ at B", min: 10, max: 250, step: 10, unit: "N" },
    directionMenu("F_2", "F₂ points"),
  ],
  goal: {
    text: `Same effect as the motor: $F_R = 0$ (a pure couple) and $M = ${TARGET}$ N·m counterclockwise.`,
    check(result) {
      const v = result.values;
      if (v.R > 0.5) {
        return { ok: false, message: `The forces add up to $F_R = ${v.R.toFixed(1)}$ N, not zero, so this is not a couple — it would also shove the bar along. A couple's two forces are equal in size and point in opposite directions.` };
      }
      if (Math.abs(v.M - TARGET) <= TOL) return { ok: true, message: `$F_R = 0$ and $M = ${v.M.toFixed(1)}$ N·m counterclockwise: the same effect as the motor.` };
      if (Math.abs(v.M + TARGET) <= TOL) return { ok: false, message: "Right size, but it turns the bar **clockwise**. Reverse both forces." };
      return { ok: false, message: `It's a couple ($F_R = 0$), but $M = ${v.M.toFixed(1)}$ N·m. You need ${TARGET} N·m counterclockwise. Use $M = Fd$, where $d$ is the distance between the two lines of action.` };
    },
  },
  hints: [
    "A couple needs two forces of the **same size** pointing in **opposite** directions.",
    "$M = Fd$, with $d$ the distance between the two lines of action. Up/down forces at A and B are 0.4 m apart; left/right forces are 0.3 m apart.",
    "With up/down forces: $F = 60 / 0.4 = 150$ N. Which one must point up to turn the plate counterclockwise?",
  ],
  explanation:
    "Any couple with the same moment and turning sense has the same effect on a rigid body. " +
    "150 N down at A and up at B ($d = 0.4$ m) works, and so does 200 N right at A and left at B ($d = 0.3$ m): both give 60 N·m counterclockwise. " +
    "Two forces that don't cancel ($F_R \\ne 0$) would also push the bar along, so they can't replace a couple.",
};
