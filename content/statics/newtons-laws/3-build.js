// Unit 1.1, stage 3 — build: load a hoist with as many crates as its cable's rating allows (no more).
// The student works out the cable's pull for their load before Test (goal.predict).
// Default 35 kg crates, rated 8 kN: each weighs 343.35 N; 8000/343.35 = 23.3 → 23 crates, T = 7897.1 N.
// Versions: crates 20–60 kg, ratings 5–10 kN: the most crates is between 8 and 50 (the slider reaches 60).

export default {
  id: "newtons-laws/3-build",
  challenge: "build",
  solver: "statics.newton",
  title: "Load the Hoist",
  mission: "Hang as many crates as the cable's rating allows, and work out its pull.",
  instructions:
    "A hoist's cable holds a stack of identical crates at rest. Its rating (in the picture) is the most it may pull. " +
    "Load as many crates as it can safely hold — one more would overload it. Then work out the cable's pull T and press **Test**.",
  setup: { count: 1, each: 35, rating: 8, look: "hanging", forces: [{ id: "T", symbol: "T", magnitude: null, direction: "up" }] },
  vary: [
    { path: "each", min: 20, max: 60, step: 2.5 },
    { path: "rating", values: [5, 6, 8, 10] },
  ],
  editable: [{ path: "count", label: "Crates", min: 1, max: 60, step: 1, unit: "" }],
  goal: {
    text: "The cable holds the load within its rating — with as many crates as possible.",
    predict: [{ quantity: "T" }],
    check(result, setup) {
      const v = result.values, limit = setup.rating * 1000, one = setup.each * v.g;
      if (v.T > limit + 1e-9) return { ok: false, message: `Overloaded: the cable would pull ${v.T.toFixed(1)} N, over its ${setup.rating} kN (${limit} N) rating. Take crates off.` };
      if (v.T + one <= limit + 1e-9) return { ok: false, message: `Safe, but there's room for more: one more crate (${one.toFixed(1)} N) still fits under ${limit} N.` };
      return { ok: true, message: `Full load: ${setup.count} crates pull ${v.T.toFixed(1)} N, and one more would overload the ${setup.rating} kN cable.` };
    },
  },
  hints: [
    "Each crate weighs $mg$. The stack's weight is the number of crates times that.",
    "At rest the cable's pull equals the total weight (ΣF = 0).",
    "The rating is in kN: 1 kN = 1000 N. Divide it by one crate's weight and round DOWN.",
  ],
  explanation:
    "At rest the cable carries the whole weight: $T = n\\,mg$. Its rating in kN has to be compared in the same units — newtons — before dividing.",
};
