// fbd-tool.js — the student draws a free-body diagram.
//
// How it works (decided with the course owner):
//   1. Click a force in the palette. A faint "shadow" arrow appears on the FBD
//      and follows the pointer, snapping to the allowed directions.
//   2. Click (or tap) on the picture to place it there.
//   Or: drag the force straight from the palette onto the picture (works with
//   a finger on touchscreens). Click a placed arrow to pick it up again.
//
// The palette also offers tempting wrong forces (e.g. a "normal force" where
// nothing is pushing), each with its own explanation.
//
// Rigid bodies (Unit 7 on): each force acts at its own point (a support, the
// centre of gravity), given by the solver's fbd() info (forces[].at) or, for a
// tempting wrong force, by the candidate's `at` (a point name from info.points).
// A moment (a fixed support's M_A) is a curved arrow: its button places it,
// and clicking it on the picture flips which way it turns. Where a force's
// sense doesn't matter (pin components, `either: true`) both ways are accepted.

import { studentArrows, arrowAt, snapDirection } from "../../render/fbd.js";
import { el, button } from "../../ui/controls.js";
import { renderTex } from "../../render/panel.js";
import { sameWay, wrongDirectionText, missingText } from "./fbd-feedback.js";

// candidates: [{ id, symbol?, feedback?, missing?, wrongDirection?, at?, moment? }]
// onCorrect(detail): called when the FBD is right. onWrong(problems, kinds, detail):
// called after a wrong check; kinds lists each mistake's kind ("extra",
// "direction", "missing", and more specific ones where they fit: "cablePull" a
// cable or spring drawn pushing, "pulleyTension" one side of a cable over a
// pulley left out, "supports" a reaction a support doesn't give, or doesn't
// give that way). detail: { pl, ef } — the arrows drawn and the arrows
// expected, for the learning record (see fbdRecord below).
export function createFbdTool(ctx, ws, candidates, { onCorrect, onWrong }) {
  const info = ctx.solver.fbd(ws.setup, ws.sceneOpts); // same layout as the picture
  const correct = new Map(info.forces.map((f) => [f.id, f]));
  const labelOf = (c) => c.symbol || (correct.get(c.id) || {}).symbol || c.id;
  const placed = new Map(); // id → direction (a unit vector), or a moment's sense (+1 / −1)
  let ghost = null; // { id, dir } while choosing a direction
  const candidate = (id) => candidates.find((c) => c.id === id) || {};
  // Where a force acts and which way is "outside" the body there.
  const spot = (id) => {
    const f = correct.get(id);
    if (f && f.at) return { at: f.at, outward: f.outward };
    const p = candidate(id).at && info.points && info.points[candidate(id).at];
    return p || { at: info.origin };
  };
  const isMoment = (id) => !!((correct.get(id) || {}).moment || candidate(id).moment);
  const drawn = (id, value) => ({ id, label: labelOf(candidate(id)), ...spot(id), ...(isMoment(id) ? { moment: true, sense: value } : { dir: value }) });
  let aiming = false; // finger/mouse is down on the canvas while a ghost is active

  // Hide the answer's arrows; the student's own arrows are drawn instead.
  ws.sceneOpts.hide = info.forces.map((f) => f.id);
  // (A picture that shows its FBD only when needed — a rigid body's — now needs it:
  // frame the picture again.)
  if (ws.framed) ws.fit();
  ws.extraShapes = () =>
    studentArrows({
      origin: info.origin,
      length: info.arrowLength,
      placed: [...placed].map(([id, v]) => drawn(id, v)),
      ghost: ghost && drawn(ghost.id, ghost.dir),
    });

  // ---- Palette ------------------------------------------------------------------
  const palette = el("div", { className: "palette" });
  const buttons = new Map();
  for (const c of candidates) {
    const b = el("button", { type: "button", className: "palette-btn" });
    renderTex(b, labelOf(c));
    b.addEventListener("pointerdown", (e) => startFromPalette(c.id, e));
    palette.appendChild(b);
    buttons.set(c.id, b);
  }
  const hint = el("div", { className: "palette-hint", textContent: "Click a force, then click on the picture to place it (or drag it there). Click a placed arrow to move it; press its button again to remove it." });
  const actions = el("div", { className: "actions" }, [button("Check FBD", check, "btn btn-play"), button("Clear", clear, "btn btn-quiet")]);
  const box = el("div", { className: "fbd-tool" }, [palette, hint, actions]);

  function refresh() {
    buttons.forEach((b, id) => {
      b.classList.toggle("placed", placed.has(id));
      b.classList.toggle("active", !!ghost && ghost.id === id);
    });
    ws.redraw();
  }

  function startGhost(id) {
    placed.delete(id);
    ghost = { id, dir: [0, 1] }; // starts pointing up until the pointer moves
    refresh();
  }
  // Snap the shadow arrow toward the pointer, from the point where the force acts.
  const aim = (p) => (ghost.dir = snapDirection(spot(ghost.id).at, p, info.directions));

  function place() {
    if (!ghost) return;
    placed.set(ghost.id, ghost.dir);
    ghost = null;
    refresh();
  }

  // Dragging from the palette: follow the pointer over the whole window.
  function startFromPalette(id, e) {
    e.preventDefault();
    if (isMoment(id)) {
      // A moment has no direction to aim: its button places it (counterclockwise)
      // or, pressed again, removes it. Clicking it on the picture flips it.
      if (placed.has(id)) placed.delete(id);
      else placed.set(id, 1);
      ghost = null;
      refresh();
      return;
    }
    if (ghost && ghost.id === id) {
      ghost = null; // pressing the same force again cancels
      refresh();
      return;
    }
    startGhost(id);
    const x0 = e.clientX, y0 = e.clientY;
    let moved = false;
    const move = (ev) => {
      if (Math.hypot(ev.clientX - x0, ev.clientY - y0) > 8) moved = true;
      if (ghost && ctx.canvas.isInside(ev.clientX, ev.clientY)) {
        aim(ctx.canvas.clientToWorld(ev.clientX, ev.clientY));
        ws.redraw();
      }
    };
    const up = (ev) => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      if (!moved) return; // a plain click: keep the shadow arrow, place it with the next click
      if (ctx.canvas.isInside(ev.clientX, ev.clientY)) place();
      else {
        ghost = null; // dropped outside the picture: cancel
        refresh();
      }
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  }

  // Pointer on the canvas itself.
  ws.onPointer = {
    down(p) {
      if (ghost) {
        aiming = true;
        aim(p);
        ws.redraw();
        return true;
      }
      const hit = arrowAt(ws.extraShapes(), p, ctx.canvas.pxToWorld(12), ctx.canvas.pxToWorld);
      if (hit && placed.has(hit.id) && isMoment(hit.id)) {
        placed.set(hit.id, -placed.get(hit.id)); // flip which way it turns
        refresh();
        return true;
      }
      if (hit && placed.has(hit.id)) {
        const dir = placed.get(hit.id);
        startGhost(hit.id); // pick it up to move it
        ghost.dir = dir;
        aiming = true;
        return true;
      }
      return false;
    },
    move(p) {
      if (!ghost) return;
      aim(p);
      ws.redraw();
    },
    up() {
      if (aiming) {
        aiming = false;
        place();
      }
    },
  };

  function clear() {
    placed.clear();
    ghost = null;
    refresh();
    ctx.el.feedback.innerHTML = "";
  }

  // ---- Checking -----------------------------------------------------------------
  // A support's reaction (or a force the palette places at a support) is about
  // "which reactions each support gives".
  const supportIds = new Set((ws.setup.supports || []).map((s) => s.id));
  const atSupport = (c, right) => !!((right && right.support) || (c.at && supportIds.has(c.at)));
  function check() {
    const problems = [];
    const kinds = []; // what sort of mistakes (see src/core/diagnosis.js), for comprehension
    const add = (...k) => k.forEach((x) => !kinds.includes(x) && kinds.push(x));
    const matches = sharedMatches();
    for (const [id, v] of placed) {
      const c = candidate(id);
      const right = correct.get(matches.get(id) || id);
      if (!right) {
        problems.push(c.feedback || `${labelOf(c)} doesn't act on this point.`);
        add("extra", ...(atSupport(c) ? ["supports"] : []));
      } else if (!sameWay(right, v)) {
        problems.push(c.wrongDirection || wrongDirectionText(right));
        add("direction");
        if (["cable", "spring", "pull"].includes(right.kind)) add("cablePull"); // cables and springs only pull
        else if (right.kind === "push" || atSupport(c, right)) add("supports"); // a roller or surface only pushes
      }
    }
    for (const f of info.forces) {
      if (!placed.has(f.id)) {
        const c = candidates.find((x) => x.id === f.id) || {};
        problems.push(c.missing || missingText(f));
        add("missing");
        if (f.shared) add("pulleyTension"); // one side of a cable over a pulley left out
        else if (atSupport(c, f)) add("supports");
      }
    }
    const detail = fbdRecord();
    if (problems.length === 0) {
      ghost = null;
      palette.querySelectorAll("button").forEach((b) => (b.disabled = true));
      actions.remove();
      hint.remove();
      onCorrect(detail);
    } else {
      onWrong(problems.slice(0, 2), kinds, detail);
    }
  }

  // For the learning record: every arrow drawn (pl) and every arrow expected
  // (ef), each { id, type, deg } — type: the kind of force ("cable", "weight",
  // "component", "push" …; "notActing" for a palette force that doesn't act
  // here), deg: its direction in degrees from +x, counterclockwise (a moment:
  // turn "ccw" / "cw"; either: true where a reaction may be drawn either way).
  function fbdRecord() {
    const way = (id, v) => (isMoment(id) ? { turn: v > 0 ? "ccw" : "cw" } : v ? { deg: Math.round(((Math.atan2(v[1], v[0]) * 180) / Math.PI + 360) % 360) } : {});
    return {
      pl: [...placed].map(([id, v]) => ({ id, type: (correct.get(id) || {}).kind || (correct.has(id) ? "force" : "notActing"), ...way(id, v) })),
      ef: info.forces.map((f) => ({ id: f.id, type: f.kind || "force", ...way(f.id, f.moment ? f.sense || 1 : f.dir), ...(f.either ? { either: true } : {}) })),
    };
  }

  // Forces that share one tension (both sides of a cable over a pulley) have the
  // same symbol, so their buttons look alike: an arrow placed with either button
  // counts for whichever of them it points along. Returns placed id → force id.
  function sharedMatches() {
    const out = new Map();
    const groups = new Set(info.forces.filter((f) => f.shared).map((f) => f.shared));
    for (const name of groups) {
      const ids = info.forces.filter((f) => f.shared === name).map((f) => f.id);
      const free = [...ids];
      for (const id of ids.filter((x) => placed.has(x))) {
        const k = free.findIndex((r) => sameWay(correct.get(r), placed.get(id)));
        if (k >= 0) out.set(id, free.splice(k, 1)[0]);
      }
    }
    return out;
  }

  return {
    element: box,
    // "Show answer": place the correct arrows.
    reveal() {
      placed.clear();
      info.forces.forEach((f) => placed.set(f.id, f.moment ? f.sense || 1 : f.dir));
      ghost = null;
      refresh();
      check();
    },
  };
}
