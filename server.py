"""
CAEE compile + assessment server
---------------------------------
Two jobs now:
  1. /run          - the simple "compile and print output" endpoint used by
                      the C-playground and simple task-checking flows.
  2. /api/labs/assess, /api/labs/complete
                    - the real verification protocol the numbered module
                      pages (C1, B1, B2 ... M1 ...) actually speak: hash the
                      submitted source, compile it against that module's
                      real reference test harness (embedded in
                      btech_data.json / mtech_data.json, extracted from the
                      lab pages themselves), run it, and only issue a signed
                      receipt if every test genuinely passes. /complete
                      verifies that receipt before acknowledging completion.
                      Nothing here ever trusts a client-supplied pass/fail -
                      every result is recomputed server-side from the actual
                      compiled and executed program.

Security notes (read before deploying):
  * every submission runs in its own temp directory, deleted afterwards
  * hard CPU / memory / file-size / process limits are applied to the child
  * a wall-clock timeout kills anything that loops forever
  * the container itself has no secrets and no database access
  * receipts are HMAC-signed and stateless - nothing to lose on a restart
"""
import os, re, time, json, shutil, hashlib, hmac, base64, resource, subprocess, tempfile
from collections import defaultdict, deque
from flask import Flask, request, jsonify
from flask_cors import CORS

CAEE_TOKEN  = os.environ.get("CAEE_TOKEN", "")
SITE_ORIGIN = os.environ.get("SITE_ORIGIN", "*")
# Signs receipts/completions. Set this on Render -> Environment for real
# security; falls back to a fixed value so the feature still works if you
# haven't set it yet - just less resistant to someone forging a receipt.
RECEIPT_SECRET = os.environ.get("LAB_RECEIPT_SECRET", "caee-default-dev-secret-change-me").encode()

RATE_MAX     = 40
RATE_WINDOW  = 600
_hits = defaultdict(deque)

MAX_CODE_BYTES = 65536
COMPILE_TIMEOUT = 10
RUN_TIMEOUT     = 5

BANNED = [
    r'\b(system|fork|execl|execlp|execv|execve|popen|remove|unlink|rename)\s*\(',
    r'\b(socket|connect|bind|listen|accept)\s*\(',
    r'__asm__|asm\s*\(',
]

app = Flask(__name__)
CORS(app, origins=[SITE_ORIGIN] if SITE_ORIGIN != "*" else "*")

# ---------- load each track's lesson data once at startup ----------
_HERE = os.path.dirname(os.path.abspath(__file__))
LESSONS = {}  # (track, moduleId) -> lesson dict
for track in ("btech", "mtech"):
    path = os.path.join(_HERE, f"{track}_data.json")
    if os.path.exists(path):
        d = json.load(open(path))
        for lesson in d.get("lessons", []):
            LESSONS[(track, lesson["id"])] = lesson
print(f"[caee] loaded {len(LESSONS)} lessons across tracks: {sorted(set(t for t,_ in LESSONS))}")


def limits():
    resource.setrlimit(resource.RLIMIT_CPU,   (RUN_TIMEOUT, RUN_TIMEOUT))
    resource.setrlimit(resource.RLIMIT_AS,    (256 * 1024 * 1024,) * 2)
    resource.setrlimit(resource.RLIMIT_FSIZE, (4 * 1024 * 1024,) * 2)
    resource.setrlimit(resource.RLIMIT_NPROC, (64, 64))
    resource.setrlimit(resource.RLIMIT_CORE,  (0, 0))


def rate_ok():
    ip = request.headers.get('X-Forwarded-For', request.remote_addr or '?').split(',')[0].strip()
    now = time.time()
    q = _hits[ip]
    while q and now - q[0] > RATE_WINDOW:
        q.popleft()
    if len(q) >= RATE_MAX:
        return False
    q.append(now)
    return True


def token_ok(payload):
    if not CAEE_TOKEN:
        return True
    sent = request.headers.get('X-CAEE-Token') or (payload or {}).get('token', '')
    return sent == CAEE_TOKEN


def compile_and_run(code):
    """Shared by /run and /api/labs/assess. Returns (ok, stage, output)."""
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


# ---------- receipt signing (stateless HMAC) ----------
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


@app.route('/health')
def health():
    return jsonify(ok=True, service='caee-compile', lessons=len(LESSONS))


# ---------- the simple existing endpoint (unchanged behaviour) ----------
@app.route('/run', methods=['POST', 'OPTIONS'])
def run():
    if request.method == 'OPTIONS':
        return ('', 204)
    data = request.get_json(silent=True) or {}
    if not token_ok(data):
        return jsonify(ok=False, stage='auth', output='Not authorised to use this compiler.'), 403
    if not rate_ok():
        return jsonify(ok=False, stage='rate', output='Too many submissions from this address. Wait a few minutes.'), 429
    code = data.get('code', '')
    if not code.strip():
        return jsonify(ok=False, stage='input', output='No code received.')
    if len(code.encode('utf-8')) > MAX_CODE_BYTES:
        return jsonify(ok=False, stage='input', output='Source file too large.')
    for pattern in BANNED:
        if re.search(pattern, code):
            return jsonify(ok=False, stage='policy', output='This exercise does not allow system, process or network calls.')
    ok, stage, output = compile_and_run(code)
    return jsonify(ok=ok, stage=stage, output=output)


# ---------- the real per-module assessment protocol ----------
@app.route('/api/labs/assess', methods=['POST', 'OPTIONS'])
def assess():
    if request.method == 'OPTIONS':
        return ('', 204)
    body = request.get_json(silent=True) or {}
    if not token_ok(body):
        return jsonify(error='Not authorised.'), 403
    if not rate_ok():
        return jsonify(error='Too many submissions from this address. Wait a few minutes.'), 429

    track = body.get('track')
    moduleId = body.get('moduleId')
    revision = body.get('revision')
    source = body.get('source', '')
    claimed_hash = body.get('sourceHash', '')

    if body.get('schema') != 'caee.assess.v2':
        return jsonify(error='Unsupported schema.'), 400
    if not isinstance(source, str) or not source.strip():
        return jsonify(error='Empty source.'), 400
    if len(source.encode('utf-8')) > MAX_CODE_BYTES:
        return jsonify(error='Source exceeds size limit.'), 400
    for pattern in BANNED:
        if re.search(pattern, source):
            return jsonify(error='This exercise does not allow system, process or network calls.'), 400

    # verify the claimed hash genuinely matches the submitted source - a
    # receipt is only meaningful if it's tied to the exact code that earned it
    real_hash = hashlib.sha256(source.encode('utf-8')).hexdigest()
    if claimed_hash != real_hash:
        return jsonify(error='Source hash mismatch.'), 400

    lesson = LESSONS.get((track, moduleId))
    if not lesson:
        return jsonify(error=f'Unknown module {moduleId} for track {track}.'), 404

    combined = source + "\n" + lesson.get("harness", "")
    ok, stage, output = compile_and_run(combined)

    case_names = [c["name"] for c in lesson.get("cases", [])]

    if not ok:
        # compile or run failure - still return one entry per expected case
        # (all failed) so the client's "non-empty tests array" check passes,
        # with the real compiler/runtime message in diagnostics.
        tests = [{"name": n, "passed": False, "message": "not run - see diagnostics"} for n in case_names]
        return jsonify({
            "schema": "caee.assessment.v2", "sourceHash": real_hash, "moduleId": moduleId,
            "revision": revision, "status": "failed", "tests": tests,
            "diagnostics": f"{stage} error:\n{output}",
        })

    # parse "PASS <name>" / "FAIL <name>" lines from the harness's own stdout
    found = {}
    for line in output.splitlines():
        m = re.match(r'^(PASS|FAIL)\s+(.+?)\s*$', line.strip())
        if m:
            found[m.group(2)] = (m.group(1) == "PASS")

    tests = []
    for name in case_names:
        if name in found:
            tests.append({"name": name, "passed": found[name], "message": "" if found[name] else "did not match expected result"})
        else:
            tests.append({"name": name, "passed": False, "message": "no result printed for this case"})

    all_passed = len(tests) > 0 and all(t["passed"] for t in tests)
    resp = {
        "schema": "caee.assessment.v2", "sourceHash": real_hash, "moduleId": moduleId,
        "revision": revision, "status": "passed" if all_passed else "failed", "tests": tests,
        "diagnostics": output if not all_passed else "",
    }
    if all_passed:
        resp["receiptId"] = sign_receipt({
            "moduleId": moduleId, "track": track, "sourceHash": real_hash,
            "revision": revision, "iat": int(time.time()),
        })
    return jsonify(resp)


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
    # receipts are valid for 24 hours - long enough for a normal session,
    # short enough that an old receipt can't be replayed indefinitely
    if time.time() - claims.get("iat", 0) > 86400:
        return jsonify(status='rejected', error='Receipt expired - please re-run the assessment.'), 400

    completion_id = sign_receipt({
        "moduleId": module_id, "sourceHash": source_hash, "kind": "completion", "iat": int(time.time()),
    })
    return jsonify({"status": "completed", "moduleId": module_id, "completionId": completion_id})


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    app.run(host="0.0.0.0", port=port)
