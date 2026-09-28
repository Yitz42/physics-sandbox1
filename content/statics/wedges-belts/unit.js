// Unit 9.3 — Wedges and belt friction.
export default {
  title: "Wedges and belt friction",
  concept: "Two machines that use friction. A **rope round a rough post** about to slip: friction builds up all along the contact, so the tight side's pull grows **exponentially** with the angle of contact, $T_2 = T_1 e^{\\mu_s\\beta}$ (β in radians) — a few turns let a hand hold a ship. A **wedge** turns a push into a big lift; at every rough contact a normal force $N$ and friction $\\mu_s N$ act, against that surface's sliding. Take the bodies apart and write two force equations for each. A wedge that stays in by itself when the push is removed is **self-locking**.",
  goals: [
    "Use T₂ = T₁ e^{μs β} with β in radians, choosing the tight side from the way the rope would slip.",
    "Find the turns of rope needed to hold a load: β = ln(T₂/T₁)/μs.",
    "Draw a wedge and the block it lifts as two free bodies, with friction against each surface's sliding.",
    "Find the push that drives a wedge in, and decide whether it is self-locking.",
  ],
  stages: ["1-explore", "2-predict", "3-build", "4-debug", "5-concept-check", "6-solve"],
};
