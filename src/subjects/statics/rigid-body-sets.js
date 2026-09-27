// rigid-body-sets.js — which three equations to write (Unit 4.3, alternative
// equation sets).
//
// A body in a plane gives three independent equations, but they don't have to
// be ΣF_x, ΣF_y and ΣM. Textbooks allow two more sets:
//   • ΣM_A, ΣM_B and ΣF in one direction — as long as the line AB is NOT
//     perpendicular to that direction;
//   • ΣM_A, ΣM_B and ΣM_C — as long as A, B and C are NOT on one line.
// Chosen well, each equation holds just one unknown, so nothing has to be solved
// simultaneously.
//
// setup.sums: the set a stage uses, e.g. [{ M: "A" }, { M: "B" }, { F: "y" }].
//   { F: "x" | "y" }            a force sum
//   { M: "A" }                  moments about a support, or a point named in
//                               setup.points ({ C: [x, y] }), or { M: { at, label } }
// Without setup.sums the usual set is used: ΣF_x, ΣF_y, ΣM about setup.about.
//
// Why the rules hold: each equation is a fixed combination of the three
// numbers that describe any force system — its x-sum R_x, its y-sum R_y and
// its moment M_O about the origin:
//   ΣF_x = R_x,   ΣF_y = R_y,   ΣM_P = M_O − p_x R_y + p_y R_x   (P = (p_x, p_y)).
// Three equations are enough exactly when those three combinations are
// independent (their 3 × 3 determinant isn't zero); otherwise one of them adds
// nothing new, and the set can't show the body is in equilibrium.

// The point a moment sum is about.
export function pointNamed(setup, name) {
  if (name && typeof name === "object") return { at: name.at, label: name.label || "P" };
  const s = (setup.supports || []).find((q) => q.id === name);
  if (s) return { at: s.at, label: s.id };
  const p = setup.points && setup.points[name];
  if (p) return { at: p, label: name };
  throw new Error(`No support or point called "${name}" (add it to setup.points)`);
}

// The set as a list: { kind: "Fx" | "Fy" | "M", P?, id }.
// (usual: the default moment point, for sets without setup.sums)
export function sumsOf(setup, usual) {
  if (!setup.sums) return [{ kind: "Fx", id: "sumFx" }, { kind: "Fy", id: "sumFy" }, { kind: "M", P: usual, id: "sumM" }];
  return setup.sums.map((s) => {
    if (s.F) return { kind: s.F === "x" ? "Fx" : "Fy", id: s.F === "x" ? "sumFx" : "sumFy" };
    const P = pointNamed(setup, s.M);
    return { kind: "M", P, id: `sumM_${P.label}` };
  });
}

// Is the set enough? { ok, message }.
export function checkSet(sums) {
  const rows = sums.map((s) => (s.kind === "Fx" ? [1, 0, 0] : s.kind === "Fy" ? [0, 1, 0] : [s.P.at[1], -s.P.at[0], 1]));
  const [a, b, c] = rows;
  const det = a[0] * (b[1] * c[2] - b[2] * c[1]) - a[1] * (b[0] * c[2] - b[2] * c[0]) + a[2] * (b[0] * c[1] - b[1] * c[0]);
  const scale = Math.max(1, ...rows.flat().map(Math.abs)) ** 2;
  if (sums.length === 3 && Math.abs(det) > 1e-9 * scale) return { ok: true, message: "These three equations are independent: together they can find all three unknowns." };
  return { ok: false, message: whyNot(sums) };
}

const same = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1]) < 1e-9;

// Why a set fails, in the words a student needs.
function whyNot(sums) {
  const ms = sums.filter((s) => s.kind === "M");
  const fs = sums.filter((s) => s.kind !== "M");
  if (sums.length !== 3) return "A body in a plane needs three equations.";
  if (new Set(fs.map((s) => s.kind)).size < fs.length || ms.some((s, i) => ms.slice(i + 1).some((t) => same(s.P.at, t.P.at)))) {
    return "Two of these equations are the same equation, so there are really only two.";
  }
  if (ms.length === 2 && fs.length === 1) {
    const [A, B] = ms.map((s) => s.P);
    const axis = fs[0].kind === "Fx" ? "x" : "y";
    const line = axis === "x" ? "straight above each other (the line between them is vertical)" : "level with each other (the line between them is horizontal)";
    return `${A.label} and ${B.label} are ${line}, perpendicular to $${axis}$. Then $\\Sigma F_${axis}$ says nothing that $\\Sigma M_{${A.label}}$ and $\\Sigma M_{${B.label}}$ don't already say: ` +
      `use $\\Sigma F_${axis === "x" ? "y" : "x"}$, or a moment point off that line.`;
  }
  if (ms.length === 3) {
    return `${ms.map((s) => s.P.label).join(", ")} all lie on one line, so the third moment equation adds nothing new. Choose a third point off that line.`;
  }
  return "These three equations aren't independent: one of them follows from the other two.";
}
