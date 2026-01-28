import { useEffect, useState } from "react";
import api from "../axios";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Edit3, LogOut, Trash2, Plus, Calendar,
  X, Camera, PenTool, ArrowLeft, MoreHorizontal
} from "lucide-react";

// Helper for date formatting
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric'
  });
};

const Profile = () => {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [statistics, setStatistics] = useState({ postCount: 0, commentCount: 0 });
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ username: "", bio: "", profilePicture: null });
  const [loading, setLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUser();
    fetchUserPosts();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await api.get("/users/me");
      if (response.status === 200) {
        setUser(response.data);
        setFormData({
          username: response.data.username,
          bio: response.data.bio,
          profilePicture: null,
        });
        fetchUserStatistics(response.data.id);
      }
    } catch (error) {
      navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPosts = async () => {
    try {
      const response = await api.get("/users/me/posts");
      setPosts(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Failed to fetch posts");
    }
  };

  const fetchUserStatistics = async (userId) => {
    try {
      const response = await api.get(`/users/${userId}/statistics`);
      setStatistics(response.data);
    } catch (error) { console.error(error); }
  };

  const handleEditProfile = async () => {
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("username", formData.username);
      formDataToSend.append("bio", formData.bio);
      if (formData.profilePicture) {
        formDataToSend.append("profilePicture", formData.profilePicture);
      }
      const response = await api.put(`/users/me`, formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUser(response.data);
      setEditMode(false);
    } catch (error) { console.error(error); }
  };

  const handleDeletePost = async (e, postId) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this story?")) {
      try {
        await api.delete(`/posts/${postId}`);
        fetchUserPosts();
        fetchUserStatistics(user.id);
      } catch (error) { console.error(error); }
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, profilePicture: file });
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  // --- LOADING STATE ---
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

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-black selection:text-white pb-24">

      {/* 1. Navbar */}
      <nav className="fixed top-0 left-0 w-full bg-white/95 backdrop-blur-sm border-b border-gray-100 z-40 h-16 flex items-center justify-between px-6 md:px-12 transition-all">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-gray-400 hover:text-black transition-colors p-1">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="h-6 w-px bg-gray-200 hidden sm:block"></div>
          <span className="text-sm font-serif italic text-gray-400 hidden sm:block">
            Author Profile
          </span>
        </div>

        <button
            onClick={() => { localStorage.removeItem("token"); navigate("/login"); }}
            className="text-gray-500 hover:text-red-600 text-sm font-medium transition-colors flex items-center gap-2"
        >
            Sign out
        </button>
      </nav>

      <main className="max-w-[740px] mx-auto pt-32 px-6">

        {/* 2. Profile Header */}
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-20"
        >
            {/* Avatar */}
            <div className="relative group shrink-0">
                <div className="w-28 h-28 md:w-36 md:h-36 rounded-full overflow-hidden border border-gray-200">
                    <img
                        src={user?.profilePicture || `https://ui-avatars.com/api/?name=${user?.username}&background=000000&color=fff`}
                        alt="Profile"
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                    />
                </div>
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left pt-2">
                <div className="flex flex-col md:flex-row justify-between items-center mb-4">
                    <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 tracking-tight leading-none mb-2 md:mb-0">
                        {user?.username}
                    </h1>

                    <button
                        onClick={() => setEditMode(true)}
                        className="text-xs font-bold uppercase tracking-wider border border-gray-200 rounded-full px-4 py-2 hover:bg-black hover:text-white hover:border-black transition-all"
                    >
                        Edit Profile
                    </button>
                </div>

                <p className="text-gray-500 text-lg font-serif italic leading-relaxed mb-6 max-w-lg">
                    {user?.bio || "A quiet observer of the world."}
                </p>

                {/* Statistics */}
                <div className="flex items-center justify-center md:justify-start gap-8 border-t border-gray-100 pt-6">
                    <div>
                        <span className="text-2xl font-bold font-serif block">{statistics.postCount}</span>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Stories</span>
                    </div>
                    <div className="w-px h-8 bg-gray-100" />
                    <div>
                        <span className="text-2xl font-bold font-serif block">{statistics.commentCount}</span>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Comments</span>
                    </div>
                </div>
            </div>
        </motion.div>

        {/* 3. Content Section */}
        <div className="mb-12 flex items-center justify-between border-b border-gray-900 pb-4">
            <h2 className="text-xl font-serif font-bold">Published Stories</h2>
            <button
                onClick={() => navigate('/write')}
                className="flex items-center gap-2 text-sm font-medium hover:text-gray-600 transition-colors"
            >
                <Plus size={16} /> New Story
            </button>
        </div>

        {/* 4. Posts List */}
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

                        <div className="mt-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Link
                                    to={`/update/${post.id}`}
                                    className="text-xs font-medium text-gray-400 hover:text-black flex items-center gap-1 transition-colors"
                                >
                                    <Edit3 size={12} /> Edit
                                </Link>
                                <button
                                    onClick={(e) => handleDeletePost(e, post.id)}
                                    className="text-xs font-medium text-gray-400 hover:text-red-600 flex items-center gap-1 transition-colors"
                                >
                                    <Trash2 size={12} /> Delete
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))
            ) : (
                <div className="text-center py-20">
                    <PenTool className="w-8 h-8 mx-auto text-gray-200 mb-4" />
                    <p className="text-gray-400 font-serif italic">You haven't written anything yet.</p>
                </div>
            )}
        </div>

      </main>

      {/* 5. Edit Profile Modal */}
      <AnimatePresence>
        {editMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white w-full max-w-lg shadow-2xl border border-gray-100 rounded-none relative"
            >
              <button
                onClick={() => setEditMode(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-black transition-colors"
              >
                <X size={24} />
              </button>

              <div className="p-10">
                 <h3 className="text-2xl font-serif font-bold mb-8 text-center">Update Profile</h3>

                 {/* Image Upload */}
                 <div className="flex justify-center mb-8">
                     <div className="relative group cursor-pointer">
                        <img
                            src={previewImage || user?.profilePicture || `https://ui-avatars.com/api/?name=${user?.username}&background=000000&color=fff`}
                            className="w-24 h-24 rounded-full object-cover grayscale"
                            alt="Preview"
                        />
                        <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera className="text-white w-6 h-6" />
                        </div>
                        <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageChange} accept="image/*" />
                     </div>
                 </div>

                 <div className="space-y-6">
                     <div>
                        <label className="block text-xs font-bold text-gray-900 uppercase tracking-widest mb-2">Username</label>
                        <input
                            type="text"
                            value={formData.username}
                            onChange={(e) => setFormData({...formData, username: e.target.value})}
                            className="w-full text-lg border-b border-gray-200 focus:border-black outline-none py-2 bg-transparent transition-colors placeholder-gray-300 font-serif"
                        />
                     </div>

                     <div>
                        <label className="block text-xs font-bold text-gray-900 uppercase tracking-widest mb-2">Bio</label>
                        <textarea
                            value={formData.bio}
                            onChange={(e) => setFormData({...formData, bio: e.target.value})}
                            className="w-full text-base border border-gray-200 p-3 focus:border-black outline-none bg-gray-50 h-32 resize-none font-serif leading-relaxed"
                            placeholder="Tell your story..."
                        />
                     </div>

                     <button
                        onClick={handleEditProfile}
                        className="w-full bg-black text-white py-3 text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors mt-4"
                     >
                        Save Changes
                     </button>
                 </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Profile;