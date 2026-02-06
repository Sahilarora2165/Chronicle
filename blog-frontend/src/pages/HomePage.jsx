import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import api from "../axios";
import HomeHeader from "../components/HomeHeader";
import Footer from "../components/Footer";
import { ArrowRight, Quote } from "lucide-react";

const PostSkeleton = () => (
  <div className="flex flex-col space-y-4 animate-pulse">
    <div className="bg-gray-100 h-[240px] w-full rounded-sm" />
    <div className="space-y-3 pt-2">
      <div className="h-3 bg-gray-100 rounded w-1/4" />
      <div className="h-8 bg-gray-100 rounded w-full" />
      <div className="h-4 bg-gray-100 rounded w-2/3" />
    </div>
  </div>
);

const PostCard = ({ post, index }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const hasImage = post.imageUrl && post.imageUrl.trim() !== "" && !imageError;

  const generatePastelColor = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = hash % 360;
    return `hsl(${h}, 20%, 94%)`;
  };

  const fallbackColor = generatePastelColor(post.title + post.id);

  return (
    <Link
      to={`/posts/${post.id}`}
      className="group block h-full cursor-pointer opacity-0 animate-fadeInUp transition-transform duration-500 ease-out hover:-translate-y-2"
      style={{ animationDelay: `${index % 9 * 50}ms`, animationFillMode: 'forwards' }}
    >
      <article className="flex flex-col h-full">
        <div className="relative w-full aspect-[3/2] overflow-hidden bg-gray-50 mb-6 shadow-sm group-hover:shadow-2xl transition-all duration-500">
          {hasImage ? (
            <>
              {!imageLoaded && <div className="absolute inset-0 bg-gray-100 animate-pulse" />}
              <img
                src={post.imageUrl}
                alt={post.title}
                loading="lazy"
                decoding="async"
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
                className={`w-full h-full object-cover transition-transform duration-1000 ease-in-out group-hover:scale-105 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              />
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center transition-transform duration-1000 group-hover:scale-105" style={{ backgroundColor: fallbackColor }}>
              <Quote className="w-8 h-8 text-black/10 mb-4" />
              <div className="max-w-[80%]">
                <h3 className="text-lg font-serif font-bold text-gray-900 leading-tight line-clamp-3 opacity-40">{post.title}</h3>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col flex-grow px-1">
          <div className="flex items-center space-x-2 mb-3 text-xs font-bold tracking-widest uppercase text-gray-500">
            <span className="text-black">{post.username || post.author || "Editorial"}</span>
            <span className="text-gray-300">•</span>
            <span>{new Date(post.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
          </div>
          <h2 className="text-2xl font-serif font-bold text-gray-900 mb-3 leading-snug group-hover:text-black transition-colors">{post.title}</h2>
          <p className="text-gray-500 font-serif text-base leading-relaxed line-clamp-3 mb-4 flex-grow">{post.content}</p>
          <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-100">
            <span className="text-sm font-medium text-black flex items-center gap-1 group-hover:gap-3 transition-all duration-300">Read story <ArrowRight className="w-4 h-4" /></span>
          </div>
        </div>
      </article>
    </Link>
  );
};

const HomePage = () => {
  // State
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState("Initializing...");

  // Refs
  const isFetching = useRef(false);
  const sentinelRef = useRef(null);
  const observerRef = useRef(null);

  // MAIN FETCH FUNCTION
  const fetchPosts = async (pageNum, isReset = false) => {
    console.log(`🚀 [FETCH START] Page: ${pageNum}, isReset: ${isReset}, isFetching: ${isFetching.current}`);
    setDebugInfo(`Fetching page ${pageNum}...`);

    if (isFetching.current) {
      console.log('❌ BLOCKED: Already fetching');
      return;
    }

    if (!hasMore && !isReset && pageNum > 0) {
      console.log('❌ BLOCKED: No more posts');
      return;
    }

    isFetching.current = true;

    if (pageNum === 0) setLoading(true);
    else setLoadingMore(true);

    try {
      console.log(`📡 Making API call to /posts?page=${pageNum}`);
      const response = await api.get(`/posts?page=${pageNum}`);

      console.log('📨 Raw response:', response);
      console.log('📨 Response status:', response.status);
      console.log('📨 Response headers:', response.headers);
      console.log('📨 Response data type:', typeof response.data);
      console.log('📨 Response data:', response.data);

      let data = response.data;

      // Parse if string (from Redis cache)
      if (typeof data === 'string') {
        try {
          data = JSON.parse(data);
          console.log('✅ Parsed JSON string');
        } catch (e) {
          console.error('❌ Failed to parse JSON:', e);
          throw new Error('Invalid JSON response');
        }
      }

      console.log('📦 Processed data:', data);

      // Extract content
      const contentArray = data.content || [];
      const isLast = data.last === true;
      const totalElements = data.totalElements || 0;

      console.log(`📊 Content length: ${contentArray.length}, isLast: ${isLast}, total: ${totalElements}`);

      if (!Array.isArray(contentArray)) {
        console.error('❌ Content is not an array:', contentArray);
        throw new Error('Invalid response format: content is not array');
      }

      if (contentArray.length === 0) {
        console.log('⚠️ Empty content array');
        setHasMore(false);
        if (isReset) setPosts([]);
      } else {
        if (isReset) {
          console.log(`✅ Setting ${contentArray.length} posts (reset)`);
          setPosts(contentArray);
        } else {
          console.log(`✅ Adding ${contentArray.length} posts to existing ${posts.length}`);
          setPosts(prev => {
            const existingIds = new Set(prev.map(p => p.id));
            const newPosts = contentArray.filter(p => !existingIds.has(p.id));
            console.log(`📝 Actually adding ${newPosts.length} new unique posts`);
            return [...prev, ...newPosts];
          });
        }
        setHasMore(!isLast);
        setError(null);
      }

      setDebugInfo(`Success: ${contentArray.length} posts loaded (Total: ${totalElements})`);

    } catch (err) {
      console.error("💥 FETCH ERROR:", err);
      console.error("Error details:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        statusText: err.response?.statusText
      });

      setError(err.response?.data?.message || err.message || "Failed to load posts");
      setHasMore(false);
      setDebugInfo(`Error: ${err.message}`);
    } finally {
      console.log('🏁 [FETCH END]');
      isFetching.current = false;
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // INITIAL LOAD
  useEffect(() => {
    console.log('🎬 Component mounted, loading page 0');
    fetchPosts(0, true);
  }, []); // Empty deps = only on mount

  // Handle page changes (for infinite scroll)
  useEffect(() => {
    if (page > 0) {
      console.log(`📄 Page changed to ${page}, fetching...`);
      fetchPosts(page, false);
    }
  }, [page]);

  // Search handler
  useEffect(() => {
    if (searchQuery === "") {
      const timer = setTimeout(() => {
        console.log('🔍 Search cleared, resetting');
        setPosts([]);
        setPage(0);
        setHasMore(true);
        fetchPosts(0, true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [searchQuery]);

  // Intersection Observer
  useEffect(() => {
    if (!sentinelRef.current) {
      console.log('⚠️ Sentinel ref not available');
      return;
    }

    if (searchQuery !== "") {
      console.log('🔍 Search active, observer disabled');
      return;
    }

    console.log('👁️ Setting up intersection observer');

    const observer = new IntersectionObserver((entries) => {
      console.log('👁️ Observer triggered:', entries[0].isIntersecting);
      if (entries[0].isIntersecting && hasMore && !isFetching.current) {
        console.log('➡️ Loading next page...');
        setPage(prev => prev + 1);
      }
    }, {
      rootMargin: '200px',
      threshold: 0
    });

    observer.observe(sentinelRef.current);
    observerRef.current = observer;

    return () => {
      console.log('🧹 Cleaning up observer');
      observer.disconnect();
    };
  }, [hasMore, searchQuery, loading]); // Recreate if hasMore, search, or loading changes

  const filteredPosts = searchQuery
    ? posts.filter(post => post.title?.toLowerCase().includes(searchQuery.toLowerCase()))
    : posts;

  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-900 font-sans selection:bg-black selection:text-white">
      <HomeHeader onSearch={setSearchQuery} />

      <main className="flex-grow w-full max-w-[1600px] mx-auto px-6 sm:px-8 lg:px-12 pb-4">

        <section className="pt-32 pb-20 max-w-4xl border-b border-gray-100 mb-12">
          <h1 className="text-5xl md:text-7xl font-serif font-medium tracking-tighter text-gray-900 mb-6 leading-[0.95]">Human stories & ideas.</h1>
          <p className="text-xl md:text-2xl text-gray-400 font-serif leading-relaxed max-w-2xl">A place to read, write, and deepen your understanding of the world.</p>
        </section>

        {/* Content */}
        {loading && posts.length === 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-20">
            {[1, 2, 3, 4, 5, 6].map((n) => <PostSkeleton key={n} />)}
          </div>
        )}

        {error && !loading && (
          <div className="text-center py-20 bg-red-50 rounded-lg">
            <p className="text-red-600 font-serif text-lg mb-2">{error}</p>
            <p className="text-red-400 text-sm mb-4">Check console for details</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && posts.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-500 font-serif text-lg">No posts found.</p>
            <button
              onClick={() => fetchPosts(0, true)}
              className="mt-4 px-4 py-2 bg-black text-white rounded"
            >
              Reload
            </button>
          </div>
        )}

        {posts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-24">
            {filteredPosts.map((post, index) => (
              <PostCard key={`${post.id}-${index}`} post={post} index={index} />
            ))}
          </div>
        )}

        Sentinel
        {!loading && hasMore && !searchQuery && (
          <div ref={sentinelRef} className="">
          </div>
        )}

        {loadingMore && (
          <div className="py-10 text-center">
            <div className="inline-flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-black rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-1.5 h-1.5 bg-black rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-1.5 h-1.5 bg-black rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        )}

        {!hasMore && posts.length > 0 && !searchQuery && (
          <div className="py-20 text-center border-t border-gray-100 mt-12">
            <p className="text-2xl font-serif italic text-gray-300">You have reached the end.</p>
          </div>
        )}
      </main>
      <Footer />

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeInUp { animation: fadeInUp 0.6s ease-out; }
      `}</style>
    </div>
  );
};

export default HomePage;