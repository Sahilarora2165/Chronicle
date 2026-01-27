import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import api from "../axios";
import HomeHeader from "../components/HomeHeader"; // Make sure this imports the NEW Header
import Footer from "../components/Footer";

const HomePage = () => {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");

  const isFetching = useRef(false);

  const fetchPosts = async (pageNum, isReset = false) => {
    if (isFetching.current || (!hasMore && !isReset)) return;

    isFetching.current = true;
    if (pageNum === 0) setLoading(true);

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
        const postsWithRandomHeight = contentArray.map(post => ({
          ...post,
          cardHeight: 420,
        }));

        if (isReset) {
          setPosts(postsWithRandomHeight);
          setPage(0);
          setHasMore(true);
        } else {
          setPosts(prev => [...prev, ...postsWithRandomHeight]);
        }
      }
      setError("");
    } catch (err) {
      console.error("Error fetching posts:", err);
      setError("Failed to load posts. Please try again later.");
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  };

  useEffect(() => {
    fetchPosts(0);
  }, []);

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

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop + 200 >=
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

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-900 font-sans selection:bg-black selection:text-white">
      <HomeHeader onSearch={setSearchQuery} />

      {/*
         FIX FOR OVERLAP:
         Added 'pt-32' (padding top) to this main container.
         Since your Header is fixed with height 'h-20' (80px) + some border/padding,
         pt-32 (128px) gives it plenty of breathing room.
      */}
      <main className="flex-grow max-w-[1600px] mx-auto w-full px-4 sm:px-8 lg:px-12 pt-32 pb-20">

        {/* Hero Section */}
        <div className="mb-16 text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-serif font-medium tracking-tight mb-4 text-gray-900">
            Stories & Ideas
          </h1>
          <p className="text-lg md:text-xl text-gray-500 font-light leading-relaxed">
            A collection of thoughts, design, and technology.
          </p>
        </div>

        {loading && posts.length === 0 ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : error && posts.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            {error}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {filteredPosts.map((post) => (
              <Link
                key={post.id}
                to={`/posts/${post.id}`}
                className="group flex flex-col h-full"
              >
                <article className="flex flex-col h-full border border-gray-100 rounded-2xl overflow-hidden bg-white hover:shadow-lg hover:shadow-gray-200/50 hover:border-gray-200 transition-all duration-500 ease-out">

                  {/* Image Section */}
                  <div className="relative w-full aspect-[4/3] bg-gray-50 overflow-hidden">
                    <img
                      src={post.imageUrl || "https://images.unsplash.com/photo-1499750310159-5b9f4b9cf29d?q=80&w=1000&auto=format&fit=crop"}
                      alt={post.title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500" />
                  </div>

                  {/* Content Section */}
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex items-center space-x-2 mb-4">
                      <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600">
                        {(post.username || post.author || "A").charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-gray-900 uppercase tracking-wide">
                          {post.username || post.author || "Unknown Author"}
                        </span>
                        <span className="text-[10px] text-gray-400 font-medium">
                          {new Date(post.createdAt).toLocaleDateString("en-US", {
                            month: "short", day: "numeric"
                          })}
                        </span>
                      </div>
                    </div>

                    <h2 className="text-xl font-serif font-semibold text-gray-900 leading-tight mb-3 group-hover:underline decoration-1 underline-offset-4 decoration-gray-300">
                      {post.title}
                    </h2>

                    <p className="text-gray-500 font-light text-sm leading-relaxed line-clamp-3 mb-4 flex-grow">
                      {post.content}
                    </p>

                    <div className="pt-4 border-t border-gray-50 mt-auto flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
                      <span className="text-xs font-semibold text-gray-900">Read article</span>
                      <svg className="w-4 h-4 text-gray-900 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
                      </svg>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}

        {/* Infinite Scroll Loader */}
        {!loading && hasMore && searchQuery === "" && (
          <div className="py-12 text-center">
            <div className="inline-flex items-center space-x-2 text-gray-400 text-sm">
              <span>Load more stories</span>
              <svg className="w-4 h-4 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
              </svg>
            </div>
          </div>
        )}

        {isFetching.current && posts.length > 0 && (
           <div className="py-12 text-center">
             <div className="inline-flex items-center space-x-2">
               <div className="w-2 h-2 bg-gray-900 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
               <div className="w-2 h-2 bg-gray-900 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
               <div className="w-2 h-2 bg-gray-900 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
             </div>
           </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default HomePage;