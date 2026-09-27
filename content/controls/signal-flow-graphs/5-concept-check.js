// Signal-flow graphs, stage 5 — concept check: what the parts of Mason's rule
// mean. Questions are drawn in random order; 3 correct answers finish it.

export default {
  id: "signal-flow-graphs/5-concept-check",
  challenge: "concept-check",
  solver: "controls.signalFlow",
  title: "Mason Sense",
  mission: "Show you know how signal-flow graphs and Mason's rule work.",
  instructions: "Answer 3 questions about signal-flow graphs and Mason's rule. Every wrong choice explains the misconception behind it.",
  required: 3,
  questions: [
    {
      prompt: "In a signal-flow graph, when do two loops \"touch\"?",
      options: [
        { text: "When they share at least one node", correct: true },
        { text: "When they share a branch", feedback: "Sharing a node is enough: two loops that pass through the same signal touch, even if no branch is shared." },
        { text: "When they cross on the drawing", feedback: "The drawing doesn't matter; the graph does. Loops touch when they share a node (a signal)." },
        { text: "When their gains multiply to 1", feedback: "Touching is about the graph's shape (shared nodes), not the gain values." },
      ],
      explanation: "Loops touch if they have any node in common. Only non-touching loops' products appear in $\\Delta$.",
    },
    {
      prompt: "A graph has two loops, $L_1$ and $L_2$, that don't touch. What is $\\Delta$?",
      options: [
        { text: "$1 - L_1 - L_2 + L_1L_2$", correct: true },
        { text: "$1 - L_1 - L_2$", feedback: "That's right for TOUCHING loops. Non-touching loops also add the product $L_1L_2$." },
        { text: "$1 + L_1 + L_2 + L_1L_2$", feedback: "Loop gains are SUBTRACTED in $\\Delta$: $1 - \\Sigma L + \\dots$" },
        { text: "$(1 - L_1)(1 + L_2)$", feedback: "Close — non-touching loops do multiply out, but both factors are $(1 - L)$: $(1 - L_1)(1 - L_2)$." },
      ],
      explanation: "$\\Delta = 1 - (L_1 + L_2) + L_1L_2 = (1 - L_1)(1 - L_2)$: for non-touching loops it factors, as if each loop acted on its own.",
    },
    {
      prompt: "What is $\\Delta_k$ in Mason's rule?",
      options: [
        { text: "$\\Delta$ worked out using only the loops that don't touch forward path $k$", correct: true },
        { text: "Always 1", feedback: "It's 1 only when path $k$ touches every loop. Loops it misses stay in $\\Delta_k$." },
        { text: "The same as $\\Delta$", feedback: "Only if path $k$ touches NO loop. Every loop the path touches is removed." },
        { text: "The gain of path $k$", feedback: "That's $P_k$. $\\Delta_k$ is the part of $\\Delta$ that path $k$ doesn't touch." },
      ],
      explanation: "Remove from $\\Delta$ every loop that touches path $k$; what's left is $\\Delta_k$ (often just 1).",
    },
    {
      prompt: "What is a forward path?",
      options: [
        { text: "A route from the input to the output along the arrows, visiting no node twice", correct: true },
        { text: "Any route along the arrows", feedback: "It must start at the input, end at the output, and not pass through a node twice (no going round a loop)." },
        { text: "The straight line along the bottom of the drawing", feedback: "Any route from input to output counts, however it's drawn — shortcuts and detours too." },
        { text: "A route that goes around a loop once", feedback: "Going round a loop visits a node twice. Loops are counted separately, in $\\Delta$." },
      ],
      explanation: "Forward paths go input → output along the arrows with no repeated node. Their gains are the $P_k$.",
    },
    {
      prompt: "When a block diagram is turned into a signal-flow graph, what does a summing junction become?",
      options: [
        { text: "A node, with the incoming branches carrying the signs (e.g. gain −1 for a minus)", correct: true },
        { text: "A branch with gain 1", feedback: "Signals live on nodes. The junction's output is a signal, so it becomes a node; the minus sign moves onto a branch gain." },
        { text: "A loop", feedback: "A loop appears only if the diagram has feedback around the junction. The junction itself is a node." },
        { text: "It disappears", feedback: "Its output is a signal, so it stays as a node — with any minus sign put into the gain of the branch coming in." },
      ],
      explanation: "Every signal is a node, and every block is a branch. A summing junction is a node whose incoming branches carry its signs.",
    },
  ],
  hints: ["Mason's rule: $T = \\dfrac{\\Sigma P_k\\Delta_k}{\\Delta}$, $\\Delta = 1 - \\Sigma L + \\Sigma(\\text{non-touching pairs}) - \\dots$"],
  explanation: "Mason's rule is: forward paths on top, each with the part of $\\Delta$ it doesn't touch; $\\Delta$ on the bottom, from the loops and the non-touching loops.",
};
