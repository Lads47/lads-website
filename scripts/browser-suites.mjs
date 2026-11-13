import assert from 'node:assert/strict';

// Every existing browser check belongs to exactly one CI job.
export const browserSuites = {
  'visual-desktop': ['visual-desktop'],
  'visual-mobile': ['visual-mobile'],
  interactions: ['tablet', 'menu', 'lightboxes', 'privacy', 'background-video', 'reduced-motion', 'lumos', 'eva', 'hero', 'no-js', 'redirects'],
  content: ['history', 'refinements'],
  videos: ['local-videos'],
  navigation: ['navigation'],
};

export function selectBrowserSuite(env = process.env) {
  const suite = env.BROWSER_SUITE || 'all';
  assert.ok(suite === 'all' || Object.hasOwn(browserSuites, suite), `Lot navigateur inconnu : ${suite}`);
  if (env.BROWSER_SUITE || env.GITHUB_ACTIONS === 'true') {
    assert.ok(!env.ROUTE_FILTER && !env.INTERACTIONS_ONLY && !env.COMPARE_SOURCE_URL, 'Un lot CI ne peut pas filtrer ou remplacer les contrôles');
  }
  if (env.GITHUB_ACTIONS === 'true') assert.notEqual(suite, 'all', 'La CI doit sélectionner un lot explicite');
  return suite;
}

export function verifyBrowserReports(reports, routes, revision, run) {
  assert.match(revision || '', /^[0-9a-f]{40}$/, 'Révision attendue obligatoire');
  assert.match(run || '', /^\d{1,20}-\d{1,4}$/, 'Tentative attendue obligatoire');
  assert.deepEqual(reports.map(report => report.suite).sort(), Object.keys(browserSuites).sort(), 'Les six lots sont obligatoires, sans doublon');
  const expectedRoutes = routes.filter(route => route.kind !== 'redirect').map(route => route.route).sort();
  for (const report of reports) {
    assert.equal(report.revision, revision, `Révision du lot ${report.suite}`);
    assert.equal(report.run, run, `Tentative du lot ${report.suite}`);
    assert.deepEqual(report.errors, [], `Erreurs du lot ${report.suite}`);
    assert.deepEqual([...report.checks].sort(), [...browserSuites[report.suite]].sort(), `Contrôles complets du lot ${report.suite}`);
    assert.equal(report.results.length, report.checks.length, `Résultats du lot ${report.suite}`);
    const width = report.suite === 'visual-desktop' ? 1440 : report.suite === 'visual-mobile' ? 390 : null;
    assert.deepEqual(report.screenshots.map(shot => shot.route).sort(), width ? expectedRoutes : [], `Pages complètes du lot ${report.suite}`);
    assert.ok(report.screenshots.every(shot => shot.viewport === width), `Largeur du lot ${report.suite}`);
    for (const shot of report.screenshots) {
      const label = shot.route === '/' ? 'accueil' : shot.route.slice(1).replaceAll('/', '-');
      assert.equal(shot.file, `${label}-${width}.png`, `Capture du lot ${report.suite}`);
    }
  }
  return {
    revision, run,
    suites: reports.map(report => report.suite),
    checks: reports.flatMap(report => report.checks),
    results: reports.flatMap(report => report.results),
    errors: [],
    screenshots: reports.flatMap(report => report.screenshots),
  };
}
