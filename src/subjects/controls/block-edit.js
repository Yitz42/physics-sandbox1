// block-edit.js — building and combining block diagrams by hand (the workbench).
//
// The diagram is the same tree as in block-diagram.js. Here the student:
//   • puts a new block in, choosing how it connects to a block (or group)
//     already there: in series (after / before), in parallel (+ / −), as
//     feedback around it (− / +), or closes a unity feedback loop around it;
//   • combines blocks (block-combine.js): picks the blocks of one simple group,
//     names the rule, and writes the combined block's formula, which is
//     checked (and a wrong one explained) before the group becomes one block.
// Pure functions on plain objects, so they can be tested without a page.
//
// A place in the tree is a PATH: a list of steps from the top, each
// ["series", i] | ["parallel", i] | ["loop"] | ["back"]; [] is the whole diagram.

import { kindOf } from "./block-diagram.js";
import { toDescending } from "../../core/poly.js";
import { parseExpr, toFraction, ExprError } from "../../core/expr.js";

// ---- Paths ---------------------------------------------------------------------------

export function nodeAt(tree, path) {
  return path.reduce((n, [k, i]) => (i == null ? n[k] : n[k][i]), tree);
}

// A copy of the tree with the node at `path` replaced by fn(node).
export function replaceAt(tree, path, fn) {
  if (!path.length) return fn(tree);
  const [[k, i], ...rest] = path;
  const copy = { ...tree };
  if (i == null) copy[k] = replaceAt(tree[k], rest, fn);
  else copy[k] = tree[k].map((c, j) => (j === i ? replaceAt(c, rest, fn) : c));
  return copy;
}

// Every node with its path, outermost first.
export function allPaths(tree, path = [], out = []) {
  if (!tree) return out;
  out.push({ path, node: tree, kind: kindOf(tree) });
  if (tree.series) tree.series.forEach((c, i) => allPaths(c, [...path, ["series", i]], out));
  if (tree.parallel) tree.parallel.forEach((c, i) => allPaths(c, [...path, ["parallel", i]], out));
  if (tree.loop) {
    allPaths(tree.loop, [...path, ["loop"]], out);
    if (tree.back) allPaths(tree.back, [...path, ["back"]], out);
  }
  return out;
}

export const leafNames = (tree) => allPaths(tree).filter((p) => p.kind === "block").map((p) => p.node.block);

// ---- Making a block --------------------------------------------------------------------

// Names a student may give a block: a capital letter, maybe a small letter,
// maybe a number — G1, H2, K, Gc, Gp1. (G_e… is kept for combined blocks.)
export function checkName(name, tree) {
  const n = String(name || "").trim();
  if (!/^[A-Z][a-z]?\d{0,2}$/.test(n)) return "A block's name is a capital letter, then maybe a small letter and a number: G1, H2, K, Gc.";
  if (/^Ge\d+$/.test(n)) return "Names like Ge1 are kept for combined blocks. Choose another.";
  if (leafNames(tree).includes(n)) return `There's already a block called ${n}.`;
  return null;
}

// The next free name with this letter: G1, G2 … (or H1 … for feedback blocks).
export function nextName(tree, letter = "G") {
  const used = new Set(leafNames(tree));
  for (let k = 1; ; k++) if (!used.has(`${letter}${k}`)) return `${letter}${k}`;
}

// A new block from a name and an optional transfer function typed in s,
// e.g. "10", "1/(s + 2)", "K"… Returns { block } or { error }.
export function makeBlock(name, tfText, tree) {
  const bad = checkName(name, tree);
  if (bad) return { error: bad };
  const block = { block: name.trim() };
  if (tfText && String(tfText).trim()) {
    try {
      const f = toFraction(parseExpr(tfText, ["s"]));
      block.tf = { num: toDescending(f.num), den: toDescending(f.den) };
    } catch (e) {
      return { error: e instanceof ExprError ? `Transfer function: ${e.message}` : String(e.message) };
    }
  }
  return { block };
}

// ---- Putting it in ---------------------------------------------------------------------

// How a new block can connect to the block or group it's put on.
export const CONNECTIONS = [
  { id: "after", label: "In series, after it", letter: "G" },
  { id: "before", label: "In series, before it", letter: "G" },
  { id: "parallel", label: "In parallel with it (added)", letter: "G" },
  { id: "parallelMinus", label: "In parallel with it (subtracted)", letter: "G" },
  { id: "feedback", label: "As negative feedback around it", letter: "H" },
  { id: "feedbackPlus", label: "As positive feedback around it", letter: "H" },
  { id: "unity", label: "Close a unity feedback loop around it (no new block)", letter: null },
];

// The tree with `block` put in at `path` in the way `how`. An empty diagram
// just becomes the block.
export function insertBlock(tree, path, block, how) {
  if (!tree) return how === "unity" ? null : block;
  const last = path[path.length - 1];
  const parentPath = path.slice(0, -1);
  const parent = path.length ? nodeAt(tree, parentPath) : null;
  if (how === "after" || how === "before") {
    // Inside a series already: join that series (no series within a series).
    if (parent && parent.series && last[0] === "series") {
      return replaceAt(tree, parentPath, (p) => {
        const list = p.series.slice();
        list.splice(how === "after" ? last[1] + 1 : last[1], 0, block);
        return { ...p, series: list };
      });
    }
    return replaceAt(tree, path, (t) => {
      const list = t.series ? t.series.slice() : [t];
      if (how === "after") list.push(block);
      else list.unshift(block);
      return { series: list };
    });
  }
  if (how === "parallel" || how === "parallelMinus") {
    const sign = how === "parallel" ? 1 : -1;
    if (parent && parent.parallel && last[0] === "parallel") {
      return replaceAt(tree, parentPath, (p) => ({ ...p, parallel: [...p.parallel, block], signs: [...(p.signs || p.parallel.map(() => 1)), sign] }));
    }
    return replaceAt(tree, path, (t) => ({ parallel: [t, block], signs: [1, sign] }));
  }
  if (how === "feedback" || how === "feedbackPlus") return replaceAt(tree, path, (t) => ({ loop: t, back: block, sign: how === "feedback" ? -1 : 1 }));
  if (how === "unity") return replaceAt(tree, path, (t) => ({ loop: t, back: null, sign: -1 }));
  throw new Error(`Unknown connection "${how}"`);
}
