import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../axios";

const Users = () => {
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [usersPerPage] = useState(10);
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    useEffect(() => {
        if (!token) { navigate("/login"); return; }
        const fetchUsers = async () => {
            try {
                const response = await api.get("/users");
                setUsers(response.data);
            } catch (err) {
                setError("SYSTEM_ERROR: FAILED TO FETCH USER REGISTRY");
            } finally { setLoading(false); }
        };
        fetchUsers();
    }, [token, navigate]);

    const filteredUsers = users.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

    const handleDelete = async (userId) => {
        if (window.confirm("Confirm deletion of user record?")) {
            try {
                await api.delete(`/users/${userId}`);
                setUsers(users.filter(user => user.id !== userId));
            } catch (err) {
                setError("ACTION_FAILED: DELETE_USER_REJECTED");
            }
        }
    };

    if (loading) return <LoadingScreen />;

    return (
        <div className="min-h-screen bg-white text-black font-sans flex flex-col">
            <div className="w-full px-6 md:px-12 py-8 flex flex-col h-screen">

                {/* Header: Full Width & Sleek */}
                <header className="flex flex-col md:flex-row justify-between items-baseline mb-12 border-b-2 border-black pb-6">
                    <div>
                        <h1 className="text-5xl font-black tracking-tighter uppercase italic">Registry</h1>
                        <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-gray-400 mt-2">Member Directory // Chronicles v1.0.4</p>
                    </div>

                    <div className="w-full md:w-96 mt-6 md:mt-0">
                        <input
                            type="text"
                            placeholder="SEARCH_INDEX..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-gray-50 border-b border-black p-2 font-mono text-xs focus:outline-none focus:bg-gray-100 transition-colors"
                        />
                    </div>
                </header>

                {error && <div className="bg-black text-white p-4 mb-8 font-mono text-xs uppercase tracking-widest">{error}</div>}

                {/* Users List: Full Width Table-Style */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <div className="grid grid-cols-1 border-t border-gray-100">
                        {currentUsers.length > 0 ? (
                            currentUsers.map(user => (
                                <div
                                    key={user.id}
                                    className="group flex flex-col md:flex-row items-start md:items-center justify-between py-6 px-4 border-b border-gray-100 hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                                        <Link to={`/admin/users/${user.id}`} className="hover:italic transition-all">
                                            <p className="font-mono text-[10px] uppercase text-gray-400 mb-1">Username</p>
                                            <h3 className="text-lg font-bold tracking-tight uppercase">{user.username}</h3>
                                        </Link>
                                        <div>
                                            <p className="font-mono text-[10px] uppercase text-gray-400 mb-1">Email</p>
                                            <p className="text-sm text-gray-600">{user.email}</p>
                                        </div>
                                        <div>
                                            <p className="font-mono text-[10px] uppercase text-gray-400 mb-1">Permissions</p>
                                            <span className="text-xs font-bold font-mono px-2 py-0.5 border border-black uppercase">
                                                {user.role}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex space-x-6 mt-6 md:mt-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => navigate(`/admin/users/edit/${user.id}`)}
                                            className="text-[10px] font-black uppercase tracking-widest border-b-2 border-black hover:bg-black hover:text-white px-2 py-1 transition-all"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(user.id)}
                                            className="text-[10px] font-black uppercase tracking-widest border-b-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white px-2 py-1 transition-all"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="py-20 text-center font-mono text-xs text-gray-400 uppercase tracking-widest">// No records matching search criteria</p>
                        )}
                    </div>
                </div>

                {/* Pagination: Minimalist Footer */}
                {totalPages > 1 && (
                    <footer className="mt-8 pt-6 border-t border-black flex justify-between items-center shrink-0">
                        <p className="font-mono text-[10px] text-gray-400 uppercase tracking-widest">
                            Page {currentPage} of {totalPages}
                        </p>
                        <div className="flex space-x-4">
                            {Array.from({ length: totalPages }, (_, i) => (
                                <button
                                    key={i + 1}
                                    onClick={() => setCurrentPage(i + 1)}
                                    className={`font-mono text-xs p-2 transition-all ${
                                        currentPage === i + 1
                                        ? "font-black border-b-2 border-black"
                                        : "text-gray-400 hover:text-black"
                                    }`}
                                >
                                    {String(i + 1).padStart(2, '0')}
                                </button>
                            ))}
                        </div>
                    </footer>
                )}
            </div>
        </div>
    );
};

const LoadingScreen = () => (
    <div className="h-screen flex items-center justify-center bg-white font-mono uppercase text-[10px] tracking-[1em] animate-pulse">
        Establishing Registry Connection...
    </div>
);

export default Users;