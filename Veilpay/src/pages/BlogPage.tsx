import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import GlassNavbar from '../components/GlassNavbar';
import NoiseOverlay from '../components/NoiseOverlay';
import ScrollProgress from '../components/ScrollProgress';
import { fetchBlogPosts, getBlogPostsSync } from '../lib/blog';
import type { BlogPost } from '../lib/blog';

export default function BlogPage() {
  const isSSR = typeof window === 'undefined';
  const initialPosts = getBlogPostsSync();
  const [posts, setPosts] = useState<BlogPost[]>(initialPosts || []);
  const [isLoading, setIsLoading] = useState(isSSR ? false : !initialPosts);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialPosts && initialPosts.length > 0) return;
    window.scrollTo(0, 0);
    
    let isMounted = true;
    
    fetchBlogPosts()
      .then(fetchedPosts => {
        if (isMounted) {
          setPosts(fetchedPosts);
        }
      })
      .catch(err => {
        if (isMounted) {
          console.error("Error loading blog posts:", err);
          setError("Failed to load blog posts. Please try again later.");
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [initialPosts]);

  return (
    <div className="min-h-screen bg-black text-white">
      <ScrollProgress />
      <Helmet>
        <title>Blog | Veilpay — Privacy, Crypto & Web3 Insights</title>
        <meta name="description" content="Stay updated with the latest news, updates, and insights about privacy-first crypto payments from Veilpay. Stealth addresses, ZK proofs, and multi-chain updates." />
        <link rel="canonical" href="https://veilpayapp.com/blogs" />
        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://veilpayapp.com/blogs" />
        <meta property="og:title" content="Blog | Veilpay — Privacy, Crypto & Web3 Insights" />
        <meta property="og:description" content="Stay updated with the latest news, updates, and insights about privacy-first crypto payments from Veilpay." />
        <meta property="og:image" content="https://veilpayapp.com/og.jpg" />
        <meta property="og:site_name" content="Veilpay" />
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Blog | Veilpay" />
        <meta name="twitter:description" content="Stay updated with the latest news, updates, and insights about privacy-first crypto payments from Veilpay." />
        <meta name="twitter:image" content="https://veilpayapp.com/og.jpg" />
        <script type="application/ld+json">
          {JSON.stringify([
            {
              "@context": "https://schema.org",
              "@type": "CollectionPage",
              "name": "Veilpay Blog",
              "description": "Stay updated with the latest news, updates, and insights about privacy-first crypto payments from Veilpay.",
              "url": "https://veilpayapp.com/blogs",
              "publisher": {
                "@type": "Organization",
                "name": "Veilpay",
                "logo": {
                  "@type": "ImageObject",
                  "url": "https://veilpayapp.com/logo.webp"
                }
              }
            },
            {
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://veilpayapp.com/" },
                { "@type": "ListItem", "position": 2, "name": "Blog", "item": "https://veilpayapp.com/blogs" }
              ]
            }
          ])}
        </script>
      </Helmet>

      <NoiseOverlay />
      <GlassNavbar />

      <main className="mx-auto max-w-3xl px-5 pt-32 pb-24 relative z-10">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 uppercase mb-4">
            Veilpay <span className="text-[#F2C572]">Blog</span>
          </h1>
          <p className="text-white/60 text-lg max-w-xl mx-auto">
            Updates, announcements, and insights from the team.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#F2C572]"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-400 p-8 rounded-3xl border border-white/10 bg-white/[0.03]">
            {error}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center text-white/60 p-12 rounded-3xl border border-white/10 bg-white/[0.03]">
            No blog posts published yet. Check back later!
          </div>
        ) : (
          <div className="space-y-8">
            {posts.map((post) => (
              <Link 
                to={`/blog/${post.slug}`} 
                key={post.id}
                className="block p-6 md:p-8 rounded-[40px] ios-glass transition-all hover:brightness-110 hover:-translate-y-1"
              >
                <div className="flex items-center text-xs text-neutral-500 uppercase tracking-wider font-semibold mb-4">
                  <time>{post.published}</time>
                  <span className="mx-2">·</span>
                  <span>{post.readTime}</span>
                </div>
                
                <h2 className="text-2xl md:text-3xl font-bold mb-3 text-[#F2C572]">
                  {post.title}
                </h2>
                
                <p className="text-neutral-400 line-clamp-3 mb-6">
                  {post.excerpt}
                </p>

                {post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {post.tags.map(tag => (
                      <span key={tag} className="px-3 py-1 text-[10px] font-bold tracking-widest uppercase border border-white/20 rounded-full text-white/70">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}

        <nav className="mt-16 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs text-neutral-500">
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
