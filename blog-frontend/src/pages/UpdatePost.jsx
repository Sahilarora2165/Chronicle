import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../axios";
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import {
  Image as ImageIcon,
  X,
  ArrowLeft,
  Loader2,
  Eye,
  PenLine,
  Bold,
  Italic,
  Code,
  Save,
  Link as LinkIcon,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Quote,
  Minus
} from "lucide-react";
import { motion } from "framer-motion";

const UpdatePost = () => {
  const { postId } = useParams();
  const navigate = useNavigate();

  // State
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  // Image State
  const [existingImageUrl, setExistingImageUrl] = useState(""); // Image from DB
  const [newImageFile, setNewImageFile] = useState(null);       // New upload file
  const [previewUrl, setPreviewUrl] = useState(null);           // Preview of new upload

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [isPreview, setIsPreview] = useState(false);

  // Refs for auto-resizing textareas
  const titleRef = useRef(null);
  const contentRef = useRef(null);
  const token = localStorage.getItem("token");

  // Helper: Auto-resize Textarea
  const autoResize = (elem) => {
    if(elem) {
      elem.style.height = 'auto';
      elem.style.height = elem.scrollHeight + 'px';
    }
  };

  // 1. Fetch Post Data
  useEffect(() => {
    if (!token) {
        navigate("/login");
        return;
    }

    const fetchPost = async () => {
      try {
        const response = await api.get(`/posts/${postId}`);
        const post = response.data;

        setTitle(post.title || "");
        setContent(post.content || "");

        // ✅ Use imageUrl directly from DTO
        if (post.imageUrl) {
            setExistingImageUrl(post.imageUrl);
        }

        // Adjust text area heights after data loads
        setTimeout(() => {
            autoResize(titleRef.current);
            autoResize(contentRef.current);
        }, 100);

      } catch (err) {
        setError("Failed to fetch post details.");
        console.error("Error fetching post:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [postId, token, navigate]);

  // Handlers
  const handleTitleChange = (e) => {
    setTitle(e.target.value);
    autoResize(titleRef.current);
  };

  const handleContentChange = (e) => {
    setContent(e.target.value);
    autoResize(contentRef.current);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setNewImageFile(null);
    setPreviewUrl(null);
    setExistingImageUrl(""); // Logically remove existing image too if user clicks X
  };

  // --- Enhanced Formatting Logic (Matches WriteBlog) ---
  const handleFormat = (type) => {
    const textarea = contentRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const beforeText = content.substring(0, start);
    const afterText = content.substring(end);

    let newText = "";
    let cursorOffset = 0;
    const ensureNewLine = (str) => (str.length > 0 && !str.endsWith('\n') ? '\n' : '');

    switch (type) {
      case "bold":
        newText = `${beforeText}**${selectedText}**${afterText}`;
        cursorOffset = 2;
        break;
      case "italic":
        newText = `${beforeText}*${selectedText}*${afterText}`;
        cursorOffset = 1;
        break;
      case "code":
        newText = `${beforeText}\`${selectedText}\`${afterText}`;
        cursorOffset = 1;
        break;
      case "h1":
        newText = `${beforeText}${ensureNewLine(beforeText)}# ${selectedText}${afterText}`;
        cursorOffset = ensureNewLine(beforeText).length + 2;
        break;
      case "h2":
        newText = `${beforeText}${ensureNewLine(beforeText)}## ${selectedText}${afterText}`;
        cursorOffset = ensureNewLine(beforeText).length + 3;
        break;
      case "quote":
        newText = `${beforeText}${ensureNewLine(beforeText)}> ${selectedText}${afterText}`;
        cursorOffset = ensureNewLine(beforeText).length + 2;
        break;
      case "bullet":
        newText = `${beforeText}${ensureNewLine(beforeText)}- ${selectedText}${afterText}`;
        cursorOffset = ensureNewLine(beforeText).length + 2;
        break;
      case "number":
        newText = `${beforeText}${ensureNewLine(beforeText)}1. ${selectedText}${afterText}`;
        cursorOffset = ensureNewLine(beforeText).length + 3;
        break;
      case "link":
        newText = `${beforeText}[${selectedText || "link text"}](url)${afterText}`;
        cursorOffset = selectedText ? selectedText.length + 3 : 1;
        break;
      case "divider":
        newText = `${beforeText}${ensureNewLine(beforeText)}---\n${afterText}`;
        cursorOffset = ensureNewLine(beforeText).length + 4;
        break;
      default:
        return;
    }

    setContent(newText);
    setTimeout(() => autoResize(textarea), 0);

    setTimeout(() => {
      textarea.focus();
      let newCursorStart = start + cursorOffset;
      let newCursorEnd = end + cursorOffset;

      if(type === 'link' && selectedText) {
         textarea.setSelectionRange(newCursorStart, newCursorStart + 3);
      } else if (selectedText.length > 0 && ["bold", "italic", "code"].includes(type)) {
         textarea.setSelectionRange(newCursorStart, newCursorEnd);
      } else {
         textarea.setSelectionRange(newCursorStart, newCursorStart);
      }
    }, 0);
  };

  // 2. Update Post Logic
  const handleUpdatePost = async () => {
    if (!title || !content.trim()) {
      setError("Title and content are required.");
      return;
    }

    setSaving(true);
    const formData = new FormData();
    const blogPostData = { title, content };

    // Send JSON data
    formData.append("blogPost", new Blob([JSON.stringify(blogPostData)], { type: "application/json" }));

    // Send File only if a new one was selected
    if (newImageFile) {
      formData.append("file", newImageFile);
    }

    try {
      await api.put(`/posts/${postId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      navigate("/profile");
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to update post.";
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const wordCount = content.trim().split(/\s+/).filter(w => w.length > 0).length;

  if (loading) {
    return (
        <div className="h-screen flex items-center justify-center bg-white">
            <Loader2 className="w-8 h-8 animate-spin text-gray-300" />
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-gray-100 selection:text-black">

      {/* 1. Navbar */}
      <nav className="fixed top-0 left-0 w-full bg-white/90 backdrop-blur-sm border-b border-gray-100 z-50 h-16 flex items-center justify-between px-6 md:px-12">
        <div className="flex items-center gap-4">
          <Link to="/profile" className="text-gray-400 hover:text-gray-900 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="text-sm font-medium text-gray-400">
            Editing Story
          </span>
        </div>

        <div className="flex items-center gap-4">
          {error && <span className="text-red-500 text-xs hidden sm:block">{error}</span>}

          <button
              onClick={() => setIsPreview(!isPreview)}
              className="text-gray-500 hover:text-black px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2"
          >
              {isPreview ? <><PenLine className="w-4 h-4"/> Edit</> : <><Eye className="w-4 h-4"/> Preview</>}
          </button>

          <button
              onClick={handleUpdatePost}
              disabled={saving}
              className="bg-black hover:bg-gray-800 text-white px-5 py-1.5 rounded-full text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm hover:shadow-md"
          >
              {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
              Save
          </button>
        </div>
      </nav>

      {/* 2. Main Editor */}
      <main className="pt-24 pb-20 max-w-[800px] mx-auto px-6">

        {/* Preview Mode */}
        {isPreview ? (
           <motion.div
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             className="prose prose-lg prose-slate max-w-none font-serif prose-headings:font-bold prose-h1:text-4xl prose-h2:text-3xl prose-a:text-blue-600"
           >
             {/* Show Image (New or Existing) */}
             {(previewUrl || existingImageUrl) && (
                <img
                    src={previewUrl || existingImageUrl}
                    alt="Cover"
                    className="w-full max-h-[400px] object-cover rounded-xl mb-8"
                />
             )}
             <h1 className="text-5xl font-bold mb-4 leading-tight">{title}</h1>
             <ReactMarkdown remarkPlugins={[remarkBreaks]}>
                {content}
             </ReactMarkdown>
           </motion.div>
        ) : (
        /* Edit Mode */
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

            {/* Cover Image Logic */}
            <div className="group relative mb-8">
                {(!previewUrl && !existingImageUrl) ? (
                    // No image exists -> Show Upload Button
                    <div className="flex items-center gap-4">
                        <label
                            htmlFor="cover-upload"
                            className="flex items-center gap-2 text-gray-400 hover:text-gray-700 cursor-pointer transition-colors py-2"
                        >
                            <div className="p-2 bg-gray-50 rounded-full group-hover:bg-gray-100">
                                <ImageIcon className="w-5 h-5" />
                            </div>
                            <span className="text-sm font-medium">Add cover image</span>
                        </label>
                        <input
                            id="cover-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                        />
                    </div>
                ) : (
                    // Image exists -> Show Image + Remove Button + Change Button
                    <div className="relative group/image">
                        <img
                            src={previewUrl || existingImageUrl}
                            alt="Cover preview"
                            className="w-full h-[300px] md:h-[400px] object-cover rounded-xl shadow-sm"
                        />

                        {/* Remove Button */}
                        <button
                            onClick={handleRemoveImage}
                            className="absolute top-4 right-4 bg-white/90 text-gray-600 hover:text-red-500 p-2 rounded-full shadow-md opacity-0 group-hover/image:opacity-100 transition-all"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        {/* Status Badge */}
                        <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-medium">
                            {previewUrl ? "New Image" : "Current Image"}
                        </div>

                        {/* Change Image Button */}
                        <label
                            htmlFor="cover-upload-change"
                            className="absolute bottom-4 left-4 bg-white/90 hover:bg-white text-gray-700 px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer shadow-md opacity-0 group-hover/image:opacity-100 transition-all"
                        >
                            Change Image
                        </label>
                        <input
                            id="cover-upload-change"
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                        />
                    </div>
                )}
            </div>

            {/* Title Input */}
            <textarea
                ref={titleRef}
                value={title}
                onChange={handleTitleChange}
                placeholder="Title"
                rows={1}
                className="w-full text-4xl md:text-5xl font-serif font-bold text-gray-900 placeholder-gray-300 border-none outline-none focus:ring-0 bg-transparent resize-none overflow-hidden leading-tight mb-4"
            />

            {/* UPGRADED Formatting Toolbar (Matches WriteBlog) */}
            <div className="sticky top-16 z-40 bg-white/95 backdrop-blur-sm py-3 border-b border-gray-100 mb-6 flex flex-wrap items-center gap-1 transition-all">

                {/* Headings */}
                <div className="flex items-center gap-0.5 border-r border-gray-200 pr-2 mr-2">
                    <button onClick={() => handleFormat('h1')} className="p-2 hover:bg-gray-100 rounded text-gray-500 hover:text-black transition-colors" title="Heading 1">
                        <Heading1 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleFormat('h2')} className="p-2 hover:bg-gray-100 rounded text-gray-500 hover:text-black transition-colors" title="Heading 2">
                        <Heading2 className="w-4 h-4" />
                    </button>
                </div>

                {/* Text Style */}
                <div className="flex items-center gap-0.5 border-r border-gray-200 pr-2 mr-2">
                    <button onClick={() => handleFormat('bold')} className="p-2 hover:bg-gray-100 rounded text-gray-500 hover:text-black transition-colors" title="Bold">
                        <Bold className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleFormat('italic')} className="p-2 hover:bg-gray-100 rounded text-gray-500 hover:text-black transition-colors" title="Italic">
                        <Italic className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleFormat('code')} className="p-2 hover:bg-gray-100 rounded text-gray-500 hover:text-black transition-colors" title="Inline Code">
                        <Code className="w-4 h-4" />
                    </button>
                </div>

                {/* Lists & Quotes */}
                <div className="flex items-center gap-0.5 border-r border-gray-200 pr-2 mr-2">
                    <button onClick={() => handleFormat('bullet')} className="p-2 hover:bg-gray-100 rounded text-gray-500 hover:text-black transition-colors" title="Bullet List">
                        <List className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleFormat('number')} className="p-2 hover:bg-gray-100 rounded text-gray-500 hover:text-black transition-colors" title="Numbered List">
                        <ListOrdered className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleFormat('quote')} className="p-2 hover:bg-gray-100 rounded text-gray-500 hover:text-black transition-colors" title="Quote">
                        <Quote className="w-4 h-4" />
                    </button>
                </div>

                {/* Inserts */}
                <div className="flex items-center gap-0.5">
                    <button onClick={() => handleFormat('link')} className="p-2 hover:bg-gray-100 rounded text-gray-500 hover:text-black transition-colors" title="Link">
                        <LinkIcon className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleFormat('divider')} className="p-2 hover:bg-gray-100 rounded text-gray-500 hover:text-black transition-colors" title="Divider">
                        <Minus className="w-4 h-4" />
                    </button>
                </div>

                <span className="text-xs text-gray-400 font-medium ml-auto hidden sm:block">
                    {wordCount} words
                </span>
            </div>

            {/* Content Input */}
            <textarea
                ref={contentRef}
                value={content}
                onChange={handleContentChange}
                placeholder="Tell your story..."
                className="w-full text-lg md:text-xl font-serif text-gray-800 placeholder-gray-300 border-none outline-none focus:ring-0 bg-transparent resize-none min-h-[50vh] leading-relaxed"
            />
        </motion.div>
        )}
      </main>
    </div>
  );
};

export default UpdatePost;