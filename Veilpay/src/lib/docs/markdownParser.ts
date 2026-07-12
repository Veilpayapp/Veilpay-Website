import { marked, Renderer, type Tokens } from 'marked';
import DOMPurify from 'dompurify';
import { resolveInternalLink } from './linkResolver';

export interface TocEntry {
  id: string;
  text: string;
  level: 2 | 3;
}

const slugify = (raw: string): string =>
  raw
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

export function parseMarkdown(markdownContent: string, currentSourcePath: string): { html: string, toc: TocEntry[] } {
  const toc: TocEntry[] = [];
  const seenSlugs = new Set<string>();

  const renderer = new Renderer();

  renderer.heading = function (this: Renderer, { tokens, depth }: Tokens.Heading): string {
    const rawText = this.parser.parseInline(tokens);
    const stripped = rawText.replace(/<[^>]+>/g, '').trim();
    
    let id = slugify(stripped) || `heading-${depth}`;
    let suffix = 1;
    while (seenSlugs.has(id)) {
      id = `${slugify(stripped)}-${suffix++}`;
    }
    seenSlugs.add(id);

    if (depth === 2 || depth === 3) {
      toc.push({ id, text: stripped, level: depth });
    }

    const escapedText = stripped.replace(/"/g, '&#34;');
    return `<h${depth} id="${id}">${rawText}<a class="anchor-link" href="#${id}" aria-label="${escapedText}">&#182;</a></h${depth}>\n`;
  };

  renderer.link = function (this: Renderer, { tokens, href, title }: Tokens.Link): string {
    const resolvedHref = resolveInternalLink(href, currentSourcePath);
    const text = this.parser.parseInline(tokens);
    const titleAttr = title ? ` title="${title}"` : '';
    return `<a href="${resolvedHref}"${titleAttr}>${text}</a>`;
  };

  marked.use({ renderer });

  const rawHtml = marked.parse(markdownContent, { async: false }) as string;

  // DOMPurify setup
  const cleanHtml = DOMPurify.sanitize(rawHtml, {
    ALLOWED_TAGS: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'a', 'ul', 'ol', 'li', 
      'blockquote', 'pre', 'code', 'strong', 'em', 'del', 'hr', 'img',
      'table', 'thead', 'tbody', 'tr', 'th', 'td', 'span', 'div', 'br',
      'details', 'summary'
    ],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'id', 'class', 'target', 'rel', 'aria-label'],
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
  });

  // Post-process to ensure external links have target="_blank" and rel="noopener noreferrer"
  // It's cleaner to do this with a DOMParser or regex since DOMPurify strips unknown attributes,
  // but DOMPurify hooks are safer. We will just use DOMPurify hooks.

  return { html: cleanHtml, toc };
}

// Add DOMPurify hook to handle external links target="_blank" rel="noopener noreferrer"
DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  if (node.tagName === 'A' && node.hasAttribute('href')) {
    const href = node.getAttribute('href') || '';
    if (href.startsWith('http://') || href.startsWith('https://')) {
      if (!href.startsWith(window.location.origin)) {
        node.setAttribute('target', '_blank');
        node.setAttribute('rel', 'noopener noreferrer');
      }
    }
  }
});
