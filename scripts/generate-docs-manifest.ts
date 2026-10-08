import fs from 'fs';
import path from 'path';

// Define explicit canonical route overrides for public URLs.
export const canonicalRouteOverrides: Record<string, string> = {
  'getting-started/what-is-veilpay.md': '/docs/start-here/what-is-veilpay',
  'getting-started/core-concepts.md': '/docs/start-here/core-concepts',
  'getting-started/quickstart.md': '/docs/start-here/quickstart',
  'getting-started/current-status.md': '/docs/start-here/current-status',
};

const SUMMARY_PATH = path.resolve(process.cwd(), 'veilpay-docs/SUMMARY.md');
const OUTPUT_PATH = path.resolve(process.cwd(), 'src/generated/docsManifest.generated.ts');

interface DocsPageRecord {
  id: string;
  title: string;
  sourcePath: string;
  routePath: string;
  depth: number;
  parentId?: string;
  order: number;
}

interface DocsGroupDef {
  title: string;
  pages: DocsPageRecord[];
}

function parseSummary(content: string) {
  const lines = content.split('\n');
  const groups: DocsGroupDef[] = [];
  const allPages: DocsPageRecord[] = [];
  let currentGroup: DocsGroupDef | null = null;
  let order = 0;
  
  // A simple stack to keep track of parent relationships based on indentation.
  const stack: { depth: number, record: DocsPageRecord }[] = [];

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trimRight();
    if (!line) continue;

    const headingMatch = line.match(/^(#{2,3})\s+(.+)$/);
    if (headingMatch) {
      const title = headingMatch[2].replace(/\[(.*?)\]\(.*?\)/, '$1');
      currentGroup = { title, pages: [] };
      groups.push(currentGroup);
      stack.length = 0;
      continue;
    }

    const listMatch = line.match(/^(\s*)(?:-|[*])\s+\[(.*?)\]\((.*?)\)/);
    if (listMatch) {
      if (!currentGroup) {
        currentGroup = { title: 'Uncategorized', pages: [] };
        groups.push(currentGroup);
      }

      const indent = listMatch[1].length;
      const title = listMatch[2];
      const sourcePath = listMatch[3];
      
      let depth = 0;
      let parentId: string | undefined = undefined;

      while (stack.length > 0 && stack[stack.length - 1].depth >= indent) {
        stack.pop();
      }

      if (stack.length > 0) {
        depth = stack.length;
        parentId = stack[stack.length - 1].record.id;
      }

      let canonicalPath: string;
      if (canonicalRouteOverrides[sourcePath]) {
        canonicalPath = canonicalRouteOverrides[sourcePath];
      } else if (sourcePath === 'README.md') {
        canonicalPath = '/docs';
      } else {
        canonicalPath = `/docs/${sourcePath.replace(/\.md$/, '')}`;
      }

      const record: DocsPageRecord = {
        id: sourcePath,
        title,
        sourcePath,
        routePath: canonicalPath,
        depth,
        parentId,
        order: order++
      };

      allPages.push(record);
      currentGroup.pages.push(record);

      stack.push({ depth: indent, record });
    } else if (line.trim().startsWith('# ')) {
      continue;
    } else if (line.trim().startsWith('-') || line.trim().startsWith('*')) {
      console.warn(`[docs:manifest] Warning: Ignored unlinked list item at line ${i + 1}: ${line}`);
    } else if (line.match(/^[a-zA-Z]/)) {
      console.warn(`[docs:manifest] Warning: Ignored plain text at line ${i + 1}: ${line}`);
    }
  }

  return { groups, allPages };
}

function generate() {
  if (!fs.existsSync(SUMMARY_PATH)) {
    console.error(`Error: Could not find SUMMARY.md at ${SUMMARY_PATH}`);
    process.exit(1);
  }

  const content = fs.readFileSync(SUMMARY_PATH, 'utf-8');
  const { groups, allPages } = parseSummary(content);

  const fileContent = `// AUTO-GENERATED FILE. DO NOT EDIT.
// Generated from veilpay-docs/SUMMARY.md.

import type { DocsGroup, DocsPageRecord, DocsRegistry } from '../lib/docs/types';

export const docsGroups: DocsGroup[] = ${JSON.stringify(groups, null, 2)};

export const allPages: DocsPageRecord[] = ${JSON.stringify(allPages, null, 2)};

export const routeToPage = allPages.reduce((acc, page) => {
  acc[page.routePath] = page;
  return acc;
}, {} as Record<string, DocsPageRecord>);

export const sourceToPage = allPages.reduce((acc, page) => {
  acc[page.sourcePath] = page;
  return acc;
}, {} as Record<string, DocsPageRecord>);

export const docsRegistry: DocsRegistry = {
  pages: allPages,
  routeToPage,
  sourceToPage
};

export const canonicalRouteOverrides: Record<string, string> = ${JSON.stringify(canonicalRouteOverrides, null, 2)};
`;

  const outDir = path.dirname(OUTPUT_PATH);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_PATH, fileContent);
  console.log(`[docs:manifest] Successfully generated manifest with ${allPages.length} pages.`);
}

generate();
