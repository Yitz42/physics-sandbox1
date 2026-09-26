// workspace.js — the shared "picture + equations" area every challenge uses.
//
// It keeps the current setup, asks the stage's solver to solve it, draws the
// scene, lists the equations (symbols or numbers), and links the two:
// clicking an arrow lights up its terms, clicking a term lights up its arrow.
// Sliders and draggable arrow tips edit the setup and everything updates live.

import { clone } from "../../core/paths.js";
import { boundsOf } from "../../render/canvas.js";
import { drawScene } from "../../render/diagrams.js";
import { arrowAt } from "../../render/fbd.js";
import { renderEquations, highlightTerms } from "../../render/panel.js";
import { buildControls, toggle, el, button } from "../../ui/controls.js";
import { mag, sub } from "../../core/vector.js";

// opts:
//   editable      list of slider/select specs (see ui/controls.js), or []
//   draggable     force ids whose arrow tips can be dragged
//   equations     "live" (always shown) | "hidden" (shown after reveal) | "never"
//   reveal        show unknown values and results from the start?
//   sceneOpts     extra options passed to solver.scene
//   onChange(result)   called after every edit
export function createWorkspace(ctx, opts = {}) {
  const { solver, canvas: cv } = ctx;
  const ws = {
    setup: clone(ctx.setup),
    result: solver.solve(ctx.setup),
    reveal: !!opts.reveal,
    mode: "symbolic",
    highlight: null,
    sceneOpts: { ...(opts.sceneOpts || {}) },
    extraShapes: () => [], // challenges can add shapes (e.g. the student's FBD)
    onPointer: null, // challenges can take over the pointer: { down, move, up } returning true if handled
    shapes: [],
  };
  let showEqs = opts.equations === "live" || (opts.equations === "hidden" && ws.reveal);
  let dragging = null;

  // ---- Equations box -------------------------------------------------------
  const eqBox = ctx.el.equations;
  eqBox.innerHTML = "";
  const eqList = el("div", { className: "eq-list" });
  const eqStatus = el("div", { className: "eq-status" });
  const head = el("div", { className: "eq-head" }, [
    el("span", { className: "eq-title", textContent: "Equations" }),
    toggle([{ label: "Symbols", value: "symbolic" }, { label: "Numbers", value: "numeric" }], "symbolic", (m) => {
      ws.mode = m;
      renderEqs();
    }),
  ]);
  eqBox.append(head, eqList, eqStatus);

  function renderEqs() {
    eqBox.hidden = opts.equations === "never" || !showEqs || !solver.equations;
    if (eqBox.hidden) return;
    const eqs = solver.equations(ws.setup, ws.result);
    const extra = solver.summary ? solver.summary(ws.setup, ws.result, { mode: ws.mode, reveal: ws.reveal }) : [];
    renderEquations(eqList, eqs, {
      mode: ws.mode, extra, showResult: ws.reveal,
      onTermClick: (id) => ws.setHighlight(ws.highlight === id ? null : id),
    });
    highlightTerms(eqList, ws.highlight);
    eqStatus.textContent = ws.reveal && ws.result.message ? ws.result.message : "";
  }

  // ---- Picture ---------------------------------------------------------------
  function draw() {
    const scene = solver.scene ? solver.scene(ws.setup, ws.result, { ...ws.sceneOpts, reveal: ws.reveal }) : [];
    const handles = (solver.handles ? solver.handles(ws.setup, opts.draggable || []) : []).map((h) => ({ type: "handle", at: h.at, id: h.id }));
    ws.shapes = [...scene, ...ws.extraShapes(), ...handles];
    drawScene(cv, ws.shapes, { highlight: ws.highlight });
  }
  cv.onRedraw(draw);

  // Fit the view once (not on every edit, or the picture would jump around).
  ws.fit = () => {
    if (ctx.stage.view) return cv.fit(ctx.stage.view);
    const all = solver.scene(ws.setup, solver.solve(ws.setup), { ...ws.sceneOpts, reveal: true });
    cv.fit(boundsOf([...all, ...ws.extraShapes()], 0.8)); // margin leaves room for labels
  };

  ws.update = () => {
    ws.result = solver.solve(ws.setup);
    draw();
    renderEqs();
    if (controls) controls.syncAll();
    if (opts.onChange) opts.onChange(ws.result);
  };
  ws.redraw = draw;
  ws.setReveal = (on) => {
    ws.reveal = on;
    if (on && opts.equations === "hidden") showEqs = true;
    ws.update();
  };
  ws.showEquations = (on) => {
    showEqs = on;
    renderEqs();
  };
  ws.setHighlight = (id) => {
    ws.highlight = id;
    draw();
    highlightTerms(eqList, id);
  };
  ws.setSetup = (s, refit = false) => {
    ws.setup = s;
    if (refit) ws.fit();
    ws.update();
  };

  // ---- Sliders ---------------------------------------------------------------
  let controls = null;
  if (opts.editable && opts.editable.length) {
    ctx.el.controls.innerHTML = "";
    controls = buildControls(ctx.el.controls, () => ws.setup, opts.editable, () => ws.update());
  }

  // ---- Pointer: drag tips, click arrows ---------------------------------------
  cv.onPointer({
    down(p, e) {
      if (ws.onPointer && ws.onPointer.down && ws.onPointer.down(p, e)) return;
      const tol = cv.pxToWorld(14);
      const h = ws.shapes.find((s) => s.type === "handle" && mag(sub(s.at, p)) < tol);
      if (h) {
        dragging = h.id;
        ws.highlight = h.id;
        return;
      }
      const hit = arrowAt(ws.shapes, p, cv.pxToWorld(10));
      ws.setHighlight(hit && hit.id !== ws.highlight ? hit.id : null);
    },
    move(p, e) {
      if (dragging) {
        solver.drag(ws.setup, dragging, p);
        ws.update();
        return;
      }
      if (ws.onPointer && ws.onPointer.move) ws.onPointer.move(p, e);
      const overHandle = ws.shapes.some((s) => s.type === "handle" && mag(sub(s.at, p)) < cv.pxToWorld(14));
      cv.canvas.style.cursor = overHandle ? "grab" : "";
    },
    up(p, e) {
      if (dragging) {
        dragging = null;
        return;
      }
      if (ws.onPointer && ws.onPointer.up) ws.onPointer.up(p, e);
    },
  });

  // ---- Show/hide buttons under the picture (stage.toggles) --------------------
  // e.g. toggles: [{ key: "arms", label: "how d is found" }] adds a button
  // "Show how d is found" that switches sceneOpts.arms on and off.
  const old = ctx.el.figure.parentNode.querySelector(".figure-tools");
  if (old) old.remove();
  if (ctx.stage.toggles && ctx.stage.toggles.length) {
    const bar = el("div", { className: "figure-tools" });
    for (const t of ctx.stage.toggles) {
      const b = button("", () => {
        ws.sceneOpts[t.key] = !ws.sceneOpts[t.key];
        label();
        ws.redraw();
      }, "btn btn-quiet btn-small");
      const label = () => (b.textContent = `${ws.sceneOpts[t.key] ? "Hide" : "Show"} ${t.label}`);
      label();
      bar.appendChild(b);
    }
    ctx.el.figure.after(bar);
  }

  ws.fit();
  ws.update();
  return ws;
}
