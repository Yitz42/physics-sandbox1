// Unit 1, stage 1 — explore, in two parts:
//   1. drag a force and watch its components change;
//   2. a cable from A to B: move B and watch the position vector r_AB, the unit
//      vector u_AB and the force in Cartesian form F = {F_x i + F_y j} N change.

import { angleOptions } from "../shared/angle-options.js";

export default {
  id: "01-force-vectors/1-explore",
  challenge: "explore",
  solver: "statics.particle",
  title: "Pull on the Eyebolt",
  parts: [
    {
      title: "Components",
      instructions:
        "A force $F$ pulls on an eyebolt at point O. **Drag the round handle at the arrow's tip** (or use the sliders) and watch its components $F_x$ and $F_y$ — the dashed arrows — change.\n\n" +
        "The angle $\\theta$ is measured from the x-axis, the way your textbook does it; the dropdown sets which way the force points from O (e.g. **From O to −x,+y** is up and to the left). You can also type exact values into the boxes. " +
        "Click an arrow or an equation term to see how they match.",
      setup: {
        analysis: "components",
        cartesian: true, // also write F = {F_x i + F_y j} N under the equations
        point: { at: [0, 0], label: "O", object: "eyebolt", mount: [-1, -1] }, // named because the direction dropdown says "From O to …"; the eyebolt is screwed in down-left
        forceScale: 100, // arrows drawn 1 m long per 100 N, so dragging sets the size
        dragStep: 10,
        dragMax: 300,
        forces: [{ id: "F", symbol: "F", magnitude: 200, direction: { angle: 30, from: "+x", toward: "+y" } }],
      },
      view: { xmin: -3.5, xmax: 3.5, ymin: -3.3, ymax: 3.3 },
      editable: [
        { path: "forces.0.magnitude", label: "Size F", min: 10, max: 300, step: 10, unit: "N" },
        { path: "forces.0.direction.angle", label: "Angle θ", min: 0, max: 90, step: 1, unit: "deg" },
        angleOptions("forces.0", "Angle θ measured"),
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
        "The sign of each component comes from the direction the arrow points: right and up are positive, left and down are negative. " +
        "Written as a **Cartesian vector**, $\\mathbf{F} = F_x\\,\\mathbf{i} + F_y\\,\\mathbf{j}$, where $\\mathbf{i}$ and $\\mathbf{j}$ are arrows of length 1 along x and y.",
    },
    {
      title: "A cable from A to B",
      instructions:
        "A cable pulls on the ring at A toward the anchor B. Its direction comes from the **coordinates** of A and B, not from an angle. " +
        "Move B with the sliders and watch the lines under the equations:\n\n" +
        "• the **position vector** $\\mathbf{r}_{AB} = (x_B - x_A)\\,\\mathbf{i} + (y_B - y_A)\\,\\mathbf{j}$, from A to B;\n\n" +
        "• its length $r_{AB}$, and the **unit vector** $\\mathbf{u}_{AB} = \\mathbf{r}_{AB} / r_{AB}$ (length 1, same direction);\n\n" +
        "• the force $\\mathbf{F} = F\\,\\mathbf{u}_{AB}$, written as $\\{F_x\\,\\mathbf{i} + F_y\\,\\mathbf{j}\\}$ N.\n\n" +
        "Press **Numbers** above the equations to see them substituted.",
      setup: {
        analysis: "components",
        cartesian: true,
        point: { at: [1, 1], label: "A" },
        forces: [{ id: "F", symbol: "F", magnitude: 200, kind: "cable", direction: { points: [[1, 1], [5, 3]], names: ["A", "B"] } }],
      },
      editable: [
        { path: "forces.0.direction.points.1.0", label: "x of B", min: -3, max: 5, step: 0.5, unit: "m" },
        { path: "forces.0.direction.points.1.1", label: "y of B", min: -3, max: 5, step: 0.5, unit: "m" },
        { path: "forces.0.magnitude", label: "Size F", min: 50, max: 400, step: 10, unit: "N" },
      ],
      tasks: [
        { text: "Move B so that $\\mathbf{u}_{AB} = 0.6\\,\\mathbf{i} + 0.8\\,\\mathbf{j}$.", check: (v) => Math.abs(v["F.ux"] - 0.6) < 0.005 && Math.abs(v["F.uy"] - 0.8) < 0.005 },
        { text: "Make the cable pull straight up: $F_x = 0$.", check: (v) => Math.abs(v["F.rx"]) < 1e-9 && v["F.ry"] > 0 },
        { text: "Make the cable pull down and to the left (both parts of $\\mathbf{u}_{AB}$ negative).", check: (v) => v["F.ux"] < -0.01 && v["F.uy"] < -0.01 },
        { text: "Put B **4 m left** of A and **3 m above** it. What is $r_{AB}$?", check: (v) => Math.abs(v["F.rx"] + 4) < 1e-9 && Math.abs(v["F.ry"] - 3) < 1e-9 },
      ],
      hints: [
        "$\\mathbf{u}_{AB} = 0.6\\,\\mathbf{i} + 0.8\\,\\mathbf{j}$ means B is 3 across for every 4 up from A (a 3-4-5 triangle).",
        "A is at (1, 1). Going 3 m right and 4 m up from A lands on (4, 5); going 1.5 m right and 2 m up lands on (2.5, 3). Both work!",
        "B is below and to the left of A when $x_B < x_A$ and $y_B < y_A$.",
      ],
      explanation:
        "When a force acts along a cable, its direction is the direction from A to B: $\\mathbf{r}_{AB} = \\mathbf{r}_B - \\mathbf{r}_A$ (B's coordinates minus A's). " +
        "Dividing by the length makes the unit vector $\\mathbf{u}_{AB} = \\mathbf{r}_{AB}/r_{AB}$, and then $\\mathbf{F} = F\\,\\mathbf{u}_{AB}$. " +
        "Moving B further along the same line changes $\\mathbf{r}_{AB}$ but not $\\mathbf{u}_{AB}$, so the force stays the same.",
    },
  ],
  explanation:
    "A force is a vector: size plus direction. Its components can come from an angle ($F\\cos\\theta$, $F\\sin\\theta$) or from coordinates " +
    "($F$ times the unit vector $\\mathbf{u}_{AB} = \\mathbf{r}_{AB}/r_{AB}$). Either way it is written $\\mathbf{F} = F_x\\,\\mathbf{i} + F_y\\,\\mathbf{j}$.",
};
