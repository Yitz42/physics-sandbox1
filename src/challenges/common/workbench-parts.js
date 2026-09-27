// workbench-parts.js — the panels of the block diagram workbench (workbench.js):
//   makePanel     "Make a block": how it connects, its name, its transfer
//                 function, and the block itself, to drag or click into place
//   formulaPanel  "Combine": the rule buttons, then the formula box with a live preview
//   formulasList  every combined block's formula so far
// They only build the page; the workbench decides what happens.

import { el, button } from "../../ui/controls.js";
import { renderTex, renderMixed } from "../../render/panel.js";

// wb: the solver's workbench tools. onPick(event): the block was grabbed
// (pointerdown on it) — the workbench then follows the drag or waits for a click.
export function makePanel(wb, getTree, onPick) {
  const how = el("select", { className: "wb-select" }, wb.connections.map((c) => el("option", { value: c.id, textContent: c.label })));
  const name = el("input", { type: "text", className: "wb-input wb-name", autocomplete: "off", spellcheck: false });
  const tfBox = el("input", { type: "text", className: "wb-input", autocomplete: "off", spellcheck: false, placeholder: "optional, e.g. 10/(s + 2)" });
  const chip = el("button", { type: "button", className: "wb-chip", title: "Drag onto the picture, or click, then click a spot" });
  const note = el("div", { className: "wb-note" });
  const nameRow = el("label", { className: "wb-row" }, [el("span", { className: "wb-label", textContent: "Name" }), name]);
  const tfRow = el("label", { className: "wb-row" }, [el("span", { className: "wb-label", textContent: "Transfer function" }), tfBox]);

  const conn = () => wb.connections.find((c) => c.id === how.value);
  const suggest = () => {
    const c = conn();
    if (c.letter) name.value = wb.nextName(getTree(), c.letter);
  };
  // The block as it stands: { block } (or { error }), or { unity: true }.
  const current = () => (conn().letter ? wb.makeBlock(name.value, tfBox.value, getTree()) : { unity: true });
  const refresh = () => {
    const needs = !!conn().letter;
    nameRow.hidden = tfRow.hidden = !needs;
    const b = current();
    chip.classList.toggle("wb-chip-bad", !!b.error);
    if (b.unity) renderMixed(chip, "Unity feedback loop");
    else if (b.error) chip.textContent = name.value || "?";
    else renderTex(chip, b.block.tf ? `${wb.blockTex(b.block)} = ${wb.tfTex({ num: [...b.block.tf.num].reverse(), den: [...b.block.tf.den].reverse() })}` : wb.blockTex(b.block));
    note.textContent = b.error || "";
  };
  how.addEventListener("change", () => {
    suggest();
    refresh();
  });
  name.addEventListener("input", refresh);
  tfBox.addEventListener("input", refresh);
  chip.addEventListener("pointerdown", (e) => {
    const b = current();
    if (b.error) return;
    onPick(e, b, conn());
  });
  suggest();
  refresh();

  const element = el("section", { className: "wb-panel" }, [
    el("div", { className: "area-title", textContent: "Make a block" }),
    el("label", { className: "wb-row" }, [el("span", { className: "wb-label", textContent: "How it connects" }), how]),
    nameRow, tfRow,
    el("div", { className: "wb-chip-row" }, [chip, el("span", { className: "wb-help", textContent: "Drag it onto a block or group in the picture — or click it, then hover to see what happens and click to put it in." })]),
    note,
  ]);
  return {
    element,
    // After a block is put in: a fresh name, an empty transfer function.
    reset() {
      tfBox.value = "";
      suggest();
      refresh();
    },
    setActive(on) {
      chip.classList.toggle("active", on);
    },
    refresh,
  };
}

// The combine panel. picks(): the block names picked in the picture.
// onRule(rule): a rule button pressed. onCheck(text): the formula to check.
export function formulaPanel(wb, { onRule, onCheck, onClear }) {
  const picked = el("div", { className: "wb-picked" });
  const rules = el("div", { className: "wb-rules" }, wb.rules.map((r) => button(r.label, () => onRule(r.id), "btn btn-quiet btn-small")));
  const entry = el("div", { className: "wb-entry", hidden: true });
  const element = el("section", { className: "wb-panel" }, [
    el("div", { className: "area-title", textContent: "Combine blocks" }),
    el("p", { className: "wb-help", textContent: "Click the blocks of one group in the picture, then choose its rule." }),
    picked, rules, entry,
  ]);
  let input = null, preview = null;
  return {
    element,
    showPicks(texs) {
      picked.innerHTML = "";
      if (!texs.length) return (picked.textContent = "Nothing picked yet.");
      const t = el("span");
      renderTex(t, texs.join(",\\ "));
      picked.append(el("span", { className: "wb-label", textContent: "Picked: " }), t, " ", button("Clear", onClear, "btn btn-quiet btn-small"));
    },
    // Ask for the formula of the new block, `newTex`, in its parts' names.
    askFormula(newTex, parts, texOf, previewTex) {
      entry.hidden = false;
      entry.innerHTML = "";
      const lhs = el("span", { className: "wb-lhs" });
      renderTex(lhs, `${newTex} =`);
      input = el("input", { type: "text", className: "wb-input wb-formula", autocomplete: "off", spellcheck: false, placeholder: parts.length > 1 ? `e.g. ${parts[0]} ${parts[1]}` : "" });
      preview = el("div", { className: "wb-preview" });
      const insert = (text) => {
        const at = input.selectionStart ?? input.value.length;
        input.value = input.value.slice(0, at) + text + input.value.slice(input.selectionEnd ?? at);
        input.focus();
        input.setSelectionRange(at + text.length, at + text.length);
        update();
      };
      // Buttons for the names and the usual symbols, for phones and to show how names are typed.
      const keys = el("div", { className: "wb-keys" }, [
        ...parts.map((p) => {
          const b = button("", () => insert(p), "btn btn-quiet btn-small wb-key");
          renderTex(b, texOf(p));
          return b;
        }),
        ...["1", "+", "−", "/", "(", ")"].map((k) => button(k, () => insert(k === "−" ? "-" : k), "btn btn-quiet btn-small wb-key")),
      ]);
      const update = () => {
        const tex = previewTex(input.value);
        if (tex) renderTex(preview, `${newTex} = ${tex}`);
        else preview.textContent = input.value.trim() ? "…" : "";
      };
      input.addEventListener("input", update);
      input.addEventListener("keydown", (e) => e.key === "Enter" && onCheck(input.value));
      entry.append(el("div", { className: "wb-row" }, [lhs, input]), keys, preview, el("div", { className: "actions" }, [button("Check formula", () => onCheck(input.value), "btn btn-play")]));
      input.focus();
    },
    hideFormula() {
      entry.hidden = true;
      entry.innerHTML = "";
    },
  };
}

// The formulas found so far, one line each: G_e1 = (rule in its parts) = (in the
// original blocks) = (numbers).
export function formulasList(container, formulas, total) {
  container.innerHTML = "";
  if (!formulas.length && !total) return;
  container.appendChild(el("div", { className: "area-title", textContent: "Combined blocks" }));
  for (const f of formulas) {
    const row = el("div", { className: "wb-formula-row" });
    const parts = [`${f.tex} = ${f.parts}`];
    if (f.full !== f.parts) parts.push(f.full);
    if (f.nums) parts.push(f.nums);
    renderTex(row, parts.join(" = "));
    container.appendChild(row);
  }
  if (total) {
    const row = el("div", { className: "wb-formula-row wb-total" });
    renderTex(row, total);
    container.appendChild(row);
  }
}
