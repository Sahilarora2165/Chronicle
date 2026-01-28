import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../axios";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  ArrowRight,
  PenTool,
  Quote
} from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!email || !password) {
      setError("Please fill in all fields.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.post("/auth/login", { email, password });
      const token = response.data.token;

      // Store Token
      localStorage.setItem("token", token);

      // Decode Token for UI updates
      const payload = JSON.parse(atob(token.split(".")[1]));
      const username = payload.sub || payload.username || email.split("@")[0];
      localStorage.setItem("username", username);

      // Trigger UI update
      window.dispatchEvent(new Event("auth-change"));

      // Smooth Redirect
      setTimeout(() => {
        if (payload.role === "ROLE_ADMIN") {
          navigate("/admin/dashboard");
        } else {
          navigate("/");
        }
      }, 500);

    } catch (err) {
      setError("Invalid credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-white font-sans selection:bg-black selection:text-white">

      {/* 1. Left Side - Login Form */}
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
              Welcome back.
            </h1>
            <p className="text-gray-500 text-lg font-serif italic mb-10">
              Sign in to continue your story.
            </p>
          </motion.div>

          <form onSubmit={handleLogin} className="space-y-5">
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

            <div className="space-y-4">
                {/* Email */}
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
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

                {/* Password */}
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                  <div className="relative group">
                    <Lock className="absolute top-3.5 left-4 h-5 w-5 text-gray-300 group-focus-within:text-black transition-colors" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full pl-12 pr-10 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-300 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all text-sm font-medium"
                      placeholder="Password"
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

            {/* Actions */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="pt-2"
            >
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center py-3 px-4 bg-black text-white text-sm font-bold uppercase tracking-wider rounded-lg hover:bg-gray-800 focus:ring-4 focus:ring-gray-200 disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-lg shadow-black/10"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Sign In <ArrowRight className="ml-2 w-4 h-4" /></>}
              </button>
            </motion.div>
          </form>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              New to Chronicle?{" "}
              <Link to="/signup" className="font-semibold text-black border-b border-black/20 hover:border-black transition-colors pb-0.5">
                Create an account
              </Link>
            </p>
          </motion.div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-6 left-8 md:left-16 lg:left-20 text-[10px] uppercase tracking-widest text-gray-300 font-bold">
            © Chronicle Inc.
        </div>
      </div>

      {/* 2. Right Side - Image/Mood Section */}
      <div className="hidden lg:block w-[55%] relative overflow-hidden bg-black">
        <motion.div
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute inset-0"
        >
          <img
            src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=2228&auto=format&fit=crop"
            alt="Library"
            className="w-full h-full object-cover opacity-60 grayscale hover:grayscale-0 transition-all duration-[2s] ease-in-out"
          />
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
                "I have always imagined that Paradise will be a kind of library."
              </p>
              <p className="text-white/60 text-xs font-bold uppercase tracking-[0.2em]">
                Jorge Luis Borges
              </p>
           </motion.div>
        </div>
      </div>

    </div>
  );
};

export default Login;