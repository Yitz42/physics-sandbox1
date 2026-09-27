// Formulas students type (core/expr.js): reading them, drawing them, comparing them.
import { test, ok, equal, close, setFile } from "../harness.js";
import { parseExpr, evalExpr, sameExpr, exprTex, toFraction, ExprError } from "../../src/core/expr.js";

setFile("core / typed formulas");

const names = ["G1", "G2", "H1", "Ge1"];

test("names, numbers, brackets and every way of writing ×", () => {
  const v = { G1: 2, G2: 3, H1: 0.5, Ge1: 7 };
  close(evalExpr(parseExpr("G1 G2/(1 + G1 G2 H1)", names), v), 6 / 4);
  close(evalExpr(parseExpr("G1G2", names), v), 6, 1e-12);
  close(evalExpr(parseExpr("G1*G2 - Ge1", names), v), -1, 1e-12);
  close(evalExpr(parseExpr("-G1 + 2G2^2", names), v), 16, 1e-12);
  close(evalExpr(parseExpr("Ge1/(1 − Ge1)", names), v), 7 / -6, 1e-12);
});

test("the same formula written differently is the same; a slip isn't", () => {
  const a = parseExpr("G1 G2/(1 + G1 G2 H1)", names);
  ok(sameExpr(a, parseExpr("G2 G1 / (H1 G1 G2 + 1)", names), names));
  ok(!sameExpr(a, parseExpr("G1 G2/(1 + G1 G2)", names), names), "H left out");
  ok(!sameExpr(a, parseExpr("G1 G2/(1 - G1 G2 H1)", names), names), "wrong sign");
});

test("drawn as a textbook formula", () => {
  equal(exprTex(parseExpr("G1 G2/(1 + G1 G2 H1)", names), (n) => n.replace(/(\d+)$/, "_{$1}")), "\\dfrac{G_{1}G_{2}}{1 + G_{1}G_{2}H_{1}}");
});

test("mistakes in typing get a plain message", () => {
  const msg = (t) => { try { parseExpr(t, names); return null; } catch (e) { return e instanceof ExprError ? e.message : "not an ExprError"; } };
  ok(/bracket/.test(msg("G1/(1 + G2")));
  ok(/isn't a name/.test(msg("G1 X2")));
  ok(/Type a formula/.test(msg("  ")));
});

test("transfer functions in s: 10/(s(s + 2)) → 10/(s² + 2s)", () => {
  const f = toFraction(parseExpr("10/(s(s + 2))", ["s"]));
  equal(f.num, [10]);
  equal(f.den, [0, 2, 1]);
  equal(toFraction(parseExpr("0.5s", ["s"])).num, [0, 0.5]);
  const g = toFraction(parseExpr("(s + 1)(s + 2)", ["s"]));
  equal(g.num, [2, 3, 1]);
});
