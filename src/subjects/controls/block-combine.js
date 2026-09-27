// block-combine.js — combining blocks on the workbench (see block-edit.js):
// which simple groups a selection of blocks forms, checking the rule and the
// formula the student gives, and replacing the group by one block (G_e1 …).

import { kindOf, childrenOf, blockTf, combine, SF, MISTAKES, mistakeApplies } from "./block-diagram.js";
import { MESSAGES } from "./block-tools.js";
import { tf, toDescending, polyTex } from "../../core/poly.js";
import * as S from "../../core/symbolic.js";
import { parseExpr, sameExpr, exprTex, ExprError } from "../../core/expr.js";
import { allPaths, nodeAt, replaceAt } from "./block-edit.js";

// ---- Combining -------------------------------------------------------------------------

export const RULES = [
  { id: "series", label: "Series (multiply)" },
  { id: "parallel", label: "Parallel (add)" },
  { id: "loop", label: "Feedback loop" },
];
const RULE_WORD = { series: "in series", parallel: "in parallel", loop: "a feedback loop" };

// Every simple group the selected blocks form: blocks next to each other in a
// series, ALL the branches of a parallel group, or a loop's forward block with
// its feedback block (just the forward block, for unity feedback).
//   → [{ kind, path, from?, to? }]  (from/to: which part of a series)
export function groupsOf(tree, names) {
  const want = new Set(names);
  const out = [];
  const isLeaf = (n) => n && kindOf(n) === "block";
  for (const { path, node, kind } of allPaths(tree)) {
    if (kind === "series") {
      const idx = node.series.map((c, i) => (isLeaf(c) && want.has(c.block) ? i : -1)).filter((i) => i >= 0);
      if (idx.length === want.size && idx.length >= 2 && idx[idx.length - 1] - idx[0] === idx.length - 1) out.push({ kind, path, from: idx[0], to: idx[idx.length - 1] });
    } else if (kind === "parallel") {
      if (node.parallel.every(isLeaf) && node.parallel.length === want.size && node.parallel.every((c) => want.has(c.block))) out.push({ kind, path });
    } else if (kind === "loop") {
      const parts = [node.loop, node.back].filter(Boolean);
      if (parts.every(isLeaf) && parts.length === want.size && parts.every((c) => want.has(c.block))) out.push({ kind, path });
    }
  }
  return out;
}

// The group as a node of its own (part of a series becomes a shorter series).
export function groupNode(tree, g) {
  const n = nodeAt(tree, g.path);
  return g.kind === "series" && (g.from > 0 || g.to < n.series.length - 1) ? { series: n.series.slice(g.from, g.to + 1) } : n;
}

// Check the rule the student named for their selection.
//   → { ok: true, group } | { ok: false, message }
export function checkRule(tree, names, rule) {
  const groups = groupsOf(tree, names);
  const g = groups.find((x) => x.kind === rule);
  if (g) return { ok: true, group: g };
  if (groups.length) return { ok: false, message: `These blocks aren't ${RULE_WORD[rule]} — they're ${RULE_WORD[groups[0].kind]}.`, kinds: ["blockRule"] };
  return {
    ok: false, kinds: ["blockRule"],
    message: names.length < 2 && !groups.length
      ? "Pick the blocks of one group: two or more blocks in a row, all the branches of a parallel group, or a loop's forward and feedback blocks."
      : "These blocks don't make one simple group yet. Combine what's inside first (innermost first), or pick blocks that sit next to each other.",
  };
}

// The formula of a group, as an expression tree (see core/expr.js) in the
// names of its parts — correct, or with one of the classic slips (MISTAKES).
export function groupFormula(node, mistake = null) {
  const kind = kindOf(node);
  const name = (n) => ({ t: "name", n: n.block });
  const prod = (fs) => ({ t: "prod", fs });
  if (kind === "series") {
    const parts = node.series.map(name);
    return mistake === "sum" ? { t: "sum", terms: parts.map((x) => ({ sign: 1, x })) } : prod(parts);
  }
  if (kind === "parallel") {
    const signs = node.signs || node.parallel.map(() => 1);
    const parts = node.parallel.map(name);
    if (mistake === "product") return prod(parts);
    return { t: "sum", terms: parts.map((x, i) => ({ sign: mistake === "signs" ? 1 : signs[i], x })) };
  }
  const G = name(node.loop);
  const GH = node.back ? prod([G, name(node.back)]) : G;
  const sign = node.sign ?? -1;
  if (mistake === "noLoop") return G;
  const s = mistake === "sign" ? -sign : sign;
  const bottom = { t: "sum", terms: [{ sign: 1, x: { t: "num", v: 1 } }, { sign: -s, x: mistake === "noH" ? G : GH }] };
  return { t: "div", a: mistake === "HinNum" ? GH : G, b: bottom };
}

// Check a formula the student typed for a group's combined block.
//   → { ok, message?, kinds?, parsed? }  (parsed: their formula, to draw it back)
export function checkFormula(text, node) {
  const names = childrenOf(node).map((c) => c.block);
  let typed;
  try {
    typed = parseExpr(text, names);
  } catch (e) {
    return { ok: false, message: e instanceof ExprError ? e.message : String(e.message), kinds: [], parseError: true };
  }
  if (sameExpr(typed, groupFormula(node), names)) return { ok: true, parsed: typed };
  const kind = kindOf(node);
  for (const m of MISTAKES[kind]) {
    if (!mistakeApplies(kind, node, m)) continue;
    if (sameExpr(typed, groupFormula(node, m), names)) return { ok: false, message: MESSAGES[m](node), kinds: [m === "sign" || m === "signs" ? "sign" : "blockRule"], parsed: typed };
  }
  const rule = { series: "Blocks in series multiply.", parallel: "Parallel branches add, each with the sign at the summing junction.", loop: "A feedback loop is G/(1 + GH) for negative feedback (1 − GH for positive), with G the forward block and H the feedback block." }[kind];
  return { ok: false, message: `That isn't the combined block's formula. ${rule}`, kinds: ["blockRule"], parsed: typed };
}

// Replace a group by one block, named `name` (Ge1 …). It keeps:
//   tf: its transfer function in s, when every part has one;
//   and the workbench's records get its formula (in its parts' names and in
//   the original blocks) and its numbers.
// syms: { name → symbolic fraction in the ORIGINAL blocks' names } (kept by the workbench).
export function combineGroup(tree, g, name, syms) {
  const node = groupNode(tree, g);
  const kind = kindOf(node);
  const parts = childrenOf(node);
  const pack = (vals) => (kind === "loop" ? [vals[0], node.back ? vals[1] : null] : vals);
  const symOf = (c) => syms[c.block] || SF.of(S.symbol(c.block));
  const sym = combine(kind, node, pack(parts.map(symOf)), SF, null);
  const nums = parts.map((c) => blockTf(c, {}));
  const numeric = nums.every(Boolean) ? combine(kind, node, pack(nums), tf, null) : null;
  const index = Number(name.replace(/\D/g, "")) || 1;
  const block = { block: name, tex: `G_{e${index}}`, reduced: true, showTf: true, ...(numeric ? { tf: { num: toDescending(numeric.num), den: toDescending(numeric.den) } } : {}) };
  let next;
  if (g.kind === "series" && node !== nodeAt(tree, g.path)) {
    next = replaceAt(tree, g.path, (n) => {
      const list = n.series.slice();
      list.splice(g.from, g.to - g.from + 1, block);
      return list.length === 1 ? list[0] : { ...n, series: list };
    });
  } else next = replaceAt(tree, g.path, () => block);
  return { tree: next, block, sym, numeric, node };
}

// KaTeX pieces for the formulas list: the rule in its parts' names, the same in
// the original blocks, and the numbers.
export function formulaTex(node, sym, numeric, texOf) {
  const parts = exprTex(groupFormula(node), (n) => texOf(n));
  const order = [];
  const full = S.fracTex(sym, (id) => texOf(id), order);
  const nums = numeric ? tfTex(numeric) : null;
  return { parts, full, nums };
}

export function tfTex(f) {
  const den = polyTex(f.den);
  return den === "1" ? polyTex(f.num) : `\\dfrac{${polyTex(f.num)}}{${den}}`;
}
