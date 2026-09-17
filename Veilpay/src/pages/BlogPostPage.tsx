import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import GlassNavbar from '../components/GlassNavbar';
import NoiseOverlay from '../components/NoiseOverlay';
import ScrollProgress from '../components/ScrollProgress';
import { fetchBlogPostBySlug, getBlogPostsSync } from '../lib/blog';
import type { BlogPost } from '../lib/blog';

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  
  const isSSR = typeof window === 'undefined';
  const initialPosts = getBlogPostsSync();
  const initialPost = initialPosts && slug ? initialPosts.find(p => p.slug === slug) : null;
  
  const [post, setPost] = useState<BlogPost | null>(initialPost || null);
  const [isLoading, setIsLoading] = useState(isSSR ? false : !initialPost);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialPost) return;
    
    window.scrollTo(0, 0);
    
    if (!slug) {
      navigate('/blogs');
      return;
    }

    let isMounted = true;
    
    fetchBlogPostBySlug(slug)
      .then(fetchedPost => {
        if (!isMounted) return;
        if (fetchedPost) {
          setPost(fetchedPost);
        } else {
          setError("Post not found");
        }
      })
      .catch(err => {
        if (!isMounted) return;
        console.error("Error loading blog post:", err);
        setError("Failed to load blog post. Please try again later.");
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [slug, navigate, initialPost]);

  return (
    <div className="min-h-screen bg-black text-white">
      <ScrollProgress />
      {post ? (
        <Helmet>
          <title>{post.title} | Veilpay Blog</title>
          <meta name="description" content={post.excerpt} />
          <link rel="canonical" href={`https://veilpayapp.com/blog/${post.slug}`} />
          {/* Open Graph */}
          <meta property="og:type" content="article" />
          <meta property="og:url" content={`https://veilpayapp.com/blog/${post.slug}`} />
          <meta property="og:title" content={`${post.title} | Veilpay Blog`} />
          <meta property="og:description" content={post.excerpt} />
          <meta property="og:image" content="https://veilpayapp.com/og.jpg" />
          <meta property="og:site_name" content="Veilpay" />
          <meta property="article:published_time" content={post.published} />
          <meta property="article:author" content="Veilpay" />
          {post.tags.map(tag => (
            <meta key={tag} property="article:tag" content={tag} />
          ))}
          {/* Twitter Card */}
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={`${post.title} | Veilpay Blog`} />
          <meta name="twitter:description" content={post.excerpt} />
          <meta name="twitter:image" content="https://veilpayapp.com/og.jpg" />
          <script type="application/ld+json">
            {JSON.stringify([
              {
                "@context": "https://schema.org",
                "@type": "BlogPosting",
                "headline": post.title,
                "description": post.excerpt,
                "url": `https://veilpayapp.com/blog/${post.slug}`,
                "datePublished": post.published,
                "dateModified": post.published,
                "author": {
                  "@type": "Organization",
                  "name": "Veilpay",
                  "url": "https://veilpayapp.com/"
                },
                "publisher": {
                  "@type": "Organization",
                  "name": "Veilpay",
                  "logo": {
                    "@type": "ImageObject",
                    "url": "https://veilpayapp.com/logo.webp"
                  }
                },
                "mainEntityOfPage": {
                  "@type": "WebPage",
                  "@id": `https://veilpayapp.com/blog/${post.slug}`
                },
                "image": "https://veilpayapp.com/og.jpg",
                "keywords": post.tags.join(", ")
              },
              {
                "@context": "https://schema.org",
                "@type": "BreadcrumbList",
                "itemListElement": [
                  { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://veilpayapp.com/" },
                  { "@type": "ListItem", "position": 2, "name": "Blog", "item": "https://veilpayapp.com/blogs" },
                  { "@type": "ListItem", "position": 3, "name": post.title, "item": `https://veilpayapp.com/blog/${post.slug}` }
                ]
              }
            ])}
          </script>
        </Helmet>
      ) : (
        <Helmet>
          <title>Blog Post | Veilpay</title>
        </Helmet>
      )}

      <NoiseOverlay />
      <GlassNavbar />

      <main className="mx-auto max-w-3xl px-5 pt-32 pb-24 relative z-10">
        <Link 
          to="/blogs" 
          className="inline-flex items-center text-sm font-semibold text-neutral-400 hover:text-[#F2C572] transition-colors mb-12"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          BACK TO BLOG
        </Link>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#F2C572]"></div>
          </div>
        ) : error || !post ? (
          <div className="text-center text-red-400 p-8 rounded-3xl border border-white/10 bg-white/[0.03]">
            {error || "Post not found"}
          </div>
        ) : (
          <article className="legal-prose">
            <header className="mb-12 border-b border-white/10 pb-8">
              <div className="flex flex-wrap gap-2 mb-6">
                {post.tags.map(tag => (
                  <span key={tag} className="px-3 py-1 text-[10px] font-bold tracking-widest uppercase border border-white/20 rounded-full text-white/70">
                    {tag}
                  </span>
                ))}
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight text-[#F2C572]">
                {post.title}
              </h1>
              <div className="flex items-center text-sm text-neutral-500 uppercase tracking-wider font-semibold">
                <time>{post.published}</time>
                <span className="mx-2">·</span>
                <span>{post.readTime}</span>
              </div>
            </header>
            
            <div
              className="prose prose-invert prose-amber max-w-none prose-img:rounded-xl prose-img:w-full prose-a:text-[#F2C572]"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </article>
        )}

        <nav className="mt-24 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs text-neutral-500 pt-8 border-t border-white/10">
          <Link to="/" className="hover:text-amber-400 transition-colors">Home</Link>
          <Link to="/about" className="hover:text-amber-400 transition-colors">About</Link>
          <Link to="/privacy" className="hover:text-amber-400 transition-colors">Privacy</Link>
          <Link to="/terms" className="hover:text-amber-400 transition-colors">Terms</Link>
          <a href="https://docs.veilpayapp.com" className="hover:text-amber-400 transition-colors">Docs</a>
          <span className="text-neutral-600">© 2026 Veilpay</span>
        </nav>
      </main>
    </div>
  );
}
