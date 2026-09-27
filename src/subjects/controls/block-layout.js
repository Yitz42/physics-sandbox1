// block-layout.js — draws a block diagram tree (block-diagram.js) automatically.
//
// Signals flow left to right along a line; each kind of node is laid out
// around that line:
//   block     a box
//   series    boxes side by side, joined by arrows
//   parallel  a pickoff point, the branches stacked one above another, and a
//             summing junction that adds them (with their signs)
//   loop      summing junction → forward path → pickoff point, with the
//             feedback path running back underneath, into the junction from below
// Units are "boxes": a block is 0.9 high. Stage files never give coordinates.
//
// blockScene(setup, result, opts) → shapes for render/blocks.js. The next group
// to reduce (setup.reduce steps done) is outlined, with the rule's name.

import { fromDescending, polyText, coeffText } from "../../core/poly.js";
import { kindOf, blockTex, partialDiagram, coeff } from "./block-diagram.js";
import { ruleName } from "./block-tools.js";

const H = 0.9; // block height
const GAP = 0.9; // arrow length between parts
const R = 0.24; // summing junction radius
const LEAD = 0.45; // pickoff to branch start

// What a block shows: a symbol ("G_1"), or its transfer function as a fraction.
function blockLabel(b, params) {
  const sub = (text) => String(text).replace(/\b[A-Za-z]\w*\b/g, (w) => (w in params ? coeffText(params[w]) : w));
  if (b.show) return b.show.length > 1 ? { fraction: b.show.map(sub) } : { label: sub(b.show[0]) };
  if (b.tf && !b.reduced) {
    const text = (list) => polyText(fromDescending(list.map((c) => coeff(c, params))));
    const num = text(b.tf.num), den = text(b.tf.den || [1]);
    return den === "1" ? { label: num } : { fraction: [num, den] };
  }
  return { label: blockTex(b) };
}

const textWidth = (t) => 0.14 * String(t).replace(/[_{}]/g, "").length + 0.55;

// Lay out one node. Returns { w, up, down, place(x, y, out) } where (x, y) is
// where the signal enters (left end of the line) and place() pushes shapes.
function layout(node, ctx) {
  const kind = kindOf(node);
  if (kind === "block") {
    const lab = blockLabel(node, ctx.params);
    const w = Math.max(1.15, ...(lab.fraction ? lab.fraction : [lab.label]).map(textWidth));
    return {
      w, up: H / 2, down: H / 2,
      place(x, y, out) {
        out.push({ type: "tfblock", id: node.block, at: [x + w / 2, y], w, h: H, ...lab, role: node.reduced ? "reduced" : "block" });
        ctx.boxes.set(node.src || node, [x, y - H / 2, x + w, y + H / 2]);
      },
    };
  }
  if (kind === "series") {
    const L = node.series.map((n) => layout(n, ctx));
    const w = L.reduce((s, l) => s + l.w, 0) + GAP * (L.length - 1);
    return {
      w, up: Math.max(...L.map((l) => l.up)), down: Math.max(...L.map((l) => l.down)),
      place(x, y, out) {
        let cx = x;
        L.forEach((l, i) => {
          l.place(cx, y, out);
          cx += l.w;
          if (i < L.length - 1) out.push({ type: "wire", points: [[cx, y], [cx + GAP, y]], arrow: true });
          cx += i < L.length - 1 ? GAP : 0;
        });
        ctx.boxes.set(node.src || node, [x, y - this.down, x + w, y + this.up]);
      },
    };
  }
  if (kind === "parallel") {
    const L = node.parallel.map((n) => layout(n, ctx));
    const signs = node.signs || L.map(() => 1);
    const VGAP = 0.55;
    // Stack the branches, centred on the signal line.
    const total = L.reduce((s, l) => s + l.up + l.down, 0) + VGAP * (L.length - 1);
    let top = total / 2;
    const offsets = L.map((l) => {
      const o = top - l.up;
      top -= l.up + l.down + VGAP;
      return o;
    });
    const Wc = Math.max(...L.map((l) => l.w));
    const w = LEAD + Wc + LEAD + 2 * R;
    const up = Math.max(...L.map((l, i) => offsets[i] + l.up));
    const down = Math.max(...L.map((l, i) => l.down - offsets[i]));
    return {
      w, up, down,
      place(x, y, out) {
        const sx = x + LEAD + Wc + LEAD + R; // summing junction centre
        const signMarks = [];
        L.forEach((l, i) => {
          const yi = y + offsets[i];
          out.push({ type: "wire", points: [[x, y], [x, yi], [x + LEAD, yi]], arrow: true });
          l.place(x + LEAD, yi, out);
          const end = Math.abs(offsets[i]) < 1e-9 ? [[sx - R, y]] : [[sx, yi], [sx, yi > y ? y + R : y - R]];
          out.push({ type: "wire", points: [[x + LEAD + l.w, yi], ...end], arrow: true });
          const s = signs[i] < 0 ? "−" : "+";
          signMarks.push(Math.abs(offsets[i]) < 1e-9 ? { at: [sx - R - 0.12, y + 0.3], text: s } : { at: [sx + 0.2, yi > y ? y + R + 0.14 : y - R - 0.14], text: s });
        });
        out.push({ type: "pickoff", at: [x, y] });
        out.push({ type: "sumjunction", at: [sx, y], r: R, signs: signMarks });
        ctx.boxes.set(node.src || node, [x - 0.1, y - down, x + w, y + up]);
      },
    };
  }
  // loop
  const F = layout(node.loop, ctx);
  const B = node.back ? layout(node.back, ctx) : null;
  const drop = Math.max(F.down, H / 2) + 0.55 + (B ? B.up : 0); // signal line to the feedback line
  const w = 2 * R + GAP + F.w + 0.45 + 0.4;
  const down = drop + (B ? B.down : 0);
  return {
    w, up: F.up, down,
    place(x, y, out) {
      const cx = x + R; // summing junction centre
      const fx = x + 2 * R + GAP; // forward path starts
      const xo = fx + F.w; // forward path ends
      const xp = xo + 0.45; // pickoff point
      const yb = y - drop; // feedback line
      out.push({ type: "sumjunction", at: [cx, y], r: R, signs: [
        { at: [cx - R - 0.12, y + 0.3], text: "+" },
        { at: [cx - 0.26, y - R - 0.16], text: (node.sign ?? -1) < 0 ? "−" : "+" },
      ] });
      out.push({ type: "wire", points: [[x + 2 * R, y], [fx, y]], arrow: true });
      F.place(fx, y, out);
      out.push({ type: "wire", points: [[xo, y], [x + w, y]] });
      out.push({ type: "pickoff", at: [xp, y] });
      if (B) {
        const bx = (cx + xp) / 2 - B.w / 2; // feedback block, centred under the loop
        out.push({ type: "wire", points: [[xp, y], [xp, yb], [bx + B.w, yb]], arrow: true });
        B.place(bx, yb, out); // (a block is the same drawn either way round)
        out.push({ type: "wire", points: [[bx, yb], [cx, yb], [cx, y - R]], arrow: true });
      } else {
        out.push({ type: "wire", points: [[xp, y], [xp, yb], [cx, yb], [cx, y - R]], arrow: true });
      }
      ctx.boxes.set(node.src || node, [x, y - down, x + w, y + this.up]);
    },
  };
}

// Every shape for the picture.
// opts.highlightStep: outline that group (default: the next one to reduce,
// when setup.reduce is set).
export function blockScene(setup, result, opts = {}) {
  const n = setup.reduce ?? 0;
  const { diagram, red } = partialDiagram(setup, n);
  const ctx = { params: setup.params || {}, boxes: new Map() };
  const L = layout(diagram, ctx);
  const shapes = [];
  const IN = 1.1, OUT = 1.1;
  shapes.push({ type: "wire", points: [[-IN, 0], [0, 0]], arrow: true });
  shapes.push({ type: "signal", at: [-IN, 0.32], text: setup.input || "R(s)", align: "left" });
  L.place(0, 0, shapes);
  shapes.push({ type: "wire", points: [[L.w, 0], [L.w + OUT, 0]], arrow: true });
  shapes.push({ type: "signal", at: [L.w + OUT, 0.32], text: setup.output || "C(s)", align: "right" });
  // Outline the next group to reduce, with its rule.
  const next = opts.highlightStep ?? (setup.reduce != null ? n : null);
  const step = next != null && red.steps[next];
  if (step) {
    const box = ctx.boxes.get(step.node);
    if (box) shapes.push({ type: "groupbox", from: [box[0] - 0.12, box[1] - 0.12], to: [box[2] + 0.12, box[3] + 0.12], label: `next: ${ruleName(step.kind)}` });
  }
  // A frame around everything (with room for the labels), for fitting the view.
  shapes.push({ type: "frame", frame: { xmin: -IN - 0.3, xmax: L.w + OUT + 0.3, ymin: -L.down - 0.5, ymax: L.up + 0.8 } });
  return shapes;
}
