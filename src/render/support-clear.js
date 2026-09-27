// support-clear.js — keeps arrows at a support clear of its symbol (agreed
// with the owner), for every picture: the stage's own arrows, the student's
// FBD arrows and debug FBDs alike.
//   • A reaction arrow along a pin's, roller's or smooth surface's normal, on
//     the symbol's side, is moved past the symbol (e.g. A_y ends BELOW a pin,
//     instead of running through its triangle).
//   • At a point with a moment arrow (a fixed support's M_A), force arrows stop
//     just outside the moment's circle, so the two don't tangle.
//   • A beam's end at a fixed support is drawn square (flat against the
//     wall it is built into), not rounded.
// Everything is worked out in pixels, because the symbols are pixel-sized.

import { add, sub, scale, mag, dot } from "../core/vector.js";

// How far each symbol reaches from its point (pixels): the arrow is moved this far.
const DEPTH = { pin: 34, roller: 36, smooth: 16 };
const MOMENT_CLEAR = 5; // pixels between a moment's circle and a force arrow

export function clearSupports(shapes, cv) {
  const px = (n) => cv.pxToWorld(n);
  const symbols = shapes.filter((s) => s.type === "supportSymbol" && DEPTH[s.kind]);
  const moments = shapes.filter((s) => s.type === "moment");
  const fixedAt = shapes.filter((s) => s.type === "supportSymbol" && s.kind === "fixed").map((s) => s.at);
  if (!symbols.length && !moments.length && !fixedAt.length) return shapes;
  const near = (P, Q) => mag(sub(P, Q)) < px(3);
  return shapes.map((s) => {
    if (s.type === "beam" && fixedAt.length) {
      const ends = [s.points[0], s.points[s.points.length - 1]];
      const flat = ends.map((E) => fixedAt.some((F) => near(E, F)));
      return flat.some(Boolean) ? { ...s, flat } : s;
    }
    if (s.type !== "arrow") return s;
    const len = mag(sub(s.to, s.from));
    if (len < 1e-12) return s;
    const u = scale(sub(s.to, s.from), 1 / len);
    let shift = 0; // metres along the arrow (negative: backwards)
    for (const m of moments) {
      const gap = px((m.rPx || 34) + MOMENT_CLEAR);
      if (near(s.to, m.center)) shift = -gap; // pushes on the point: stop at the circle
      else if (near(s.from, m.center)) shift = gap; // starts at the point: start outside it
    }
    if (!shift) {
      for (const q of symbols) {
        const into = q.normal; // from the symbol into the body
        if (near(s.to, q.at) && dot(u, into) > 0.7) shift = -px(DEPTH[q.kind]); // pushes up through the symbol
        else if (near(s.from, q.at) && dot(u, into) < -0.7) shift = px(DEPTH[q.kind]); // points down through it
      }
    }
    if (!shift) return s;
    const d = scale(u, shift);
    // An arrow that pushes on the body is labelled at its outer end (onBody);
    // headGap 0 stops the beam-surface rule moving it again.
    return { ...s, from: add(s.from, d), to: add(s.to, d), headGap: 0, ...(shift < 0 ? { onBody: true } : {}) };
  });
}
