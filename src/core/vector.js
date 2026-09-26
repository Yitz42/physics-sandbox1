// vector.js — small 2D/3D vector helpers.
//
// Vectors are plain arrays: [x, y] in 2D, [x, y, z] in 3D.
// Plain arrays (instead of a class) keep stage files and tests easy to read:
// a force pointing right and up is simply [3, 4].
//
// Every function returns a NEW array and never changes its inputs, so a
// vector can be shared safely between the solver, the renderer and the UI.

export const DEG = Math.PI / 180; // multiply degrees by DEG to get radians

export function add(a, b) {
  return a.map((v, i) => v + b[i]);
}

export function sub(a, b) {
  return a.map((v, i) => v - b[i]);
}

export function scale(a, k) {
  return a.map((v) => v * k);
}

export function dot(a, b) {
  return a.reduce((sum, v, i) => sum + v * b[i], 0);
}

// Length (magnitude) of a vector: √(x² + y² [+ z²]).
export function mag(a) {
  return Math.sqrt(dot(a, a));
}

// Same direction, length 1. A zero vector stays zero (instead of NaN).
export function unit(a) {
  const m = mag(a);
  return m === 0 ? a.map(() => 0) : scale(a, 1 / m);
}

// Sum of any number of vectors: sum([a, b, c]).
export function sum(list, dims = 2) {
  return list.reduce((acc, v) => add(acc, v), new Array(dims).fill(0));
}

// 2D "cross product" gives a scalar: the z-component of a × b.
// Later used for moments (M = r × F), counterclockwise positive.
export function cross2(a, b) {
  return a[0] * b[1] - a[1] * b[0];
}

// Full 3D cross product, for the 3D statics units later.
export function cross3(a, b) {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
}

// Vector of length `length` at `deg` degrees counterclockwise from +x.
export function fromPolar(length, deg) {
  return [length * Math.cos(deg * DEG), length * Math.sin(deg * DEG)];
}

// Direction of a 2D vector in degrees, counterclockwise from +x, in [0, 360).
export function angleDeg(a) {
  const d = Math.atan2(a[1], a[0]) / DEG;
  return d < 0 ? d + 360 : d;
}

// Distance from point p to the line segment a→b. Used for clicking arrows.
export function distToSegment(p, a, b) {
  const ab = sub(b, a);
  const len2 = dot(ab, ab);
  const t = len2 === 0 ? 0 : Math.max(0, Math.min(1, dot(sub(p, a), ab) / len2));
  return mag(sub(p, add(a, scale(ab, t))));
}

// True when two numbers agree to within a relative tolerance (e.g. 0.02 = 2%).
// `absTol` stops tiny values like 0.0001 vs 0 from being called "wrong".
export function nearlyEqual(a, b, relTol = 1e-9, absTol = 1e-9) {
  return Math.abs(a - b) <= Math.max(absTol, relTol * Math.max(Math.abs(a), Math.abs(b)));
}
