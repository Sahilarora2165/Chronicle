import React from "react";
import { Link } from "react-router-dom";
import { Github, Twitter, Linkedin, Feather } from "lucide-react";

const Footer = () => {
    return (
        <footer className="bg-white border-t border-gray-100 pt-20 pb-10 font-sans selection:bg-black selection:text-white">
            <div className="max-w-[1600px] mx-auto px-6 md:px-12">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-20">

                    {/* Brand Column - Takes up more space */}
                    <div className="col-span-1 md:col-span-6">
                        <Link to="/" className="flex items-center gap-2 text-3xl font-serif font-bold tracking-tighter text-gray-900 mb-6">
                            <Feather className="w-6 h-6" />
                            Chronicle.
                        </Link>
                        <p className="text-gray-500 text-base leading-relaxed max-w-md font-serif italic">
                            A minimal publishing platform for writers and thinkers.
                            We believe that every story deserves a sanctuary.
                        </p>
                    </div>

                    {/* Navigation Columns */}
                    <div className="col-span-1 md:col-span-3">
                        <h4 className="font-bold text-xs uppercase tracking-widest text-gray-900 mb-6">Explore</h4>
                        <ul className="space-y-4 text-sm text-gray-500 font-medium">
                            <li><Link to="/" className="hover:text-black transition-colors">Trending Stories</Link></li>
                            <li><Link to="/write" className="hover:text-black transition-colors">Start Writing</Link></li>
                            <li><Link to="/profile" className="hover:text-black transition-colors">Your Profile</Link></li>
                        </ul>
                    </div>

                    {/* The New Pages */}
                    <div className="col-span-1 md:col-span-3">
                        <h4 className="font-bold text-xs uppercase tracking-widest text-gray-900 mb-6">Company</h4>
                        <ul className="space-y-4 text-sm text-gray-500 font-medium">
                            <li><Link to="/about" className="hover:text-black transition-colors">About Us</Link></li>
                            <li><Link to="/contact" className="hover:text-black transition-colors">Contact</Link></li>
                            <li><Link to="/privacy" className="hover:text-black transition-colors">Privacy Policy</Link></li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-xs text-gray-400 font-bold tracking-wider uppercase">
                        © {new Date().getFullYear()} Chronicle Platform.
                    </p>
                    <div className="flex gap-6">
                        <a href="#" className="text-gray-400 hover:text-black transition-colors"><Twitter className="w-5 h-5"/></a>
                        <a href="#" className="text-gray-400 hover:text-black transition-colors"><Github className="w-5 h-5"/></a>
                        <a href="#" className="text-gray-400 hover:text-black transition-colors"><Linkedin className="w-5 h-5"/></a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;