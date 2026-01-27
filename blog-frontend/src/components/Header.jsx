import { Link } from "react-router-dom";
import { Search, Menu } from "lucide-react";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 pointer-events-none">

      {/* Floating Navigation Pill - Minimal & Clean */}
      <div className="pointer-events-auto fixed top-6 left-1/2 transform -translate-x-1/2 w-[90%] max-w-4xl">
        <div className="flex items-center justify-between bg-white/90 backdrop-blur-md shadow-sm shadow-gray-200/50 rounded-full px-5 py-3 transition-all duration-300">

          {/* Logo */}
          <Link to="/" className="text-lg font-serif font-bold text-gray-900 tracking-tight hover:opacity-80 transition-opacity">
            Blogify.
          </Link>

          {/* Right Actions */}
          <div className="flex items-center gap-4">

            {/* Search - Minimalist Icon */}
            <button className="text-gray-400 hover:text-gray-900 transition-colors p-1">
              <Search size={18} strokeWidth={2} />
            </button>

            {/* Desktop Actions */}
            <div className="hidden sm:flex items-center gap-3">
              <Link
                to="/login"
                className="text-sm font-medium text-gray-600 hover:text-black transition-colors"
              >
                Sign In
              </Link>

              <Link
                to="/signup"
                className="text-xs font-bold uppercase tracking-wide text-white bg-black hover:bg-gray-800 px-4 py-2 rounded-full transition-all"
              >
                Get Started
              </Link>
            </div>

            {/* Mobile Menu Icon */}
            <button className="sm:hidden p-1 text-gray-600 hover:text-black">
              <Menu size={22} strokeWidth={2} />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};

export default Header;