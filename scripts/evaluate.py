import os
import sys

SCRIPTS_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(SCRIPTS_DIR, ".."))
BACKEND_DIR = os.path.join(PROJECT_ROOT, "backend")

for p in (BACKEND_DIR, PROJECT_ROOT):
    if p not in sys.path:
        sys.path.insert(0, p)

# Execute backend/scripts/evaluate.py directly
backend_script = os.path.join(BACKEND_DIR, "scripts", "evaluate.py")
with open(backend_script, "r", encoding="utf-8") as f:
    code = compile(f.read(), backend_script, "exec")
    exec(code, {"__name__": "__main__", "__file__": backend_script})
