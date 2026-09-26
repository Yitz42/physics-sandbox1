// arrows.js — drawing force arrows and their labels on the canvas.
//
// Everything here works in screen pixels; canvas.js converts from metres.

// Colours come from CSS variables in style.css, so the look is set in one place.
export function cssColor(name, fallback = "#333") {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

// Draw an arrow from `a` to `b` (pixels). Options:
//   color, width, dashed, alpha, glow (for highlighted arrows)
export function drawArrow(ctx, a, b, opts = {}) {
  const { color = "#333", width = 2.5, dashed = false, alpha = 1, glow = false } = opts;
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len = Math.hypot(dx, dy);
  if (len < 1) return;
  const ux = dx / len;
  const uy = dy / len;
  const head = Math.min(14, len * 0.45);
  ctx.save();
  ctx.globalAlpha = alpha;
  if (glow) {
    ctx.shadowColor = color;
    ctx.shadowBlur = 12;
  }
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = glow ? width + 1.5 : width;
  ctx.lineCap = "round";
  if (dashed) ctx.setLineDash([7, 5]);
  // Shaft stops at the base of the head so the tip stays sharp.
  ctx.beginPath();
  ctx.moveTo(a[0], a[1]);
  ctx.lineTo(b[0] - ux * head * 0.8, b[1] - uy * head * 0.8);
  ctx.stroke();
  ctx.setLineDash([]);
  // Arrow head: a filled triangle.
  ctx.beginPath();
  ctx.moveTo(b[0], b[1]);
  ctx.lineTo(b[0] - ux * head - uy * head * 0.45, b[1] - uy * head + ux * head * 0.45);
  ctx.lineTo(b[0] - ux * head + uy * head * 0.45, b[1] - uy * head - ux * head * 0.45);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

// Turn "T_{AB} = 245 N" into pieces: [{text:"T"}, {text:"AB", sub:true}, {text:" = 245 N"}].
// Handles X_{abc}, X_a and a few Greek names, so canvas labels match the equations.
export function parseLabel(label) {
  const greek = { "\\theta": "θ", "\\alpha": "α", "\\beta": "β", "\\Sigma": "Σ", "\\mu": "μ" };
  let s = String(label);
  for (const [k, v] of Object.entries(greek)) s = s.split(k).join(v);
  const parts = [];
  let buf = "";
  for (let i = 0; i < s.length; i++) {
    if (s[i] === "_") {
      if (buf) parts.push({ text: buf });
      buf = "";
      if (s[i + 1] === "{") {
        const end = s.indexOf("}", i);
        parts.push({ text: s.slice(i + 2, end), sub: true });
        i = end;
      } else {
        parts.push({ text: s[i + 1] || "", sub: true });
        i++;
      }
    } else {
      buf += s[i];
    }
  }
  if (buf) parts.push({ text: buf });
  return parts;
}

// Fonts for each piece of a label: italic for the leading symbol letter
// (like handwritten physics), smaller for subscripts.
function styledParts(label, size, weight) {
  return parseLabel(label).map((p, i) => {
    const px = p.sub ? size * 0.72 : size;
    const italic = i === 0 && !p.sub && /^[A-Za-zθαβμ(]/.test(p.text) ? "italic " : "";
    return { ...p, font: `${italic}${weight} ${px}px system-ui, sans-serif` };
  });
}

// Width in pixels of a label, without drawing it.
export function measureLabel(ctx, label, size = 14, weight = 500) {
  ctx.save();
  let width = 0;
  for (const p of styledParts(label, size, weight)) {
    ctx.font = p.font;
    width += ctx.measureText(p.text).width;
  }
  ctx.restore();
  return width;
}

// The rectangle a label covers: { x0, y0, x1, y1 } in pixels.
export function labelBox(x, y, width, size = 14, align = "center") {
  const x0 = align === "center" ? x - width / 2 : align === "right" ? x - width : x;
  return { x0: x0 - 3, y0: y - size * 0.8, x1: x0 + width + 3, y1: y + size * 0.55 };
}

// Draw a label with subscripts. align: "left" | "center" | "right".
// Returns the rectangle it covers (so other labels can keep clear of it).
export function drawLabel(ctx, label, x, y, opts = {}) {
  const { color = "#222", size = 14, align = "center", background = null, weight = 500 } = opts;
  const parts = styledParts(label, size, weight);
  let width = 0;
  for (const p of parts) {
    ctx.font = p.font;
    p.w = ctx.measureText(p.text).width;
    width += p.w;
  }
  let cx = align === "center" ? x - width / 2 : align === "right" ? x - width : x;
  ctx.save();
  if (background) {
    ctx.fillStyle = background;
    ctx.globalAlpha = 0.85;
    ctx.fillRect(cx - 3, y - size * 0.8, width + 6, size * 1.35);
    ctx.globalAlpha = 1;
  }
  ctx.fillStyle = color;
  ctx.textBaseline = "alphabetic";
  for (const p of parts) {
    ctx.font = p.font;
    ctx.fillText(p.text, cx, p.sub ? y + size * 0.28 : y + size * 0.35);
    cx += p.w;
  }
  ctx.restore();
  return labelBox(x, y, width, size, align);
}

// Where to put an arrow's label. Returns { pos: [x, y], align }.
//   Normal arrows: just past the tip, extending the way the arrow points
//   (so two arrows fanning out never have labels on top of each other).
//   `mid` arrows (components, targets): beside the middle of the arrow;
//   `side` (+1 right / −1 left) picks the side of a vertical one.
export function labelPosition(a, b, offset = 16, mid = false, side = 1) {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len, uy = dy / len;
  if (mid) {
    const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
    if (Math.abs(dx) >= Math.abs(dy)) return { pos: [mx, my + offset], align: "center" };
    return { pos: [mx + side * 8, my], align: side > 0 ? "left" : "right" };
  }
  const align = ux > 0.35 ? "left" : ux < -0.35 ? "right" : "center";
  // Screen y grows downward: a label below a downward tip needs extra room.
  const ty = b[1] + uy * 12 + (uy > 0.35 ? 8 : uy < -0.35 ? -6 : 0);
  return { pos: [b[0] + ux * 10, ty], align };
}
