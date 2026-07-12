import { docsRegistry } from '../../generated/docsManifest.generated';

// Strict 7-step link resolution pipeline for cross-document links
export function resolveInternalLink(href: string, currentSourcePath: string): string {
  // 1. Parse the markdown link
  const urlParamsIndex = href.indexOf('?');
  const hashIndex = href.indexOf('#');
  
  let pathPart = href;
  let queryPart = '';
  let hashPart = '';

  if (urlParamsIndex !== -1 && (hashIndex === -1 || urlParamsIndex < hashIndex)) {
    pathPart = href.substring(0, urlParamsIndex);
    queryPart = hashIndex !== -1 ? href.substring(urlParamsIndex, hashIndex) : href.substring(urlParamsIndex);
    if (hashIndex !== -1) {
      hashPart = href.substring(hashIndex);
    }
  } else if (hashIndex !== -1) {
    pathPart = href.substring(0, hashIndex);
    hashPart = href.substring(hashIndex);
  }

  // 2. Classify link
  if (!pathPart) {
    // Same-page hash
    return href; 
  }
  
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(pathPart)) {
    // External or explicit protocol (http, https, mailto, tel)
    return href;
  }

  if (pathPart.startsWith('/')) {
    // Absolute app path - we shouldn't have absolute markdown links to other docs typically,
    // but if we do, assume it's root-relative to the app. Return as is, or handle specially if it's an asset.
    return href; 
  }

  // 3. Resolve relative to current sourcePath
  // currentSourcePath example: "getting-started/what-is-veilpay.md"
  const currentDir = currentSourcePath.split('/').slice(0, -1).join('/');
  
  // pathPart example: "../privacy/overview.md" or "core-concepts.md"
  const segments = currentDir ? currentDir.split('/') : [];
  const targetSegments = pathPart.split('/');

  for (const seg of targetSegments) {
    if (seg === '.') continue;
    if (seg === '..') {
      segments.pop();
    } else {
      segments.push(seg);
    }
  }

  // 4. Normalize the resolved path
  const resolvedSourcePath = segments.join('/');

  // 5. Look up canonical routePath
  // Look up exactly with .md or handling folder references if needed.
  let page = docsRegistry.sourceToPage[resolvedSourcePath];
  if (!page && !resolvedSourcePath.endsWith('.md')) {
    page = docsRegistry.sourceToPage[`${resolvedSourcePath}.md`] || docsRegistry.sourceToPage[`${resolvedSourcePath}/README.md`];
  }

  if (page) {
    // 6 & 7. Re-attach and return
    return `${page.routePath}${queryPart}${hashPart}`;
  }

  // Asset links or unresolved files. Return original.
  return href;
}
