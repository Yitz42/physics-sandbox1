// Every page module loads: a missing export or a mistyped import breaks the
// whole game, even when every function's own tests pass.
import { test, ok, setFile } from "../harness.js";

setFile("core / every module loads");

// The modules the game's pages start from (they import all the rest, except main.js,
// which draws the page as soon as it loads).
const MODULES = ["core/runner.js", "ui/data-panel.js", "ui/menus.js", "ui/chrome.js", "ui/stage-view.js", "ui/comprehension-view.js"];
const loaded = {};
for (const m of MODULES) {
  try {
    await import(`../../src/${m}`);
    loaded[m] = true;
  } catch (err) {
    loaded[m] = err.message;
  }
}

for (const m of MODULES) test(`${m} loads`, () => ok(loaded[m] === true, String(loaded[m])));
