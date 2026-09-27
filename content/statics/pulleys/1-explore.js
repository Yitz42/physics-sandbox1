// Pulleys, stage 1 — explore: a pulley riding on a cable has the same tension T on both sides.

import { pulleySetup } from "../shared/crate.js";

export default {
  id: "pulleys/1-explore",
  challenge: "explore",
  solver: "statics.particle",
  title: "A Pulley on a Cable",
  mission: "Change the cable angles and see that it pulls with the same tension on both sides.",
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
};
