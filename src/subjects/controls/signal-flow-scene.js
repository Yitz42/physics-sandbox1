// signal-flow-scene.js — the picture of a signal-flow graph.
//
// Nodes are dots with their signal's name; branches are curved arrows labelled
// with their gain. setup.show picks what to light up (explore stages):
//   { kind: "paths", index }  one forward path      { kind: "loops", index }  one loop
//   { kind: "sets", index }   one set of non-touching loops
// index: which one (counted from 0); an index past the end lights up none.
// setup.showValues: list every gain's number in a key.

import { mason } from "./signal-flow.js";

// A gain as plain text for the picture: "G1" → "G_1", "-H1" → "−H_1".
function gainLabel(setup, g) {
  if (typeof g === "number") return String(g).replace("-", "−");
  const syms = setup.symbols || {};
  const t = String(g).trim();
  const neg = t.startsWith("-");
  const id = neg ? t.slice(1) : t;
  const name = (syms[id] && syms[id].label) || id.replace(/^([A-Za-z]+)(\d+)$/, "$1_$2");
  return (neg ? "−" : "") + name;
}

// Which branches and nodes setup.show lights up (or null: nothing chosen).
export function litParts(setup, m = mason(setup)) {
  const show = setup.show;
  if (!show || show.kind === "none") return null;
  const pick = (list) => list[show.index];
  if (show.kind === "paths") {
    const p = pick(m.paths);
    return p ? { branches: p.branches, nodes: p.nodes } : { branches: [], nodes: [] };
  }
  if (show.kind === "loops") {
    const l = pick(m.loops);
    return l ? { branches: l.branches, nodes: l.nodes } : { branches: [], nodes: [] };
  }
  const set = pick(m.nonTouching);
  if (!set) return { branches: [], nodes: [] };
  return { branches: set.flatMap((i) => m.loops[i].branches), nodes: set.flatMap((i) => m.loops[i].nodes) };
}

export function signalScene(setup, result, opts = {}) {
  const m = result ? result.mason : mason(setup);
  const lit = litParts(setup, m);
  const at = Object.fromEntries(setup.nodes.map((n) => [n.id, n.at]));
  const shapes = [];
  setup.branches.forEach((b, i) => {
    const role = lit ? (lit.branches.includes(i) ? "on" : "off") : null;
    shapes.push({ type: "sfgbranch", from: at[b.from], to: at[b.to], bend: b.bend || 0, label: gainLabel(setup, b.gain), role });
  });
  for (const n of setup.nodes) {
    shapes.push({ type: "sfgnode", at: n.at, label: n.label ?? n.id, labelAt: n.labelAt, role: lit && lit.nodes.includes(n.id) ? "on" : null });
  }
  // setup.showValues: a key with every gain's number, in a free corner.
  if (setup.showValues) {
    const syms = setup.symbols || {};
    const lines = Object.keys(syms).filter((id) => syms[id].value != null).map((id) => ({
      text: `${(syms[id].label || id.replace(/^([A-Za-z]+)(\d+)$/, "$1_$2"))} = ${syms[id].value}`,
    }));
    if (lines.length) shapes.push({ type: "note", lines });
  }
  // A frame around the graph, with room for bowed branches and labels.
  const xs = setup.nodes.map((n) => n.at[0]), ys = setup.nodes.map((n) => n.at[1]);
  const bows = setup.branches.map((b) => Math.abs(b.bend || 0));
  const pad = Math.max(0.8, ...bows.map((x) => x + 0.6));
  shapes.push({ type: "frame", frame: { xmin: Math.min(...xs) - 0.8, xmax: Math.max(...xs) + 0.8, ymin: Math.min(...ys) - pad, ymax: Math.max(...ys) + pad } });
  return shapes;
}

