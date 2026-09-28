// Unit 9.2 — Tipping versus slipping: a crate can slide, or tip over its corner. Which comes first?
export default {
  title: "Tipping versus slipping",
  concept: "A crate isn't a point: the floor's push $N$ is spread under its base, and its resultant acts wherever the moments need it. Push harder (or higher) and $N$ moves toward the front corner $O$. The crate **tips** once $N$ would have to act beyond $O$; it **slips** once the friction it needs reaches $\\mu_s N$. Work out both — the push (or slope) that tips it, from $\\Sigma M_O = 0$ with $N$ at $O$, and the one that slips it — and the **smaller** one is what happens first.",
  goals: [
    "Find where the floor's push N acts on a crate, from a moment equation.",
    "Find the push that tips a crate: N at the corner O, then ΣM_O = 0.",
    "Find the push (or slope angle) that starts it slipping, and decide which happens first.",
    "Choose where to push so a tall object slides instead of tipping over.",
  ],
  stages: ["1-explore", "2-predict", "3-build", "4-debug", "5-concept-check", "6-solve"],
};
