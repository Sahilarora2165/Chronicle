import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom"; // 1. Added useLocation
import { Suspense, lazy, useEffect } from "react"; // 2. Added useEffect
import Sidebar from "./components/Sidebar";

// --- ADD THIS COMPONENT HERE ---
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};
// ------------------------------

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import HomePage from "./pages/HomePage";
import PublicProfile from "./pages/PublicProfile";

// Lazy loads...
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Users = lazy(() => import("./pages/Users"));
const Posts = lazy(() => import("./pages/Posts"));
const Comments = lazy(() => import("./pages/Comments"));
const UserDetail = lazy(() => import("./pages/UserDetail"));
const EditUser = lazy(() => import("./pages/EditUser"));
const PostDetail = lazy(() => import("./pages/PostDetail"));
const EditPost = lazy(() => import("./pages/EditPost"));
const CommentDetail = lazy(() => import("./pages/CommentDetail"));
const EditComment = lazy(() => import("./pages/EditComment"));
const RecentActivities = lazy(() => import("./pages/RecentActivities"));
const WriteBlog = lazy(() => import("./pages/WriteBlog"));
const PostContent = lazy(() => import("./pages/PostContent"));
const Profile = lazy(() => import("./pages/Profile"));
const UpdatePost = lazy(() => import("./pages/UpdatePost"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const Privacy = lazy(() => import("./pages/Privacy"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));

const LoadingFallback = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
      <p className="mt-4 text-gray-600">Loading...</p>
    </div>
  </div>
);

function App() {
  return (
    <Router>
      {/* 3. PLACE IT HERE inside the Router */}
      <ScrollToTop />

      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/" element={<HomePage />} />
          <Route path="/write" element={<WriteBlog />} />
          <Route path="/posts/:id" element={<PostContent />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/update/:postId" element={<UpdatePost />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/profile/:id" element={<PublicProfile />} />

          <Route
            path="/admin/*"
            element={
              <div className="flex">
                <Sidebar />
                <div className="flex-1 max-w-7xl mx-auto">
                  <Routes>
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="users" element={<Users />} />
                    <Route path="users/:id" element={<UserDetail />} />
                    <Route path="users/edit/:id" element={<EditUser />} />
                    <Route path="posts" element={<Posts />} />
                    <Route path="posts/:id" element={<PostDetail />} />
                    <Route path="posts/edit/:id" element={<EditPost />} />
                    <Route path="comments" element={<Comments />} />
                    <Route path="comments/:id" element={<CommentDetail />} />
                    <Route path="comments/edit/:id" element={<EditComment />} />
                    <Route path="recent-activities" element={<RecentActivities />} />
                  </Routes>
                </div>
              </div>
            }
          />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;