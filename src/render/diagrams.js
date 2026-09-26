// diagrams.js — draws a "scene": a list of simple shapes in metres.
//
// Subjects describe WHAT to draw (see e.g. subjects/statics/particle-scene.js);
// render/shapes.js decides HOW each shape looks. Shape types:
//   arrow    { id, from, to, label, role, headGap?, tailGap? }   role: known | unknown | resultant |
//                                            component | target | wrong | student | shadow
//   line     { id?, from, to, style }        style: cable | reference | dashed
//   support  { from, to, normal }            hatched ground/ceiling/wall
//   point    { at, label, style }            style: ring | dot | pin
//   box      { id?, at, w, h, label, passable? } a crate or block (at = centre); passable: labels avoid it but may cover it
//   (any shape may set `layer: "<type>"` to be drawn in that type's layer instead of its own)
//   arc      { center, r, start, end, label }  angle marking (degrees, CCW from +x)
//   triangle { at, dx, dy, labels }          slope triangle, e.g. 3-4-5
//   zone     { from, to, label }             a shaded "not allowed" area
//   text     { at, text }                    a caption
//   axes     {}                              little x-y axes (bottom-left corner)
//   handle   { at }                          a grab circle on a draggable arrow tip
//   beam, pivot, dim, rightangle, moment     see shapes-extra.js
//   distload, wheel                          see loads.js
//   supportSymbol                            pin, roller, fixed … see supports.js
//   wrench, trailer                          see hardware.js
//   note     { lines: [text | {text, role}] } a small key/working box in a free corner
//   listValues {}                            put every force's value in the corner list
//   divider  { x, frame? }                   soft grey vertical line between two diagrams (frame: the
//                                            exact view to show; see panels.js);
//                                            every label stays on its own side of it
//
// Arrow labels are placed last, each moved to a free spot if its first
// choice would overlap something (see labels.js).

import { labelPosition, drawLabel, cssColor } from "./arrows.js";
import { drawShape, roleColor } from "./shapes.js";
import { placeLabels, placeLegend } from "./labels.js";
import { beamDirAt, surfaceGap } from "./fbd.js";

export { roleColor };

// Draw in layers so arrows and labels sit on top of lines and boxes.
const ORDER = ["divider", "zone", "support", "pivot", "wheel", "trailer", "beam", "wrench", "supportSymbol", "distload", "line", "dim", "rightangle", "box", "arc", "triangle", "axes", "motor", "moment", "point", "arrow", "handle", "text"];

// opts.highlight: id of the force to glow (clicked arrow or equation term)
export function drawScene(cv, shapes, opts = {}) {
  const { ctx } = cv;
  const env = { ink: cssColor("--c-ink", "#1d2330"), faint: cssColor("--c-faint", "#94a3b8"), paper: cssColor("--c-canvas", "#ffffff") };
  cv.clear();
  shapes = touchBeams(shapes);

  // A shape can ask to be drawn in another type's layer (e.g. a plate under everything: layer "zone").
  const rank = (s) => ORDER.indexOf(s.layer || s.type);
  const sorted = [...shapes].sort((a, b) => rank(a) - rank(b));
  const obstacles = [];
  const segments = [];
  const wanted = []; // arrow labels, placed after everything else is drawn

  const notes = []; // "note" shapes: small text boxes placed in a free corner
  let listAll = false; // a { type: "listValues" } shape: values go in the corner list
  for (const s of sorted) {
    if (s.type === "note") {
      notes.push(...s.lines);
      continue;
    }
    if (s.type === "listValues") {
      listAll = true; // the scene asks for every value in the corner list
      continue;
    }
    const lit = !!opts.highlight && s.id === opts.highlight;
    const out = drawShape(cv, s, { ...env, lit });
    obstacles.push(...out.boxes);
    segments.push(...out.segments);
    wanted.push(...out.labels);
    if (s.type === "point" && s.label) {
      const [x, y] = cv.toScreen(s.at);
      // Point names go first, so they get their preferred spot: just below the
      // point — and if a dimension line is there, further down, below it.
      wanted.unshift({ text: s.label, pos: [x, y + 20], align: "center", size: 14, weight: 700, color: env.ink, plain: true, prefer: "down" });
    }
    if (s.type === "arrow" && s.label) {
      const a = cv.toScreen(s.from), b = cv.toScreen(s.to);
      // Components and targets prefer the middle of their arrow. An arrow
      // pushing on a body (its head on the body) is labelled at its outer end;
      // any other arrow just past its tip, in line with it (below a downward
      // arrow). A resultant ending on a beam keeps its label at the tip, below
      // the beam and its dimension lines.
      const mid = s.role === "component" || s.role === "target";
      const side = s.labelSide || (s.role === "target" ? -1 : 1);
      const size = lit ? 15 : 14, weight = lit ? 700 : 500;
      const atTail = s.onBody && s.role !== "resultant" && !mid;
      const place = atTail ? labelPosition(b, a, 14) : labelPosition(a, b, 14, mid, side);
      const prefer = s.onBody && s.role === "resultant" ? "far-down" : undefined;
      wanted.push({ text: s.label, ...place, size, weight, color: roleColor(s.role), fromArrow: s.role !== "shadow", prefer });
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
  const cuts = shapes.filter((s) => s.type === "divider").map((s) => cv.toScreen([s.x, 0])[0]).sort((a, b) => a - b);
  for (const l of wanted) {
    l.minX = Math.max(0, ...cuts.filter((x) => x <= l.pos[0]).map((x) => x + 4));
    l.maxX = Math.min(cv.view.width, ...cuts.filter((x) => x > l.pos[0]).map((x) => x - 4));
  }
  let placed = placeLabels(ctx, wanted, layout);

  // Values that can move to a tidy list in a free corner: then the drawing
  // keeps only the short name ("W_10", "M") and the list says "W_10 = 98.1 N".
  // That happens for every value when the picture is crowded (several labels
  // had to move well away) or the scene asks for it (listValues), and for a
  // curved moment arrow whose label ran into something (e.g. a dimension).
  const valued = wanted.filter((l) => l.fromArrow && l.text.includes(" = "));
  // "Struggled" = had to move ~45 px or more, or still overlaps something.
  const struggled = placed.filter((l) => l.fromArrow && l.cost > 45);
  const crowded = struggled.length >= 2 || struggled.some((l) => l.cost > 150);
  const moved = (crowded || listAll) && valued.length > 1
    ? valued
    : valued.filter((l) => l.moment && placed[wanted.indexOf(l)].cost > 45);
  if (moved.length) {
    const legend = placeLegend(ctx, moved.map((l) => ({ text: l.text, color: l.color })), { ...layout, obstacles: [...obstacles] });
    // A shortened name may move a little further to find a clear spot.
    const shortened = wanted.map((l) => (moved.includes(l) ? { ...l, text: l.text.split(" = ")[0], maxMove: l.maxMove == null ? undefined : Math.max(l.maxMove, 40) } : l));
    placed = placeLabels(ctx, shortened, { ...layout, obstacles: [...obstacles, legend.box] });
    drawLegend(ctx, legend, env);
  }

  // Labels are drawn as plain text, with no box behind them: a box never quite
  // matches the picture's shaded background, and the placement above already
  // keeps labels clear of lines and arrows.
  for (const l of placed) {
    drawLabel(ctx, l.text, l.pos[0], l.pos[1], { color: l.color, size: l.size, weight: l.weight, align: l.align });
  }
}

// An arrow that ENDS on a beam's centre line stops at the beam's surface
// instead, so a push reads as pushing ON the beam, not into it. (An arrow
// that starts on a beam still starts exactly at its point.) Such an arrow is
// marked `onBody`, so its label goes at its outer end. Shapes that set
// headGap themselves are left alone.
function touchBeams(shapes) {
  const beams = shapes.filter((s) => s.type === "beam");
  // Plates (boxes drawn under everything) are bodies too: an arrow whose head
  // is on a plate pushes on it.
  const plates = shapes.filter((s) => s.type === "box" && s.passable);
  const onPlate = (P) => plates.some((b) => Math.abs(P[0] - b.at[0]) <= b.w / 2 + 1e-6 && Math.abs(P[1] - b.at[1]) <= b.h / 2 + 1e-6);
  if (!beams.length && !plates.length) return shapes;
  return shapes.map((s) => {
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
    return headGap ? { ...s, headGap, onBody: true } : s;
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
