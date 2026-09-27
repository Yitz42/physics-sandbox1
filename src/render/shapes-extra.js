// shapes-extra.js — shapes added for moments and rigid bodies (Unit 3 on):
//   beam       { points, width?, flat?, text?, alpha?, look? } a bar, bracket or plank (polyline, metres); flat:
//              [start, end] true = a square end (built into a wall, see support-clear.js);
//              text: { at, text } a caption written inside the bar (e.g. "40 kg beam");
//              look: "ladder" — drawn as a ladder: two rails and rungs (a straight bar only),
//              clip: { xmin?, xmax?, ymin?, ymax? } — cut flush at a wall or floor there
//   pivot      { at }                          triangle support under a pin (seesaw)
//   dim        { from, to, label, role?, labelSide?, labelOn?, noExt? }  a dimension / moment-arm
//              line with end ticks; its label sits in a break in the middle of the line
//              (labelOn: false puts it beside the line). noExt: no extension lines (dims.js)
//   rightangle { at, u, v }                    small square marking a 90° corner
//   ground     { corners, lines }              a 3D picture's ground: shaded, gridded, fading at its edges
//   curve      { points, label?, role?, dashed?, labelAway? } a thin curved line (a direction
//              angle in a 3D picture), labelled by its middle, away from labelAway
//   moment     { center, rPx, maxR?, sense, label, role, labelMove?, alpha? } curved arrow: sense +1 CCW, −1 CW;
//              rPx its radius in pixels, maxR a largest radius in metres (to fit on a plate)
// Like shapes.js, each returns { boxes, segments, labels } for label placement.
// Pictures of real objects (motor, lamp, eyebolt, bracket) are in objects.js,
// springs and pulleys in mechanisms.js, block diagrams and signal-flow graphs in blocks.js,
// distributed loads and wheels in loads.js, support symbols in supports.js, truss members in members.js,
// a wrench and a trailer in hardware.js, filled regions and leaders in regions.js,
// shear and moment diagrams in plots.js.

import { drawLabel, measureLabel, cssColor } from "./arrows.js";
import { barBoxes, overlapArea } from "./labels.js";
import { drawObject } from "./objects.js";
import { drawMechanism } from "./mechanisms.js";
import { drawBlockShape } from "./blocks.js";
import { drawScenery } from "./scenery.js";
import { drawLoadShape } from "./loads.js";
import { drawSupportSymbol } from "./supports.js";
import { drawMember } from "./members.js";
import { drawRegion } from "./regions.js";
import { drawPlot } from "./plots.js";
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
      const alpha0 = ctx.globalAlpha;
      if (s.alpha != null) ctx.globalAlpha = s.alpha; // faint: a body the stage isn't working on
      if (s.look === "ladder" && pts.length === 2) {
        // A ladder, as it really looks: two rails, with a rung every 16 px or so.
        const [p, q] = pts;
        const L = Math.hypot(q[0] - p[0], q[1] - p[1]) || 1;
        const u = [(q[0] - p[0]) / L, (q[1] - p[1]) / L], n = [-u[1], u[0]];
        const h = w / 2;
        const rail = (k) => {
          ctx.beginPath();
          ctx.moveTo(p[0] + n[0] * h * k, p[1] + n[1] * h * k);
          ctx.lineTo(q[0] + n[0] * h * k, q[1] + n[1] * h * k);
          ctx.stroke();
        };
        ctx.save();
        if (s.clip) {
          // Cut flush where it meets a wall or the floor (clip: the region it may be
          // drawn in, { xmin?, xmax?, ymin?, ymax? } metres).
          // (A side with no limit runs to the canvas's edge — huge rectangles don't clip reliably.)
          const c = s.clip, W = cv.view.width, H = cv.view.height;
          const x0 = c.xmin != null ? S([c.xmin, 0])[0] : 0, x1 = c.xmax != null ? S([c.xmax, 0])[0] : W;
          const y0 = c.ymax != null ? S([0, c.ymax])[1] : 0, y1 = c.ymin != null ? S([0, c.ymin])[1] : H;
          ctx.beginPath();
          ctx.rect(x0, y0, x1 - x0, y1 - y0);
          ctx.clip();
        }
        ctx.strokeStyle = ink;
        ctx.lineCap = "butt";
        ctx.lineWidth = 1.8;
        const rungs = Math.max(2, Math.round(L / 16));
        for (let i = 1; i < rungs; i++) {
          const c = [p[0] + u[0] * (L * i) / rungs, p[1] + u[1] * (L * i) / rungs];
          ctx.beginPath();
          ctx.moveTo(c[0] + n[0] * h, c[1] + n[1] * h);
          ctx.lineTo(c[0] - n[0] * h, c[1] - n[1] * h);
          ctx.stroke();
        }
        ctx.lineWidth = 3;
        rail(1);
        rail(-1);
        ctx.restore();
        out.segments.push([p, q]);
        out.boxes.push(...barBoxes(p, q, w + 3));
        ctx.globalAlpha = alpha0;
        break;
      }
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
        // (drawLabel centres the text on ty: the beam's centre line — the middle of the bar)
        const box = drawLabel(ctx, s.text.text, tx, ty, { color: ink, size: Math.min(13, w - 6), weight: 600 });
        if (box) out.boxes.push({ ...box, heavy: true });
      }
      ctx.globalAlpha = alpha0;
      break;
    }
    case "ground": {
      // A plane seen in perspective (a 3D picture's ground): lightly shaded, with a faint
      // grid, and no outline — it fades to the background toward its edges, like a
      // soft round patch lying on the plane. corners: the patch's four corners in order
      // (as drawn); lines: its grid lines. It's drawn on its own layer, then faded by a
      // round gradient laid on the plane (the same shape squashed into the view).
      // Background only: labels may cross it.
      const c = s.corners.map(S);
      const off = document.createElement("canvas");
      off.width = ctx.canvas.width;
      off.height = ctx.canvas.height;
      const o = off.getContext("2d");
      o.setTransform(ctx.getTransform());
      o.fillStyle = cssColor("--c-ground", "rgba(59, 130, 246, 0.16)");
      o.beginPath();
      c.forEach((p, i) => (i ? o.lineTo(p[0], p[1]) : o.moveTo(p[0], p[1])));
      o.closePath();
      o.fill();
      o.strokeStyle = faint;
      o.lineWidth = 0.9;
      o.beginPath();
      for (const [a, b] of s.lines) {
        const [p, q] = [S(a), S(b)];
        o.moveTo(p[0], p[1]);
        o.lineTo(q[0], q[1]);
      }
      o.stroke();
      // The fade: in the plane's own frame the patch is the square −1…1; a round
      // gradient there is solid in the middle and clear at the edges.
      const C = [(c[0][0] + c[2][0]) / 2, (c[0][1] + c[2][1]) / 2];
      const E1 = [(c[1][0] - c[0][0]) / 2, (c[1][1] - c[0][1]) / 2], E2 = [(c[3][0] - c[0][0]) / 2, (c[3][1] - c[0][1]) / 2];
      o.globalCompositeOperation = "destination-in";
      o.transform(E1[0], E1[1], E2[0], E2[1], C[0], C[1]);
      const g = o.createRadialGradient(0, 0, 0, 0, 0, 1);
      g.addColorStop(0, "rgba(0, 0, 0, 1)");
      g.addColorStop(0.6, "rgba(0, 0, 0, 1)");
      g.addColorStop(1, "rgba(0, 0, 0, 0)");
      o.fillStyle = g;
      o.fillRect(-1.5, -1.5, 3, 3);
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.drawImage(off, 0, 0);
      ctx.restore();
      break;
    }
    case "curve": {
      // A thin curved line through points (metres), e.g. a direction angle drawn in
      // space (Unit 2.3), with its label by its middle, clear of everything.
      const pts = s.points.map(S);
      ctx.strokeStyle = s.role ? roleColor(s.role) : faint;
      ctx.lineWidth = 1.4;
      if (s.dashed) ctx.setLineDash([4, 3]);
      ctx.beginPath();
      pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
      ctx.stroke();
      ctx.setLineDash([]);
      for (let i = 1; i < pts.length; i++) out.segments.push([pts[i - 1], pts[i]]);
      if (s.label) {
        const m = pts[Math.floor(pts.length / 2)];
        const c = s.labelAway ? S(s.labelAway) : pts[0]; // label on the side away from this point
        const d = [m[0] - c[0], m[1] - c[1]], L = Math.hypot(d[0], d[1]) || 1;
        const u = [d[0] / L, d[1] / L];
        // Out from the curve first, then further out, then along it either way.
        const t = [-u[1], u[0]];
        const spot = (dx, dy) => [m[0] + dx, m[1] + dy + 4, dx > 4 ? "left" : dx < -4 ? "right" : "center"];
        const spots = [...[10, 16, 24, 34].map((k) => spot(u[0] * k, u[1] * k)),
          ...[18, 30].flatMap((k) => [spot(u[0] * 12 + t[0] * k, u[1] * 12 + t[1] * k), spot(u[0] * 12 - t[0] * k, u[1] * 12 - t[1] * k)])];
        out.labels.push({ text: s.label, pos: spots[0].slice(0, 2), align: spots[0][2], spots, size: 13, weight: 600, color: s.role ? roleColor(s.role) : ink, maxMove: 40 });
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
      // The line breaks where an arrow crosses it (s.cuts, dims.js) and where it
      // would run through something already drawn (a support, a body …); its value
      // breaks it too, once placed (diagrams.js).
      ctx.beginPath();
      const gap = (t) => {
        if ((s.cuts || []).some((c) => Math.abs(c - t) < 7)) return true;
        const x = a[0] + u[0] * t, y = a[1] + u[1] * t;
        return (env.obstacles || []).some((o) => !o.soft && !o.dim && x > o.x0 - 3 && x < o.x1 + 3 && y > o.y0 - 3 && y < o.y1 + 3);
      };
      let on = false;
      for (let t = 0; t <= len; t += 1) {
        const g = gap(t) && t > 3 && t < len - 3; // (the ends and their ticks always show)
        const x = a[0] + u[0] * t, y = a[1] + u[1] * t;
        if (!g && !on) ctx.moveTo(x, y);
        if (!g) ctx.lineTo(x, y);
        on = !g;
      }
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
        || drawRegion(cv, s, env) || drawPlot(cv, s, env);
      if (obj) return obj;
    }
  }
  return out;
}
