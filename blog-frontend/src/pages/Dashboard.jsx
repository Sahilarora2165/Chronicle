import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../axios";

const Dashboard = () => {
    const [data, setData] = useState({
        userCount: 0,
        postCount: 0,
        commentCount: 0,
        recentActivities: []
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    useEffect(() => {
        if (!token) {
            navigate("/login");
            return;
        }

        const fetchDashboardData = async () => {
            try {
                const response = await api.get("/dashboard/stats");
                setData(response.data);
                setError("");
            } catch (err) {
                setError("CONNECTION_INTERRUPTED: SYNC FAILED");
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [token, navigate]);

    if (loading) return <LoadingScreen />;

    return (
        <div className="h-screen bg-white text-black font-sans p-6 md:p-16 flex flex-col">
            <div className="max-w-6xl w-full mx-auto flex flex-col h-full">

                {/* Header: Clean & Minimal */}
                <header className="flex justify-between items-baseline mb-16 shrink-0">
                    <div>
                        <h1 className="text-4xl font-black tracking-tighter uppercase italic">
                            Chronicles
                            <span className="text-sm not-italic font-mono text-gray-400 font-normal ml-3">v1.0.4</span>
                        </h1>
                    </div>
                    <div className="font-mono text-[10px] uppercase tracking-widest text-gray-400 hidden sm:block">
                        {new Date().toLocaleDateString()} // STATUS: OK
                    </div>
                </header>

                {error && (
                    <div className="border-2 border-red-600 text-red-600 p-4 mb-12 font-mono text-xs text-center font-bold uppercase shrink-0">
                        {error}
                    </div>
                )}

                {/* Stats Section: No Borders, Just Typography */}
                <section className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-20 shrink-0">
                    <StatCard label="User Base" value={data.userCount} link="/admin/users" />
                    <StatCard label="Stories" value={data.postCount} link="/admin/posts" />
                    <StatCard label="Feedback" value={data.commentCount} link="/admin/comments" />
                </section>

                {/* Registry Log: Contained and Scrollable */}
                <section className="flex-1 min-h-0 flex flex-col max-w-4xl">
                    <h2 className="text-xs font-mono uppercase tracking-[0.3em] text-gray-400 mb-8 border-b border-gray-100 pb-2 flex justify-between shrink-0">
                        <span>Recent Registry Events</span>
                        <span className="text-[9px] animate-pulse">● LIVE_FEED</span>
                    </h2>

                    <div className="relative flex-1 min-h-0">
                        {/* Scrollable area */}
                        <div className="h-full overflow-y-auto pr-4 custom-scrollbar">
                            <div className="divide-y divide-gray-100">
                                {data.recentActivities.length > 0 ? (
                                    data.recentActivities.map((activity, index) => (
                                        <div key={index} className="group flex py-4 font-mono text-xs items-center hover:bg-gray-50 transition-colors px-2">
                                            <span className="text-gray-300 mr-6 w-16 tabular-nums">
                                                {new Date(activity.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                            </span>
                                            <span className="font-bold mr-4 w-24">[{activity.type.toUpperCase()}]</span>
                                            <span className="flex-1 text-gray-600 group-hover:text-black truncate mr-4">
                                                {activity.description}
                                            </span>
                                            <span className="opacity-0 group-hover:opacity-100 text-[10px] font-bold whitespace-nowrap">
                                                VIEW ↗
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="py-10 text-gray-400 font-mono text-xs italic text-center uppercase tracking-widest">
                                        // Empty Registry
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Bottom Gradient for visual depth */}
                        <div className="pointer-events-none absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-white to-transparent"></div>
                    </div>
                </section>
            </div>
        </div>
    );
};

const StatCard = ({ label, value, link }) => (
    <Link to={link} className="group block">
        <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-mono mb-2 group-hover:text-black transition-colors">
            {label}
        </p>
        <p className="text-7xl font-black tracking-tighter group-hover:italic transition-all leading-none">
            {value.toLocaleString()}
        </p>
    </Link>
);

const LoadingScreen = () => (
    <div className="min-h-screen flex items-center justify-center bg-white font-mono">
        <div className="text-center">
            <p className="text-[10px] tracking-[0.5em] uppercase animate-pulse">Initializing Terminal...</p>
        </div>
    </div>
);

export default Dashboard;