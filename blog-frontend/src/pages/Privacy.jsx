import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { ArrowLeft, Shield, Lock, Eye, Database, FileText } from "lucide-react";

const Privacy = () => {
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
                    <Shield className="w-5 h-5" />
                    <span className="text-xs font-bold uppercase tracking-widest">Legal Documentation</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight mb-4">
                    Privacy Policy
                </h1>
                <p className="text-gray-500 font-serif italic text-lg">
                    Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
            </motion.div>

            {/* Content Sections */}
            <div className="space-y-12">

                {/* Intro */}
                <motion.section variants={itemVariants}>
                    <p className="text-lg md:text-xl font-serif text-gray-900 leading-relaxed">
                        At <strong>Chronicle</strong>, we believe privacy is not a feature, but a fundamental right. We stripped away the noise to build this platform, and we apply the same philosophy to your data: we only collect what is strictly necessary to tell your story.
                    </p>
                </motion.section>

                {/* Section 1 */}
                <motion.section variants={itemVariants} className="grid grid-cols-1 md:grid-cols-[40px_1fr] gap-4">
                    <div className="pt-1"><Database className="w-5 h-5 text-gray-400" /></div>
                    <div>
                        <h2 className="text-sm font-bold uppercase tracking-widest mb-3">1. Information Collection</h2>
                        <p className="text-gray-600 leading-relaxed font-serif">
                             We collect minimal personal data—specifically your username, email address, and profile details—solely to facilitate your account creation and interaction within the platform. We do not track your activity across the web, nor do we harvest data for advertising algorithms.
                        </p>
                    </div>
                </motion.section>

                {/* Section 2 */}
                <motion.section variants={itemVariants} className="grid grid-cols-1 md:grid-cols-[40px_1fr] gap-4">
                    <div className="pt-1"><Eye className="w-5 h-5 text-gray-400" /></div>
                    <div>
                        <h2 className="text-sm font-bold uppercase tracking-widest mb-3">2. Usage of Data</h2>
                        <p className="text-gray-600 leading-relaxed font-serif">
                            Your information serves one purpose: to personalize your reading and writing experience. We use your data to manage your account, publish your posts, and notify you of community interactions. We strictly prohibit the sale of your personal data to third-party brokers.
                        </p>
                    </div>
                </motion.section>

                {/* Section 3 */}
                <motion.section variants={itemVariants} className="grid grid-cols-1 md:grid-cols-[40px_1fr] gap-4">
                    <div className="pt-1"><Lock className="w-5 h-5 text-gray-400" /></div>
                    <div>
                        <h2 className="text-sm font-bold uppercase tracking-widest mb-3">3. Security & Ownership</h2>
                        <p className="text-gray-600 leading-relaxed font-serif">
                            Your stories belong to you. We employ industry-standard encryption to protect your account. While no digital platform is impenetrable, we are committed to transparency and will notify you immediately of any security events. You retain full copyright ownership of all content published on Chronicle.
                        </p>
                    </div>
                </motion.section>

                {/* Section 4 */}
                <motion.section variants={itemVariants} className="grid grid-cols-1 md:grid-cols-[40px_1fr] gap-4">
                    <div className="pt-1"><FileText className="w-5 h-5 text-gray-400" /></div>
                    <div>
                        <h2 className="text-sm font-bold uppercase tracking-widest mb-3">4. Your Rights</h2>
                        <p className="text-gray-600 leading-relaxed font-serif">
                            You have the right to access, rectify, or erase your personal data at any time. You can export your stories or delete your account permanently via your profile settings. For specific legal inquiries, please contact our data protection team at{" "}
                            <a href="mailto:privacy@chronicle.com" className="text-black underline underline-offset-4 decoration-gray-300 hover:decoration-black transition-all font-medium">
                                privacy@chronicle.com
                            </a>.
                        </p>
                    </div>
                </motion.section>

            </div>

            {/* Footer */}
            <motion.div variants={itemVariants} className="mt-20 pt-10 border-t border-gray-100 text-center md:text-left">
                <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">
                    © {new Date().getFullYear()} Chronicle Platform. All rights reserved.
                </p>
            </motion.div>
        </motion.div>
      </main>
    </div>
  );
};

export default Privacy;