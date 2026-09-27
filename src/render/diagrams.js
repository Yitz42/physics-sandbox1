// diagrams.js — draws a "scene": a list of simple shapes in metres.
//
// Subjects describe WHAT to draw (see e.g. subjects/statics/particle-scene.js);
// render/shapes.js decides HOW each shape looks. Shape types:
//   arrow    { id, from, to, label, role, headGap?, tailGap? }   role: known | unknown | resultant |
//                                            component | target | wrong | student | shadow
//   line     { id?, from, to, style }        style: cable | reference | dashed
//   support  { from, to, normal }            hatched ground/ceiling/wall
//   point    { at, label, style, labelAway? } style: ring | dot | pin; labelAway: a direction
//                                            the name prefers (e.g. out from a truss)
//   box      { id?, at, w, h, label, passable? } a crate or block (at = centre); passable: labels avoid it but may cover it
//   (any shape may set `layer: "<type>"` to be drawn in that type's layer instead of its own)
//   arc      { center, r, start, end, label }  angle marking (degrees, CCW from +x), see angles.js
//   triangle { at, dx, dy, labels }          slope triangle, e.g. 3-4-5
//   zone     { from, to, label, labelBelow? } a shaded "not allowed" area, labelled above (or below)
//   text     { at, text }                    a caption
//   axes     {}                              little x-y axes (bottom-left corner)
//   handle   { at }                          a grab circle on a draggable arrow tip
//   beam, pivot, dim, rightangle, moment     see shapes-extra.js
//   spring, pulley                           see mechanisms.js
//   trafficLight, balloon, pole              see scenery.js
//   tfblock, sumjunction, wire, pickoff, signal, groupbox, sfgnode, sfgbranch   see blocks.js
//   distload, wheel                          see loads.js
//   supportSymbol                            pin, roller, fixed … see supports.js
//   member                                   a truss bar, red/blue for tension/compression, see members.js
//   region                                   a flat shape filled in (a composite area's parts), see regions.js
//   wrench, trailer                          see hardware.js
//   note     { lines: [text | {text, role}] } a small key/working box in a free corner
//   listValues {}                            put every force's value in the corner list
//   divider  { x, frame? }                   soft grey vertical line between two diagrams (frame: the
//                                            exact view to show; see panels.js);
//                                            every label stays on its own side of it
//
// Arrow labels are placed last, each moved to a free spot if its first
// choice would overlap something (see labels.js).

import { labelPosition, drawLabel, cssColor, measureLabel, labelBox, letterDrop } from "./arrows.js";
import { drawShape, roleColor } from "./shapes.js";
import { placeLabels, placeLegend, segmentHits, overlapArea, LETTER_CLEAR } from "./labels.js";
import { beamDirAt, surfaceGap } from "./fbd.js";
import { lowerDims, extendDims } from "./dims.js";
import { drawArc } from "./angles.js";
import { clearSupports } from "./support-clear.js";
import { findClashes, drawBounds, showBounds } from "./bounds.js";

export { roleColor };

// Draw in layers so arrows and labels sit on top of lines and boxes.
const ORDER = ["divider", "zone", "region", "plot", "support", "pivot", "wheel", "trailer", "beam", "member", "wrench", "supportSymbol", "distload", "line", "dim", "leader", "rightangle", "box", "arc", "triangle", "axes", "motor", "moment", "point", "arrow", "handle", "text"];

// opts.highlight: id of the force to glow (clicked arrow or equation term)
// Returns a report of what was drawn — every object's outline, every solid
// line, every label's box, and any clashes between them (bounds.js) — which
// the gallery and the picture tests check. (Also kept as cv.lastReport.)
export function drawScene(cv, shapes, opts = {}) {
  const { ctx } = cv;
  const env = { ink: cssColor("--c-ink", "#1d2330"), faint: cssColor("--c-faint", "#94a3b8"), paper: cssColor("--c-canvas", "#ffffff") };
  cv.clear();
  shapes = touchBeams(clearSupports(shapes, cv)); // arrows clear of support symbols, then of beam surfaces
  shapes = apartFromLoads(shapes); // a point load drawn through a distributed load gets its own shade
  shapes = extendDims(lowerDims(shapes, cv), cv); // dimension lines break where arrows cross them; extension lines
  shapes = separateMoments(shapes, cv); // two moment circles never overlap

  // A shape can ask to be drawn in another type's layer (e.g. a plate under everything: layer "zone").
  // Dividers (screen x) split the picture into side-by-side diagrams.
  const cuts = shapes.filter((s) => s.type === "divider").map((s) => cv.toScreen([s.x, 0])[0]).sort((a, b) => a - b);
  // The [left, right] pixel range of the diagram a shape starts in.
  const halfOf = (s) => {
    const p = s.at || s.from || s.center || (s.points && s.points[0]) || (s.profile && s.profile[0]);
    if (!p) return null;
    const x = cv.toScreen(p)[0];
    return [Math.max(0, ...cuts.filter((c) => c <= x).map((c) => c + 2)), Math.min(cv.view.width, ...cuts.filter((c) => c > x).map((c) => c - 2))];
  };
  const rank = (s) => ORDER.indexOf(s.layer || s.type);
  const sorted = [...shapes].sort((a, b) => rank(a) - rank(b));
  const obstacles = [];
  const segments = [];
  const wanted = []; // arrow labels, placed after everything else is drawn

  const notes = []; // "note" shapes: small text boxes placed in a free corner
  let listAll = false; // a { type: "listValues" } shape: values go in the corner list
  const arcs = []; // angle markings, drawn after everything else (angles.js)
  for (const s of sorted) {
    if (s.type === "note") {
      notes.push(...s.lines);
      continue;
    }
    if (s.type === "arc") {
      arcs.push(s); // drawn last (below), once everything that could be in the way is known
      continue;
    }
    if (s.type === "listValues") {
      listAll = true; // the scene asks for every value in the corner list
      continue;
    }
    const lit = !!opts.highlight && s.id === opts.highlight;
    // Side-by-side diagrams: a drawing never crosses into the other diagram
    // (it's clipped to the half where it starts), like the labels below.
    const half = s.type !== "divider" && cuts.length ? halfOf(s) : null;
    if (half) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(half[0], 0, half[1] - half[0], cv.view.height);
      ctx.clip();
    }
    const out = drawShape(cv, s, { ...env, lit, obstacles }); // (what's drawn so far, e.g. for a moment arrow to turn away from)
    if (half) ctx.restore();
    obstacles.push(...out.boxes);
    segments.push(...out.segments);
    wanted.push(...out.labels);
    if (out.arcs) arcs.push(...out.arcs); // angle marks a drawing asks for (e.g. a slope's angle), drawn last
    if (s.type === "point" && s.label) {
      const [x, y] = cv.toScreen(s.at);
      // Point names go first, as close to their point as they can: just below
      // it, else anywhere round it. A dimension line under the name breaks around it.
      // s.labelAway (a direction, e.g. away from a truss's middle) is tried first.
      const drop = letterDrop(s.label);
      const r = s.style === "ring" ? RING_R : DOT_R;
      const spots = aroundPoint(x, y, r, drop);
      if (s.labelAway) {
        const [ux, uy] = s.labelAway, m = Math.hypot(ux, uy) || 1;
        const g = r + LETTER_CLEAR + 7;
        const sx = x + (ux / m) * g, sy = y - (uy / m) * g + 3;
        spots.unshift([sx, sy, ux / m > 0.35 ? "left" : ux / m < -0.35 ? "right" : "center"]);
      }
      wanted.unshift({ text: s.label, pos: spots[0].slice(0, 2), align: spots[0][2], size: 14, weight: 700, color: env.ink, plain: true, breaks: true, spots, clear: LETTER_CLEAR, tight: drop });
    }
    if (s.type === "arrow" && s.label) {
      const a = cv.toScreen(s.from), b = cv.toScreen(s.to);
      // Components and targets prefer the middle of their arrow. An arrow
      // pushing on a body (its head on the body) is labelled at its outer end;
      // any other arrow just past its tip, in line with it (below a downward
      // arrow).
      const mid = s.role === "component" || s.role === "target";
      const side = s.labelSide || (s.role === "target" ? -1 : 1);
      const size = lit ? 15 : 14, weight = lit ? 700 : 500;
      const atTail = s.onBody && !mid;
      const place = atTail ? labelPosition(b, a, 14) : labelPosition(a, b, 14, mid, side);
      wanted.push({ text: s.label, ...place, size, weight, color: roleColor(s.role), fromArrow: s.role !== "shadow" });
    }
  }

  // Angle markings: each number sits right by its arc (the arc grows to make room).
  // Their numbers are placed first, so arrow labels keep clear of them.
  // Each number also keeps clear of the numbers of the arcs drawn before it
  // (two angles measured from the same line would otherwise share a spot).
  const arcBoxes = [];
  for (const s of arcs) {
    const out = drawArc(cv, s, env, { obstacles: [...obstacles, ...arcBoxes], segments });
    segments.push(...out.segments);
    if (out.label) {
      wanted.unshift(out.label);
      arcBoxes.push(labelBox(out.label.pos[0], out.label.pos[1], measureLabel(ctx, out.label.text, out.label.size), out.label.size, "center"));
    }
  }

  // Working notes (e.g. how d is found) go in a box in the freest corner.
  if (notes.length) {
    // A line is plain text, or { text, role } to colour it like the matching drawing.
    const items = notes.map((n) => (typeof n === "string" ? { text: n, color: env.ink } : { text: n.text, color: n.role ? roleColor(n.role) : env.ink }));
    const box = placeLegend(ctx, items, { obstacles, segments, view: cv.view });
    drawLegend(ctx, box, env);
    obstacles.push(box.box);
  }

  const layout = { obstacles, segments, view: cv.view };
  // Point names and force labels choose their spots first; labels marked
  // `yields` (dimension labels) are placed last and move out of their way.
  wanted.sort((a, b) => (a.yields ? 1 : 0) - (b.yields ? 1 : 0));
  // Dividers split the picture into side-by-side diagrams: each label must
  // stay in the diagram where it starts (its arrow's side of the line).
  for (const l of wanted) {
    l.minX = Math.max(0, ...cuts.filter((x) => x <= l.pos[0]).map((x) => x + 4));
    l.maxX = Math.min(cv.view.width, ...cuts.filter((x) => x > l.pos[0]).map((x) => x - 4));
  }
  let placed = placeLabels(ctx, wanted, layout);

  // Values that can move to a tidy list in a free corner: then the drawing
  // keeps only the short name ("W_10", "M") and the list says "W_10 = 98.1 N".
  // That happens for every value when the picture is crowded (several labels
  // had to move well away) or the scene asks for it (listValues), and for a
  // curved moment arrow or a moment arm whose label ran into something (e.g. a dimension).
  const valued = wanted.filter((l) => (l.fromArrow || l.listable) && l.text.includes(" = "));
  // "Struggled" = had to move ~45 px or more, or still overlaps something.
  const struggled = placed.filter((l) => l.fromArrow && l.cost > 45);
  const crowded = struggled.length >= 2 || struggled.some((l) => l.cost > 150);
  const moved = (crowded || listAll) && valued.length > 1
    ? valued
    : valued.filter((l) => (l.moment || l.listable) && placed[wanted.indexOf(l)].cost > 45);
  if (moved.length) {
    // (It keeps off the spots the other labels want: their first choices.)
    const avoid = wanted.map((l) => {
      const text = moved.includes(l) ? l.text.split(" = ")[0] : l.text; // (a moved one keeps just its name)
      return labelBox(l.pos[0], l.pos[1], measureLabel(ctx, text, l.size, l.weight), l.size, l.align, l.tight);
    });
    const legend = placeLegend(ctx, moved.map((l) => ({ text: l.text, color: l.color })), { ...layout, obstacles: [...obstacles], avoid });
    // A shortened name may move a little further to find a clear spot.
    const shortened = wanted.map((l) => (moved.includes(l) ? { ...l, text: l.text.split(" = ")[0], maxMove: l.maxMove == null ? undefined : Math.max(l.maxMove, 40) } : l));
    placed = placeLabels(ctx, shortened, { ...layout, obstacles: [...obstacles, legend.box] });
    drawLegend(ctx, legend, env);
    obstacles.push(legend.box);
  }

  // Labels are drawn as plain text, with no box behind them: a box never quite
  // matches the picture's shaded background, and the placement above already
  // keeps labels clear of lines and arrows.
  for (const l of placed) {
    // A faint line (a dimension, a line of action) running under a label
    // breaks around it: clear the label's patch so the picture's own background
    // shows through — but only where nothing else would be wiped out.
    if (l.box && breaksLine(l.box, segments, obstacles)) ctx.clearRect(l.box.x0, l.box.y0 + 2, l.box.x1 - l.box.x0, l.box.y1 - l.box.y0 - 3);
    drawLabel(ctx, l.text, l.pos[0], l.pos[1], { color: l.color, size: l.size, weight: l.weight, align: l.align });
  }

  // What the picture holds, checked against the object-boundaries rule.
  const report = { labels: placed.map((l) => ({ text: l.text, box: l.box, breaks: !!l.breaks, clear: l.clear })), obstacles, segments, view: cv.view };
  report.clashes = findClashes(report);
  if (showBounds()) drawBounds(ctx, report);
  cv.lastReport = report;
  return report;
}

// Close spots all round a point (pixels), nearest-looking first: below,
// below-right, below-left, right, left, above-right, above-left, above.
// Each is just outside the point's marker (r: its radius, stroke included) by a
// letter's small gap, LETTER_CLEAR, measured to the letter's tight box (labelBox):
// 0.45 × 14 px above the letter's middle, `drop` × 14 px below it.
const DOT_R = 5.6, RING_R = 7.1; // (a dot: 4.5 px + half its 2.2 px outline; a ring: 6 px + …)
function aroundPoint(x, y, r = DOT_R, drop = 0.42) {
  const g = r + LETTER_CLEAR + 0.3, up = 0.45 * 14, down = drop * 14, side = g + 1.5;
  return [[x, y + g + up, "center"], [x + side, y + 0.8 * r, "left"], [x - side, y + 0.8 * r, "right"], [x + side, y, "left"],
    [x - side, y, "right"], [x + side, y - 0.8 * r, "left"], [x - side, y - 0.8 * r, "right"], [x, y - g - down, "center"]];
}

// Does a label's box sit on a faint line (and on nothing else that clearing it would erase)?
function breaksLine(box, segments, obstacles) {
  let faint = false;
  for (const [p, q, kind] of segments) {
    if (!segmentHits(box, p, q)) continue;
    if (kind === true || kind === "dim") faint = true;
    else return false; // an arrow, a cable, the body …
  }
  return faint && !obstacles.some((t) => overlapArea(box, t) > 4);
}

// An arrow that ENDS on a beam's centre line stops at the beam's surface
// instead, so a push reads as pushing ON the beam, not into it; one that STARTS
// there (a pull) starts at the surface. A push is marked `onBody`, so its label
// goes at its outer end. Shapes that set headGap themselves are left alone.
// A known force whose arrow runs through a distributed load's area (a point load P
// on top of w) is drawn in a slightly different shade (role "knownOver"), so it
// reads as a separate force and not as one of the load's arrows.
function apartFromLoads(shapes) {
  const areas = shapes.filter((s) => s.type === "distload" && s.profile && s.profile.length > 1).map((s) => {
    const xs = s.profile.map((p) => p[0]), ys = s.profile.map((p) => p[1]);
    return { x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(s.base, ...ys), y1: Math.max(s.base, ...ys) };
  });
  if (!areas.length) return shapes;
  const through = (s) => areas.some((a) => {
    for (let i = 0; i <= 10; i++) {
      const x = s.from[0] + ((s.to[0] - s.from[0]) * i) / 10, y = s.from[1] + ((s.to[1] - s.from[1]) * i) / 10;
      if (x > a.x0 + 1e-6 && x < a.x1 - 1e-6 && y > a.y0 + 1e-6 && y < a.y1 - 1e-6) return true;
    }
    return false;
  });
  return shapes.map((s) => (s.type === "arrow" && (s.role || "known") === "known" && through(s) ? { ...s, role: "knownOver" } : s));
}

function touchBeams(shapes) {
  const beams = shapes.filter((s) => s.type === "beam");
  // Plates (boxes drawn under everything) are bodies too: an arrow whose head
  // is on a plate pushes on it.
  const plates = shapes.filter((s) => s.type === "box" && s.passable);
  const onPlate = (P) => plates.some((b) => Math.abs(P[0] - b.at[0]) <= b.w / 2 + 1e-6 && Math.abs(P[1] - b.at[1]) <= b.h / 2 + 1e-6);
  if (!beams.length && !plates.length) return shapes;
  return shapes.map((s) => {
    // A distributed load on a beam floats exactly the beam's half-thickness above its
    // centre line: its arrowheads touch the beam's top surface without entering it.
    if (s.type === "distload" && s.gapPx == null) {
      const xm = (s.profile[0][0] + s.profile[s.profile.length - 1][0]) / 2;
      const b = beams.find((q) => { const d = beamDirAt(q.points, [xm, s.base]); return d && Math.abs(d[1]) < 1e-9; });
      return b ? { ...s, gapPx: ((b.width || 12) + 3) / 2 } : s;
    }
    if (s.type !== "arrow" || s.headGap != null) return s;
    if (onPlate(s.to) && !onPlate(s.from)) return { ...s, onBody: true };
    const dir = [s.to[0] - s.from[0], s.to[1] - s.from[1]];
    const gapAt = (P) => {
      for (const b of beams) {
        const d = beamDirAt(b.points, P);
        if (d) return surfaceGap(dir, d, ((b.width || 12) + 3) / 2); // beams are drawn width + 3 px thick
      }
      return 0;
    };
    const headGap = gapAt(s.to);
    if (headGap) return { ...s, headGap, onBody: true };
    // An arrow that STARTS on a beam's centre line (a pull) starts at its surface
    // instead: no arrow runs inside a body.
    const tailGap = s.tailGap == null ? gapAt(s.from) : 0;
    return tailGap ? { ...s, tailGap } : s;
  });
}

// The corner list of values: a light box with one coloured line per force.
function drawLegend(ctx, legend, env) {
  const { box, lines, size } = legend;
  ctx.save();
  ctx.fillStyle = env.paper;
  ctx.globalAlpha = 0.92;
  ctx.fillRect(box.x0, box.y0, box.x1 - box.x0, box.y1 - box.y0);
  ctx.globalAlpha = 1;
  ctx.strokeStyle = env.faint;
  ctx.lineWidth = 1;
  ctx.strokeRect(box.x0 + 0.5, box.y0 + 0.5, box.x1 - box.x0 - 1, box.y1 - box.y0 - 1);
  ctx.restore();
  for (const l of lines) drawLabel(ctx, l.text, l.x, l.y, { color: l.color, size, align: "left" });
}

// Two curved moment arrows close together would overlap (and leave their
// labels nowhere to go): each shrinks to under half the distance between
// their centres, down to 18 px. (A moment's usual size is 34 px; see shapes-extra.js.)
function separateMoments(shapes, cv) {
  const moments = shapes.filter((s) => s.type === "moment");
  if (moments.length < 2) return shapes;
  const radius = new Map();
  for (const m of moments) {
    const [x, y] = cv.toScreen(m.center);
    let r = m.rPx || 34;
    for (const o of moments) {
      if (o === m) continue;
      const [ox, oy] = cv.toScreen(o.center);
      const d = Math.hypot(ox - x, oy - y);
      if (d > 1) r = Math.min(r, Math.max(18, d / 2 - 6)); // (the same centre: a concentric pair is fine)
    }
    radius.set(m, r);
  }
  return shapes.map((s) => (radius.has(s) && radius.get(s) !== (s.rPx || 34) ? { ...s, rPx: radius.get(s) } : s));
}
