import assert from 'node:assert/strict';
import { readFile, writeFile, open } from 'node:fs/promises';
import { join } from 'node:path';
import { browserSuites, verifyBrowserReports } from './browser-suites.mjs';

const folder = process.argv[2] || 'test-results';
const routes = JSON.parse(await readFile('tests/fixtures/routes.json', 'utf8'));
const reports = await Promise.all(Object.keys(browserSuites).map(async suite =>
  JSON.parse(await readFile(join(folder, `browser-report-${suite}.json`), 'utf8'))));
const report = verifyBrowserReports(reports, routes, process.env.GITHUB_SHA, `${process.env.GITHUB_RUN_ID}-${process.env.GITHUB_RUN_ATTEMPT}`);
for (const shot of report.screenshots) {
  const file = await open(join(folder, shot.file), 'r');
  try {
    const { buffer, bytesRead } = await file.read(Buffer.alloc(8), 0, 8, 0);
    assert.equal(bytesRead, 8, `Capture vide : ${shot.file}`);
    assert.equal(buffer.toString('hex'), '89504e470d0a1a0a', `Capture PNG : ${shot.file}`);
  } finally { await file.close(); }
}
await writeFile(join(folder, 'browser-report.json'), JSON.stringify(report, null, 2));
console.log(`OK : ${report.suites.length} lots, ${report.checks.length} familles de contrôles et ${report.screenshots.length} rendus, même révision et tentative`);
