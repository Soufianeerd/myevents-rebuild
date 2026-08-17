import { describe, it, expect } from 'vitest';
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

  let requirementsData: RequirementsData;
  let screenMatrixContent: string;

  it('requirements.json must exist and parse correctly', () => {
    expect(fs.existsSync(reqPath)).toBe(true);
    const content = fs.readFileSync(reqPath, 'utf8');
    expect(() => {
      requirementsData = JSON.parse(content);
    }).not.toThrow();
    expect(requirementsData).toHaveProperty('requirements');
    expect(Array.isArray(requirementsData.requirements)).toBe(true);
  });

  it('all requirement IDs must be unique', () => {
    const ids = requirementsData.requirements.map((req: Requirement) => req.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('each requirement must have valid attributes', () => {
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
      'TEST',
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

    requirementsData.requirements.forEach((req: Requirement) => {
      expect(req.id).toBeDefined();
      const prefix = req.id.split('-')[0];
      expect(validCategories).toContain(prefix);

      expect(req.title).toBeDefined();
      expect(req.statement).toBeDefined();
      expect(validLevels).toContain(req.level);
      expect(validStatuses).toContain(req.status);
      expect(req.source).toBeDefined();
      expect(req.source.document).toBeDefined();

      if (req.status === 'verified') {
        expect(req.tests).toBeDefined();
        // evidence is required, so at least one test or explicit manual verification note
        const hasTests = Array.isArray(req.tests) && req.tests.length > 0;
        const hasNotes = Array.isArray(req.notes) && req.notes.length > 0;
        expect(hasTests || hasNotes).toBe(true);
      }
    });
  });

  it('all screen IDs referenced must exist in the SCREEN-MATRIX.md', () => {
    expect(fs.existsSync(screenMatrixPath)).toBe(true);
    screenMatrixContent = fs.readFileSync(screenMatrixPath, 'utf8');

    // Extract screen IDs from the table
    // A regex to match rows in the markdown table starting with | XX |
    const regex = /^\|\s*([\w]+)\s*\|/gm;
    let match;
    const existingScreenIds = new Set();
    while ((match = regex.exec(screenMatrixContent)) !== null) {
      if (match[1] !== 'Screen') {
        // skip header
        existingScreenIds.add(match[1]);
      }
    }

    requirementsData.requirements.forEach((req: Requirement) => {
      if (Array.isArray(req.screens)) {
        req.screens.forEach((screenId: string) => {
          if (screenId !== 'Various') {
            expect(existingScreenIds.has(screenId)).toBe(true);
          }
        });
      }
    });
  });
});
