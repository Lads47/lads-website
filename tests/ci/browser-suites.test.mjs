import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile, writeFile, mkdtemp, rm, unlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { browserSuites, selectBrowserSuite, verifyBrowserReports } from '../../scripts/browser-suites.mjs';

const revision = 'a'.repeat(40), run = '1234-1';
const routes = JSON.parse(await readFile('tests/fixtures/routes.json', 'utf8'));
function completeReports() {
  return Object.entries(browserSuites).map(([suite, checks]) => ({
    suite, revision, run, checks: [...checks], results: checks.map(check => `${check} OK`), errors: [],
    screenshots: suite.startsWith('visual-') ? routes.filter(route => route.kind !== 'redirect').map(route => {
      const viewport = suite === 'visual-desktop' ? 1440 : 390;
      const label = route.route === '/' ? 'accueil' : route.route.slice(1).replaceAll('/', '-');
      return { route: route.route, viewport, file: `${label}-${viewport}.png` };
    }) : [],
  }));
}

test('les 17 familles existantes sont réparties une seule fois et couvrent les 70 rendus', () => {
  assert.deepEqual(Object.values(browserSuites).flat().sort(), [
    'visual-desktop', 'visual-mobile', 'tablet', 'menu', 'lightboxes', 'privacy',
    'background-video', 'reduced-motion', 'lumos', 'eva', 'hero', 'history',
    'local-videos', 'navigation', 'refinements', 'no-js', 'redirects',
  ].sort());
  const report = verifyBrowserReports(completeReports(), routes, revision, run);
  assert.equal(report.suites.length, 6);
  assert.equal(report.screenshots.length, 70);
});

test('une faute de lot ou un filtre CI échoue au lieu de produire un faux succès', () => {
  assert.equal(selectBrowserSuite({}), 'all');
  assert.equal(selectBrowserSuite({ BROWSER_SUITE: 'videos', GITHUB_ACTIONS: 'true' }), 'videos');
  for (const env of [
    { BROWSER_SUITE: 'video' }, { GITHUB_ACTIONS: 'true' },
    ...['ROUTE_FILTER', 'INTERACTIONS_ONLY', 'COMPARE_SOURCE_URL'].map(key => ({ BROWSER_SUITE: 'visual-mobile', [key]: '1' })),
  ]) assert.throws(() => selectBrowserSuite(env));
});

for (const [name, mutate] of [
  ['lot absent', reports => reports.pop()],
  ['lot dupliqué', reports => { reports[5] = reports[0]; }],
  ['contrôle absent', reports => reports[2].checks.pop()],
  ['contrôle dupliqué', reports => reports[2].checks.push('hero')],
  ['résultat absent', reports => reports[2].results.pop()],
  ['page absente', reports => reports[0].screenshots.pop()],
  ['page dupliquée', reports => { reports[0].screenshots[1] = reports[0].screenshots[0]; }],
  ['mauvaise largeur', reports => { reports[0].screenshots[0].viewport = 390; }],
  ['révision différente', reports => { reports[0].revision = 'b'.repeat(40); }],
  ['ancienne tentative', reports => { reports[0].run = '1234-0'; }],
  ['erreur navigateur', reports => reports[2].errors.push('échec')],
  ['chemin de capture invalide', reports => { reports[0].screenshots[0].file = '../autre.png'; }],
]) test(`barrière fermée : ${name}`, () => {
  const reports = completeReports();
  mutate(reports);
  assert.throws(() => verifyBrowserReports(reports, routes, revision, run));
});

test('le contrôle final exige les fichiers PNG réels et refuse une capture absente', async () => {
  const folder = await mkdtemp(join(tmpdir(), 'lads-ci-'));
  const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aRZkAAAAASUVORK5CYII=', 'base64');
  try {
    const reports = completeReports();
    for (const report of reports) {
      await writeFile(join(folder, `browser-report-${report.suite}.json`), JSON.stringify(report));
      for (const shot of report.screenshots) await writeFile(join(folder, shot.file), png);
    }
    const verify = () => spawnSync(process.execPath, ['scripts/verify-browser-reports.mjs', folder], {
      env: { ...process.env, GITHUB_SHA: revision, GITHUB_RUN_ID: '1234', GITHUB_RUN_ATTEMPT: '1' }, encoding: 'utf8',
    });
    assert.equal(verify().status, 0);
    await unlink(join(folder, reports[0].screenshots[0].file));
    assert.notEqual(verify().status, 0);
  } finally { await rm(folder, { recursive: true, force: true }); }
});

test('la barrière du workflow refuse échec, annulation, omission et relance partielle', async () => {
  const workflow = await readFile('.github/workflows/quality.yml', 'utf8');
  const block = workflow.split('      - name: Exiger tous les contrôles de cette tentative')[1].split('      - uses:')[0];
  const script = block.split('        run: |')[1].split('\n').map(line => line.replace(/^          /, '')).join('\n');
  const bash = process.platform === 'win32' ? 'C:/Program Files/Git/bin/bash.exe' : 'bash';
  const verify = overrides => spawnSync(bash, ['-e', '-o', 'pipefail', '-c', script], {
    env: { ...process.env, BUILD_RESULT: 'success', BROWSER_RESULT: 'success', BUILD_ATTEMPT: '1', GITHUB_RUN_ATTEMPT: '1', ...overrides }, encoding: 'utf8',
  });
  assert.equal(verify({}).status, 0);
  for (const state of ['failure', 'cancelled', 'skipped']) {
    assert.notEqual(verify({ BUILD_RESULT: state }).status, 0, `build ${state}`);
    assert.notEqual(verify({ BROWSER_RESULT: state }).status, 0, `browser ${state}`);
  }
  assert.notEqual(verify({ BUILD_ATTEMPT: '1', GITHUB_RUN_ATTEMPT: '2' }).status, 0);
  assert.equal(verify({ BUILD_ATTEMPT: '2', GITHUB_RUN_ATTEMPT: '2' }).status, 0);
});
