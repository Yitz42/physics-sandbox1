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
  return out;
}
const shift = shiftShape;

// How far spreadPanels slides each group (metres): { dxL, dxR } — so a tool that
// places things on one of the diagrams (the FBD's drawing tool) can follow it.
export function panelShift({ divider, left, right, y, margin = 0.8, size }) {
  if (!size) return { dxL: 0, dxR: 0 };
  const { width: w, height: h } = size;
  const widest = Math.max(left[1] - left[0], right[1] - right[0]) + 2 * margin;
  const s = Math.min((h - 2 * PAD) / (y[1] - y[0] + 2 * margin), (w / 2 - PAD) / widest);
  const quarter = w / 4 / s;
  return { dxL: divider - quarter - (left[0] + left[1]) / 2, dxR: divider + quarter - (right[0] + right[1]) / 2 };
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
export function spreadPanels(shapes, { divider, left, right, y, margin = 0.8, size }) {
  const yc = (y[0] + y[1]) / 2;
  if (!size) {
    const frame = { xmin: left[0] - margin, xmax: right[1] + margin, ymin: y[0] - margin, ymax: y[1] + margin };
    return [...shapes, { type: "divider", x: divider, frame }];
  }
  const { width: w, height: h } = size;
  const widest = Math.max(left[1] - left[0], right[1] - right[0]) + 2 * margin;
  // Metres → pixels: as big as possible while the picture fits the canvas
  // height and each group (with its margin) fits in half the width.
  const s = Math.min((h - 2 * PAD) / (y[1] - y[0] + 2 * margin), (w / 2 - PAD) / widest);
  const quarter = w / 4 / s; // metres from the divider to the centre of each half
  const dxL = divider - quarter - (left[0] + left[1]) / 2;
  const dxR = divider + quarter - (right[0] + right[1]) / 2;
  const moved = shapes.map((sh) => {
    const x = anchorX(sh);
    return x == null ? sh : shift(sh, x < divider ? dxL : dxR);
  });
  // The frame is exactly as wide as the canvas (inside its border) at scale s,
  // so the divider lands in the middle and each group at its quarter point.
  const halfW = (w / 2 - PAD) / s, halfH = (h / 2 - PAD) / s;
  const frame = { xmin: divider - halfW, xmax: divider + halfW, ymin: yc - halfH, ymax: yc + halfH };
  return [...moved, { type: "divider", x: divider, frame }];
}
