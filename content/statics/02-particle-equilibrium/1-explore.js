// Unit 2, stage 1 — explore, in three parts:
//   1. change two cables' angles and the crate's mass; watch the tensions;
//   2. one cable becomes a spring: watch its force and stretch (F = k s);
//   3. a pulley riding on a cable: the same tension T on both sides.
import { crateSetup, springSetup, pulleySetup } from "./crate.js";

export default {
  id: "02-particle-equilibrium/1-explore",
  challenge: "explore",
  solver: "statics.particle",
  title: "Hang a Crate",
  parts: [
    {
      title: "Two cables",
      instructions:
        "A crate hangs from ring A, held by two cables. On the left is the real setup (the **space diagram**); on the right is the **free-body diagram** of ring A. " +
        "Move the sliders and watch the tensions — the equations $\\Sigma F_x = 0$ and $\\Sigma F_y = 0$ are solved live.",
      setup: crateSetup({ angleAB: 30, angleAC: 45, mass: 50 }),
      editable: [
        { path: "forces.#T_AB.direction.angle", label: "Angle of AB", min: 10, max: 80, step: 1, unit: "deg" },
        { path: "forces.#T_AC.direction.angle", label: "Angle of AC", min: 10, max: 80, step: 1, unit: "deg" },
        { path: "forces.#W.mass", label: "Crate mass", min: 10, max: 100, step: 5, unit: "kg" },
      ],
      tasks: [
        { text: "Make the two tensions equal.", check: (v) => Math.abs(v.T_AB - v.T_AC) < 0.5 },
        { text: "Make one cable pull harder than the whole weight $W$ of the crate.", check: (v) => Math.max(v.T_AB, v.T_AC) > v.W },
        { text: "Make $T_{AC}$ at least twice as big as $T_{AB}$.", check: (v) => v.T_AC >= 2 * v.T_AB },
      ],
      hints: [
        "Equal tensions happen when the picture is symmetric.",
        "Try making both cables nearly flat. What happens to the tensions?",
        "The steeper cable takes more of the load if the other one is flatter.",
      ],
      explanation:
        "Only the **vertical** parts of the tensions hold the crate up: $T_{AB}\\sin\\theta_{AB} + T_{AC}\\sin\\theta_{AC} = W$. " +
        "Flat cables have small $\\sin\\theta$, so the tensions must be huge — they can even exceed the weight. The horizontal parts just cancel each other.",
    },
    {
      title: "A spring",
      instructions:
        "Now cable AC is replaced by a **spring**. A spring pulls with a force that grows with how far it is stretched: $F = k\\,s$, " +
        "where $k$ is its **stiffness** (in N/m) and $s$ its **stretch** (in m). Move the sliders and watch the spring force $F_{AC}$ and its stretch $s_{AC} = F_{AC}/k$.",
      setup: springSetup({ angleAB: 40, k: 800, unstretched: 0.5, mass: 20 }),
      editable: [
        { path: "forces.#T_AB.direction.angle", label: "Angle of AB", min: 20, max: 80, step: 1, unit: "deg" },
        { path: "forces.#F_AC.k", label: "Stiffness k", min: 200, max: 2000, step: 100, unit: "N/m" },
        { path: "forces.#W.mass", label: "Crate mass", min: 5, max: 50, step: 5, unit: "kg" },
      ],
      tasks: [
        { text: "Make the spring stretch more than 0.5 m.", check: (v) => v["F_AC.s"] > 0.5 },
        { text: "Keep the crate and angle the same, and make the spring stretch less than 0.1 m. What did you change?", check: (v) => v["F_AC.s"] < 0.1 },
        { text: "Make the spring pull exactly as hard as the crate's weight: $F_{AC} = W$.", check: (v) => Math.abs(v.F_AC - v.W) < 1 },
      ],
      hints: [
        "A flatter cable AB pulls more sideways, so the spring must pull harder to balance it.",
        "A stiffer spring (bigger $k$) needs less stretch for the same force: $s = F/k$.",
        "$F_{AC} = W$ when the cable's horizontal and vertical parts are equal: at 45°.",
      ],
      explanation:
        "In the equations a spring is just another force, $F_{AC}$; equilibrium finds it like any tension. The spring law then tells you how far it stretches: " +
        "$s = F/k$. Double the stiffness and the stretch halves; the force stays the same, because the force is set by equilibrium, not by the spring.",
    },
    {
      title: "A pulley on a cable",
      instructions:
        "Pulley A rides on cable BAC, with a crate hanging from it, and rope AD holds it from the left. The **same cable** runs over the pulley, " +
        "so (with no friction) both sides pull with the **same tension** $T$ — in the equations $T$ appears twice, as one unknown. Move the sliders and watch $T$ and $T_{AD}$.",
      setup: pulleySetup({ angleAB: 60, angleAC: 30, mass: 30 }),
      editable: [
        { path: "forces.#T_AB.direction.angle", label: "Angle of AB", min: 20, max: 80, step: 1, unit: "deg" },
        { path: "forces.#T_AC.direction.angle", label: "Angle of AC", min: 20, max: 80, step: 1, unit: "deg" },
        { path: "forces.#W.mass", label: "Crate mass", min: 10, max: 60, step: 5, unit: "kg" },
      ],
      tasks: [
        { text: "Make rope AD go slack: $T_{AD} = 0$. What is special about the two angles then?", check: (v) => Math.abs(v.T_AD) < 0.5 },
        { text: "Make the cable tension $T$ bigger than the crate's weight $W$.", check: (v) => v.T > v.W },
        { text: "Make rope AD pull with more than 150 N.", check: (v) => v.T_AD > 150 },
      ],
      hints: [
        "Both sides pull with the same $T$. Their horizontal parts, $T\\cos\\theta$, cancel only if the angles match.",
        "Flat cables have small vertical parts, so $T$ must be large to hold the crate.",
        "Make the two angles very different: then the sideways pulls are very unequal, and rope AD has to make up the difference.",
      ],
      explanation:
        "A frictionless pulley doesn't change a cable's tension, it only turns it. So the pulley feels $T$ on BOTH sides: " +
        "$\\Sigma F_y$: $T\\sin\\theta_{AB} + T\\sin\\theta_{AC} = W$ gives $T$ straight away. With no rope AD, the pulley slides until both sides make the same angle.",
    },
  ],
  explanation:
    "Equilibrium, $\\Sigma F_x = 0$ and $\\Sigma F_y = 0$, finds the forces whatever pulls on the point: cables, springs ($F = k s$), or a cable over a pulley (the same $T$ on both sides).",
};
