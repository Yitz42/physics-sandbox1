// Pulleys, stage 4 — debug: a student's FBD of the pulley is wrong: one side of
// the cable is missing, or an arrow points the wrong way.

import { pulleySetup } from "../shared/crate.js";

export default {
  id: "pulleys/4-debug",
  challenge: "debug",
  solver: "statics.particle",
  title: "The Pulley's FBD",
  mission: "Find the mistake in a student's free-body diagram of the pulley.",
  instructions:
    "Pulley A rides on cable BAC and rope AD holds it. A student drew the free-body diagram of the pulley (right). Compare it with the real setup (left) and find the mistake.",
  setup: pulleySetup({ angleAB: 60, angleAC: 30, mass: 30 }),
  vary: [
    { path: "forces.#T_AB.direction.angle", values: [50, 55, 60, 65, 70] },
    { path: "forces.#T_AC.direction.angle", values: [20, 25, 30, 35, 40] },
    { path: "forces.#W.mass", min: 10, max: 60, step: 5 },
  ],
  debug: {
    view: "fbd",
    intro: "The student's equations (from their FBD):",
    mutations: [
      { kind: "remove", force: "T_AC" },
      { kind: "reverse", force: "T_AD" },
      { kind: "remove", force: "T_AB" },
      { kind: "reverse", force: "T_AC" },
    ],
    missingChoices: [
      { id: "T_AB", label: "The cable's pull toward B, with the same tension T" },
      { id: "T_AC", label: "The cable's pull toward C, with the same tension T" },
      { id: "W", label: "The weight W of the crate" },
      { id: "N", label: "A force from the pulley's axle", feedback: "The pulley IS the thing we isolated: its axle is where A is. The forces on it come from the cable, the rope and the crate." },
    ],
    notes: {
      T_AB: "That pull is right: the cable pulls the pulley toward B, with tension $T$.",
      T_AC: "That pull is right: the cable pulls the pulley toward C, with the same tension $T$.",
      T_AD: "$T_{AD}$ is drawn correctly: rope AD pulls the pulley toward D.",
      W: "$W$ is drawn correctly: the crate's weight pulls straight down.",
    },
  },
  hints: [
    "Follow the cable: it comes from B, wraps over the pulley, and leaves toward C. How many times does it pull on the pulley?",
    "It pulls TWICE — once along each side — both with tension $T$.",
    "Every rope and cable pulls away from the pulley, along itself.",
  ],
  explanation:
    "A cable running over a pulley touches it on both sides, so the FBD of the pulley has TWO cable forces, both of size $T$ (with no friction, the pulley doesn't change the tension). " +
    "Missing one of them is the classic pulley mistake: the equations then only balance half the cable's pull.",
};
