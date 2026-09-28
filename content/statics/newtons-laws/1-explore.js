// Unit 1.1, stage 1 — explore: a crate hangs at rest from a cable; change its mass and g (other
// planets) and watch its weight W = mg and the cable's pull T = W.
// Start: 20 kg on Earth: W = 196.2 N (no task done yet).
// Checks: W = 1 kN on Earth within 10 N (m = 101 or 102 kg);  on the Moon (g = 1.62) the scale reads
//   what 20 kg reads on Earth, 196.2 N, within 5 N (m ≈ 121 kg);  a 50 kg crate weighs under 100 N (g < 2).

export default {
  id: "newtons-laws/1-explore",
  challenge: "explore",
  solver: "statics.newton",
  title: "Weigh It",
  mission: "Change a crate's mass and the planet it's on; watch its weight and the cable's pull.",
  instructions:
    "A crate hangs at rest from a cable. Its **mass** m (kg) is how much stuff it is; its **weight** $W = mg$ (N) is how hard gravity pulls it. " +
    "Change the mass and g — Earth 9.81, Mars 3.71, the Moon 1.62 m/s² — and watch W and the cable's pull T.",
  setup: { mass: 20, g: 9.81, look: "hanging", forces: [{ id: "T", symbol: "T", magnitude: null, direction: "up" }], showW: true },
  // Predict first (owner, 2026-09-27): one quick guess before the numbers show.
  guess: {
    prompt: "**A 10 kg crate hangs at rest from a cable. The cable pulls up on it with…**",
    options: [
      { text: "98.1 N", correct: true },
      { text: "10 N", feedback: "10 is the MASS in kg. The force is the weight, $W = mg = 10 \\times 9.81$ N." },
      { text: "more than 98.1 N, to hold it up", feedback: "At rest nothing speeds up, so the forces balance exactly (the first law): T = W." },
    ],
    explain: "At rest, T balances the weight: $T = W = mg = 98.1$ N.",
  },
  editable: [
    { path: "mass", label: "Mass m", min: 1, max: 200, step: 1, unit: "kg" },
    { path: "g", label: "g", min: 1, max: 25, step: 0.01, unit: "m/s^2" },
  ],
  tasks: [
    { text: "On Earth (g = 9.81), find a mass that weighs **1 kN** (within 10 N).", check: (v) => Math.abs(v.g - 9.81) < 1e-9 && Math.abs(v.W - 1000) < 10 },
    { text: "On the Moon (g = 1.62), make the crate weigh what **20 kg weighs on Earth** (196 N, within 5 N).", check: (v) => Math.abs(v.g - 1.62) < 0.005 && Math.abs(v.W - 196.2) < 5 },
    { text: "Make a **50 kg** crate weigh less than **100 N**.", check: (v) => v.m === 50 && v.W < 100 },
  ],
  hints: [
    "$W = mg$: 1000 N needs $m = 1000/9.81$ kg.",
    "On the Moon the same weight needs a bigger mass: $m = 196.2/1.62$.",
    "With 50 kg, $W < 100$ N needs $g < 2$ m/s².",
  ],
  explanation:
    "Mass is the same everywhere; weight depends on g. At rest, the cable's pull exactly balances the weight — the first law, ΣF = 0. " +
    "And the crate pulls DOWN on the cable just as hard as the cable pulls up on it — the third law.",
};
