// Unit 5.4, stage 3 — build: an A-frame hoist. The load hangs from the top; the crossbar is a
// chain rated 700 N, and it must be at least 2 m up so workers can walk under it.
//   F_DE = P/(4 − h) ≤ 700 → h ≤ 4 − P/700;  and h ≥ 2.   (hand checks: library/frames.js)
//   P = 1000: h = 2.0 … 2.5 m;  P = 1300 (the heaviest): h = 2.0 … 2.1 m;  P = 800: h = 2.0 … 2.8 m.

import { aFrame, A_FRAME_VIEW } from "../library/frames.js";

const RATING = 700; // N, the chain
const HEADROOM = 2; // m

export default {
  id: "frames/3-build",
  challenge: "build",
  solver: "statics.frame",
  title: "Hang the Chain",
  mission: "Place the crossbar chain so it isn't overloaded and workers can walk under it.",
  instructions:
    "An A-frame hoist lifts a load $P$ from its top C. The legs are held together by a chain DE. Slide the chain up or down, work out its pull for YOUR height on paper (tension positive), then press **Test**.",
  setup: { ...aFrame({ h: 3 }) },
  view: A_FRAME_VIEW,
  vary: [{ path: "forces.#P.magnitude", min: 800, max: 1300, step: 10 }],
  editable: [{ path: "links.0.height", label: "Chain height", min: 0.5, max: 3.5, step: 0.1, unit: "m" }],
  goal: {
    text: `The chain pulls with at most **${RATING} N**, and it's at least **${HEADROOM} m** up.`,
    predict: [{ quantity: "F_DE" }],
    check(result, setup) {
      const h = setup.links[0].height, F = result.values.F_DE;
      const problems = [];
      if (F > RATING + 1e-6) problems.push(`At ${h.toFixed(1)} m the chain pulls with ${F.toFixed(1)} N — over its ${RATING} N rating. Lower it: a longer lever arm about C needs less pull.`);
      if (h < HEADROOM - 1e-6) problems.push(`At ${h.toFixed(1)} m the chain is too low: workers need ${HEADROOM} m to walk under it.`);
      if (problems.length) return { ok: false, flagged: F > RATING ? ["F_DE"] : [], message: problems.join("\n\n") };
      return { ok: true, message: `At ${h.toFixed(1)} m the chain pulls with ${F.toFixed(1)} N: within its rating, with room to walk under.` };
    },
  },
  hints: [
    "The whole frame first: $B_y = P/2$ (the load is in the middle).",
    "Leg BC, moments about C: $B_y$ acts 2 m out; the chain pulls level at E, $(4 - h)$ below C. So $2B_y = (4 - h)F_{DE}$.",
    "Low chain = long lever arm = small pull, but the headroom limit stops you going too low.",
  ],
  explanation:
    "The chain stops the legs spreading. About the top pin C, the floor's push on leg BC is balanced by the chain's pull times its distance below C — so the lower the chain, the less it pulls. " +
    "The headroom rule sets the lowest height, the chain's rating the highest: good design is the window in between.",
};
