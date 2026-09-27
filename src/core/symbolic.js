// symbolic.js — polynomials in named symbols, e.g. 1 + G₂H₂ + G₁G₂H₁.
//
// Block diagrams and signal-flow graphs are usually solved with letters, not
// numbers: T = G₁G₂ / (1 + G₂H₂ + G₁G₂H₁). A symbolic polynomial is a Map from
// a monomial to its coefficient; a monomial is its symbols' ids, sorted and
// joined with "*" (the number 1 is the empty monomial ""):
//   1 + G₂H₂ − G₁  →  Map { "" → 1, "G2*H2" → 1, "G1" → −1 }
// symRing plugs into fractionOps (core/poly.js), so fractions of these work
// like fractions of numbers. Knows nothing about controls.

const key = (ids) => ids.slice().sort().join("*");
const idsOf = (k) => (k ? k.split("*") : []);

export const symbol = (id, coef = 1) => new Map([[id, coef]]);
export const constant = (c) => new Map(c === 0 ? [] : [["", c]]);

function clean(m) {
  for (const [k, c] of m) if (Math.abs(c) < 1e-12) m.delete(k);
  return m;
}

export function add(a, b) {
  const out = new Map(a);
  for (const [k, c] of b) out.set(k, (out.get(k) || 0) + c);
  return clean(out);
}
export const neg = (a) => new Map([...a].map(([k, c]) => [k, -c]));

export function mul(a, b) {
  const out = new Map();
  for (const [ka, ca] of a) {
    for (const [kb, cb] of b) {
      const k = key([...idsOf(ka), ...idsOf(kb)]);
      out.set(k, (out.get(k) || 0) + ca * cb);
    }
  }
  return clean(out);
}

export const isZero = (a) => a.size === 0;
export const isOne = (a) => a.size === 1 && a.get("") === 1;
export const equals = (a, b) => isZero(add(a, neg(b)));

// For fractionOps: fractions whose top and bottom are symbolic polynomials.
// (No cancelling of common factors: the forms that reduction produces don't
// need it, and they stay the way a textbook writes them.)
export const symRing = { zero: new Map(), one: constant(1), add, mul, neg, isZero };

// Substitute a value for every symbol, using any ring's + and ×:
// valueOf(id) gives the symbol's value in that ring (e.g. a transfer function).
export function substitute(a, ring, valueOf, fromNumber) {
  let total = ring.zero;
  for (const [k, c] of a) {
    let term = fromNumber(c);
    for (const id of idsOf(k)) term = ring.mul(term, valueOf(id));
    total = ring.add(total, term);
  }
  return total;
}

// ---- Display -----------------------------------------------------------------------

// KaTeX. texOf(id) names each symbol (e.g. "G1" → "G_1"); order is the list
// of ids in the order they should be written (G₁ before G₂ before H₁ …).
// Terms go by how many symbols they have (1 first), then in that order.
export function symTex(a, texOf = (id) => id, order = []) {
  if (a.size === 0) return "0";
  const rank = (id) => (order.includes(id) ? order.indexOf(id) : 1000 + id.charCodeAt(0));
  const sortIds = (ids) => ids.slice().sort((x, y) => rank(x) - rank(y));
  const terms = [...a].map(([k, c]) => ({ ids: sortIds(idsOf(k)), c }));
  terms.sort((p, q) => p.ids.length - q.ids.length || cmp(p.ids.map(rank), q.ids.map(rank)));
  return terms.map((t, i) => {
    const mag = Math.abs(t.c);
    const sym = t.ids.map(texOf).join("");
    const num = sym && Math.abs(mag - 1) < 1e-12 ? "" : fmt(mag);
    const op = t.c < 0 ? (i === 0 ? "-" : " - ") : i === 0 ? "" : " + ";
    return op + num + sym;
  }).join("");
}

function cmp(a, b) {
  for (let i = 0; i < Math.min(a.length, b.length); i++) if (a[i] !== b[i]) return a[i] - b[i];
  return a.length - b.length;
}
const fmt = (c) => (Math.abs(c - Math.round(c)) < 1e-9 ? String(Math.round(c)) : String(Number(c.toPrecision(4))));

// A fraction as KaTeX: \frac{top}{bottom}, or just the top when the bottom is 1.
export function fracTex(f, texOf, order) {
  const top = symTex(f.num, texOf, order);
  if (isOne(f.den)) return top;
  return `\\dfrac{${top}}{${symTex(f.den, texOf, order)}}`;
}
