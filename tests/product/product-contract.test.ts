import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const reqPath = path.resolve(__dirname, '../../docs/product/requirements.json');
const atomicPath = path.resolve(
  __dirname,
  '../../docs/product/source/atomic-requirements.json',
);
const matrixPath = path.resolve(
  __dirname,
  '../../docs/product/SCREEN-MATRIX.md',
);

const reqJson = JSON.parse(fs.readFileSync(reqPath, 'utf8'));

interface Requirement {
  id: string;
  kind: string;
  statement: string;
  sourceNeedles: string[];
  screens: string[];
  status: string;
  implementation: string[];
}
const requirements: Requirement[] = reqJson.requirements;

const atomicJson = JSON.parse(fs.readFileSync(atomicPath, 'utf8'));

describe('Product Contract Integrity', () => {
  it('should have exactly 47 screens in atomic-requirements.json', () => {
    expect(Object.keys(atomicJson).length).toBe(47);
  });

  it('should have exactly 47 screens mapped in SCREEN-MATRIX.md', () => {
    const matrixContent = fs.readFileSync(matrixPath, 'utf8');
    const screenLines = matrixContent
      .split('\n')
      .filter((line) => line.startsWith('|') && /^\| \d/.test(line));
    expect(screenLines.length).toBe(47);
  });

  it('should verify every requirement has kind and sourceNeedles', () => {
    requirements.forEach((req) => {
      expect(['structure', 'action', 'state', 'data']).toContain(req.kind);
      expect(Array.isArray(req.sourceNeedles)).toBe(true);
      expect(req.sourceNeedles.length).toBeGreaterThanOrEqual(1);
    });
  });

  it('should prevent fake intendedRoutes', () => {
    const matrixContent = fs.readFileSync(matrixPath, 'utf8');
    const screenLines = matrixContent
      .split('\n')
      .filter((line) => line.startsWith('|') && /^\| \d/.test(line));

    screenLines.forEach((line) => {
      const parts = line.split('|').map((p) => p.trim());
      const route = parts[7];
      expect([
        '/',
        '/connexion',
        '/inscription',
        '/mot-de-passe-oublie',
        '/dashboard',
        'TBD',
      ]).toContain(route);
    });
  });

  it('should prevent logic mismatch on implemented_unverified', () => {
    requirements.forEach((req) => {
      if (req.status === 'implemented_unverified') {
        expect(req.implementation).toBeDefined();
        expect(Array.isArray(req.implementation)).toBe(true);
        expect(req.implementation.length).toBeGreaterThanOrEqual(1);

        req.implementation.forEach((implPath) => {
          const fullPath = path.resolve(__dirname, '../../', implPath);
          expect(fs.existsSync(fullPath)).toBe(true);
        });
      }
    });
  });

  it('should match actual strings in the canonical files (Source Fidelity Anchor)', () => {
    const docsDir = path.resolve(__dirname, '../../docs/myevents');
    const files = [
      's-public.js',
      's-app.js',
      's-studio.js',
      's-guests.js',
      's-memories.js',
      's-mobile.js',
      's-states.js',
    ];

    const screenContent: Record<string, string> = {};
    files.forEach((f) => {
      const content = fs.readFileSync(path.join(docsDir, f), 'utf8');
      for (let i = 1; i <= 44; i++) {
        const n = i.toString().padStart(2, '0');
        ['', 'a', 'b', 'c', 'd'].forEach((suffix) => {
          const fullN = n + suffix;
          const idx = content.indexOf('function p' + fullN + '()');
          if (idx !== -1) {
            let nextIdx = -1;
            for (let j = idx + 10; j < content.length; j++) {
              if (content.substring(j, j + 10).startsWith('function p')) {
                nextIdx = j;
                break;
              }
            }
            if (nextIdx === -1) nextIdx = content.length;
            screenContent[fullN] = content.substring(idx, nextIdx);
          }
        });
      }
    });

    let invalid = 0;
    requirements.forEach((req) => {
      const n = req.screens[0];
      const html = screenContent[n] || '';
      const hasValidNeedle = req.sourceNeedles.some((needle) =>
        html.includes(needle),
      );
      if (!hasValidNeedle) {
        invalid++;
        console.error(
          `Invalid needle in screen ${n}: ${req.sourceNeedles.join(', ')}`,
        );
      }
    });

    expect(invalid).toBe(0);
  });

  it('should guarantee no requirement starts with "Affichage:" or contains raw CSS', () => {
    requirements.forEach((req) => {
      expect(req.statement.startsWith('Affichage:')).toBe(false);
      expect(req.statement.includes('#')).toBe(false); // No hex colors
    });
  });

  it('should guarantee every screen has at least one requirement', () => {
    const screenIds = Object.keys(atomicJson);
    screenIds.forEach((screenId) => {
      const reqs = requirements.filter((r) => r.screens.includes(screenId));
      expect(reqs.length).toBeGreaterThan(0);
    });
  });

  it('should guarantee Screen 41 is Audio and Screen 42 is Photo/Video', () => {
    const r41 = requirements.filter((r) => r.screens.includes('41'));
    const r42 = requirements.filter((r) => r.screens.includes('42'));

    const audioNeedles = r41.map((r) => r.sourceNeedles.join(' ')).join(' ');
    expect(audioNeedles).toContain('livre-audio-invite');
    expect(audioNeedles).toContain('enregistrement');
    expect(audioNeedles).not.toContain('Prendre une photo');

    const videoNeedles = r42.map((r) => r.sourceNeedles.join(' ')).join(' ');
    expect(videoNeedles).toContain('Prendre une photo');
    expect(videoNeedles).toContain('Filmer une vidéo');
    expect(videoNeedles).not.toContain('00:47');
  });

  it('should guarantee Screen 06 has actual B2B requirements', () => {
    const r06 = requirements.filter((r) => r.screens.includes('06'));
    const n06 = r06.map((r) => r.sourceNeedles.join(' ')).join(' ');

    expect(n06).toContain('Wedding planners');
    expect(n06).not.toContain('10 Go');
  });

  it('should guarantee Screen 15 has actual creation requirements', () => {
    const r15 = requirements.filter((r) => r.screens.includes('15'));
    const n15 = r15.map((r) => r.sourceNeedles.join(' ')).join(' ');

    expect(n15).toContain('creer-evenement');
  });
});
