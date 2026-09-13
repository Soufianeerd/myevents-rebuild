import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const docsDir = path.join(__dirname, '../../docs/myevents');
const productDir = path.join(__dirname, '../../docs/product');
const reqPath = path.join(productDir, 'requirements.json');
const atomicPath = path.join(productDir, 'source/atomic-requirements.json');
const screenMatrixPath = path.join(productDir, 'SCREEN-MATRIX.md');
const traceMatrixPath = path.join(productDir, 'TRACEABILITY-MATRIX.md');

const isCheckMode = process.argv.includes('--check');

const filesToProcess = [
  's-public.js',
  's-app.js',
  's-studio.js',
  's-guests.js',
  's-memories.js',
  's-mobile.js',
  's-states.js',
];

function getCategory(n) {
  if (/^0[1-8]$/.test(n)) return 'PROD';
  if (/^09|10|11$/.test(n)) return 'AUTH';
  if (/^12[a-d]$/.test(n)) return 'PROD';
  if (n === '13') return 'PROD';
  if (/^14|15|16|17$/.test(n)) return 'EVENT';
  if (/^18|19|20|21|22$/.test(n)) return 'STUDIO';
  if (/^23|24|25|26$/.test(n)) return 'GUEST';
  if (n === '27') return 'RSVP';
  if (n === '28') return 'SEND';
  if (n === '29') return 'PROD';
  if (n === '30') return 'QR';
  if (/^31|32$/.test(n)) return 'MEDIA';
  if (n === '33') return 'SEND';
  if (n === '34') return 'BILLING';
  if (n === '35') return 'PROD';
  if (n === '36') return 'B2B';
  if (n === '37') return 'BILLING';
  if (n === '38') return 'LEGAL';
  if (n === '39') return 'PUBLIC';
  if (n === '40') return 'RSVP';
  if (/^41|42|43$/.test(n)) return 'MEDIA';
  if (n === '44') return 'UX';
  return 'UI';
}

function getIntendedRoute(n) {
  const realRoutes = {
    '01': '/',
    '09': '/connexion',
    10: '/inscription',
    11: '/mot-de-passe-oublie',
    13: '/dashboard',
    14: '/dashboard',
    15: '/events/new',
    16: '/events/[id]',
  };
  return realRoutes[n] || 'TBD';
}

const atomicData = JSON.parse(fs.readFileSync(atomicPath, 'utf8'));

let extractedScreens = [];

for (const file of filesToProcess) {
  const content = fs.readFileSync(path.join(docsDir, file), 'utf8');
  const screenRegex =
    /n:\s*'([^']+)',\s*slug:\s*'([^']+)',\s*title:\s*'([^']+)',\s*w:\s*(\d+),\s*h:\s*(\d+)/g;

  let match;
  while ((match = screenRegex.exec(content)) !== null) {
    const n = match[1];
    extractedScreens.push({
      n,
      slug: match[2],
      title: match[3],
      w: match[4],
      h: match[5],
      file,
    });
  }
}

let newReqs = [];
let sourceNeedlesCount = 0;

for (const s of extractedScreens) {
  const cat = getCategory(s.n);
  const data = atomicData[s.n] || { requirements: [], coverageNA: {} };

  const hasStructural =
    data.requirements.some((r) => r.kind === 'structure') ||
    (data.coverageNA && data.coverageNA.structural);
  const hasActions =
    data.requirements.some((r) => r.kind === 'action') ||
    (data.coverageNA && data.coverageNA.actions);
  const hasStates =
    data.requirements.some((r) => r.kind === 'state') ||
    (data.coverageNA && data.coverageNA.states);
  const hasData =
    data.requirements.some((r) => r.kind === 'data') ||
    (data.coverageNA && data.coverageNA.dataShown);

  const coverage = {
    structural: hasStructural ? true : false,
    actions: hasActions ? true : false,
    states: hasStates ? true : false,
    dataShown: hasData ? true : false,
  };

  data.requirements.forEach((req, idx) => {
    const num = (idx + 1).toString().padStart(3, '0');
    sourceNeedlesCount += (req.sourceNeedles || []).length;

    newReqs.push({
      id: `${cat}-${s.n}-${num}`,
      title: `${s.title} - ${req.text.substring(0, 30)}...`,
      statement: req.text,
      category: cat,
      level: 'MUST',
      source: {
        document: `docs/myevents/${s.file}`,
        section: `Screen ${s.n}`,
      },
      appliesTo: ['local', 'connected'],
      status: req.status || 'planned',
      implementation: req.implementation || [],
      tests: req.tests || [],
      screens: [s.n],
      evidence: req.evidence || {},
      coverage: coverage,
      kind: req.kind || 'structure',
      sourceNeedles: req.sourceNeedles || [],
      notes: req.notes || [],
    });
  });
}

const generatedJson = JSON.stringify({ requirements: newReqs }, null, 2);

let smMd = `# Screen Matrix\n\n| Screen ID | Title | Group | Source File | Ref Width | Ref Height | Intended Route | Impl Status | Vis Baseline | Vis Compared | Req IDs | Notes |\n|---|---|---|---|---|---|---|---|---|---|---|---|\n`;

for (const s of extractedScreens) {
  const sReqs = newReqs.filter((r) => r.screens.includes(s.n));
  const reqIds = sReqs.map((r) => r.id).join(', ');
  const cat = getCategory(s.n);
  const route = getIntendedRoute(s.n, s.slug);

  let status = 'planned';
  let visBaseline = 'No';
  let visCompared = 'No';

  if (sReqs.some((r) => r.status === 'implemented_unverified')) {
    status = 'implemented_unverified';
  }
  if (['09', '10', '11'].includes(s.n)) {
    visBaseline = 'Yes';
  }

  smMd += `| ${s.n} | ${s.title} | ${cat} | ${s.file} | ${s.w} | ${s.h} | ${route} | ${status} | ${visBaseline} | ${visCompared} | ${reqIds || 'Aucune'} | - |\n`;
}

let tmMd = `# Traceability Matrix\n\n| Requirement ID | Screen | Source | Status | Implementation | Unit Tests | Integration Tests | E2E Tests | Visual Evidence | A11y Evidence | Security | Notes |\n|---|---|---|---|---|---|---|---|---|---|---|---|\n`;

for (const r of newReqs) {
  const screens = (r.screens || []).join(', ');
  const impl = r.implementation.length ? r.implementation.join(', ') : '-';
  const units = r.tests.filter((t) => t.includes('unit')).length
    ? r.tests.filter((t) => t.includes('unit')).join(', ')
    : '-';
  const ints = r.tests.filter((t) => t.includes('integration')).length
    ? r.tests.filter((t) => t.includes('integration')).join(', ')
    : '-';
  const e2e = r.tests.filter((t) => t.includes('e2e')).length
    ? r.tests.filter((t) => t.includes('e2e')).join(', ')
    : '-';
  const vis = r.evidence?.visual || '-';
  const a11y = r.evidence?.a11y || '-';
  const sec = r.evidence?.security || '-';
  const notes = (r.notes || []).join('; ') || '-';

  tmMd += `| ${r.id} | ${screens} | ${r.source.document} | ${r.status} | ${impl} | ${units} | ${ints} | ${e2e} | ${vis} | ${a11y} | ${sec} | ${notes} |\n`;
}

if (isCheckMode) {
  const currentJson = fs.existsSync(reqPath)
    ? fs.readFileSync(reqPath, 'utf8')
    : '';
  const currentSm = fs.existsSync(screenMatrixPath)
    ? fs.readFileSync(screenMatrixPath, 'utf8')
    : '';
  const currentTm = fs.existsSync(traceMatrixPath)
    ? fs.readFileSync(traceMatrixPath, 'utf8')
    : '';

  let drift = false;
  if (currentJson !== generatedJson) {
    console.error('Drift detected in requirements.json');
    drift = true;
  }
  if (currentSm !== smMd) {
    console.error('Drift detected in SCREEN-MATRIX.md');
    drift = true;
  }
  if (currentTm !== tmMd) {
    console.error('Drift detected in TRACEABILITY-MATRIX.md');
    drift = true;
  }

  if (drift) {
    process.exit(1);
  } else {
    console.log('No drift detected. Generated files match sources.');
    process.exit(0);
  }
} else {
  fs.writeFileSync(reqPath, generatedJson);
  fs.writeFileSync(screenMatrixPath, smMd);
  fs.writeFileSync(traceMatrixPath, tmMd);

  const stats = {
    total: newReqs.length,
    sourceNeedles: sourceNeedlesCount,
    verified: newReqs.filter((r) => r.status === 'verified').length,
    implemented_unverified: newReqs.filter(
      (r) => r.status === 'implemented_unverified',
    ).length,
    planned: newReqs.filter((r) => r.status === 'planned').length,
    blocked: newReqs.filter((r) => r.status === 'blocked').length,
    deferred: newReqs.filter((r) => r.status === 'deferred').length,
  };

  console.log('Contract Generated Successfully!');
  console.log(JSON.stringify(stats, null, 2));
}
