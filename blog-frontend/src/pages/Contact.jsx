import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { ArrowLeft, Mail, ArrowUpRight, MessageSquare, Twitter, Instagram, Linkedin } from "lucide-react";

const Contact = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 10, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-black selection:text-white">

      {/* 1. Navigation */}
      <nav className="fixed top-0 left-0 w-full bg-white/95 backdrop-blur-sm z-40 border-b border-gray-100 h-16 flex items-center px-6 md:px-12 transition-all">
         <Link to="/" className="group flex items-center text-sm font-medium text-gray-500 hover:text-black transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
            Return Home
         </Link>
      </nav>

      {/* 2. Main Content */}
      <main className="pt-32 pb-24 px-6 md:px-12 max-w-[740px] mx-auto">

        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Header */}
            <motion.div variants={itemVariants} className="mb-16 border-b border-gray-900 pb-8">
                <div className="flex items-center gap-3 mb-4 text-gray-400">
                    <MessageSquare className="w-5 h-5" />
                    <span className="text-xs font-bold uppercase tracking-widest">Correspondence</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight mb-4">
                    Get in Touch
                </h1>
                <p className="text-gray-500 font-serif italic text-lg">
                    We are always listening.
                </p>
            </motion.div>

            {/* Content Sections */}
            <div className="space-y-12">

                {/* Intro */}
                <motion.section variants={itemVariants}>
                    <p className="text-lg md:text-xl font-serif text-gray-900 leading-relaxed">
                        Whether you have a story to share, a technical query, or simply wish to say hello, the team at <strong>Chronicle</strong> is here. We value the human connection behind every screen.
                    </p>
                </motion.section>

                {/* Email Section */}
                <motion.section variants={itemVariants} className="grid grid-cols-1 md:grid-cols-[40px_1fr] gap-4">
                    <div className="pt-1"><Mail className="w-5 h-5 text-gray-400" /></div>
                    <div>
                        <h2 className="text-sm font-bold uppercase tracking-widest mb-3">Direct Support</h2>
                        <p className="text-gray-600 leading-relaxed font-serif mb-2">
                            For account assistance, bug reports, or general inquiries.
                        </p>
                        <a
                            href="mailto:support@chronicle.com"
                            className="inline-flex items-center text-xl font-serif font-bold text-black border-b border-black/20 hover:border-black transition-all pb-0.5"
                        >
                            support@chronicle.com
                        </a>
                    </div>
                </motion.section>

                {/* Social Section */}
                <motion.section variants={itemVariants} className="grid grid-cols-1 md:grid-cols-[40px_1fr] gap-4">
                    <div className="pt-1"><Twitter className="w-5 h-5 text-gray-400" /></div>
                    <div>
                        <h2 className="text-sm font-bold uppercase tracking-widest mb-4">Social Channels</h2>
                        <div className="flex flex-col gap-4">
                            <a href="#" className="group flex items-center justify-between w-full md:w-64 p-4 border border-gray-200 hover:border-black hover:bg-gray-50 transition-all">
                                <span className="font-serif font-medium">Twitter / X</span>
                                <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-black transition-colors" />
                            </a>
                            <a href="#" className="group flex items-center justify-between w-full md:w-64 p-4 border border-gray-200 hover:border-black hover:bg-gray-50 transition-all">
                                <span className="font-serif font-medium">Instagram</span>
                                <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-black transition-colors" />
                            </a>
                            <a href="#" className="group flex items-center justify-between w-full md:w-64 p-4 border border-gray-200 hover:border-black hover:bg-gray-50 transition-all">
                                <span className="font-serif font-medium">LinkedIn</span>
                                <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-black transition-colors" />
                            </a>
                        </div>
                    </div>
                </motion.section>

            </div>

            {/* Footer */}
            <motion.div variants={itemVariants} className="mt-20 pt-10 border-t border-gray-100 text-center md:text-left">
                <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">
                    © {new Date().getFullYear()} Chronicle Platform.
                </p>
            </motion.div>
        </motion.div>
      </main>
    </div>
  );
};

export default Contact;