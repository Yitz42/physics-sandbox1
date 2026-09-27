// debug.js — "a student made a mistake; find it and fix it."
//
// Tests: can they spot mistakes. Three kinds of mistake:
//   view: "equations"  one term is wrong (sin/cos swapped, wrong sign) or missing
//   view: "fbd"        an arrow points the wrong way, a force is missing, or
//                      there's an extra one (a reaction the support can't give)
//   view: "steps"      one line of a student's working is wrong (e.g. one step of a
//                      block diagram reduction); the solver builds the lines with
//                      solver.debugSteps(setup, mutation) → { lines: [{ id, tex }],
//                      wrong, follows: [ids that are wrong only because of it],
//                      fixes: [{ label, correct?, feedback? }], explain, corrected, kind? }
// Step 1: click the wrong term/arrow (or press "Something is missing").
// Step 2: choose how to fix it.
//
// Stage fields used (inside stage.debug):
//   view, intro, mutations: [...]   one mutation is used per version: a random
//                                  one first, then the next one for each new version
//   missingChoices: [{ id, label, feedback? }]   for "a force is missing"
//   notes: { forceId: "why this one is actually fine" }  (optional)
//   mutation.explain: what the mistake was, shown once it's found (optional)

import { createWorkspace } from "./common/workspace.js";
import { createAttempts } from "./common/attempts.js";
import { swapFactor, flipSign, removeTerm, evaluate } from "../core/equations.js";
import { renderEquations, renderMixed, highlightTerms, renderTex } from "../render/panel.js";
import { fixedTex } from "../core/units.js";
import { arrowAt } from "../render/fbd.js";
import { el, button } from "../ui/controls.js";
import { showMessage } from "../ui/feedback.js";

const EQ_MUTATORS = { swap: swapFactor, sign: flipSign, missing: removeTerm };
// "w_{A}" → "wA", for plain-text button labels.
const plain = (symbol) => String(symbol).replace(/[{}_]/g, "").replace(/\\/g, "");

export function mount(ctx) {
  const { stage, solver } = ctx;
  const dbg = stage.debug;
  // Start on a random mistake (so neighbours get different ones), then take
  // the next one for each new version. ctx.memory survives new versions.
  if (ctx.memory.firstMutation == null) ctx.memory.firstMutation = Math.floor(Math.random() * dbg.mutations.length);
  const mutation = dbg.mutations[(ctx.memory.firstMutation + ctx.round) % dbg.mutations.length];
  if (dbg.view === "steps") return mountSteps(ctx, mutation);
  const isFbd = dbg.view === "fbd";
  const wrongSetup = isFbd ? solver.mutate(ctx.setup, mutation) : null;

  const ws = createWorkspace(ctx, { equations: "never", reveal: false, sceneOpts: { ...(stage.sceneOpts || {}), fbdSetup: wrongSetup } });
  const correctEqs = solver.equations(ws.setup, ws.result);
  const wrongEqs = (isFbd
    ? solver.equations(wrongSetup, solver.solve(wrongSetup))
    : correctEqs.map((eq) => (eq.id === mutation.equation ? EQ_MUTATORS[mutation.kind](eq, mutation.term) : eq))
  ).map((eq) => JSON.parse(JSON.stringify(eq))); // own copies: changing them must not touch the correct ones
  // "define" equations (resultants) show their value; recompute it for the wrong version.
  // An equation can also define a value that later lines use (eq.defines, e.g.
  // F_2 = ½Lw and then F_R = F_1 + F_2): the student's wrong value is carried
  // forward, so their work reads the way they would really have written it.
  wrongEqs.forEach((eq, i) => {
    if (eq.result) eq.result = { ...eq.result, value: evaluate(eq) };
    if (!eq.defines || !eq.result) return;
    for (const later of wrongEqs.slice(i + 1)) for (const t of later.terms) if (t.id === eq.defines) t.value = eq.result.value;
  });

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
  // dbg.mode "numeric" shows numbers (e.g. moment arms), so the slip is visible.
  const mode = dbg.mode || "symbolic";
  renderEquations(eqBox, wrongEqs, { mode, onTermClick: isFbd ? null : (id, node) => pick(id, eqIdOf(node)) });
  step.textContent = isFbd ? "Step 1: click the wrong arrow on the FBD (or press “Something is missing”)." : "Step 1: click the term that is wrong (or press “A term is missing”).";

  const attempts = createAttempts(ctx, actions, () => {
    showMessage(ctx.el.feedback, "info", "Here's the mistake", describeMistake());
    fixed();
  }, () => "debug");
  // For the comprehension record: not finding (or fixing) this mistake counts
  // as trouble with its kind (see src/core/diagnosis.js).
  const mistakeKind = () => {
    if (mutation.errorKind) return mutation.errorKind; // a stage can name it (e.g. "supports")
    if (mutation.kind === "remove" || mutation.kind === "missing") return "missing";
    if (mutation.kind === "extra") return "extra"; // a reaction the support can't give
    if (mutation.kind === "reverse") return "direction";
    if (mutation.kind === "sign") return "sign";
    const eq = correctEqs.find((e) => e.id === mutation.equation);
    const term = eq && eq.terms.find((t) => t.id === mutation.term);
    return (term && term.factor && term.factor.swapKind) || "trig";
  };

  // For the record: what the student flagged ("missing" = the "…is missing"
  // button; a term is "equation:term"), and what they should have flagged.
  let found = null; // what the student flagged, once it's right
  const flaggedName = (id, eqId) => (id === null ? "missing" : eqId ? `${eqId}:${id}` : id);
  const wrongItem = () => (mutation.kind === "missing" || mutation.kind === "remove" ? "missing"
    : mutation.equation && mutation.term ? `${mutation.equation}:${mutation.term}` : mutation.term || mutation.force || null);

  // Clicking arrows on the canvas (FBD view).
  if (isFbd) {
    ws.onPointer = {
      down(p) {
        if (stepNo !== 1) return false;
        const hit = arrowAt(ws.shapes, p, ctx.canvas.pxToWorld(12), ctx.canvas.pxToWorld);
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
      ctx.record({ q: "debug", ok: false, kinds: [mistakeKind()], st: "find", sub: flaggedName(id, eqId), exp: wrongItem() });
      attempts.wrong();
      return;
    }
    // (A right find isn't a separate record — the question is only done once
    // it's fixed — but the fix events carry what was flagged, as fl.)
    found = flaggedName(id, eqId);
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
        const right = options.find((x) => x.correct);
        const fix = { st: "fix", sub: o.label, exp: right ? right.label : null, fl: found };
        if (o.correct) {
          ctx.record({ q: "debug", ok: true, kinds: [], ...fix });
          showMessage(ctx.el.feedback, "good", "Fixed! ✓", "");
          fixed();
        } else {
          e.target.classList.add("is-wrong");
          showMessage(ctx.el.feedback, "bad", "That wouldn't fix it", o.feedback);
          ctx.record({ q: "debug", ok: false, kinds: [mistakeKind()], ...fix });
          attempts.wrong();
        }
      }, "btn btn-choice"));
    }
    step.appendChild(box);
  }

  function fixOptions() {
    const target = correctEqs.find((e) => e.id === mutation.equation);
    const term = target && target.terms.find((t) => t.id === mutation.term);
    const swapLabel = (term && term.factor && term.factor.swapLabel) || "Swap cos ↔ sin";
    const trig = !(term && term.factor && term.factor.swapLabel); // a sin/cos factor (not a distance or fraction)
    if (mutation.kind === "remove") {
      return dbg.missingChoices.map((c) => ({ label: c.label, correct: c.id === mutation.force, feedback: c.feedback || "That force doesn't act on this point." }));
    }
    if (mutation.kind === "missing") {
      // One choice per term of the correct equation (only the missing one fixes it).
      return target.terms.map((t) => ({ label: `Add the ${plain(t.symbol)} term`, correct: t.id === mutation.term, feedback: "That term is already there. Which one is missing from this equation?" }));
    }
    if (mutation.kind === "extra") {
      return [
        { label: "Delete it: this support can't give that reaction", correct: true },
        { label: "Reverse its direction", feedback: "Its direction isn't the problem: look at what this support can and can't stop." },
        { label: "Move it to the other support", feedback: "No support here needs another reaction. This one simply shouldn't be on the FBD." },
      ];
    }
    if (mutation.kind === "reverse") {
      return [
        { label: "Reverse its direction", correct: true },
        { label: "Delete it: that force isn't there", feedback: "That force really does act on the point. Its arrow just points the wrong way." },
        { label: "Make it longer", feedback: "The size isn't the problem — look at which way it points." },
      ];
    }
    return [
      // The term's factor can name its own fix (e.g. "Use the perpendicular distance d").
      { label: swapLabel, correct: mutation.kind === "swap", feedback: trig ? "The trig function is right here. Look at the sign instead." : "That part is right here. Look at the sign instead." },
      { label: "Flip the sign (+ ↔ −)", correct: mutation.kind === "sign", feedback: trig ? "The sign is right. Which axis is the angle measured from? That one gets cos." : "The sign is right. Check the number against the picture." },
      { label: "Delete this term", feedback: "This force does have a component along this axis, so its term belongs." },
    ];
  }

  // Force id → its symbol as inline math, e.g. "T_AB" → "$T_{AB}$". Ids that
  // aren't plain forces (a piece of a distributed load, a support reaction)
  // are looked up in the equations.
  function sym(id) {
    const f = (ws.setup.forces || []).find((x) => x.id === id);
    const t = [...correctEqs, ...wrongEqs].flatMap((e) => e.terms).find((x) => x.id === id);
    return `$${f ? f.symbol : t ? t.symbol : id}$`;
  }

  function describeMistake() {
    if (mutation.explain) return mutation.explain;
    if (mutation.kind === "extra") return `${sym(mutation.force)} doesn't belong on the FBD: that support can't provide it.`;
    if (mutation.kind === "remove") return `A force is missing from the FBD. Every force acting on the point must be drawn — here that includes ${sym(mutation.force)}.`;
    if (mutation.kind === "reverse") return `The arrow for ${sym(mutation.force)} points the wrong way. It must be reversed.`;
    if (mutation.kind === "missing") return `The term for ${sym(mutation.term)} is missing from the equation.`;
    if (mutation.kind !== "swap") return `The ${sym(mutation.term)} term has the wrong sign.`;
    const target = correctEqs.find((e) => e.id === mutation.equation);
    const term = target && target.terms.find((t) => t.id === mutation.term);
    const reason = term && term.factor && term.factor.swapReason;
    return `The ${sym(mutation.term)} term ${reason || "has sin and cos swapped"}.`;
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
        extra.push(`${name}\\text{: the mistake gave } ${fixedTex(wrongEqs[i].result.value, eq.result.unit)}\\text{; correct is } ${fixedTex(eq.result.value, eq.result.unit)}`);
      }
    });
    step.textContent = "Corrected work (the fixed term is highlighted):";
    renderEquations(eqBox, correctEqs, { mode, extra });
    highlightTerms(eqBox, mutation.term || mutation.force);
    ctx.explain();
    ctx.finish();
  }
}

// ---- view "steps": find the wrong line in a student's working ------------------------

function mountSteps(ctx, mutation) {
  const { stage, solver } = ctx;
  const dbg = stage.debug;
  const ws = createWorkspace(ctx, { equations: "never", reveal: false, sceneOpts: stage.sceneOpts || {} });
  const work = solver.debugSteps(ws.setup, mutation);

  const intro = el("div", { className: "debug-intro" });
  renderMixed(intro, dbg.intro || "Here is a student's working. One line is wrong.");
  const step = el("div", { className: "debug-step", textContent: "Step 1: click the line where the mistake is." });
  const box = el("div", { className: "eq-list debug-eqs debug-lines" });
  ctx.el.area.append(intro, step, box);

  let stepNo = 1;
  const rows = work.lines.map((line) => {
    const row = el("button", { type: "button", className: "debug-line" });
    renderTex(row, line.tex);
    row.onclick = () => pick(line.id, row);
    box.appendChild(row);
    return row;
  });

  const attempts = createAttempts(ctx, ctx.el.area, () => {
    showMessage(ctx.el.feedback, "info", "Here's the mistake", work.explain);
    fixed();
  }, () => "debug");

  function pick(id, row) {
    if (stepNo !== 1) return;
    rows.forEach((r) => r.classList.remove("is-wrong"));
    if (id !== work.wrong) {
      row.classList.add("is-wrong");
      const msg = work.follows.includes(id)
        ? "This line is wrong, but only because it builds on an earlier line. Find the line where the mistake STARTS."
        : (dbg.notes && dbg.notes[id]) || "That line is right. Check each line against the rule it uses.";
      showMessage(ctx.el.feedback, "bad", work.follows.includes(id) ? "Earlier than that" : "That one is correct", msg);
      ctx.record({ q: "debug", ok: false, kinds: [work.kind || "unexplained"], st: "find", sub: id, exp: work.wrong });
      attempts.wrong();
      return;
    }
    stepNo = 2; // (the fix events below carry the line found, as fl)
    row.classList.add("is-found");
    showMessage(ctx.el.feedback, "good", "Found it!", "Now, how should it be fixed?");
    step.textContent = "Step 2: choose the fix.";
    const choices = el("div", { className: "choice-list" });
    // In a random order, so the right fix isn't always in the same place.
    const order = work.fixes.map((f) => [Math.random(), f]).sort((x, y) => x[0] - y[0]).map(([, f]) => f);
    for (const f of order) {
      const right = work.fixes.find((x) => x.correct);
      const fix = { st: "fix", sub: f.label, exp: right ? right.label : null, fl: id };
      choices.appendChild(button(f.label, (e) => {
        if (f.correct) {
          ctx.record({ q: "debug", ok: true, kinds: [], ...fix });
          showMessage(ctx.el.feedback, "good", "Fixed! ✓", work.explain);
          fixed();
        } else {
          e.target.classList.add("is-wrong");
          showMessage(ctx.el.feedback, "bad", "That wouldn't fix it", f.feedback || "Look again at what this line does wrong.");
          ctx.record({ q: "debug", ok: false, kinds: [work.kind || "unexplained"], ...fix });
          attempts.wrong();
        }
      }, "btn btn-choice"));
    }
    step.appendChild(choices);
  }

  function fixed() {
    stepNo = 3;
    step.textContent = "Corrected working:";
    box.innerHTML = "";
    work.corrected.forEach((tex, i) => {
      const row = el("div", { className: "debug-line" + (work.lines[i] && work.lines[i].id === work.wrong ? " is-fixed" : "") });
      renderTex(row, tex);
      box.appendChild(row);
    });
    ws.setReveal(true);
    ctx.explain();
    ctx.finish();
  }
}
