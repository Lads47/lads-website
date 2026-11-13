#!/usr/bin/python3 -I
"""Root-owned release controller. Only lads-website paths and containers are used."""
import fcntl
import hashlib
import http.client
import json
import os
from pathlib import Path, PurePosixPath
import re
import shutil
import signal
import subprocess
import sys
import tarfile
import time

BASE = Path('/docker/lads-website')
SITE = BASE / 'site'
RELEASES = SITE / '.releases'
ASSETS = SITE / '.assets'
BACKUPS = BASE / 'backups-auto'
CURRENT = SITE / 'current'
STATE = BASE / 'automation-state.json'
CONFIG = BASE / 'nginx.conf'
DOMAIN = 'lesateliersdustream.fr'
CONTAINER = 'lads-website'
INSTALL = Path('/usr/local/libexec/lads')
RELEASE_ID = re.compile(r'(?:[0-9a-f]{40}-[0-9]{1,20}-[0-9]{1,4}|baseline-[0-9]{14})\Z')
LIMIT = 750 * 1024 * 1024


class Interrupted(BaseException):
    pass


def interrupted(signum, _frame):
    raise Interrupted(f'Signal {signum} : restauration de la version verifiee')


def protect_recovery():
    for signum in (signal.SIGHUP, signal.SIGTERM, signal.SIGINT):
        signal.signal(signum, signal.SIG_IGN)


def run(*args):
    return subprocess.check_output(args, text=True, stderr=subprocess.STDOUT, timeout=60).strip()


def digest(path):
    with path.open('rb') as source:
        return hashlib.file_digest(source, 'sha256').hexdigest()


def save_state(value):
    temporary = STATE.with_suffix('.new')
    with temporary.open('w') as output:
        json.dump(value, output)
        output.flush()
        os.fsync(output.fileno())
    os.replace(temporary, STATE)


def release_path(identifier):
    if not RELEASE_ID.fullmatch(identifier):
        raise ValueError('Identifiant de version invalide')
    path = RELEASES / identifier
    if path.is_symlink() or path.resolve().parent != RELEASES.resolve():
        raise ValueError('Version hors du dossier autorise')
    return path


def active_id():
    if not CURRENT.is_symlink():
        raise RuntimeError('Installation non initialisee')
    target = CURRENT.resolve(strict=True)
    if target.parent != RELEASES.resolve():
        raise RuntimeError('Lien current inattendu')
    release_path(target.name)
    return target.name


def switch(identifier):
    target = release_path(identifier)
    if not target.is_dir():
        raise RuntimeError('Version absente')
    temporary = SITE / '.current-next'
    temporary.unlink(missing_ok=True)
    temporary.symlink_to(Path('.releases') / identifier)
    os.replace(temporary, CURRENT)


def extract(source, destination, revision, run_id):
    """No archive path, link, device or oversized member can escape staging."""
    destination.mkdir(mode=0o755)
    size = 0
    files = set()
    with tarfile.open(fileobj=source, mode='r|gz') as archive:
        for number, member in enumerate(archive):
            name = member.name.removeprefix('./')
            if name in ('', '.') and member.isdir():
                continue
            parts = PurePosixPath(name).parts
            if (number > 10000 or len(name) > 512 or not parts or name.startswith('/')
                    or '\\' in name or any(ord(c) < 32 for c in name)
                    or any(p in ('.', '..') or p.startswith('.') for p in parts)
                    or parts[0] == 'current' or not (member.isfile() or member.isdir())):
                raise ValueError('Entree interdite dans l archive')
            target = destination.joinpath(*parts)
            if member.isdir():
                target.mkdir(parents=True, exist_ok=True, mode=0o755)
                continue
            size += member.size
            if size > LIMIT or name in files or (name == 'release.json' and member.size > 2 * 1024 * 1024):
                raise ValueError('Archive trop volumineuse ou fichier duplique')
            files.add(name)
            target.parent.mkdir(parents=True, exist_ok=True, mode=0o755)
            with archive.extractfile(member) as incoming, target.open('xb') as output:
                shutil.copyfileobj(incoming, output, 1024 * 1024)
            target.chmod(0o644)
    manifest = json.loads((destination / 'release.json').read_text())
    if manifest['revision'] != revision or manifest['run'] != run_id:
        raise ValueError('Le manifeste ne correspond pas au commit/execution')
    if set(manifest['files']) != files - {'release.json'}:
        raise ValueError('Inventaire incomplet')
    for name, expected in manifest['files'].items():
        if digest(destination / name) != expected:
            raise ValueError('Empreinte incorrecte : ' + name)
    for required in ('index.html', '404.html', 'solutions.html', 'formations/ia.html',
                     'formations/vmix.html', 'sitemap.xml', 'google4b1cbe2c20a1fb09.html'):
        if required not in files:
            raise ValueError('Fichier obligatoire absent : ' + required)


def request(host, port, path, tls=False, headers=None):
    connection = (http.client.HTTPSConnection if tls else http.client.HTTPConnection)(host, port, timeout=10)
    try:
        connection.request('GET', path, headers={'Host': DOMAIN, **(headers or {})})
        response = connection.getresponse()
        # A Range request verifies media without downloading a whole film.
        content = response.read(2 * 1024 * 1024)
        return response.status, dict((k.lower(), v) for k, v in response.getheaders()), content
    finally:
        connection.close()


def smoke(release, host, port, tls=False):
    paths = {'/': 200, '/solutions': 200, '/realisations': 200, '/histoire': 200,
             '/formations/ia': 200, '/formations/vmix': 200, '/sitemap.xml': 200,
             '/google4b1cbe2c20a1fb09.html': 200, '/solutions.html': 301,
             '/nos-solutions': 301, '/lads-check-404-absent': 404, '/.git/config': 404}
    for path, expected in paths.items():
        status, headers, _ = request(host, port, path, tls)
        if status != expected:
            raise RuntimeError(f'HTTP {status} au lieu de {expected} : {path}')
        if expected == 301 and headers.get('location') != f'https://{DOMAIN}/solutions':
            raise RuntimeError('Redirection incorrecte : ' + path)
    status, _, content = request(host, port, '/release.json', tls)
    expected_manifest = json.loads((release / 'release.json').read_text())
    if status != 200 or json.loads(content)['revision'] != expected_manifest['revision']:
        raise RuntimeError('Le domaine ne sert pas la version attendue')
    for pattern, mime in (('_astro/*.css', 'text/css'), ('videos/**/*.vtt', 'text/vtt')):
        media = next(release.glob(pattern), None)
        if media is None:
            raise RuntimeError('Ressource de controle absente : ' + pattern)
        status, headers, _ = request(host, port, '/' + media.relative_to(release).as_posix(), tls)
        if status != 200 or not headers.get('content-type', '').startswith(mime):
            raise RuntimeError('Type MIME incorrect : ' + str(media))
    video = next(release.glob('videos/**/*.mp4'))
    status, headers, content = request(host, port, '/' + video.relative_to(release).as_posix(), tls,
                                     {'Range': 'bytes=0-15'})
    if status != 206 or len(content) != 16 or not headers.get('content-type', '').startswith('video/mp4'):
        raise RuntimeError('Lecture partielle MP4 incorrecte')


def stage(release, config=None):
    config = config or CONFIG
    name = 'lads-check-' + str(os.getpid())
    image = run('docker', 'inspect', CONTAINER, '--format', '{{.Image}}')
    try:
        run('docker', 'run', '-d', '--pull=never', '--name', name,
            '--memory=64m', '--cpus=0.25', '--pids-limit=64', '--read-only',
            '--tmpfs', '/var/cache/nginx:rw,size=16m', '--tmpfs', '/var/run:rw,size=1m',
            '-p', '127.0.0.1::80', '-v', f'{release}:/usr/share/nginx/html/current:ro',
            '-v', f'{release / "_astro"}:/usr/share/nginx/html/.assets:ro',
            '-v', f'{config}:/etc/nginx/conf.d/default.conf:ro', image)
        run('docker', 'exec', name, 'nginx', '-t')
        port = int(run('docker', 'port', name, '80/tcp').rsplit(':', 1)[1])
        for attempt in range(10):
            try:
                smoke(release, '127.0.0.1', port)
                return
            except (OSError, RuntimeError):
                if attempt == 9:
                    raise
                time.sleep(1)
    finally:
        # Remove only this process's disposable container, never the live one.
        subprocess.run(['docker', 'rm', '-f', name], capture_output=True, timeout=30)


def publish_assets(release):
    ASSETS.mkdir(exist_ok=True, mode=0o755)
    for source in (release / '_astro').rglob('*'):
        if not source.is_file():
            continue
        target = ASSETS / source.relative_to(release / '_astro')
        target.parent.mkdir(parents=True, exist_ok=True, mode=0o755)
        if target.exists():
            if digest(target) != digest(source):
                raise RuntimeError('Collision de ressource immuable : ' + target.name)
        else:
            os.link(source, target)


def backup(release):
    identifier = time.strftime('%Y%m%d%H%M%S', time.gmtime()) + '-' + str(time.time_ns())
    folder = BACKUPS / identifier
    folder.mkdir(parents=True, mode=0o700)
    with tarfile.open(folder / 'site.tar', 'w') as archive:
        archive.add(release, arcname='site')
    for source in (CONFIG, BASE / 'docker-compose.yml'):
        shutil.copy2(source, folder / source.name)
    (folder / 'backup.json').write_text(json.dumps({'release': release.name, 'created': identifier}))
    print('Sauvegarde : ' + str(folder), flush=True)
    return identifier


def activate(identifier):
    previous = active_id()
    if previous == identifier:
        print('Version deja active', flush=True)
        return
    candidate = release_path(identifier)
    stage(candidate)
    publish_assets(candidate)
    snapshot = backup(release_path(previous))
    save_state({'pending': identifier, 'previous': previous, 'backup': snapshot})
    try:
        switch(identifier)
        for attempt in range(3):
            try:
                smoke(candidate, DOMAIN, 443, True)
                break
            except Exception:
                if attempt == 2:
                    raise
                time.sleep(2)
        save_state({'current': identifier, 'previous': previous, 'backup': snapshot})
        print('Publication verifiee : ' + identifier, flush=True)
    except BaseException:
        protect_recovery()
        switch(previous)
        save_state({'current': previous, 'failed': identifier, 'backup': snapshot})
        smoke(release_path(previous), DOMAIN, 443, True)
        print('RETOUR ARRIERE verifie : ' + previous, flush=True)
        raise


def initialize():
    """Admin-only migration: same site directory mount, one graceful nginx reload."""
    legacy = (INSTALL / 'nginx.legacy.conf').read_bytes()
    if CONFIG.read_bytes() != legacy:
        raise RuntimeError('Configuration nginx differente de la version examinee')
    state = json.loads(STATE.read_text()) if STATE.exists() else {}
    retry = state.get('initialization_failed')
    if retry:
        identifier, snapshot = retry, state['backup']
        baseline = release_path(identifier)
        if active_id() != identifier:
            raise RuntimeError('Etat de reprise incoherent')
    else:
        if CURRENT.is_symlink():
            raise RuntimeError('Deja initialise : aucune modification appliquee')
        entries = list(SITE.iterdir())
        if any(p.is_symlink() or p.name.startswith('.') or p.name == 'current' for p in entries):
            raise RuntimeError('Structure initiale inattendue')
        snapshot = backup(SITE)
        identifier = 'baseline-' + time.strftime('%Y%m%d%H%M%S', time.gmtime())
    changed = False
    try:
        if not retry:
            RELEASES.mkdir(mode=0o755)
            baseline = release_path(identifier)
            baseline.mkdir(mode=0o755)
            for entry in entries:
                if entry.is_dir():
                    shutil.copytree(entry, baseline / entry.name)
                else:
                    shutil.copy2(entry, baseline / entry.name)
            (baseline / 'release.json').write_text(json.dumps({'revision': identifier}))
        stage(baseline, INSTALL / 'nginx.conf')
        publish_assets(baseline)
        switch(identifier)
        # Write in place: Docker's existing file bind mount must retain its inode.
        changed = True
        CONFIG.write_bytes((INSTALL / 'nginx.conf').read_bytes())
        run('docker', 'exec', CONTAINER, 'nginx', '-t')
        run('docker', 'exec', CONTAINER, 'nginx', '-s', 'reload')
        for attempt in range(5):
            try:
                smoke(baseline, DOMAIN, 443, True)
                break
            except Exception:
                if attempt == 4:
                    raise
                time.sleep(1)
        save_state({'current': identifier, 'backup': snapshot})
    except BaseException:
        protect_recovery()
        if changed:
            CONFIG.write_bytes(legacy)
            run('docker', 'exec', CONTAINER, 'nginx', '-s', 'reload')
            # Reload is graceful/asynchronous: old workers may still use these files.
            save_state({'initialization_failed': identifier, 'backup': snapshot})
        elif not retry:
            # These paths were absent at entry; original pages and backup survive.
            CURRENT.unlink(missing_ok=True)
            (SITE / '.current-next').unlink(missing_ok=True)
            for created in (RELEASES, ASSETS):
                if created.is_dir() and not created.is_symlink() and created.parent == SITE:
                    shutil.rmtree(created)
        raise
    print('Initialisation verifiee, sans redemarrage : ' + identifier, flush=True)


def main(args):
    if os.geteuid() != 0:
        raise RuntimeError('Execution root requise via le point d entree limite')
    if args == ['status']:
        state = json.loads(STATE.read_text())
        print(json.dumps({'active': None if state.get('initialization_failed') else active_id(), 'state': state}))
        return
    if STATE.exists() and json.loads(STATE.read_text()).get('initialization_failed') and args != ['initialize']:
        raise RuntimeError('Initialisation incomplete : reprise administrative requise')
    with (BASE / 'automation.lock').open('a') as lock:
        fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        if shutil.disk_usage(BASE).free < 3 * 1024 ** 3:
            raise RuntimeError('Moins de 3 Gio libres : publication refusee')
        # Interrupted process: restore the last verified release before a new operation.
        if STATE.exists():
            state = json.loads(STATE.read_text())
            if state.get('pending'):
                switch(state['previous'])
                smoke(release_path(state['previous']), DOMAIN, 443, True)
                save_state({'current': state['previous'], 'recovered': state['pending']})
        if args == ['initialize']:
            initialize()
        elif len(args) == 2 and args[0] == 'rollback':
            activate(args[1])
        elif (len(args) == 3 and args[0] == 'deploy' and re.fullmatch('[0-9a-f]{40}', args[1])
              and re.fullmatch('[0-9]{1,20}-[0-9]{1,4}', args[2])):
            identifier = args[1] + '-' + args[2]
            destination = release_path(identifier)
            signal.alarm(300)
            extract(sys.stdin.buffer, destination, args[1], args[2])
            signal.alarm(0)
            activate(identifier)
        else:
            raise ValueError('Commande non autorisee')


if __name__ == '__main__':
    os.nice(10)
    for signum in (signal.SIGHUP, signal.SIGTERM, signal.SIGINT):
        signal.signal(signum, interrupted)
    try:
        main(sys.argv[1:])
    except (Exception, Interrupted) as error:
        print(type(error).__name__ + ': ' + str(error), file=sys.stderr, flush=True)
        sys.exit(1)
