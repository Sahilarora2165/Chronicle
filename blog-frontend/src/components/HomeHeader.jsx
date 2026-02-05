import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  PenLine,
  User,
  LogOut,
  ChevronDown,
} from "lucide-react";

const HomeHeader = ({ onSearch }) => {
    const navigate = useNavigate();
    // Check for token and username immediately
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("token"));
    const [searchQuery, setSearchQuery] = useState("");
    const [showDropdown, setShowDropdown] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    // Monitor authentication status
    useEffect(() => {
        const handleStorageChange = () => {
            setIsAuthenticated(!!localStorage.getItem("token"));
        };
        // Listen for storage events (cross-tab) and custom events (same-tab)
        window.addEventListener("storage", handleStorageChange);
        window.addEventListener("auth-change", handleStorageChange);

        return () => {
            window.removeEventListener("storage", handleStorageChange);
            window.removeEventListener("auth-change", handleStorageChange);
        };
    }, []);

    // Monitor scroll for visual styling
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleLogOut = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        setIsAuthenticated(false);
        setShowDropdown(false);

        // Dispatch event to notify other components
        window.dispatchEvent(new Event("auth-change"));
        navigate("/");
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        if (onSearch) onSearch(e.target.value);
    };

    return (
        <motion.header
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5, ease: "circOut" }}
            className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 border-b ${
                scrolled
                ? "bg-white/85 backdrop-blur-xl border-gray-200 py-3 shadow-sm"
                : "bg-white border-transparent py-5"
            }`}
        >
            <div className="max-w-[1600px] mx-auto px-6 sm:px-8 lg:px-12 flex items-center justify-between">

                {/* 1. Left: Brand & Search */}
                <div className="flex items-center gap-8 md:gap-10">
                    {/* LOGO: High-end Editorial Look */}
                    <Link
                        to="/"
                        className="text-3xl md:text-4xl font-serif font-black tracking-tighter text-gray-900 select-none hover:opacity-80 transition-opacity"
                    >
                        Chronicle.
                    </Link>

                    {/* Desktop Search */}
                    <div className="hidden md:block relative group">
                        <div className={`flex items-center transition-all duration-300`}>
                            <Search className="absolute left-3 w-4 h-4 text-gray-400 group-focus-within:text-gray-900 transition-colors pointer-events-none" />
                            <input
                                type="text"
                                placeholder="Search stories..."
                                value={searchQuery}
                                onChange={handleSearchChange}
                                className="bg-gray-100/50 hover:bg-gray-100 group-focus-within:bg-white text-sm pl-10 pr-4 w-64 focus:w-80 h-10 rounded-full border border-transparent focus:border-gray-200 focus:ring-4 focus:ring-gray-100 transition-all duration-300 outline-none placeholder:text-gray-400 text-gray-900"
                            />
                        </div>
                    </div>
                </div>

                {/* 2. Right: Actions */}
                <div className="flex items-center gap-4 sm:gap-6">
                    {isAuthenticated ? (
                        <>
                            {/* Write Button */}
                            <Link
                                to="/write"
                                className="hidden sm:flex items-center gap-2 text-gray-500 hover:text-black transition-colors text-sm font-medium group"
                            >
                                <PenLine className="w-4 h-4 text-gray-400 group-hover:text-black transition-colors" />
                                <span>Write</span>
                            </Link>

                            {/* User Menu */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowDropdown(!showDropdown)}
                                    className="flex items-center gap-2 focus:outline-none group"
                                >
                                    {/* Avatar - Solid Black for Premium Feel */}
                                    <div className="w-9 h-9 bg-gray-900 rounded-full flex items-center justify-center border border-gray-900 group-hover:bg-gray-800 transition-all shadow-sm">
                                        <span className="font-serif font-medium text-white text-sm">
                                            {(localStorage.getItem("username") || "U").charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <ChevronDown className={`w-3 h-3 text-gray-400 group-hover:text-gray-600 transition-transform duration-300 ${showDropdown ? 'rotate-180' : ''}`} />
                                </button>

                                {/* Dropdown Menu */}
                                <AnimatePresence>
                                    {showDropdown && (
                                        <>
                                            {/* Invisible backdrop to close menu */}
                                            <div
                                                className="fixed inset-0 z-10"
                                                onClick={() => setShowDropdown(false)}
                                            />

                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.95, y: 10, x: 20 }}
                                                animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                                                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                                transition={{ duration: 0.2, type: "spring", stiffness: 300, damping: 25 }}
                                                className="absolute right-0 top-full mt-3 w-64 bg-white rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-gray-100 py-2 z-20 overflow-hidden"
                                            >
                                                {/* Header */}
                                                <div className="px-5 py-3 border-b border-gray-50">
                                                    <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Signed in as</p>
                                                    <p className="text-sm font-bold text-gray-900 truncate font-serif">
                                                        {localStorage.getItem("username") || "User"}
                                                    </p>
                                                </div>

                                                {/* Menu Items */}
                                                <div className="py-2">
                                                    <button
                                                        onClick={() => { navigate("/profile"); setShowDropdown(false); }}
                                                        className="w-full text-left px-5 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-black flex items-center gap-3 transition-colors"
                                                    >
                                                        <User className="w-4 h-4" /> Profile
                                                    </button>
                                                </div>

                                                {/* Divider */}
                                                <div className="h-px bg-gray-50 mx-2"></div>

                                                {/* Sign Out */}
                                                <div className="py-2">
                                                    <button
                                                        onClick={handleLogOut}
                                                        className="w-full text-left px-5 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
                                                    >
                                                        <LogOut className="w-4 h-4" /> Sign out
                                                    </button>
                                                </div>
                                            </motion.div>
                                        </>
                                    )}
                                </AnimatePresence>
                            </div>
                        </>
                    ) : (
                        // Guest State
                        <div className="flex items-center gap-3 sm:gap-4">
                            <button
                                onClick={() => navigate("/login")}
                                className="text-sm font-medium text-gray-500 hover:text-black transition-colors px-4 py-2"
                            >
                                Sign in
                            </button>
                            <button
                                onClick={() => navigate("/signup")}
                                className="bg-black text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-gray-800 transition-all hover:shadow-lg active:scale-95"
                            >
                                Get started
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </motion.header>
    );
};

export default HomeHeader;