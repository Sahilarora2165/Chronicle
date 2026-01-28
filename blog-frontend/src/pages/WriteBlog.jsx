import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
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
  Link as LinkIcon,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Quote,
  Minus
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const WriteBlog = () => {
  const navigate = useNavigate();

  // State
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isPreview, setIsPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Refs for auto-resizing
  const titleRef = useRef(null);
  const contentRef = useRef(null);
  const token = localStorage.getItem("token");

  // Auto-resize logic
  const autoResize = (elem) => {
    if (elem) {
      elem.style.height = 'auto';
      elem.style.height = elem.scrollHeight + 'px';
    }
  };

  useEffect(() => {
    autoResize(titleRef.current);
    autoResize(contentRef.current);
  }, [title, content, isPreview]);

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
  };

  const handleContentChange = (e) => {
    setContent(e.target.value);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setPreviewUrl(null);
  };

  // Formatting Logic (Markdown insertion)
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

    // Reset focus and cursor
    setTimeout(() => {
      autoResize(textarea);
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

  const handlePublish = async () => {
    if (!token) {
      setError("Please log in to publish.");
      navigate("/login");
      return;
    }
    if (!title || !content.trim()) {
      setError("Please provide a title and story content.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("blogPost", new Blob([JSON.stringify({ title, content })], { type: "application/json" }));
    if (image) formData.append("file", image);

    try {
      await api.post("/posts", formData, { headers: { "Content-Type": "multipart/form-data" } });
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to publish story.");
    } finally {
      setLoading(false);
    }
  };

  const wordCount = content.trim().split(/\s+/).filter(w => w.length > 0).length;

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-black selection:text-white flex flex-col">

      {/* 1. Editor Navigation */}
      <nav className="fixed top-0 left-0 w-full bg-white/95 backdrop-blur-sm border-b border-gray-100 z-50 h-16 flex items-center justify-between px-6 lg:px-12 transition-all">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-gray-400 hover:text-black transition-colors p-1">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="h-6 w-px bg-gray-200 hidden sm:block"></div>
          <span className="text-sm font-serif italic text-gray-400 hidden sm:block">
            {loading ? "Publishing..." : "Drafting"}
          </span>
        </div>

        <div className="flex items-center gap-4">
            {error && <span className="text-red-600 text-xs font-medium animate-pulse hidden sm:block">{error}</span>}

            <button
                onClick={() => setIsPreview(!isPreview)}
                className="text-gray-500 hover:text-black px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2"
            >
                {isPreview ? <><PenLine className="w-4 h-4"/> Edit</> : <><Eye className="w-4 h-4"/> Preview</>}
            </button>

            <button
                onClick={handlePublish}
                disabled={loading}
                className="bg-black text-white px-6 py-2 rounded-full text-sm font-bold tracking-wide transition-all hover:bg-gray-800 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
                {loading && <Loader2 className="w-3 h-3 animate-spin" />}
                Publish
            </button>
        </div>
      </nav>

      {/* 2. Main Writing Area */}
      <main className="flex-grow pt-24 pb-32 max-w-[740px] mx-auto w-full px-6 md:px-8">
        <AnimatePresence mode="wait">

        {/* PREVIEW MODE */}
        {isPreview ? (
             <motion.div
                 key="preview"
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: -10 }}
                 className="prose prose-lg prose-slate max-w-none
                    prose-headings:font-serif prose-headings:font-bold prose-headings:text-gray-900
                    prose-p:font-serif prose-p:text-gray-800 prose-p:leading-[1.8] prose-p:text-[18px]
                    prose-a:text-black prose-a:underline hover:prose-a:text-gray-600
                    prose-blockquote:border-l-2 prose-blockquote:border-black prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:font-serif
                    prose-img:rounded-md prose-img:shadow-sm"
             >
                 {previewUrl && (
                    <img src={previewUrl} alt="Cover" className="w-full aspect-[21/9] object-cover rounded-md mb-10" />
                 )}
                 <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6 leading-tight text-gray-900">
                    {title || "Untitled Story"}
                 </h1>
                 <ReactMarkdown remarkPlugins={[remarkBreaks]}>
                    {content || "*No content yet...*"}
                  </ReactMarkdown>
             </motion.div>
        ) : (

        /* EDIT MODE */
        <motion.div
            key="edit"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            {/* Cover Image */}
            <div className="mb-10 group relative">
                {!previewUrl ? (
                    <div className="flex items-center gap-3">
                        <label
                            htmlFor="cover-upload"
                            className="flex items-center gap-2 text-gray-400 hover:text-black cursor-pointer transition-colors py-2 group/btn"
                        >
                            <div className="p-2 border border-dashed border-gray-300 rounded-full group-hover/btn:border-black group-hover/btn:bg-gray-50 transition-all">
                                <ImageIcon className="w-4 h-4" />
                            </div>
                            <span className="text-sm font-medium">Add a cover image</span>
                        </label>
                        <input id="cover-upload" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    </div>
                ) : (
                    <div className="relative group/image">
                        <img
                            src={previewUrl}
                            alt="Cover preview"
                            className="w-full h-auto max-h-[400px] object-cover rounded-md shadow-sm"
                        />
                        <button
                            onClick={handleRemoveImage}
                            className="absolute top-4 right-4 bg-white/90 text-gray-500 hover:text-red-600 p-2 rounded-full shadow-sm opacity-0 group-hover/image:opacity-100 transition-all scale-90 hover:scale-100"
                        >
                            <X className="w-4 h-4" />
                        </button>
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
                className="w-full text-4xl md:text-5xl font-serif font-bold text-gray-900 placeholder:text-gray-300 border-none outline-none focus:ring-0 bg-transparent resize-none overflow-hidden leading-[1.2] mb-6 px-0"
                style={{ minHeight: '60px' }}
            />

            {/* Sticky Toolbar */}
            <div className="sticky top-16 z-40 bg-white/95 backdrop-blur py-3 border-b border-gray-100 mb-8 flex items-center gap-1 transition-all overflow-x-auto no-scrollbar">

                {/* Group: Headings */}
                <div className="flex items-center pr-2 border-r border-gray-100 mr-2 gap-1">
                    <ToolbarBtn onClick={() => handleFormat('h1')} icon={Heading1} title="Heading 1" />
                    <ToolbarBtn onClick={() => handleFormat('h2')} icon={Heading2} title="Heading 2" />
                </div>

                {/* Group: Styling */}
                <div className="flex items-center pr-2 border-r border-gray-100 mr-2 gap-1">
                    <ToolbarBtn onClick={() => handleFormat('bold')} icon={Bold} title="Bold" />
                    <ToolbarBtn onClick={() => handleFormat('italic')} icon={Italic} title="Italic" />
                    <ToolbarBtn onClick={() => handleFormat('code')} icon={Code} title="Code" />
                </div>

                {/* Group: Lists */}
                <div className="flex items-center pr-2 border-r border-gray-100 mr-2 gap-1">
                    <ToolbarBtn onClick={() => handleFormat('bullet')} icon={List} title="Bullet List" />
                    <ToolbarBtn onClick={() => handleFormat('number')} icon={ListOrdered} title="Numbered List" />
                </div>

                {/* Group: Extras */}
                <div className="flex items-center gap-1">
                    <ToolbarBtn onClick={() => handleFormat('quote')} icon={Quote} title="Quote" />
                    <ToolbarBtn onClick={() => handleFormat('link')} icon={LinkIcon} title="Link" />
                    <ToolbarBtn onClick={() => handleFormat('divider')} icon={Minus} title="Divider" />
                </div>

                {/* Word Count */}
                <span className="ml-auto text-xs text-gray-400 font-medium pl-4 min-w-fit">
                    {wordCount} words
                </span>
            </div>

            {/* Content Input */}
            <textarea
                ref={contentRef}
                value={content}
                onChange={handleContentChange}
                placeholder="Tell your story..."
                className="w-full text-xl font-serif text-gray-800 placeholder:text-gray-300 border-none outline-none focus:ring-0 bg-transparent resize-none min-h-[60vh] leading-[1.8] px-0"
            />
        </motion.div>
        )}
        </AnimatePresence>
      </main>
    </div>
  );
};

// Sub-component for cleaner toolbar code
const ToolbarBtn = ({ onClick, icon: Icon, title }) => (
    <button
        onClick={onClick}
        className="p-2 hover:bg-gray-100 rounded-md text-gray-400 hover:text-black transition-all active:scale-95"
        title={title}
        type="button"
    >
        <Icon className="w-4 h-4" />
    </button>
);

export default WriteBlog;