// Unit 2, stage 2 — predict, in three parts: two cable tensions; a spring's
// stretch; a pulley on a cable (the same T on both sides).
// Part 1 hand check (default numbers): W = 60(9.81) = 588.6 N.
// ΣFx: −T_AB cos30° + T_AC cos45° = 0;  ΣFy: T_AB sin30° + T_AC sin45° − 588.6 = 0
// → T_AB = 588.6 / (sin30° + cos30°·tan45°) = 430.9 N,  T_AC = 527.7 N.
import { crateSetup, springSetup, pulleySetup } from "./crate.js";

export default {
  id: "02-particle-equilibrium/2-predict",
  challenge: "predict",
  solver: "statics.particle",
  title: "Predict the Forces",
  parts: [
    {
      title: "Two cables",
      instructions:
        "The crate hangs at rest. Using the angles and mass in the picture, predict the tension in each cable, then press **Test**.",
      setup: crateSetup({ angleAB: 30, angleAC: 45, mass: 60 }),
      vary: [
        { path: "forces.#T_AB.direction.angle", values: [20, 25, 30, 35, 40, 50, 55, 60] },
        { path: "forces.#T_AC.direction.angle", values: [25, 30, 35, 40, 45, 50, 60, 65] },
        { path: "forces.#W.mass", min: 20, max: 120, step: 5 },
      ],
      ask: [{ quantity: "T_AB", min: 0 }, { quantity: "T_AC", min: 0 }], // tensions are never negative
      hints: [
        "Draw the FBD of ring A: $T_{AB}$ and $T_{AC}$ pull along the cables, $W = mg$ pulls straight down.",
        "$\\Sigma F_x = 0$: $-T_{AB}\\cos\\theta_{AB} + T_{AC}\\cos\\theta_{AC} = 0$. Use it to write $T_{AC}$ in terms of $T_{AB}$.",
        "Substitute into $\\Sigma F_y = 0$: $T_{AB}\\sin\\theta_{AB} + T_{AC}\\sin\\theta_{AC} - W = 0$.",
      ],
      explanation:
        "Two unknowns, two equations. $\\Sigma F_x = 0$ says the horizontal pulls cancel, which fixes the ratio of the tensions. " +
        "$\\Sigma F_y = 0$ says the vertical pulls add up to the weight, which fixes their size. Don't forget $W = mg$, not $m$!",
    },
    {
      title: "How far does the spring stretch?",
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
    },
    {
      title: "A pulley on a cable",
      instructions:
        "Pulley A rides on cable BAC and rope AD holds it in place. The same cable runs over the pulley, so both sides pull with the same tension $T$. " +
        "Predict $T$ and the rope's pull $T_{AD}$, then press **Test**.",
      setup: pulleySetup({ angleAB: 60, angleAC: 30, mass: 30 }),
      // AB is always steeper than AC, so rope AD always pulls (to the left).
      vary: [
        { path: "forces.#T_AB.direction.angle", values: [50, 55, 60, 65, 70] },
        { path: "forces.#T_AC.direction.angle", values: [20, 25, 30, 35, 40] },
        { path: "forces.#W.mass", min: 10, max: 60, step: 5 },
      ],
      ask: [{ quantity: "T", min: 0 }, { quantity: "T_AD", min: 0 }],
      hints: [
        "The FBD of the pulley has FOUR forces: $T$ up-left, $T$ up-right (the same $T$!), $T_{AD}$ to the left, and $W$ down.",
        "$\\Sigma F_y = 0$: $T\\sin\\theta_{AB} + T\\sin\\theta_{AC} - W = 0$. Only one unknown: $T$.",
        "$\\Sigma F_x = 0$: $-T\\cos\\theta_{AB} + T\\cos\\theta_{AC} - T_{AD} = 0$.",
      ],
      explanation:
        "Because the pulley doesn't change the cable's tension, the two cable pulls share ONE unknown, $T$. So four forces still leave only two unknowns — " +
        "$T$ and $T_{AD}$ — and $\\Sigma F_x$, $\\Sigma F_y$ solve them. The rope is needed because the sides are at different angles, so their sideways pulls don't cancel.",
    },
  ],
  explanation:
    "Whatever pulls on the point — cables, springs, a cable over a pulley — $\\Sigma F_x = 0$ and $\\Sigma F_y = 0$ find two unknowns. A spring then turns its force into a stretch, $s = F/k$.",
};
