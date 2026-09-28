// Springs, stage 1 — explore: a spring holds the ring; watch its force and stretch (F = k s).

import { springSetup } from "../shared/crate.js";
import { getPath } from "../../../src/core/paths.js";

const ANGLE = "forces.#T_AB.direction.angle", K = "forces.#F_AC.k", MASS = "forces.#W.mass";
const angle = (s) => getPath(s, ANGLE);
// Nothing else changed since the prediction (so the outcome tests just this one change).
const same = (s, before, paths) => paths.every((p) => getPath(s, p) === getPath(before, p));

export default {
  id: "springs/1-explore",
  challenge: "explore",
  solver: "statics.particle",
  title: "Stretch a Spring",
  mission: "Change the spring and watch how far it stretches to hold the crate.",
  instructions:
    "Now cable AC is replaced by a **spring**. A spring pulls with a force that grows with how far it is stretched: $F = k\\,s$, " +
    "where $k$ is its **stiffness** (in N/m) and $s$ its **stretch** (in m). Before each change below, **tap what you think will happen** — then make the change and see.",
  setup: springSetup({ angleAB: 40, k: 800, unstretched: 0.5, mass: 20 }),
  editable: [
    { path: "forces.#T_AB.direction.angle", label: "Angle of AB", min: 20, max: 80, step: 1, unit: "deg" },
    { path: "forces.#F_AC.k", label: "Stiffness k", min: 200, max: 2000, step: 100, unit: "N/m" },
    { path: "forces.#W.mass", label: "Crate mass", min: 5, max: 50, step: 5, unit: "kg" },
  ],
  // Predict first, style B (owner's sample, 2026-09-27): before each change, one tap for which
  // way a quantity will go; the game then shows what really happened. Each change must be the
  // ONLY change since the prediction, so the outcome is a fair test of it.
  // Start (hand-worked): 20 kg, AB 40°, k 800: F_AC = 196.2 / tan 40° = 233.8 N, s = 0.292 m.
  tasks: [
    {
      text: "Make cable AB **steeper**: 60° or more (change nothing else).",
      predict: { watch: "F_AC.s", unit: "m", name: "the spring's stretch $s_{AC}$",
        explain: "A steeper cable holds more of the weight and pulls less sideways, so the spring needs less force — and stretches less." },
      check: (v, s, r, before) => !!before && angle(s) >= 60 && same(s, before, [K, MASS]),
    },
    {
      text: "Make the spring **twice as stiff** or more (change nothing else).",
      predict: { watch: "F_AC", name: "the spring's force $F_{AC}$",
        explain: "The force is set by equilibrium — the crate and the cable haven't changed, so neither has $F_{AC}$. The stiffer spring just stretches less to make it: $s = F/k$." },
      check: (v, s, r, before) => !!before && getPath(s, K) >= 2 * getPath(before, K) && same(s, before, [ANGLE, MASS]),
    },
    {
      text: "Make the crate **twice as heavy** or more (change nothing else).",
      predict: { watch: "F_AC.s", unit: "m", name: "the spring's stretch $s_{AC}$",
        explain: "Every force here grows in proportion to the weight: double the crate and the spring's force doubles — and so does its stretch." },
      check: (v, s, r, before) => !!before && getPath(s, MASS) >= 2 * getPath(before, MASS) && same(s, before, [ANGLE, K]),
    },
  ],
  hints: [
    "The spring only has to balance the cable's SIDEWAYS pull: $F_{AC} = T_{AB}\\cos\\theta$.",
    "The force comes from equilibrium; the stiffness only decides the stretch: $s = F/k$.",
    "Double the weight and every force in the picture doubles.",
  ],
  explanation:
    "In the equations a spring is just another force, $F_{AC}$; equilibrium finds it like any tension. The spring law then tells you how far it stretches: " +
    "$s = F/k$. Double the stiffness and the stretch halves; the force stays the same, because the force is set by equilibrium, not by the spring.",
};
