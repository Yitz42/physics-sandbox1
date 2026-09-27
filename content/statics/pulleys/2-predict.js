// Pulleys, stage 2 — predict the cable tension T and the rope's pull T_AD.
// Hand check (default numbers): W = 294.3 N; T(sin60° + sin30°) = 294.3 → T = 215.4 N;
// T_AD = T(cos30° − cos60°) = 78.9 N.

import { pulleySetup } from "../shared/crate.js";

export default {
  id: "pulleys/2-predict",
  challenge: "predict",
  solver: "statics.particle",
  title: "Predict the Pulley Forces",
  mission: "Predict the cable tension and the rope force holding the pulley.",
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
};
