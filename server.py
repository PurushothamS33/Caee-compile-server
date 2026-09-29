"""
CAEE compile + assessment server
---------------------------------
Endpoints:
  /run                 - compile and run a complete C program (used by the
                         C Playground). Unchanged.
  /api/labs/assess     - "Run All Tests": compiles the student's lab()
                         function with a server-generated test runner and
                         checks it against the authoritative test
                         definitions in lab_tests.json. Issues a signed
                         receipt only when every required test passes.
  /api/labs/run-input  - "Run This Input": runs the student's lab() once on a
                         custom input and returns the raw return code and
                         outputs. Exploratory only - never issues a receipt.
  /api/labs/complete   - verifies a receipt before acknowledging completion.

How the tests are kept honest:
  * The expected results live only on the server (lab_tests.json). The
    compiled program just reports what lab() returned; the comparison is
    done here in Python, so printing "PASS" from student code achieves
    nothing.
  * Result lines carry a random per-run nonce and come from a separately
    compiled runner file, so student code cannot forge them by name.
  * Each test runs in its own child process with a 1 s alarm, so a crash
    or an infinite loop in one test is reported for that test only.
  * Every submission runs in its own temporary directory with CPU, memory,
    file-size and process limits and a wall-clock timeout.
  * Receipts are HMAC-signed and stateless.
"""
import os, re, time, json, math, shutil, hashlib, hmac, base64, resource, secrets, subprocess, tempfile
from collections import defaultdict, deque
from flask import Flask, request, jsonify
from flask_cors import CORS

CAEE_TOKEN = os.environ.get("CAEE_TOKEN", "")
SITE_ORIGIN = os.environ.get("SITE_ORIGIN", "*")
RECEIPT_SECRET = os.environ.get("LAB_RECEIPT_SECRET", "caee-default-dev-secret-change-me").encode()

RATE_WINDOW = 600
RATE_MAX = {"run": 40, "assess": 240, "input": 480}   # per IP per 10 min; a classroom often shares one IP
_hits = defaultdict(deque)

MAX_CODE_BYTES = 65536
COMPILE_TIMEOUT = 10
RUN_TIMEOUT = 5            # /run (playground)
TEST_WALL_TIMEOUT = 20     # whole test run, all child processes
MAX_OUTPUT = 1024 * 1024
RUNNER = "caee.labtests.v3"

BANNED = [
    r'\b(system|fork|execl|execlp|execv|execve|popen|remove|unlink|rename)\s*\(',
    r'\b(socket|connect|bind|listen|accept)\s*\(',
    r'__asm__|asm\s*\(',
]

app = Flask(__name__)
CORS(app, origins=[SITE_ORIGIN] if SITE_ORIGIN != "*" else "*")

_HERE = os.path.dirname(os.path.abspath(__file__))
TESTS = json.load(open(os.path.join(_HERE, "lab_tests.json")))
MODULES = TESTS["modules"]
TOL_ABS = TESTS["tolerance"]["abs"]
TOL_REL = TESTS["tolerance"]["rel"]
SENTINEL = TESTS["sentinel"]
print(f"[caee] {RUNNER}: {len(MODULES)} modules, test revision {TESTS['revision']}")


# ------------------------------------------------------------------ helpers
def limits():
    resource.setrlimit(resource.RLIMIT_CPU, (RUN_TIMEOUT, RUN_TIMEOUT))
    resource.setrlimit(resource.RLIMIT_AS, (256 * 1024 * 1024,) * 2)
    resource.setrlimit(resource.RLIMIT_FSIZE, (4 * 1024 * 1024,) * 2)
    resource.setrlimit(resource.RLIMIT_NPROC, (64, 64))
    resource.setrlimit(resource.RLIMIT_CORE, (0, 0))


def rate_ok(bucket):
    ip = request.headers.get('X-Forwarded-For', request.remote_addr or '?').split(',')[0].strip()
    now = time.time()
    q = _hits[(bucket, ip)]
    while q and now - q[0] > RATE_WINDOW:
        q.popleft()
    if len(q) >= RATE_MAX[bucket]:
        return False
    q.append(now)
    return True


def token_ok(payload):
    if not CAEE_TOKEN:
        return True
    sent = request.headers.get('X-CAEE-Token') or (payload or {}).get('token', '')
    return sent == CAEE_TOKEN


def policy_error(code):
    for pattern in BANNED:
        if re.search(pattern, code):
            return 'This exercise does not allow system, process or network calls.'
    return None


def compile_and_run(code):
    """Used by /run (C Playground). Behaviour unchanged."""
    workdir = tempfile.mkdtemp(prefix="caee_")
    try:
        src = os.path.join(workdir, "main.c")
        binf = os.path.join(workdir, "main")
        with open(src, "w") as f:
            f.write(code)
        try:
            cp = subprocess.run(["gcc", "-O0", "-Wall", src, "-o", binf, "-lm"],
                                capture_output=True, text=True, timeout=COMPILE_TIMEOUT, cwd=workdir)
        except subprocess.TimeoutExpired:
            return False, "compile", "compile timed out"
        if cp.returncode != 0:
            return False, "compile", cp.stderr[:4000]
        try:
            rp = subprocess.run([binf], capture_output=True, text=True, timeout=RUN_TIMEOUT,
                                cwd=workdir, preexec_fn=limits, env={"PATH": "/usr/bin:/bin"})
        except subprocess.TimeoutExpired:
            return False, "run", "run timed out (possible infinite loop)"
        return True, "run", (rp.stdout or "")[:65536]
    finally:
        shutil.rmtree(workdir, ignore_errors=True)


def sign_receipt(payload: dict) -> str:
    raw = json.dumps(payload, separators=(",", ":"), sort_keys=True).encode()
    sig = hmac.new(RECEIPT_SECRET, raw, hashlib.sha256).digest()
    return base64.urlsafe_b64encode(raw).decode() + "." + base64.urlsafe_b64encode(sig).decode()


def verify_receipt(token: str):
    try:
        raw_b64, sig_b64 = token.split(".", 1)
        raw = base64.urlsafe_b64decode(raw_b64.encode())
        sig = base64.urlsafe_b64decode(sig_b64.encode())
        expected = hmac.new(RECEIPT_SECRET, raw, hashlib.sha256).digest()
        if not hmac.compare_digest(sig, expected):
            return None
        return json.loads(raw)
    except Exception:
        return None


# ------------------------------------------------------------ number helpers
def to_float(x):
    if isinstance(x, str):
        s = x.strip().lower()
        if s in ("nan", "+nan", "-nan"):
            return math.nan
        if s in ("inf", "+inf", "infinity", "+infinity"):
            return math.inf
        if s in ("-inf", "-infinity"):
            return -math.inf
        return float(s)
    if isinstance(x, bool):
        raise ValueError("boolean")
    return float(x)


def c_lit(x):
    v = to_float(x)
    if math.isnan(v):
        return "NAN"
    if math.isinf(v):
        return "INFINITY" if v > 0 else "(-INFINITY)"
    return repr(v)


def show(v):
    if v is None:
        return None
    if math.isnan(v):
        return "nan"
    if math.isinf(v):
        return "inf" if v > 0 else "-inf"
    if v == 0:
        return "0"
    return format(v, ".12g")


def close(actual, expected, exact):
    if not math.isfinite(actual):
        return False
    if exact:
        return actual == expected
    return abs(actual - expected) <= TOL_ABS + TOL_REL * abs(expected)


# --------------------------------------------------------- the test runner
RUNNER_C = r'''
#define _DEFAULT_SOURCE
#include <stdio.h>
#include <stdlib.h>
#include <math.h>
#include <unistd.h>
#include <signal.h>
#include <sys/types.h>
#include <sys/wait.h>
int lab(const double in[8], double out[8]);
static const char CAEE_N[] = "%(nonce)s";
static void caee_emit(int t, int s, int rc, const double *o) {
  printf("%%s R %%d %%d %%d", CAEE_N, t, s, rc);
  if (o) for (int k = 0; k < 8; ++k) printf(" %%.17g", o[k]);
  printf("\n");
  fflush(stdout);
}
%(tables)s
static void caee_single(int t, int kind, const double *src) {
  double in[8], out[8];
  for (int k = 0; k < 8; ++k) { in[k] = src[k]; out[k] = %(sentinel)s; }
  if (kind == 1) { int rc = lab(NULL, out); caee_emit(t, 0, rc, out); }
  else if (kind == 2) { int rc = lab(in, NULL); caee_emit(t, 0, rc, NULL); }
  else { int rc = lab(in, out); caee_emit(t, 0, rc, out); }
}
static void caee_sequence(int t, int m, const double (*ins)[8], const int (*carry)[8]) {
  double prev[8];
  for (int s = 0; s < m; ++s) {
    double in[8], out[8];
    for (int k = 0; k < 8; ++k) {
      in[k] = ins[s][k];
      if (s > 0 && carry[s][k] >= 0) in[k] = prev[carry[s][k]];
      out[k] = %(sentinel)s;
    }
    int rc = lab(in, out);
    caee_emit(t, s, rc, out);
    if (rc != 0) return;
    for (int k = 0; k < 8; ++k) prev[k] = out[k];
  }
}
static void caee_dispatch(int t) {
%(dispatch)s
}
int main(void) {
  const int total = %(total)d;
  for (int t = 0; t < total; ++t) {
    fflush(stdout);
    pid_t p = fork();
    if (p == 0) { alarm(1); caee_dispatch(t); fflush(stdout); _exit(0); }
    if (p < 0) { caee_dispatch(t); printf("%%s D %%d 0\n", CAEE_N, t); continue; }
    int st = 0;
    waitpid(p, &st, 0);
    if (WIFSIGNALED(st)) {
      printf("%%s X %%d %%d\n", CAEE_N, t, WTERMSIG(st));
      if (WTERMSIG(st) == SIGALRM) { printf("%%s STOP %%d\n", CAEE_N, t); fflush(stdout); break; }
    } else {
      printf("%%s D %%d %%d\n", CAEE_N, t, WEXITSTATUS(st));
    }
    fflush(stdout);
  }
  printf("%%s END\n", CAEE_N);
  return 0;
}
'''


def build_runner(units, nonce):
    """units: list of ('single', kind, in8) or ('seq', steps)."""
    tables, dispatch = [], []
    for t, u in enumerate(units):
        if u[0] == 'single':
            vals = ", ".join(c_lit(x) for x in u[2])
            tables.append(f"static const double CAEE_I{t}[8] = {{ {vals} }};")
            dispatch.append(f"  if (t == {t}) {{ caee_single({t}, {u[1]}, CAEE_I{t}); return; }}")
        else:
            steps = u[1]
            rows = ",\n  ".join("{ " + ", ".join(c_lit(x) for x in s["in"]) + " }" for s in steps)
            carry = ",\n  ".join("{ " + ", ".join(str(int(s["carry"].get(str(k), -1))) for k in range(8)) + " }" for s in steps)
            tables.append(f"static const double CAEE_S{t}[{len(steps)}][8] = {{\n  {rows}\n}};")
            tables.append(f"static const int CAEE_C{t}[{len(steps)}][8] = {{\n  {carry}\n}};")
            dispatch.append(f"  if (t == {t}) {{ caee_sequence({t}, {len(steps)}, CAEE_S{t}, CAEE_C{t}); return; }}")
    return RUNNER_C % {"nonce": nonce, "tables": "\n".join(tables), "dispatch": "\n".join(dispatch),
                       "total": len(units), "sentinel": repr(float(SENTINEL))}


def run_units(source, units):
    """Compile student source + runner, execute, return dict with per-unit raw records."""
    nonce = secrets.token_hex(16)
    workdir = tempfile.mkdtemp(prefix="caee_lab_")
    res = {"compiled": False, "compilerOutput": "", "programOutput": "", "records": {}, "stoppedAt": None, "wallTimeout": False}
    try:
        with open(os.path.join(workdir, "lab.c"), "w") as f:
            f.write(source)
        with open(os.path.join(workdir, "caee_runner.c"), "w") as f:
            f.write(build_runner(units, nonce))
        msgs = []
        try:
            c1 = subprocess.run(["gcc", "-std=gnu11", "-O0", "-Wall", "-c", "lab.c", "-o", "lab.o"],
                                capture_output=True, text=True, timeout=COMPILE_TIMEOUT, cwd=workdir)
            msgs.append(c1.stderr)
            if c1.returncode != 0:
                res["compilerOutput"] = "".join(msgs)[:8000]
                return res
            c2 = subprocess.run(["gcc", "-std=gnu11", "-O0", "-c", "caee_runner.c", "-o", "caee_runner.o"],
                                capture_output=True, text=True, timeout=COMPILE_TIMEOUT, cwd=workdir)
            if c2.returncode != 0:
                res["compilerOutput"] = "Internal test-runner error:\n" + c2.stderr[:4000]
                res["internal"] = True
                return res
            c3 = subprocess.run(["gcc", "lab.o", "caee_runner.o", "-o", "lab_tests", "-lm"],
                                capture_output=True, text=True, timeout=COMPILE_TIMEOUT, cwd=workdir)
            msgs.append(c3.stderr)
            if c3.returncode != 0:
                res["compilerOutput"] = "".join(msgs)[:8000]
                return res
        except subprocess.TimeoutExpired:
            res["compilerOutput"] = "Compilation timed out."
            return res
        res["compiled"] = True
        res["compilerOutput"] = "".join(msgs)[:8000]
        try:
            rp = subprocess.run(["./lab_tests"], capture_output=True, timeout=TEST_WALL_TIMEOUT,
                                cwd=workdir, preexec_fn=limits, env={"PATH": "/usr/bin:/bin"})
            out = rp.stdout[:MAX_OUTPUT].decode("utf-8", "replace")
        except subprocess.TimeoutExpired as e:
            res["wallTimeout"] = True
            out = (e.stdout or b"")[:MAX_OUTPUT].decode("utf-8", "replace")
        prog = []
        for line in out.splitlines():
            if not line.startswith(nonce + " "):
                prog.append(line)
                continue
            parts = line[len(nonce) + 1:].split()
            tag = parts[0]
            if tag == "R":
                t, s, rc = int(parts[1]), int(parts[2]), int(parts[3])
                vals = [float(x) for x in parts[4:12]] if len(parts) >= 12 else None
                res["records"].setdefault(t, {"steps": {}, "end": None})["steps"][s] = (rc, vals)
            elif tag in ("D", "X"):
                t = int(parts[1])
                res["records"].setdefault(t, {"steps": {}, "end": None})["end"] = (tag, int(parts[2]))
            elif tag == "STOP":
                res["stoppedAt"] = int(parts[1])
        res["programOutput"] = "\n".join(prog)[-4000:]
        return res
    finally:
        shutil.rmtree(workdir, ignore_errors=True)


def unit_status(rec):
    """Classify how a unit ended: ok / timeout / crash / noreturn / notrun."""
    if rec is None or rec["end"] is None:
        return "notrun", ""
    tag, code = rec["end"]
    if tag == "X":
        if code == 14:
            return "timeout", "lab() did not return within 1 s (possible infinite loop)"
        names = {11: "segmentation fault", 8: "floating-point exception", 6: "abort", 7: "bus error", 4: "illegal instruction"}
        return "crash", "the program crashed (%s)" % names.get(code, "signal %d" % code)
    return "ok", ""


VERDICT = {"timeout": "TIMED OUT", "crash": "CRASHED", "notrun": "NOT RUN", "noreturn": "DID NOT RETURN"}


def evaluate_call(mod, test, rc, vals, extra_check=None):
    exp_rc = -1 if test["expect"] == "REJECT" else 0
    passed, msg = True, ""
    if rc != exp_rc:
        passed = False
        msg = "returned %d, expected %d" % (rc, exp_rc)
    elif exp_rc == 0:
        exp = [to_float(x) for x in test["expect"]]
        exact = set(mod["exact"])
        bad = []
        for k in range(8):
            a = vals[k]
            if not math.isfinite(a):
                bad.append("out[%d] is not finite" % k)
            elif a == SENTINEL and exp[k] != SENTINEL:
                bad.append("out[%d] was never written" % k)
            elif not close(a, exp[k], k in exact):
                bad.append("out[%d] = %s, expected %s" % (k, show(a), show(exp[k])))
        if not bad and extra_check:
            bad += extra_check(test, vals)
        if bad:
            passed = False
            msg = "; ".join(bad[:4])
    return passed, msg


def invariant_check(mod):
    kind = mod.get("invariant")
    if kind == "M3":
        def chk(test, o):
            bad = []
            if not close(o[4], o[0], False):
                bad.append("round trip: reconstructed alpha %s != alpha %s" % (show(o[4]), show(o[0])))
            if not close(o[5], o[1], False):
                bad.append("round trip: reconstructed beta %s != beta %s" % (show(o[5]), show(o[1])))
            return bad
        return chk
    if kind == "M5":
        def chk(test, o):
            a, b, vdc = (to_float(test["in"][i]) for i in range(3))
            u = a
            v = -0.5 * a + math.sqrt(3) * 0.5 * b
            w = -0.5 * a - math.sqrt(3) * 0.5 * b
            bad = []
            for (i, j, pi, pj, n) in ((0, 1, u, v, "U-V"), (1, 2, v, w, "V-W"), (2, 0, w, u, "W-U")):
                if not close(vdc * (o[i] - o[j]), pi - pj, False):
                    bad.append("line voltage %s: Vdc*(d%s) = %s, expected %s" % (n, n, show(vdc * (o[i] - o[j])), show(pi - pj)))
            return bad
        return chk
    return None


def row(test, group, passed, verdict, rc, vals, msg, show_in=None):
    exp_rc = -1 if test["expect"] == "REJECT" else 0
    null_note = {"null_in": "in = NULL", "null_out": "out = NULL"}.get(test.get("kind"))
    return {
        "id": test["id"], "name": test["name"], "group": group,
        "input": show_in if show_in is not None else [show(to_float(x)) for x in test["in"]],
        "pointer": null_note,
        "expectedRc": exp_rc, "actualRc": rc,
        "expected": None if test["expect"] == "REJECT" else [show(to_float(x)) for x in test["expect"]],
        "actual": None if (vals is None or rc != 0 or exp_rc != 0) else [show(v) for v in vals],
        "passed": passed, "verdict": verdict, "message": msg,
    }


def assess_source(mid, source):
    mod = MODULES[mid]
    singles = mod["tests"] + mod["robustness"]
    units = [("single", {"call": 0, "null_in": 1, "null_out": 2}[t["kind"]], t["in"]) for t in singles]
    units += [("seq", s["steps"]) for s in mod["sequences"]]
    res = run_units(source, units)
    out = {"compiled": res["compiled"], "compilerOutput": res["compilerOutput"], "programOutput": res["programOutput"],
           "tests": [], "traces": {}, "summary": None}
    if not res["compiled"]:
        out["summary"] = "COMPILER SERVICE UNAVAILABLE" if res.get("internal") else "COMPILATION FAILED"
        for t in singles:
            out["tests"].append(row(t, t["group"], False, "NOT RUN", None, None, "not run - compilation failed"))
        for s in mod["sequences"]:
            for st in s["steps"]:
                if st["expect"] is not None:
                    fake = {"id": s["id"], "name": s["name"] + ": " + st["label"], "in": st["in"], "expect": st["expect"]}
                    out["tests"].append(row(fake, "sequence", False, "NOT RUN", None, None, "not run - compilation failed"))
        return out
    chk = invariant_check(mod)
    any_timeout = res["wallTimeout"] or res["stoppedAt"] is not None
    any_crash = False
    for t_idx, t in enumerate(singles):
        rec = res["records"].get(t_idx)
        status, why = unit_status(rec)
        step = rec["steps"].get(0) if rec else None
        if status == "ok" and step is None:
            status, why = "noreturn", "lab() did not return (the process exited early)"
        if status != "ok":
            if status == "crash" or status == "noreturn":
                any_crash = True
            if status == "notrun" and any_timeout:
                why = "not run - stopped after a timeout"
            out["tests"].append(row(t, t["group"], False, VERDICT[status], None, None, why))
            continue
        rc, vals = step
        passed, msg = evaluate_call(mod, t, rc, vals if vals else [SENTINEL] * 8, chk if t["group"] == "required" else None)
        out["tests"].append(row(t, t["group"], passed, "PASS" if passed else "FAIL", rc, vals, msg))
    for s_i, s in enumerate(mod["sequences"]):
        t_idx = len(singles) + s_i
        rec = res["records"].get(t_idx)
        status, why = unit_status(rec)
        steps = rec["steps"] if rec else {}
        if s.get("trace"):
            out["traces"][s["id"]] = [[k + 1, steps[k][1][0]] for k in sorted(steps) if steps[k][0] == 0 and steps[k][1] and math.isfinite(steps[k][1][0])]
        stop = None  # (verdict, message) once the sequence can no longer continue
        for k, st in enumerate(s["steps"]):
            got = steps.get(k)
            if got is None and stop is None:
                if status == "ok":
                    stop = ("DID NOT RETURN", "lab() did not return at call %d" % (k + 1))
                    any_crash = True
                elif status == "notrun":
                    stop = ("NOT RUN", why or "not run")
                else:
                    stop = (VERDICT[status], "call %d: %s" % (k + 1, why))
                    any_crash = any_crash or status == "crash"
            if st["expect"] is not None:
                fake = {"id": "%s.%d" % (s["id"], k + 1), "name": s["name"] + ": " + st["label"],
                        "in": st["in"], "expect": st["expect"]}
                shown = [show(to_float(x)) for x in st["in"]]
                if k > 0:
                    for slot, src in st["carry"].items():
                        shown[int(slot)] = "prev out[%d]" % int(src)
                if got is None:
                    out["tests"].append(row(fake, "sequence", False, stop[0], None, None, stop[1], shown))
                else:
                    passed, msg = evaluate_call(mod, fake, got[0], got[1] or [SENTINEL] * 8)
                    out["tests"].append(row(fake, "sequence", passed, "PASS" if passed else "FAIL", got[0], got[1], msg, shown))
            if got is not None and got[0] != 0 and stop is None:
                stop = ("FAIL", "not reached: call %d returned %d" % (k + 1, got[0]))
    verdicts = [t["verdict"] for t in out["tests"]]
    if any_timeout or "TIMED OUT" in verdicts:
        out["summary"] = "EXECUTION TIMED OUT"
    elif any(v in ("CRASHED", "DID NOT RETURN") for v in verdicts):
        out["summary"] = "EXECUTION FAILED"
    elif all(t["passed"] for t in out["tests"]):
        out["summary"] = "ALL REQUIRED TESTS PASSED"
    else:
        out["summary"] = "TEST FAILED"
    return out


# ------------------------------------------------------------------ routes
@app.route('/health')
def health():
    return jsonify(ok=True, service='caee-compile', runner=RUNNER, testRevision=TESTS["revision"], modules=len(MODULES))


@app.route('/run', methods=['POST', 'OPTIONS'])
def run():
    if request.method == 'OPTIONS':
        return ('', 204)
    data = request.get_json(silent=True) or {}
    if not token_ok(data):
        return jsonify(ok=False, stage='auth', output='Not authorised to use this compiler.'), 403
    if not rate_ok("run"):
        return jsonify(ok=False, stage='rate', output='Too many submissions from this address. Wait a few minutes.'), 429
    code = data.get('code', '')
    if not code.strip():
        return jsonify(ok=False, stage='input', output='No code received.')
    if len(code.encode('utf-8')) > MAX_CODE_BYTES:
        return jsonify(ok=False, stage='input', output='Source file too large.')
    if policy_error(code):
        return jsonify(ok=False, stage='policy', output=policy_error(code))
    ok, stage, output = compile_and_run(code)
    return jsonify(ok=ok, stage=stage, output=output)


def common_checks(body, bucket):
    if not token_ok(body):
        return None, (jsonify(error='Not authorised.'), 403)
    if not rate_ok(bucket):
        return None, (jsonify(error='Too many submissions from this address. Wait a few minutes.'), 429)
    track, mid, source = body.get('track'), body.get('moduleId'), body.get('source', '')
    if not isinstance(source, str) or not source.strip():
        return None, (jsonify(error='Empty source.'), 400)
    if len(source.encode('utf-8')) > MAX_CODE_BYTES:
        return None, (jsonify(error='Source exceeds size limit.'), 400)
    mod = MODULES.get(mid)
    if not mod or track not in mod["tracks"]:
        return None, (jsonify(error=f'Unknown module {mid} for track {track}.'), 404)
    return (track, mid, source), None


@app.route('/api/labs/assess', methods=['POST', 'OPTIONS'])
def assess():
    if request.method == 'OPTIONS':
        return ('', 204)
    body = request.get_json(silent=True) or {}
    if body.get('schema') != 'caee.assess.v2':
        return jsonify(error='Unsupported schema.'), 400
    ok, err = common_checks(body, "assess")
    if err:
        return err
    track, mid, source = ok
    revision = body.get('revision')
    real_hash = hashlib.sha256(source.encode('utf-8')).hexdigest()
    if body.get('sourceHash', '') != real_hash:
        return jsonify(error='Source hash mismatch.'), 400
    base = {"schema": "caee.assessment.v2", "runner": RUNNER, "testRevision": TESTS["revision"],
            "sourceHash": real_hash, "moduleId": mid, "revision": revision}
    pol = policy_error(source)
    if pol:
        return jsonify({**base, "status": "failed", "summary": "COMPILATION FAILED", "compiled": False,
                        "compilerOutput": pol, "programOutput": "", "traces": {},
                        "tests": [{"name": "policy", "passed": False, "verdict": "NOT RUN", "group": "required", "message": pol}],
                        "diagnostics": pol})
    result = assess_source(mid, source)
    passed = result["summary"] == "ALL REQUIRED TESTS PASSED"
    resp = {**base, **result, "status": "passed" if passed else "failed",
            "diagnostics": result["summary"] + ("\n" + result["compilerOutput"] if result["compilerOutput"] else "")}
    if passed:
        resp["receiptId"] = sign_receipt({"moduleId": mid, "track": track, "sourceHash": real_hash, "revision": revision,
                                          "testRevision": TESTS["revision"], "iat": int(time.time())})
    return jsonify(resp)


@app.route('/api/labs/run-input', methods=['POST', 'OPTIONS'])
def run_input():
    if request.method == 'OPTIONS':
        return ('', 204)
    body = request.get_json(silent=True) or {}
    if body.get('schema') != 'caee.runinput.v1':
        return jsonify(error='Unsupported schema.'), 400
    ok, err = common_checks(body, "input")
    if err:
        return err
    track, mid, source = ok
    raw = body.get('input')
    if not isinstance(raw, list) or len(raw) != 8:
        return jsonify(error='Input must be a list of eight values.'), 400
    try:
        vals = [to_float(x) for x in raw]
    except (TypeError, ValueError):
        return jsonify(error='Each input must be a number, nan, inf or -inf.'), 400
    base = {"schema": "caee.runresult.v1", "runner": RUNNER, "moduleId": mid, "exploratory": True,
            "input": [show(v) for v in vals]}
    pol = policy_error(source)
    if pol:
        return jsonify({**base, "summary": "COMPILATION FAILED", "compilerOutput": pol, "programOutput": "", "rc": None, "outputs": None})
    res = run_units(source, [("single", 0, vals)])
    if not res["compiled"]:
        return jsonify({**base, "summary": "COMPILER SERVICE UNAVAILABLE" if res.get("internal") else "COMPILATION FAILED",
                        "compilerOutput": res["compilerOutput"], "programOutput": "", "rc": None, "outputs": None})
    rec = res["records"].get(0)
    status, why = unit_status(rec)
    step = rec["steps"].get(0) if rec else None
    if res["wallTimeout"] or status == "timeout":
        summary, rc, outs = "EXECUTION TIMED OUT", None, None
    elif status != "ok" or step is None:
        summary, rc, outs = "EXECUTION FAILED", None, None
        why = why or "lab() did not return"
    else:
        rc, v = step
        summary, outs = "EXECUTION COMPLETED", [show(x) for x in v]
        why = "lab() returned %d" % rc
    return jsonify({**base, "summary": summary, "message": why, "rc": rc, "outputs": outs,
                    "compilerOutput": res["compilerOutput"], "programOutput": res["programOutput"]})


@app.route('/api/labs/complete', methods=['POST', 'OPTIONS'])
def complete():
    if request.method == 'OPTIONS':
        return ('', 204)
    body = request.get_json(silent=True) or {}
    if body.get('schema') != 'caee.complete.v2':
        return jsonify(status='rejected', error='Unsupported schema.'), 400
    receipt_id = body.get('receiptId', '')
    module_id = body.get('moduleId')
    source_hash = body.get('sourceHash')
    claims = verify_receipt(receipt_id)
    if not claims:
        return jsonify(status='rejected', error='Invalid or forged receipt.'), 400
    if claims.get("moduleId") != module_id or claims.get("sourceHash") != source_hash:
        return jsonify(status='rejected', error='Receipt does not match this module/source.'), 400
    if time.time() - claims.get("iat", 0) > 86400:
        return jsonify(status='rejected', error='Receipt expired - please re-run the assessment.'), 400
    completion_id = sign_receipt({"moduleId": module_id, "sourceHash": source_hash, "kind": "completion", "iat": int(time.time())})
    return jsonify({"status": "completed", "moduleId": module_id, "completionId": completion_id})


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    app.run(host="0.0.0.0", port=port)
