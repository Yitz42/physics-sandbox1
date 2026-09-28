// force3d-ground.js — sizing the ground (the x-y plane) under a 3D picture: what the canvas
// shows round the picture's frame, and the biggest ground patch that fits in it. Split from
// force3d-scene.js to keep it small.

// What the canvas shows round a frame (workspace.js fits the frame inside a 36 px border,
// centred): its whole box, less a 10 px cushion — in picture metres. Null without a canvas.
const PAD = 36;
export function visibleBox(f, size) {
  if (!size) return null;
  const s = Math.min((size.width - 2 * PAD) / (f.xmax - f.xmin), (size.height - 2 * PAD) / (f.ymax - f.ymin));
  const cx = (f.xmin + f.xmax) / 2, cy = (f.ymin + f.ymax) / 2, hw = size.width / 2 / s - 10 / s, hh = size.height / 2 / s - 10 / s;
  return { xmin: cx - hw, xmax: cx + hw, ymin: cy - hh, ymax: cy + hh };
}

// The biggest ground patch round (cx, cy) whose corners, as drawn, are inside the box:
// its half-widths along x and along y grow in turn (each by 5%) while it still fits, up
// to g's size. [x0, x1, y0, y1].
export function fitGround(g, at, box, cushion, [cx, cy]) {
  const inside = (hx, hy) => [[-1, -1], [1, -1], [1, 1], [-1, 1]].every(([a, b]) => {
    const q = at([cx + a * hx, cy + b * hy, 0]);
    return q[0] >= box.xmin + cushion && q[0] <= box.xmax - cushion && q[1] >= box.ymin + cushion && q[1] <= box.ymax - cushion;
  });
  const maxX = (g[1] - g[0]) / 2, maxY = (g[3] - g[2]) / 2;
  let hx = 0.02 * maxX, hy = 0.02 * maxY;
  for (let grew = true, n = 0; grew && n < 400; n++) {
    grew = false;
    if (hx * 1.05 <= maxX && inside(hx * 1.05, hy)) { hx *= 1.05; grew = true; }
    if (hy * 1.05 <= maxY && inside(hx, hy * 1.05)) { hy *= 1.05; grew = true; }
  }
  return [cx - hx, cx + hx, cy - hy, cy + hy];
}
