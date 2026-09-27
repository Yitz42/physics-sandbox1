// Unit 2.4, stage 1 — explore: two tugboats tow a barge along a canal (the x-axis).
// Tug 1 is fixed: F_1 = 600 N at 30° above +x = {519.6 i + 300 j} N. The student steers tug 2.
// Checks (hand-worked):
//   along +x:            F_2y = −300 N, e.g. F_2 = 600 N at 30° below +x (F_R = 1039 N).
//   1000 N along +x:     F_2x = 480.4 N, F_2y = −300 N → F_2 = 566.4 N at 32.0° below +x;
//                        on the slider grid, 570 N at 32°: F_R = {1003 i − 2.1 j} N.
//   smallest, along +x:  F_2 straight down, 300 N (perpendicular to the resultant's line).
//   smallest, along +y:  F_2 straight left, 519.6 N → 520 N at 0° from −x: F_Rx = −0.4 N.

import { angleOptions } from "../shared/angle-options.js";

const alongX = (v) => Math.abs(v["R.y"]) < 3 && v["R.x"] > 1;
const alongY = (v) => Math.abs(v["R.x"]) < 3 && v["R.y"] > 1;

export default {
  id: "vector-challenge/1-explore",
  challenge: "explore",
  solver: "statics.particle",
  title: "Steer the Second Tug",
  mission: "Steer tug 2 so the barge goes where you want — with as small a pull as possible.",
  instructions:
    "Two tugboats tow a barge at O. Tug 1 pulls with $F_1$ (fixed). You steer tug 2: **drag the tip of $F_2$** or use the sliders. " +
    "The resultant $F_R$ is what actually moves the barge. The canal runs along the x-axis.",
  setup: {
    analysis: "resultant",
    point: { at: [0, 0], label: "O" }, // named because the direction dropdown says "From O to …"
    forceScale: 300, // arrows drawn 1 m long per 300 N, so dragging sets the size
    dragStep: 10,
    dragMax: 800,
    forces: [
      { id: "F1", symbol: "F_1", magnitude: 600, direction: { angle: 30, from: "+x", toward: "+y" } },
      { id: "F2", symbol: "F_2", magnitude: 400, direction: { angle: 60, from: "+x", toward: "+y" } },
    ],
  },
  view: { xmin: -3.4, xmax: 4.6, ymin: -3.2, ymax: 3.6 },
  editable: [
    { path: "forces.#F2.magnitude", label: "Size F₂", min: 10, max: 800, step: 10, unit: "N" },
    { path: "forces.#F2.direction.angle", label: "Angle of F₂", min: 0, max: 90, step: 1, unit: "deg" },
    angleOptions("forces.#F2", "Angle of F₂ measured"),
  ],
  draggable: ["F2"],
  sceneOpts: { resultant: true, components: ["F2"] },
  tasks: [
    { text: "Make $F_R$ point straight along the canal, **+x** (within 3 N of $F_{Ry} = 0$).", check: (v) => alongX(v) },
    { text: "Keep $F_R$ along +x and make it **1000 N** (within 10 N).", check: (v) => alongX(v) && Math.abs(v["R.x"] - 1000) <= 10 },
    { text: "Find the **smallest** $F_2$ that still keeps $F_R$ along +x (within 5 N of the smallest possible). Which way does it point?", check: (v) => alongX(v) && v.F2 <= 305 },
    { text: "Now make $F_R$ point straight along **+y**, again with the smallest $F_2$ you can (within 5 N).", check: (v) => alongY(v) && v.F2 <= 525 },
  ],
  hints: [
    "For $F_R$ along +x, $F_R$ has no y-part: $F_{2y}$ must cancel $F_{1y} = 600\\sin 30^\\circ = 300$ N exactly.",
    "Only $F_{2y}$ has to be −300 N; $F_{2x}$ can be anything. Which direction gives $F_{2y} = -300$ N with nothing wasted on $F_{2x}$?",
    "For 1000 N along +x: $F_{2x} = 1000 - 600\\cos 30^\\circ$ and $F_{2y} = -300$ N. Then $F_2 = \\sqrt{F_{2x}^2 + F_{2y}^2}$.",
  ],
  explanation:
    "Only the part of $F_2$ that cancels $F_1$'s sideways pull is needed to steer; any part along the resultant's line just changes how hard the barge is towed. " +
    "So the **smallest** $F_2$ that gives the resultant a chosen direction is **perpendicular to that direction**: 300 N straight down to go along +x, 519.6 N straight left to go along +y. " +
    "Any other angle needs more force for the same job.",
};
