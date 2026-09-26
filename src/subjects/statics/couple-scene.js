// couple-scene.js — the picture for couple problems (Unit 4).
//
// Draws the body (plates, bars), each force at the point where it acts,
// couple moments given as curved arrows, and — when asked —
//   • for each couple: both lines of action and the distance d between them
//     (with the r sin φ working when the forces are angled),
//   • for the point P: the moment arm from P to every line of action,
//   • the total moment as a curved arrow (and the net force if it isn't zero).

import { add, sub, scale, mag, dot, angleDeg, distToSegment } from "../../core/vector.js";
import { format } from "../../core/units.js";
import { magnitudeOf, directionOf } from "./particle.js";
import { angleMarks } from "./particle-scene.js";
import { armOf } from "./moment.js";
import { allForces, coupleGeometry, dSymbolOf, armSymbolOf, isSlanted, upAlong } from "./couple-geometry.js";
import { coupleShadow, phiOf, momentCenter } from "./couple-tools.js";

// Overall size of the picture, so arrows scale with it.
function sizeOf(setup) {
  const pts = allForces(setup).map((f) => f.at);
  for (const p of setup.plates || []) pts.push(p.from, p.to);
  if (setup.body) pts.push(...setup.body.points);
  let s = 0;
  for (const a of pts) for (const b of pts) s = Math.max(s, mag(sub(a, b)));
  return s || 1;
}

// Picture metres per newton: fixed by setup.forceScale, or the biggest KNOWN
// force is drawn setup.arrowFraction (default 0.35) of the picture's size.
function lengthPerNewton(setup, size) {
  if (setup.forceScale) return 1 / setup.forceScale;
  const known = allForces(setup).map(magnitudeOf).filter((v) => v != null);
  return ((setup.arrowFraction ?? 0.35) * size) / Math.max(1, ...known);
}

const turn = (M) => (M > 0 ? "counterclockwise" : "clockwise");

// opts: { reveal, arms (show d and the arms from P), hideMoment, guesses }
export function coupleScene(setup, result, opts = {}) {
  const vals = result ? result.values : {};
  const size = sizeOf(setup);
  const k = lengthPerNewton(setup, size);
  const showArms = !!(opts.arms || opts.reveal);
  const shapes = [{ type: "axes" }];

  for (const p of setup.plates || []) {
    shapes.push({ type: "box", at: scale(add(p.from, p.to), 0.5), w: Math.abs(p.to[0] - p.from[0]), h: Math.abs(p.to[1] - p.from[1]), label: p.label || "", passable: true, layer: "zone" }); // under everything
  }
  if (setup.body) shapes.push({ type: "beam", points: setup.body.points });
  for (const t of setup.texts || []) shapes.push({ type: "text", at: t.at, text: t.text });
  for (const d of setup.dims || []) shapes.push({ type: "dim", from: d.from, to: d.to, label: d.label || format(mag(sub(d.to, d.from)), "m"), labelSide: d.side || 1 });

  const arrowSegs = []; // each force's arrow, so P's arms can keep clear of them
  // Forces. An unknown (replacement) force is faint with "?" until revealed.
  // A "push" is drawn the textbook way: arrowhead AT the point, tail outside
  // the body. Otherwise the tail is at the point (a pull, or any applied force).
  allForces(setup).forEach((f) => {
    const known = magnitudeOf(f) != null;
    const show = known || opts.reveal;
    const F = known ? magnitudeOf(f) : vals[f.id];
    const len = show ? Math.max(0.08 * size, F * k) : 0.2 * size;
    const tail = f.push ? add(f.at, scale(directionOf(f), -len)) : f.at;
    const head = add(tail, scale(directionOf(f), len));
    // A couple's second force has the same size, so it just gets its name.
    const label = f.second && show ? f.symbol : `${f.symbol} = ${show ? format(F, "N") : "?"}`;
    shapes.push({ type: "arrow", id: f.id, from: tail, to: head, label, role: known ? "known" : "unknown", alpha: show ? undefined : 0.5 });
    arrowSegs.push({ id: f.id, tail, head, u: directionOf(f) });
    if (!setup.hideAngles && !f.push) shapes.push(...angleMarks(f, f.at, len));
    if (f.pointLabel) shapes.push({ type: "point", at: f.at, label: f.pointLabel, style: "dot" });
  });

  // Couple moments given directly: a curved arrow.
  for (const m of setup.moments || []) {
    shapes.push({ type: "moment", center: m.at, sense: m.sense, rPx: 30, role: "known", label: `${m.symbol} = ${format(m.magnitude, "N·m")}` });
  }
  if (setup.target) {
    const t = setup.target;
    shapes.push({ type: "moment", center: t.at, sense: Math.sign(t.value), rPx: 36, role: "target", label: `goal: ${Math.abs(t.value)} N·m ${turn(t.value)}` });
  }

  // Each couple: its two lines of action and the distance d between them.
  if ((showArms || setup.showSeparation) && !setup.hideSeparation) {
    for (const c of setup.couples || []) shapes.push(...separation(setup, c, size));
  }

  // The point P: its moment arm to every line of action.
  // The arms are slid apart along the lines of action — the first to one side
  // of P, the second to the other — each joined to P by a thin line. That
  // leaves a clear gap around P for the point, its name and the curved moment
  // arrow, and each arm's label goes on its outer side, away from P.
  // If an arm would run into a force's arrow (or the space just past its tip,
  // where the force's label goes) or the bar, it steps further out along the
  // lines of action, or the arms swap sides: the forces and labels stay put.
  const about = setup.about && !setup.about.hidden;
  if (about && showArms) {
    const P = setup.about.at;
    const gap = setup.about.gap ?? 0.15 * size;
    const clearance = 0.05 * size;
    const bodySegs = [];
    const pts = (setup.body && setup.body.points) || [];
    for (let j = 1; j < pts.length; j++) bodySegs.push([pts[j - 1], pts[j]]);
    const blockers = [
      ...arrowSegs.map((s) => [s.tail, add(s.head, scale(s.u, 0.1 * size))]), // arrow + room for its label
      ...bodySegs,
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
  }

  // The total moment: a curved arrow showing which way it turns.
  if (result && (opts.reveal || (opts.arms && !opts.hideMoment))) {
    const M = vals.M;
    const center = momentCenter(setup);
    const parts = (setup.couples || []).filter((c) => !c.equivalentTo).length + (setup.moments || []).length;
    const name = about ? `M_${setup.about.label || "P"}` : parts > 1 ? "M_R" : "M";
    const text = Math.abs(M) > 1e-9 ? `${name} = ${M.toFixed(1)} N·m (${turn(M)})` : `${name} = 0`;
    if (about && !setup.momentAt) {
      // Around P: a small curved arrow that fits in the gap between the arms,
      // with its value in a tidy box at the side of the picture.
      if (Math.abs(M) > 1e-9) shapes.push({ type: "moment", center, sense: Math.sign(M), rPx: 22, role: "resultant" });
      shapes.push({ type: "note", lines: [{ text, role: "resultant" }] });
    } else if (Math.abs(M) > 1e-9) {
      shapes.push({ type: "moment", center, sense: Math.sign(M), rPx: 44, role: "resultant", label: text });
    } else {
      shapes.push({ type: "text", at: add(center, [0, 0.12 * size]), text });
    }
    // A replacement couple, once solved: its own moment, drawn on its own body.
    for (const c of (setup.couples || []).filter((x) => x.equivalentTo && opts.reveal)) {
      const Mc = vals[`M_${c.id}`];
      const g = coupleGeometry(setup, c);
      shapes.push({ type: "moment", center: scale(add(g.a.at, g.b.at), 0.5), sense: Math.sign(Mc) || 1, rPx: 44, role: "resultant", label: `same: ${Mc.toFixed(1)} N·m (${turn(Mc)})` });
    }
    // A leftover net force means it is NOT a pure couple (build stage).
    if (setup.netForce && vals.R > 0.5) {
      const R = [vals["R.x"], vals["R.y"]];
      shapes.push({ type: "arrow", id: "R", from: center, to: add(center, scale(R, Math.max(0.1 * size, vals.R * k) / vals.R)), role: "resultant", label: `ΣF = ${format(vals.R, "N")} ≠ 0` });
    }
  }

  if (opts.guesses) shapes.push(...coupleShadow(setup, result, opts.guesses, { k, size, center: momentCenter(setup) }));
  if (about) shapes.push({ type: "point", at: setup.about.at, label: setup.about.label || "P", style: "ring" });
  return shapes;
}

// Shortest distance between segments p1–p2 and q1–q2 (0 if they cross).
function segmentGap(p1, p2, q1, q2) {
  const side = (a, b, c) => Math.sign((b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]));
  if (side(p1, p2, q1) * side(p1, p2, q2) < 0 && side(q1, q2, p1) * side(q1, q2, p2) < 0) return 0;
  return Math.min(distToSegment(p1, q1, q2), distToSegment(p2, q1, q2), distToSegment(q1, p1, p2), distToSegment(q2, p1, p2));
}

// Lines of action of a couple's two forces and the distance d between them.
function separation(setup, c, size) {
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
