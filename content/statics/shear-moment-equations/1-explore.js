// Unit 8.3, stage 1 — explore: slide a section along the beam and read its segment's V(x) and
// M(x) equations, with their values at x.
// Pin A (0), roller B (6), w = 400 N/m on the first 3 m, P = 600 N at 4.5 m → A_y = 1050, B_y = 750 N.
//   Segment 1 (0–3):   V = 1050 − 400x,   M = 1050x − 400x²/2
//   Segment 2 (3–4.5): V = 1050 − 1200 = −150,  M = 1050x − 1200(x − 1.5)
//   Segment 3 (4.5–6): V = −750,  M = 1050x − 1200(x − 1.5) − 600(x − 4.5)
// V = 0 at x = 2.625 m (on the 0.025 m slider). Start: x = 1 (segment 1, nothing done yet).

export default {
  id: "shear-moment-equations/1-explore",
  challenge: "explore",
  solver: "statics.internal",
  title: "Read the Equations",
  mission: "Slide a section along the beam and read V(x) and M(x) for each segment.",
  instructions:
    "The beam splits into **segments** where something happens: the uniform load ends at 3 m and the hoist pulls at 4.5 m. On each segment, V and M follow one equation — they're under the picture, for the segment the dashed section is in. " +
    "Slide the section and watch the equations change from one segment to the next.",
  setup: {
    body: { points: [[0, 0], [6, 0]] },
    supports: [{ id: "A", type: "pin", at: [0, 0] }, { id: "B", type: "roller", at: [6, 0] }],
    forces: [{ id: "P", symbol: "P", magnitude: 600, direction: "down", at: [4.5, 0], push: true }],
    loads: [{ id: "w", shape: "uniform", from: 0, to: 3, w: 400 }],
    cut: 1,
    view: "diagrams",
    showDiagrams: true,
    showSegments: true,
    liveEquations: true,
    knownReactions: true,
  },
  view: { xmin: -1.4, xmax: 7.2, ymin: -7.9, ymax: 2.4 },
  tallPicture: true,
  // Predict first (owner, 2026-09-27): one quick guess before the numbers show.
  guess: {
    prompt: "**Under the uniform load (the first 3 m), the shear V…**",
    options: [
      { text: "slopes down steadily", correct: true },
      { text: "stays constant", feedback: "V is constant only where NO load acts. A uniform load $w$ lowers V by $w$ every metre." },
      { text: "jumps", feedback: "Jumps happen at point loads; a spread-out load makes a steady slope." },
    ],
    explain: "$dV/dx = -w$: under a uniform load V is a straight, sloping line, and M a curve.",
  },
  editable: [{ path: "cut", label: "Section at x", min: 0.1, max: 5.9, step: 0.025, unit: "m" }],
  tasks: [
    { text: "Move the section to where the hoist's load **P** appears in the equations.", check: (v, s) => s.cut > 4.5 + 1e-9 },
    { text: "Find the section where **V(x) = 0**.", check: (v, s, r) => Math.abs(atCut(r, s).V) < 1 },
    { text: "Put the section right where the uniform load ends, **x = 3 m** — the two segments' equations agree there.", check: (v, s) => Math.abs(s.cut - 3) < 1e-6 },
  ],
  hints: [
    "The segment numbers are under the M diagram; the equations are for the segment the section is in.",
    "In segment 1, V = 1050 − 400x. Set it to zero.",
    "Past the hoist, P is on the left piece too: its term $-600(x - 4.5)$ joins M.",
  ],
  explanation:
    "Each segment has its own V(x) and M(x): moving past an event adds that force to the left piece, and a new term to the equations. " +
    "Where two segments meet, both give the same V and M (unless a point force or couple there makes one jump) — a good check on your equations.",
};

// V and M at the section, from the segment it's in.
function atCut(r, s) {
  const seg = (r.segments || []).find((q) => s.cut >= q.a - 1e-9 && s.cut <= q.b + 1e-9);
  if (!seg) return { V: NaN, M: NaN };
  const ev = (p) => p.reduce((t, c, i) => t + c * s.cut ** i, 0);
  return { V: ev(seg.V), M: ev(seg.M) };
}
