# test_review.py — tests for the design review.
# Run from the project folder:  python3 tools/design-review/test_review.py
#
# No real TypeSafe calls: a small fake server stands in for it, answering with
# probabilities the test chooses, and each test works in a throwaway git
# repository that looks like this project (content/, src/, tests/).

import json
import os
import subprocess
import sys
import tempfile
import threading
import unittest
from http.server import BaseHTTPRequestHandler, HTTPServer

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)

import checks  # noqa: E402
import judge  # noqa: E402

# ---- A fake TypeSafe ----------------------------------------------------------------
# FAKE["p"]: {rule id: probability broken} it answers with (0.1 for any other rule);
# FAKE["status"]: an HTTP error code to answer with instead; FAKE["bodies"]: requests seen.
FAKE = {"p": {}, "status": None, "bodies": []}


class FakeTypeSafe(BaseHTTPRequestHandler):
    def do_POST(self):
        body = json.loads(self.rfile.read(int(self.headers["Content-Length"])))
        FAKE["bodies"].append({"auth": self.headers["Authorization"], **body})
        if FAKE["status"]:
            self.send_response(FAKE["status"])
            self.end_headers()
            self.wfile.write(b"service unavailable")
            return
        answers = {q: {"type": "noul", "noul": FAKE["p"].get(q, 0.1)} for q in body["questions"]}
        out = json.dumps({"model": body["model"], "answers": answers, "usage": {}}).encode()
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(out)

    def log_message(self, *args):
        pass  # keep test output clean


SERVER = HTTPServer(("127.0.0.1", 0), FakeTypeSafe)
threading.Thread(target=SERVER.serve_forever, daemon=True).start()
FAKE_URL = f"http://127.0.0.1:{SERVER.server_port}/v1/systemone"


# ---- A throwaway project ------------------------------------------------------------

class Repo:
    def __init__(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.home = tempfile.TemporaryDirectory()
        self.dir = os.path.realpath(self.tmp.name)
        self.git("init", "-q")
        self.write("README.md", "hello\n")
        self.git("add", "-A")
        self.git("-c", "user.name=t", "-c", "user.email=t@t", "commit", "-qm", "start")

    def git(self, *args):
        subprocess.run(["git", *args], cwd=self.dir, check=True, capture_output=True)

    def write(self, path, text):
        full = os.path.join(self.dir, path)
        os.makedirs(os.path.dirname(full), exist_ok=True)
        with open(full, "w") as f:
            f.write(text)

    def hook(self, mode, key="test-key", **extra):
        """Run review.py as Claude Code would. Returns (exit code, stdout, stderr)."""
        # HOME points at an empty folder OUTSIDE the project, so no real ~/.typesafe_api_key
        # is found (and anything the Mac writes to a home folder doesn't land in the project).
        env = {**os.environ, "TYPESAFE_API_URL": FAKE_URL, "HOME": self.home.name}
        env.pop("TYPESAFE_API_KEY", None)
        if key:
            env["TYPESAFE_API_KEY"] = key
        payload = json.dumps({"session_id": "s1", "cwd": self.dir, "hook_event_name": mode, **extra})
        out = subprocess.run([sys.executable, os.path.join(HERE, "review.py"), mode],
                             input=payload, capture_output=True, text=True, env=env)
        return out.returncode, out.stdout, out.stderr


BUILD_STAGE = 'export default { id: "03-moments/3-build", challenge: "build", title: "Hold the sign" };\n'


class TestRuleChoice(unittest.TestCase):
    def ids(self, path):
        return {r["id"] for r in checks.judged_rules_for(path)}

    def test_build_stage_gets_the_build_rule(self):
        self.assertIn("build-not-guessable", self.ids("content/statics/moments/3-build.js"))
        self.assertIn("situations-in-library", self.ids("content/statics/moments/3-build.js"))

    def test_library_file_is_not_a_stage(self):
        ids = self.ids("content/statics/library/beams.js")
        self.assertIn("plain-short-student-text", ids)
        self.assertNotIn("situations-in-library", ids)
        self.assertNotIn("build-not-guessable", ids)

    def test_core_file_gets_code_rules_not_content_rules(self):
        ids = self.ids("src/core/runner.js")
        self.assertEqual(ids, {"comments-explain-why", "shared-code-knows-no-subject"})

    def test_pictures_and_course_lists_skip_the_lesson_rules(self):
        self.assertNotIn("wrong-answer-feedback-explains", self.ids("src/subjects/statics/moment-scene.js"))
        self.assertIn("wrong-answer-feedback-explains", self.ids("src/subjects/statics/moment.js"))
        self.assertNotIn("hints-guide-not-give", self.ids("content/statics/course.js"))
        self.assertIn("hints-guide-not-give", self.ids("content/statics/library/beams.js"))

    def test_docs_and_tests_are_not_judged(self):
        self.assertEqual(self.ids("docs/TEACHING.md"), set())
        self.assertEqual(self.ids("tests/statics/moment.test.js"), set())


class TestCodedRules(unittest.TestCase):
    def rules(self, path, text, before=10, after=10):
        return [f["rule"] for f in checks.check_file(path, text, before, after)]

    def test_core_importing_a_subject_is_caught(self):
        self.assertTrue(self.rules("src/core/x.js", 'import { G } from "../subjects/statics/particle.js";\n'))

    def test_relative_imports_are_fine(self):
        self.assertEqual(self.rules("src/core/x.js", 'import { el } from "../ui/controls.js";\nexport { a } from "./a.js";\n'), [])

    def test_package_import_is_caught(self):
        self.assertTrue(self.rules("src/ui/x.js", 'import * as THREE from "three";\n'))

    def test_text_that_merely_says_from_is_fine(self):
        self.assertEqual(self.rules("src/ui/x.js", 'const s = `records from "${f.name}"`;\n'), [])

    def test_long_file_only_when_it_grew(self):
        self.assertTrue(self.rules("src/core/x.js", "", before=200, after=230))
        self.assertEqual(self.rules("src/core/x.js", "", before=400, after=399), [])
        self.assertEqual(self.rules("content/statics/a/1-explore.js", "", before=10, after=300), [])

    def test_solver_change_needs_a_test(self):
        self.assertTrue(checks.check_turn(["src/subjects/statics/moment.js"]))
        self.assertEqual(checks.check_turn(["src/subjects/statics/moment.js", "tests/statics/moment.test.js"]), [])
        self.assertEqual(checks.check_turn(["src/subjects/statics/moment-scene.js"]), [])


class TestJudge(unittest.TestCase):
    def test_request_shape_follows_the_api(self):
        rules = checks.judged_rules_for("content/statics/moments/3-build.js")
        body = judge.build_request("content/statics/moments/3-build.js", "+" + BUILD_STAGE, rules)
        self.assertEqual(body["model"], "jev-latest")
        self.assertIn("change", body["state"])
        q = body["questions"]["build-not-guessable"]
        self.assertEqual(q["type"], "noul")
        self.assertEqual(set(q["criteria"]), {"true", "false"})

    def test_huge_change_is_cut_with_a_note(self):
        body = judge.build_request("src/core/x.js", "+x\n" * 50_000, checks.judged_rules_for("src/core/x.js"))
        self.assertLessEqual(len(body["state"]["change"]), judge.MAX_CHANGE_CHARS)
        self.assertIn("cut short", body["state"]["how_to_read_the_change"])

    def test_thresholds(self):
        rules = [{"id": a, "rule": a, "source": "s", "breaks": "b"} for a in "xyz"]
        think, look = judge.verdicts("f", rules, {"x": 0.9, "y": 0.6, "z": 0.2})
        self.assertEqual([i["rule"] for i in think], ["x"])
        self.assertEqual([i["rule"] for i in look], ["y"])


class TestHooks(unittest.TestCase):
    def setUp(self):
        FAKE.update(p={}, status=None, bodies=[])
        self.repo = Repo()
        self.repo.write("content/statics/old/1-explore.js", "// someone else's unfinished work\n")  # lying around before the request

    def tearDown(self):
        self.repo.tmp.cleanup()
        self.repo.home.cleanup()

    def test_binary_files_dont_break_it(self):
        self.repo.hook("start")
        with open(os.path.join(self.repo.dir, "picture.png"), "wb") as f:
            f.write(bytes(range(256)))
        self.repo.write("content/statics/moments/3-build.js", BUILD_STAGE)
        self.assertEqual(self.repo.hook("stop")[0], 0)

    def test_broken_rule_sends_claude_back_once(self):
        self.assertEqual(self.repo.hook("start")[0], 0)
        self.repo.write("content/statics/moments/3-build.js", BUILD_STAGE)
        FAKE["p"] = {"build-not-guessable": 0.85}
        code, _, err = self.repo.hook("stop")
        self.assertEqual(code, 2)
        self.assertIn("passable by trial and error", err)
        self.assertIn("85% likely broken", err)
        # Only this request's work was reviewed, not the file that was already there.
        self.assertEqual([b["state"]["file"] for b in FAKE["bodies"]], ["content/statics/moments/3-build.js"])
        self.assertEqual(FAKE["bodies"][0]["auth"], "Bearer test-key")
        # Second stop in the same request: shown to the owner, Claude isn't held again.
        code, out, _ = self.repo.hook("stop", stop_hook_active=True)
        self.assertEqual(code, 0)
        self.assertIn("still has doubts", json.loads(out)["systemMessage"])

    def test_committed_work_is_still_reviewed(self):
        self.repo.hook("start")
        self.repo.write("content/statics/moments/3-build.js", BUILD_STAGE)
        self.repo.git("add", "-A")
        self.repo.git("-c", "user.name=t", "-c", "user.email=t@t", "commit", "-qm", "step")
        FAKE["p"] = {"build-not-guessable": 0.9}
        self.assertEqual(self.repo.hook("stop")[0], 2)

    def test_all_clear_lets_claude_finish(self):
        self.repo.hook("start")
        self.repo.write("content/statics/moments/3-build.js", BUILD_STAGE)
        code, out, err = self.repo.hook("stop")
        self.assertEqual((code, out, err), (0, "", ""))

    def test_no_change_means_no_request(self):
        self.repo.hook("start")
        self.assertEqual(self.repo.hook("stop")[0], 0)
        self.assertEqual(FAKE["bodies"], [])

    def test_exact_rules_work_without_a_key(self):
        self.repo.hook("start")
        self.repo.write("src/core/thing.js", 'import { x } from "../subjects/statics/particle.js";\n')
        code, _, err = self.repo.hook("stop", key=None)
        self.assertEqual(code, 2)
        self.assertIn("never imports from a subject", err)
        self.assertEqual(FAKE["bodies"], [])

    def test_service_failure_never_blocks(self):
        self.repo.hook("start")
        self.repo.write("content/statics/moments/3-build.js", BUILD_STAGE)
        FAKE["status"] = 500
        code, out, _ = self.repo.hook("stop")
        self.assertEqual(code, 0)
        self.assertIn("failed", json.loads(out)["systemMessage"])

    def test_start_prints_nothing(self):
        # Anything a start hook prints is added to Claude's instructions, so it must stay silent.
        self.assertEqual(self.repo.hook("start"), (0, "", ""))

    def test_real_staging_area_is_untouched(self):
        self.repo.write("content/statics/moments/3-build.js", BUILD_STAGE)
        self.repo.hook("start")
        staged = subprocess.run(["git", "diff", "--cached", "--name-only"], cwd=self.repo.dir, capture_output=True, text=True).stdout
        self.assertEqual(staged, "")


if __name__ == "__main__":
    unittest.main(verbosity=1)
