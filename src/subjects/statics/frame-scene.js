// frame-scene.js — the picture of a frame or machine (Unit 5.4), its free-body
// diagram tool, and the lines under the equations.
//
// Two ways to look at it (setup.view):
//   "assembled"  the frame as built: bodies (wide bars), the two-force links (thin
//                bars, red or blue once solved), pins, supports, loads, reactions;
//   "apart"      taken apart: each body moved by setup.apart[bodyId], with the
//                forces the others put on it — at a shared pin, C_x and C_y on one
//                body and the same two, reversed, on the other; a link's force along
//                the link at each end (pulling = tension).
// setup.body ("BC"): the body a stage works on is drawn solid, the others faintly,
// with its own forces as arrows ("?" until solved).

import { add, sub, scale, mag, unit } from "../../core/vector.js";
import { format, fixedTex } from "../../core/units.js";
import { placeArrow } from "../../render/fbd.js";
import { directionVector } from "./directions.js";
import { magnitudeOf, directionOf } from "./particle.js";
import { solveFrame, forcesOn, frameReactions, frameSize, linkEnds } from "./frame.js";

const tc = (v) => (Math.abs(v) < 1e-6 ? "" : v > 0 ? " (T)" : " (C)");
const centre = (pts) => scale(pts.reduce((a, p) => add(a, p), [0, 0]), 1 / Math.max(1, pts.length));

export function frameScene(setup, result, opts = {}) {
  const res = result || solveFrame(setup);
  const size = frameSize(setup);
  const solved = opts.reveal && res.status === "determinate";
  const apart = setup.view === "apart";
  const hide = opts.hide || [];
  const len = 0.16 * size;
  const shapes = [{ type: "axes" }];
  const off = (bodyId) => (apart && setup.apart && setup.apart[bodyId]) || [0, 0];
  const faint = (bodyId) => setup.body && setup.body !== bodyId;
  const shownReactions = setup.showReactions !== "reveal" || opts.reveal;
  // (Dimensions describe the frame put together: none when it's taken apart.)
  if (!apart) for (const d of setup.dims || []) shapes.push({ type: "dim", from: d.from, to: d.to, label: d.label || format(mag(sub(d.to, d.from)), "m") });

  // Bodies, and their supports.
  for (const b of setup.bodies || []) {
    const o = off(b.id);
    shapes.push({ type: "beam", points: b.points.map((p) => add(p, o)), width: 14, ...(faint(b.id) ? { alpha: 0.25 } : {}) });
  }
  for (const s of setup.supports || []) {
    shapes.push({ type: "supportSymbol", kind: s.type, at: add(s.at, off(s.body)), normal: s.normal || [0, 1], label: s.id, alpha: faint(s.body) ? 0.25 : 1 });
  }
  // Links (two-force members): a bar when assembled; taken apart, just their pulls (below).
  const mid0 = centre((setup.bodies || []).flatMap((b) => b.points));
  if (!apart) {
    for (const l of setup.links || []) {
      const v = res.values[`F_${l.id}`];
      const state = solved ? (Math.abs(v) < 1e-6 ? "zero" : v > 0 ? "tension" : "compression") : null;
      const e = linkEnds(setup, l);
      shapes.push({ type: "member", id: `F_${l.id}`, from: e[l.from], to: e[l.to], state, label: solved && !setup.body ? `${format(Math.abs(v), "N")}${tc(v)}` : null, side: sub(centre(Object.values(e)), mid0), alpha: setup.body ? 0.35 : 1 });
    }
  }
  // Pins and link ends, named (on every body they belong to, when taken apart).
  const named = new Map();
  for (const p of setup.pins || []) for (const bid of apart ? p.bodies : [p.bodies[0]]) named.set(`${p.id}-${bid}`, { at: add(p.at, off(bid)), label: p.id });
  for (const l of setup.links || []) {
    const e = linkEnds(setup, l);
    named.set(`${l.from}-${l.bodies[0]}`, { at: add(e[l.from], off(l.bodies[0])), label: l.from });
    named.set(`${l.to}-${l.bodies[1]}`, { at: add(e[l.to], off(l.bodies[1])), label: l.to });
  }
  const mid = centre((setup.bodies || []).flatMap((b) => b.points));
  for (const n of named.values()) shapes.push({ type: "point", at: n.at, label: n.label, style: "ring", labelAway: sub(n.at, mid) });

  // Loads.
  for (const f of setup.forces || []) {
    const u = directionOf(f), o = off(f.body);
    const at = add(f.at, o), tail = f.push ? sub(at, scale(u, len)) : at;
    shapes.push({ type: "arrow", id: f.id, from: tail, to: add(tail, scale(u, len)), role: "known", onBody: !!f.push, label: `${f.symbol} = ${format(magnitudeOf(f), "N")}`, ...(faint(f.body) ? { alpha: 0.3 } : {}) });
  }

  // The forces bodies put on each other, and the reactions: taken apart — on every
  // body; assembled — the reactions only (or all of the stage's body's forces).
  const isReaction = new Set(frameReactions(setup).map((r) => r.id));
  const val = (id) => (solved || (setup.knownReactions && res.status === "determinate" && isReaction.has(id)) ? res.values[id] : null);
  const arrowsFor = (bodyId, which) => {
    for (const f of forcesOn(setup, bodyId)) {
      if (hide.includes(f.id) || !which(f)) continue;
      if (!f.pin && !f.link && !f.reaction) continue; // (loads are drawn above)
      if (f.reaction && !shownReactions) continue;
      const v = val(f.id);
      let dir = directionVector(f.direction);
      if (v != null && v < 0) dir = scale(dir, -1);
      const at = add(f.at, off(bodyId));
      const b = (setup.bodies || []).find((x) => x.id === bodyId);
      const away = unit(sub(at, centre(b.points.map((p) => add(p, off(bodyId))))));
      const place = f.reaction ? placeArrow(at, dir, len, mag(away) > 0 ? away : [0, -1]) : { from: at, to: add(at, scale(dir, len)) };
      const size = v == null ? "?" : format(Math.abs(v), "N") + (f.link ? tc(v) : "");
      shapes.push({ type: "arrow", id: f.id, ...place, role: "unknown", label: `${f.symbol} = ${size}` });
    }
  };
  for (const b of setup.bodies || []) {
    if (apart) arrowsFor(b.id, () => true);
    else if (setup.body === b.id) arrowsFor(b.id, () => true);
    else arrowsFor(b.id, (f) => f.reaction);
  }
  if (solved && !apart && (setup.links || []).length) shapes.push({ type: "note", lines: [{ text: "red: tension (pulls)", role: "tension" }, { text: "blue: compression (pushes)", role: "compression" }] });
  return shapes;
}

// ---- The FBD of the stage's body (solve challenge) ------------------------------------

export function frameFbd(setup) {
  const b = setup.bodies.find((x) => x.id === setup.body);
  const mid = centre(b.points);
  const forces = forcesOn(setup, b.id).filter((f) => f.value == null || f.reaction).map((f) => {
    const dir = directionVector(f.direction);
    const away = unit(sub(f.at, mid));
    return { id: f.id, symbol: f.symbol, dir, at: f.at, outward: f.reaction ? away : dir, either: true, kind: f.link ? "member" : f.reaction ? "component" : "pin" };
  });
  const directions = [];
  for (let i = 0; i < 8; i++) directions.push([Math.cos((i * Math.PI) / 4), Math.sin((i * Math.PI) / 4)]);
  for (const f of forces) directions.push(f.dir, scale(f.dir, -1));
  const points = {};
  for (const p of setup.pins || []) points[p.id] = { at: p.at, outward: unit(sub(p.at, mid)) };
  for (const s of setup.supports || []) points[s.id] = { at: s.at, outward: unit(sub(s.at, mid)) };
  for (const l of setup.links || []) for (const [n, at] of Object.entries(linkEnds(setup, l))) points[n] = { at, outward: unit(sub(at, mid)) };
  return { forces, directions, points, arrowLength: 0.16 * frameSize(setup), origin: mid };
}

// ---- Lines under the equations ------------------------------------------------------

export function frameSummary(setup, result, { reveal = true } = {}) {
  const v = result.values;
  const lines = [`\\text{Unknowns: } ${v.n} \\qquad \\text{Equations: } ${(setup.bodies || []).length} \\times 3 = ${v.eqs}`];
  if (setup.showTwoForce && (setup.links || []).length) {
    lines.push(`\\text{Two-force member${setup.links.length > 1 ? "s" : ""}: } ${setup.links.map((l) => l.id).join(",\\ ")} \\text{ — one force along ${setup.links.length > 1 ? "each" : "it"}}`);
  }
  if (reveal && result.status === "determinate") {
    const ids = setup.body ? result.equations.flatMap((e) => e.terms.filter((t) => t.value == null).map((t) => t.id)) : result.unknowns;
    lines.push([...new Set(ids)].map((id) => `${id.startsWith("F_") ? `F_{${id.slice(2)}}` : id} = ${fixedTex(v[id], "N")}`).join(",\\quad "));
  }
  return lines;
}
