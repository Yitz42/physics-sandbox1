// Unit 5.4, stage 2 — predict: count the unknowns and the degree of indeterminacy.
// Hand checks: propped cantilever (fixed A + roller B): n = 3 + 1 = 4, degree 1;
// continuous beam (pin A + rollers B, C, D): n = 2 + 1 + 1 + 1 = 5, degree 2;
// fixed at both ends: n = 3 + 3 = 6, degree 3; fixed A + pin B: n = 5, degree 2.

const P = (x) => ({ id: "P", symbol: "P", magnitude: 600, direction: "down", at: [x, 0], push: true });
const fixed = (id, x, n) => ({ id, type: "fixed", at: [x, 0], normal: n });
const pin = (id, x) => ({ id, type: "pin", at: [x, 0] });
const roller = (id, x) => ({ id, type: "roller", at: [x, 0] });

const situation = (name, instructions, supports, length = 6) => ({
  name,
  instructions,
  setup: { analysis: "count", showReactions: "reveal", showDegree: true, body: { points: [[0, 0], [length, 0]] }, supports, forces: [P(2)] },
});

export default {
  id: "stability/2-predict",
  challenge: "predict",
  solver: "statics.rigidBody",
  title: "How Indeterminate?",
  mission: "Predict the number of unknowns and the degree of indeterminacy.",
  instructions: "Count the unknown reactions, then predict how many more there are than equations.",
  situations: [
    situation("propped cantilever", "A beam is built into a wall at A and also rests on a roller at B.", [fixed("A", 0, [1, 0]), roller("B", 6)]),
    situation("continuous beam", "A long beam rests on a pin at A and rollers at B, C and D.", [pin("A", 0), roller("B", 2), roller("C", 4), roller("D", 6)]),
    situation("fixed both ends", "A beam is built into walls at both ends.", [fixed("A", 0, [1, 0]), fixed("B", 6, [-1, 0])]),
    situation("fixed and pin", "A beam is built into a wall at A and pinned at B.", [fixed("A", 0, [1, 0]), pin("B", 6)]),
  ],
  vary: [
    { path: "forces.#P.magnitude", min: 300, max: 900, step: 25 },
    { path: "forces.#P.at.0", values: [1.5, 2.5, 3.5, 4.5] },
  ],
  view: { xmin: -1.4, xmax: 7.4, ymin: -1.8, ymax: 2.4 },
  correctMessage: "The picture shows every reaction. More than 3 unknowns means equilibrium alone can't find them: the extra ones need how the beam bends (mechanics of materials).",
  ask: [{ quantity: "n", whole: true, min: 0, max: 12 }, { quantity: "deg", whole: true, min: 0, max: 9 }],
  hints: [
    "Pin 2, roller 1, fixed support 3. Add up every support.",
    "A body in a plane has 3 equilibrium equations: $\\Sigma F_x$, $\\Sigma F_y$, $\\Sigma M$.",
    "Degree of indeterminacy = unknowns − 3.",
  ],
  explanation:
    "Add each support's unknowns to get $n$; the degree of indeterminacy is $n - 3$. " +
    "Engineers use indeterminate structures all the time — the extra supports make them stiffer and safer — but finding their reactions needs more than statics.",
};
