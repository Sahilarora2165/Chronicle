import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../axios";

const CommentDetail = () => {
    const { id } = useParams();
    const [comment, setComment] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    useEffect(() => {
        if (!token) { navigate("/login"); return; }

        const fetchComment = async () => {
            try {
                const response = await api.get(`/comments/${id}`);
                setComment(response.data);
            } catch (err) {
                setError("ENTRY_NOT_FOUND: UNABLE TO RETRIEVE COMMENT");
            } finally {
                setLoading(false);
            }
        };

        fetchComment();
    }, [id, token, navigate]);

    if (loading) return <LoadingScreen />;

    return (
        <div className="min-h-screen bg-white text-black font-sans p-6 md:p-12 lg:p-20">
            <div className="w-full flex flex-col">

                {/* Header Section */}
                <header className="mb-20 border-b-2 border-black pb-6 flex justify-between items-end">
                    <div>
                        <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase italic leading-none">
                            Comment
                        </h1>
                        <p className="font-mono text-xs tracking-[0.5em] uppercase text-gray-400 mt-4">
                            Registry Entry // ID: {id}
                        </p>
                    </div>
                    <button
                        onClick={() => navigate("/admin/comments")}
                        className="font-mono text-xs font-bold uppercase tracking-widest hover:italic"
                    >
                        [ Back to Registry ]
                    </button>
                </header>

                {error && (
                    <div className="bg-black text-white p-6 mb-12 font-mono text-sm uppercase tracking-widest text-center">
                        {error}
                    </div>
                )}

                {comment && (
                    <div className="w-full space-y-20">
                        {/* Main Quote / Content Section */}
                        <section className="max-w-5xl">
                            <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400 font-mono mb-6">
                                Content Body
                            </p>
                            <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
                                "{comment.content}"
                            </h2>
                        </section>

                        {/* Metadata Grid */}
                        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 border-y-2 border-black py-16">
                            <MetaItem label="Author" value={comment.username || "Anonymous"} />
                            <MetaItem label="Timestamp" value={new Date(comment.createdAt).toLocaleDateString()} />
                            <MetaItem label="Source Story" value={comment.blogPostTitle || "Unknown"} />
                            <MetaItem label="Post ID" value={comment.blogPostId || "N/A"} />
                        </section>

                        {/* Action Bar */}
                        <footer className="flex space-x-8 pt-10">
                            <button
                                onClick={() => navigate(`/admin/comments/edit/${comment.id}`)}
                                className="bg-black text-white px-10 py-4 font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors"
                            >
                                Edit Entry
                            </button>
                            <button
                                onClick={() => { if(window.confirm("CONFIRM_DELETION?")) console.log("Delete"); }}
                                className="border-2 border-black px-10 py-4 font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-all"
                            >
                                Delete Record
                            </button>
                        </footer>
                    </div>
                )}
            </div>
        </div>
    );
};

// Sub-component for clean metadata display
const MetaItem = ({ label, value }) => (
    <div className="font-mono">
        <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-2">{label}</p>
        <p className="text-xl font-bold uppercase tracking-tighter truncate">{value}</p>
    </div>
);

const LoadingScreen = () => (
    <div className="min-h-screen flex items-center justify-center bg-white font-mono">
        <p className="text-xs tracking-[1em] uppercase animate-pulse">Accessing Database...</p>
    </div>
);

export default CommentDetail;