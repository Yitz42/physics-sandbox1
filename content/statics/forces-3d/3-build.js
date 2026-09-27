// Unit 2.3, stage 3 — build: place a guy wire's ground anchor B so it pulls the pole top A
// straight toward −y (no x pull) with a horizontal pull between 600 and 800 N.
// A (0, 0, h), B (x, y, 0), tension T: T_x = T x / r, T_y = T y / r, r = √(x² + y² + h²).
// Default T = 1500 N, h = 6: x = 0 and y = −3 (671 N) or −3.5 (756 N) work.
// Every version (T 1200–1800, h 5–7) has an anchor on the 0.5 m grid that works: the
// pull changes by at most ~130 N a step near the band (checked in the tests).
// Start: B (3, 3, 0) — pulls sideways (T_x ≠ 0).

export const LOW = 600, HIGH = 800;

export default {
  id: "forces-3d/3-build",
  challenge: "build",
  solver: "statics.force3d",
  title: "Anchor the Guy Wire",
  mission: "Place a guy wire's anchor so it pulls the pole the right way, just hard enough.",
  instructions:
    `A guy wire holds the top A of a pole against a wind from +y. Its tension is set by a turnbuckle. Place its anchor B on the ground so the wire pulls A **straight toward −y** — ` +
    `no sideways pull ($T_x = 0$) — with a horizontal pull $|T_y|$ between **${LOW} N and ${HIGH} N**. Then work out $T_y$ and $T_z$ and press **Test**.`,
  setup: {
    points: { O: [0, 0, 0], A: [0, 0, 6], B: [3, 3, 0] },
    pole: ["O", "A"],
    cables: [["A", "B"]],
    groundCentre: [0, 0], // (the ground stays put while the anchor moves)
    // Everywhere the anchor sliders can put B stays in view, so the picture never rescales.
    keepInView: [[-6, -6, 0], [6, -6, 0], [6, 6, 0], [-6, 6, 0]],
    axisLength: 7,
    forces: [{ id: "T", symbol: "T", magnitude: 1500, dir: { from: "A", to: "B" } }],
    showComponents: "reveal", // (not before: T_y and T_z are what the student works out)
  },
  vary: [
    { path: "forces.0.magnitude", min: 1200, max: 1800, step: 50 },
    { path: "points.A.2", values: [5, 5.5, 6, 6.5, 7] },
  ],
  editable: [
    { path: "points.B.0", label: "Anchor x", min: -6, max: 6, step: 0.5, unit: "m" },
    { path: "points.B.1", label: "Anchor y", min: -6, max: 6, step: 0.5, unit: "m" },
  ],
  goal: {
    text: `$T_x = 0$, and $${LOW}\\text{ N} \\le |T_y| \\le ${HIGH}\\text{ N}$ toward −y.`,
    predict: [{ quantity: "T.y" }, { quantity: "T.z" }],
    check(result) {
      const v = result.values;
      if (Math.abs(v["T.x"]) > 0.5) return { ok: false, message: `The wire pulls sideways: $T_x$ = ${v["T.x"].toFixed(1)} N. Put the anchor on the y axis (x = 0).` };
      if (v["T.y"] > 0) return { ok: false, message: "It pulls toward +y — with the wind, not against it. Put the anchor on the −y side." };
      const h = Math.abs(v["T.y"]);
      if (h < LOW) return { ok: false, message: `The horizontal pull is only ${h.toFixed(1)} N. A wire that's steeper pulls more down and less sideways: move the anchor further out.` };
      if (h > HIGH) return { ok: false, message: `The horizontal pull is ${h.toFixed(1)} N — too much. Move the anchor closer to the pole.` };
      return { ok: true, message: `The wire pulls ${h.toFixed(1)} N toward −y, and ${Math.abs(v["T.z"]).toFixed(1)} N down the pole.` };
    },
  },
  hints: [
    "No sideways pull: B must be straight out along the y axis from the pole, x = 0.",
    "$T_y = T\\,\\dfrac{y_B}{r_{AB}}$ with $r_{AB} = \\sqrt{y_B^2 + h^2}$: the further out B is, the bigger the share of T that pulls sideways.",
    "Try a few anchors on paper first — or solve $T\\,|y|/\\sqrt{y^2 + h^2} = 700$ for y.",
  ],
  explanation:
    "Only the direction of the wire decides how its tension splits: $\\mathbf{T} = T\\,\\mathbf{u}_{AB}$. A wire anchored far out pulls mostly sideways; one anchored close pulls mostly down the pole, " +
    "loading it without holding it much. Real guy wires are usually anchored about as far out as the pole is tall — a 45° wire.",
};
