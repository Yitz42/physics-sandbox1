// Moving a force, stage 3 — build: choose where to bolt a base plate so the
// force-couple system at the bolt stays within what the bolt can hold.
// Hand check: F = 500 N at 30° below +x, at A = (3, 0.8) m on top of a post:
//   F_x = 433.0 N, F_y = −250 N. With the bolt at O = (x_O, 0):
//   (M_R)_O = (3 − x_O)(−250) − 0.8(433.0) = 250 x_O − 1096.4 N·m.
//   |(M_R)_O| ≤ 150 needs 3.79 ≤ x_O ≤ 4.99; on the 4 m plate that's 3.8 to 4.0 m.
//   (F's line of action meets the floor at x = 3 + 0.8/tan30° = 4.39 m: no couple there.)

const LIMIT = 150; // N·m, the most twist the bolt can hold

export default {
  id: "moving-forces/3-build",
  challenge: "build",
  solver: "statics.equivalent",
  title: "Where to Bolt It",
  instructions:
    "A 500 N force pushes on top of the post at A. The base plate will be held down by ONE bolt, somewhere along the plate. " +
    `At the bolt, the force acts as a force-couple system: the same 500 N, plus a couple. The bolt can hold the force, but at most **${LIMIT} N·m** of couple. ` +
    "Choose where to put the bolt, O, then press **Test**.",
  setup: {
    analysis: "equivalent",
    about: { at: [1, 0], label: "O" },
    body: { points: [[0, 0], [3, 0], [3, 0.8], [3, 0], [4, 0]] }, // the base plate, with the post up to A
    arrowFraction: 0.35,
    resultant: "at O",
    line: false,
    forces: [{ id: "F", symbol: "F", magnitude: 500, direction: { angle: 30, from: "+x", toward: "-y" }, at: [3, 0.8], pointLabel: "A" }],
    dims: [
      { from: [0, -0.3], to: [3, -0.3] },
      { from: [3, -0.3], to: [4, -0.3] },
      { from: [-0.35, 0], to: [-0.35, 0.8], side: -1 },
    ],
  },
  view: { xmin: -0.8, xmax: 5.2, ymin: -1.0, ymax: 1.6 },
  editable: [
    { path: "about.at.0", label: "Bolt O at x", min: 0, max: 4, step: 0.05, unit: "m" },
  ],
  goal: {
    text: `The couple at the bolt must be at most ${LIMIT} N·m (either way).`,
    check(result, setup) {
      const M = result.values.M;
      const x = setup.about.at[0];
      const says = `With the bolt at $x = ${x.toFixed(2)}$ m, the force-couple system at O is 500 N plus $(M_R)_O = ${M.toFixed(1)}$ N·m.`;
      if (Math.abs(M) <= LIMIT) return { ok: true, message: `${says} The bolt can hold that.` };
      return { ok: false, message: `${says} That's more than ${LIMIT} N·m. Where does the force's line of action meet the floor? The closer the bolt is to that point, the smaller the couple.` };
    },
  },
  hints: [
    "The couple at O is the force's moment about O: $(M_R)_O = x_{OA}F_y - y_{OA}F_x$, with A measured from O.",
    "Here $(M_R)_O = (3 - x_O)(-250) - 0.8(433)$ N·m. Which $x_O$ keeps that between −150 and +150?",
    "A bolt ON the force's line of action would need no couple at all. That line meets the floor 0.8/tan 30° = 1.39 m past the post.",
  ],
  explanation:
    "Moving a force to a support always adds a couple equal to its moment about that support. That couple is smallest when the support is close to the force's line of action — " +
    "which is why bolts and welds go where the loads' lines of action pass, whenever the design allows.",
};
