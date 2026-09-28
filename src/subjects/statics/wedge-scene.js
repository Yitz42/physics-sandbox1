// wedge-scene.js — the picture for a wedge lifting a block (Unit 9.3; physics in wedge.js).
//
// Left, the MODEL: the floor, the guide wall, the wedge (thin end under the wall) and the
// block resting on it, with the push P on the wedge's thick end and the slope α.
// Right (once needed), the FREE-BODY DIAGRAMS of the two bodies taken apart — the block
// lifted clear above the wedge — with each contact's normal force N and friction F. The
// arrows are all one length (they show directions; the sizes are in the labels), because
// the forces differ too much to draw to scale in one small picture.

import { add, sub, scale } from "../../core/vector.js";
import { format } from "../../core/units.js";
import { spreadPanels, shiftShape } from "../../render/panels.js";
import { solveWedge, weightOn, musOf } from "./wedge.js";

const deg = Math.PI / 180;

// The corners of both bodies (metres). The wall is the line x = 0; the wedge's thin end
// (its tip) is at x = tip < 0, under the wall; its top face rises at α.
export function wedgeGeometry(setup) {
  const a = setup.wedge.angle * deg;
  const Lw = setup.wedge.length || 1.6, tip = setup.wedge.tip ?? -0.3;
  const { w, h } = setup.block || { w: 1, h: 0.7 };
  const top = (x) => (x - tip) * Math.tan(a); // the wedge's top face
  const wedge = [[tip, 0], [tip + Lw, 0], [tip + Lw, top(tip + Lw)]];
  const block = [[0, top(0)], [w, top(w)], [w, top(w) + h], [0, top(w) + h]];
  return { a, Lw, tip, w, h, top, wedge, block };
}

const centroid = (pts) => [pts.reduce((s, p) => s + p[0], 0) / pts.length, pts.reduce((s, p) => s + p[1], 0) / pts.length];

export function wedgeScene(setup, result, opts = {}) {
  const res = result || solveWedge(setup);
  const v = res.values;
  const g = wedgeGeometry(setup);
  const s = setup.motion === "out" ? -1 : 1;
  const size = g.tip + g.Lw + 0.6;
  const len = 0.32 * size / 2.2; // every FBD arrow's length
  const known = opts.reveal && res.status === "determinate";
  const val = (x) => (known ? ` = ${format(Math.abs(x), "N")}` : "");
  const { m1, m2, m3 } = musOf(setup);

  // ---- The model ----
  const model = [];
  model.push({ type: "support", from: [g.tip - 0.35, 0], to: [g.tip + g.Lw + 0.55, 0], normal: [0, 1], rough: m3 > 0 });
  const wallTop = g.block[2][1] + 0.25;
  model.push({ type: "support", from: [0, g.top(0) + 0.07], to: [0, wallTop], normal: [1, 0], rough: m2 > 0 });
  model.push({ type: "polygon", points: g.wedge, stroke: "ink", lineWidth: 2 });
  model.push({ type: "polygon", points: g.block, stroke: "ink", lineWidth: 2, label: setup.block && setup.block.label != null ? setup.block.label : "" });
  model.push({ type: "arc", center: [g.tip, 0], r: 0.55, start: 0, end: setup.wedge.angle, label: format(setup.wedge.angle, "deg") });
  // P on the wedge's thick end: a push (in, to the left) or a pull (out, to the right).
  const Pat = [g.tip + g.Lw, g.top(g.tip + g.Lw) / 2];
  const Pshown = setup.motion === "out" ? "P_out" : "P";
  const Pval = known ? ` = ${format(setup.motion === "out" ? v.Pout : v.P, "N")}` : " = ?";
  if (setup.motion === "out") model.push({ type: "arrow", id: "P", from: Pat, to: add(Pat, [0.5, 0]), role: "unknown", label: `${Pshown}${Pval}` });
  else model.push({ type: "arrow", id: "P", from: add(Pat, [0.5, 0]), to: Pat, onBody: true, role: "unknown", label: `${Pshown}${Pval}` });
  model.push({ type: "note", lines: [`W = ${format(weightOn(setup), "N")}`, m1 === m2 && m2 === m3 ? `μ_s = ${m1} (every surface)` : `μ: wedge ${m1}, wall ${m2}, floor ${m3}`] });

  const left = [g.tip - 0.4, g.tip + g.Lw + 1.1];
  const yTop = wallTop + 0.3;
  const needed = setup.showFbd === "always" || opts.reveal || opts.showFbd;
  if (!needed) return [{ type: "axes" }, ...model, { type: "frame", frame: { xmin: left[0], xmax: left[1], ymin: -0.35, ymax: yTop } }];

  // ---- The FBDs: the block lifted clear of the wedge ----
  const lift = 0.55;
  const up = (p) => [p[0], p[1] + lift];
  const block = g.block.map(up);
  const fbd = [{ type: "polygon", points: g.wedge, stroke: "ink", lineWidth: 2 }, { type: "polygon", points: block, stroke: "ink", lineWidth: 2 }];
  const n1 = [-Math.sin(g.a), Math.cos(g.a)], t1 = [Math.cos(g.a), Math.sin(g.a)];
  const role = "unknown";
  // Block: N₁ pushes up into its bottom face, F₁ along that face (against its sliding),
  // N₂ from the wall, F₂ along the wall, W at its centre.
  const bMid = up([g.w * 0.55, g.top(g.w * 0.55)]);
  fbd.push({ type: "arrow", id: "N1", from: sub(bMid, scale(n1, len)), to: bMid, onBody: true, role, label: `N_1${val(v.N1)}` });
  const bF = up([g.w, g.top(g.w)]);
  const fOnBlock = scale(t1, -s);
  fbd.push({ type: "arrow", id: "F1", from: s > 0 ? add(bF, scale(fOnBlock, -0.02)) : up([0, g.top(0)]), to: add(s > 0 ? bF : up([0, g.top(0)]), scale(fOnBlock, len)), role, label: `F_1${val(v.F1)}` });
  const wallPt = up([0, g.top(0) + 0.6 * (g.h + g.top(g.w) - g.top(0))]);
  fbd.push({ type: "arrow", id: "N2", from: add(wallPt, [-len, 0]), to: wallPt, onBody: true, role, label: `N_2${val(v.N2)}` });
  const wallLow = up([0, g.top(0) + 0.2 * g.h]);
  fbd.push({ type: "arrow", id: "F2", from: add(wallLow, [-0.08, 0]), to: add(wallLow, [-0.08, -s * len]), role, label: `F_2${val(v.F2)}` });
  const G = centroid(block);
  fbd.push({ type: "arrow", id: "W", from: G, to: add(G, [0, -len]), role: "known", label: `W = ${format(v.W, "N")}` });
  // Wedge: N₁ and F₁ back on it (equal and opposite), N₃ and F₃ from the floor, and P.
  const wMid = [g.w * 0.55, g.top(g.w * 0.55)];
  fbd.push({ type: "arrow", id: "N1", from: add(wMid, scale(n1, len)), to: wMid, onBody: true, role, label: `N_1` });
  const floorPt = [g.tip + 0.62 * g.Lw, 0];
  fbd.push({ type: "arrow", id: "N3", from: add(floorPt, [0, -len]), to: floorPt, onBody: true, role, label: `N_3${val(v.N3)}` });
  const floorF = [g.tip + g.Lw, 0];
  fbd.push({ type: "arrow", id: "F3", from: s > 0 ? floorF : [g.tip, 0], to: add(s > 0 ? floorF : [g.tip, 0], [s * len, 0]), role, label: `F_3${val(v.F3)}` });
  const wTopEnd = [g.tip + g.Lw, g.top(g.tip + g.Lw)];
  fbd.push({ type: "arrow", id: "F1", from: s > 0 ? [g.tip + 0.25 * g.Lw, g.top(g.tip + 0.25 * g.Lw)] : wTopEnd, to: add(s > 0 ? [g.tip + 0.25 * g.Lw, g.top(g.tip + 0.25 * g.Lw)] : wTopEnd, scale(t1, s * len)), role, label: "F_1" });
  if (setup.motion === "out") fbd.push({ type: "arrow", id: "P", from: Pat, to: add(Pat, [len, 0]), role, label: "P_out" });
  else fbd.push({ type: "arrow", id: "P", from: add(Pat, [len, 0]), to: Pat, onBody: true, role, label: `P${known ? ` = ${format(v.P, "N")}` : ""}` });

  // The FBDs' own box, from the geometry (so the answers never resize it).
  const right0 = [g.tip - 0.45, g.tip + g.Lw + 0.75];
  const offset = left[1] - right0[0] + 0.15;
  const right = [right0[0] + offset, right0[1] + offset];
  const capY = -0.45;
  const shapes = [{ type: "axes" }, ...model.map((q) => ({ ...q, panel: "left" })), ...fbd.map((q) => ({ ...shiftShape(q, offset), panel: "right" })),
    { type: "text", at: [(left[0] + left[1]) / 2, capY], text: "Model", panel: "left" },
    { type: "text", at: [(right[0] + right[1]) / 2, capY], text: "Free-body diagrams", panel: "right", caption: true }];
  return spreadPanels(shapes, { divider: left[1] + 0.07, left, right, y: [capY - 0.12, Math.max(yTop, block[2][1] + 0.35)], margin: 0.08, size: opts.canvasSize,
    rightY: [capY + 0.05, block[2][1] + 0.35], capTop: capY + 0.1 });
}
