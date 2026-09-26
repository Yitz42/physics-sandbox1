// diagrams.js — draws a "scene": a list of simple shapes in metres.
//
// Subjects describe WHAT to draw (see e.g. subjects/statics/particle-scene.js);
// this file decides HOW it looks. Shape types:
//   arrow    { id, from, to, label, role }   role: known | unknown | resultant |
//                                            component | target | wrong | student
//   line     { id?, from, to, style }        style: cable | reference | dashed
//   support  { from, to, normal }            hatched ground/ceiling/wall
//   point    { at, label, style }            style: ring | dot | pin
//   box      { id?, at, w, h, label }        a crate or block (at = centre)
//   arc      { center, r, start, end, label }  angle marking (degrees, CCW from +x)
//   triangle { at, dx, dy, labels }          slope triangle, e.g. 3-4-5
//   zone     { from, to, label }             a shaded "not allowed" area
//   text     { at, text }                    a caption
//   axes     { at }                          little x-y axes
//   handle   { at }                          a grab circle on a draggable arrow tip

import { drawArrow, drawLabel, labelPosition, cssColor } from "./arrows.js";

const ROLE_COLORS = {
  known: ["--c-force", "#1f5fbf"],
  unknown: ["--c-unknown", "#c2410c"],
  resultant: ["--c-resultant", "#7c3aed"],
  component: ["--c-component", "#64748b"],
  target: ["--c-target", "#16a34a"],
  wrong: ["--c-wrong", "#dc2626"],
  student: ["--c-student", "#0f766e"],
};

export function roleColor(role) {
  const [v, f] = ROLE_COLORS[role] || ROLE_COLORS.known;
  return cssColor(v, f);
}

// opts.highlight: id of the force to glow (clicked arrow or equation term)
export function drawScene(cv, shapes, opts = {}) {
  const { ctx } = cv;
  const S = cv.toScreen;
  const ink = cssColor("--c-ink", "#1d2330");
  const faint = cssColor("--c-faint", "#94a3b8");
  const paper = cssColor("--c-canvas", "#ffffff");
  cv.clear();

  // Draw in layers so arrows and labels sit on top of lines and boxes.
  const order = ["zone", "support", "line", "box", "arc", "triangle", "axes", "point", "arrow", "handle", "text"];
  const sorted = [...shapes].sort((a, b) => order.indexOf(a.type) - order.indexOf(b.type));
  const labels = []; // arrow labels drawn last so nothing covers them

  for (const s of sorted) {
    const lit = opts.highlight && s.id === opts.highlight;
    ctx.save();
    switch (s.type) {
      case "arrow": {
        const color = roleColor(s.role);
        const a = S(s.from), b = S(s.to);
        drawArrow(ctx, a, b, {
          color, glow: lit,
          width: s.role === "component" ? 1.8 : 2.8,
          dashed: s.role === "component" || s.role === "target" || s.role === "resultant",
          alpha: s.alpha ?? (s.role === "target" ? 0.7 : 1),
        });
        // Components and targets get their labels beside their middle, so they
        // don't collide with the label of an arrow ending at the same tip.
        const mid = s.role === "component" || s.role === "target";
        const side = s.labelSide || (s.role === "target" ? -1 : 1);
        if (s.label) labels.push({ text: s.label, ...labelPosition(a, b, 14, mid, side), color, lit });
        break;
      }
      case "line": {
        const a = S(s.from), b = S(s.to);
        ctx.strokeStyle = s.style === "cable" ? (lit ? roleColor("known") : ink) : faint;
        ctx.lineWidth = s.style === "cable" ? (lit ? 3.5 : 2) : 1.2;
        if (s.style !== "cable") ctx.setLineDash([5, 4]);
        ctx.beginPath();
        ctx.moveTo(a[0], a[1]);
        ctx.lineTo(b[0], b[1]);
        ctx.stroke();
        break;
      }
      case "support": {
        const a = S(s.from), b = S(s.to);
        // Hatch marks on the far side of the surface (opposite to `normal`).
        const n = [-s.normal[0], s.normal[1]]; // screen y is flipped
        ctx.strokeStyle = ink;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(a[0], a[1]);
        ctx.lineTo(b[0], b[1]);
        ctx.stroke();
        ctx.lineWidth = 1;
        const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
        for (let t = 0; t <= len; t += 9) {
          const x = a[0] + ((b[0] - a[0]) * t) / len, y = a[1] + ((b[1] - a[1]) * t) / len;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + n[0] * 9 + n[1] * 6, y + n[1] * 9 - n[0] * 6);
          ctx.stroke();
        }
        break;
      }
      case "point": {
        const [x, y] = S(s.at);
        ctx.fillStyle = s.style === "ring" ? paper : ink;
        ctx.strokeStyle = ink;
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.arc(x, y, s.style === "ring" ? 6 : 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        if (s.label) drawLabel(ctx, s.label, x - 12, y + 16, { color: ink, size: 14, align: "right", weight: 700 });
        break;
      }
      case "box": {
        const [x, y] = S(s.at);
        const w = s.w * cv.view.scale, h = s.h * cv.view.scale;
        ctx.fillStyle = cssColor("--c-crate", "#e9d5b0");
        ctx.strokeStyle = lit ? roleColor("known") : ink;
        ctx.lineWidth = lit ? 3 : 2;
        ctx.fillRect(x - w / 2, y - h / 2, w, h);
        ctx.strokeRect(x - w / 2, y - h / 2, w, h);
        if (s.label) drawLabel(ctx, s.label, x, y, { color: ink, size: 13 });
        break;
      }
      case "arc": {
        const [x, y] = S(s.center);
        const r = s.r * cv.view.scale;
        const a0 = s.start;
        const diff = ((s.end - a0 + 540) % 360) - 180; // shortest way round
        ctx.strokeStyle = faint;
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        // Canvas angles run clockwise (y down), so negate.
        ctx.arc(x, y, r, -a0 * Math.PI / 180, -(a0 + diff) * Math.PI / 180, diff > 0);
        ctx.stroke();
        const mid = (a0 + diff / 2) * Math.PI / 180;
        drawLabel(ctx, s.label, x + Math.cos(mid) * (r + 16), y - Math.sin(mid) * (r + 16), { color: ink, size: 12 });
        break;
      }
      case "triangle": {
        const p0 = S(s.at), p1 = S([s.at[0] + s.dx, s.at[1]]), p2 = S([s.at[0] + s.dx, s.at[1] + s.dy]);
        ctx.strokeStyle = faint;
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.moveTo(p0[0], p0[1]);
        ctx.lineTo(p1[0], p1[1]);
        ctx.lineTo(p2[0], p2[1]);
        ctx.stroke();
        const [lx, ly, lh] = s.labels;
        drawLabel(ctx, String(lx), (p0[0] + p1[0]) / 2, p1[1] + (s.dy > 0 ? 13 : -11), { color: ink, size: 12 });
        drawLabel(ctx, String(ly), p1[0] + (s.dx > 0 ? 10 : -10), (p1[1] + p2[1]) / 2, { color: ink, size: 12 });
        void lh; // hypotenuse lies along the arrow; its number is implied by the 3-4-5 shape
        break;
      }
      case "zone": {
        const a = S(s.from), b = S(s.to);
        ctx.fillStyle = cssColor("--c-wrong", "#dc2626");
        ctx.globalAlpha = 0.18;
        ctx.fillRect(Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1]) + 4);
        ctx.globalAlpha = 1;
        drawLabel(ctx, s.label, (a[0] + b[0]) / 2, Math.min(a[1], b[1]) - 20, { color: roleColor("wrong"), size: 12 });
        break;
      }
      case "text": {
        const [x, y] = S(s.at);
        drawLabel(ctx, s.text, x, y, { color: faint, size: 13, weight: 600 });
        break;
      }
      case "handle": {
        const [x, y] = S(s.at);
        ctx.strokeStyle = roleColor("known");
        ctx.fillStyle = paper;
        ctx.globalAlpha = 0.9;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        break;
      }
      case "axes": {
        const [x, y] = S(s.at);
        drawArrow(ctx, [x, y], [x + 34, y], { color: faint, width: 1.5 });
        drawArrow(ctx, [x, y], [x, y - 34], { color: faint, width: 1.5 });
        drawLabel(ctx, "x", x + 42, y, { color: faint, size: 12 });
        drawLabel(ctx, "y", x, y - 42, { color: faint, size: 12 });
        break;
      }
    }
    ctx.restore();
  }
  for (const l of labels) {
    drawLabel(ctx, l.text, l.pos[0], l.pos[1], { color: l.color, size: l.lit ? 15 : 14, background: paper, weight: l.lit ? 700 : 500, align: l.align });
  }
}
