import fs from 'fs';
import path from 'path';
import { allPages } from '../src/generated/docsManifest.generated';

const DOCS_DIR = path.resolve(process.cwd(), 'veilpay-docs');

let errors = 0;

function check() {
  console.log('[docs:validate] Starting documentation validation...');

  const sourcePaths = new Set<string>();
  const routePaths = new Set<string>();

  for (const page of allPages) {
    const fullPath = path.resolve(DOCS_DIR, page.sourcePath);
    
    // 1. File existence
    if (!fs.existsSync(fullPath)) {
      console.error(`Error: Source file missing: ${page.sourcePath}`);
      errors++;
    }

    // 2. Duplicate source path mapping
    if (sourcePaths.has(page.sourcePath)) {
      console.error(`Error: Source file mapped multiple times: ${page.sourcePath}`);
      errors++;
    }
    sourcePaths.add(page.sourcePath);

    // 3. Duplicate route
    if (routePaths.has(page.routePath)) {
      console.error(`Error: Canonical route duplicated: ${page.routePath}`);
      errors++;
    }
    routePaths.add(page.routePath);
  }

  // 4. Check for GitBook constructs in all markdown files
  function scanDir(dir: string) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      if (fs.statSync(fullPath).isDirectory()) {
        scanDir(fullPath);
      } else if (file.endsWith('.md')) {
        const content = fs.readFileSync(fullPath, 'utf-8');
        if (content.includes('{%')) {
          console.warn(`Warning: Potential unsupported GitBook construct ({%) found in ${path.relative(DOCS_DIR, fullPath)}`);
          // Not strictly failing the build for warnings, but you could.
        }
      }
    }
  }
  scanDir(DOCS_DIR);

  if (errors > 0) {
    console.error(`[docs:validate] Validation failed with ${errors} errors.`);
    process.exit(1);
  } else {
    console.log('[docs:validate] All checks passed.');
  }
}

check();
