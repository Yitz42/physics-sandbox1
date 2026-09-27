// blocks.js — drawings for block diagrams and signal-flow graphs (controls):
//   tfblock      { at, w, h, label | fraction: [top, bottom], role? }  a block (box)
//                role "reduced": a block that replaced a group (drawn in purple)
//   sumjunction  { at, r, signs: [{ at, text }] }  a summing junction (circle with ×)
//   wire         { points, arrow? }       a signal line; arrow: arrowhead at the end
//   pickoff      { at }                   a pickoff point (dot)
//   signal       { at, text, align? }     a signal's name, e.g. R(s)
//   groupbox     { from, to, label }      dashed outline around a group (the next step)
//   sfgnode      { at, label, labelAt }   a signal-flow graph node
//   sfgbranch    { from, to, bend, label, role? }  a branch: a curved arrow, arrowhead in
//                the middle; bend = how far the middle bows out (sideways, in units)
//                role "on" (part of a highlighted path or loop) or "off" (faded)
// drawBlockShape returns { boxes, segments, labels } like the other shape files,
// or null for a shape type it doesn't know. Drawing only: no controls physics.

import { drawLabel } from "./arrows.js";

function arrowHead(ctx, tip, dir, size = 9) {
  const [ux, uy] = dir;
  ctx.beginPath();
  ctx.moveTo(tip[0], tip[1]);
  ctx.lineTo(tip[0] - ux * size - uy * size * 0.45, tip[1] - uy * size + ux * size * 0.45);
  ctx.lineTo(tip[0] - ux * size + uy * size * 0.45, tip[1] - uy * size - ux * size * 0.45);
  ctx.closePath();
  ctx.fill();
}

const unitVec = (a, b) => {
  const dx = b[0] - a[0], dy = b[1] - a[1], m = Math.hypot(dx, dy) || 1;
  return [dx / m, dy / m];
};

export function drawBlockShape(cv, s, env, roleColor) {
  const { ctx } = cv;
  const S = cv.toScreen;
  const { ink, paper, faint } = env;
  const purple = roleColor("resultant");
  const out = { boxes: [], segments: [], labels: [] };
  ctx.save();
  try {
    switch (s.type) {
      case "tfblock": {
        const [x, y] = S(s.at);
        const w = s.w * cv.view.scale, h = s.h * cv.view.scale;
        const color = s.role === "reduced" ? purple : env.lit ? roleColor("known") : ink;
        ctx.fillStyle = paper;
        ctx.strokeStyle = color;
        ctx.lineWidth = s.role === "reduced" ? 2.6 : 2;
        ctx.beginPath();
        ctx.rect(x - w / 2, y - h / 2, w, h);
        ctx.fill();
        ctx.stroke();
        if (s.fraction) {
          const [top, bottom] = s.fraction;
          ctx.font = "15px system-ui, sans-serif";
          const lw = Math.max(ctx.measureText(top).width, ctx.measureText(bottom).width) + 8;
          drawLabel(ctx, top, x, y - 10, { color, size: 15 });
          drawLabel(ctx, bottom, x, y + 12, { color, size: 15 });
          ctx.strokeStyle = color;
          ctx.lineWidth = 1.3;
          ctx.beginPath();
          ctx.moveTo(x - lw / 2, y);
          ctx.lineTo(x + lw / 2, y);
          ctx.stroke();
        } else {
          drawLabel(ctx, s.label, x, y - 2, { color, size: 17, weight: 600 });
        }
        out.boxes.push({ x0: x - w / 2, y0: y - h / 2, x1: x + w / 2, y1: y + h / 2, heavy: true });
        return out;
      }
      case "sumjunction": {
        const [x, y] = S(s.at);
        const r = s.r * cv.view.scale;
        ctx.fillStyle = paper;
        ctx.strokeStyle = ink;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        const d = r * Math.SQRT1_2;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(x - d, y - d);
        ctx.lineTo(x + d, y + d);
        ctx.moveTo(x - d, y + d);
        ctx.lineTo(x + d, y - d);
        ctx.stroke();
        for (const m of s.signs || []) {
          const [sx, sy] = S(m.at);
          drawLabel(ctx, m.text, sx, sy, { color: ink, size: 16, weight: 700 });
        }
        out.boxes.push({ x0: x - r, y0: y - r, x1: x + r, y1: y + r, heavy: true });
        return out;
      }
      case "wire": {
        const pts = s.points.map(S);
        ctx.strokeStyle = ink;
        ctx.fillStyle = ink;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
        ctx.stroke();
        if (s.arrow && pts.length > 1) arrowHead(ctx, pts[pts.length - 1], unitVec(pts[pts.length - 2], pts[pts.length - 1]));
        for (let i = 1; i < pts.length; i++) out.segments.push([pts[i - 1], pts[i]]);
        return out;
      }
      case "pickoff": {
        const [x, y] = S(s.at);
        ctx.fillStyle = ink;
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
        return out;
      }
      case "signal": {
        const [x, y] = S(s.at);
        out.boxes.push(drawLabel(ctx, s.text, x, y, { color: ink, size: 15, align: s.align || "center" }));
        return out;
      }
      case "groupbox": {
        const a = S(s.from), b = S(s.to);
        const x0 = Math.min(a[0], b[0]), y0 = Math.min(a[1], b[1]);
        const w = Math.abs(b[0] - a[0]), h = Math.abs(b[1] - a[1]);
        ctx.strokeStyle = purple;
        ctx.lineWidth = 1.8;
        ctx.setLineDash([6, 4]);
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(x0, y0, w, h, 10);
        else ctx.rect(x0, y0, w, h);
        ctx.stroke();
        ctx.setLineDash([]);
        if (s.label) out.boxes.push(drawLabel(ctx, s.label, x0 + 6, y0 - 10, { color: purple, size: 13, weight: 600, align: "left" }));
        return out;
      }
      case "sfgnode": {
        const [x, y] = S(s.at);
        ctx.fillStyle = s.role === "on" ? purple : ink;
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fill();
        if (s.label) {
          const off = s.labelAt || [0, -0.35];
          const [lx, ly] = S([s.at[0] + off[0], s.at[1] + off[1]]);
          out.boxes.push(drawLabel(ctx, s.label, lx, ly, { color: ink, size: 15 }));
        }
        out.boxes.push({ x0: x - 6, y0: y - 6, x1: x + 6, y1: y + 6, heavy: true });
        return out;
      }
      case "sfgbranch": {
        // A quadratic curve bowing out by `bend` (to the left of from→to).
        const a = s.from, b = s.to;
        const mid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
        const u = unitVec(a, b);
        const n = [-u[1], u[0]];
        const bend = s.bend || 0;
        const ctrl = [mid[0] + n[0] * bend * 2, mid[1] + n[1] * bend * 2]; // a quadratic's middle is halfway to its control point
        const peak = [mid[0] + n[0] * bend, mid[1] + n[1] * bend];
        const [A, C, B] = [S(a), S(ctrl), S(b)];
        const color = s.role === "on" ? purple : s.role === "off" ? faint : ink;
        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.lineWidth = s.role === "on" ? 3 : 1.8;
        ctx.globalAlpha = s.role === "off" ? 0.55 : 1;
        ctx.beginPath();
        ctx.moveTo(A[0], A[1]);
        ctx.quadraticCurveTo(C[0], C[1], B[0], B[1]);
        ctx.stroke();
        // Arrowhead at the middle of the curve, along its direction there.
        const P = S(peak);
        arrowHead(ctx, [P[0] + (B[0] - A[0]) * 0.04, P[1] + (B[1] - A[1]) * 0.04], unitVec(A, B), 10);
        ctx.globalAlpha = 1;
        if (s.label) {
          const side = bend >= 0 ? 1 : -1;
          const lp = S([peak[0] + n[0] * 0.28 * side, peak[1] + n[1] * 0.28 * side]);
          out.boxes.push(drawLabel(ctx, s.label, lp[0], lp[1], { color: s.role === "on" ? purple : ink, size: 15, background: paper }));
        }
        out.segments.push([A, P], [P, B]);
        return out;
      }
      default:
        return null;
    }
  } finally {
    ctx.restore();
  }
}

