// Springs, stage 1 — explore: a spring holds the ring; watch its force and stretch (F = k s).

import { springSetup } from "../shared/crate.js";

export default {
  id: "springs/1-explore",
  challenge: "explore",
  solver: "statics.particle",
  title: "Stretch a Spring",
  mission: "Change the spring and watch how far it stretches to hold the crate.",
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
};
