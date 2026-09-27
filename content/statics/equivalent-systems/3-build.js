// Equivalent systems, stage 3 — build: place three crates so a crane lifts the beam level.
// A beam hanging from one hook stays level only if the resultant of all the
// loads acts right under the hook (then they have no moment about it).
// Hand-worked solution (one of many), hook at 1.5 m:
//   10 kg at 2.5 m, 20 kg at 1.0 m, 30 kg at 1.5 m:  x̄ = (25 + 20 + 45) / 60 = 1.5 m ✓

const HOOK = 1.5; // m
const TOL = 0.02; // m
const GAP = 0.45; // m, crates can't overlap
const BOXES = ["B10", "B20", "B30"];

export default {
  id: "equivalent-systems/3-build",
  challenge: "build",
  solver: "statics.equivalent",
  title: "Lift It Level",
  instructions:
    "A crane lifts this light beam by one hook, 1.5 m from its left end. Place the three crates so the beam hangs **level**: " +
    "the single resultant of their weights must act right under the hook. Press **Test** to check.",
  setup: {
    analysis: "equivalent",
    about: { at: [0, 0], label: "O" },
    body: { points: [[0, 0], [4, 0]] },
    arrowFraction: 0.15,
    boxSize: 0.4,
    hideArms: true,
    resultant: "single",
    resultantDimOffset: -0.62,
    hook: { at: [HOOK, 0], height: 1.25, label: "H" },
    forces: [
      { id: "B10", symbol: "W_{10}", kind: "weight", mass: 10, at: [0.5, 0] },
      { id: "B20", symbol: "W_{20}", kind: "weight", mass: 20, at: [2.5, 0] },
      { id: "B30", symbol: "W_{30}", kind: "weight", mass: 30, at: [3.5, 0] },
    ],
    dims: [{ from: [0, -0.3], to: [HOOK, -0.3] }],
  },
  view: { xmin: -0.4, xmax: 4.4, ymin: -1.0, ymax: 1.5 },
  editable: [
    { path: "forces.#B10.at.0", label: "10 kg crate at x", min: 0, max: 4, step: 0.05, unit: "m" },
    { path: "forces.#B20.at.0", label: "20 kg crate at x", min: 0, max: 4, step: 0.05, unit: "m" },
    { path: "forces.#B30.at.0", label: "30 kg crate at x", min: 0, max: 4, step: 0.05, unit: "m" },
  ],
  goal: {
    text: `Hang level: the resultant of the weights acts under the hook, $\\bar{x} = ${HOOK}$ m (within ${TOL} m), with the crates at least ${GAP} m apart.`,
    check(result, setup) {
      const xs = BOXES.map((id) => setup.forces.find((f) => f.id === id).at[0]);
      for (let i = 0; i < xs.length; i++) {
        for (let j = i + 1; j < xs.length; j++) {
          if (Math.abs(xs[i] - xs[j]) < GAP - 1e-9) return { ok: false, message: `Two crates are too close together — they need at least ${GAP} m between them.` };
        }
      }
      const x = result.values.pos;
      if (Math.abs(x - HOOK) <= TOL) return { ok: true, message: `$\\bar{x} = ${x.toFixed(2)}$ m: the resultant acts right under the hook, so the beam hangs level.` };
      const side = x > HOOK ? "right" : "left";
      return { ok: false, message: `The resultant acts at $\\bar{x} = ${x.toFixed(2)}$ m, ${Math.abs(x - HOOK).toFixed(2)} m to the ${side} of the hook, so the beam would tilt down on the ${side}. Move weight toward the other side.` };
    },
  },
  hints: [
    "The resultant is the weighted average position: $\\bar{x} = \\Sigma m x \\,/\\, \\Sigma m$ ($g$ cancels).",
    "You need $\\Sigma m x = 60 \\times 1.5 = 90$ kg·m.",
    "Try the 30 kg crate right under the hook. Then the other two must balance each other about the hook.",
  ],
  explanation:
    "A body hanging from one point settles so that the resultant of its loads passes through that point — then the loads have no moment about it. " +
    "Placing loads is really placing their resultant: $\\bar{x} = \\Sigma m x / \\Sigma m$.",
};
