// Unit 1, stage 1 — explore: drag a force and watch its components change.

import { angleOptions } from "../shared/angle-options.js";

export default {
  id: "01-force-vectors/1-explore",
  challenge: "explore",
  solver: "statics.particle",
  title: "Pull on the Eyebolt",
  instructions:
    "A force $F$ pulls on an eyebolt at point O. **Drag the round handle at the arrow's tip** (or use the sliders) and watch its components $F_x$ and $F_y$ — the dashed arrows — change.\n\n" +
    "The angle $\\theta$ is measured from one axis toward another (e.g. from +x toward +y), the way your textbook does it — pick them in the dropdown, or type exact values into the boxes. " +
    "Click an arrow or an equation term to see how they match.",
  setup: {
    analysis: "components",
    point: { at: [0, 0], label: "O" },
    forceScale: 100, // arrows drawn 1 m long per 100 N, so dragging sets the size
    dragStep: 10,
    dragMax: 300,
    forces: [{ id: "F", symbol: "F", magnitude: 200, direction: { angle: 30, from: "+x", toward: "+y" } }],
  },
  view: { xmin: -3.5, xmax: 3.5, ymin: -3.3, ymax: 3.3 },
  editable: [
    { path: "forces.0.magnitude", label: "Size F", min: 10, max: 300, step: 10, unit: "N" },
    { path: "forces.0.direction.angle", label: "Angle θ", min: 0, max: 90, step: 1, unit: "deg" },
    angleOptions("forces.0"),
  ],
  draggable: ["F"],
  sceneOpts: { components: true },
  tasks: [
    { text: "Point $F$ up and to the left, so $F_x$ is negative and $F_y$ is positive.", check: (v) => v["F.x"] < -1 && v["F.y"] > 1 },
    { text: "Make $F_x = 0$ (while $F$ is not zero).", check: (v) => Math.abs(v["F.x"]) < 0.5 && Math.abs(v["F.y"]) > 1 },
    { text: "Make $F_x$ and $F_y$ the same size. Which angle does that?", check: (v) => Math.abs(v["F.x"]) > 1 && Math.abs(Math.abs(v["F.x"]) - Math.abs(v["F.y"])) < 1.5 },
    { text: "Make $F_y = 150$ N exactly (within 1 N).", check: (v) => Math.abs(v["F.y"] - 150) < 1 },
  ],
  hints: [
    "The component along the axis the angle is measured FROM uses $\\cos\\theta$; the other uses $\\sin\\theta$.",
    "$F_x$ and $F_y$ are equal in size when $\\cos\\theta = \\sin\\theta$.",
    "For $F_y = 150$ N you need $F\\sin\\theta = 150$. Try $F = 300$ N: what angle gives $\\sin\\theta = 0.5$?",
  ],
  explanation:
    "A force is a vector: size plus direction. Its components are its \"shadows\" on the axes: $F_x = F\\cos\\theta$ and $F_y = F\\sin\\theta$ when $\\theta$ is measured from the x-axis. " +
    "The sign of each component comes from the direction the arrow points: right and up are positive, left and down are negative.",
};
