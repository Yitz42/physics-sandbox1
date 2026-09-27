// workbench.js — the block diagram workbench: build a diagram, then combine it.
//
// Used by a build stage with `workbench: true` (build.js hands over), and by
// the free workbench page. The student:
//   1. makes a block (a name, and a transfer function if they like), chooses
//      how it connects, and drags it onto a block or group in the picture — or
//      clicks it, hovers over the picture (a preview shows what would happen)
//      and clicks a spot to put it in;
//   2. clicks the blocks of one simple group, names the rule (series, parallel,
//      feedback loop) and writes the combined block's formula; it's checked,
//      a wrong one is explained, and the group becomes one block, G_e1, G_e2 …
// Stage fields used:
//   setup: { diagram (a starting diagram, or null), input?, output? }
//   goal (optional): { text, check({ tree, T, oneBlock, combined }) → { ok, message } }
//     T: the whole diagram's transfer function { sym, numeric }; without a goal
//     there's no Test button (the free page).
// Everything about block diagrams comes from the solver (solver.workbench).

import { createWorkspace } from "./common/workspace.js";
import { createAttempts } from "./common/attempts.js";
import { makePanel, formulaPanel, formulasList } from "./common/workbench-parts.js";
import { createCanvas } from "../render/canvas.js";
import { drawScene } from "../render/diagrams.js";
import { renderMixed } from "../render/panel.js";
import { el, button, testButton } from "../ui/controls.js";
import { showMessage } from "../ui/feedback.js";

export function mount(ctx) {
  const { stage, solver } = ctx;
  const wb = solver.workbench;
  const base = { ...(ctx.setup || {}), diagram: (ctx.setup && ctx.setup.diagram) || null };
  const state = { tree: base.diagram, syms: {}, tex: {}, formulas: [], nextE: 1 };
  const history = [];
  const texOf = (n) => state.tex[n] || wb.blockTex({ block: n });
  let hand = null; // { block, how, label } while a made block is being placed
  let hover = null; // the path under the pointer while placing
  let picks = []; // block names picked to combine
  let group = null; // the group being combined, once its rule is right

  const ws = createWorkspace(ctx, { equations: "never", reveal: true, sceneOpts: { selected: picks } });
  const redraw = () => {
    ws.sceneOpts.selected = picks;
    ws.sceneOpts.target = hand && hover ? hover : null;
    ws.sceneOpts.targetLabel = hand ? hand.label : null;
    ws.setSetup({ ...base, diagram: state.tree }, true);
    drawPreview();
  };

  // ---- The panels -------------------------------------------------------------------
  const maker = makePanel(wb, () => state.tree, (e, b, conn) => pick(e, b, conn));
  const combiner = formulaPanel(wb, { onRule, onCheck, onClear: () => setPicks([]) });
  const previewBox = el("div", { className: "wb-preview-box", hidden: true }, [el("div", { className: "area-title", textContent: "If you put it here:" })]);
  const previewFig = el("div", { className: "wb-preview-figure" });
  previewBox.appendChild(previewFig);
  const previewCv = createCanvas(previewFig);
  const list = el("div", { className: "wb-list" });
  const tools = el("div", { className: "actions" }, [
    button("Undo", undo, "btn btn-quiet btn-small"),
    button("Start over", () => {
      if (!state.tree || confirm("Clear the whole diagram?")) restore({ tree: base.diagram, syms: {}, tex: {}, formulas: [], nextE: 1 }, true);
    }, "btn btn-quiet btn-small"),
  ]);
  ctx.el.area.append(maker.element, combiner.element, list, tools);
  // The preview sits right under the picture, where the pointer is.
  document.querySelectorAll(".wb-preview-box").forEach((x) => x !== previewBox && x.remove()); // (a new version replaces the old one)
  ctx.el.equations.after(previewBox);
  const attempts = createAttempts(ctx, combiner.element, showAnswer, () => "formula");

  if (stage.goal) {
    const goalBox = el("div", { className: "goal" }, [el("div", { className: "area-title", textContent: "Challenge objective:" })]);
    const goalText = el("div");
    renderMixed(goalText, stage.goal.text);
    goalBox.appendChild(goalText);
    ctx.el.area.prepend(goalBox);
    ctx.el.actions.appendChild(testButton(onTest));
  }

  // ---- Putting a block in -------------------------------------------------------------
  function pick(e, b, conn) {
    e.preventDefault();
    if (hand) return drop(null); // pressing the block again puts it down
    hand = { block: b.block || null, how: conn.id, label: conn.label.replace(/ \(no new block\)/, "") };
    maker.setActive(true);
    showMessage(ctx.el.feedback, "info", "Now place it", "Move over the picture: each block or group lights up, and the preview shows what would happen. Click (or let go) to put it in.");
    const x0 = e.clientX, y0 = e.clientY;
    let moved = false;
    const move = (ev) => {
      if (Math.hypot(ev.clientX - x0, ev.clientY - y0) > 8) moved = true;
      if (ctx.canvas.isInside(ev.clientX, ev.clientY)) hoverAt(ctx.canvas.clientToWorld(ev.clientX, ev.clientY));
    };
    const up = (ev) => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      if (!moved) return; // a click: keep holding it; the next click on the picture places it
      if (ctx.canvas.isInside(ev.clientX, ev.clientY) && hover) drop(hover);
      else drop(null);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  }

  const inside = (p, b) => p[0] >= b[0] && p[0] <= b[2] && p[1] >= b[1] && p[1] <= b[3];
  function hoverAt(p) {
    const t = wb.targets({ ...base, diagram: state.tree }).find((x) => inside(p, x.box));
    const next = t ? t.path : null;
    if (JSON.stringify(next) === JSON.stringify(hover)) return;
    hover = next;
    redraw();
  }

  // What the diagram would be with the held block put in at `path`.
  const withHand = (path, ghost) => wb.insert(state.tree, path, hand.block ? { ...hand.block, ...(ghost ? { ghost: true } : {}) } : null, hand.how);

  function drawPreview() {
    previewBox.hidden = !(hand && hover);
    if (previewBox.hidden) return;
    let tree;
    try {
      tree = withHand(hover, true);
    } catch {
      tree = null;
    }
    const shapes = solver.scene({ ...base, diagram: tree }, null, {});
    const frame = shapes.find((s) => s.type === "frame");
    if (frame) previewCv.fit(frame.frame);
    previewCv.onRedraw(() => drawScene(previewCv, shapes, {}));
    drawScene(previewCv, shapes, {});
  }

  function drop(path) {
    const h = hand;
    hand = null;
    hover = null;
    maker.setActive(false);
    ctx.el.feedback.innerHTML = "";
    if (!path) return redraw();
    if (!h.block && !state.tree) return redraw();
    save();
    state.tree = wb.insert(state.tree, path, h.block, h.how);
    setPicks([]);
    maker.reset();
    redraw();
  }

  // ---- Picking and combining -----------------------------------------------------------
  ws.onPointer = {
    move(p) {
      if (hand) hoverAt(p);
    },
    down(p) {
      if (hand) {
        hoverAt(p);
        if (hover) drop(hover);
        return true;
      }
      const t = wb.targets({ ...base, diagram: state.tree }).find((x) => x.kind === "block" && inside(p, x.box));
      if (!t) return false;
      const name = leafAt(t.path);
      setPicks(picks.includes(name) ? picks.filter((n) => n !== name) : [...picks, name]);
      return true;
    },
  };
  const leafAt = (path) => path.reduce((n, [k, i]) => (i == null ? n[k] : n[k][i]), state.tree).block;

  function setPicks(list) {
    picks = list;
    group = null;
    combiner.hideFormula();
    combiner.showPicks(picks.map(texOf));
    attempts.resetCount();
    redraw();
  }

  function onRule(rule) {
    if (!state.tree) return showMessage(ctx.el.feedback, "info", "Build something first", "Put some blocks in, then combine them.");
    const r = wb.checkRule(state.tree, picks, rule);
    ctx.record({ q: "rule", ok: r.ok, kinds: r.kinds || [], sub: `${rule}: ${picks.join(", ")}` });
    if (!r.ok) return showMessage(ctx.el.feedback, "bad", "Not that group", r.message);
    ctx.el.feedback.innerHTML = "";
    group = r.group;
    const node = wb.groupNode(state.tree, group);
    const names = partsOf(node);
    combiner.askFormula(`G_{e${state.nextE}}`, names, texOf, (text) => wb.previewTex(text, names, texOf));
  }
  const partsOf = (node) => (node.series || node.parallel || [node.loop, node.back].filter(Boolean)).map((c) => c.block);

  function onCheck(text) {
    if (!group) return;
    const node = wb.groupNode(state.tree, group);
    const r = wb.checkFormula(text, node);
    if (r.parseError) return showMessage(ctx.el.feedback, "info", "Can't read that yet", r.message);
    ctx.record({ q: "formula", ok: r.ok, kinds: r.kinds || [], sub: text, exp: wb.answerTex(node, (n) => n) });
    if (!r.ok) {
      showMessage(ctx.el.feedback, "bad", "Not yet", r.message);
      attempts.wrong();
      return;
    }
    showMessage(ctx.el.feedback, "good", "Correct ✓", "The group is now one block.");
    combineNow(node);
  }

  // "Show answer": the formula is written in, and the group combined.
  function showAnswer() {
    if (!group) return;
    const node = wb.groupNode(state.tree, group);
    showMessage(ctx.el.feedback, "info", "Here's the formula", `$G_{e${state.nextE}} = ${wb.answerTex(node, texOf)}$`);
    combineNow(node);
  }

  function combineNow(node) {
    save();
    const name = `Ge${state.nextE}`;
    const res = wb.combine(state.tree, group, name, state.syms);
    state.syms = { ...state.syms, [name]: res.sym };
    state.tex = { ...state.tex, [name]: res.block.tex };
    const t = wb.formulaTex(node, res.sym, res.numeric, texOf);
    state.formulas = [...state.formulas, { name, tex: res.block.tex, ...t }];
    state.nextE++;
    state.tree = res.tree;
    group = null;
    setPicks([]);
    showList();
  }

  function showList() {
    const one = state.tree && state.tree.block != null;
    const last = state.formulas[state.formulas.length - 1];
    const total = one && last && state.tree.block === last.name ? `T(s) = ${last.full}${last.nums ? ` = ${last.nums}` : ""}` : null;
    formulasList(list, state.formulas, total);
  }

  // ---- Undo, and the goal ------------------------------------------------------------------
  function save() {
    history.push({ tree: state.tree, syms: state.syms, tex: state.tex, formulas: state.formulas, nextE: state.nextE });
  }
  function restore(s, fresh = false) {
    Object.assign(state, s);
    if (fresh) history.length = 0;
    group = null;
    setPicks([]);
    maker.reset();
    showList();
  }
  function undo() {
    if (history.length) restore(history.pop());
  }

  function onTest() {
    const T = wb.total(state.tree);
    const out = stage.goal.check({ tree: state.tree, T, oneBlock: !!(state.tree && state.tree.block != null && state.formulas.length), combined: state.formulas.length });
    ctx.record({ q: "design", ok: !!out.ok, kinds: [] });
    if (out.ok) {
      showMessage(ctx.el.feedback, "good", "Goal met!", out.message || "");
      ctx.explain();
      ctx.finish();
    } else showMessage(ctx.el.feedback, "bad", "Not yet", out.message || "");
  }

  combiner.showPicks([]);
  showList();
  redraw();
}
