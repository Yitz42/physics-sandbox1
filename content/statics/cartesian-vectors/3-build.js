// Cartesian vectors, stage 3 — build: choose where to anchor a cable so it pulls with a given Cartesian force.

const WANT = [-120, 160]; // N: the cable force wanted, {−120 i + 160 j} N (size 200 N)

export default {
  id: "cartesian-vectors/3-build",
  challenge: "build",
  solver: "statics.particle",
  title: "Anchor the Cable",
  mission: "Place anchor B so the cable pulls on the ring with exactly the force asked for.",
  instructions:
    "A cable will hold the ring at A. Its tension is $T = 200$ N, and it must pull on the ring with exactly " +
    `$\\mathbf{T} = \\{${WANT[0]}\\,\\mathbf{i} + ${WANT[1]}\\,\\mathbf{j}\\}$ N. ` +
    "You choose where to anchor its other end, B: move B with the sliders, then press **Test**. The numbers stay hidden until you do.",
  setup: {
    analysis: "components",
    cartesian: true,
    point: { at: [3, 0], label: "A" },
    forces: [{ id: "T", symbol: "T", magnitude: 200, kind: "cable", direction: { points: [[3, 0], [4.5, 4]], names: ["A", "B"] } }],
  },
  editable: [
    { path: "forces.0.direction.points.1.0", label: "x of B", min: -3, max: 5, step: 0.5, unit: "m" },
    { path: "forces.0.direction.points.1.1", label: "y of B", min: 0.5, max: 8, step: 0.5, unit: "m" },
  ],
  goal: {
    text: `Make the cable pull with $\\mathbf{T} = \\{${WANT[0]}\\,\\mathbf{i} + ${WANT[1]}\\,\\mathbf{j}\\}$ N (each part within 2 N).`,
    check(result) {
      const v = result.values;
      const tx = v["T.x"].toFixed(1), ty = v["T.y"].toFixed(1);
      if (Math.abs(v["T.x"] - WANT[0]) <= 2 && Math.abs(v["T.y"] - WANT[1]) <= 2) {
        return { ok: true, message: `$\\mathbf{r}_{AB} = \\{${v["T.rx"]}\\,\\mathbf{i} + ${v["T.ry"]}\\,\\mathbf{j}\\}$ m points the same way as $\\{-3\\,\\mathbf{i} + 4\\,\\mathbf{j}\\}$, so $\\mathbf{u}_{AB} = -0.6\\,\\mathbf{i} + 0.8\\,\\mathbf{j}$. Any B on that line from A works: the force depends only on the direction.` };
      }
      return {
        ok: false,
        message: `With B there, $\\mathbf{r}_{AB} = \\{${v["T.rx"]}\\,\\mathbf{i} + ${v["T.ry"]}\\,\\mathbf{j}\\}$ m and the cable pulls with $\\{${tx}\\,\\mathbf{i} + ${ty}\\,\\mathbf{j}\\}$ N. ` +
          "Work out the unit vector you need first: $\\mathbf{u} = \\mathbf{T}/T$. Then B must lie in that direction from A.",
      };
    },
  },
  hints: [
    "The direction you need is $\\mathbf{u} = \\mathbf{T}/T = (-120\\,\\mathbf{i} + 160\\,\\mathbf{j})/200$.",
    "That is $-0.6\\,\\mathbf{i} + 0.8\\,\\mathbf{j}$: 3 to the left for every 4 up.",
    "A is at (3, 0). Going 3 m left and 4 m up from A lands on (0, 4). Halfway, (1.5, 2), works too.",
  ],
  explanation:
    "Working backwards: the unit vector is the force divided by its size, $\\mathbf{u} = \\mathbf{T}/T = -0.6\\,\\mathbf{i} + 0.8\\,\\mathbf{j}$. " +
    "B must be in that direction from A: $\\mathbf{r}_{AB} = k(-3\\,\\mathbf{i} + 4\\,\\mathbf{j})$ for any length $k$. The cable's length doesn't change the force; only its direction does.",
};
