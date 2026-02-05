import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../axios";

const Comments = () => {
    const [comments, setComments] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    useEffect(() => {
        if (!token) {
            navigate("/login");
            return;
        }

        const fetchComments = async () => {
            try {
                const res = await api.get("/comments");
                setComments(res.data.content || res.data);
            } catch {
                setError("Unable to synchronize comment registry.");
            } finally {
                setLoading(false);
            }
        };

        fetchComments();
    }, [token, navigate]);

    const filteredComments = comments.filter(c =>
        c.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.username && c.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (c.blogPostTitle && c.blogPostTitle.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleDelete = async (id) => {
        if (!window.confirm("Permanent removal of this comment?")) return;

        try {
            await api.delete(`/comments/${id}`);
            setComments(prev => prev.filter(c => c.id !== id));
        } catch {
            setError("Decline: Could not delete record.");
        }
    };

    if (loading) return <LoadingScreen />;

    return (
        <div className="h-screen bg-[#fafafa] overflow-hidden font-sans text-slate-800">
            <div className="h-full px-8 md:px-16 py-10 flex flex-col">

                {/* Header */}
                <header className="border-b border-slate-200 pb-6 mb-6 flex flex-col md:flex-row justify-between items-end">
                    <div>
                        <h1 className="text-4xl font-light tracking-tight text-slate-900">
                            Audience
                            <span className="text-slate-300 mx-2">/</span>
                            <span className="font-medium text-blue-600">Feedback</span>
                        </h1>
                        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 mt-2">
                            Global Comment Registry
                        </p>
                    </div>

                    <div className="w-full md:w-80 mt-6 md:mt-0">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Filter by content or author…"
                            className="w-full bg-white border-b border-slate-200 py-2 text-sm focus:border-blue-500 outline-none placeholder:text-slate-300 italic"
                        />
                    </div>
                </header>

                {error && (
                    <div className="bg-red-50 text-red-500 p-3 mb-4 text-xs border border-red-100 italic text-center uppercase tracking-widest">
                        {error}
                    </div>
                )}

                {/* Comment List */}
                <section className="flex-1 overflow-y-auto pr-2 space-y-4">
                    {filteredComments.length === 0 && (
                        <div className="py-20 text-center">
                            <p className="text-sm text-slate-300 italic uppercase tracking-widest">
                                No matching feedback found
                            </p>
                        </div>
                    )}

                    {filteredComments.map(comment => (
                        <div
                            key={comment.id}
                            className="group bg-white border border-slate-100 rounded-2xl p-6 md:p-8 hover:shadow-sm transition flex flex-col md:flex-row justify-between items-start md:items-center"
                        >
                            <div className="flex-1 pr-8">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                                        {comment.username || "Anonymous"}
                                    </span>
                                    <span className="text-[10px] text-slate-300 uppercase">
                                        {comment.createdAt &&
                                            new Date(comment.createdAt).toLocaleDateString()}
                                    </span>
                                </div>

                                <Link to={`/admin/comments/${comment.id}`}>
                                    <p className="text-lg text-slate-700 leading-snug hover:text-blue-600 transition">
                                        “{comment.content}”
                                    </p>
                                </Link>

                                <p className="text-[11px] text-slate-400 mt-3 italic">
                                    On Post:{" "}
                                    <span className="text-slate-500 font-medium">
                                        {comment.blogPostTitle || "General Discussion"}
                                    </span>
                                </p>
                            </div>

                            <div className="flex gap-6 mt-6 md:mt-0 opacity-0 group-hover:opacity-100 transition">
                                <button
                                    onClick={() =>
                                        navigate(`/admin/comments/edit/${comment.id}`)
                                    }
                                    className="text-[11px] font-bold uppercase tracking-widest text-slate-400 hover:text-blue-600"
                                >
                                    Modify
                                </button>
                                <button
                                    onClick={() => handleDelete(comment.id)}
                                    className="text-[11px] font-bold uppercase tracking-widest text-slate-400 hover:text-red-500"
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    ))}
                </section>
            </div>
        </div>
    );
};

const LoadingScreen = () => (
    <div className="h-screen flex items-center justify-center bg-[#fafafa]">
        <div className="w-6 h-6 border-2 border-slate-200 border-t-blue-500 rounded-full animate-spin" />
    </div>
);

export default Comments;
