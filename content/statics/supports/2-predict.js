// Unit 7, stage 2 — predict: how many unknown reactions does each support give?
// Each version picks a pair of supports (below); the answers are the counts
// pin 2, roller 1, smooth surface 1, cable 1, fixed 3. Test then shows the
// reactions on the beam and what the total means (determinate or not).

const A = (type) => ({ id: "A", type, at: [0, 0], normal: type === "fixed" ? [1, 0] : [0, 1], anchor: [0, 2] });
const B = (type) => ({ id: "B", type, at: [5, 0], normal: type === "fixed" ? [-1, 0] : [0, 1], anchor: [5, 2] });
const PAIRS = [
  ["pin", "roller"], ["pin", "pin"], ["fixed", "roller"], ["roller", "roller"], ["pin", "cable"],
  ["fixed", "pin"], ["smooth", "pin"], ["cable", "roller"], ["fixed", "cable"], ["roller", "smooth"],
];

export default {
  id: "supports/2-predict",
  challenge: "predict",
  solver: "statics.rigidBody",
  title: "Count the Unknowns",
  mission: "Predict how many unknown reactions each support gives.",
  instructions:
    "Replace each support with its reactions. How many **unknown** reactions does the support at A give, and the one at B? " +
    "Predict both, then press **Test** to see the free-body diagram.",
  setup: {
    analysis: "count",
    showReactions: "reveal",
    body: { points: [[0, 0], [5, 0]] },
    supports: [A("pin"), B("roller")],
    forces: [{ id: "P", symbol: "P", magnitude: 600, direction: "down", at: [2, 0], push: true }],
  },
  view: { xmin: -1.3, xmax: 6.3, ymin: -1.5, ymax: 2.4 },
  vary: [
    { path: "supports", values: PAIRS.map(([a, b]) => [A(a), B(b)]) },
    { path: "forces.#P.magnitude", values: [400, 500, 600, 700, 800] },
    { path: "forces.#P.at.0", values: [1.5, 2, 2.5, 3] },
  ],
  correctMessage: "The picture now shows the free-body diagram: every reaction the two supports give. The equations show whether 3 equations are enough to find them.",
  ask: [{ quantity: "n_A", whole: true, min: 0, max: 9 }, { quantity: "n_B", whole: true, min: 0, max: 9 }],
  hints: [
    "Ask of each support: which ways does it stop the beam moving? Sliding sideways, sliding up or down, turning.",
    "A roller or a smooth surface only stops motion INTO the surface. A cable only pulls along itself.",
    "A pin stops sliding both ways but lets the beam turn. A fixed support stops turning too.",
  ],
  explanation:
    "A support gives one unknown for each motion it stops: roller, smooth surface and cable 1; pin 2; fixed support 3. " +
    "The beam has 3 equations ($\\Sigma F_x$, $\\Sigma F_y$, $\\Sigma M$), so 3 well-placed unknowns can be found; 4 or more can't (statically indeterminate), and 2 or fewer can't hold it.",
};
