import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { ArrowLeft, ArrowRight, Feather, Globe, Shield, PenTool } from "lucide-react";

const About = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-black selection:text-white">

      {/* 1. Navigation */}
      <nav className="fixed top-0 left-0 w-full bg-white/90 backdrop-blur-md z-40 border-b border-gray-100 h-16 flex items-center px-6 md:px-12">
         <Link to="/" className="group flex items-center text-sm font-medium text-gray-500 hover:text-black transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
            Return Home
         </Link>
      </nav>

      {/* 2. Main Content */}
      <main className="pt-32 pb-24 px-6 md:px-12 max-w-[800px] mx-auto">

        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Header */}
            <motion.div variants={itemVariants} className="text-center mb-16">
                <div className="inline-flex items-center justify-center p-3 bg-gray-50 rounded-full mb-6">
                    <Feather className="w-6 h-6 text-gray-900" />
                </div>
                <h1 className="text-5xl md:text-6xl font-serif font-bold tracking-tight mb-6 leading-[0.9]">
                    The Chronicle Manifesto.
                </h1>
                <p className="text-xl text-gray-500 font-serif italic max-w-lg mx-auto">
                    "We write to taste life twice, in the moment and in retrospect."
                </p>
            </motion.div>

            {/* Image Banner */}
            <motion.div variants={itemVariants} className="w-full aspect-[16/9] overflow-hidden mb-16 relative grayscale hover:grayscale-0 transition-all duration-700">
                <img
                    src="https://images.unsplash.com/photo-1457369804613-52c61a468e7d?q=80&w=2670&auto=format&fit=crop"
                    alt="Typewriter and books"
                    className="w-full h-full object-cover"
                />
            </motion.div>

            {/* Editorial Content */}
            <div className="space-y-16">

                {/* Section 1: The Why */}
                <motion.section variants={itemVariants}>
                    <h2 className="text-2xl font-bold uppercase tracking-widest mb-6 border-b border-black pb-4">01. The Purpose</h2>
                    <p className="text-lg md:text-xl font-serif text-gray-600 leading-relaxed">
                        In an age of fleeting digital noise, <strong>Chronicle</strong> was born from a desire for permanence. We believe that every story—whether a quiet reflection or a bold manifesto—deserves a sanctuary. This is not just a blogging platform; it is a canvas for the human experience, stripped of distractions, designed to let your words breathe.
                    </p>
                </motion.section>

                {/* Section 2: The Core Values (Grid) */}
                <motion.section variants={itemVariants}>
                     <h2 className="text-2xl font-bold uppercase tracking-widest mb-8 border-b border-black pb-4">02. Our Core</h2>
                     <div className="grid md:grid-cols-2 gap-8">
                        <div className="p-6 bg-gray-50 border border-gray-100 hover:border-gray-300 transition-colors">
                            <PenTool className="w-6 h-6 mb-4" />
                            <h3 className="font-serif text-xl font-bold mb-2">Minimalist Design</h3>
                            <p className="text-gray-500 text-sm leading-relaxed">
                                We removed the clutter so you can focus on what matters: the writing. No ads, no popups, just you and the page.
                            </p>
                        </div>
                        <div className="p-6 bg-gray-50 border border-gray-100 hover:border-gray-300 transition-colors">
                            <Globe className="w-6 h-6 mb-4" />
                            <h3 className="font-serif text-xl font-bold mb-2">Global Voices</h3>
                            <p className="text-gray-500 text-sm leading-relaxed">
                                A tapestry of narratives from across borders. We bridge cultures through the universal language of storytelling.
                            </p>
                        </div>
                        <div className="p-6 bg-gray-50 border border-gray-100 hover:border-gray-300 transition-colors">
                            <Shield className="w-6 h-6 mb-4" />
                            <h3 className="font-serif text-xl font-bold mb-2">Digital Sanctuary</h3>
                            <p className="text-gray-500 text-sm leading-relaxed">
                                Your data is yours. We prioritize privacy and ownership, ensuring your legacy remains in your hands.
                            </p>
                        </div>
                         <div className="p-6 bg-black text-white flex flex-col justify-center items-center text-center">
                            <h3 className="font-serif text-xl font-bold mb-2">Join Us</h3>
                            <p className="text-gray-400 text-sm mb-4">Be part of the story.</p>
                            <Link to="/signup" className="underline underline-offset-4 hover:text-gray-300">Create Account</Link>
                        </div>
                     </div>
                </motion.section>

                {/* Section 3: The Invitation */}
                <motion.section variants={itemVariants} className="bg-gray-900 text-white p-10 md:p-16 text-center relative overflow-hidden">
                    <div className="relative z-10">
                        <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6">
                            Ready to leave your mark?
                        </h2>
                        <p className="text-gray-400 mb-8 max-w-md mx-auto">
                            The page is blank. The cursor is blinking. The world is waiting to hear what you have to say.
                        </p>
                        <button
                            onClick={() => navigate("/write")}
                            className="inline-flex items-center bg-white text-black px-8 py-4 font-bold uppercase tracking-widest text-xs hover:bg-gray-200 transition-colors"
                        >
                            Start Writing <ArrowRight className="ml-2 w-4 h-4" />
                        </button>
                    </div>

                    {/* Decorative Background Element */}
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                        <div className="absolute top-[-50%] left-[-20%] w-[500px] h-[500px] bg-white rounded-full blur-[100px]" />
                    </div>
                </motion.section>

            </div>

            {/* Footer */}
            <motion.div variants={itemVariants} className="mt-20 pt-10 border-t border-gray-100 text-center text-xs text-gray-400 uppercase tracking-widest font-bold">
                © {new Date().getFullYear()} Chronicle Platform. Est. 2024.
            </motion.div>
        </motion.div>
      </main>
    </div>
  );
};

export default About;