// shapes.js — how each kind of shape looks (see the list in diagrams.js).
//
// drawShape draws one shape and reports what it covers, so arrow labels
// placed afterwards can keep clear of it:
//   boxes:    rectangles covered (pixel { x0, y0, x1, y1 })
//   segments: straight lines ([p, q] in pixels)
//   labels:   small labels to place later, dodging everything else

import { drawArrow, drawLabel, measureLabel, cssColor } from "./arrows.js";
import { drawExtraShape } from "./shapes-extra.js";

const ROLE_COLORS = {
  known: ["--c-force", "#1f5fbf"],
  unknown: ["--c-unknown", "#c2410c"],
  resultant: ["--c-resultant", "#7c3aed"],
  component: ["--c-component", "#64748b"],
  target: ["--c-target", "#16a34a"],
  wrong: ["--c-wrong", "#dc2626"],
  student: ["--c-student", "#0f766e"],
  shadow: ["--c-wrong", "#dc2626"], // the student's (wrong) answer, drawn faint and dashed
  arm: ["--c-arm", "#b45309"], // moment arm d
  tension: ["--c-tension", "#dc2626"], // a truss member pulled (red)
  compression: ["--c-compression", "#2563eb"], // a truss member pushed (blue)
};

export function roleColor(role) {
  const [v, f] = ROLE_COLORS[role] || ROLE_COLORS.known;
  return cssColor(v, f);
}

const circleBox = (x, y, r) => ({ x0: x - r, y0: y - r, x1: x + r, y1: y + r });

// env: { ink, faint, paper, lit }
export function drawShape(cv, s, env) {
  const { ctx } = cv;
  const S = cv.toScreen;
  const { ink, faint, paper, lit } = env;
  const out = { boxes: [], segments: [], labels: [] };
  ctx.save();
  switch (s.type) {
    case "arrow": {
      let a = S(s.from), b = S(s.to);
      // headGap / tailGap (pixels): stop short of the point, e.g. so an arrow
      // pushing on a beam ends ON its surface instead of at its centre line.
      if (s.headGap || s.tailGap) {
        const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
        const hg = s.headGap || 0, tg = s.tailGap || 0;
        if (len > hg + tg + 12) {
          const u = [(b[0] - a[0]) / len, (b[1] - a[1]) / len];
          a = [a[0] + u[0] * tg, a[1] + u[1] * tg];
          b = [b[0] - u[0] * hg, b[1] - u[1] * hg];
        }
      }
      drawArrow(ctx, a, b, {
        color: roleColor(s.role), glow: lit,
        width: s.role === "component" ? 1.8 : 2.8,
        dashed: ["component", "target", "resultant", "shadow"].includes(s.role),
        alpha: s.alpha ?? (s.role === "target" ? 0.7 : s.role === "shadow" ? 0.55 : 1),
      });
      out.segments.push([a, b]);
      break;
    }
    case "line": {
      let a = S(s.from), b = S(s.to);
      if (s.style === "extension") {
        // A dimension's extension line: thin and faint, stopping gapPx short
        // of the body it measures (see dims.js).
        const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
        const g = Math.min(s.gapPx || 0, len - 2);
        b = [b[0] - ((b[0] - a[0]) / len) * g, b[1] - ((b[1] - a[1]) / len) * g];
        ctx.strokeStyle = faint;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(a[0], a[1]);
        ctx.lineTo(b[0], b[1]);
        ctx.stroke();
        out.segments.push([a, b, "dim"]); // like its dimension: labels may hop over it
        break;
      }
      ctx.strokeStyle = s.style === "cable" ? (lit ? roleColor("known") : ink) : s.style === "action" ? roleColor("known") : faint;
      ctx.lineWidth = s.style === "cable" ? (lit ? 3.5 : 2) : 1.2;
      if (s.style === "action") ctx.globalAlpha = 0.55; // a force's line of action: faint, dashed, force colour
      if (s.style !== "cable") ctx.setLineDash([5, 4]);
      ctx.beginPath();
      ctx.moveTo(a[0], a[1]);
      ctx.lineTo(b[0], b[1]);
      ctx.stroke();
      // Labels keep off cables; faint dashed guides (lines of action, reference
      // lines) they may sit on if that's the best spot (the third entry says so).
      out.segments.push(s.style === "cable" ? [a, b] : [a, b, true]);
      break;
    }
    case "support": {
      const a = S(s.from), b = S(s.to);
      const n = [-s.normal[0], s.normal[1]]; // hatch on the far side; screen y is flipped
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
      out.segments.push([a, b]);
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
      out.boxes.push({ ...circleBox(x, y, 7), heavy: true }); // labels must never hide a point
      // The point's name (e.g. "A") is placed by diagrams.js with the arrow labels.
      break;
    }
    case "box": {
      const [x, y] = S(s.at);
      const w = s.w * cv.view.scale, h = s.h * cv.view.scale;
      ctx.globalAlpha = s.alpha ?? 1; // faint for a "?" or shadow position
      ctx.fillStyle = cssColor("--c-crate", "#e9d5b0");
      ctx.strokeStyle = lit ? roleColor("known") : ink;
      if (s.dashed) ctx.setLineDash([5, 4]);
      ctx.lineWidth = lit ? 3 : 2;
      ctx.fillRect(x - w / 2, y - h / 2, w, h);
      ctx.strokeRect(x - w / 2, y - h / 2, w, h);
      if (s.label) {
        // Shrink the text to fit inside small boxes (down to 8 px).
        const size = Math.max(8, Math.min(13, (13 * (w - 6)) / Math.max(1, measureLabel(ctx, s.label, 13))));
        drawLabel(ctx, s.label, x, y, { color: ink, size });
      }
      // A crate keeps labels off. A "passable" box (a plate) is a soft obstacle:
      // labels avoid covering it when there's another good spot, but may if not.
      out.boxes.push({ x0: x - w / 2, y0: y - h / 2, x1: x + w / 2, y1: y + h / 2, soft: !!s.passable });
      break;
    }
    // "arc" (an angle marking) is drawn by angles.js, after the rest of the
    // picture, so its number can find room right beside it.
    case "triangle": {
      const p0 = S(s.at), p1 = S([s.at[0] + s.dx, s.at[1]]), p2 = S([s.at[0] + s.dx, s.at[1] + s.dy]);
      ctx.strokeStyle = faint;
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.moveTo(p0[0], p0[1]);
      ctx.lineTo(p1[0], p1[1]);
      ctx.lineTo(p2[0], p2[1]);
      ctx.stroke();
      // The hypotenuse lies along the arrow, so only the two legs are numbered.
      out.boxes.push(drawLabel(ctx, String(s.labels[0]), (p0[0] + p1[0]) / 2, p1[1] + (s.dy > 0 ? 13 : -11), { color: ink, size: 12 }));
      out.boxes.push(drawLabel(ctx, String(s.labels[1]), p1[0] + (s.dx > 0 ? 10 : -10), (p1[1] + p2[1]) / 2, { color: ink, size: 12 }));
      break;
    }
    case "zone": {
      const a = S(s.from), b = S(s.to);
      ctx.fillStyle = roleColor("wrong");
      ctx.globalAlpha = 0.18;
      ctx.fillRect(Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1]) + 4);
      ctx.globalAlpha = 1;
      // The label goes above the zone (a skylight in a ceiling), or below it
      // (labelBelow: a pond in the ground, where above is where the cables are).
      const ly = s.labelBelow ? Math.max(a[1], b[1]) + 22 : Math.min(a[1], b[1]) - 20;
      out.boxes.push(drawLabel(ctx, s.label, (a[0] + b[0]) / 2, ly, { color: roleColor("wrong"), size: 12 }));
      break;
    }
    case "text": {
      const [x, y] = S(s.at);
      out.boxes.push(drawLabel(ctx, s.text, x, y, { color: faint, size: 13, weight: 600 }));
      break;
    }
    case "divider": {
      // A soft grey line from top to bottom of the picture, between two
      // diagrams (e.g. the space diagram and the FBD). Labels stay on their side.
      const [x] = S([s.x, 0]);
      ctx.strokeStyle = faint;
      ctx.globalAlpha = 0.3; // very light: it separates, it shouldn't draw the eye
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, 8);
      ctx.lineTo(x, cv.view.height - 8);
      ctx.stroke();
      out.segments.push([[x, 0], [x, cv.view.height]]);
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
      out.boxes.push(circleBox(x, y, 12));
      break;
    }
    case "axes": {
      // Always in the bottom-left corner of the canvas, out of the way.
      const x = 18, y = cv.view.height - 16;
      drawArrow(ctx, [x, y], [x + 34, y], { color: faint, width: 1.5 });
      drawArrow(ctx, [x, y], [x, y - 34], { color: faint, width: 1.5 });
      drawLabel(ctx, "x", x + 42, y, { color: faint, size: 12 });
      drawLabel(ctx, "y", x, y - 42, { color: faint, size: 12 });
      out.boxes.push({ x0: x - 6, y0: y - 52, x1: x + 50, y1: y + 6 });
      break;
    }
    default: {
      // Shapes for moments and rigid bodies live in shapes-extra.js.
      const extra = drawExtraShape(cv, s, { ...env, crate: cssColor("--c-crate", "#e9d5b0") }, roleColor);
      out.boxes.push(...extra.boxes);
      out.segments.push(...extra.segments);
      out.labels.push(...extra.labels);
    }
  }
  ctx.restore();
  return out;
}
