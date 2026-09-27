// Internal forces in beams (Units 7.1–7.3): N, V, M at a cut; V(x), M(x); the diagrams.
// Sign convention: N + tension; V + down on the left piece's face; M + concave up (a smile).
import { test, ok, equal, close, setFile } from "../harness.js";
import { solveInternal, internalAt, pieceEquations, evalPoly } from "../../src/subjects/statics/internal.js";
import { segmentForms, termsValue, internalChoices, internalSteps, internalMistakes } from "../../src/subjects/statics/internal-tools.js";
import { solveEquations } from "../../src/core/equations.js";

setFile("statics / internal forces");

const beam = (L, extra) => ({
  body: { points: [[0, 0], [L, 0]] },
  supports: [{ id: "A", type: "pin", at: [0, 0] }, { id: "B", type: "roller", at: [L, 0] }],
  ...extra,
});
// Simply supported, 6 m, P = 1200 N at 2 m: A_y = 800 N, B_y = 400 N.
const pointLoad = beam(6, { forces: [{ id: "P", symbol: "P", magnitude: 1200, direction: "down", at: [2, 0] }] });
// Cantilever fixed at A, 3 m, w = 400 N/m all along: A_y = 1200 N, M_A = 1800 N·m (counterclockwise).
const cantilever = {
  body: { points: [[0, 0], [3, 0]] },
  supports: [{ id: "A", type: "fixed", at: [0, 0], normal: [1, 0] }],
  loads: [{ id: "w", shape: "uniform", from: 0, to: 3, w: 400 }],
};

test("a point load: at x = 4 m, V = 800 − 1200 = −400 N and M = 800(4) − 1200(2) = 800 N·m", () => {
  const v = solveInternal({ ...pointLoad, cut: 4 }).values;
  close(v.A_y, 800);
  close(v.N, 0, 1e-9);
  close(v.V, -400);
  close(v.M, 800);
});

test("the same cut from the RIGHT piece gives the same N, V, M (its equations solved)", () => {
  for (const keep of ["left", "right"]) {
    const s = { ...pointLoad, cut: 4, keep };
    const r = solveInternal(s);
    const sol = solveEquations(r.equations, ["N", "V", "M"]);
    equal(sol.status, "unique");
    close(sol.values.V, -400);
    close(sol.values.M, 800);
  }
});

test("a cantilever with a uniform load: at x = 1 m, V = 1200 − 400 = 800 N, M = 1200 − 1800 − 200 = −800 N·m (hogging)", () => {
  const s = { ...cantilever, cut: 1 };
  const r = solveInternal(s);
  close(r.values.V, 800);
  close(r.values.M, -800);
  // Only the part of the load on the piece: 400 N at 0.5 m from C.
  const sol = solveEquations(r.equations, ["N", "V", "M"]);
  close(sol.values.M, -800);
  const kept = solveEquations(solveInternal({ ...s, keep: "right" }).equations, ["N", "V", "M"]);
  close(kept.values.M, -800);
  close(kept.values.V, 800);
});

test("a uniform load on a simple span: M_max = wL²/8 = 1000 N·m at the middle; V_max = wL/2", () => {
  const v = solveInternal(beam(4, { loads: [{ id: "w", shape: "uniform", from: 0, to: 4, w: 500 }] })).values;
  close(v.Mmax, 1000);
  close(v.xM, 2);
  close(Math.abs(v.Vmax), 1000);
  equal(v.nSeg, 1);
  // V(x) = 1000 − 500x,  M(x) = 1000x − 250x²
  close(v.V0_1, 1000);
  close(v.V1_1, -500);
  close(v.M1_1, 1000);
  close(v.M2_1, -250);
});

test("a triangular load: V = 600 − 50x², M_max = w₀L²/(9√3) = 1385.6 N·m at x = √12", () => {
  const v = solveInternal(beam(6, { loads: [{ id: "w", shape: "triangle", from: 0, to: 6, w: 600, peak: "right" }] })).values;
  close(v.B_y, 1200);
  close(v.Mmax, (600 * 36) / (9 * Math.sqrt(3)), 1e-4);
  close(v.xM, Math.sqrt(12), 1e-6);
  close(v.V2_1, -50);
});

test("a couple makes M jump: a clockwise 800 N·m couple mid-span → M jumps from −400 up to +400 N·m", () => {
  const s = beam(4, { moments: [{ id: "C0", symbol: "M_0", magnitude: 800, sense: -1, at: [2, 0] }] });
  const r = solveInternal(s);
  close(r.values.A_y, -200);
  close(internalAt(s, r.actions, 2, -1).M, -400);
  close(internalAt(s, r.actions, 2, 1).M, 400);
  close(Math.abs(r.values.Mmax), 400);
  equal(r.values.nSeg, 2);
});

test("an axial load: a 500 N push along the beam → N = −500 N (compression)", () => {
  const s = beam(6, { forces: [{ id: "P", symbol: "P", magnitude: 500, direction: "left", at: [6, 0] }], cut: 3 });
  close(solveInternal(s).values.N, -500);
});

test("V(x) and M(x): the segment polynomials agree with a cut anywhere, and so do the textbook terms", () => {
  const s = beam(8, {
    forces: [{ id: "P", symbol: "P", magnitude: 900, direction: "down", at: [5, 0] }],
    loads: [{ id: "w", shape: "linear", from: 1, to: 4, w: [200, 500] }],
    moments: [{ id: "C0", symbol: "M_0", magnitude: 300, sense: -1, at: [6.5, 0] }],
  });
  const r = solveInternal(s);
  const forms = segmentForms(s, r);
  equal(forms.length, r.segments.length);
  r.segments.forEach((seg, i) => {
    for (const t of [0.2, 0.5, 0.8]) {
      const x = seg.a + t * (seg.b - seg.a);
      const cut = internalAt(s, r.actions, x);
      close(evalPoly(seg.V, x), cut.V, 1e-6);
      close(evalPoly(seg.M, x), cut.M, 1e-6);
      close(termsValue(forms[i].V, x), cut.V, 1e-6);
      close(termsValue(forms[i].M, x), cut.M, 1e-6);
    }
  });
  // M returns to zero at the roller.
  close(internalAt(s, r.actions, 8, 1).M, 0, 1e-6);
});

test("choices: each group has one correct line and wrong ones that really differ", () => {
  const s = beam(6, { forces: [{ id: "P", symbol: "P", magnitude: 1200, direction: "down", at: [2, 0] }], loads: [{ id: "w", shape: "uniform", from: 2, to: 6, w: 300 }] });
  const groups = internalChoices(s, solveInternal(s));
  equal(groups.length, 4); // two segments × (V, M)
  for (const g of groups) {
    equal(g.options.filter((o) => o.correct).length, 1);
    ok(g.options.length >= 3, `${g.title}: ${g.options.length} options`);
    ok(new Set(g.options.map((o) => o.tex)).size === g.options.length, "all different");
  }
});

test("debug working: one wrong line, found where the slip is", () => {
  const s = beam(6, { forces: [{ id: "P", symbol: "P", magnitude: 1200, direction: "down", at: [2, 0] }], loads: [{ id: "w", shape: "uniform", from: 2, to: 6, w: 300 }] });
  const w = internalSteps(s, { segment: 2, which: "M", slip: "sq" });
  equal(w.wrong, "s2M");
  equal(w.fixes.filter((f) => f.correct).length, 1);
  const walk = internalSteps(s, { walk: true, step: "jump", at: 1 });
  equal(walk.wrong, "j1");
  ok(walk.follows.length > 0, "later lines follow the wrong jump");
  // With no slip, walking along ends with M = 0 and V = 0 past the roller.
  const clean = internalSteps(s, { walk: true, step: "none" });
  const lastM = clean.lines.filter((l) => /M = /.test(l.tex)).pop().tex;
  const lastV = clean.lines.filter((l) => /V = /.test(l.tex)).pop().tex;
  ok(/M = -?0(\.0)?\\,/.test(lastM), lastM);
  ok(/V = -?0(\.0)?\\,/.test(lastV), lastV);
  equal(clean.wrong, null);
});

test("mistakes: V's sign, and the whole distributed load counted", () => {
  const s = { ...cantilever, cut: 1 };
  const m = internalMistakes(s, "V");
  ok(m.some((x) => Math.abs(x.value + 800) < 1e-6 && x.kind === "sign"));
  ok(m.some((x) => Math.abs(x.value - 0) < 1e-6 && x.kind === "loadArea"), "1200 − 1200 = 0 with the whole load");
  const mm = internalMistakes(s, "M");
  ok(mm.some((x) => x.kind === "centroid"), "the load at its far end");
});
