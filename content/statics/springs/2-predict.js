// Springs, stage 2 — predict the cable tension and the spring's stretch.
// Hand check (default numbers): T_AB = 196.2 / sin40° = 305.2 N,
// F_AC = T_AB cos40° = 233.8 N, s = 233.8 / 800 = 0.292 m.

import { springSetup } from "../shared/crate.js";

export default {
  id: "springs/2-predict",
  challenge: "predict",
  solver: "statics.particle",
  title: "How Far Does It Stretch?",
  instructions:
    "Cable AC is now a spring (its stiffness $k$ and unstretched length $l_0$ are under the picture). The crate hangs at rest. " +
    "Predict the cable tension $T_{AB}$ and how far the spring is **stretched**, $s_{AC}$, then press **Test**.",
  setup: springSetup({ angleAB: 40, k: 800, unstretched: 0.5, mass: 20 }),
  vary: [
    { path: "forces.#T_AB.direction.angle", values: [30, 35, 40, 45, 50, 55, 60] },
    { path: "forces.#F_AC.k", values: [500, 600, 800, 1000, 1200, 1500] },
    { path: "forces.#W.mass", min: 10, max: 40, step: 5 },
  ],
  ask: [{ quantity: "T_AB", min: 0 }, { quantity: "F_AC.s", min: 0, precision: 0.01 }],
  hints: [
    "Treat the spring like a cable for the equilibrium: its force $F_{AC}$ pulls A to the right. Find $T_{AB}$ and $F_{AC}$ from $\\Sigma F_x = 0$, $\\Sigma F_y = 0$.",
    "$\\Sigma F_y = 0$ has only $T_{AB}$ and $W$ in it: $T_{AB}\\sin\\theta = W$.",
    "Then the spring law: $F_{AC} = k\\,s_{AC}$, so $s_{AC} = F_{AC}/k$ (in metres, with $k$ in N/m).",
  ],
  explanation:
    "Equilibrium gives the spring's force, $F_{AC} = T_{AB}\\cos\\theta$; the spring law turns that force into a stretch, $s = F/k$. " +
    "The spring is then $l = l_0 + s$ long. Two separate ideas: equilibrium decides the FORCE, the stiffness decides how much it STRETCHES to make it.",
};
