import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';

// Helper to recursively find all files in a directory
async function findFiles(
  dir: string,
  fileList: string[] = [],
): Promise<string[]> {
  try {
    const files = await fs.readdir(dir);
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = await fs.stat(filePath);
      if (stat.isDirectory()) {
        await findFiles(filePath, fileList);
      } else if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
        fileList.push(filePath);
      }
    }
  } catch {
    // Directory might not exist, which is fine
  }
  return fileList;
}

describe('Architecture Rules', () => {
  describe('Core Layer', () => {
    it('should not import React, Next.js, UI components, filesystem, or adapters', async () => {
      const coreDir = path.resolve(__dirname, '../../src/core');
      const coreFiles = await findFiles(coreDir);

      const forbiddenImports = [
        'react',
        'next',
        'node:fs',
        'fs',
        'node:path',
        'path',
        '../../providers/local',
        '../providers/local',
        '../../components',
        '../components',
        '../../app',
        '../app',
      ];

      for (const file of coreFiles) {
        const content = await fs.readFile(file, 'utf-8');
        for (const forbidden of forbiddenImports) {
          // A simple regex to catch import statements.
          // Note: This is pragmatic and doesn't build a full AST, but it works for our strict codebase.
          const importRegex = new RegExp(`from\\s+['"]${forbidden}['"]`);
          expect(content).not.toMatch(importRegex);
        }
      }
    });
  });

  describe('UI Layer', () => {
    it('should not import local persistence directly', async () => {
      const componentsDir = path.resolve(__dirname, '../../src/components');
      const componentFiles = await findFiles(componentsDir);

      const forbiddenImports = [
        '../providers/local/persistence',
        '../../providers/local/persistence',
        'node:fs',
        'fs',
      ];

      for (const file of componentFiles) {
        const content = await fs.readFile(file, 'utf-8');
        for (const forbidden of forbiddenImports) {
          const importRegex = new RegExp(`from\\s+['"]${forbidden}(/.*)?['"]`);
          expect(content).not.toMatch(importRegex);
        }
      }
    });
  });
});
