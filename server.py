"""
CAEE compile server
-------------------
One job: accept C code, compile it, run it, return the output.
Used by btech_lab.html / mtech_lab.html when the student presses "Check".

Security notes (read before deploying):
  * every submission runs in its own temp directory, deleted afterwards
  * hard CPU / memory / file-size / process limits are applied to the child
  * a wall-clock timeout kills anything that loops forever
  * the container itself has no secrets and no database access
"""
import os, re, time, shutil, resource, subprocess, tempfile
from collections import defaultdict, deque
from flask import Flask, request, jsonify
from flask_cors import CORS

# Set these two on Render -> Environment (optional but recommended):
#   CAEE_TOKEN   a shared secret; the lab must send the same value
#   SITE_ORIGIN  https://yourdomain.in  (restricts who may call this)
CAEE_TOKEN  = os.environ.get("CAEE_TOKEN", "")
SITE_ORIGIN = os.environ.get("SITE_ORIGIN", "*")

RATE_MAX     = 40               # submissions per IP...
RATE_WINDOW  = 600              # ...per 10 minutes
_hits = defaultdict(deque)


app = Flask(__name__)
CORS(app, origins=[SITE_ORIGIN] if SITE_ORIGIN != "*" else "*")

MAX_CODE_BYTES = 64 * 1024      # 64 KB of source is plenty
COMPILE_TIMEOUT = 12            # seconds for gcc
RUN_TIMEOUT     = 5             # seconds for the student's program
MAX_OUTPUT      = 8 * 1024      # trim runaway printf loops

# crude but effective: block the few things a teaching exercise never needs
BANNED = [
    r'#\s*include\s*<\s*(unistd|sys/socket|netinet|arpa|dlfcn|sys/ptrace)\.h\s*>',
    r'\b(system|fork|execl|execlp|execv|execve|popen|remove|unlink|rename)\s*\(',
    r'\b(socket|connect|bind|listen|accept)\s*\(',
    r'__asm__|asm\s*\(',
]

def limits():
    """Applied inside the child process, before exec."""
    resource.setrlimit(resource.RLIMIT_CPU,   (RUN_TIMEOUT, RUN_TIMEOUT))
    resource.setrlimit(resource.RLIMIT_AS,    (256 * 1024 * 1024,) * 2)   # 256 MB
    resource.setrlimit(resource.RLIMIT_FSIZE, (4 * 1024 * 1024,) * 2)     # 4 MB files
    resource.setrlimit(resource.RLIMIT_NPROC, (64, 64))
    resource.setrlimit(resource.RLIMIT_CORE,  (0, 0))

@app.route('/health')
def health():
    return jsonify(ok=True, service='caee-compile')

@app.route('/run', methods=['POST', 'OPTIONS'])
def run():
    if request.method == 'OPTIONS':
        return ('', 204)

    # shared-secret check: stops strangers using your compiler as free compute
    if CAEE_TOKEN:
        sent = request.headers.get('X-CAEE-Token') or (request.get_json(silent=True) or {}).get('token', '')
        if sent != CAEE_TOKEN:
            return jsonify(ok=False, stage='auth', output='Not authorised to use this compiler.'), 403

    # per-IP rate limit
    ip = request.headers.get('X-Forwarded-For', request.remote_addr or '?').split(',')[0].strip()
    now = time.time()
    q = _hits[ip]
    while q and now - q[0] > RATE_WINDOW:
        q.popleft()
    if len(q) >= RATE_MAX:
        return jsonify(ok=False, stage='rate',
                       output='Too many submissions from this address. Wait a few minutes.'), 429
    q.append(now)

    data = request.get_json(silent=True) or {}
    code = data.get('code', '')

    if not code.strip():
        return jsonify(ok=False, stage='input', output='No code received.')
    if len(code.encode('utf-8')) > MAX_CODE_BYTES:
        return jsonify(ok=False, stage='input', output='Source file too large.')
    for pattern in BANNED:
        if re.search(pattern, code):
            return jsonify(ok=False, stage='policy',
                           output='This exercise does not allow system, process or network calls.')

    workdir = tempfile.mkdtemp(prefix='caee_')
    try:
        src = os.path.join(workdir, 'main.c')
        exe = os.path.join(workdir, 'a.out')
        with open(src, 'w') as f:
            f.write(code)

        gcc = subprocess.run(
            ['gcc', '-std=c11', '-O1', '-w', src, '-o', exe, '-lm'],
            capture_output=True, text=True, timeout=COMPILE_TIMEOUT, cwd=workdir)

        if gcc.returncode != 0:
            return jsonify(ok=False, stage='compile',
                           output=gcc.stderr[:MAX_OUTPUT] or 'compilation failed')

        try:
            proc = subprocess.run([exe], capture_output=True, text=True,
                                  timeout=RUN_TIMEOUT, cwd=workdir,
                                  preexec_fn=limits, stdin=subprocess.DEVNULL)
        except subprocess.TimeoutExpired:
            return jsonify(ok=False, stage='run',
                           output='Your program ran too long (possible infinite loop).')

        out = (proc.stdout + proc.stderr)[:MAX_OUTPUT]
        if proc.returncode != 0 and not out:
            out = 'Program exited with code %d (a crash — check array bounds and pointers).' % proc.returncode
        return jsonify(ok=True, stage='run', output=out, exit_code=proc.returncode)

    except subprocess.TimeoutExpired:
        return jsonify(ok=False, stage='compile', output='Compilation timed out.')
    except Exception as e:
        return jsonify(ok=False, stage='server', output='Server error: %s' % e)
    finally:
        shutil.rmtree(workdir, ignore_errors=True)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 8080)))
