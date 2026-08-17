import { describe, it, expect, beforeAll } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

interface Requirement {
  id: string;
  title: string;
  statement: string;
  category: string;
  level: string;
  source: {
    document: string;
    section?: string;
  };
  appliesTo: string[];
  status: string;
  implementation: string[];
  tests: string[];
  screens: string[];
  evidence?: {
    visual?: string;
    a11y?: string;
    security?: string;
    manual?: string;
  };
  coverage?: {
    structural: boolean;
    actions: boolean;
    states: boolean;
    dataShown: boolean;
  };
  notes?: string[];
}

interface RequirementsData {
  requirements: Requirement[];
}

describe('Product Contract Governance', () => {
  const reqPath = path.resolve(
    __dirname,
    '../../docs/product/requirements.json',
  );
  const screenMatrixPath = path.resolve(
    __dirname,
    '../../docs/product/SCREEN-MATRIX.md',
  );
  const docsDir = path.resolve(__dirname, '../../docs/myevents');

  let requirementsData: RequirementsData;
  let screenMatrixContent: string;
  const extractedScreens: Record<
    string,
    { w: string; h: string; file: string; title: string }
  > = {};

  beforeAll(() => {
    // Read actual s-*.js files to get ground truth
    const files = [
      's-public.js',
      's-app.js',
      's-studio.js',
      's-guests.js',
      's-memories.js',
      's-mobile.js',
      's-states.js',
    ];

    files.forEach((file) => {
      const content = fs.readFileSync(path.join(docsDir, file), 'utf8');
      const screenRegex =
        /n:\s*'([^']+)',\s*slug:\s*'([^']+)',\s*title:\s*'([^']+)',\s*w:\s*(\d+),\s*h:\s*(\d+)/g;
      let match;
      while ((match = screenRegex.exec(content)) !== null) {
        extractedScreens[match[1]] = {
          w: match[4],
          h: match[5],
          file: file,
          title: match[3],
        };
      }
    });

    requirementsData = JSON.parse(fs.readFileSync(reqPath, 'utf8'));
    screenMatrixContent = fs.readFileSync(screenMatrixPath, 'utf8');
  });

  it('must find exactly 47 canonical screens in source files', () => {
    expect(Object.keys(extractedScreens).length).toBe(47);
  });

  it('each screen from source must exist in SCREEN-MATRIX.md with correct IDs', () => {
    const regex =
      /^\|\s*([\w]+)\s*\|\s*[^|]+\s*\|\s*[^|]+\s*\|\s*([^|]+)\s*\|\s*(\d+)\s*\|\s*(\d+)\s*\|\s*([^|]+)\s*\|\s*[^|]+\s*\|\s*[^|]+\s*\|\s*[^|]+\s*\|\s*([^|]+)\s*\|/gm;
    let match;
    let parsedScreensCount = 0;
    while ((match = regex.exec(screenMatrixContent)) !== null) {
      if (match[1] === 'Screen') continue;
      const n = match[1];
      const file = match[2].trim();
      const w = match[3];
      const h = match[4];
      const route = match[5].trim();
      const reqIdsStr = match[6].trim();

      expect(extractedScreens).toHaveProperty(n);
      expect(extractedScreens[n].file).toBe(file);
      expect(extractedScreens[n].w).toBe(w);
      expect(extractedScreens[n].h).toBe(h);

      // Intended route check
      if (route !== 'TBD') {
        expect(route.startsWith('/')).toBe(true);
      }

      // Req IDs check
      const matrixIds = reqIdsStr
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s !== 'Aucune');
      const jsonIds = requirementsData.requirements
        .filter((r) => r.screens.includes(n))
        .map((r) => r.id);

      expect(matrixIds.sort()).toEqual(jsonIds.sort());

      parsedScreensCount++;
    }
    expect(parsedScreensCount).toBe(47);
  });

  it('all requirement IDs must be unique', () => {
    const ids = requirementsData.requirements.map((req) => req.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('each screen must have exhaustive requirements with full coverage declared', () => {
    const screensWithReqs = new Set<string>();
    requirementsData.requirements.forEach((req) => {
      req.screens.forEach((s) => screensWithReqs.add(s));

      // Verification of coverage
      expect(req.coverage).toBeDefined();
      expect(req.coverage?.structural).toBe(true);
      expect(req.coverage?.actions).toBe(true);
      expect(req.coverage?.states).toBe(true);
      expect(req.coverage?.dataShown).toBe(true);
    });

    Object.keys(extractedScreens).forEach((screenId) => {
      expect(screensWithReqs.has(screenId)).toBe(true);
    });
  });

  it('each requirement must have valid attributes, real paths, and correct prefix', () => {
    const validCategories = [
      'PROD',
      'UX',
      'UI',
      'A11Y',
      'ARCH',
      'SEC',
      'AUTH',
      'EVENT',
      'STUDIO',
      'GUEST',
      'HOUSEHOLD',
      'RSVP',
      'SEND',
      'BILLING',
      'QR',
      'MEDIA',
      'PUBLIC',
      'I18N',
      'DATA',
      'B2B',
      'LEGAL',
    ];
    const validLevels = ['MUST', 'SHOULD', 'MAY'];
    const validStatuses = [
      'verified',
      'implemented_unverified',
      'planned',
      'blocked',
      'deferred',
      'not_applicable',
    ];

    requirementsData.requirements.forEach((req) => {
      expect(req.id).toBeDefined();
      const prefix = req.id.split('-')[0];
      expect(validCategories).toContain(prefix);
      expect(req.category).toBe(prefix); // category must match prefix

      expect(req.title).toBeDefined();
      expect(req.statement).toBeDefined();
      expect(validLevels).toContain(req.level);
      expect(validStatuses).toContain(req.status);
      expect(req.source).toBeDefined();
      expect(req.source.document).toBeDefined();

      if (req.source.document.startsWith('docs/')) {
        const docPath = path.resolve(__dirname, '../../', req.source.document);
        expect(fs.existsSync(docPath)).toBe(true);
      }

      req.implementation.forEach((implPath) => {
        expect(
          implPath.includes('...'),
          `Impl path contains placeholder: ${implPath}`,
        ).toBe(false); // NO PLACEHOLDERS
        const fullPath = path.resolve(__dirname, '../../', implPath);
        expect(fs.existsSync(fullPath), `Impl file missing: ${implPath}`).toBe(
          true,
        );
      });

      req.tests.forEach((testPath) => {
        expect(
          testPath.includes('...'),
          `Test path contains placeholder: ${testPath}`,
        ).toBe(false); // NO PLACEHOLDERS
        const fullPath = path.resolve(__dirname, '../../', testPath);
        expect(fs.existsSync(fullPath), `Test file missing: ${testPath}`).toBe(
          true,
        );
      });

      if (req.status === 'verified') {
        expect(req.evidence).toBeDefined();
        if (
          req.category === 'UI' ||
          req.category === 'UX' ||
          req.category === 'AUTH'
        ) {
          expect(req.evidence?.visual).toBeDefined();
          expect(req.evidence?.visual?.length).toBeGreaterThan(0);
        }
      }

      if (req.status === 'planned') {
        expect(req.implementation.length).toBe(0);
      }
    });
  });
});
