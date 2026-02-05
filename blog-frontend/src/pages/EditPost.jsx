import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../axios";

const EditPost = () => {
    const { id } = useParams();
    const [post, setPost] = useState({ title: "", content: "", imageUrl: "" });
    const [imageFile, setImageFile] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    useEffect(() => {
        if (!token) {
            navigate("/login");
            return;
        }

        const fetchPost = async () => {
            try {
                const res = await api.get(`/posts/${id}`);
                setPost({
                    title: res.data.title || "",
                    content: res.data.content || "",
                    imageUrl: res.data.imageUrl || "",
                });
            } catch {
                setError("Failed to synchronize with the story database.");
            } finally {
                setLoading(false);
            }
        };

        fetchPost();
    }, [id, token, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append(
            "blogPost",
            JSON.stringify({ title: post.title, content: post.content })
        );
        if (imageFile) formData.append("file", imageFile);

        try {
            await api.put(`/posts/${id}`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            navigate(`/admin/posts/${id}`);
        } catch {
            setError("The system could not save your changes.");
        }
    };

    if (loading) return <LoadingScreen />;

    return (
        <div className="h-screen bg-[#fafafa] text-slate-800 overflow-hidden">
            <div className="h-full px-8 md:px-16 py-10 flex flex-col">

                {/* Header */}
                <header className="flex justify-between items-end border-b border-slate-200 pb-6 mb-6">
                    <div>
                        <h1 className="text-4xl font-light tracking-tight text-slate-900">
                            Edit Story
                            <span className="text-slate-300 mx-2">/</span>
                            <span className="font-medium text-blue-600 truncate max-w-[400px] inline-block align-bottom">
                                {post.title || "Untitled"}
                            </span>
                        </h1>
                        <p className="text-xs text-slate-400 mt-2 font-medium uppercase tracking-[0.2em]">
                            Full Content Editor
                        </p>
                    </div>
                    <button
                        onClick={() => navigate(`/admin/posts/${id}`)}
                        className="text-[11px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900"
                    >
                        Return to Post
                    </button>
                </header>

                {error && (
                    <div className="bg-red-50 text-red-500 p-4 mb-4 text-sm rounded-lg border border-red-100 text-center italic">
                        {error}
                    </div>
                )}

                {/* FORM */}
                <form
                    onSubmit={handleSubmit}
                    className="flex-1 flex flex-col overflow-hidden"
                >
                    {/* Meta row */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-6">
                        <div className="lg:col-span-2">
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">
                                Post Title
                            </label>
                            <input
                                type="text"
                                value={post.title}
                                onChange={(e) =>
                                    setPost({ ...post, title: e.target.value })
                                }
                                className="w-full bg-white border-b border-slate-200 py-3 text-2xl font-semibold focus:border-blue-500 outline-none"
                                placeholder="Enter a compelling title…"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">
                                Visual Asset
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setImageFile(e.target.files[0])}
                                className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-5 file:rounded-full file:border-0 file:text-[10px] file:font-bold file:uppercase file:bg-slate-100 file:text-slate-600 hover:file:bg-slate-200 cursor-pointer"
                            />
                        </div>
                    </div>

                    {/* Editor */}
                    <div className="flex-1 flex flex-col overflow-hidden mb-6">
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">
                            Story Content
                        </label>
                        <textarea
                            value={post.content}
                            onChange={(e) =>
                                setPost({ ...post, content: e.target.value })
                            }
                            className="flex-1 w-full bg-white border border-slate-200 rounded-2xl p-8 text-lg leading-relaxed focus:ring-4 focus:ring-blue-50 focus:border-blue-200 outline-none resize-none overflow-y-auto"
                            placeholder="Begin writing…"
                        />
                    </div>

                    {/* Footer */}
                    <footer className="border-t border-slate-200 pt-5 flex justify-between items-center">
                        <div className="text-[10px] font-mono text-slate-400 uppercase">
                            Char Count: {post.content.length.toLocaleString()}
                        </div>
                        <div className="flex gap-6">
                            <button
                                type="button"
                                onClick={() => navigate(`/admin/posts/${id}`)}
                                className="text-sm text-slate-400 hover:text-slate-900"
                            >
                                Discard
                            </button>
                            <button
                                type="submit"
                                className="bg-slate-900 text-white px-10 py-3 rounded-full text-xs font-semibold uppercase tracking-widest hover:bg-blue-600 transition"
                            >
                                Update Story
                            </button>
                        </div>
                    </footer>
                </form>
            </div>
        </div>
    );
};

const LoadingScreen = () => (
    <div className="h-screen flex items-center justify-center bg-[#fafafa]">
        <div className="w-8 h-8 border-2 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
    </div>
);

export default EditPost;
