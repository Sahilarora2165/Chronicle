import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../axios";

const UserDetail = () => {
    const { id } = useParams();
    const [user, setUser] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    useEffect(() => {
        if (!token) { navigate("/login"); return; }

        const fetchUser = async () => {
            try {
                const response = await api.get(`/users/${id}`);
                setUser(response.data);
            } catch (err) {
                setError("ACCESS_DENIED: USER_RECORD_NOT_FOUND");
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [id, token, navigate]);

    if (loading) return <LoadingScreen />;

    return (
        <div className="min-h-screen bg-white text-black font-sans flex flex-col">
            <div className="w-full px-6 md:px-12 py-8 md:py-12 flex flex-col min-h-screen">

                {/* Header: Full Width & Sleek */}
                <header className="mb-20 border-b-2 border-black pb-6 flex justify-between items-end">
                    <div>
                        <h1 className="text-5xl font-black tracking-tighter uppercase italic leading-none">
                            User Profile
                        </h1>
                        <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-gray-400 mt-4">
                            Registry Entry // UUID: {id}
                        </p>
                    </div>
                    <button
                        onClick={() => navigate("/admin/users")}
                        className="font-mono text-[10px] font-bold uppercase tracking-widest hover:italic border-b border-black pb-1 mb-2"
                    >
                        [ Return to Index ]
                    </button>
                </header>

                {error && (
                    <div className="bg-black text-white p-6 mb-12 font-mono text-xs uppercase tracking-widest text-center">
                        {error}
                    </div>
                )}

                {user && (
                    <div className="flex-1 flex flex-col">
                        {/* Primary Identity Display */}
                        <section className="mb-20">
                            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-2">Primary Identifier</p>
                            <h2 className="text-6xl md:text-8xl font-black tracking-tighter uppercase break-all leading-tight">
                                {user.username}
                            </h2>
                        </section>

                        {/* Details Grid: Full Width Rows */}
                        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0 border-y-2 border-black">
                            <MetaField label="Email Address" value={user.email} />
                            <MetaField label="Access Role" value={user.role} />
                            <MetaField label="Creation Date" value={new Date(user.createdAt).toLocaleDateString()} />
                            <MetaField
                                label="Last Presence"
                                value={user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : "NO_RECORD"}
                            />
                        </section>

                        {/* Actions: Sleek & Bottom Aligned */}
                        <footer className="mt-auto pt-16 flex space-x-8">
                            <button
                                onClick={() => navigate(`/admin/users/edit/${user.id}`)}
                                className="bg-black text-white px-10 py-4 font-bold uppercase tracking-widest text-xs hover:bg-gray-800 transition-all"
                            >
                                Modify Record
                            </button>
                            <button
                                onClick={() => navigate("/admin/users")}
                                className="border-2 border-black px-10 py-4 font-bold uppercase tracking-widest text-xs hover:bg-black hover:text-white transition-all"
                            >
                                Back
                            </button>
                        </footer>
                    </div>
                )}
            </div>
        </div>
    );
};

// Sleek Metadata Cell
const MetaField = ({ label, value }) => (
    <div className="p-10 border-b-2 last:border-b-0 md:border-b-0 md:border-r-2 md:last:border-r-0 border-black transition-colors hover:bg-gray-50 group">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-4 group-hover:text-black">{label}</p>
        <p className="text-xl font-bold uppercase tracking-tighter truncate">{value}</p>
    </div>
);

const LoadingScreen = () => (
    <div className="h-screen flex items-center justify-center bg-white font-mono text-[10px] tracking-[1em] uppercase animate-pulse">
        Accessing User Registry...
    </div>
);

export default UserDetail;