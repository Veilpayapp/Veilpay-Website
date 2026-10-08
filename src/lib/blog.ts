export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  published: string;
  readTime: string;
  tags: string[];
  url: string;
}


function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

function calculateReadTime(text: string): string {
  const wordsPerMinute = 200;
  const wordCount = text.split(/\s+/).length;
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  return `${minutes} MIN READ`;
}

function extractExcerpt(html: string, length = 150): string {
  // Strip HTML tags to get plain text
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const text = doc.body.textContent || "";
  
  if (text.length <= length) return text;
  
  // Truncate and add ellipsis
  return text.substring(0, length).trim() + '...';
}

interface BloggerLink {
  rel: string;
  href: string;
}

interface BloggerCategory {
  term: string;
}

interface BloggerEntry {
  title: { $t: string };
  content?: { $t: string };
  summary?: { $t: string };
  link?: BloggerLink[];
  category?: BloggerCategory[];
  id: { $t: string };
  published: { $t: string };
}

interface BloggerFeed {
  feed?: {
    entry?: BloggerEntry[];
  };
}

export function fetchBlogPosts(): Promise<BlogPost[]> {
  return new Promise((resolve, reject) => {
    const callbackName = 'bloggerCallback_' + Math.round(100000 * Math.random());
    
    const timeout = setTimeout(() => {
      cleanup();
      reject(new Error("Timeout fetching blog posts"));
    }, 15000);

    const cleanup = () => {
      clearTimeout(timeout);
      delete (window as unknown as Record<string, unknown>)[callbackName];
      const scriptEl = document.getElementById(callbackName);
      if (scriptEl) scriptEl.remove();
    };

    (window as unknown as Record<string, unknown>)[callbackName] = (data: BloggerFeed) => {
      cleanup();
      try {
        const entries = data.feed?.entry || [];
        const parsedPosts = entries.map((entry: BloggerEntry) => {
          const title = entry.title.$t;
          const content = entry.content ? entry.content.$t : (entry.summary ? entry.summary.$t : '');
          const excerpt = extractExcerpt(content, 200);
          
          const alternateLink = entry.link?.find((l) => l.rel === 'alternate')?.href;
          let slug = generateSlug(title);
          
          if (alternateLink) {
            const match = alternateLink.match(/\/([^/]+)\.html$/);
            if (match && match[1]) {
              slug = match[1];
            }
          }

          const tags = entry.category ? entry.category.map((c) => c.term) : [];
          
          return {
            id: entry.id.$t,
            slug,
            title,
            excerpt,
            content,
            published: new Date(entry.published.$t).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }).toUpperCase(),
            readTime: calculateReadTime(content.replace(/<[^>]+>/g, '')),
            tags,
            url: alternateLink || '#'
          };
        });
        resolve(parsedPosts);
      } catch (err) {
        reject(err);
      }
    };

    const script = document.createElement('script');
    script.id = callbackName;
    script.src = `https://veilpay.blogspot.com/feeds/posts/default?alt=json-in-script&callback=${callbackName}`;
    script.onerror = () => {
      cleanup();
      reject(new Error("Failed to load blog posts script"));
    };
    document.body.appendChild(script);
  });
}

export async function fetchBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const posts = await fetchBlogPosts();
  return posts.find(post => post.slug === slug) || null;
}

export function getBlogPostsSync(): BlogPost[] | null {
  if (typeof window === 'undefined' && (globalThis as Record<string, unknown>).__BLOG_POSTS__) {
    return (globalThis as Record<string, unknown>).__BLOG_POSTS__ as BlogPost[];
  }
  return null;
}
