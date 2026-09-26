// couple-arms.js — distance and moment-arm drawings for couple pictures:
//   separation(): a couple's two lines of action and the distance d between them
//   pointArms():  the moment arm from point P to every force's line of action,
//                 slid clear of arrows, labels, the bar and dimension lines

import { add, sub, scale, dot, angleDeg, distToSegment } from "../../core/vector.js";
import { format } from "../../core/units.js";
import { directionOf } from "./particle.js";
import { armOf } from "./moment.js";
import { allForces, coupleGeometry, dSymbolOf, armSymbolOf, isSlanted, upAlong } from "./couple-geometry.js";
import { phiOf } from "./couple-tools.js";

// The point P: its moment arm to every line of action.
// The arms are slid apart along the lines of action — the first to one side
// of P, the second to the other — each joined to P by a thin line. That
// leaves a clear gap around P for the point, its name and the curved moment
// arrow, and each arm's label goes on its outer side, away from P.
// If an arm would run into a force's arrow (or the space just past its tip,
// where the force's label goes) or the bar, it steps further out along the
// lines of action, or the arms swap sides: the forces and labels stay put.
export function pointArms(setup, arrowSegs, size) {
  const shapes = [];
  const P = setup.about.at;
  const gap = setup.about.gap ?? 0.15 * size;
  const clearance = 0.05 * size;
  const bodySegs = [];
  const pts = (setup.body && setup.body.points) || [];
  for (let j = 1; j < pts.length; j++) bodySegs.push([pts[j - 1], pts[j]]);
  const blockers = [
    ...arrowSegs.map((s) => [s.tail, add(s.head, scale(s.u, 0.1 * size))]), // arrow + room for its label
    ...bodySegs,
    ...(setup.dims || []).map((d) => [d.from, d.to]), // the stage's own dimension lines
  ];
  const arms = allForces(setup).filter((f) => !f.replacement)
    .map((f) => ({ f, a: armOf(setup, f, f.at), u: directionOf(f) }))
    .filter(({ a }) => a.d >= 1e-6);
  // Place each arm `k` gaps out from P on side `sign` (+1 up, −1 down).
  // How close does it come to anything in the way? (0 = it crosses something)
  const room = (arm, sign, k) => {
    const out = scale(upAlong(arm.u), sign * gap * k);
    return Math.min(Infinity, ...blockers.map(([p, q]) => segmentGap(add(P, out), add(arm.a.foot, out), p, q)));
  };
  const steps = [1, 1.5, 2, 2.5, 3, 3.5, 4];
  // The nearest clear spot on that side (or the roomiest one if none is clear).
  const fit = (arm, sign) => {
    const k = steps.find((x) => room(arm, sign, x) > clearance);
    return k != null ? { k, cost: k } : { k: steps.reduce((b, x) => (room(arm, sign, x) > room(arm, sign, b) ? x : b)), cost: 20 };
  };
  // Arms alternate sides of P (up, down, up …). Try it both ways round and
  // keep whichever needs the arms moved least.
  const layout = (flip) => arms.map((arm, i) => {
    const sign = (i % 2 ? -1 : 1) * (flip ? -1 : 1);
    const { k, cost } = fit(arm, sign);
    return { ...arm, sign, k: k + Math.floor(i / 2), cost };
  });
  const [first, second] = [layout(false), layout(true)];
  const total = (l) => l.reduce((t, x) => t + x.cost, 0);
  for (const { f, a, u, sign, k } of total(second) < total(first) ? second : first) {
    const out = scale(upAlong(u), sign);
    const shift = scale(out, gap * k);
    const from = add(P, shift), to = add(a.foot, shift);
    // Which side of the dimension line is "away from P" (dim labels use labelSide ±1).
    const e = sub(to, from);
    const side = Math.sign(e[1] * out[0] - e[0] * out[1]) || 1;
    shapes.push({ type: "line", from: P, to: from, style: "reference" });
    shapes.push({ type: "line", from: add(f.at, scale(u, -0.5 * size)), to: add(f.at, scale(u, 0.5 * size)), style: "action" });
    shapes.push({ type: "dim", id: f.id, from, to, role: "arm", label: `${armSymbolOf(f)} = ${format(a.d, "m")}`, labelSide: side });
  }
  return shapes;
}

// Shortest distance between segments p1–p2 and q1–q2 (0 if they cross).
function segmentGap(p1, p2, q1, q2) {
  const side = (a, b, c) => Math.sign((b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]));
  if (side(p1, p2, q1) * side(p1, p2, q2) < 0 && side(q1, q2, p1) * side(q1, q2, p2) < 0) return 0;
  return Math.min(distToSegment(p1, q1, q2), distToSegment(p2, q1, q2), distToSegment(q1, p1, p2), distToSegment(q2, p1, p2));
}

// Lines of action of a couple's two forces and the distance d between them.
export function separation(setup, c, size) {
  const g = coupleGeometry(setup, c);
  if (g.d < 1e-9) return [];
  const out = [];
  // The dimension sits c.dimShift from force a's point, measured along the
  // lines' fixed "up" direction (upAlong) — so flipping the couple doesn't
  // make it jump to the other side. If the point P is on that side, it goes
  // to the other side instead, so it never tangles with P's moment arms.
  // Each line of action is drawn just far enough to reach it (like extension
  // lines on an engineering drawing).
  const w = upAlong(g.u);
  let shiftUp = c.dimShift ?? 0;
  if (setup.about && !setup.about.hidden && Math.sign(dot(sub(setup.about.at, g.a.at), w)) === Math.sign(shiftUp)) shiftUp = -shiftUp;
  const s = shiftUp * dot(w, g.u); // the same offset, measured along u
  const pad = 0.06 * size;
  const extend = (P, t0, t1) => ({ type: "line", from: add(P, scale(g.u, Math.min(t0, t1) - pad)), to: add(P, scale(g.u, Math.max(t0, t1) + pad)), style: "action" });
  out.push(extend(g.a.at, 0, s), extend(g.b.at, 0, dot(g.r, g.u) + s));
  const shift = scale(g.u, s);
  const from = add(g.foot, shift), to = add(g.a.at, shift);
  const ds = dSymbolOf(c);
  const angled = isSlanted(g.u); // slanted forces: show how d is found
  out.push({ type: "dim", id: c.id, from, to, role: "arm", label: angled ? ds : `${ds} = ${format(g.d, "m")}`, labelSide: c.dimSide || 1, labelOn: true });
  out.push({ type: "rightangle", at: from, u: g.u, v: scale(sub(to, from), 1 / g.d), role: "arm" });
  if (angled) {
    // How d is found: r (between the points), the angle φ, and d = r sin φ.
    const toA = sub(g.a.at, g.b.at);
    const along = toA[0] * g.u[0] + toA[1] * g.u[1] >= 0 ? g.u : scale(g.u, -1);
    out.push({ type: "dim", from: g.b.at, to: g.a.at, label: "r", dashed: true, labelSide: -(c.dimSide || 1) });
    out.push({ type: "arc", center: g.b.at, r: Math.min(0.3 * g.rLen, 0.12 * size), start: angleDeg(toA), end: angleDeg(along), label: "φ" });
    out.push({ type: "note", lines: [
      { text: `${ds} = r sin φ = ${format(g.d, "m")}`, role: "arm" },
      { text: `r = ${format(g.rLen, "m")} (between the two points)` },
      { text: `φ = ${phiOf(setup, c).toFixed(1)}° (between r and the forces)` },
    ] });
  }
  return out;
}
