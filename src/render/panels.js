// panels.js — two diagrams side by side, each centred in its half of the canvas.
//
// Scenes like "space diagram | FBD" or "a couple | its replacement" are drawn
// as two groups of shapes with a soft divider line between them. Centring each
// group in its half of what the student sees depends on the canvas size (the
// canvas has a fixed pixel border, and is often wider than the drawing), so
// the scene can't do it in metres alone. This helper does it: given the
// canvas size, it slides each group sideways so that
//   • the divider sits in the middle of the canvas,
//   • the left group's centre is a quarter of the way across,
//   • the right group's centre is three quarters of the way across,
// and it gives the view-fitting the exact frame to show, so the scale matches.
//
// Without a canvas size (e.g. in the tests) nothing moves.

const PAD = 36; // the canvas's pixel border (see canvas.js)

// Where a shape "is", to decide which group it belongs to.
function anchorX(s) {
  const p = s.at || s.from || s.center || (s.points && s.points[0]) || (s.profile && s.profile[0]);
  return p ? p[0] : null;
}

// A shape moved sideways by dx metres: every point it's drawn from (a distributed
// load's outline and its labels, a support's far anchor, too).
export function shiftShape(s, dx) {
  const move = (p) => (p ? [p[0] + dx, p[1]] : p);
  const out = { ...s };
  for (const k of ["at", "from", "to", "center", "anchor", "labelAt"]) if (s[k]) out[k] = move(s[k]);
  if (s.points) out.points = s.points.map(move);
  if (s.profile) out.profile = s.profile.map(move);
  if (s.splits) out.splits = s.splits.map(([p, q]) => [move(p), move(q)]);
  if (Array.isArray(s.labels)) out.labels = s.labels.map((l) => (l && typeof l === "object" && l.at ? { ...l, at: move(l.at) } : l)); // (a load's labels; a triangle's are just text)
  if (s.text && typeof s.text === "object" && s.text.at) out.text = { ...s.text, at: move(s.text.at) }; // (a caption inside a beam)
  if (s.clip) out.clip = clipThrough(s.clip, move); // (a ladder cut flush at a wall)
  return out;
}
const shift = shiftShape;

// A clip region ({ xmin?, xmax?, ymin?, ymax? }) through a point map.
function clipThrough(c, map) {
  const lo = map([c.xmin ?? 0, c.ymin ?? 0]), hi = map([c.xmax ?? 0, c.ymax ?? 0]);
  const out = {};
  if (c.xmin != null) out.xmin = lo[0];
  if (c.ymin != null) out.ymin = lo[1];
  if (c.xmax != null) out.xmax = hi[0];
  if (c.ymax != null) out.ymax = hi[1];
  return out;
}

// A shape moved AND scaled: every point through `map` (metres → metres), and its
// sizes in metres (a box's w and h, an arc's radius, a load's baseline height) by f.
// Sizes in pixels (line widths, a moment's rPx, labels) stay as they are.
export function transformShape(s, map, f) {
  const out = { ...s };
  for (const k of ["at", "from", "to", "center", "anchor", "labelAt"]) if (s[k]) out[k] = map(s[k]);
  if (s.points) out.points = s.points.map(map);
  if (s.profile) out.profile = s.profile.map(map);
  if (s.splits) out.splits = s.splits.map(([p, q]) => [map(p), map(q)]);
  if (Array.isArray(s.labels)) out.labels = s.labels.map((l) => (l && typeof l === "object" && l.at ? { ...l, at: map(l.at) } : l));
  if (s.text && typeof s.text === "object" && s.text.at) out.text = { ...s.text, at: map(s.text.at) };
  if (typeof s.base === "number") out.base = map([0, s.base])[1];
  if (s.clip) out.clip = clipThrough(s.clip, map);
  for (const k of ["w", "h", "r"]) if (typeof s[k] === "number") out[k] = s[k] * f;
  return out;
}

// The right-hand diagram (an FBD) may get its own size (opts.rightY: its own
// [ymin, ymax]): it is scaled up (or down) to fill its half of the canvas, above
// the captions' row, instead of sharing the left diagram's scale. Captions
// (shapes with caption: true) stay on one row, under both diagrams.
// Returns { dxL, map, f, s, quarter }: the left group's slide, the right group's
// point map and scale factor, the metres → pixels scale and the quarter width.
function layout({ divider, left, right, y, margin, size, rightY, capTop, maxScale = 2.2 }) {
  const { width: w, height: h } = size;
  const cxR = (right[0] + right[1]) / 2;
  if (!rightY) {
    const widest = Math.max(left[1] - left[0], right[1] - right[0]) + 2 * margin;
    const s = Math.min((h - 2 * PAD) / (y[1] - y[0] + 2 * margin), (w / 2 - PAD) / widest);
    const quarter = w / 4 / s;
    const dxR = divider + quarter - cxR;
    return { s, quarter, f: 1, dxL: divider - quarter - (left[0] + left[1]) / 2, map: (p) => [p[0] + dxR, p[1]] };
  }
  const s = Math.min((h - 2 * PAD) / (y[1] - y[0] + 2 * margin), (w / 2 - PAD) / (left[1] - left[0] + 2 * margin));
  const quarter = w / 4 / s;
  const yc = (y[0] + y[1]) / 2, halfH = (h / 2 - PAD) / s, halfW = (w / 2 - PAD) / s;
  // The band the FBD may fill: from just above the captions to the top of the frame.
  const bottom = capTop ?? y[0], top = yc + halfH;
  // (Its half of the frame is halfW wide: from the divider to the edge.)
  const f = Math.min(maxScale, (top - bottom) / (rightY[1] - rightY[0] + 2 * margin), halfW / (right[1] - right[0] + 2 * margin));
  const cyR = (rightY[0] + rightY[1]) / 2, mid = (bottom + top) / 2;
  const x0 = divider + quarter;
  return { s, quarter, f, dxL: divider - quarter - (left[0] + left[1]) / 2, map: (p) => [x0 + (p[0] - cxR) * f, mid + (p[1] - cyR) * f] };
}

// Where spreadPanels puts the right-hand diagram: { map, f } — map takes a point of
// the diagram as the scene built it to where it's drawn, f is its scale factor — so a
// tool that places things on it (the FBD's drawing tool) can follow it.
export function panelTransform(opts) {
  if (!opts.size) return { map: (p) => p, f: 1, dxL: 0 };
  return layout({ margin: 0.8, ...opts });
}

// shapes:  the scene, in metres, before spreading
// divider: x of the line between the two groups (shapes left of it are the left group)
// left, right: [xmin, xmax] of each group's drawing — keep these the same on
//          every redraw (e.g. from the geometry, not from arrows whose length
//          changes), so the picture doesn't shift when an answer is revealed
// y:       [ymin, ymax] of the whole picture
// margin:  clear space (metres) around each group and above/below the picture
// size:    { width, height } of the canvas in pixels, or null
// Returns the shapes plus the divider line. The divider carries `frame`: the
// exact region the view must show (workspace.js fits the canvas to it).
export function spreadPanels(shapes, { divider, left, right, y, margin = 0.8, size, rightY = null, capTop = null }) {
  const yc = (y[0] + y[1]) / 2;
  if (!size) {
    const frame = { xmin: left[0] - margin, xmax: right[1] + margin, ymin: y[0] - margin, ymax: y[1] + margin };
    return [...shapes, { type: "divider", x: divider, frame }];
  }
  const { width: w, height: h } = size;
  // Metres → pixels: as big as possible while the picture fits the canvas
  // height and each group (with its margin) fits in half the width.
  const L = layout({ divider, left, right, y, margin, size, rightY, capTop });
  // (A shape may say which diagram it belongs to — panel: "left" | "right" — e.g. an
  // FBD arrow whose tail reaches back past the divider; otherwise, where it starts.)
  const moved = shapes.map((sh) => {
    const x = anchorX(sh);
    if (x == null) return sh;
    const left = sh.panel ? sh.panel === "left" : x < divider;
    if (left) return shift(sh, L.dxL);
    // A caption under the right diagram stays on the captions' row.
    if (sh.caption) return { ...sh, at: [L.map(sh.at)[0], sh.at[1]] };
    return rightY ? transformShape(sh, L.map, L.f) : shift(sh, L.map([0, 0])[0]);
  });
  // The frame is exactly as wide as the canvas (inside its border) at scale s,
  // so the divider lands in the middle and each group at its quarter point.
  const halfW = (w / 2 - PAD) / L.s, halfH = (h / 2 - PAD) / L.s;
  const frame = { xmin: divider - halfW, xmax: divider + halfW, ymin: yc - halfH, ymax: yc + halfH };
  return [...moved, { type: "divider", x: divider, frame }];
}
