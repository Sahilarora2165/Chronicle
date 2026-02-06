import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import api from "../axios";
import HomeHeader from "../components/HomeHeader";
import { MessageCircle, X, ThumbsUp, Clock, ArrowLeft } from "lucide-react";
import remarkBreaks from "remark-breaks";

// 1. Cinematic Skeleton Loader
const ArticleSkeleton = () => (
    <div className="max-w-[720px] mx-auto pt-32 px-6 animate-pulse">
        {/* Back button placeholder */}
        <div className="h-4 bg-gray-100 w-24 rounded mb-10"></div>

        {/* Title */}
        <div className="space-y-4 mb-8">
            <div className="h-10 md:h-14 bg-gray-100 w-full rounded-sm"></div>
            <div className="h-10 md:h-14 bg-gray-100 w-2/3 rounded-sm"></div>
        </div>

        {/* Meta Bar */}
        <div className="flex items-center gap-4 mb-10 py-6 border-y border-gray-50">
            <div className="w-10 h-10 bg-gray-100 rounded-full"></div>
            <div className="space-y-2">
                <div className="h-2.5 bg-gray-100 w-32 rounded"></div>
                <div className="h-2.5 bg-gray-100 w-20 rounded"></div>
            </div>
        </div>

        {/* Hero Image */}
        <div className="w-full aspect-[3/2] bg-gray-100 mb-12 rounded-sm"></div>

        {/* Text Body */}
        <div className="space-y-6">
            <div className="h-4 bg-gray-100 w-full rounded"></div>
            <div className="h-4 bg-gray-100 w-full rounded"></div>
            <div className="h-4 bg-gray-100 w-5/6 rounded"></div>
            <div className="h-4 bg-gray-100 w-full rounded"></div>
        </div>
    </div>
);

const PostContent = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // State variables
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [likes, setLikes] = useState(0);
    const [liked, setLiked] = useState(false);
    const [newComment, setNewComment] = useState("");
    const [showComments, setShowComments] = useState(false);
    const [scrollProgress, setScrollProgress] = useState(0);
    const [imageLoaded, setImageLoaded] = useState(false); // For smooth image fade-in

    const token = localStorage.getItem("token");

    // Reading Time Calculator
    const readingTime = useMemo(() => {
        if (!post?.content) return "";
        const wordsPerMinute = 200;
        const words = post.content.trim().split(/\s+/).length;
        const minutes = Math.ceil(words / wordsPerMinute);
        return `${minutes} min read`;
    }, [post?.content]);

    // Scroll Progress Logic
    useEffect(() => {
        const handleScroll = () => {
            const totalScroll = document.documentElement.scrollTop;
            const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scroll = `${totalScroll / windowHeight}`;
            setScrollProgress(Number(scroll));
        };

        window.addEventListener('scroll', handleScroll);

        if (showComments) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }

        return () => {
            window.removeEventListener('scroll', handleScroll);
            document.body.style.overflow = 'auto';
        };
    }, [showComments]);

    // Fetch Data
    useEffect(() => {
        const fetchPostAndComments = async () => {
            setLoading(true);
            try {
                const [postRes, commentsRes] = await Promise.all([
                    api.get(`/posts/${id}`),
                    api.get(`/comments/blog/${id}`)
                ]);
                setPost(postRes.data);
                setComments(commentsRes.data || []);
            } catch (err) {
                console.error("Error fetching data:", err);
                setError(err.response?.status === 404 ? "Story not found." : "Something went wrong.");
            } finally {
                setLoading(false);
            }
        };
        fetchPostAndComments();
    }, [id]);

    // Fetch Likes
    useEffect(() => {
        const fetchLikes = async () => {
            try {
                const likesRes = await api.get(`/likes/count/${id}`);
                setLikes(Number(likesRes.data));

                if (token) {
                    const userRes = await api.get("/users/me");
                    const userLikeRes = await api.get(`/likes/status`, {
                        params: { userId: userRes.data.id, blogPostId: id }
                    });
                    setLiked(userLikeRes.data);
                }
            } catch (err) {
                console.error("Error fetching likes", err);
            }
        };
        fetchLikes();
    }, [id, token]);

    // Handlers
    const handleLikeToggle = async () => {
        if (!token) return navigate("/login");
        const previousLiked = liked;
        const previousLikes = likes;

        setLiked(!liked);
        setLikes(prev => prev + (liked ? -1 : 1));

        try {
            const userRes = await api.get("/users/me");
            await api.post("/likes/toggle", null, {
                params: { userId: userRes.data.id, blogPostId: id }
            });
        } catch (err) {
            setLiked(previousLiked);
            setLikes(previousLikes);
        }
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!token) return navigate("/login");
        if (!newComment.trim()) return;

        try {
            const userRes = await api.get("/users/me");
            const res = await api.post("/comments", newComment, {
                headers: { "Content-Type": "text/plain" },
                params: { userId: userRes.data.id, blogPostId: id }
            });
            setComments([...comments, res.data]);
            setNewComment("");
        } catch (err) {
            console.error("Comment failed", err);
        }
    };

    if (loading) return <ArticleSkeleton />;

    if (error || !post) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
                <p className="text-gray-900 font-serif text-2xl mb-4">{error || "Story not found."}</p>
                <button onClick={() => navigate(-1)} className="text-sm border-b border-black pb-1 hover:opacity-70">
                    Return home
                </button>
            </div>
        );
    }

    const heroImage = post.imageUrl;

    return (
        <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-black selection:text-white animate-fadeIn">

            {/* 2. Reading Progress Bar */}
            <div className="fixed top-0 left-0 w-full h-1 bg-transparent z-[60]">
                <div
                    className="h-full bg-black transition-all duration-100 ease-out"
                    style={{ width: `${scrollProgress * 100}%` }}
                />
            </div>

            <HomeHeader />

            <main className="max-w-[720px] mx-auto pt-32 pb-32 px-6">

                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="group flex items-center text-sm font-medium text-gray-400 hover:text-black mb-10 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:-translate-x-1" />
                    Back to feed
                </button>

                {/* Header Section */}
                <header className="mb-10">
                    {/* Title - Large & Serif */}
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-medium text-gray-900 leading-[1.1] mb-8 tracking-tight">
                        {post.title}
                    </h1>

                    {/* Meta Bar - Clean Borders */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between py-6 border-t border-b border-gray-100 gap-6">

                        {/* Author Info */}
                        <div className="flex items-center gap-3">
                            <Link
                                to={`/profile/${post.userId}`}
                                className="block w-10 h-10 rounded-full bg-black flex items-center justify-center text-white font-serif font-bold text-sm hover:opacity-80 transition-opacity"
                            >
                                {post.username ? post.username[0].toUpperCase() : "A"}
                            </Link>

                            <div className="flex flex-col">
                                <Link
                                    to={`/profile/${post.userId}`}
                                    className="text-sm font-bold text-gray-900 hover:underline underline-offset-2 decoration-gray-300 transition-all"
                                >
                                    {post.username || "Unknown Author"}
                                </Link>

                                <div className="flex items-center text-xs font-medium tracking-wide text-gray-500 gap-2 mt-0.5">
                                    <span>{new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                    <span className="text-gray-300">•</span>
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {readingTime}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-6 text-gray-400">
                            <button
                                onClick={handleLikeToggle}
                                className={`group flex items-center gap-2 text-sm font-medium transition-colors duration-300 ${liked ? 'text-black' : 'hover:text-black'}`}
                            >
                                <ThumbsUp className={`w-5 h-5 transition-transform duration-300 group-active:scale-125 ${liked ? 'fill-black' : ''}`} />
                                <span>{likes}</span>
                            </button>

                            <button
                                onClick={() => setShowComments(true)}
                                className="group flex items-center gap-2 text-sm font-medium hover:text-black transition-colors duration-300"
                            >
                                <MessageCircle className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
                                <span>{comments.length}</span>
                            </button>
                        </div>
                    </div>
                </header>

                {/* Hero Image - Smooth Load & Shadow */}
                {heroImage && (
                    <figure className="mb-14 -mx-6 sm:-mx-8">
                        <div className="overflow-hidden sm:rounded-sm shadow-sm bg-gray-50 relative aspect-[3/2] sm:aspect-[16/9]">
                            <img
                                src={heroImage}
                                alt={post.title}
                                className={`w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
                                    imageLoaded ? 'opacity-100' : 'opacity-0'
                                }`}
                                loading="lazy"
                                onLoad={() => setImageLoaded(true)}
                            />
                        </div>
                        {post.imageCaption && (
                            <figcaption className="mt-3 text-center text-xs text-gray-400 font-sans tracking-wide">
                                {post.imageCaption}
                            </figcaption>
                        )}
                    </figure>
                )}

                {/* 3. Article Content (Typography Engine) */}
                <article className="prose prose-lg prose-gray max-w-none
                    prose-headings:font-serif prose-headings:font-medium prose-headings:text-gray-900 prose-headings:tracking-tight
                    prose-p:font-serif prose-p:text-gray-800 prose-p:leading-[1.8] prose-p:text-[19px] prose-p:font-light
                    prose-a:text-black prose-a:underline prose-a:decoration-1 prose-a:underline-offset-4 hover:prose-a:decoration-2 hover:prose-a:text-gray-600 prose-a:transition-all
                    prose-blockquote:border-l-2 prose-blockquote:border-black prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:font-serif prose-blockquote:text-2xl prose-blockquote:text-gray-900 prose-blockquote:leading-snug
                    prose-img:rounded-sm prose-img:shadow-sm prose-img:my-10
                    prose-strong:font-bold prose-strong:text-gray-900
                ">
                    <ReactMarkdown remarkPlugins={[remarkBreaks]}>
                        {post.content}
                    </ReactMarkdown>
                </article>

                {/* Footer Divider */}
                <div className="mt-20 pt-10 border-t border-gray-100 flex justify-center">
                    <div className="w-1.5 h-1.5 bg-black rounded-full" />
                </div>
            </main>

            {/* 4. Sliding Comments Drawer - Cinematic Transition */}
            {showComments && (
                <div className="fixed inset-0 z-[100] flex justify-end">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-white/60 backdrop-blur-sm transition-opacity duration-500"
                        onClick={() => setShowComments(false)}
                    />

                    {/* Drawer */}
                    <div className="relative w-full max-w-md bg-white shadow-2xl h-full flex flex-col animate-slideInRight border-l border-gray-100">
                        {/* Drawer Header */}
                        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-white z-10">
                            <h2 className="text-xl font-serif font-bold text-gray-900">
                                Responses ({comments.length})
                            </h2>
                            <button
                                onClick={() => setShowComments(false)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:rotate-90 duration-300"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Comments List */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-8">
                            {comments.length > 0 ? (
                                comments.map((comment) => (
                                    <div key={comment.id} className="group animate-fadeIn">
                                        <div className="flex items-start gap-3 mb-2">
                                            <Link to={`/profile/${comment.userId}`} className="shrink-0">
                                                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-xs font-bold text-gray-600 hover:bg-black hover:text-white transition-colors duration-300">
                                                    {comment.username ? comment.username[0].toUpperCase() : "?"}
                                                </div>
                                            </Link>

                                            <div className="flex-1">
                                                <div className="flex items-baseline justify-between">
                                                    <Link
                                                        to={`/profile/${comment.userId}`}
                                                        className="text-sm font-bold text-gray-900 hover:underline decoration-1 underline-offset-2"
                                                    >
                                                        {comment.username || "Anonymous"}
                                                    </Link>
                                                    <span className="text-xs text-gray-400">
                                                        {new Date(comment.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                    </span>
                                                </div>
                                                <p className="text-gray-700 text-sm mt-2 leading-relaxed font-serif">
                                                    {comment.content}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                                    <MessageCircle className="w-8 h-8 mb-3 text-gray-300" />
                                    <p className="text-gray-400 font-serif italic">No responses yet.</p>
                                </div>
                            )}
                        </div>

                        {/* Input Area */}
                        <div className="p-6 border-t border-gray-100 bg-white z-10">
                            <form onSubmit={handleCommentSubmit} className="relative">
                                <textarea
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="What are your thoughts?"
                                    className="w-full bg-gray-50 rounded-lg p-4 text-sm font-serif outline-none focus:bg-white focus:ring-1 focus:ring-black/20 transition-all min-h-[100px] resize-none placeholder:text-gray-400 placeholder:italic"
                                />
                                <div className="flex justify-end mt-3">
                                    <button
                                        type="submit"
                                        disabled={!newComment.trim()}
                                        className="bg-black text-white px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                    >
                                        Publish
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Animation Styles */}
            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.8s ease-out forwards;
                }

                @keyframes slideInRight {
                    from { transform: translateX(100%); }
                    to { transform: translateX(0); }
                }
                .animate-slideInRight {
                    animation: slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
            `}</style>
        </div>
    );
};

export default PostContent;