// Unit 9.1, stage 2 — predict: the friction on a crate that holds, the angle a crate starts to slide,
// and the push or pull that just starts a crate moving. Hand checks in library/friction.js:
//   crate on a ramp N = 469.8 N, F = 171.0 N;  tipping bed θ = 26.6°;  floor push P = 240.2 N;
//   sled P = 88.6 N;  push up a ramp P = 347.2 N.

import { use } from "../../../src/core/library.js";
import { rampCrate, tippingBed, floorPush, sledPull, rampPushUp } from "../library/friction.js";

export default {
  id: "dry-friction/2-predict",
  challenge: "predict",
  solver: "statics.friction",
  title: "Will It Hold?",
  mission: "Predict friction forces, and the push or angle where slipping starts.",
  instructions: "Predict the answer.",
  situations: [
    use(rampCrate, "holds"),
    use(tippingBed, "angle"),
    use(floorPush, "start"),
    use(sledPull, "start"),
    use(rampPushUp, "start"),
  ],
  hints: [],
  explanation:
    "When a body holds, friction is only what equilibrium needs — find it from the equations, then check it against $\\mu_s N$. " +
    "When motion is about to start, friction is at its limit, $F = \\mu_s N$, against the motion. A push's part across the surface changes N, and so the limit: pushing down makes a crate harder to start, pulling up makes it easier.",
};
