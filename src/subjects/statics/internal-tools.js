// internal-tools.js — the words and working around internal forces (Units 8.1–8.3):
// lines under the equations, likely mistakes, V(x) and M(x) written the textbook
// way (segment by segment), the multiple-choice lines of a solve stage, and a
// student's working with one wrong line (debug stages).

import { sigFig, fixedTex, format } from "../../core/units.js";
import { partsOf, endValues } from "./distributed-loads.js";
import { solveInternal, internalAt, loadPortion, beamActions, evalPoly, eventPoints } from "./internal.js";

const EPS = 1e-9;
const n4 = (v) => sigFig(v, 4);
const range = (s) => `${n4(s.a)} < x < ${n4(s.b)}\\,\\text{m}`;

// ---- V(x) and M(x) the textbook way --------------------------------------------------------

// One segment's terms, from the piece LEFT of x: each { id, coef, form, a, name }.
//   form "const": coef          "lin": coef (x − a)
//        "sq2":  coef (x − a)²/2 "cube6": coef (x − a)³/6
// (the wrong forms a debug stage uses: "sq" (x − a)², "cube2" (x − a)³/2, "linx" coef·x)
export function segmentTerms(setup, actions, seg) {
  const V = [], M = [];
  const mid = (seg.a + seg.b) / 2;
  const y0 = setup.body && setup.body.points ? setup.body.points[0][1] : 0;
  for (const f of actions.points) {
    if (f.x > mid) continue;
    if (Math.abs(f.Fy) > EPS) {
      V.push({ id: f.id, coef: f.Fy, form: "const", a: 0, name: f.symbol });
      M.push({ id: f.id, coef: f.Fy, form: "lin", a: f.x, name: f.symbol });
    }
    const off = f.Fx * (f.at[1] - y0);
    if (Math.abs(off) > EPS) M.push({ id: `${f.id}_x`, coef: off, form: "const", a: 0, name: f.symbol });
  }
  for (const c of actions.couples) if (c.x < mid) M.push({ id: c.id, coef: -c.M, form: "const", a: 0, name: c.symbol });
  for (const l of actions.loads) {
    if (l.from > mid) continue;
    if (l.to < mid) {
      for (const p of partsOf(l)) {
        V.push({ id: p.id, coef: -p.F, form: "const", a: 0, name: "F" });
        M.push({ id: p.id, coef: -p.F, form: "lin", a: p.x, name: "F" });
      }
      continue;
    }
    const [wa, wb] = endValues(l);
    const k = (wb - wa) / (l.to - l.from); // how fast w grows (N/m per m)
    if (Math.abs(wa) > EPS) {
      V.push({ id: `${l.id}_w`, coef: -wa, form: "lin", a: l.from, name: "w" });
      M.push({ id: `${l.id}_w`, coef: -wa, form: "sq2", a: l.from, name: "w" });
    }
    if (Math.abs(k) > EPS) {
      V.push({ id: `${l.id}_k`, coef: -k, form: "sq2", a: l.from, name: "w" });
      M.push({ id: `${l.id}_k`, coef: -k, form: "cube6", a: l.from, name: "w" });
    }
  }
  return { V, M };
}

const FORM_VALUE = {
  const: () => 1, lin: (u) => u, linx: (u, x) => x, sq2: (u) => (u * u) / 2, sq: (u) => u * u, cube6: (u) => (u * u * u) / 6, cube2: (u) => (u * u * u) / 2,
};
export const termValue = (t, x) => t.coef * FORM_VALUE[t.form](x - t.a, x);
export const termsValue = (terms, x) => terms.reduce((s, t) => s + termValue(t, x), 0);

function termTex(t, first) {
  const sign = t.coef < 0 ? "-" : first ? "" : "+";
  const n = n4(Math.abs(t.coef));
  const u = Math.abs(t.a) < EPS || t.form === "linx" ? "x" : t.a > 0 ? `(x - ${n4(t.a)})` : `(x + ${n4(-t.a)})`;
  const body = {
    const: n, lin: `${n}${u}`, linx: `${n}x`, sq2: `${n}\\,\\dfrac{${u}^{2}}{2}`, sq: `${n}\\,${u}^{2}`,
    cube6: `${n}\\,\\dfrac{${u}^{3}}{6}`, cube2: `${n}\\,\\dfrac{${u}^{3}}{2}`,
  }[t.form];
  return `${sign} ${body}`;
}
export const termsTex = (terms) => (terms.length ? terms.map((t, i) => termTex(t, i === 0)).join(" ") : "0");

// Every segment's terms: [{ a, b, V: terms, M: terms }].
export function segmentForms(setup, result) {
  const res = result || solveInternal(setup);
  return (res.segments || []).map((s) => ({ a: s.a, b: s.b, ...segmentTerms(setup, res.actions, s) }));
}

// Single-slip versions of a list of terms, each { terms, kind, feedback, fix }.
export function termSlips(terms, which) {
  const out = [];
  const replace = (i, t) => terms.map((x, j) => (j === i ? t : x));
  terms.forEach((t, i) => {
    if (t.form === "sq2") out.push({ terms: replace(i, { ...t, form: "sq" }), kind: "loadArea", fix: "Put back the ½",
      feedback: which === "M" ? "The load on the piece, $w(x-a)$, acts at its middle — halfway back, $\\tfrac{x-a}{2}$ — so its moment is $w\\,\\tfrac{(x-a)^2}{2}$." : "A triangular load's area is ½ × base × height: it grows as $\\tfrac{(x-a)^2}{2}$." });
    if (t.form === "cube6") out.push({ terms: replace(i, { ...t, form: "cube2" }), kind: "centroid", fix: "Divide by 6, not 2",
      feedback: "A triangular load's resultant is $\\tfrac{1}{2}k(x-a)^2$, acting ⅓ of the way back: its moment is $k\\,\\tfrac{(x-a)^3}{6}$." });
    if (t.form === "lin" && Math.abs(t.a) > EPS && which === "M") out.push({ terms: replace(i, { ...t, form: "linx" }), kind: "momentArm", fix: `Measure from where it acts: $(x - ${n4(t.a)})$`,
      feedback: `This force acts at $x = ${n4(t.a)}$ m, so its arm to the cut is $(x - ${n4(t.a)})$, not $x$.` });
    out.push({ terms: replace(i, { ...t, coef: -t.coef }), kind: "sign", fix: "Flip this term's sign",
      feedback: which === "V" ? "Check the sign: forces UP on the left piece make V positive, loads DOWN make it smaller." : "Check the sign: an upward force left of the cut bends the beam into a smile (positive M); a downward load, a frown." });
    if (terms.length > 1) out.push({ terms: terms.filter((_, j) => j !== i), kind: "missing", fix: "Put the missing term back",
      feedback: "Every force on the piece left of the cut belongs in the equation — one is missing." });
  });
  return out;
}

// The solve stage's multiple-choice lines (solver.choices): for each segment, V(x) then M(x).
export function internalChoices(setup, result) {
  const forms = segmentForms(setup, result);
  const only = setup.askSegments ? forms.filter((_, i) => setup.askSegments.includes(i + 1)) : forms;
  const groups = [];
  for (const f of only) {
    const k = forms.indexOf(f);
    for (const which of ["V", "M"]) {
      const correct = termsTex(f[which]);
      const seen = new Set([correct]);
      const wrong = [];
      // The neighbouring segments' lines: a force counted that isn't on the piece yet,
      // or one left out that already is.
      const next = forms[k + 1], prev = forms[k - 1];
      const others = [
        ...(next ? [{ terms: next[which], kind: "extra", feedback: `That counts what acts at $x = ${n4(f.b)}$ m — but for a cut in this segment it's on the RIGHT piece, not the left one.` }] : []),
        ...(prev ? [{ terms: prev[which], kind: "missing", feedback: `That leaves out what acts at $x = ${n4(f.a)}$ m — it's left of every cut in this segment, so it's on the left piece.` }] : []),
      ];
      for (const s of [...termSlips(f[which], which), ...others]) {
        const tex = termsTex(s.terms);
        if (seen.has(tex) || Math.abs(termsValue(s.terms, (f.a + f.b) / 2) - termsValue(f[which], (f.a + f.b) / 2)) < 1e-6) continue;
        seen.add(tex);
        wrong.push({ tex: `${which} = ${tex}`, kind: s.kind, feedback: s.feedback });
      }
      // A spread of slips: the first of each kind, up to three.
      const picked = [];
      for (const w of wrong) if (picked.length < 3 && !picked.some((p) => p.kind === w.kind)) picked.push(w);
      for (const w of wrong) if (picked.length < 3 && !picked.includes(w)) picked.push(w);
      groups.push({ title: `$${range(f)}$: $${which}(x)$`, options: [{ tex: `${which} = ${correct}`, correct: true }, ...picked] });
    }
  }
  return groups;
}

// ---- Debug stages: a student's working with one wrong line ------------------------------------

// mutation (7.3, V(x)/M(x) lines): { segment: 2, which: "M", slip: "sq" | "linx" | "sign" | "missing" | "cube2", term?: index }
// mutation (7.2, walking along the diagram): { walk: true, step: "jump" | "area" | "couple" | "load", at?: index }
export function internalSteps(setup, mutation) {
  return mutation.walk ? walkSteps(setup, mutation) : equationSteps(setup, mutation);
}

const SLIP_FORM = { sq: "sq2", cube2: "cube6", linx: "lin" };

function equationSteps(setup, mutation) {
  const forms = segmentForms(setup);
  const lines = [];
  let wrong = null, fixes = [], explain = "", kind = "unexplained";
  forms.forEach((f, i) => {
    for (const which of ["V", "M"]) {
      const id = `s${i + 1}${which}`;
      let terms = f[which];
      if (mutation.segment === i + 1 && mutation.which === which) {
        const slips = termSlips(terms, which);
        const want = SLIP_FORM[mutation.slip];
        const pick = slips.filter((s) => (want ? s.terms.some((t, j) => t.form === mutation.slip && terms[j] && terms[j].form === want) : s.kind === mutation.slip))[mutation.term || 0]
          || slips.find((s) => s.kind === (mutation.slip === "sign" ? "sign" : "missing")) || slips[0];
        terms = pick.terms;
        wrong = id;
        kind = pick.kind;
        explain = pick.feedback;
        fixes = [{ label: pick.fix, correct: true }, ...otherFixes(pick.fix)];
      }
      lines.push({ id, tex: `${which === "V" ? `${range(f)}:\\quad ` : "\\phantom{" + range(f) + ":}\\quad "}${which} = ${termsTex(terms)}` });
    }
  });
  return { lines, wrong, follows: [], fixes, explain, kind, corrected: null };
}

function otherFixes(right) {
  const all = [
    { label: "Flip this term's sign", feedback: "The signs here are right. Look at the SIZE of each term — its arm or its fraction." },
    { label: "Put back the ½", feedback: "There's no ½ missing here. Compare each term with the forces on the piece left of the cut." },
    { label: "Put the missing term back", feedback: "Nothing is missing from this line; one of its terms is wrong." },
    { label: "Measure from where it acts: $(x - a)$", feedback: "The arms here are measured from the right points. Check the signs and fractions." },
  ];
  const key = right.split(":")[0].slice(0, 12);
  return all.filter((f) => !f.label.startsWith(key)).slice(0, 2);
}

// Walking along the beam, left to right (Unit 8.2's relationships): V jumps by each point
// force, falls by each load's area (dV/dx = −w); M rises by the area under V (dM/dx = V)
// and jumps by each couple (clockwise couple → M jumps UP).
function walkSteps(setup, mutation) {
  const res = solveInternal(setup);
  const a = res.actions;
  const ev = eventPoints(setup, a);
  const lines = [];
  let V = 0, M = 0, Vw = 0, Mw = 0, wrong = null; // the true V, M and the student's
  let fixes = [], explain = "", kind = "unexplained";
  const follows = [];
  const push = (id, tex, right, got) => {
    lines.push({ id, tex });
    if (wrong && id !== wrong && Math.abs(right - got) > 1e-6) follows.push(id);
  };
  const vf = (v) => fixedTex(v, "N");
  const mf = (v) => fixedTex(v, "N·m");
  ev.forEach((x, i) => {
    // Point forces and couples AT x: jumps.
    const Fy = a.points.filter((f) => Math.abs(f.x - x) < 1e-6).reduce((s, f) => s + f.Fy, 0);
    const C = a.couples.filter((c) => Math.abs(c.x - x) < 1e-6).reduce((s, c) => s + c.M, 0);
    const at = `x = ${n4(x)}\\,\\text{m}`;
    if (Math.abs(Fy) > 1e-9) {
      const id = `j${i}`;
      let jump = Fy;
      if (mutation.step === "jump" && mutation.at === i) {
        jump = -Fy;
        wrong = id;
        kind = "sign";
        explain = `At ${at} a force of ${format(Math.abs(Fy), "N")} acts ${Fy > 0 ? "UP" : "DOWN"}: V jumps ${Fy > 0 ? "up" : "down"} by that much — the diagram follows the force.`;
        fixes = [{ label: `V jumps ${Fy > 0 ? "up" : "down"} by the force: ${Fy > 0 ? "+" : "−"}${format(Math.abs(Fy), "N")}`, correct: true },
          { label: "V doesn't jump at a point force", feedback: "A point force changes V suddenly: the diagram jumps by its size." },
          { label: "M jumps here instead", feedback: "Only a couple makes M jump. A force makes V jump (and M's slope change)." }];
      }
      V += Fy;
      Vw += jump;
      push(id, `\\text{At } ${at}:\\ V \\text{ jumps } ${jump > 0 ? "\\text{up}" : "\\text{down}"} \\text{ by } ${vf(Math.abs(jump))} \\ \\Rightarrow\\ V = ${vf(Vw)}`, V, Vw);
    }
    if (Math.abs(C) > 1e-9) {
      const id = `c${i}`;
      let jump = -C; // a counterclockwise couple on the left piece → M drops (M = −Σ M_ccw)
      if (mutation.step === "couple" && mutation.at === i) {
        jump = C;
        wrong = id;
        kind = "sign";
        explain = `A ${C > 0 ? "counterclockwise" : "clockwise"} couple makes M jump ${C > 0 ? "DOWN" : "UP"} (walking left to right): a clockwise couple bends the beam into more of a smile.`;
        fixes = [{ label: `M jumps ${C > 0 ? "down" : "up"} by the couple`, correct: true },
          { label: "M doesn't jump at a couple", feedback: "A couple makes M jump by its size — it's the only thing that does." },
          { label: "V jumps by the couple", feedback: "A couple has no net force, so V doesn't change. M jumps." }];
      }
      M += -C;
      Mw += jump;
      push(id, `\\text{At } ${at}:\\ M \\text{ jumps } ${jump > 0 ? "\\text{up}" : "\\text{down}"} \\text{ by } ${mf(Math.abs(jump))} \\ \\Rightarrow\\ M = ${mf(Mw)}`, M, Mw);
    }
    // The segment to the next event: V falls by the load's area; M rises by the area under V.
    if (i === ev.length - 1) return;
    const b = ev[i + 1];
    if (b - x < 1e-6) return;
    const load = a.loads.reduce((s, l) => { const p = loadPortion(l, x, b); return s + (p ? partsOf(p).reduce((t, q) => t + q.F, 0) : 0); }, 0);
    const seg = res.segments.find((s) => Math.abs(s.a - x) < 1e-6);
    const area = integrate(seg.V, x, b);
    const between = `${n4(x)} \\to ${n4(b)}\\,\\text{m}`;
    const o1 = Vw - V; // how far off the student's V is at the start of the stretch
    if (load > 1e-9) {
      const id = `l${i}`;
      let fall = load;
      if (mutation.step === "load" && mutation.at === i) {
        fall = loadArea(a.loads, x, b, true);
        wrong = id;
        kind = "loadArea";
        explain = "V falls by the AREA of the load over this stretch — for a triangle, ½ × base × height.";
        fixes = [{ label: "Use the load's area (½ × base × height for a triangle)", correct: true },
          { label: "V should rise here", feedback: "The load pushes down: V falls as you walk along it (dV/dx = −w)." },
          { label: "V stays constant here", feedback: "Under a distributed load V changes steadily: dV/dx = −w." }];
      }
      V -= load;
      Vw -= fall;
      push(id, `${between}:\\ V \\text{ falls by the load's area, } ${vf(fall)} \\ \\Rightarrow\\ V = ${vf(Vw)}`, V, Vw);
    }
    const id = `a${i}`;
    // A wrong V earlier carries through: the student's V diagram is off by o1 at the
    // start of the stretch and by o2 at its end (straight between), and so is its area.
    const o2 = Vw - V;
    let rise = area + ((o1 + o2) / 2) * (b - x);
    if (mutation.step === "area" && mutation.at === i) {
      rise = -rise;
      wrong = id;
      kind = "sign";
      explain = "M changes by the area under the V diagram: positive V (above the line) makes M RISE, negative V makes it fall.";
      fixes = [{ label: "Where V is positive, M rises by the area", correct: true },
        { label: "M changes by the load's area", feedback: "The LOAD's area changes V. M changes by the area under V." },
        { label: "M stays the same here", feedback: "dM/dx = V: wherever V isn't zero, M changes." }];
    }
    M += area;
    Mw += rise;
    push(id, `${between}:\\ M \\text{ ${rise >= 0 ? "rises" : "falls"} by the area under } V\\text{, } ${mf(Math.abs(rise))} \\ \\Rightarrow\\ M = ${mf(Mw)}`, M, Mw);
  });
  return { lines, wrong, follows, fixes, explain, kind, corrected: null };
}

// ∫ from a to b of a polynomial.
function integrate(p, a, b) {
  const F = (x) => p.reduce((s, c, i) => s + (c * x ** (i + 1)) / (i + 1), 0);
  return F(b) - F(a);
}
// A load's area over a stretch; forgetHalf: the classic slip (a triangle as w × L).
function loadArea(loads, a, b, forgetHalf) {
  return loads.reduce((s, l) => {
    const p = loadPortion(l, a, b);
    if (!p) return s;
    return s + partsOf(p).reduce((t, q) => t + (forgetHalf && q.kind === "tri" ? 2 * q.F : q.F), 0);
  }, 0);
}

// ---- Lines under the equations -----------------------------------------------------------------

export function internalSummary(setup, result, { reveal = true } = {}) {
  const v = result.values;
  const lines = [];
  if (result.status !== "determinate") return result.message ? [`\\text{${result.message.replace(/\$/g, "")}}`] : [];
  if (setup.view === "cut") {
    // (The sign convention, short enough for a phone.)
    lines.push("\\text{Positive: } N \\text{ tension; } V \\text{ down on a left face; } M \\text{ a smile}");
    if (reveal) lines.push(`N = ${fixedTex(v.N, "N")},\\quad V = ${fixedTex(v.V, "N")},\\quad M = ${fixedTex(v.M, "N·m")}`);
    return lines;
  }
  // 7.3's section at x: its segment's equations and their values there — live in an
  // explore stage (setup.liveEquations), else once the answer is shown.
  if (setup.cut != null && (reveal || setup.liveEquations)) {
    const r = solveInternal(setup);
    const seg = r.segments.find((s) => setup.cut >= s.a - 1e-9 && setup.cut <= s.b + 1e-9);
    const k = r.segments.indexOf(seg) + 1;
    if (seg) {
      const f = segmentForms(setup, r)[k - 1];
      lines.push(`\\text{Segment ${k}, } ${range(f)}:\\quad V = ${termsTex(f.V)},\\quad M = ${termsTex(f.M)}`);
      lines.push(`\\text{At } x = ${n4(setup.cut)}\\,\\text{m}:\\quad V = ${fixedTex(evalPoly(seg.V, setup.cut), "N")},\\quad M = ${fixedTex(evalPoly(seg.M, setup.cut), "N·m")}`);
    }
  } else if (reveal && setup.showSegments) {
    segmentForms(setup, result).forEach((f, i) => lines.push(`\\text{Segment ${i + 1}, } ${range(f)}:\\quad V = ${termsTex(f.V)},\\quad M = ${termsTex(f.M)}`));
  }
  if (reveal) {
    lines.push(`\\text{Largest shear: } V = ${fixedTex(v.Vmax, "N")} \\text{ at } x = ${fixedTex(v.xV, "m", 2)}`);
    lines.push(`\\text{Largest moment: } M = ${fixedTex(v.Mmax, "N·m")} \\text{ at } x = ${fixedTex(v.xM, "m", 2)}`);
  }
  return lines;
}

// ---- Likely wrong answers ----------------------------------------------------------------------

export function internalMistakes(setup, name) {
  const res = solveInternal(setup);
  if (res.status !== "determinate") return [];
  const v = res.values;
  const out = [];
  const add = (value, kind, message) => {
    if (Number.isFinite(value) && Math.abs(value - v[name]) > 1e-6 && !out.some((m) => Math.abs(m.value - value) < 1e-9)) out.push({ value, kind, message });
  };
  if (["N", "V", "M"].includes(name)) {
    const why = {
      N: "Right size, wrong sign: N is positive in TENSION (pulling away from the cut face).",
      V: "Right size, wrong sign: V is positive when it acts DOWN on the left piece's cut face (up on the right piece's).",
      M: "Right size, wrong sign: M is positive when it bends the beam into a smile — counterclockwise on the left piece's face.",
    }[name];
    add(-v[name], "sign", why);
    const x = setup.cut;
    // The whole distributed load counted, not just the part on the piece.
    const whole = res.actions.loads.filter((l) => l.from < x - 1e-9 && l.to > x + 1e-9);
    if (whole.length && name !== "N") {
      const far = whole.reduce((s, l) => s + partsOf(loadPortion(l, x, Infinity)).reduce((t, q) => t + q.F, 0), 0);
      const farM = whole.reduce((s, l) => s + partsOf(loadPortion(l, x, Infinity)).reduce((t, q) => t + q.F * (x - q.x), 0), 0);
      if (name === "V") add(v.V - far, "loadArea", "Only the part of the load ON the piece acts on it: cut the distributed load at C too.");
      else add(v.M - farM, "loadArea", "Only the part of the load ON the piece acts on it: cut the distributed load at C too.");
    }
    if (name === "M") {
      // The load on the piece acting at the far end (arm = its whole length) instead of its centroid.
      const on = res.actions.loads.map((l) => loadPortion(l, -Infinity, x)).filter(Boolean);
      const shift = on.reduce((s, p) => s + partsOf(p).reduce((t, q) => t + q.F * ((x - q.from) - (x - q.x)), 0), 0);
      if (Math.abs(shift) > 1e-9) add(v.M - shift, "centroid", "The load on the piece acts at its resultant — the centroid of its part of the load — not at its far end.");
    }
  }
  if (name === "Mmax") {
    add(-v.Mmax, "sign", "Right size, wrong sign: sagging (a smile) is positive, hogging (a frown) negative.");
    // Only the event points checked, when the true peak is between them (where V = 0).
    const ev = eventPoints(setup, res.actions);
    const atEvents = ev.map((x) => internalAt(setup, res.actions, x, -1).M).concat(ev.map((x) => internalAt(setup, res.actions, x, 1).M));
    const best = atEvents.reduce((b, m) => (Math.abs(m) > Math.abs(b) ? m : b), 0);
    add(best, "concept", "That's the biggest moment at a load or support — but here M peaks BETWEEN them, where V = 0 (dM/dx = V).");
  }
  if (name === "Vmax") add(-v.Vmax, "sign", "Right size, wrong sign: V is positive when it acts down on the left piece's face.");
  return out;
}

export { beamActions };
