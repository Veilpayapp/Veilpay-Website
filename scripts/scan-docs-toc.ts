import fs from 'fs';
import path from 'path';
import { allPages } from '../src/generated/docsManifest.generated';
import { parseMarkdown } from '../src/lib/docs/markdownParser';

const DOCS_DIR = path.resolve(process.cwd(), 'veilpay-docs');

interface PageScanResult {
  routePath: string;
  sourcePath: string;
  totalHeadings: number;
  h2Count: number;
  h3Count: number;
  tocEntriesCount: number;
  htmlMatchesCount: number;
  allMatch: boolean;
  issues: string[];
}

function runTOCScan() {
  console.log('='.repeat(80));
  console.log('🔍 SCANNING ALL DOCS PAGES FOR HEADINGS & TOC HIGHLIGHTING MATCHES');
  console.log('='.repeat(80));

  const results: PageScanResult[] = [];
  let totalH2 = 0;
  let totalH3 = 0;
  let totalTocEntries = 0;
  let totalPassedPages = 0;
  let pagesWithoutHeadings = 0;

  for (const page of allPages) {
    const fullPath = path.resolve(DOCS_DIR, page.sourcePath);
    if (!fs.existsSync(fullPath)) {
      results.push({
        routePath: page.routePath,
        sourcePath: page.sourcePath,
        totalHeadings: 0,
        h2Count: 0,
        h3Count: 0,
        tocEntriesCount: 0,
        htmlMatchesCount: 0,
        allMatch: false,
        issues: [`File not found: ${fullPath}`]
      });
      continue;
    }

    const markdown = fs.readFileSync(fullPath, 'utf-8');
    const { html, toc } = parseMarkdown(markdown, page.sourcePath);

    // Find raw markdown headings
    const rawLines = markdown.split('\n');
    let h2Count = 0;
    let h3Count = 0;
    let inCodeBlock = false;

    for (const line of rawLines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('```')) {
        inCodeBlock = !inCodeBlock;
        continue;
      }
      if (inCodeBlock) continue;

      if (/^##\s+/.test(trimmed)) h2Count++;
      else if (/^###\s+/.test(trimmed)) h3Count++;
    }

    totalH2 += h2Count;
    totalH3 += h3Count;
    totalTocEntries += toc.length;

    const issues: string[] = [];

    // Verify every TOC entry has matching id in HTML
    let htmlMatches = 0;
    const seenIds = new Set<string>();

    for (const entry of toc) {
      if (!entry.id) {
        issues.push(`Empty ID for TOC entry: "${entry.text}"`);
      }
      if (seenIds.has(entry.id)) {
        issues.push(`Duplicate TOC ID found: "${entry.id}"`);
      }
      seenIds.add(entry.id);

      // Check if id exists in HTML
      const idPattern = new RegExp(`id=["']${entry.id}["']`, 'i');
      if (idPattern.test(html)) {
        htmlMatches++;
      } else {
        issues.push(`TOC ID "${entry.id}" not found in rendered HTML.`);
      }
    }

    // Verify TOC count matches h2 + h3 count
    if (toc.length !== h2Count + h3Count) {
      issues.push(`Count mismatch: markdown has ${h2Count} H2 and ${h3Count} H3, but TOC generated ${toc.length} entries.`);
    }

    // Check if page has no headings
    if (toc.length === 0) {
      pagesWithoutHeadings++;
    }

    const allMatch = issues.length === 0;
    if (allMatch) totalPassedPages++;

    results.push({
      routePath: page.routePath,
      sourcePath: page.sourcePath,
      totalHeadings: h2Count + h3Count,
      h2Count,
      h3Count,
      tocEntriesCount: toc.length,
      htmlMatchesCount: htmlMatches,
      allMatch,
      issues
    });
  }

  // Print Summary Table
  console.log(`\n📄 Scanned ${results.length} total documentation pages.\n`);
  console.log(
    'Page Route'.padEnd(48) +
    'H2/H3'.padEnd(10) +
    'TOC'.padEnd(8) +
    'HTML ID'.padEnd(10) +
    'Status'
  );
  console.log('-'.repeat(85));

  for (const r of results) {
    const status = r.allMatch ? '✅ PASS' : '❌ FAIL';
    console.log(
      r.routePath.padEnd(48) +
      `${r.h2Count}/${r.h3Count}`.padEnd(10) +
      `${r.tocEntriesCount}`.padEnd(8) +
      `${r.htmlMatchesCount}`.padEnd(10) +
      status
    );
    if (r.issues.length > 0) {
      for (const issue of r.issues) {
        console.log(`   ⚠️ ${issue}`);
      }
    }
  }

  console.log('-'.repeat(85));
  console.log(`\n📊 OVERALL SCAN RESULTS:`);
  console.log(`   Total Pages:            ${results.length}`);
  console.log(`   Passed Pages:           ${totalPassedPages} / ${results.length} (${((totalPassedPages/results.length)*100).toFixed(1)}%)`);
  console.log(`   Total H2 Headings:      ${totalH2}`);
  console.log(`   Total H3 Subheadings:   ${totalH3}`);
  console.log(`   Total TOC Entries:      ${totalTocEntries}`);
  console.log(`   Pages with 0 Headings:  ${pagesWithoutHeadings} (e.g. single-paragraph overview pages)`);

  if (totalPassedPages === results.length) {
    console.log(`\n🎉 ALL 49 DOCUMENTATION PAGES PASSED: 100% of headings and subheadings are properly extracted and map to valid HTML element IDs!\n`);
  } else {
    console.error(`\n❌ Found issues on ${results.length - totalPassedPages} pages.`);
    process.exit(1);
  }
}

runTOCScan();
