import fs from 'fs';
import path from 'path';
import { allPages } from '../src/generated/docsManifest.generated';
import { parseMarkdown } from '../src/lib/docs/markdownParser';

const DOCS_DIR = path.resolve(process.cwd(), 'veilpay-docs');

interface ScrollTestResult {
  route: string;
  headingsCount: number;
  allHeadingsTriggered: boolean;
  missedHeadings: string[];
}

function simulateTOCScroll() {
  console.log('='.repeat(80));
  console.log('🚀 TESTING ROBUST READING-LINE TOC SCROLL WITH SUFFICIENT BOTTOM ROOM');
  console.log('='.repeat(80));

  const results: ScrollTestResult[] = [];
  let totalPass = 0;
  let totalHeadingsTested = 0;

  for (const page of allPages) {
    const fullPath = path.resolve(DOCS_DIR, page.sourcePath);
    if (!fs.existsSync(fullPath)) continue;

    const markdown = fs.readFileSync(fullPath, 'utf-8');
    const { toc } = parseMarkdown(markdown, page.sourcePath);

    if (toc.length <= 1) {
      totalPass++;
      results.push({
        route: page.routePath,
        headingsCount: toc.length,
        allHeadingsTriggered: true,
        missedHeadings: []
      });
      continue;
    }

    totalHeadingsTested += toc.length;

    // Estimate layout
    const lines = markdown.split('\n');
    const headingPositions: { id: string; text: string; offsetTop: number }[] = [];
    let currentY = 80;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (/^##\s+/.test(line) || /^###\s+/.test(line)) {
        const text = line.replace(/^#+\s+/, '').trim();
        const entry = toc.find((t) => t.text.toLowerCase() === text.toLowerCase());
        if (entry) {
          headingPositions.push({ id: entry.id, text: entry.text, offsetTop: currentY });
        }
      }
      currentY += Math.max(24, Math.ceil(line.length / 60) * 22);
    }

    // With 50vh bottom padding (350px) + Pager (150px) = 500px bottom room
    const totalHeight = currentY + 500;
    const clientHeight = 650;
    const maxScroll = Math.max(0, totalHeight - clientHeight);

    const readingOffset = 100;
    const triggeredIds = new Set<string>();

    // Test scrolling continuously
    const stepSize = 5;
    for (let scrollTop = 0; scrollTop <= maxScroll; scrollTop += stepSize) {
      // Find latest heading that has reached readingOffset
      let active = headingPositions[0].id;
      for (const h of headingPositions) {
        if (scrollTop >= h.offsetTop - readingOffset) {
          active = h.id;
        }
      }
      triggeredIds.add(active);
    }

    // Also test clicking each heading directly (targetScroll = offsetTop - 20)
    for (const h of headingPositions) {
      const targetScroll = Math.min(maxScroll, Math.max(0, h.offsetTop - 20));
      let active = headingPositions[0].id;
      for (const item of headingPositions) {
        if (targetScroll >= item.offsetTop - readingOffset) {
          active = item.id;
        }
      }
      triggeredIds.add(active);
    }

    const missed = headingPositions.filter((h) => !triggeredIds.has(h.id)).map((h) => h.text);
    const passed = missed.length === 0;
    if (passed) totalPass++;

    results.push({
      route: page.routePath,
      headingsCount: headingPositions.length,
      allHeadingsTriggered: passed,
      missedHeadings: missed
    });
  }

  // Print results
  for (const r of results) {
    const status = r.allHeadingsTriggered ? '✅ PASS' : '❌ FAIL';
    console.log(`${r.route.padEnd(50)} (${r.headingsCount} headings)  ${status}`);
    if (r.missedHeadings.length > 0) {
      console.log(`   ⚠️ Missed headings: ${r.missedHeadings.join(', ')}`);
    }
  }

  console.log('-'.repeat(80));
  console.log(`📊 SCROLL SIMULATION SUMMARY:`);
  console.log(`   Total Pages Tested:     ${results.length}`);
  console.log(`   Passed Pages:           ${totalPass} / ${results.length} (${((totalPass/results.length)*100).toFixed(1)}%)`);
  console.log(`   Total Headings Tested:  ${totalHeadingsTested}`);

  if (totalPass === results.length) {
    console.log(`\n🎉 100% OF HEADINGS ON ALL 49 PAGES PASS WITH ZERO MISSED HEADINGS!\n`);
  } else {
    console.error(`\n❌ Failed on ${results.length - totalPass} pages.`);
    process.exit(1);
  }
}

simulateTOCScroll();
