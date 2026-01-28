import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../axios";
import toast, { Toaster } from "react-hot-toast";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  ArrowRight,
  PenTool
} from "lucide-react";

const Signup = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      await api.post("/auth/signup", {
        username,
        email,
        password,
      });

      toast.success("Welcome to Chronicle.", {
        duration: 3000,
        position: "bottom-center",
        style: {
          background: "#000",
          color: "#fff",
          padding: "16px 24px",
          borderRadius: "4px",
          fontFamily: "serif",
          fontSize: "14px"
        },
      });

      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Signup failed";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-white font-sans selection:bg-black selection:text-white">
      <Toaster />

      {/* 1. Left Side - Form Section */}
      <div className="w-full lg:w-[45%] flex flex-col justify-center px-8 md:px-16 lg:px-20 relative z-10">

        {/* Navigation */}
        <div className="absolute top-8 left-8 md:left-16 lg:left-20">
             <Link to="/" className="group flex items-center text-sm font-medium text-gray-400 hover:text-black transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
                Return Home
             </Link>
        </div>

        {/* Main Content */}
        <div className="w-full max-w-sm mx-auto pt-20 lg:pt-0">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                <PenTool className="w-5 h-5 text-gray-900" />
            </div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-4 tracking-tight leading-[0.9]">
              Join Chronicle.
            </h1>
            <p className="text-gray-500 text-lg font-serif italic mb-10">
              Begin your journey of reading and writing today.
            </p>
          </motion.div>

          <form onSubmit={handleSignup} className="space-y-5">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="bg-red-50 text-red-900 text-xs font-medium px-4 py-3 rounded flex items-center border border-red-100"
              >
                <div className="w-1 h-1 rounded-full bg-red-600 mr-2" />
                {error}
              </motion.div>
            )}

            {/* Inputs */}
            <div className="space-y-4">
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                  <div className="relative group">
                    <User className="absolute top-3.5 left-4 h-5 w-5 text-gray-300 group-focus-within:text-black transition-colors" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="block w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-300 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all text-sm font-medium"
                      placeholder="Username"
                      required
                    />
                  </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                  <div className="relative group">
                    <Mail className="absolute top-3.5 left-4 h-5 w-5 text-gray-300 group-focus-within:text-black transition-colors" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-300 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all text-sm font-medium"
                      placeholder="Email address"
                      required
                    />
                  </div>
                </motion.div>

                <div className="grid grid-cols-2 gap-4">
                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                      <div className="relative group">
                        <Lock className="absolute top-3.5 left-4 h-5 w-5 text-gray-300 group-focus-within:text-black transition-colors" />
                        <input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="block w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-300 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all text-sm font-medium"
                          placeholder="Password"
                          required
                        />
                      </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
                      <div className="relative group">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="block w-full pl-4 pr-10 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-300 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all text-sm font-medium"
                          placeholder="Confirm"
                          required
                        />
                         <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-300 hover:text-black transition-colors"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </motion.div>
                </div>
            </div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center py-3 px-4 bg-black text-white text-sm font-bold uppercase tracking-wider rounded-lg hover:bg-gray-800 focus:ring-4 focus:ring-gray-200 disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-lg shadow-black/10"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Create Account <ArrowRight className="ml-2 w-4 h-4" /></>}
              </button>
            </motion.div>
          </form>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Already a member?{" "}
              <Link to="/login" className="font-semibold text-black border-b border-black/20 hover:border-black transition-colors pb-0.5">
                Sign in
              </Link>
            </p>
          </motion.div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-6 left-8 md:left-16 lg:left-20 text-[10px] uppercase tracking-widest text-gray-300 font-bold">
            © Chronicle Inc.
        </div>
      </div>

      {/* 2. Right Side - Cinematic Image */}
      <div className="hidden lg:block w-[55%] relative overflow-hidden bg-black">
        <motion.div
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute inset-0"
        >
            <img
                src="https://images.unsplash.com/photo-1455390582262-044cdead277a?q=80&w=2573&auto=format&fit=crop"
                alt="Journal Writing"
                className="w-full h-full object-cover opacity-60 grayscale hover:grayscale-0 transition-all duration-[2s] ease-in-out"
            />
            {/* Gradient Overlay for Text Readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        </motion.div>

        <div className="absolute bottom-20 left-16 right-16 max-w-lg">
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.8, duration: 0.8 }}
             className="border-l-2 border-white/80 pl-8"
           >
              <Quote className="w-8 h-8 text-white/40 mb-4" />
              <p className="text-3xl font-serif text-white leading-relaxed mb-6">
                "We write to taste life twice, in the moment and in retrospect."
              </p>
              <p className="text-white/60 text-xs font-bold uppercase tracking-[0.2em]">
                Anaïs Nin
              </p>
           </motion.div>
        </div>
      </div>

      {/* Quote Icon for right side */}
      <svg className="hidden">
        <defs>
            <symbol id="quote" viewBox="0 0 24 24" fill="currentColor">
                <path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C19.5693 16 20.017 15.5523 20.017 15V9C20.017 8.44772 19.5693 8 19.017 8H15.017C14.4647 8 14.017 8.44772 14.017 9V11C14.017 11.5523 13.5693 12 13.017 12H12.017V5H22.017V15C22.017 18.3137 19.3307 21 16.017 21H14.017ZM5.0166 21L5.0166 18C5.0166 16.8954 5.91203 16 7.0166 16H10.0166C10.5689 16 11.0166 15.5523 11.0166 15V9C11.0166 8.44772 10.5689 8 10.0166 8H6.0166C5.46432 8 5.0166 8.44772 5.0166 9V11C5.0166 11.5523 4.56889 12 4.0166 12H3.0166V5H13.0166V15C13.0166 18.3137 10.3303 21 7.0166 21H5.0166Z" />
            </symbol>
        </defs>
      </svg>

    </div>
  );
};

// Simple Quote Icon Component
const Quote = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C19.5693 16 20.017 15.5523 20.017 15V9C20.017 8.44772 19.5693 8 19.017 8H15.017C14.4647 8 14.017 8.44772 14.017 9V11C14.017 11.5523 13.5693 12 13.017 12H12.017V5H22.017V15C22.017 18.3137 19.3307 21 16.017 21H14.017ZM5.0166 21L5.0166 18C5.0166 16.8954 5.91203 16 7.0166 16H10.0166C10.5689 16 11.0166 15.5523 11.0166 15V9C11.0166 8.44772 10.5689 8 10.0166 8H6.0166C5.46432 8 5.0166 8.44772 5.0166 9V11C5.0166 11.5523 4.56889 12 4.0166 12H3.0166V5H13.0166V15C13.0166 18.3137 10.3303 21 7.0166 21H5.0166Z" />
    </svg>
);

export default Signup;