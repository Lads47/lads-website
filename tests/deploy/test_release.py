"""Fault and archive-boundary tests; no Docker daemon or production access needed."""
import hashlib
import importlib.util
import io
import json
from pathlib import Path
import sys
import tarfile
import tempfile
import types
import unittest
from unittest.mock import patch

if sys.platform == 'win32':
    # Only the Linux entry-point lock uses fcntl; core behavior is portable.
    sys.modules.setdefault('fcntl', types.SimpleNamespace(LOCK_EX=2, LOCK_NB=4))
spec = importlib.util.spec_from_file_location('release', Path(__file__).parents[2] / 'deploy/server/release.py')
release = importlib.util.module_from_spec(spec)
spec.loader.exec_module(release)
SHA = 'a' * 40
PREVIOUS = 'baseline-20261113000000'
NEXT = SHA + '-123-1'


def payload(files=None, extra=None, corrupt=False):
    files = files or {name: b'content' for name in (
        'index.html', '404.html', 'solutions.html', 'formations/ia.html',
        'formations/vmix.html', 'sitemap.xml', 'google4b1cbe2c20a1fb09.html')}
    manifest = {'revision': SHA, 'run': '123-1',
                'files': {name: hashlib.sha256(content).hexdigest() for name, content in files.items()}}
    if corrupt:
        manifest['files']['index.html'] = '0' * 64
    stream = io.BytesIO()
    with tarfile.open(fileobj=stream, mode='w:gz') as archive:
        for name, content in {**files, 'release.json': json.dumps(manifest).encode()}.items():
            member = tarfile.TarInfo('./' + name)
            member.size = len(content)
            archive.addfile(member, io.BytesIO(content))
        if extra:
            member = tarfile.TarInfo(extra[0])
            if extra[1] == 'link':
                member.type = tarfile.SYMTYPE
                member.linkname = '/etc/passwd'
            elif extra[1] == 'hardlink':
                member.type = tarfile.LNKTYPE
                member.linkname = '/etc/passwd'
            archive.addfile(member)
    stream.seek(0)
    return stream


class ArchiveTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory()
        self.destination = Path(self.temporary.name) / 'release'

    def tearDown(self):
        self.temporary.cleanup()

    def test_complete_archive_is_verified(self):
        release.extract(payload(), self.destination, SHA, '123-1')
        self.assertTrue((self.destination / 'formations/ia.html').is_file())

    def test_traversal_hidden_files_and_links_are_rejected(self):
        for index, entry in enumerate((('../escape', 'file'), ('/escape', 'file'),
                ('nested/../../escape', 'file'), ('.git/config', 'file'),
                ('current/file', 'file'), ('safe', 'link'), ('safe', 'hardlink'))):
            with self.subTest(entry=entry), self.assertRaises(ValueError):
                release.extract(payload(extra=entry), self.destination.with_name(str(index)), SHA, '123-1')
        self.assertFalse((self.destination.parent / 'escape').exists())

    def test_transfer_corruption_is_rejected(self):
        with self.assertRaisesRegex(ValueError, 'Empreinte'):
            release.extract(payload(corrupt=True), self.destination, SHA, '123-1')

    def test_other_commit_is_rejected(self):
        with self.assertRaisesRegex(ValueError, 'commit'):
            release.extract(payload(), self.destination, 'b' * 40, '123-1')

    def test_incomplete_site_is_rejected(self):
        with self.assertRaisesRegex(ValueError, 'obligatoire'):
            release.extract(payload({'index.html': b'page'}), self.destination, SHA, '123-1')

    def test_archive_size_limit_is_enforced_before_writing(self):
        with patch.object(release, 'LIMIT', 1), self.assertRaisesRegex(ValueError, 'volumineuse'):
            release.extract(payload(), self.destination, SHA, '123-1')


class TransactionTests(unittest.TestCase):
    def setUp(self):
        self.active = PREVIOUS
        self.events = []
        self.temporary = tempfile.TemporaryDirectory()
        self.root = Path(self.temporary.name)
        for identifier in (PREVIOUS, NEXT):
            (self.root / identifier).mkdir()
        self.patches = [
            patch.object(release, 'release_path', side_effect=lambda name: self.root / name),
            patch.object(release, 'active_id', side_effect=lambda: self.active),
            patch.object(release, 'switch', side_effect=self.change),
            patch.object(release, 'stage', side_effect=lambda _: self.events.append('stage')),
            patch.object(release, 'publish_assets'),
            patch.object(release, 'backup', side_effect=lambda _: self.events.append('backup') or 'snapshot'),
            patch.object(release, 'save_state', side_effect=lambda value: self.events.append(value)),
            patch.object(release, 'smoke'), patch.object(release.time, 'sleep'),
            patch.object(release, 'protect_recovery'),
        ]
        for item in self.patches:
            item.start()

    def change(self, identifier):
        self.active = identifier
        self.events.append('switch:' + identifier)

    def tearDown(self):
        for item in reversed(self.patches):
            item.stop()
        self.temporary.cleanup()

    def test_backup_and_pending_journal_precede_switch(self):
        release.activate(NEXT)
        self.assertEqual(self.active, NEXT)
        self.assertEqual(self.events[:3], ['stage', 'backup',
            {'pending': NEXT, 'previous': PREVIOUS, 'backup': 'snapshot'}])
        self.assertEqual(self.events[3], 'switch:' + NEXT)
        self.assertEqual(self.events[-1]['current'], NEXT)

    def test_failed_staging_leaves_live_site_and_backup_untouched(self):
        release.stage.side_effect = RuntimeError('staging failure')
        with self.assertRaises(RuntimeError):
            release.activate(NEXT)
        self.assertEqual(self.active, PREVIOUS)
        release.backup.assert_not_called()
        release.switch.assert_not_called()

    def test_failed_backup_prevents_switch(self):
        release.backup.side_effect = OSError('disk full')
        with self.assertRaises(OSError):
            release.activate(NEXT)
        release.switch.assert_not_called()

    def test_failed_https_restores_and_checks_previous_version(self):
        def smoke(path, *_):
            if path.name == NEXT:
                raise RuntimeError('bad response')
            self.assertEqual(self.active, PREVIOUS)
        release.smoke.side_effect = smoke
        with self.assertRaisesRegex(RuntimeError, 'bad response'):
            release.activate(NEXT)
        self.assertEqual(self.active, PREVIOUS)
        self.assertEqual(release.switch.call_args_list[-1].args, (PREVIOUS,))
        self.assertEqual(release.smoke.call_args_list[-1].args[0].name, PREVIOUS)

    def test_manual_rollback_uses_same_backup_and_checks(self):
        self.active = NEXT
        release.activate(PREVIOUS)
        self.assertEqual(self.active, PREVIOUS)
        release.backup.assert_called_once()
        release.smoke.assert_called_once()

    def test_interruption_after_switch_rolls_back_without_retry(self):
        release.smoke.side_effect = [release.Interrupted('TERM'), None]
        with self.assertRaises(release.Interrupted):
            release.activate(NEXT)
        self.assertEqual(self.active, PREVIOUS)
        self.assertEqual(release.smoke.call_count, 2)
        release.protect_recovery.assert_called_once()

    def test_already_active_release_never_switches(self):
        release.activate(PREVIOUS)
        release.stage.assert_not_called()
        release.switch.assert_not_called()


class BoundaryTests(unittest.TestCase):
    def test_release_identifier_cannot_select_an_arbitrary_directory(self):
        for value in ('../../etc', 'a' * 40, NEXT + '/../../etc', NEXT + ';id'):
            with self.subTest(value=value), self.assertRaises(ValueError):
                release.release_path(value)

    def test_immutable_asset_collision_is_rejected(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            source = root / 'candidate/_astro'
            source.mkdir(parents=True)
            assets = root / 'assets'
            assets.mkdir()
            (source / 'hashed.css').write_text('new')
            (assets / 'hashed.css').write_text('old')
            with patch.object(release, 'ASSETS', assets), self.assertRaisesRegex(RuntimeError, 'Collision'):
                release.publish_assets(root / 'candidate')
            self.assertEqual((assets / 'hashed.css').read_text(), 'old')

    def test_staging_failure_only_removes_its_temporary_container(self):
        def command(*args):
            if args[1] == 'inspect':
                return 'sha256:local-image'
            raise RuntimeError('nginx staging failure')
        with patch.object(release, 'run', side_effect=command), patch.object(release.subprocess, 'run') as cleanup:
            with self.assertRaises(RuntimeError):
                release.stage(Path('/candidate'))
            removed = cleanup.call_args.args[0]
            self.assertEqual(removed[:3], ['docker', 'rm', '-f'])
            self.assertTrue(removed[3].startswith('lads-check-'))
            self.assertNotIn('lads-website', removed)


class InitializationTests(unittest.TestCase):
    def test_staging_failure_changes_no_live_config_and_can_be_retried(self):
        with tempfile.TemporaryDirectory() as temporary:
            base = Path(temporary)
            site = base / 'site'
            site.mkdir()
            (site / 'index.html').write_text('original page')
            (site / '_astro').mkdir()
            (site / '_astro/test.css').write_text('css')
            install = base / 'install'
            install.mkdir()
            config = base / 'nginx.conf'
            config.write_text('legacy configuration')
            (install / 'nginx.legacy.conf').write_bytes(config.read_bytes())
            (install / 'nginx.conf').write_text('new configuration')
            with patch.multiple(release, BASE=base, SITE=site, RELEASES=site / '.releases',
                    ASSETS=site / '.assets', CURRENT=site / 'current', CONFIG=config,
                    STATE=base / 'state.json', INSTALL=install), \
                    patch.object(release, 'backup', return_value='snapshot'), \
                    patch.object(release, 'run') as command, \
                    patch.object(release, 'switch'), patch.object(release, 'smoke'), \
                    patch.object(release, 'protect_recovery'), \
                    patch.object(release, 'stage') as stage:
                def preflight(*args):
                    self.assertEqual(config.read_text(), 'legacy configuration')
                    raise RuntimeError('preflight failure')
                stage.side_effect = preflight
                with self.assertRaisesRegex(RuntimeError, 'preflight'):
                    release.initialize()
                command.assert_not_called()
                self.assertFalse((site / '.releases').exists())
                self.assertEqual((site / 'index.html').read_text(), 'original page')
                stage.side_effect = None
                # A late failure restores legacy config but keeps files for old workers.
                release.smoke.side_effect = RuntimeError('HTTPS failure')
                with patch.object(release.time, 'sleep'), self.assertRaisesRegex(RuntimeError, 'HTTPS'):
                    release.initialize()
                self.assertEqual(config.read_text(), 'legacy configuration')
                state = json.loads(release.STATE.read_text())
                self.assertTrue((site / '.releases' / state['initialization_failed']).exists())
                release.smoke.side_effect = None
                with patch.object(release, 'active_id', return_value=state['initialization_failed']):
                    release.initialize()
                self.assertEqual(config.read_text(), 'new configuration')
                self.assertNotIn('initialization_failed', json.loads(release.STATE.read_text()))
                command.assert_any_call('docker', 'exec', 'lads-website', 'nginx', '-s', 'reload')


if __name__ == '__main__':
    unittest.main()
