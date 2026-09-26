// shapes-extra.js — shapes added for moments and rigid bodies (Unit 3 on):
//   beam       { points, width? }              a bar, bracket or plank (polyline, metres)
//   pivot      { at }                          triangle support under a pin (seesaw)
//   dim        { from, to, label, role?, labelSide?, labelOn? }  a dimension / moment-arm
//              line with end ticks; labelOn puts the label in a break in the middle of the line
//   rightangle { at, u, v }                    small square marking a 90° corner
//   moment     { center, rPx, maxR?, sense, label, role, labelMove?, alpha? } curved arrow: sense +1 CCW, −1 CW;
//              rPx its radius in pixels, maxR a largest radius in metres (to fit on a plate)
// Like shapes.js, each returns { boxes, segments, labels } for label placement.
// Pictures of real objects (motor, lamp, eyebolt, bracket) are in objects.js;
// distributed loads and wheels in loads.js; support symbols in supports.js;
// a wrench and a trailer in hardware.js.

import { drawLabel, measureLabel } from "./arrows.js";
import { drawObject } from "./objects.js";
import { drawLoadShape } from "./loads.js";
import { drawSupportSymbol } from "./supports.js";
import { drawHardware } from "./hardware.js";

export function drawExtraShape(cv, s, env, roleColor) {
  const { ctx } = cv;
  const S = cv.toScreen;
  const { ink, faint, paper } = env;
  const out = { boxes: [], segments: [], labels: [] };
  switch (s.type) {
    case "beam": {
      const pts = s.points.map(S);
      const trace = () => {
        ctx.beginPath();
        pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
      };
      const w = s.width || 12;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = ink;
      ctx.lineWidth = w + 3;
      trace();
      ctx.stroke();
      ctx.strokeStyle = env.crate;
      ctx.lineWidth = w;
      trace();
      ctx.stroke();
      for (let i = 1; i < pts.length; i++) out.segments.push([pts[i - 1], pts[i]]);
      break;
    }
    case "pivot": {
      const [x, y] = S(s.at);
      const h = 26, half = 16;
      ctx.fillStyle = paper;
      ctx.strokeStyle = ink;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - half, y + h);
      ctx.lineTo(x + half, y + h);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // ground hatch under the triangle
      ctx.beginPath();
      ctx.moveTo(x - half - 8, y + h);
      ctx.lineTo(x + half + 8, y + h);
      ctx.stroke();
      ctx.lineWidth = 1;
      for (let t = -half - 6; t <= half + 6; t += 7) {
        ctx.beginPath();
        ctx.moveTo(x + t, y + h);
        ctx.lineTo(x + t - 6, y + h + 7);
        ctx.stroke();
      }
      out.boxes.push({ x0: x - half - 8, y0: y, x1: x + half + 8, y1: y + h + 8 });
      break;
    }
    case "dim": {
      const a = S(s.from), b = S(s.to);
      const color = s.role ? roleColor(s.role) : faint;
      const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
      if (len < 2) break;
      const n = [-(b[1] - a[1]) / len, (b[0] - a[0]) / len]; // perpendicular, for end ticks
      const u = [(b[0] - a[0]) / len, (b[1] - a[1]) / len]; // along the line
      const mid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
      const weight = s.role ? 600 : 500;
      // labelOn: the label sits IN the middle of the line, engineering-drawing
      // style, with the line broken around it (if the line is long enough).
      let half = 0;
      if (s.label && s.labelOn) {
        const tw = measureLabel(ctx, s.label, 13, weight) + 10, th = 20;
        const h = (Math.abs(u[0]) * tw + Math.abs(u[1]) * th) / 2; // half the label's length along the line
        if (len > 2 * h + 12) half = h;
      }
      ctx.strokeStyle = color;
      ctx.lineWidth = s.role ? 2 : 1.2;
      if (s.dashed) ctx.setLineDash([5, 4]);
      ctx.beginPath();
      ctx.moveTo(a[0], a[1]);
      if (half) {
        ctx.lineTo(mid[0] - u[0] * half, mid[1] - u[1] * half);
        ctx.moveTo(mid[0] + u[0] * half, mid[1] + u[1] * half);
      }
      ctx.lineTo(b[0], b[1]);
      ctx.stroke();
      ctx.setLineDash([]);
      for (const p of [a, b]) {
        ctx.beginPath();
        ctx.moveTo(p[0] - n[0] * 6, p[1] - n[1] * 6);
        ctx.lineTo(p[0] + n[0] * 6, p[1] + n[1] * 6);
        ctx.stroke();
      }
      out.segments.push([a, b, "dim"]); // a dimension line: labels may hop over it, not sit on it
      if (half) {
        out.boxes.push({ ...drawLabel(ctx, s.label, mid[0], mid[1], { color, size: 13, weight }), dim: true }); // part of a dimension
      } else if (s.label) {
        // Label beside the middle, on the side the normal points to.
        const side = s.labelSide || 1;
        const pos = [(a[0] + b[0]) / 2 + n[0] * 14 * side, (a[1] + b[1]) / 2 + n[1] * 14 * side];
        out.labels.push({ text: s.label, pos, align: "center", size: 13, weight: s.role ? 600 : 500, color, maxMove: 36, yields: true });
      }
      break;
    }
    case "rightangle": {
      const [x, y] = S(s.at);
      const k = 9;
      const u = [s.u[0], -s.u[1]], v = [s.v[0], -s.v[1]]; // screen y flipped
      ctx.strokeStyle = s.role ? roleColor(s.role) : faint;
      ctx.lineWidth = s.role ? 1.6 : 1.2;
      ctx.beginPath();
      ctx.moveTo(x + u[0] * k, y + u[1] * k);
      ctx.lineTo(x + (u[0] + v[0]) * k, y + (u[1] + v[1]) * k);
      ctx.lineTo(x + v[0] * k, y + v[1] * k);
      ctx.stroke();
      break;
    }
    case "moment": {
      // A curved arrow around the centre: 290° of arc, head showing the turning sense.
      const [x, y] = S(s.center);
      // maxR (metres): keep the arrow inside something, e.g. the plate it's drawn on.
      const r = s.maxR ? Math.min(s.rPx || 34, s.maxR * cv.view.scale) : s.rPx || 34;
      const color = roleColor(s.role || "resultant");
      const start = (-60 * Math.PI) / 180, sweep = (290 * Math.PI) / 180;
      const ccw = s.sense >= 0;
      // Screen angles run clockwise, so a CCW (world) arrow sweeps negative screen angle.
      const a0 = ccw ? -start : start;
      const a1 = ccw ? a0 - sweep : a0 + sweep;
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = 2.4;
      if (s.role === "shadow") {
        ctx.setLineDash([6, 4]);
        ctx.globalAlpha = 0.6;
      }
      if (s.alpha != null) ctx.globalAlpha = s.alpha; // e.g. a faint "shadow" moment the student is placing
      ctx.beginPath();
      ctx.arc(x, y, r, a0, a1, ccw);
      ctx.stroke();
      ctx.setLineDash([]);
      // Arrow head at the end, pointing along the direction of travel.
      const ex = x + r * Math.cos(a1), ey = y + r * Math.sin(a1);
      const tx = ccw ? Math.sin(a1) : -Math.sin(a1), ty = ccw ? -Math.cos(a1) : Math.cos(a1);
      const hl = 11;
      ctx.beginPath();
      ctx.moveTo(ex + tx * hl * 0.6, ey + ty * hl * 0.6);
      ctx.lineTo(ex - tx * hl * 0.6 - ty * hl * 0.5, ey - ty * hl * 0.6 + tx * hl * 0.5);
      ctx.lineTo(ex - tx * hl * 0.6 + ty * hl * 0.5, ey - ty * hl * 0.6 - tx * hl * 0.5);
      ctx.closePath();
      ctx.fill();
      // labelMove: how far the label may move to dodge things (0 keeps it right above the arrow).
      // (moment: true lets a crowded label move to the corner list, leaving just its name.)
      if (s.label) out.labels.push({ text: s.label, pos: [x, y - r - 14], align: "center", size: 14, weight: 600, color, maxMove: s.labelMove ?? 60, fromArrow: s.role !== "shadow", moment: true });
      out.boxes.push({ x0: x - r, y0: y - r, x1: x + r, y1: y + r });
      break;
    }
    default: {
      // Pictures of real objects (motor, lamp, eyebolt …) live in objects.js;
      // distributed loads and wheels in loads.js; support symbols in supports.js.
      const obj = drawObject(cv, s, env) || drawLoadShape(cv, s, env, roleColor) || drawSupportSymbol(cv, s, env) || drawHardware(cv, s, env);
      if (obj) return obj;
    }
  }
  return out;
}
