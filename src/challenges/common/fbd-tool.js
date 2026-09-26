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

import { studentArrows, arrowAt, snapDirection } from "../../render/fbd.js";
import { el, button } from "../../ui/controls.js";
import { renderTex } from "../../render/panel.js";
import { dot } from "../../core/vector.js";

const SAME_DIRECTION = Math.cos((3 * Math.PI) / 180); // within 3°

// candidates: [{ id, symbol?, feedback?, missing?, wrongDirection? }]
// onCorrect(): called when the FBD is right. onWrong(): called after a wrong check.
export function createFbdTool(ctx, ws, candidates, { onCorrect, onWrong }) {
  const info = ctx.solver.fbd(ws.setup, ws.sceneOpts); // same layout as the picture
  const correct = new Map(info.forces.map((f) => [f.id, f]));
  const labelOf = (c) => c.symbol || (correct.get(c.id) || {}).symbol || c.id;
  const placed = new Map(); // id → direction
  let ghost = null; // { id, dir } while choosing a direction
  let aiming = false; // finger/mouse is down on the canvas while a ghost is active

  // Hide the answer's arrows; the student's own arrows are drawn instead.
  ws.sceneOpts.hide = info.forces.map((f) => f.id);
  ws.extraShapes = () =>
    studentArrows({
      origin: info.origin,
      placed: [...placed].map(([id, dir]) => ({ id, dir, label: labelOf(candidates.find((c) => c.id === id)) })),
      ghost: ghost && { ...ghost, label: labelOf(candidates.find((c) => c.id === ghost.id)) },
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

  function place() {
    if (!ghost) return;
    placed.set(ghost.id, ghost.dir);
    ghost = null;
    refresh();
  }

  // Dragging from the palette: follow the pointer over the whole window.
  function startFromPalette(id, e) {
    e.preventDefault();
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
        ghost.dir = snapDirection(info.origin, ctx.canvas.clientToWorld(ev.clientX, ev.clientY), info.directions);
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
        ghost.dir = snapDirection(info.origin, p, info.directions);
        ws.redraw();
        return true;
      }
      const hit = arrowAt(ws.extraShapes(), p, ctx.canvas.pxToWorld(12));
      if (hit && placed.has(hit.id)) {
        startGhost(hit.id); // pick it up to move it
        ghost.dir = placed.get(hit.id) || snapDirection(info.origin, p, info.directions);
        aiming = true;
        return true;
      }
      return false;
    },
    move(p) {
      if (!ghost) return;
      ghost.dir = snapDirection(info.origin, p, info.directions);
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
  function check() {
    const problems = [];
    for (const [id, dir] of placed) {
      const c = candidates.find((x) => x.id === id);
      const right = correct.get(id);
      if (!right) problems.push(c.feedback || `${labelOf(c)} doesn't act on this point.`);
      else if (dot(dir, right.dir) < SAME_DIRECTION) problems.push(c.wrongDirection || wrongDirectionText(right));
    }
    for (const f of info.forces) {
      if (!placed.has(f.id)) {
        const c = candidates.find((x) => x.id === f.id) || {};
        problems.push(c.missing || missingText(f));
      }
    }
    if (problems.length === 0) {
      ghost = null;
      palette.querySelectorAll("button").forEach((b) => (b.disabled = true));
      actions.remove();
      hint.remove();
      onCorrect();
    } else {
      onWrong(problems.slice(0, 2));
    }
  }

  return {
    element: box,
    // "Show answer": place the correct arrows.
    reveal() {
      placed.clear();
      info.forces.forEach((f) => placed.set(f.id, f.dir));
      ghost = null;
      refresh();
      check();
    },
  };
}

function wrongDirectionText(f) {
  if (f.kind === "cable") return "A cable can only **pull**: its arrow points away from the point, along the cable.";
  if (f.kind === "weight") return "Weight always points **straight down**, toward the Earth.";
  return "One arrow points the wrong way. Compare each arrow's direction with the picture.";
}

function missingText(f) {
  if (f.kind === "weight") return "A force is missing. What does gravity do to the hanging object?";
  if (f.kind === "cable") return "A force is missing. Every cable attached to the point pulls on it.";
  return "A force is missing. Look at everything touching or pulling on the point.";
}
