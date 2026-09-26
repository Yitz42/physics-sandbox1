// Unit 2, stage 4 — debug, in two parts: a student's FBD is wrong.
//   1. ring A with two cables: a missing weight, or an arrow the wrong way;
//   2. a pulley on a cable: one side of the cable left out, or an arrow the wrong way.
import { crateSetup, pulleySetup } from "./crate.js";

export default {
  id: "02-particle-equilibrium/4-debug",
  challenge: "debug",
  solver: "statics.particle",
  title: "What's Wrong with This FBD?",
  parts: [
    {
      title: "Two cables",
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
    },
    {
      title: "The pulley's FBD",
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
    },
  ],
  explanation:
    "A correct FBD shows every force on the isolated body, each pointing the way it really acts. Cables and ropes pull away along themselves — and a cable over a pulley pulls on it twice.",
};
