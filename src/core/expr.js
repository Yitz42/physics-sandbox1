// expr.js — formulas a student types, e.g. "G1 G2 / (1 + G1 G2 H1)" or "10/(s(s + 2))".
//
// parseExpr(text, names) reads it into a small tree; then:
//   exprTex(tree, texOf)  KaTeX, drawn as a textbook formula (a live preview)
//   evalExpr(tree, scope) its value for numbers given to each name
//   sameExpr(a, b, names) are two formulas the same? (compared at random values)
//   toFraction(tree)      a formula in s as a fraction of polynomials (a transfer function)
// Multiplication may be written with *, a space, or nothing: "G1G2", "2s",
// "s(s + 1)", "(s + 1)(s + 2)". Powers take whole numbers: "s^2".
// Knows nothing about any subject: `names` lists the symbols allowed.

import { tf } from "./poly.js";

export class ExprError extends Error {}

// ---- Reading ------------------------------------------------------------------------

// Tokens: numbers, names (the longest listed name that fits), + − * / ^ ( ).
function tokens(text, names) {
  const byLength = [...names].sort((a, b) => b.length - a.length);
  const out = [];
  const t = String(text).replace(/−/g, "-").replace(/×|·/g, "*");
  let i = 0;
  while (i < t.length) {
    const c = t[i];
    if (/\s/.test(c)) { i++; continue; }
    const num = t.slice(i).match(/^\d+(\.\d+)?|^\.\d+/);
    if (num) { out.push({ k: "num", v: parseFloat(num[0]) }); i += num[0].length; continue; }
    if ("+-*/^()".includes(c)) { out.push({ k: c }); i++; continue; }
    const name = byLength.find((n) => t.startsWith(n, i));
    if (name) { out.push({ k: "name", v: name }); i += name.length; continue; }
    const word = t.slice(i).match(/^[A-Za-z]+\d*/);
    throw new ExprError(word ? `"${word[0]}" isn't a name here. Use ${names.join(", ")}.` : `"${c}" can't be used in a formula.`);
  }
  return out;
}

// A recursive-descent reader. Tree nodes:
//   { t: "num", v } { t: "name", n } { t: "sum", terms: [{ sign, x }] }
//   { t: "prod", fs: [...] } { t: "div", a, b } { t: "neg", x } { t: "pow", x, p }
export function parseExpr(text, names = []) {
  const ts = tokens(text, names);
  if (!ts.length) throw new ExprError("Type a formula first.");
  let i = 0;
  const peek = () => ts[i] && ts[i].k;
  const take = (k) => (peek() === k ? ts[i++] : null);
  const startsAtom = () => ["num", "name", "("].includes(peek());

  function sum() {
    const terms = [];
    let sign = take("-") ? -1 : (take("+"), 1);
    terms.push({ sign, x: product() });
    while (peek() === "+" || peek() === "-") {
      sign = ts[i++].k === "-" ? -1 : 1;
      terms.push({ sign, x: product() });
    }
    return terms.length === 1 && terms[0].sign === 1 ? terms[0].x : { t: "sum", terms };
  }
  function product() {
    let node = power();
    for (;;) {
      if (take("*")) node = mulOf(node, power());
      else if (take("/")) node = { t: "div", a: node, b: power() };
      else if (startsAtom()) node = mulOf(node, power()); // written side by side
      else return node;
    }
  }
  const mulOf = (a, b) => ({ t: "prod", fs: [...(a.t === "prod" ? a.fs : [a]), b] });
  function power() {
    const x = atom();
    if (!take("^")) return x;
    const p = take("num");
    if (!p || !Number.isInteger(p.v)) throw new ExprError("A power must be a whole number, like s^2.");
    return { t: "pow", x, p: p.v };
  }
  function atom() {
    const n = take("num");
    if (n) return { t: "num", v: n.v };
    const nm = take("name");
    if (nm) return { t: "name", n: nm.v };
    if (take("(")) {
      const inner = sum();
      if (!take(")")) throw new ExprError("A bracket is missing: every ( needs a ).");
      return inner;
    }
    if (take("-")) return { t: "neg", x: atom() };
    throw new ExprError(peek() ? `Something is missing before "${peek()}".` : "The formula stops too soon.");
  }

  const tree = sum();
  if (i < ts.length) throw new ExprError(ts[i].k === ")" ? "There's an extra )." : `"${ts[i].k === "name" ? ts[i].v : ts[i].k}" is in an odd place.`);
  return tree;
}

// ---- Using it -------------------------------------------------------------------------

export function evalExpr(x, scope) {
  switch (x.t) {
    case "num": return x.v;
    case "name": return scope[x.n];
    case "neg": return -evalExpr(x.x, scope);
    case "sum": return x.terms.reduce((s, { sign, x: y }) => s + sign * evalExpr(y, scope), 0);
    case "prod": return x.fs.reduce((p, f) => p * evalExpr(f, scope), 1);
    case "div": return evalExpr(x.a, scope) / evalExpr(x.b, scope);
    case "pow": return evalExpr(x.x, scope) ** x.p;
  }
  return NaN;
}

// Are two formulas the same? Both are evaluated at a few sets of random
// values for the names (away from 0 and 1, so slips like a missing term show).
export function sameExpr(a, b, names, tries = 6) {
  for (let k = 0; k < tries; k++) {
    const scope = Object.fromEntries(names.map((n, j) => [n, 0.37 + ((Math.sin(12.9898 * (k + 1) + 78.233 * (j + 1)) * 43758.5453) % 1 + 1) % 1 * 2.1]));
    const va = evalExpr(a, scope), vb = evalExpr(b, scope);
    if (!Number.isFinite(va) || !Number.isFinite(vb)) return false;
    if (Math.abs(va - vb) > 1e-7 * Math.max(1, Math.abs(va), Math.abs(vb))) return false;
  }
  return true;
}

// KaTeX, the way a textbook writes it: fractions stacked, no × between letters.
export function exprTex(x, texOf = (n) => n) {
  const wrap = (y, need) => (need ? `\\left(${exprTex(y, texOf)}\\right)` : exprTex(y, texOf));
  switch (x.t) {
    case "num": return String(x.v);
    case "name": return texOf(x.n);
    case "neg": return `-${wrap(x.x, x.x.t === "sum")}`;
    case "sum": return x.terms.map(({ sign, x: y }, i) => (sign < 0 ? (i ? " - " : "-") : i ? " + " : "") + wrap(y, y.t === "sum")).join("");
    case "prod": return x.fs.map((f, i) => (i && f.t === "num" && x.fs[i - 1].t === "num" ? "\\cdot " : "") + wrap(f, f.t === "sum" || f.t === "neg")).join("");
    case "div": return `\\dfrac{${exprTex(x.a, texOf)}}{${exprTex(x.b, texOf)}}`;
    case "pow": return `${wrap(x.x, x.x.t !== "name" && x.x.t !== "num")}^{${x.p}}`;
  }
  return "";
}

// A formula in s (and numbers) as a transfer function { num, den } (polynomials,
// lowest power first). Throws ExprError if it uses anything but s.
export function toFraction(x) {
  switch (x.t) {
    case "num": return tf.of([x.v]);
    case "name":
      if (x.n !== "s") throw new ExprError(`A transfer function can only use s and numbers, not "${x.n}".`);
      return tf.of([0, 1]);
    case "neg": return tf.neg(toFraction(x.x));
    case "sum": return x.terms.map(({ sign, x: y }) => (sign < 0 ? tf.neg(toFraction(y)) : toFraction(y))).reduce(tf.add);
    case "prod": return x.fs.map(toFraction).reduce(tf.mul);
    case "div": {
      const b = toFraction(x.b);
      if (b.num.every((c) => Math.abs(c) < 1e-12)) throw new ExprError("That divides by zero.");
      return tf.mul(toFraction(x.a), tf.of(b.den, b.num));
    }
    case "pow": {
      if (x.p < 0) throw new ExprError("Use a fraction instead of a negative power.");
      let f = tf.of([1]);
      for (let k = 0; k < x.p; k++) f = tf.mul(f, toFraction(x.x));
      return f;
    }
  }
  throw new ExprError("That isn't a transfer function.");
}
