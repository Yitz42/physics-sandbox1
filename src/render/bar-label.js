// bar-label.js — a value that belongs to a bar (a truss member's force, say),
// written ALONG the bar, just beside it, so it can only belong to that bar.
//
// Picture rule (agreed with the owner): the text runs parallel to its bar and
// always reads upright (never upside down), on the side the scene asks for
// (e.g. away from the middle of the truss), keeping the usual CLEAR gap from
// the bar's edge. If the bar is too short for the text, the text shrinks a
// little; if it still won't fit, we return null and the caller falls back to
// an ordinary (placed) label.

import { measureLabel, drawLabel } from "./arrows.js";
import { barBoxes, CLEAR } from "./labels.js";

// a, b: the bar's ends (pixels). thick: the bar's drawn thickness (pixels).
// side: [x, y] in pixels, roughly which way the text should sit (optional).
// Returns the boxes the text covers (for other labels to keep clear of), or null.
export function drawAlongBar(ctx, text, a, b, { thick = 9, side = null, color = "#222", size = 13, weight = 600 } = {}) {
  const dx = b[0] - a[0], dy = b[1] - a[1];
  const len = Math.hypot(dx, dy);
  if (len < 1) return null;
  // Shrink a little for a short bar; give up if even that doesn't fit
  // (the text must stay clear of the joints at both ends).
  let px = size, width = measureLabel(ctx, text, px, weight);
  while (width + 28 > len && px > 10) width = measureLabel(ctx, text, --px, weight);
  if (width + 28 > len) return null;

  // The text's angle: the bar's, turned half round if it would read upside down.
  let angle = Math.atan2(dy, dx);
  if (angle > Math.PI / 2) angle -= Math.PI;
  if (angle < -Math.PI / 2) angle += Math.PI;
  // Across the bar: the side asked for, else the upper side of the bar.
  let n = [-dy / len, dx / len];
  const want = side && Math.hypot(side[0], side[1]) > 1e-9 ? side : [0, -1];
  if (n[0] * want[0] + n[1] * want[1] < 0) n = [-n[0], -n[1]];
  // Centre of the text: half the bar + the clear gap + half the text's height.
  const off = thick / 2 + CLEAR + px * 0.6;
  const c = [(a[0] + b[0]) / 2 + n[0] * off, (a[1] + b[1]) / 2 + n[1] * off];

  ctx.save();
  ctx.translate(c[0], c[1]);
  ctx.rotate(angle);
  drawLabel(ctx, text, 0, 0, { color, size: px, weight, align: "center" });
  ctx.restore();

  // What it covers: a strip along the bar, as wide as the text is tall.
  const u = [Math.cos(angle), Math.sin(angle)], h = width / 2 + 3;
  return barBoxes([c[0] - u[0] * h, c[1] - u[1] * h], [c[0] + u[0] * h, c[1] + u[1] * h], px * 1.4);
}
