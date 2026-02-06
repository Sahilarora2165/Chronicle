import React from "react";
import { Link } from "react-router-dom";
import { Github, Twitter, Linkedin } from "lucide-react";

const Footer = () => {
    return (
        <footer className="bg-white border-t border-gray-100 py-8 font-sans selection:bg-black selection:text-white">
            <div className="max-w-[1600px] mx-auto px-6 md:px-12">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">

                    {/* Left: Copyright + Links */}
                    <div className="flex flex-col md:flex-row items-center gap-3 md:gap-6 text-sm text-gray-500">
                        <p className="font-medium">
                            © {new Date().getFullYear()} Chronicle
                        </p>
                        <div className="flex items-center gap-4">
                            <Link to="/about" className="hover:text-black transition-colors">About</Link>
                            <Link to="/privacy" className="hover:text-black transition-colors">Privacy</Link>
                            <Link to="/contact" className="hover:text-black transition-colors">Contact</Link>
                        </div>
                    </div>

                    {/* Right: Social Icons */}
                    <div className="flex gap-5">
                        <a
                            href="https://twitter.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-black transition-colors"
                            aria-label="Twitter"
                        >
                            <Twitter className="w-4 h-4"/>
                        </a>
                        <a
                            href="https://github.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-black transition-colors"
                            aria-label="GitHub"
                        >
                            <Github className="w-4 h-4"/>
                        </a>
                        <a
                            href="https://linkedin.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-black transition-colors"
                            aria-label="LinkedIn"
                        >
                            <Linkedin className="w-4 h-4"/>
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;