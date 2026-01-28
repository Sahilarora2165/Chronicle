import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../axios";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, FileText, PenTool } from "lucide-react";

// Helper for date formatting
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric'
  });
};

const PublicProfile = () => {
  const { id } = useParams(); // Get user ID from URL
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // 1. Fetch User Details
        const userResponse = await api.get(`/users/${id}`);
        setUser(userResponse.data);

        // 2. Fetch User's Posts
        // Assuming your backend has an endpoint like /users/:id/posts
        // OR /posts?authorId=:id. Adjust logic below based on your backend.
        // NEW
        const postsResponse = await api.get(`/posts/user/${id}`);
        setPosts(Array.isArray(postsResponse.data) ? postsResponse.data : []);

      } catch (error) {
        console.error("Error fetching public profile:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 animate-pulse">
            <div className="w-16 h-16 bg-gray-100 rounded-full" />
            <div className="h-4 w-32 bg-gray-100 rounded" />
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-black selection:text-white pb-24">

      {/* Navigation */}
      <nav className="fixed top-0 left-0 w-full bg-white/95 backdrop-blur-sm border-b border-gray-100 z-40 h-16 flex items-center px-6 md:px-12">
        <button onClick={() => navigate(-1)} className="group flex items-center text-sm font-medium text-gray-500 hover:text-black transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
            Back
        </button>
      </nav>

      <main className="max-w-[740px] mx-auto pt-32 px-6">

        {/* Profile Header */}
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-20"
        >
            {/* Avatar */}
            <div className="w-28 h-28 md:w-36 md:h-36 rounded-full overflow-hidden border border-gray-200 shrink-0">
                <img
                    src={user.profilePicture || `https://ui-avatars.com/api/?name=${user.username}&background=000000&color=fff`}
                    alt={user.username}
                    className="w-full h-full object-cover"
                />
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left pt-2">
                <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 tracking-tight leading-none mb-4">
                    {user.username}
                </h1>

                <p className="text-gray-500 text-lg font-serif italic leading-relaxed mb-6 max-w-lg mx-auto md:mx-0">
                    {user.bio || "A quiet observer of the world."}
                </p>

                {/* Stats */}
                <div className="flex items-center justify-center md:justify-start gap-8 border-t border-gray-100 pt-6">
                    <div>
                        <span className="text-2xl font-bold font-serif block">{posts.length}</span>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Stories</span>
                    </div>
                </div>
            </div>
        </motion.div>

        {/* Content Section */}
        <div className="mb-12 border-b border-gray-900 pb-4">
            <h2 className="text-xl font-serif font-bold">Published Stories</h2>
        </div>

        {/* Posts List */}
        <div className="space-y-12">
            {posts.length > 0 ? (
                posts.map((post, index) => (
                    <motion.div
                        key={post.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="group relative"
                    >
                        <div className="flex items-baseline gap-4 mb-2">
                             <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
                                {formatDate(post.createdAt)}
                            </span>
                            <div className="h-px bg-gray-100 flex-1"></div>
                        </div>

                        <Link to={`/posts/${post.id}`} className="block group-hover:opacity-70 transition-opacity">
                            <h3 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 mb-3 leading-tight">
                                {post.title}
                            </h3>
                            <p className="text-gray-500 font-serif text-base line-clamp-2 leading-relaxed max-w-2xl">
                                {post.content}
                            </p>
                        </Link>
                    </motion.div>
                ))
            ) : (
                <div className="text-center py-20">
                    <PenTool className="w-8 h-8 mx-auto text-gray-200 mb-4" />
                    <p className="text-gray-400 font-serif italic">This author hasn't published any stories yet.</p>
                </div>
            )}
        </div>
      </main>
    </div>
  );
};

export default PublicProfile;