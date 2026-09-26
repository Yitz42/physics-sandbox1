// debug.js — "a student made a mistake; find it and fix it."
//
// Tests: can they spot mistakes. Two kinds of mistake:
//   view: "equations"  one term is wrong (sin/cos swapped, wrong sign) or missing
//   view: "fbd"        an arrow points the wrong way, or a force is missing
// Step 1: click the wrong term/arrow (or press "Something is missing").
// Step 2: choose how to fix it.
//
// Stage fields used (inside stage.debug):
//   view, intro, mutations: [...]   one mutation is used per version; a new
//                                  version (after "Show answer") uses the next one
//   missingChoices: [{ id, label, feedback? }]   for "a force is missing"
//   notes: { forceId: "why this one is actually fine" }  (optional)

import { createWorkspace } from "./common/workspace.js";
import { createAttempts } from "./common/attempts.js";
import { swapFactor, flipSign, removeTerm, evaluate } from "../core/equations.js";
import { renderEquations, renderMixed, highlightTerms } from "../render/panel.js";
import { formatTex } from "../core/units.js";
import { arrowAt } from "../render/fbd.js";
import { el, button } from "../ui/controls.js";
import { showMessage } from "../ui/feedback.js";

const EQ_MUTATORS = { swap: swapFactor, sign: flipSign, missing: removeTerm };

export function mount(ctx) {
  const { stage, solver } = ctx;
  const dbg = stage.debug;
  const mutation = dbg.mutations[ctx.round % dbg.mutations.length];
  const isFbd = dbg.view === "fbd";
  const wrongSetup = isFbd ? solver.mutate(ctx.setup, mutation) : null;

  const ws = createWorkspace(ctx, { equations: "never", reveal: false, sceneOpts: { ...(stage.sceneOpts || {}), fbdSetup: wrongSetup } });
  const correctEqs = solver.equations(ws.setup, ws.result);
  const wrongEqs = isFbd
    ? solver.equations(wrongSetup, solver.solve(wrongSetup))
    : correctEqs.map((eq) => (eq.id === mutation.equation ? EQ_MUTATORS[mutation.kind](eq, mutation.term) : eq));
  // "define" equations (resultants) show their value; recompute it for the wrong version.
  wrongEqs.forEach((eq) => eq.result && (eq.result = { ...eq.result, value: evaluate(eq) }));

  // ---- Layout ---------------------------------------------------------------
  const intro = el("div", { className: "debug-intro" });
  renderMixed(intro, dbg.intro || (isFbd ? "A student drew this free-body diagram and wrote these equations. Something is wrong." : "A student wrote these equations. One of them has a mistake."));
  const eqBox = el("div", { className: "eq-list debug-eqs" });
  const step = el("div", { className: "debug-step" });
  const missingBtn = button(isFbd ? "Something is missing" : "A term is missing", () => pick(null), "btn btn-quiet");
  const actions = el("div", { className: "actions" }, [missingBtn]);
  ctx.el.area.append(intro, step, eqBox, actions);
  // Which equation a clicked term sits in (the same force appears in ΣFx and ΣFy).
  const eqIdOf = (node) => wrongEqs[[...eqBox.querySelectorAll(".eq-row")].indexOf(node.closest(".eq-row"))].id;
  renderEquations(eqBox, wrongEqs, { mode: "symbolic", onTermClick: isFbd ? null : (id, node) => pick(id, eqIdOf(node)) });
  step.textContent = isFbd ? "Step 1: click the wrong arrow on the FBD (or press “Something is missing”)." : "Step 1: click the term that is wrong (or press “A term is missing”).";

  const attempts = createAttempts(ctx, actions, () => {
    showMessage(ctx.el.feedback, "info", "Here's the mistake", describeMistake());
    fixed();
  });

  // Clicking arrows on the canvas (FBD view).
  if (isFbd) {
    ws.onPointer = {
      down(p) {
        if (stepNo !== 1) return false;
        const hit = arrowAt(ws.shapes, p, ctx.canvas.pxToWorld(12));
        if (hit) pick(hit.id);
        return true;
      },
    };
  }

  // ---- Step 1: find it -------------------------------------------------------
  let stepNo = 1;
  function pick(id, eqId = null) {
    if (stepNo !== 1) return;
    const rightEquation = eqId === null || eqId === mutation.equation;
    const correctPick = mutation.kind === "missing" || mutation.kind === "remove" ? id === null : id === (mutation.term || mutation.force) && rightEquation;
    if (!correctPick) {
      ws.setHighlight(id);
      highlightTerms(eqBox, id);
      const note = id && dbg.notes && dbg.notes[id];
      showMessage(ctx.el.feedback, "bad", id ? "That one is correct" : "Nothing is missing", note || (id ? "Look again, checking each term's sign and whether it uses sin or cos." : "All the forces are there — one of them is wrong instead."));
      attempts.wrong();
      return;
    }
    stepNo = 2;
    ws.setHighlight(id);
    highlightTerms(eqBox, id);
    showMessage(ctx.el.feedback, "good", "Found it!", "Now, how should it be fixed?");
    missingBtn.remove();
    showFixes();
  }

  // ---- Step 2: fix it --------------------------------------------------------
  function showFixes() {
    step.textContent = mutation.kind === "remove" ? "Step 2: which force is missing?" : "Step 2: choose the fix.";
    const options = fixOptions();
    const box = el("div", { className: "choice-list" });
    for (const o of options) {
      box.appendChild(button(o.label, (e) => {
        if (o.correct) {
          showMessage(ctx.el.feedback, "good", "Fixed! ✓", "");
          fixed();
        } else {
          e.target.classList.add("is-wrong");
          showMessage(ctx.el.feedback, "bad", "That wouldn't fix it", o.feedback);
          attempts.wrong();
        }
      }, "btn btn-choice"));
    }
    step.appendChild(box);
  }

  function fixOptions() {
    if (mutation.kind === "remove") {
      return dbg.missingChoices.map((c) => ({ label: c.label, correct: c.id === mutation.force, feedback: c.feedback || "That force doesn't act on this point." }));
    }
    if (mutation.kind === "missing") {
      return ws.setup.forces.map((f) => ({ label: `Add the ${f.symbol.replace(/[{}_]/g, "")} term`, correct: f.id === mutation.term, feedback: "That force's term is already there. Which force is missing from this equation?" }));
    }
    if (mutation.kind === "reverse") {
      return [
        { label: "Reverse its direction", correct: true },
        { label: "Delete it: that force isn't there", feedback: "That force really does act on the point. Its arrow just points the wrong way." },
        { label: "Make it longer", feedback: "The size isn't the problem — look at which way it points." },
      ];
    }
    return [
      { label: "Swap cos ↔ sin", correct: mutation.kind === "swap", feedback: "The trig function is right here. Look at the sign instead." },
      { label: "Flip the sign (+ ↔ −)", correct: mutation.kind === "sign", feedback: "The sign is right. Which axis is the angle measured from? That one gets cos." },
      { label: "Delete this term", feedback: "This force does have a component along this axis, so its term belongs." },
    ];
  }

  // Force id → its symbol as inline math, e.g. "T_AB" → "$T_{AB}$".
  function sym(id) {
    const f = ws.setup.forces.find((x) => x.id === id);
    return `$${f ? f.symbol : id}$`;
  }

  function describeMistake() {
    if (mutation.kind === "remove") return `A force is missing from the FBD. Every force acting on the point must be drawn — here that includes ${sym(mutation.force)}.`;
    if (mutation.kind === "reverse") return `The arrow for ${sym(mutation.force)} points the wrong way. It must be reversed.`;
    if (mutation.kind === "missing") return `The term for ${sym(mutation.term)} is missing from the equation.`;
    return mutation.kind === "swap" ? `The ${sym(mutation.term)} term has sin and cos swapped.` : `The ${sym(mutation.term)} term has the wrong sign.`;
  }

  // ---- Done: show the corrected work -----------------------------------------
  function fixed() {
    stepNo = 3;
    ws.sceneOpts.fbdSetup = null;
    ws.setReveal(true);
    const extra = [];
    // For resultant equations, show how much the mistake changed the answer.
    correctEqs.forEach((eq, i) => {
      if (eq.result && Math.abs(eq.result.value - wrongEqs[i].result.value) > 1e-6) {
        const name = eq.lhs.split("=")[0].trim(); // e.g. F_{Rx}
        extra.push(`${name}\\text{: the mistake gave } ${formatTex(wrongEqs[i].result.value, "N")}\\text{; correct is } ${formatTex(eq.result.value, "N")}`);
      }
    });
    step.textContent = "Corrected work (the fixed term is highlighted):";
    renderEquations(eqBox, correctEqs, { mode: "symbolic", extra });
    highlightTerms(eqBox, mutation.term || mutation.force);
    ctx.explain();
    ctx.finish();
  }
}
