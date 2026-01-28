import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import api from "../axios";
import HomeHeader from "../components/HomeHeader";
import Footer from "../components/Footer";
import { ArrowRight, Quote, Clock } from "lucide-react";

// 1. Minimal Skeleton Loader (Updated to match new aspect ratios)
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


// 3. Helper: Generate Pastel Color (kept your logic, refined colors)
const generatePastelColor = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = hash % 360;
  return `hsl(${h}, 20%, 94%)`; // Lower saturation for a more "paper-like" feel
};

const HomePage = () => {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");

  const isFetching = useRef(false);

  // Logic: Fetch Posts
  const fetchPosts = async (pageNum, isReset = false) => {
    if (isFetching.current || (!hasMore && !isReset)) return;

    isFetching.current = true;
    if (pageNum === 0) setLoading(true);
    else setLoadingMore(true);

    try {
      const response = await api.get(`/posts?page=${pageNum}`);
      let fetchedPosts = response.data;

      if (typeof response.data === 'string') {
        fetchedPosts = JSON.parse(response.data);
      }

      const contentArray = Array.isArray(fetchedPosts) ? fetchedPosts : (fetchedPosts.content || []);

      if (contentArray.length === 0) {
        setHasMore(false);
      } else {
        if (isReset) {
          setPosts(contentArray);
          setPage(0);
          setHasMore(true);
        } else {
          setPosts(prev => [...prev, ...contentArray]);
        }
      }
      setError("");
    } catch (err) {
      console.error("Error fetching posts:", err);
      setError("Failed to load stories.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
      isFetching.current = false;
    }
  };

  useEffect(() => {
    fetchPosts(0);
  }, []);

  // Logic: Search Debounce
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim() === "") {
        setPage(0);
        setHasMore(true);
        fetchPosts(0, true);
      }
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Logic: Infinite Scroll
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop + 300 >=
        document.documentElement.offsetHeight
      ) {
        if (searchQuery === "" && hasMore && !isFetching.current) {
          const nextPage = page + 1;
          setPage(nextPage);
          fetchPosts(nextPage);
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [page, hasMore, searchQuery]);

  // Filter for search
  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-900 font-sans selection:bg-black selection:text-white">
      <HomeHeader onSearch={setSearchQuery} />

      <main className="flex-grow w-full max-w-[1600px] mx-auto px-6 sm:px-8 lg:px-12 pb-4">

        {/* 4. Editorial Hero Section - The "Manifesto" */}
        <section className="pt-32 pb-20 max-w-4xl border-b border-gray-100 mb-12">
          <h1 className="text-5xl md:text-7xl font-serif font-medium tracking-tighter text-gray-900 mb-6 leading-[0.95]">
             Human stories & ideas.
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 font-serif leading-relaxed max-w-2xl">
            A place to read, write, and deepen your understanding of the world.
          </p>
        </section>

        {/* 5. Content Grid */}
        {loading && posts.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16">
            {[1, 2, 3, 4, 5, 6].map((n) => <PostSkeleton key={n} />)}
          </div>
        ) : error && posts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 font-serif text-lg">{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-20">
            {filteredPosts.map((post) => {
              const hasImage = post.imageUrl && post.imageUrl.trim() !== "";
              const fallbackColor = generatePastelColor(post.title + post.id);

              return (
                <Link
                  key={post.id}
                  to={`/posts/${post.id}`}
                  className="group block h-full cursor-pointer"
                >
                  <article className="flex flex-col h-full">
                    {/* Image Area - Cinematic Aspect Ratio */}
                    <div className="relative w-full aspect-[3/2] overflow-hidden bg-gray-50 mb-6 border border-gray-100 group-hover:border-gray-200 transition-colors">
                      {hasImage ? (
                        <img
                          src={post.imageUrl}
                          alt={post.title}
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
                        />
                      ) : (
                        // Fallback: Elegant Typography
                        <div
                          className="w-full h-full flex flex-col items-center justify-center p-8 text-center transition-transform duration-700 group-hover:scale-105"
                          style={{ backgroundColor: fallbackColor }}
                        >
                          <Quote className="w-8 h-8 text-black/10 mb-4" />
                          <div className="max-w-[80%]">
                            <h3 className="text-lg font-serif font-bold text-gray-900 leading-tight line-clamp-3 opacity-40">
                              {post.title}
                            </h3>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex flex-col flex-grow">
                      {/* Meta Data: Author & Date */}
                      <div className="flex items-center space-x-2 mb-3 text-xs font-bold tracking-wider uppercase text-gray-500">
                        <span className="text-black">
                          {post.username || post.author || "Editorial"}
                        </span>
                        <span className="text-gray-300">•</span>
                        <span>
                          {new Date(post.createdAt).toLocaleDateString("en-US", {
                            month: "short", day: "numeric"
                          })}
                        </span>
                      </div>

                      {/* Title - Large & Serif */}
                      <h2 className="text-2xl font-serif font-bold text-gray-900 mb-3 leading-snug group-hover:underline decoration-1 decoration-gray-300 underline-offset-4 transition-all">
                        {post.title}
                      </h2>

                      {/* Excerpt */}
                      <p className="text-gray-500 font-serif text-base leading-relaxed line-clamp-3 mb-4 flex-grow">
                        {post.content}
                      </p>

                      {/* Footer: Read Time & Action */}
                      <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-100">

                         <span className="text-sm font-medium text-black flex items-center gap-1 group-hover:gap-2 transition-all">
                            Read story <ArrowRight className="w-4 h-4" />
                         </span>
                      </div>
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>
        )}

        {/* Infinite Scroll Loader */}
        {loadingMore && (
          <div className="py-20 text-center">
            <div className="inline-flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-black rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-1.5 h-1.5 bg-black rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-1.5 h-1.5 bg-black rounded-full animate-bounce"></div>
            </div>
          </div>
        )}

        {/* End of Feed Marker */}
        {!loading && !hasMore && posts.length > 0 && searchQuery === "" && (
          <div className="py-20 text-center border-t border-gray-100 mt-12">
            <p className="text-2xl font-serif italic text-gray-300">You have reached the end.</p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;