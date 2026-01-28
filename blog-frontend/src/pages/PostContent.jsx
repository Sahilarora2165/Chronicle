import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom"; // Added Link import
import ReactMarkdown from "react-markdown";
import api from "../axios";
import HomeHeader from "../components/HomeHeader";
import { MessageCircle, X, ThumbsUp, Clock, ArrowLeft } from "lucide-react";
import remarkBreaks from "remark-breaks";

// 1. Article Skeleton Loader (Premium Feel)
const ArticleSkeleton = () => (
    <div className="max-w-[700px] mx-auto pt-32 px-6 animate-pulse">
        <div className="h-4 bg-gray-200 w-24 rounded mb-6"></div>
        <div className="h-12 bg-gray-200 w-3/4 rounded mb-4"></div>
        <div className="h-12 bg-gray-200 w-1/2 rounded mb-10"></div>

        <div className="flex items-center gap-4 mb-10">
            <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
            <div className="space-y-2">
                <div className="h-3 bg-gray-200 w-32 rounded"></div>
                <div className="h-3 bg-gray-200 w-24 rounded"></div>
            </div>
        </div>

        <div className="w-full h-[400px] bg-gray-200 rounded-lg mb-12"></div>

        <div className="space-y-4">
            <div className="h-4 bg-gray-200 w-full rounded"></div>
            <div className="h-4 bg-gray-200 w-full rounded"></div>
            <div className="h-4 bg-gray-200 w-5/6 rounded"></div>
            <div className="h-4 bg-gray-200 w-full rounded"></div>
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

        // Lock body scroll when comments are open
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
        <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-black selection:text-white">

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
                    className="flex items-center text-sm text-gray-400 hover:text-black mb-8 transition-colors group"
                >
                    <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Back to feed
                </button>

                {/* Header */}
                <header className="mb-10">
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold text-gray-900 leading-[1.1] mb-8 tracking-tight">
                        {post.title}
                    </h1>

                    {/* Meta Bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between py-6 border-t border-b border-gray-100 gap-6">

                        {/* Author Info - Now Clickable */}
                        <div className="flex items-center gap-3">
                            {/* Avatar Link */}
                            <Link
                                to={`/profile/${post.userId}`}
                                className="block w-10 h-10 rounded-full bg-black flex items-center justify-center text-white font-serif font-bold text-sm hover:opacity-80 transition-opacity"
                            >
                                {post.username ? post.username[0].toUpperCase() : "A"}
                            </Link>

                            <div className="flex flex-col">
                                {/* Name Link */}
                                <Link
                                    to={`/profile/${post.userId}`}
                                    className="text-sm font-bold text-gray-900 hover:underline underline-offset-2 decoration-gray-400"
                                >
                                    {post.username || "Unknown Author"}
                                </Link>

                                <div className="flex items-center text-xs text-gray-500 gap-2">
                                    <span>{new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                    <span>•</span>
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
                                className={`flex items-center gap-2 text-sm font-medium transition-colors ${liked ? 'text-black' : 'hover:text-black'}`}
                            >
                                <ThumbsUp className={`w-5 h-5 ${liked ? 'fill-black' : ''}`} />
                                <span>{likes}</span>
                            </button>

                            <button
                                onClick={() => setShowComments(true)}
                                className="flex items-center gap-2 text-sm font-medium hover:text-black transition-colors"
                            >
                                <MessageCircle className="w-5 h-5" />
                                <span>{comments.length}</span>
                            </button>
                        </div>
                    </div>
                </header>

                {/* Hero Image */}
                {heroImage && (
                    <figure className="mb-14 -mx-6 sm:mx-0">
                        <div className="overflow-hidden sm:rounded-md shadow-sm bg-gray-50">
                            <img
                                src={heroImage}
                                alt={post.title}
                                className="w-full h-auto object-cover"
                                loading="lazy"
                            />
                        </div>
                        {post.imageCaption && (
                            <figcaption className="mt-3 text-center text-xs text-gray-400 font-sans">
                                {post.imageCaption}
                            </figcaption>
                        )}
                    </figure>
                )}

                {/* 3. Article Content (Typography Engine) */}
                <article className="prose prose-lg prose-gray max-w-none
                    prose-headings:font-serif prose-headings:font-bold prose-headings:text-gray-900
                    prose-p:font-serif prose-p:text-gray-800 prose-p:leading-[1.8] prose-p:text-[18px]
                    prose-a:text-black prose-a:underline hover:prose-a:text-gray-600
                    prose-blockquote:border-l-2 prose-blockquote:border-black prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:font-serif prose-blockquote:text-gray-900
                    prose-img:rounded-md prose-img:my-8
                ">
                    <ReactMarkdown remarkPlugins={[remarkBreaks]}>
                        {post.content}
                    </ReactMarkdown>
                </article>
            </main>

            {/* 4. Sliding Comments Drawer */}
            {showComments && (
                <div className="fixed inset-0 z-[100] overflow-hidden">
                    <div
                        className="absolute inset-0 bg-black/20 backdrop-blur-[2px] transition-opacity"
                        onClick={() => setShowComments(false)}
                    />

                    <div className="absolute inset-y-0 right-0 max-w-md w-full bg-white shadow-2xl transform transition-transform duration-300 ease-out flex flex-col">
                        {/* Drawer Header */}
                        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-white">
                            <h2 className="text-xl font-serif font-bold text-gray-900">
                                Responses ({comments.length})
                            </h2>
                            <button
                                onClick={() => setShowComments(false)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Comments List */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-8">
                            {comments.length > 0 ? (
                                comments.map((comment) => (
                                    <div key={comment.id} className="group">
                                        <div className="flex items-start gap-3 mb-2">
                                            {/* Comment Avatar - Also Linked */}
                                            <Link to={`/profile/${comment.userId}`} className="shrink-0">
                                                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-xs font-bold text-gray-600 hover:bg-gray-200 transition-colors">
                                                    {comment.username ? comment.username[0].toUpperCase() : "?"}
                                                </div>
                                            </Link>

                                            <div className="flex-1">
                                                <div className="flex items-baseline justify-between">
                                                    <Link
                                                        to={`/profile/${comment.userId}`}
                                                        className="text-sm font-bold text-gray-900 hover:underline"
                                                    >
                                                        {comment.username || "Anonymous"}
                                                    </Link>
                                                    <span className="text-xs text-gray-400">
                                                        {new Date(comment.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <p className="text-gray-700 text-sm mt-1 leading-relaxed font-serif">
                                                    {comment.content}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-20">
                                    <p className="text-gray-400 font-serif italic">No responses yet.</p>
                                </div>
                            )}
                        </div>

                        {/* Input Area */}
                        <div className="p-6 border-t border-gray-100 bg-white">
                            <form onSubmit={handleCommentSubmit} className="relative">
                                <textarea
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="What are your thoughts?"
                                    className="w-full bg-gray-50 rounded-xl p-4 text-sm outline-none focus:ring-1 focus:ring-black min-h-[100px] resize-none"
                                />
                                <div className="flex justify-end mt-3">
                                    <button
                                        type="submit"
                                        disabled={!newComment.trim()}
                                        className="bg-black text-white px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wide hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Publish
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PostContent;