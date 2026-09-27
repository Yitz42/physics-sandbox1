// Varignon's theorem, stage 1 — explore: a force on a bracket, drawn with its two
// components at the same point. Watch each component's moment about O, and how
// they add up to the force's moment.

import { angleOptions } from "../shared/angle-options.js";

export default {
  id: "varignon/1-explore",
  challenge: "explore",
  solver: "statics.moment",
  title: "Two Turning Parts",
  instructions:
    "A force $F$ pulls on the bracket at A. The dashed arrows are its components $F_x$ and $F_y$, both acting at A. " +
    "**Varignon's theorem**: the moment of $F$ about O equals the moment of $F_x$ plus the moment of $F_y$. " +
    "Drag the arrow's tip (or use the controls) and watch the two moments under the equations — press **Numbers** to see them.",
  setup: {
    analysis: "moment",
    varignon: true, // show each component's moment with numbers
    about: { at: [0, 0], label: "O" },
    body: { points: [[0, 0], [0.4, 0], [0.4, 0.3]] },
    forceScale: 800, // arrows drawn 1 m per 800 N
    dragStep: 10,
    dragMax: 200,
    forces: [{ id: "F", symbol: "F", magnitude: 150, direction: { angle: 50, from: "-x", toward: "+y" }, at: [0.4, 0.3], pointLabel: "A" }],
    dims: [{ force: "F", offset: -0.08 }, { force: "F", axis: "y", offset: 0.62 }],
  },
  view: { xmin: -0.3, xmax: 0.8, ymin: -0.2, ymax: 0.62 },
  editable: [
    { path: "forces.0.magnitude", label: "Size F", min: 10, max: 200, step: 10, unit: "N" },
    { path: "forces.0.direction.angle", label: "Angle θ", min: 0, max: 90, step: 1, unit: "deg" },
    angleOptions("forces.0", "Angle θ measured", "A"),
  ],
  draggable: ["F"],
  sceneOpts: { components: true },
  tasks: [
    { text: "Make $F_x$ and $F_y$ turn the bracket **opposite** ways.", check: (v) => v.Mx_F * v.My_F < 0 && Math.abs(v.Mx_F) > 0.5 && Math.abs(v.My_F) > 0.5 },
    { text: "Make the two moments cancel, so $M_O = 0$ (within 0.5 N·m).", check: (v) => Math.abs(v.M) < 0.5 },
    { text: "Make only $F_y$ turn the bracket: $M_O(F_x) = 0$.", check: (v) => Math.abs(v.Mx_F) < 0.05 && Math.abs(v.My_F) > 0.5 },
    { text: "Make **both** components turn the bracket clockwise.", check: (v) => v.Mx_F < -0.5 && v.My_F < -0.5 },
  ],
  hints: [
    "$F_y$ (up or down) acts 0.4 m to the right of O; $F_x$ (left or right) acts 0.3 m above O.",
    "Pushing right above O turns clockwise; pulling up to the right of O turns counterclockwise.",
    "The moments cancel when $F$ points straight along the line from O to A: then its line of action passes through O.",
  ],
  explanation:
    "Varignon's theorem: $M_O = M_O(F_x) + M_O(F_y) = -yF_x + xF_y$. Each component has an easy moment arm — the height $y$ for $F_x$, the sideways distance $x$ for $F_y$ — " +
    "and they can turn the same way or opposite ways. When they cancel, the force's line of action passes through O.",
};
