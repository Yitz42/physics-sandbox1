// poly.js — polynomials in s, and fractions (ratios) of polynomials.
//
// Transfer functions in controls are ratios of polynomials in s, e.g.
//   G(s) = 10 / (s² + 3s + 2).
// A polynomial is an array of coefficients, LOWEST power first:
//   s² + 3s + 2  →  [2, 3, 1]
// (Stage files write them highest power first, the way a textbook does;
// fromDescending converts.)
//
// fractionOps(ring) gives + and × for fractions over any "ring" (a kind of
// number you can add and multiply). The same code then works for transfer
// functions in s (ring = polynomials, below) and for symbolic ones in the
// block names G₁, H₁ … (ring = symbolic.js). Knows nothing about controls.

const TINY = 1e-9;

// ---- Polynomials in s ---------------------------------------------------------

// Remove zero coefficients at the high end: [2, 3, 0] → [2, 3]. Keeps [0].
export function trim(p) {
  const scale = Math.max(1, ...p.map(Math.abs));
  let n = p.length;
  while (n > 1 && Math.abs(p[n - 1]) <= TINY * scale) n--;
  return p.slice(0, n).map((c) => (Math.abs(c) <= TINY * scale ? 0 : c));
}

export const fromDescending = (coeffs) => trim(coeffs.slice().reverse());
export const toDescending = (p) => trim(p).slice().reverse();
export const degree = (p) => trim(p).length - 1;
export const isZero = (p) => trim(p).every((c) => c === 0);

export function add(a, b) {
  const out = new Array(Math.max(a.length, b.length)).fill(0);
  a.forEach((c, i) => (out[i] += c));
  b.forEach((c, i) => (out[i] += c));
  return trim(out);
}
export const scale = (p, k) => trim(p.map((c) => c * k));
export const neg = (p) => scale(p, -1);
export const sub = (a, b) => add(a, neg(b));

export function mul(a, b) {
  const out = new Array(a.length + b.length - 1).fill(0);
  a.forEach((x, i) => b.forEach((y, j) => (out[i + j] += x * y)));
  return trim(out);
}

// Value at s = x (Horner's rule).
export function evaluate(p, x) {
  let v = 0;
  for (let i = p.length - 1; i >= 0; i--) v = v * x + p[i];
  return v;
}

// Long division: a = q·b + r, with deg r < deg b.
export function divmod(a, b) {
  b = trim(b);
  let r = trim(a).slice();
  const db = b.length - 1;
  if (isZero(b)) throw new Error("division by the zero polynomial");
  const q = new Array(Math.max(1, r.length - db)).fill(0);
  while (r.length - 1 >= db && !isZero(r)) {
    const k = r.length - 1 - db;
    const c = r[r.length - 1] / b[db];
    q[k] = c;
    for (let i = 0; i <= db; i++) r[i + k] -= c * b[i];
    r[r.length - 1] = 0; // exactly cancelled
    r = trim(r);
  }
  return { q: trim(q), r };
}

// Greatest common divisor, made monic (leading coefficient 1).
// Uses a tolerance, since the coefficients are decimals.
export function gcd(a, b) {
  a = trim(a);
  b = trim(b);
  const size = Math.max(1, ...a.map(Math.abs), ...b.map(Math.abs));
  while (!isZero(b) && Math.max(...b.map(Math.abs)) > 1e-7 * size) {
    const { r } = divmod(a, b);
    a = b;
    b = r;
  }
  return scale(a, 1 / a[a.length - 1]);
}

// The ring of polynomials in s, for fractionOps. Its `cancel` removes common
// factors and makes the denominator monic: (3s + 3)/(s² + 2s + 1) → 3/(s + 1).
export const polyRing = {
  zero: [0],
  one: [1],
  add,
  mul,
  neg,
  isZero,
  cancel(num, den) {
    if (isZero(num)) return [[0], [1]];
    const g = gcd(num, den);
    let n = g.length > 1 ? divmod(num, g).q : num;
    let d = g.length > 1 ? divmod(den, g).q : den;
    const lead = d[d.length - 1];
    return [scale(n, 1 / lead), scale(d, 1 / lead)];
  },
};

// ---- Fractions over any ring ----------------------------------------------------

// A fraction is { num, den }. The ring may offer cancel(num, den) → [num, den].
export function fractionOps(ring) {
  const tidy = (num, den) => {
    const [n, d] = ring.cancel ? ring.cancel(num, den) : [num, den];
    return { num: n, den: d };
  };
  const ops = {
    of: (num, den = ring.one) => tidy(num, den),
    one: () => ({ num: ring.one, den: ring.one }),
    mul: (f, g) => tidy(ring.mul(f.num, g.num), ring.mul(f.den, g.den)),
    add: (f, g) => tidy(ring.add(ring.mul(f.num, g.den), ring.mul(g.num, f.den)), ring.mul(f.den, g.den)),
    neg: (f) => ({ num: ring.neg(f.num), den: f.den }),
    // A feedback loop: forward path G, feedback path H, feedback sign
    // (−1 negative feedback, +1 positive):  T = G / (1 − sign·G·H).
    // Written without nested fractions: N_G D_H / (D_G D_H − sign N_G N_H).
    feedback(G, H, sign = -1) {
      const loop = ring.mul(G.num, H.num);
      const den = ring.add(ring.mul(G.den, H.den), sign < 0 ? loop : ring.neg(loop));
      return tidy(ring.mul(G.num, H.den), den);
    },
  };
  return ops;
}

export const tf = fractionOps(polyRing); // transfer functions in s

// ---- Display ---------------------------------------------------------------------

// A coefficient as text: whole numbers plainly, others to 4 significant figures.
export function coeffText(c) {
  if (Math.abs(c - Math.round(c)) < 1e-9) return String(Math.round(c));
  return String(Number(c.toPrecision(4)));
}

// KaTeX for a polynomial, highest power first: [2, 3, 1] → "s^2 + 3s + 2".
export function polyTex(p, v = "s") {
  const terms = [];
  const q = trim(p);
  for (let k = q.length - 1; k >= 0; k--) {
    const c = q[k];
    if (c === 0) continue;
    const mag = Math.abs(c);
    const power = k === 0 ? "" : k === 1 ? v : `${v}^{${k}}`;
    const num = k > 0 && Math.abs(mag - 1) < 1e-12 ? "" : coeffText(mag);
    terms.push({ neg: c < 0, body: `${num}${power}` });
  }
  if (!terms.length) return "0";
  return terms.map((t, i) => (i === 0 ? (t.neg ? "-" : "") : t.neg ? " - " : " + ") + t.body).join("");
}

// The same as plain text, for the picture: [2, 3, 1] → "s² + 3s + 2".
const SUPER = { 0: "⁰", 1: "¹", 2: "²", 3: "³", 4: "⁴", 5: "⁵", 6: "⁶", 7: "⁷", 8: "⁸", 9: "⁹" };
export function polyText(p, v = "s") {
  return polyTex(p, v).replace(/\^\{(\d+)\}/g, (_, d) => [...d].map((x) => SUPER[x]).join("")).replace(/-/g, "−");
}
