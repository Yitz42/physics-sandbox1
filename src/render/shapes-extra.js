// shapes-extra.js — shapes added for moments and rigid bodies (Unit 3 on):
//   beam       { points, width?, flat?, text? } a bar, bracket or plank (polyline, metres); flat:
//              [start, end] true = a square end (built into a wall, see support-clear.js);
//              text: { at, text } a caption written inside the bar (e.g. "40 kg beam")
//   pivot      { at }                          triangle support under a pin (seesaw)
//   dim        { from, to, label, role?, labelSide?, labelOn?, noExt? }  a dimension / moment-arm
//              line with end ticks; its label sits in a break in the middle of the line
//              (labelOn: false puts it beside the line). noExt: no extension lines (dims.js)
//   rightangle { at, u, v }                    small square marking a 90° corner
//   moment     { center, rPx, maxR?, sense, label, role, labelMove?, alpha? } curved arrow: sense +1 CCW, −1 CW;
//              rPx its radius in pixels, maxR a largest radius in metres (to fit on a plate)
// Like shapes.js, each returns { boxes, segments, labels } for label placement.
// Pictures of real objects (motor, lamp, eyebolt, bracket) are in objects.js,
// springs and pulleys in mechanisms.js, block diagrams and signal-flow graphs in blocks.js,
// distributed loads and wheels in loads.js, support symbols in supports.js, truss members in members.js,
// a wrench and a trailer in hardware.js.

import { drawLabel, measureLabel } from "./arrows.js";
import { barBoxes, overlapArea } from "./labels.js";
import { drawObject } from "./objects.js";
import { drawMechanism } from "./mechanisms.js";
import { drawBlockShape } from "./blocks.js";
import { drawScenery } from "./scenery.js";
import { drawLoadShape } from "./loads.js";
import { drawSupportSymbol } from "./supports.js";
import { drawMember } from "./members.js";
import { drawRegion } from "./regions.js";
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
      const flat = s.flat || [false, false];
      // Square line ends, with a round cap added by hand to each end that isn't flat.
      const caps = (r, color) => {
        ctx.fillStyle = color;
        [pts[0], pts[pts.length - 1]].forEach((p, i) => {
          if (flat[i]) return;
          ctx.beginPath();
          ctx.arc(p[0], p[1], r, 0, Math.PI * 2);
          ctx.fill();
        });
      };
      ctx.lineCap = "butt";
      ctx.lineJoin = "round";
      ctx.strokeStyle = ink;
      ctx.lineWidth = w + 3;
      trace();
      ctx.stroke();
      caps((w + 3) / 2, ink);
      ctx.strokeStyle = env.crate;
      ctx.lineWidth = w;
      trace();
      ctx.stroke();
      caps(w / 2, env.crate);
      // A flat end gets its own outline across the bar.
      [[pts[0], pts[1]], [pts[pts.length - 1], pts[pts.length - 2]]].forEach(([p, q], i) => {
        if (!flat[i] || !q) return;
        const L = Math.hypot(q[0] - p[0], q[1] - p[1]) || 1;
        const n = [-(q[1] - p[1]) / L, (q[0] - p[0]) / L];
        const h = (w + 3) / 2;
        ctx.strokeStyle = ink;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(p[0] + n[0] * h, p[1] + n[1] * h);
        ctx.lineTo(p[0] - n[0] * h, p[1] - n[1] * h);
        ctx.stroke();
      });
      for (let i = 1; i < pts.length; i++) {
        out.segments.push([pts[i - 1], pts[i]]);
        out.boxes.push(...barBoxes(pts[i - 1], pts[i], w + 3)); // its whole thickness, for the labels
      }
      if (s.text) {
        const [tx, ty] = S(s.text.at);
        const box = drawLabel(ctx, s.text.text, tx, ty + 4, { color: ink, size: Math.min(13, w - 6), weight: 600 });
        if (box) out.boxes.push({ ...box, heavy: true });
      }
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
      // Dimension values sit IN the line (with a break) unless the stage says labelOn: false.
      if (s.label && s.labelOn !== false) {
        const tw = measureLabel(ctx, s.label, 13, weight) + 10, th = 20;
        const h = (Math.abs(u[0]) * tw + Math.abs(u[1]) * th) / 2; // half the label's length along the line
        if (len > 2 * h + 12) half = h;
      }
      ctx.strokeStyle = color;
      ctx.lineWidth = s.role ? 2 : 1.2;
      if (s.dashed) ctx.setLineDash([5, 4]);
      ctx.beginPath();
      ctx.moveTo(a[0], a[1]);
      ctx.lineTo(b[0], b[1]); // (the line breaks around its value when the value is placed, diagrams.js)
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
        // The value sits IN its line: in the middle if it's free, else slid toward
        // either end (never past the ticks). It's placed after point letters and
        // force labels (yields), so a letter right under its pin keeps its spot and
        // the value moves along instead; the line breaks around it.
        const room = len / 2 - half - 4;
        const spots = [0, -0.4, 0.4, -0.7, 0.7, -1, 1].map((f) => [mid[0] + u[0] * room * f, mid[1] + u[1] * room * f, "center"]);
        out.labels.push({ text: s.label, pos: spots[0].slice(0, 2), spots, align: "center", size: 13, weight, color, yields: true, breaks: true, maxMove: Math.max(20, room) });
      } else if (s.label) {
        // Label beside the middle, on the side the normal points to.
        const side = s.labelSide || 1;
        const pos = [(a[0] + b[0]) / 2 + n[0] * 14 * side, (a[1] + b[1]) / 2 + n[1] * 14 * side];
        // (A moment arm's "d = 0.2 m" that runs into something keeps just "d"
        // and lists its value in the corner, like a moment's label: listable.)
        out.labels.push({ text: s.label, pos, align: "center", size: 13, weight: s.role ? 600 : 500, color, maxMove: 36, yields: true, listable: s.role === "arm" });
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
      const sweep = (290 * Math.PI) / 180;
      const ccw = s.sense >= 0;
      // Screen angles run clockwise, so a CCW (world) arrow sweeps negative screen angle.
      // The arrow turns (its open gap rotates) so its head lands where it hits the least
      // of what's already drawn (env.obstacles: beams, supports …) — upright if it can.
      const arcFor = (start) => {
        const b0 = ccw ? -start : start;
        return [b0, ccw ? b0 - sweep : b0 + sweep];
      };
      const clash = (start) => {
        const [b0, b1] = arcFor(start);
        const hx = x + r * Math.cos(b1), hy = y + r * Math.sin(b1);
        const head = { x0: hx - 9, y0: hy - 9, x1: hx + 9, y1: hy + 9 };
        let c = 0;
        for (const t of env.obstacles || []) {
          if (t.soft) continue;
          c += 3 * overlapArea(head, t);
          for (let i = 0; i <= 12; i++) {
            const a = b0 + ((b1 - b0) * i) / 12, px = x + r * Math.cos(a), py = y + r * Math.sin(a);
            if (px > t.x0 && px < t.x1 && py > t.y0 && py < t.y1) c += 20;
          }
        }
        return c;
      };
      let start = (-60 * Math.PI) / 180, best = clash(start);
      for (const deg of [45, -45, 90, -90, 135, -135, 180]) {
        const st = ((-60 + deg) * Math.PI) / 180, c = clash(st) + Math.abs(deg) * 2; // (turning costs a little)
        if (c < best) {
          best = c;
          start = st;
        }
      }
      const [a0, a1] = arcFor(start);
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
      // circle: a short label (its name, "M") goes INSIDE the arrow if it fits there (labels.js).
      if (s.label) out.labels.push({ text: s.label, pos: [x, y - r - 14], align: "center", size: 14, weight: 600, color, maxMove: Math.max(s.labelMove ?? 60, 1.6 * r + 14), fromArrow: s.role !== "shadow", moment: true, circle: { x, y, r, id: s.id || `m${x}` } });
      // Its true outline: the arc itself (a row of small boxes along it) and its
      // head; the space inside the circle is soft (labels avoid it if they can).
      const steps = 16;
      for (let i = 0; i < steps; i++) {
        const b0 = a0 + ((a1 - a0) * i) / steps, b1 = a0 + ((a1 - a0) * (i + 1)) / steps;
        out.boxes.push(...barBoxes([x + r * Math.cos(b0), y + r * Math.sin(b0)], [x + r * Math.cos(b1), y + r * Math.sin(b1)], 6));
      }
      out.boxes.push({ x0: ex - 9, y0: ey - 9, x1: ex + 9, y1: ey + 9 });
      out.boxes.push({ x0: x - r, y0: y - r, x1: x + r, y1: y + r, soft: true, circleOf: s.id || `m${x}` });
      break;
    }
    default: {
      // Pictures of real objects live in their own files (see the top of this file).
      const obj = drawObject(cv, s, env) || drawMechanism(cv, s, env) || drawScenery(cv, s, env) || drawBlockShape(cv, s, env, roleColor)
        || drawLoadShape(cv, s, env, roleColor) || drawSupportSymbol(cv, s, env) || drawHardware(cv, s, env) || drawMember(cv, s, env, roleColor)
        || drawRegion(cv, s, env);
      if (obj) return obj;
    }
  }
  return out;
}
