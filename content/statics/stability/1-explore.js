// Unit 5.4, stage 1 — explore: add supports at three places and see whether
// the beam moves, is determinate, or is indeterminate (and to what degree).
// Hand check (the load P = 600 N slants down-left, so something must hold
// the beam sideways): pin A + roller C → 3 unknowns, determinate;
// three rollers → 3 unknowns but all parallel → improper, it slides;
// pin + pin + roller → 5 unknowns → indeterminate to degree 2; one fixed end → 3, determinate.

const slot = (id, withFixed, wall) => [
  { label: "Nothing", set: { [`supports.#${id}.type`]: "none", [`supports.#${id}.normal`]: [0, 1] } },
  { label: "Roller", set: { [`supports.#${id}.type`]: "roller", [`supports.#${id}.normal`]: [0, 1] } },
  { label: "Pin", set: { [`supports.#${id}.type`]: "pin", [`supports.#${id}.normal`]: [0, 1] } },
  ...(withFixed ? [{ label: "Fixed (built into a wall)", set: { [`supports.#${id}.type`]: "fixed", [`supports.#${id}.normal`]: wall } }] : []),
];
const types = (s) => s.supports.map((q) => q.type).filter((t) => t !== "none");

export default {
  id: "stability/1-explore",
  challenge: "explore",
  solver: "statics.rigidBody",
  title: "Enough Supports?",
  mission: "Add supports and find out when the beam moves, and when there are too many.",
  instructions:
    "Choose a support (or nothing) at A, B and C. The load $P$ slants, so it pushes the beam sideways as well as down. " +
    "Watch the count: 3 equations can find 3 well-placed unknowns — no more, no fewer.",
  setup: {
    body: { points: [[0, 0], [6, 0]] },
    supports: [
      { id: "A", type: "roller", at: [0, 0], normal: [0, 1] },
      { id: "B", type: "none", at: [3, 0], normal: [0, 1] },
      { id: "C", type: "roller", at: [6, 0], normal: [0, 1] },
    ],
    forces: [{ id: "P", symbol: "P", magnitude: 600, direction: { slope: [-3, -4] }, at: [4.5, 0], push: true }],
    showDegree: true,
  },
  view: { xmin: -1.3, xmax: 7.3, ymin: -2.2, ymax: 2.6 },
  editable: [
    { label: "Support at A", options: slot("A", true, [1, 0]) },
    { label: "Support at B", options: slot("B", false) },
    { label: "Support at C", options: slot("C", true, [-1, 0]) },
  ],
  tasks: [
    { text: "Hold the beam with exactly **3** unknowns so it stays put (determinate).", check: (v, s, r) => r.status === "determinate" },
    { text: "Use **3 rollers**: 3 unknowns, and yet it still moves!", check: (v, s, r) => r.status === "unstable" && v.n === 3 },
    { text: "Make it indeterminate to **degree 2**.", check: (v, s, r) => r.status === "indeterminate" && v.deg === 2 },
    { text: "Hold it with just **one** support.", check: (v, s, r) => r.status === "determinate" && types(s).length === 1 },
  ],
  hints: [
    "A roller gives 1 unknown, a pin 2, a fixed support 3. Add them up.",
    "Three rollers give 3 unknowns, but all three push straight up. What stops the slanted load sliding the beam sideways?",
    "Degree of indeterminacy = unknowns − 3. Which supports add up to 5 unknowns?",
  ],
  explanation:
    "Counting is the first check: fewer than 3 unknowns and the beam moves; more than 3 and it's statically indeterminate, by $n - 3$. " +
    "But 3 isn't automatically enough: three rollers push in parallel, so nothing resists sliding sideways — the beam is improperly supported. " +
    "A fixed support alone gives exactly the 3 reactions needed.",
};
