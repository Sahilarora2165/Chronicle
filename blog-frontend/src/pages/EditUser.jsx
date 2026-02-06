import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../axios";

const EditUser = () => {
    const { id } = useParams();
    const [user, setUser] = useState({ username: "", email: "", bio: "", profilePicture: null });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    useEffect(() => {
        if (!token) { navigate("/login"); return; }

        const fetchUser = async () => {
            try {
                const response = await api.get(`/users/${id}`);
                setUser({
                    username: response.data.username,
                    email: response.data.email,
                    bio: response.data.bio || "",
                    profilePicture: null,
                });
            } catch (err) {
                setError("Unable to retrieve user records.");
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [id, token, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("username", user.username);
        formData.append("email", user.email);
        formData.append("bio", user.bio || "");
        if (user.profilePicture instanceof File) {
            formData.append("profilePicture", user.profilePicture);
        }

        try {
            await api.put(`/users/${id}`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            navigate(`/admin/users/${id}`);
        } catch (err) {
            setError("Update failed. Please try again.");
        }
    };

    if (loading) return <LoadingScreen />;

    return (
        <div className="min-h-screen bg-[#fafafa] text-slate-900 font-sans selection:bg-blue-100">
            {/* Full Width Container */}
            <div className="w-full px-8 md:px-16 py-12">

                {/* Minimal Header */}
                <header className="mb-16 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-light tracking-tight text-slate-800">
                            Edit Profile <span className="text-slate-300 mx-2">/</span>
                            <span className="font-medium text-blue-600">{user.username}</span>
                        </h1>
                        <p className="text-sm text-slate-400 mt-1 font-light tracking-wide">Update system identity and permissions</p>
                    </div>
                    <button
                        onClick={() => navigate(`/admin/users/${id}`)}
                        className="text-xs font-semibold uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors"
                    >
                        Discard Changes
                    </button>
                </header>

                {error && (
                    <div className="bg-red-50 text-red-500 p-4 mb-8 text-sm rounded-lg border border-red-100 italic text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="w-full">
                    {/* Sleek Form Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-16 gap-y-12">

                        {/* Section: Basic Info */}
                        <div className="space-y-8">
                            <div>
                                <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-3">Account Username</label>
                                <input
                                    type="text"
                                    value={user.username}
                                    onChange={(e) => setUser({ ...user, username: e.target.value })}
                                    className="w-full bg-white border-b border-slate-200 py-3 text-lg focus:border-blue-500 outline-none transition-all placeholder:text-slate-200"
                                    placeholder="Enter username"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-3">Email Address</label>
                                <input
                                    type="email"
                                    value={user.email}
                                    onChange={(e) => setUser({ ...user, email: e.target.value })}
                                    className="w-full bg-white border-b border-slate-200 py-3 text-lg focus:border-blue-500 outline-none transition-all placeholder:text-slate-200"
                                    placeholder="email@example.com"
                                    required
                                />
                            </div>
                        </div>

                        {/* Section: Media & Bio */}
                        <div className="space-y-8">
                            <div>
                                <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-3">Biographical Note</label>
                                <textarea
                                    value={user.bio}
                                    onChange={(e) => setUser({ ...user, bio: e.target.value })}
                                    className="w-full bg-white border border-slate-100 rounded-xl p-4 text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 outline-none transition-all min-h-[120px] shadow-sm"
                                    placeholder="Describe the user's role or background..."
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-3">Identity Avatar</label>
                                <div className="flex items-center space-x-4">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setUser({ ...user, profilePicture: e.target.files[0] })}
                                        className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Submit Bar */}
                    <footer className="mt-20 pt-8 border-t border-slate-100 flex items-center space-x-6">
                        <button
                            type="submit"
                            className="bg-slate-900 text-white px-10 py-3.5 rounded-full font-medium text-sm hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-200 transition-all"
                        >
                            Save Changes
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate(`/admin/users/${id}`)}
                            className="text-sm font-medium text-slate-400 hover:text-slate-900 transition-colors"
                        >
                            Cancel
                        </button>
                    </footer>
                </form>
            </div>
        </div>
    );
};

const LoadingScreen = () => (
    <div className="h-screen flex items-center justify-center bg-[#fafafa]">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
);

export default EditUser;