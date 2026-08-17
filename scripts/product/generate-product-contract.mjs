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

const filesToProcess = [
  's-public.js',
  's-app.js',
  's-studio.js',
  's-guests.js',
  's-memories.js',
  's-mobile.js',
  's-states.js',
];

// Helper for strict category mapping as requested
function getCategory(n) {
  if (/^0[1-8]$/.test(n)) return 'PROD';
  if (/^09|10|11$/.test(n)) return 'AUTH';
  if (/^12[a-d]$/.test(n)) return 'PROD'; // ONBOARDING
  if (n === '13') return 'PROD';
  if (/^14|15|16|17$/.test(n)) return 'EVENT';
  if (/^18|19|20|21|22$/.test(n)) return 'STUDIO';
  if (/^23|24|25|26$/.test(n)) return 'GUEST';
  if (n === '27') return 'RSVP';
  if (n === '28') return 'SEND';
  if (n === '29') return 'PROD'; // ANALYTICS
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
  return 'UI'; // Fallback
}

// Routes deciding logic
function getIntendedRoute(n, slug) {
  const tbd = [
    '12a',
    '12b',
    '12c',
    '12d',
    '14',
    '15',
    '17',
    '18',
    '19',
    '20',
    '21',
    '22',
    '23',
    '24',
    '25',
    '26',
    '27',
    '28',
    '29',
    '30',
    '31',
    '32',
    '33',
    '34',
    '35',
    '36',
    '37',
    '38',
    '44',
  ];
  if (tbd.includes(n)) return 'TBD';
  if (n === '01') return '/';
  if (n === '09') return '/connexion';
  if (n === '10') return '/inscription';
  if (n === '11') return '/mot-de-passe-oublie';
  if (n === '13') return '/dashboard';
  if (n === '16') return '/dashboard';
  if (/^39|40|41|42|43$/.test(n)) return '/invite/[slug]';
  return `/${slug}`;
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

// Generate Requirements JSON
let newReqs = [];
for (const s of extractedScreens) {
  const cat = getCategory(s.n);
  const data = atomicData[s.n] || {
    requirements: [],
    coverage: {
      structural: false,
      actions: false,
      states: false,
      dataShown: false,
    },
  };

  data.requirements.forEach((req, idx) => {
    const num = (idx + 1).toString().padStart(3, '0');
    let status = 'planned';
    let impl = [];
    let tests = [];

    // Custom Status Logic
    if (s.n === '09' || s.n === '10' || s.n === '11') {
      if (req.text.includes('Google')) {
        status = 'planned';
      } else {
        status = 'implemented_unverified';
        if (s.n === '09') {
          impl = [
            'src/app/(auth)/connexion/page.tsx',
            'src/core/auth/usecases/loginUser.ts',
          ];
          tests = [
            'tests/e2e/auth.test.ts',
            'tests/unit/core/auth/usecases/LoginUserUseCase.test.ts',
          ];
        } else if (s.n === '10') {
          impl = [
            'src/app/(auth)/inscription/page.tsx',
            'src/core/auth/usecases/registerUser.ts',
          ];
          tests = [
            'tests/e2e/auth.test.ts',
            'tests/unit/core/auth/usecases/RegisterUserUseCase.test.ts',
          ];
        } else if (s.n === '11') {
          impl = [
            'src/app/(auth)/mot-de-passe-oublie/page.tsx',
            'src/core/auth/usecases/requestPasswordReset.ts',
          ];
          tests = [
            'tests/e2e/auth.test.ts',
            'tests/unit/core/auth/usecases/RequestPasswordResetUseCase.test.ts',
          ];
        }
      }
    } else if (s.n === '13') {
      if (
        req.text.includes('AppShell') ||
        req.text.includes('Sidebar') ||
        req.text.includes('Topbar')
      ) {
        status = 'implemented_unverified';
        impl = [
          'src/components/layout/AppShell.tsx',
          'src/components/layout/Sidebar.tsx',
          'src/components/layout/Topbar.tsx',
        ];
        tests = ['tests/e2e/appshell.test.ts'];
      }
    }

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
      status: status,
      implementation: impl,
      tests: tests,
      screens: [s.n],
      evidence: status === 'verified' ? { visual: 'Yes', manual: 'Yes' } : {},
      coverage: data.coverage,
      notes: [],
    });
  });
}

const finalJson = { requirements: newReqs };
fs.writeFileSync(reqPath, JSON.stringify(finalJson, null, 2));

// Generate SCREEN-MATRIX.md
let smMd = `# Screen Matrix

| Screen ID | Title | Group | Source File | Ref Width | Ref Height | Intended Route | Impl Status | Vis Baseline | Vis Compared | Req IDs | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
`;

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
fs.writeFileSync(screenMatrixPath, smMd);

// Generate TRACEABILITY-MATRIX.md
let tmMd = `# Traceability Matrix

| Requirement ID | Screen | Source | Status | Implementation | Unit Tests | Integration Tests | E2E Tests | Visual Evidence | A11y Evidence | Security | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
`;

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
fs.writeFileSync(traceMatrixPath, tmMd);

// Generate stats
const stats = {
  total: newReqs.length,
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
