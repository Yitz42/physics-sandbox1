// Pulleys, stage 3 — build: set the two sides of a cable over a pulley so the
// holding rope AD can be cut (it carries no force), without overloading the cable.
// Hand check: W = 35(9.81) = 343.35 N. T_AD = T(cosθ_AC − cosθ_AB) = 0 needs equal
// angles θ; then T = W / (2 sinθ) ≤ 400 N needs sinθ ≥ 0.429, θ ≥ 25.4°.
// So any equal angles from 26° to 40° (the low ceiling's limit) work.

import { pulleySetup } from "../shared/crate.js";

const RATING = 400; // N, the cable's rating
const SLACK = 2; // N, "no force" in rope AD means within this

export default {
  id: "pulleys/3-build",
  challenge: "build",
  solver: "statics.particle",
  title: "Cut the Rope",
  mission: "Set the cable angles so rope AD carries no force and can be cut.",
  instructions:
    "A 35 kg crate hangs from a pulley riding on cable BAC, and rope AD holds the pulley in place. You'd like to **remove rope AD**. " +
    `Set the angles of the cable's two sides so the rope carries no force — then it can be cut — while the cable stays under its ${RATING} N rating. ` +
    "The ceiling is low: each side can be at most 40° from horizontal. Press **Test** to check.",
  setup: pulleySetup({ angleAB: 40, angleAC: 25, mass: 35 }),
  editable: [
    { path: "forces.#T_AB.direction.angle", label: "Angle of AB", min: 15, max: 40, step: 1, unit: "deg" },
    { path: "forces.#T_AC.direction.angle", label: "Angle of AC", min: 15, max: 40, step: 1, unit: "deg" },
  ],
  goal: {
    text: `Rope AD carries no force (within ${SLACK} N), and the cable's tension $T$ is at most ${RATING} N.`,
    check(result) {
      const v = result.values;
      const problems = [];
      const flagged = [];
      if (v.T_AD < -SLACK) problems.push(`Rope AD would have to PUSH the pulley (${(-v.T_AD).toFixed(0)} N). Ropes can't push: side AC is now steeper than side AB.`);
      else if (v.T_AD > SLACK) problems.push(`Rope AD still pulls with ${v.T_AD.toFixed(0)} N: the two sides' sideways pulls, $T\\cos\\theta$, don't cancel yet.`);
      if (v.T > RATING) {
        flagged.push("T_AB", "T_AC");
        problems.push(`The cable carries $T = ${v.T.toFixed(0)}$ N — over its ${RATING} N rating. Flatter sides need more tension to hold the crate up.`);
      }
      if (problems.length) return { ok: false, flagged, message: problems.join("\n\n") };
      return { ok: true, message: `With both sides at the same angle, $T\\cos\\theta$ cancels on its own and rope AD can go. $T = ${v.T.toFixed(0)}$ N is within the rating.` };
    },
  },
  hints: [
    "Both sides pull with the SAME tension $T$. Their sideways parts are $T\\cos\\theta_{AB}$ and $T\\cos\\theta_{AC}$. When do they cancel?",
    "Equal angles make rope AD unnecessary. Now how steep must they be?",
    "Holding the crate: $2T\\sin\\theta = W$, so $T = W/(2\\sin\\theta)$. Keep that at or below 400 N.",
  ],
  explanation:
    "A pulley on a cable settles where both sides make the same angle — that's where the equal tensions' sideways parts cancel, so no rope is needed. " +
    "The angle then sets the tension: $T = W/(2\\sin\\theta)$, so the flatter the cable, the harder it pulls.",
};
