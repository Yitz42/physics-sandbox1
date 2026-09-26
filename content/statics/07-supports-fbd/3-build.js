// Unit 7, stage 3 — build: choose the supports for a bridge deck.
// Goal: rest on both piers, stable, statically determinate, and free to grow
// longer in hot weather. Hand-worked answer: a pin at one end, a roller at the other
// (3 unknowns, and the roller end can slide). Pin + pin or fixed + roller → 4 or 5
// unknowns (indeterminate, and it can't expand); roller + roller → only 2 (the
// braking force slides it off).

const choices = (id, wall) => [
  { label: "Nothing", set: { [`supports.#${id}.type`]: "none", [`supports.#${id}.normal`]: [0, 1] } },
  { label: "Roller", set: { [`supports.#${id}.type`]: "roller", [`supports.#${id}.normal`]: [0, 1] } },
  { label: "Pin", set: { [`supports.#${id}.type`]: "pin", [`supports.#${id}.normal`]: [0, 1] } },
  { label: "Fixed (built into the pier)", set: { [`supports.#${id}.type`]: "fixed", [`supports.#${id}.normal`]: wall } },
];
// Can this end hold the deck sideways (stop it growing longer)?
const holdsSideways = (type) => type === "pin" || type === "fixed";

export default {
  id: "07-supports-fbd/3-build",
  challenge: "build",
  solver: "statics.rigidBody",
  title: "Support the Bridge",
  instructions:
    "A 10 m bridge deck rests on two piers, A and B. A braking truck pushes down on it and also drags it sideways. " +
    "Choose the support at each pier, then press **Test**. The engineer's brief is below.",
  setup: {
    body: { points: [[0, 0], [10, 0]] },
    supports: [
      { id: "A", type: "pin", at: [0, 0], normal: [0, 1] },
      { id: "B", type: "pin", at: [10, 0], normal: [0, 1] },
    ],
    forces: [
      { id: "W_t", symbol: "W_t", magnitude: 40000, direction: "down", at: [6, 0], push: true },
      { id: "F_b", symbol: "F_b", magnitude: 8000, direction: "left", at: [6, 0] },
    ],
  },
  view: { xmin: -1.8, xmax: 11.8, ymin: -2.6, ymax: 3.4 },
  editable: [
    { label: "Support at pier A", options: choices("A", [1, 0]) },
    { label: "Support at pier B", options: choices("B", [-1, 0]) },
  ],
  goal: {
    text: "The deck must (1) rest on **both** piers, (2) be **stable**, (3) be **statically determinate**, so its reactions can be found, and (4) be free to **grow longer** in summer heat.",
    check(result, setup) {
      const [a, b] = setup.supports.map((s) => s.type);
      if (a === "none" || b === "none") return { ok: false, message: "The deck must rest on both piers — a 10 m deck held at one end only would need an enormous fixed connection." };
      if (result.status === "unstable") return { ok: false, message: `It moves! ${result.message}` };
      if (result.status === "indeterminate") {
        const stuck = holdsSideways(a) && holdsSideways(b);
        return { ok: false, message: `${result.message}${stuck ? " And with both ends held sideways, the deck can't grow longer when it heats up: it would push on the piers with huge forces." : ""}` };
      }
      if (holdsSideways(a) && holdsSideways(b)) return { ok: false, message: "Both ends are held sideways, so the deck can't grow longer in the heat." };
      return { ok: true, message: "3 unknowns, all findable, and the roller end is free to slide as the deck expands. That's why real bridges have a pin at one end and a roller (or a sliding bearing) at the other." };
    },
  },
  hints: [
    "Count the unknowns: you need exactly 3, placed so that the deck can't slide or turn.",
    "Something must stop the braking force sliding the deck sideways — but only at ONE end, or the deck can't expand.",
    "Which support stops sideways sliding? Which one lets the deck slide?",
  ],
  explanation:
    "A pin (2 unknowns) plus a roller (1 unknown) gives exactly 3 reactions that the 3 equilibrium equations can find. " +
    "The pin takes the sideways braking force; the roller lets the deck grow and shrink with the temperature without pushing on the piers.",
};
