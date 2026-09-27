// Unit 8.2 — Shear and moment diagrams: V and M all along a beam, and how they're related.
export default {
  title: "Shear and moment diagrams",
  concept: "Cut the beam everywhere at once: the **shear diagram** plots V along the beam and the **moment diagram** plots M. They follow simple rules, walking left to right: V **jumps** by each point force (up for an upward force) and falls at the rate of the load, $\\dfrac{dV}{dx} = -w$ — so V falls by the load's AREA. M changes at the rate V, $\\dfrac{dM}{dx} = V$ — so M rises by the area under the V diagram — and **jumps** at each couple. M is biggest where V = 0 (or changes sign).",
  goals: [
    "Read and sketch shear and moment diagrams.",
    "Use $dV/dx = -w$: V falls by the load's area; jumps at point forces.",
    "Use $dM/dx = V$: M changes by the area under V; jumps at couples.",
    "Find the largest bending moment: where V = 0 or changes sign.",
  ],
  stages: ["1-explore", "2-predict", "3-build", "4-debug", "5-concept-check", "6-solve"],
};
