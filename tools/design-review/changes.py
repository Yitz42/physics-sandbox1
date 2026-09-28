# changes.py — what changed, read from git.
#
# The review looks only at what changed during ONE turn of work (one request to
# Claude), even if that turn made commits, and even if other work was already
# lying around uncommitted. To do that it photographs the whole working folder
# twice — when the request arrives and when Claude says it's done — and compares
# the two photographs.
#
# A "photograph" is a git tree: git's own record of every file's contents. It's
# built with a throwaway staging area (GIT_INDEX_FILE), so the real one — what
# the owner or Claude has staged for the next commit — is never touched.

import os
import subprocess
import tempfile


def git(*args, cwd, env=None):
    """Run a git command in `cwd` and return what it prints."""
    # errors="replace": a changed picture or other binary file mustn't stop the review.
    out = subprocess.run(["git", *args], cwd=cwd, env=env, capture_output=True, text=True, encoding="utf-8", errors="replace")
    if out.returncode != 0:
        raise RuntimeError(f"git {' '.join(args)}: {out.stderr.strip()}")
    return out.stdout


def snapshot(cwd):
    """Photograph the working folder: every file git would see (tracked, changed
    or new; ignored files left out), as one tree id."""
    with tempfile.TemporaryDirectory() as tmp:
        env = {**os.environ, "GIT_INDEX_FILE": os.path.join(tmp, "index")}
        try:
            git("read-tree", "HEAD", cwd=cwd, env=env)  # start from the last commit (faster)
        except RuntimeError:
            pass  # a brand-new repository has no commit yet
        git("add", "-A", ".", cwd=cwd, env=env)
        return git("write-tree", cwd=cwd, env=env).strip()


def tree_of(ref, cwd):
    """The tree id for a commit or branch name (so a review can start 'since HEAD')."""
    return git("rev-parse", f"{ref}^{{tree}}", cwd=cwd).strip()


def changed_files(before, after, cwd):
    """Files added or changed between two photographs (deleted ones need no review).
    Returns [(path, status)], status "A" (added) or "M" (modified)."""
    out = git("diff", "--name-status", "--no-renames", before, after, cwd=cwd)
    files = []
    for line in out.splitlines():
        status, _, path = line.partition("\t")
        if status in ("A", "M"):
            files.append((path, status))
    return files


def file_diff(before, after, path, cwd):
    """The change to one file, in git's usual form: lines starting with + were
    added, - removed, and a few unchanged lines around them for context."""
    return git("diff", "--no-renames", "-U4", before, after, "--", path, cwd=cwd)


def line_counts(before, after, path, cwd):
    """(lines before, lines after) for one file; 0 before for a new file."""
    def count(tree):
        try:
            return len(git("show", f"{tree}:{path}", cwd=cwd).splitlines())
        except RuntimeError:
            return 0
    return count(before), count(after)


# ---- Where the start-of-turn photograph is kept ------------------------------------
# Inside .git (so it's never committed), one small file per Claude session, so two
# sessions working at once don't overwrite each other's starting point.

def _store_dir(cwd):
    rel = git("rev-parse", "--git-path", "design-review", cwd=cwd).strip()
    path = os.path.join(cwd, rel)
    os.makedirs(path, exist_ok=True)
    return path


def _safe(session_id):
    return "".join(c for c in str(session_id or "default") if c.isalnum() or c in "-_")[:80] or "default"


def save_start(cwd, session_id, tree):
    with open(os.path.join(_store_dir(cwd), _safe(session_id) + ".start"), "w") as f:
        f.write(tree)


def load_start(cwd, session_id):
    try:
        with open(os.path.join(_store_dir(cwd), _safe(session_id) + ".start")) as f:
            return f.read().strip() or None
    except OSError:
        return None
