import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

const Header = ({ onSearch }) => {
  const [isScrolled, setIsScrolled] = useState(false);

  // Effect to handle scroll styling
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out px-6 py-4 ${
        isScrolled
          ? "bg-white/70 backdrop-blur-xl border-b border-gray-100 py-3"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-screen-2xl mx-auto flex justify-between items-center">

        {/* Brand: Minimalist & Bold */}
        <Link to="/" className="relative group">
          <h1 className="text-2xl font-playfair font-black tracking-tighter text-black flex items-center">
            B<span className="opacity-0 group-hover:opacity-100 transition-all duration-500 w-0 group-hover:w-auto">logify</span>
            <span className="text-gray-400">.</span>
          </h1>
        </Link>

        {/* Search: Floating Pill Design */}
        <div className="flex-1 max-w-md mx-12 relative group hidden md:block">
          <input
            type="text"
            placeholder="Search stories..."
            onChange={(e) => onSearch(e.target.value)}
            className="w-full bg-gray-100/50 border-none px-6 py-2.5 rounded-full text-sm focus:ring-1 focus:ring-black/5 transition-all placeholder:text-gray-400 font-light"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] uppercase tracking-widest text-gray-300 font-bold group-focus-within:opacity-0 transition-opacity">
            Quick Find
          </div>
        </div>

        {/* Navigation: High-End Fashion Style */}
        <nav className="flex items-center gap-10">
          <Link
            to="/login"
            className="text-[10px] uppercase tracking-[0.3em] font-bold text-gray-400 hover:text-black transition-all"
          >
            Entry
          </Link>

          <Link
            to="/signup"
            className="relative px-8 py-3 overflow-hidden group border border-black transition-all active:scale-95"
          >
            <span className="relative z-10 text-[10px] uppercase tracking-[0.3em] font-bold text-black group-hover:text-white transition-colors duration-500">
              Get Started
            </span>
            <div className="absolute inset-0 bg-black translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;