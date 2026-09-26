// Unit 3, stage 1 — explore: turn a wrench; see how size, angle and position change the moment.
import { angleOptions } from "../shared/angle-options.js";

export default {
  id: "03-moments/1-explore",
  challenge: "explore",
  solver: "statics.moment",
  title: "Turn the Wrench",
  mission: "Push on the wrench and discover what makes the moment about the bolt bigger.",
  instructions:
    "You push on a wrench at point A to turn the bolt at O. **Drag the arrow's tip**, or use the controls, and watch the moment $M_O$ change.\n\n" +
    "The orange line is the **moment arm** $d$: the perpendicular distance from O to the force's line of action (the dashed line). $M_O = Fd$, and counterclockwise is positive.",
  setup: {
    analysis: "moment",
    about: { at: [0, 0], label: "O" },
    body: { points: [[0, 0], [0.3, 0]], kind: "wrench" }, // a wrench, 0.3 m long, its ring on the bolt at O
    forceScale: 800, // arrows drawn 1 m per 800 N (so 100 N is 0.125 m)
    dragStep: 10,
    dragMax: 200,
    forces: [{ id: "F", symbol: "F", magnitude: 100, direction: { angle: 60, from: "+x", toward: "+y" }, at: [0.25, 0], pointLabel: "A" }],
  },
  view: { xmin: -0.22, xmax: 0.58, ymin: -0.3, ymax: 0.32 },
  editable: [
    { path: "forces.0.magnitude", label: "Size F", min: 10, max: 200, step: 10, unit: "N" },
    { path: "forces.0.direction.angle", label: "Angle θ", min: 0, max: 90, step: 1, unit: "deg" },
    angleOptions("forces.0", "Angle θ measured", "A"),
    { path: "forces.0.at.0", label: "Distance OA", min: 0.05, max: 0.3, step: 0.01, unit: "m" },
  ],
  draggable: ["F"],
  sceneOpts: { arms: true },
  tasks: [
    { text: "Make the moment **clockwise** (negative).", check: (v) => v.M < -0.5 },
    { text: "Make $M_O = 0$ while $F$ is not zero.", check: (v, s) => Math.abs(v.M) < 0.05 && s.forces[0].magnitude > 0 },
    { text: "Get the biggest moment you can with $F = 100$ N.", check: (v, s) => s.forces[0].magnitude === 100 && Math.abs(v.M) >= 29.95 },
    { text: "Make $M_O = 20$ N·m exactly (within 0.1).", check: (v) => Math.abs(v.M - 20) <= 0.1 },
  ],
  hints: [
    "A force points clockwise about O when it pushes the handle downward on the right of O.",
    "When the line of action passes through O, the moment arm $d$ is zero.",
    "The moment is biggest when $d$ is biggest: push at the end, at 90° to the handle.",
  ],
  explanation:
    "Only the perpendicular distance counts: $M_O = Fd$. Pushing at the end of the handle and at right angles to it makes $d$ as big as possible. " +
    "Pushing straight along the handle gives $d = 0$ — no turning at all, however hard you push.",
};
