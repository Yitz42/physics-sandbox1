// Unit 6.3, stage 3 — build: plan a section that gives F_GH from ONE equation, then work it out.
// The bridge with two loads (library/trusses.js): P at B, Q at C; E_y = (3P + 6Q)/12.
// The only plan that works: cut GH, CH, CD (keep either part) and take moments about C,
// where CH and CD meet:   right part: ΣM_C: 6E_y + 3F_GH = 0 → F_GH = −2E_y
//   (P = 600, Q = 1200: E_y = 750 N, F_GH = −1500 N.)
// The left cut misses GH; "GH, DH, DE" doesn't split the truss (CH still joins the parts).

import { twoLoadSetup, BRIDGE_VIEW, LEFT_CUT, RIGHT_CUT } from "../library/trusses.js";

const CUTS = [
  ["FG, CF, BC", LEFT_CUT],
  ["GH, CH, CD — keep the right part", RIGHT_CUT],
  ["GH, CH, CD — keep the left part", { members: RIGHT_CUT.members, keep: "A" }],
  ["GH, DH, DE", { members: ["GH", "DH", "DE"], keep: "E" }],
];

export default {
  id: "truss-sections/3-build",
  challenge: "build",
  solver: "statics.truss",
  title: "Plan the Cut",
  mission: "Choose a cut and a moment point that give F_GH from one equation.",
  instructions:
    "The inspector needs the force in the top member **GH** — nothing else. Choose a cut and a moment point so that ONE equation gives $F_{GH}$, " +
    "work it out on paper for these loads (tension positive), then press **Test**. (The reactions are found first, from the whole truss.)",
  setup: { ...twoLoadSetup(), section: { ...LEFT_CUT, about: "A" }, showSectionUnknowns: true, showReactions: "always", knownReactions: true },
  view: BRIDGE_VIEW,
  vary: [
    { path: "forces.#P.magnitude", min: 300, max: 1200, step: 20 },
    { path: "forces.#Q.magnitude", min: 600, max: 1800, step: 20 },
  ],
  editable: [
    { label: "Cut through", options: CUTS.map(([label, c]) => ({ label, set: { "section.members": c.members, "section.keep": c.keep } })) },
    { label: "Take moments about", options: ["A", "B", "C", "D", "E", "F", "G", "H"].map((J) => ({ label: J, set: { "section.about": J } })) },
  ],
  goal: {
    text: "Your cut goes through GH and splits the truss in two, and your moment equation holds **only** $F_{GH}$.",
    predict: [{ quantity: "F_GH" }],
    check(result, setup) {
      const sec = setup.section;
      if (!result.values.secOk) return { ok: false, message: result.sectionMessage };
      if (!sec.members.includes("GH")) return { ok: false, message: "This cut doesn't go through GH, so $F_{GH}$ isn't one of its unknowns at all." };
      const inM = result.sectionUnknowns[2];
      if (inM.length !== 1) {
        return { ok: false, message: `$\\Sigma M_{${sec.about}}$ holds ${inM.length} member forces. Take moments where the OTHER two cut members' lines cross — then only $F_{GH}$ is left.` };
      }
      return { ok: true, message: `About ${sec.about}, CH and CD drop out: $F_{GH}$ comes from one equation. It pushes — the top chord is in compression.` };
    },
  },
  hints: [
    "The cut must go through GH — and through enough other members to split the truss in two.",
    "Of the three members cut, the other two must BOTH pass through your moment point. Where do CH and CD meet?",
    "Keeping the right part is quicker: only $E_y$ acts on it, 6 m from C, and $F_{GH}$ acts 3 m above C.",
  ],
  explanation:
    "Cut through GH, CH and CD, and take moments about C, where CH and CD meet: only $F_{GH}$ has a moment. Either part works — the right one has just $E_y$ on it. " +
    "That's the power of sections: one member's force from one equation, without solving any joint.",
};
