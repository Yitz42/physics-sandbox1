// Unit 9.3, stage 1 — explore: wrap a rope round a rough post holding a 1000 N load; change the wrap
// and μs and watch the hand pull the load needs: T_hand = T_load / e^{μs β}.
// Start: β = 180°, μs = 0.3: e^{0.3π} = 2.566 → hand = 389.8 N (no task done yet).
// Checks: hand < 100 N;  μs = 0.1 and hand < 100 N (needs β ≥ ln 10/0.1 = 23.0 rad = 1319°: the slider
//   reaches 1440°);  the hand pulls half the load, within 5 % (β = ln 2/μs, e.g. 135° at μs = 0.3: 493 N).

export default {
  id: "wedges-belts/1-explore",
  challenge: "explore",
  solver: "statics.belt",
  title: "Turns on a Post",
  mission: "Wrap a rope round a post and see how little pull holds a heavy load.",
  instructions:
    "A 1000 N load hangs from a rope wrapped round a rough post that can't turn. You hold the other end. " +
    "Change how far the rope wraps round (β) and how grippy it is ($\\mu_s$), and watch the pull your hand needs, $T_1$.",
  setup: { drum: { r: 0.3 }, beta: 180, mus: 0.3, load: 1000, hand: 400, tight: "load", find: "hand" },
  // Predict first (owner, 2026-09-27): one quick guess before the numbers show.
  guess: {
    prompt: "**You add one more full turn of rope round the post. The pull your hand needs…**",
    options: [
      { text: "is divided by the same big factor every turn", correct: true },
      { text: "drops by the same amount every turn", feedback: "Each bit of rope's grip is in proportion to the tension there, so each turn divides the pull — it doesn't just subtract." },
      { text: "halves", feedback: "Close in spirit, but with $\\mu_s = 0.3$ one turn divides it by $e^{0.3 \\cdot 2\\pi} \\approx 6.6$." },
      { text: "stays the same — only the post's size matters", feedback: "The post's size doesn't appear at all. The angle of contact β does, exponentially." },
    ],
    explain: "$T_1 = T_2 / e^{\\mu_s\\beta}$: each extra turn divides the pull by $e^{2\\pi\\mu_s}$.",
  },
  editable: [
    { path: "beta", label: "Wrap β", min: 45, max: 1440, step: 45, unit: "deg" },
    { path: "mus", label: "μs", min: 0.1, max: 0.5, step: 0.05, unit: "" },
  ],
  tasks: [
    { text: "Hold the 1000 N load with a hand pull under **100 N**.", check: (v) => v.hand < 100 },
    { text: "Now make the rope slippery ($\\mu_s = 0.1$) and still hold it with under 100 N.", check: (v, s) => Math.abs(s.mus - 0.1) < 1e-6 && v.hand < 100 },
    { text: "Find a wrap where your hand pulls about **half** the load (within 5 %).", check: (v) => Math.abs(v.hand - 500) < 25 },
  ],
  hints: [
    "$T_2 = T_1 e^{\\mu_s\\beta}$: the load is $T_2$, your hand $T_1$. β is in radians in the formula (the slider shows degrees).",
    "To need under 100 N you need $e^{\\mu_s\\beta} > 10$, so $\\mu_s\\beta > \\ln 10 = 2.30$.",
    "Half the load: $e^{\\mu_s\\beta} = 2$, so $\\beta = \\ln 2/\\mu_s$ (in radians).",
  ],
  explanation:
    "Along the rope, the tension changes a little at each bit of contact, in proportion to the tension itself — the recipe for exponential growth. " +
    "So $T_2 = T_1 e^{\\mu_s\\beta}$: doubling the wrap SQUARES the ratio. That's why a few turns round a bollard hold a ship, and why a wet, slippery rope needs more turns.",
};
