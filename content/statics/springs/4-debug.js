// Springs, stage 4 — debug: a student's FBD of ring A (held by a cable and a
// spring) is wrong: the spring force is missing or drawn backwards, the weight
// is missing, or the cable's arrow points the wrong way.

import { springSetup } from "../shared/crate.js";

export default {
  id: "springs/4-debug",
  challenge: "debug",
  solver: "statics.particle",
  title: "Which Way Does the Spring Pull?",
  instructions:
    "Ring A is held by cable AB and a stretched spring AC. A student drew the free-body diagram of ring A (right) and wrote equations from it. " +
    "Compare the FBD with the real setup (left) and find the mistake.",
  setup: springSetup({ angleAB: 35, k: 600, unstretched: 0.5, mass: 25 }),
  vary: [
    { path: "forces.#T_AB.direction.angle", values: [30, 35, 40, 45, 50, 55] },
    { path: "forces.#F_AC.k", values: [400, 600, 800, 1000] },
    { path: "forces.#W.mass", min: 10, max: 40, step: 5 },
  ],
  debug: {
    view: "fbd",
    intro: "The student's equations (from their FBD):",
    mutations: [
      { kind: "reverse", force: "F_AC" },
      { kind: "remove", force: "F_AC" },
      { kind: "remove", force: "W" },
      { kind: "reverse", force: "T_AB" },
    ],
    missingChoices: [
      { id: "F_AC", label: "The spring's pull, F_AC" },
      { id: "W", label: "The weight W of the crate" },
      { id: "k", label: "A force k from the spring's stiffness", feedback: "$k$ isn't a force: it's how stiff the spring is, in N/m. The spring's force is $F_{AC} = k\\,s$ — one arrow." },
      { id: "N", label: "A normal force from the wall at C", feedback: "The wall doesn't touch ring A. It acts on A only through the spring — and that is the spring's force." },
    ],
    notes: {
      T_AB: "$T_{AB}$ is drawn correctly: cable AB pulls ring A toward B.",
      F_AC: "$F_{AC}$ is drawn correctly: the stretched spring pulls ring A toward C.",
      W: "$W$ is drawn correctly: the crate's weight pulls A straight down.",
    },
  },
  hints: [
    "List everything attached to ring A in the space diagram: each one gets an arrow.",
    "A STRETCHED spring tries to get shorter, so it pulls the ring toward its other end, C.",
    "The stiffness $k$ tells you how much the spring stretches; it isn't an extra force.",
  ],
  explanation:
    "On a free-body diagram a spring is just one force along the spring. A stretched spring pulls (toward its anchor), like a cable; a squashed one would push. " +
    "Its size comes from equilibrium, and then $s = F/k$ gives how far it is stretched.",
};
