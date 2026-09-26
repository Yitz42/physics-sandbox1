// couple-geometry.js — where a couple's forces are and how far apart they are.
// Shared by the couple solver, its picture and its tools (see couple.js for
// the setup format).

import { sub, add, scale, cross2, mag, dot } from "../../core/vector.js";
import { directionOf } from "./particle.js";
import { reverse } from "./directions.js";

// "F_1" → "d_{1}", "F" → "d"
export function named(letter, symbol) {
  const m = String(symbol).match(/_\{?([^}]*)\}?$/);
  return m ? `${letter}_{${m[1]}}` : letter;
}

export const refPoint = (setup) => (setup.about ? setup.about.at : [0, 0]);
export const showsAbout = (setup) => !!(setup.about && !setup.about.hidden);

// The two forces of a couple: { a, b }. `a` sets the couple's direction.
export function pairOf(setup, c) {
  if (c.forces) {
    const [a, b] = c.forces.map((id) => setup.forces.find((f) => f.id === id));
    return { a, b };
  }
  const [la, lb] = c.pointLabels || [];
  const common = { symbol: c.symbol, magnitude: c.magnitude, couple: c.id, replacement: !!c.equivalentTo };
  return {
    a: { ...common, id: `${c.id}.a`, direction: c.direction, at: c.at, pointLabel: la, push: !!(c.push && c.push[0]) },
    b: { ...common, id: `${c.id}.b`, direction: reverse(c.direction), at: c.opposite, pointLabel: lb, push: !!(c.push && c.push[1]), second: true },
  };
}

// Every force: the plain ones, then both forces of each inline couple.
export function allForces(setup) {
  const out = [...(setup.forces || [])];
  for (const c of setup.couples || []) if (!c.forces) out.push(...Object.values(pairOf(setup, c)));
  return out;
}

// Geometry of a couple, per newton of its forces:
//   u: direction of force a,  r: from b's point to a's point,
//   perNewton: signed moment per newton (CCW +),  d: separation,
//   foot: the point on b's line of action nearest to a's point
export function coupleGeometry(setup, c) {
  const { a, b } = pairOf(setup, c);
  const u = directionOf(a);
  const r = sub(a.at, b.at);
  const perNewton = cross2(r, u);
  return { a, b, u, r, rLen: mag(r), perNewton, d: Math.abs(perNewton), foot: add(b.at, scale(u, dot(r, u))) };
}

// True for a slanted force (neither horizontal nor vertical): its couple's d
// has to be worked out as r sin φ instead of read off as a gap in x or y.
export const isSlanted = (u) => Math.abs(u[0]) > 1e-9 && Math.abs(u[1]) > 1e-9;

// One fixed "upward" direction along a line of action: u or −u, whichever
// points up (or right, for a horizontal line). Picture offsets are measured
// along it, so they stay put when a force is flipped to point the other way.
export const upAlong = (u) => (u[1] > 1e-9 || (Math.abs(u[1]) <= 1e-9 && u[0] > 0) ? u : scale(u, -1));

// Name of a couple's separation, e.g. "d", "d_{2}", "d'".
export const dSymbolOf = (c) => c.dSymbol || named("d", c.symbol);
// Name of one force's moment arm about P, e.g. "d_{A}" for the force at A.
export const armSymbolOf = (f) => (f.pointLabel ? `d_{${f.pointLabel}}` : named("d", f.symbol));
