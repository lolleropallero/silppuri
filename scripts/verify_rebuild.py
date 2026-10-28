"""Regenerate in an isolated copy; fail if repository source/data are stale."""
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile

ROOT = Path(__file__).resolve().parents[1]
tracked = subprocess.check_output(
    ['git', 'ls-files', '--cached', '--others', '--exclude-standard', '-z', 'data', 'src', 'scripts'], cwd=ROOT
).decode('utf8').split('\0')
paths = [p for p in tracked if p and (ROOT/p).is_file()]

scratch = (ROOT/'tmp').resolve()
scratch.mkdir(exist_ok=True)
with tempfile.TemporaryDirectory(prefix='rebuild-', dir=scratch) as temporary:
    copy = Path(temporary).resolve()
    assert copy.is_relative_to(scratch), 'Temporary copy must stay inside workspace'
    for relative in paths:
        destination = copy/relative
        destination.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(ROOT/relative, destination)
    for script in ['curate_additional_taxes.py', 'curate_research.py', 'build.py']:
        command = [sys.executable, '-X', 'utf8', str(copy/'scripts'/script)]
        if script == 'build.py':
            command += ['--out', str(copy/'tmp/fragment.html'), '--production']
        result = subprocess.run(command, cwd=copy, capture_output=True, text=True,
                                encoding='utf8', env={**os.environ, 'PYTHONUTF8': '1'})
        if result.returncode:
            raise RuntimeError(result.stdout + result.stderr)
    changed = [p for p in paths if (ROOT/p).read_bytes().replace(b'\r\n', b'\n')
               != (copy/p).read_bytes().replace(b'\r\n', b'\n')]
    if changed:
        raise SystemExit('Stale generated files:\n' + '\n'.join(changed))
    published = sorted(p.relative_to(copy/'dist').as_posix() for p in (copy/'dist').rglob('*') if p.is_file())
    assert published == ['index.html'], f'Unexpected deployment files: {published}'
    html = (copy/'dist/index.html').read_text(encoding='utf8')
    assert html.startswith('<!doctype html>'), 'Deploy a complete document, not the embedded fragment'
    assert 'silppuri:state:v1:' in html, 'Standalone storage host missing'
    assert 'function createShareImage(' in html and 'function decodeShare(' in html, 'Sharing runtime missing'
    assert html == (copy/'tmp/local-site/index.html').read_text(encoding='utf8'), 'Production differs from the local website'
print('PASS: clean rebuild reproduces all repository data, sources and scripts.')
print('PASS: production exports only the self-contained website with package sharing and local storage.')
