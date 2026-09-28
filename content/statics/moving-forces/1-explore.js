// Moving a force, stage 1 — explore: one force moved to a point O, with the
// couple M = Fd that makes up for it.

export default {
  id: "moving-forces/1-explore",
  challenge: "explore",
  solver: "statics.equivalent",
  title: "Move a Force to O",
  mission: "Move a force to another point and see which couple keeps its effect the same.",
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
  // Predict first (owner, 2026-09-27): one quick guess before the numbers show.
  guess: {
    prompt: "To move $F$ = 300 N from A to O without changing its effect, you add a couple. **How big?**",
    options: [
      { text: "900 N·m", correct: true },
      { text: "No couple: a force can slide anywhere", feedback: "It can slide only along its own line. O is off that line, so its turning effect must be added back." },
      { text: "300 N·m", feedback: "Multiply by the distance it moves: $M = Fd$ = 300 × 3." },
    ],
    explain: "$M = Fd$ = 300 N × 3 m = 900 N·m, turning the same way $F$ did about O.",
  },
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
};
