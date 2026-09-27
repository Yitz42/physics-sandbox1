// Unit 5, stage 1 — explore, in two parts:
//   1. two loads on a beam and the single force that replaces them;
//   2. one force moved to a point O, with the couple M = Fd that makes up for it.
// Part 1 hand check (default numbers): F_R = 200 + 400 = 600 N down,
//   (M_R)_O = −(200·1 + 400·5) = −2200 N·m,  x̄ = 2200 / 600 = 3.67 m.

export default {
  id: "05-equivalent-systems/1-explore",
  challenge: "explore",
  solver: "statics.equivalent",
  title: "Slide the Loads",
  parts: [
    {
      title: "Slide the loads",
      instructions:
        "Two loads push down on a beam. The dashed purple arrow is the **single force** that has exactly the same effect: the same total push $F_R$ and the same moment about O. " +
        "Change the loads and watch where it has to act.",
      setup: {
        analysis: "equivalent",
        about: { at: [0, 0], label: "O" },
        body: { points: [[0, 0], [6, 0]] },
        forceScale: 1000, // arrows drawn 1 m per 1000 N
        hideArms: true,
        showResultant: true, // the single resultant force is shown all the time
        resultant: "single",
        resultantDimOffset: -0.45,
        forces: [
          { id: "F1", symbol: "F_1", magnitude: 200, direction: "down", at: [1, 0], push: true },
          { id: "F2", symbol: "F_2", magnitude: 400, direction: "down", at: [5, 0], push: true },
        ],
      },
      view: { xmin: -0.6, xmax: 6.6, ymin: -1.0, ymax: 1.1 },
      editable: [
        { path: "forces.#F1.magnitude", label: "Size of F₁", min: 50, max: 800, step: 50, unit: "N" },
        { path: "forces.#F1.at.0", label: "F₁ at x", min: 0, max: 6, step: 0.25, unit: "m" },
        { path: "forces.#F2.magnitude", label: "Size of F₂", min: 50, max: 800, step: 50, unit: "N" },
        { path: "forces.#F2.at.0", label: "F₂ at x", min: 0, max: 6, step: 0.25, unit: "m" },
      ],
      tasks: [
        { text: "Make the resultant act at the middle of the beam: $\\bar{x} = 3$ m.", check: (v) => Math.abs(v.pos - 3) <= 0.02 },
        { text: "Make the resultant act closer to $F_1$ than to $F_2$.", check: (v, s) => Math.abs(v.pos - s.forces[0].at[0]) < Math.abs(v.pos - s.forces[1].at[0]) - 1e-9 },
        { text: "Make $F_R = 1000$ N.", check: (v) => Math.abs(v.R - 1000) <= 0.1 },
        { text: "Make the resultant act at the right-hand end: $\\bar{x} = 6$ m.", check: (v) => Math.abs(v.pos - 6) <= 0.02 },
      ],
      hints: [
        "The resultant sits closer to the bigger load: it's a weighted average of the positions.",
        "For two loads at the same spot, the resultant is right there too.",
        "$\\bar{x} = (F_1 x_1 + F_2 x_2) / (F_1 + F_2)$ for loads that all point the same way.",
      ],
      explanation:
        "The single equivalent force has the same size as all the loads together, $F_R = \\Sigma F$, and it acts where its own moment about O equals theirs: " +
        "$F_R\\,\\bar{x} = \\Sigma F x$. That's why it's drawn toward the heavier load, like a see-saw balancing point.",
    },
    {
      title: "Move a force to O",
      instructions:
        "A force $F$ pushes on the beam at A. You can move it to any other point O — as long as you add a **couple** that makes up for the turning effect it loses. " +
        "The purple arrows at O are that **force-couple system**: the same force $F$, plus a couple moment $M = Fd$. Slide O along the beam and watch the couple change.",
      setup: {
        analysis: "equivalent",
        about: { at: [0, 0], label: "O" },
        body: { points: [[0, 0], [4, 0]] },
        forceScale: 1000,
        hideArms: true,
        showResultant: true,
        resultant: "at O",
        line: false, // a force-couple system at O: no single-force position x̄
        forces: [{ id: "F", symbol: "F", magnitude: 300, direction: "down", at: [3, 0], push: true, pointLabel: "A" }],
        dims: [{ from: [0, -0.3], to: [3, -0.3] }],
      },
      view: { xmin: -0.6, xmax: 4.6, ymin: -1.0, ymax: 1.1 },
      editable: [
        { path: "about.at.0", label: "O at x", min: 0, max: 4, step: 0.25, unit: "m" },
        { path: "forces.0.magnitude", label: "Size of F", min: 100, max: 600, step: 50, unit: "N" },
      ],
      tasks: [
        { text: "Move O so that NO couple is needed: $(M_R)_O = 0$.", check: (v) => Math.abs(v.M) < 1e-6 },
        { text: "Make the couple at O turn counterclockwise.", check: (v) => v.M > 1 },
        { text: "Make the couple exactly 600 N·m (either way).", check: (v) => Math.abs(Math.abs(v.M) - 600) < 0.5 },
      ],
      hints: [
        "A force can slide along its own line of action without changing anything. Where does F's line of action meet the beam?",
        "A downward force to the RIGHT of O turns the beam clockwise about O. What if O is to the right of A?",
        "The couple is $M = Fd$, with $d$ the distance from O to the line of action. For 600 N·m with $F = 300$ N you need $d = 2$ m.",
      ],
      explanation:
        "Moving a force sideways by a distance $d$ changes its moment about every point, so a couple $M = Fd$ must be added to keep the same effect. " +
        "Its sense is the way $F$ turned the body about O. On the force's own line of action, $d = 0$ and no couple is needed.",
    },
  ],
  explanation:
    "A force can move to any point if a couple $M = Fd$ goes with it; and a whole set of loads can become one force $F_R$ at the right spot, $\\bar{x} = \\Sigma F x / F_R$.",
};
