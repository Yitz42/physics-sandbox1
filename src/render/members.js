// members.js — truss members (Unit 5.1):
//   member { id, from, to, state?, label?, alpha? }
//     a straight bar between two joints. state colours it once it's solved:
//     "tension" red, "compression" blue, "zero" grey (a zero-force member);
//     no state: the plain bar colour. Its label (e.g. "F_AB = 500 N (T)")
//     sits beside the middle of the bar, on whichever side is free.
// Returns { boxes, segments, labels } like the other shapes, or null for other types.

export function drawMember(cv, s, env, roleColor) {
  if (s.type !== "member") return null;
  const { ctx } = cv;
  const out = { boxes: [], segments: [], labels: [] };
  const a = cv.toScreen(s.from), b = cv.toScreen(s.to);
  const fill = s.state === "tension" ? roleColor("tension") : s.state === "compression" ? roleColor("compression") : s.state === "zero" ? env.faint : env.crate;
  ctx.save();
  ctx.globalAlpha = s.alpha ?? 1;
  ctx.lineCap = "round";
  const line = (w, color) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = w;
    ctx.beginPath();
    ctx.moveTo(a[0], a[1]);
    ctx.lineTo(b[0], b[1]);
    ctx.stroke();
  };
  line(9, env.ink);
  line(6, fill);
  ctx.restore();
  out.segments.push([a, b]);
  if (s.label) {
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    const n = [-(b[1] - a[1]) / len, (b[0] - a[0]) / len]; // across the bar
    const mid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    const at = (k, d) => [mid[0] + n[0] * d * k, mid[1] + n[1] * d * k]; // k = ±1: which side of the bar
    // Only close to its own bar (maxMove), so a label is never mistaken for a neighbour's.
    const spots = [at(1, 15), at(-1, 15), at(1, 24), at(-1, 24)];
    out.labels.push({ text: s.label, pos: spots[0], spots, align: "center", size: 13, weight: 600, color: s.state ? fill : env.ink, maxMove: 34 });
  }
  return out;
}
