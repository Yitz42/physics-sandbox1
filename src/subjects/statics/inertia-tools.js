// inertia-tools.js — moments of inertia (Unit 10.1): the equations (the centroid, then
// I = Σ(Ī + A d²)), the table under them, the answers common slips give, and a student's
// working with one wrong line. The physics is in inertia.js.

import { fixedTex, sigFig } from "../../core/units.js";
import { partInfo } from "./centroid.js";
import { partsOf, ownI, sectionI, solveInertia } from "./inertia.js";

const num = (v) => sigFig(v, 4);
const M6 = 1e6;

// The part's Ī as a formula with its numbers: b h³/12 for a rectangle, π r⁴/4 for a circle …
function ownTex(p) {
  const i = partInfo(p);
  if (i.kind === "rect") return `\\tfrac{(${num(Math.abs(p.w))})(${num(Math.abs(p.h))})^3}{12}`;
  if (i.kind === "circle") return `\\tfrac{\\pi (${num(p.r)})^4}{4}`;
  return `${num(ownI(p)[0] / M6)}\\times 10^6`;
}

// A = ΣA_i, A ȳ = Σ ỹ_i A_i, and Ī_x = Σ (Ī_i + A_i d_i²) — in 10⁶ mm⁴.
export function inertiaEquations(setup) {
  const parts = partsOf(setup);
  const r = sectionI(setup);
  const sum = { id: "A", lhs: "A = \\Sigma A_i", title: "A", form: "define", terms: [], result: { value: r.A, unit: "mm^2" } };
  const my = { id: "Qx", lhs: "A\\,\\bar{y} = \\Sigma \\tilde{y}_i A_i", title: "A\\,\\bar{y}", form: "define", terms: [], result: { value: r.A * r.ybar, unit: "mm^3" } };
  const I = { id: "Ix", lhs: "\\bar{I}_x = \\Sigma(\\bar{I}_i + A_i d_i^2)", title: "\\bar{I}_x", form: "define", terms: [], result: { value: r.Ix / M6, unit: "10^6 mm^4" } };
  for (const p of parts) {
    const i = partInfo(p), e = r.each[p.id], hs = p.hole ? -1 : 1;
    sum.terms.push({ id: p.id, sign: hs, symbol: `A_{${p.id}}`, value: i.A, unit: "mm^2" });
    my.terms.push({ id: p.id, sign: hs * (Math.sign(i.y) || 1), symbol: `A_{${p.id}}`, value: i.A, unit: "mm^2",
      factor: { tex: `\\,\\tilde{y}_{${p.id}}`, numTex: `(${num(i.y)}\\,\\text{mm})`, value: Math.abs(i.y) } });
    I.terms.push({ id: `Ib${p.id}`, sign: hs, symbol: `\\bar{I}_{${p.id}}`, value: e.Ib / M6, numTex: ownTex(p) });
    // A d², its wrong twin: d measured from the bottom (ỹ) instead of from the centroid.
    const wrongD = Math.abs(i.y) > 1e-9 && Math.abs(i.y - e.d) > 1e-9;
    // (Its value is A in mm²; the factor d² carries the 10⁻⁶, so the product is in 10⁶ mm⁴.)
    I.terms.push({ id: `Ad${p.id}`, sign: hs, symbol: `A_{${p.id}}`, value: i.A, unit: "mm^2",
      factor: { tex: `d_{${p.id}}^2`, numTex: `(${num(e.d)}\\,\\text{mm})^2`, value: (e.d * e.d) / M6,
        ...(wrongD ? { alt: { tex: `\\tilde{y}_{${p.id}}^2`, numTex: `(${num(i.y)}\\,\\text{mm})^2`, value: (i.y * i.y) / M6 } } : {}),
        swapKind: "momentArm", swapReason: "measures d from the bottom — d is from the part's centroid to the WHOLE section's centroid, $\\tilde{y}_i - \\bar{y}$" } });
  }
  return [sum, my, I];
}

// The table: each part's A, ỹ, Ī, d and A d²; then ȳ and Ī_x.
export function inertiaSummary(setup, result, { reveal = true } = {}) {
  const v = (result || solveInertia(setup)).values;
  if (!reveal) return [];
  const lines = partsOf(setup).map((p) => `\\text{Part ${p.id}${p.name ? ` (${p.name})` : ""}${p.hole ? ", subtract" : ""}: } A = ${num(v[`A_${p.id}`])},\\ \\tilde{y} = ${num(v[`y_${p.id}`])},\\ \\bar{I} = ${num(v[`Ib_${p.id}`])},\\ d = ${num(v[`d_${p.id}`])},\\ A d^2 = ${num(v[`Ad2_${p.id}`])}`);
  lines.push(`\\bar{y} = ${fixedTex(v.ybar, "mm")},\\qquad \\bar{I}_x = ${fixedTex(v.Ix6, "10^6 mm^4", 2)}`);
  if (v.Ia6 != null) lines.push(`I_{\\text{axis}} = \\bar{I}_x + A\\,(\\bar{y} - y_{\\text{axis}})^2 = ${fixedTex(v.Ia6, "10^6 mm^4", 2)}`);
  return lines;
}

// Answers that common slips give.
export function inertiaMistakes(setup, name) {
  const v = solveInertia(setup).values;
  const right = v[name];
  const list = [];
  const add = (value, message, kind) => {
    if (!Number.isFinite(value) || Math.abs(value - right) < 1e-6 * Math.max(1, Math.abs(right))) return;
    if (!list.some((m) => Math.abs(m.value - value) < 1e-9)) list.push({ value, message, kind });
  };
  const I6 = (opts) => {
    const r = sectionI(setup, opts);
    return name === "Ia6" ? r.Ia / M6 : r.Ix / M6;
  };
  if (name === "Ix6" || name === "Ia6") {
    add(I6({ noTransfer: true }), "That adds only the parts' own Ī. Each part sits away from the section's centroid: add its $A d^2$ too (the parallel-axis theorem).", "missing");
    add(I6({ baseD: true }), "The distances d are from the section's CENTROID, $d = \\tilde{y}_i - \\bar{y}$ — not from the bottom.", "momentArm");
    add(I6({ third: true }), "$bh^3/3$ is a rectangle's I about its BASE. About its own centroid it's $bh^3/12$ (then add $A d^2$).", "centroid");
    add(I6({ swapBH: true }), "b and h swapped: for bending about a horizontal axis, the height is the one cubed — $bh^3/12$ with h vertical.", "concept");
    if (partsOf(setup).some((p) => p.hole)) add(I6({ holeAdded: true }), "The hole's I was ADDED. A hole takes material away: subtract its Ī + A d².", "sign");
    if (name === "Ia6") add(v.Ix6, "That's about the section's own centroid. Move it to the axis asked for: $I = \\bar{I} + A d^2$.", "missing");
  }
  if (name === "ybar") {
    const parts = partsOf(setup).map((p) => partInfo(p));
    add(parts.reduce((s, i) => s + i.y, 0) / parts.length, "That's the plain average of the parts' centroids. Weight each by its area: $\\bar{y} = \\Sigma\\tilde{y}A/\\Sigma A$.", "concept");
  }
  return list;
}

// ---- A student's working with one wrong line (debug, view "steps") -------------------
// A two-part section (web 1, flange 2). mutation.slip: "noTransfer" (the total leaves out A d²),
// "baseD" (the flange's d measured from the bottom), "third" (the web's Ī as bh³/3),
// "swapBH" (the flange's Ī as h b³/12).

export function inertiaSteps(setup, mutation) {
  const parts = partsOf(setup);
  const r = sectionI(setup);
  const slip = mutation.slip;
  const row = (p, { d = r.each[p.id].d, Ib = r.each[p.id].Ib, IbTex = ownTex(p) } = {}) => {
    const A = partInfo(p).A;
    return { tex: `\\text{${p.name || "Part " + p.id}: } \\bar{I}_{${p.id}} = ${IbTex} = ${num(Ib / M6)}\\times 10^6,\\ d_{${p.id}} = ${num(d)},\\ A d^2 = ${num((A * d * d) / M6)}\\times 10^6`, Ib, Ad2: A * d * d };
  };
  const [web, flange] = parts;
  const good = [row(web), row(flange)];
  const w = slip === "third" ? row(web, { Ib: r.each[web.id].Ib * 4, IbTex: `\\tfrac{(${num(web.w)})(${num(web.h)})^3}{3}` }) : good[0];
  const f = slip === "baseD" ? row(flange, { d: partInfo(flange).y })
    : slip === "swapBH" ? row(flange, { Ib: Math.abs(flange.h * flange.w ** 3) / 12, IbTex: `\\tfrac{(${num(flange.h)})(${num(flange.w)})^3}{12}` }) : good[1];
  const total = (a, b, transfer = true) => (a.Ib + b.Ib + (transfer ? a.Ad2 + b.Ad2 : 0)) / M6;
  const totalTex = (value, transfer = true) => `\\bar{I}_x = ${transfer ? "\\Sigma(\\bar{I} + A d^2)" : "\\Sigma \\bar{I}"} = ${fixedTex(value, "10^6 mm^4", 2)}`;
  const ybarTex = `\\bar{y} = \\dfrac{\\Sigma \\tilde{y} A}{\\Sigma A} = ${fixedTex(r.ybar, "mm")}`;
  const lines = [
    { id: "ybar", tex: ybarTex },
    { id: "p1", tex: w.tex },
    { id: "p2", tex: f.tex },
    { id: "total", tex: totalTex(slip === "noTransfer" ? total(w, f, false) : total(w, f), slip !== "noTransfer") },
  ];
  const corrected = [ybarTex, good[0].tex, good[1].tex, totalTex(r.Ix / M6)];
  const WHY = {
    noTransfer: { wrong: "total", kind: "missing", fix: "Add each part's $A d^2$ as well as its Ī",
      explain: "Each part's Ī is about its OWN centroid. To move it to the section's centroid, add $A d^2$ — the parallel-axis theorem. Leaving it out misses most of a flange's stiffness." },
    baseD: { wrong: "p2", kind: "momentArm", fix: "Measure d from the section's centroid: $d = \\tilde{y} - \\bar{y}$",
      explain: "d is the distance between the part's centroid and the axis we want — the section's centroid, at ȳ — not the bottom edge." },
    third: { wrong: "p1", kind: "centroid", fix: "A rectangle's Ī about its own centroid is $bh^3/12$",
      explain: "$bh^3/3$ is about the rectangle's base. Here each part's Ī is about its own centroid, $bh^3/12$; the $A d^2$ does the moving." },
    swapBH: { wrong: "p2", kind: "concept", fix: "Cube the flange's HEIGHT (its thickness): $bh^3/12$",
      explain: "For bending about a horizontal axis, what's cubed is the dimension measured vertically. The flange is wide and thin: its own Ī is small." },
  }[slip];
  const ids = lines.map((l) => l.id);
  const follows = lines.filter((l, k) => l.id !== WHY.wrong && ids.indexOf(l.id) > ids.indexOf(WHY.wrong) && l.tex !== corrected[k]).map((l) => l.id);
  const others = [
    { label: "Use $I = \\Sigma A d$", feedback: "That's a first moment (it finds centroids). A moment of inertia uses distance SQUARED." },
    { label: "Divide the total by the area", feedback: "Dividing I by A gives the radius of gyration squared, $k^2$ — not what's asked." },
    { label: "Measure ȳ from the top", feedback: "Either edge works if you're consistent; this working uses the bottom throughout." },
  ];
  return { lines, wrong: WHY.wrong, follows, fixes: [{ label: WHY.fix, correct: true }, ...others.slice(0, 2)], explain: WHY.explain, kind: WHY.kind, corrected };
}
