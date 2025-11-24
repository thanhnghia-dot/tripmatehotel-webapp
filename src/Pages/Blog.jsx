import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { FaUpload, FaClock } from "react-icons/fa";
import AOS from "aos";
import "aos/dist/aos.css";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay, EffectCoverflow } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-coverflow";

import "./Blog.css";

export default function Blog() {
  const [articles, setArticles] = useState([]);
  const [form, setForm] = useState({ title: "", description: "", file: null, hashtags: "" });
  const [preview, setPreview] = useState(null);
  const [zoomImage, setZoomImage] = useState(null);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiProgress, setAiProgress] = useState(0); // 0..100 for UI
  const [activeTab, setActiveTab] = useState("PENDING");
  const [language, setLanguage] = useState("vi");

  // 🔥 NEW: AI Blog from multiple images
  const [blogFiles, setBlogFiles] = useState([]); // File[]
  const [blogFileURLs, setBlogFileURLs] = useState([]); // preview urls
  const [blogPrompt, setBlogPrompt] = useState("");
  const [blogText, setBlogText] = useState(""); // raw text from AI
  const [blogHtml, setBlogHtml] = useState(""); // rendered HTML with images
  const [blogLoading, setBlogLoading] = useState(false);
  const [blogProgress, setBlogProgress] = useState(0);

  const descriptionRef = useRef(null);

  useEffect(() => {
    AOS.init({ duration: 800 });
    fetchArticles();
  }, []);

 const fetchArticles = async () => { 
try { 
const res = await axios.get("http://localhost:8080/api/articles/listArticle"); 
setArticles(res.data); 
} catch (err) { 
console.error("❌ Error loading article:", err); 
} 
};

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
  };

  // =====================
  // SINGLE-IMAGE CAPTION
  // =====================
  const callAiEndpoint = async (file) => {
    try {
      setAiLoading(true);
      setAiProgress(10);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("lang", language);

      // simulate progress visually while waiting
      const progressInterval = setInterval(() => {
        setAiProgress((p) => Math.min(p + Math.floor(Math.random() * 12) + 5, 90));
      }, 700);

      const res = await axios.post(
        "http://localhost:8080/api/ai/generate-caption",
        formData,
        { headers: { "Content-Type": "multipart/form-data" }, timeout: 120000 }
      );

      clearInterval(progressInterval);
      setAiProgress(95);

      let data = res.data;
      if (typeof data !== "string") {
        data = JSON.stringify(data);
      }

      data = data.replace(/```json|```/gi, "").trim();

      const parsed = parseAiPlainText(data);
      setAiProgress(100);

      return parsed;
    } catch (err) {
      console.error("❌ AI API Error:", err);
      return null;
    } finally {
      setAiLoading(false);
      setTimeout(() => setAiProgress(0), 500);
    }
  };

  const parseAiPlainText = (text) => {
    const result = { title: "", description: "", hashtags: "" };
    if (!text) return result;

    const titleLabels = ["Tiêu đề:", "Title:", "タイトル:"];
    const descLabels = ["Mô tả:", "Description:", "説明:"];
    const tagLabels = ["Hashtags:", "ハッシュタグ:"];

    let t = text.replace(/\r/g, "");

    let titleIdx = indexOfAnyLabel(t, titleLabels);
    let descIdx = indexOfAnyLabel(t, descLabels);
    let tagIdx = indexOfAnyLabel(t, tagLabels);

    if (titleIdx === -1 && descIdx === -1 && tagIdx === -1) {
      const lines = t.split("\n").map((l) => l.trim()).filter((l) => l);
      if (lines.length > 0) {
        result.title = lines[0];
        result.description = lines.slice(1).join("\n\n");
        return result;
      }
    }

    const endOfTitle = minPositive(descIdx, tagIdx, t.length);
    if (titleIdx >= 0) {
      result.title = t.substring(titleIdx + findLabelLength(t, titleLabels, titleIdx), endOfTitle).trim();
    }

    const endOfDesc = tagIdx >= 0 ? tagIdx : t.length;
    if (descIdx >= 0) {
      result.description = t.substring(descIdx + findLabelLength(t, descLabels, descIdx), endOfDesc).trim();
    }

    if (tagIdx >= 0) {
      result.hashtags = t.substring(tagIdx + findLabelLength(t, tagLabels, tagIdx)).trim();
    }

    if (!result.title) {
      const firstLine = t.split("\n").find((l) => l.trim());
      if (firstLine) result.title = firstLine.trim();
    }
    if (!result.description && result.title) {
      const remainder = t.replace(result.title, "").trim();
      if (remainder) result.description = remainder;
    }

    return result;
  };

  const indexOfAnyLabel = (text, labels) => {
    const lower = text.toLowerCase();
    for (let i = 0; i < labels.length; i++) {
      const lbl = labels[i].toLowerCase();
      const idx = lower.indexOf(lbl);
      if (idx !== -1) return idx;
    }
    return -1;
  };

  const findLabelLength = (text, labels, idx) => {
    const substr = text.substring(idx);
    for (const lbl of labels) {
      if (substr.toLowerCase().startsWith(lbl.toLowerCase())) return lbl.length;
    }
    const m = substr.match(/^.+?:/);
    return m ? m[0].length : 0;
  };

  const minPositive = (a, b, defVal) => {
    const vals = [a, b].filter((v) => v >= 0);
    if (vals.length === 0) return defVal;
    return Math.min(...vals);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm({ ...form, file });
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleGenerateTitle = async () => {
if (!form.file) {
alert("⚠ Please select an image before generating a title!");
return;
}
const parsed = await callAiEndpoint(form.file);
if (parsed) {
setForm((prev) => ({
...prev,
title: parsed.title || prev.title,
description: parsed.description || prev.description,
hashtags: parsed.hashtags || prev.hashtags || "",
}));
setTimeout(() => {
if (descriptionRef.current) descriptionRef.current.focus();
}, 200);
} else {
alert("⚠ AI failed to generate content, try again later.");
}
};

const handleRegenerate = async () => {
if (!form.file) {
alert("⚠ Please select an image before regenerating!");
return;
}
    const parsed = await callAiEndpoint(form.file);
    if (parsed) {
      setForm((prev) => ({
        ...prev,
        title: parsed.title || prev.title,
        description: parsed.description || prev.description,
        hashtags: parsed.hashtags || prev.hashtags || "",
      }));
      if (descriptionRef.current) descriptionRef.current.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!form.title.trim()) newErrors.title = "⚠ Title is required";
    if (!form.description.trim()) newErrors.description = "⚠ Description is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("hashtags", form.hashtags || "");

      // 🔥 Nếu multi-image AI blog có file thì upload hết
      if (blogFiles.length > 0) {
        blogFiles.forEach((f) => formData.append("files", f));
      }

      const token = localStorage.getItem("token");
      const res = await axios.post("http://localhost:8080/api/articles/upload", formData, {
        headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` },
      });

      setArticles((prev) => [res.data, ...prev]);
      setForm({ title: "", description: "", hashtags: "" });
      setBlogFiles([]);
      setBlogFileURLs([]);
      setBlogHtml("");
      setBlogText("");
    } catch (err) {
      console.error("❌ Error uploading article:", err);
      alert("⚠ Upload failed! Please login again.");
    } finally {
      setLoading(false);
    }
  };


  const handleDelete = async (id) => {
if (!window.confirm("🗑 Are you sure you want to delete this article?")) return;
try {
const token = localStorage.getItem("token");
await axios.delete(`http://localhost:8080/api/articles/${id}`, {
headers: { Authorization: `Bearer ${token}` },
});
setArticles((prev) => prev.filter((a) => a.id !== id));
setSelectedArticle(null);
alert("✅ Article deleted successfully!");
} catch (err) {
console.error("❌ Error deleting article:", err);
alert("⚠ Article could not be deleted!");
}
};

  const filteredArticles = articles.filter((a) => a.status === activeTab);

  const renderArticleCard = (a) => (
    <SwiperSlide key={a.id} style={{ width: "300px" }}>
      <div className="article-card" data-aos="fade-up">
        <div className="card-image" onClick={() => setZoomImage(a.image)}>
          <img src={a.image} alt={a.title} />
          <div className="image-overlay">🔍 Click to View</div>
        </div>
        <div className="card-body">
          <h3 className="card-title">{a.title}</h3>
          <p className="card-desc">{a.description?.slice(0, 120)}...</p>
          <div className="card-footer">
            <div className="card-date">
              <FaClock style={{ marginRight: 6 }} />
              {new Date(a.createdAt).toLocaleString()}
            </div>
            <div className="card-buttons">
              <button className="detail-btn" onClick={() => setSelectedArticle(a)}>
                🔍 Detail
              </button>
            </div>
          </div>
        </div>
      </div>
    </SwiperSlide>
  );

  // ==============================
  // NEW: MULTI-IMAGE BLOG SECTION
  // ==============================
  const onBlogFilesChange = (e) => {
    const files = Array.from(e.target.files || []);
    setBlogFiles(files);
    const urls = files.map((f) => URL.createObjectURL(f));
    setBlogFileURLs(urls);
  };

  const moveImage = (index, dir) => {
    const newFiles = [...blogFiles];
    const newURLs = [...blogFileURLs];
    const target = index + dir;
    if (target < 0 || target >= newFiles.length) return;
    [newFiles[index], newFiles[target]] = [newFiles[target], newFiles[index]];
    [newURLs[index], newURLs[target]] = [newURLs[target], newURLs[index]];
    setBlogFiles(newFiles);
    setBlogFileURLs(newURLs);
  };
  const handleGenerateBlog = async () => {
    if (blogFiles.length === 0) {
      alert("⚠ Please select at least 1 image!");
      return;
    }
    if (!blogPrompt.trim()) {
      alert("⚠ Please enter a prompt for AI!");
      return;
    }

    try {
      setBlogLoading(true);
      setBlogProgress(10);

      const fd = new FormData();
      blogFiles.forEach((f) => fd.append("files", f));
      fd.append("prompt", blogPrompt);
      fd.append("lang", language);

      const progressInterval = setInterval(() => {
        setBlogProgress((p) => Math.min(p + Math.floor(Math.random() * 12) + 6, 92));
      }, 700);

      const res = await axios.post("http://localhost:8080/api/ai/generate-blog", fd, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 180000,
      });

      clearInterval(progressInterval);
      setBlogProgress(98);

      const text = typeof res.data === "string" ? res.data : JSON.stringify(res.data);
      setBlogText(text);

      const html = renderBlogHTMLWithImages(text, blogFileURLs);
      setBlogHtml(html);

      // 🔥 NEW: tự động điền Title và Description xuống form publish
      const sections = parseBlogSections(text);
      setForm((prev) => ({
        ...prev,
        title: sections.title || prev.title,
        description: (sections.intro + "\n\n" + sections.body + "\n\n" + sections.conclusion).trim() || prev.description,
      }));

      setBlogProgress(100);
    } catch (e) {
      console.error("❌ Blog AI Error:", e);
      alert("⚠ AI không tạo được blog. Vui lòng thử lại!");
    } finally {
      setBlogLoading(false);
      setTimeout(() => setBlogProgress(0), 700);
    }
  };


  const escapeHtml = (s) =>
    s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  // Replace tokens <img1>, <img2> ... or [IMG1], {img1} with actual images in order
  const renderBlogHTMLWithImages = (text, urls) => {
    if (!text) return "";

    const sections = parseBlogSections(text);

    const safe = escapeHtml(
      [sections.title && `# ${sections.title}`, sections.intro, sections.body, sections.conclusion, sections.hashtags && `\n${sections.hashtags}`]
        .filter(Boolean)
        .join("\n\n")
    );

    // Split text thành các đoạn (paragraphs)
    let paragraphs = safe.split(/\n{2,}/).map(p => p.trim()).filter(Boolean);

    const htmlParts = [];

    let imgIdx = 0;
    paragraphs.forEach((p, i) => {
      // Nếu đoạn đầu tiên là tiêu đề markdown, chuyển thành <h2>
      if (i === 0 && p.startsWith("# ")) {
        htmlParts.push(`<h2>${p.replace(/^# /, "")}</h2>`);
      } else {
        htmlParts.push(`<p>${p}</p>`);
      }

      // Xen ảnh sau mỗi 1-2 đoạn (tuỳ ý)
      if (imgIdx < urls.length && i % 1 === 0) {
        htmlParts.push(`
          <figure class="blog-img">
            <img src="${urls[imgIdx]}" alt="img${imgIdx + 1}" />
            <figcaption>Image ${imgIdx + 1}</figcaption>
          </figure>
        `);
        imgIdx++;
      }
    });

    return htmlParts.join("\n");
  };


  const parseBlogSections = (text) => {
    const obj = { title: "", intro: "", body: "", conclusion: "", hashtags: "" };
    const t = text.replace(/\r/g, "");

    const map = [
      { keys: ["Tiêu đề:", "Title:", "タイトル:"], prop: "title" },
      { keys: ["Mở đầu:", "Introduction:", "Intro:"], prop: "intro" },
      { keys: ["Thân bài:", "Body:"], prop: "body" },
      { keys: ["Kết luận:", "Conclusion:"], prop: "conclusion" },
      { keys: ["Hashtags:", "ハッシュタグ:"], prop: "hashtags" },
    ];

    const idx = {};
    map.forEach(({ keys, prop }) => {
      idx[prop] = indexOfAnyLabel(t, keys);
    });

    const order = Object.entries(idx)
      .filter(([, v]) => v >= 0)
      .sort((a, b) => a[1] - b[1])
      .map(([k]) => k);

    const endIdx = (prop) => {
      const pos = order.indexOf(prop);
      if (pos === -1) return t.length;
      const next = order[pos + 1];
      return next ? idx[next] : t.length;
    };

    map.forEach(({ keys, prop }) => {
      if (idx[prop] >= 0) {
        const start = idx[prop] + findLabelLength(t, keys, idx[prop]);
        obj[prop] = t.substring(start, endIdx(prop)).trim();
      }
    });

    if (!obj.title) {
      const first = t.split("\n").find((l) => l.trim());
      if (first) obj.title = first.trim();
    }

    return obj;
  };

  return (
    <div className="blog-container">
      <header className="blog-header" data-aos="fade-down">
        <h1>📝 My Blog</h1>
        <p>Welcome to Tripmate Blog – Share your travel experiences!</p>
      </header>

      {/* ============== NEW: AI BLOG GENERATOR ============== */}
      <section className="ai-blog" data-aos="fade-up">
        <h2>✨ AI Blog Generator </h2>
        <p className="hint">Upload multiple images (in the order you want them displayed), enter your requirements, and press Generate.</p>

        <div className="ai-row">
          <label>Language:</label>
          <select value={language} onChange={(e) => setLanguage(e.target.value)}>
            <option value="vi">🇻🇳 Tiếng Việt</option>
            <option value="en">🇺🇸 English</option>
            <option value="ja">🇯🇵 日本語</option>
          </select>
        </div>



        <div className="ai-row">
          <label>Photos (multiple selections available):</label>
          <input type="file" accept="image/*" multiple onChange={onBlogFilesChange} />

          {/* 🔥 Preview ảnh đã chọn với nút X */}
          {blogFileURLs.length > 0 && (
            <div className="preview-multi-images">
              {blogFileURLs.map((url, i) => (
                <div key={i} className="preview-thumb">
                  <img src={url} alt={`img-${i + 1}`} />
                  <div className="preview-index">{i + 1}</div>

                  {/* Nút X để xóa ảnh */}
                  <button
                    type="button"
                    className="remove-thumb"
                    onClick={() => {
                      const newFiles = [...blogFiles];
                      const newURLs = [...blogFileURLs];
                      newFiles.splice(i, 1);
                      newURLs.splice(i, 1);
                      setBlogFiles(newFiles);
                      setBlogFileURLs(newURLs);
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>



        <div className="ai-row">
          <label>Requirements for AI (prompt):</label>
          <textarea
            value={blogPrompt}
            onChange={(e) => setBlogPrompt(e.target.value)}
            placeholder=" For example: Write a blog about trekking Fansipan, inspirational writing style, insert photos in the right places."
          />
        </div>

        {blogLoading && (
          <div className="progress">
            <div>{blogProgress < 100 ? `🤖 AI generating blog...(${blogProgress}%)` : "✅ Done"}</div>
            <div className="bar">
              <div className="bar-inner" style={{ width: `${blogProgress}%` }} />
            </div>
          </div>
        )}

        <div className="ai-actions">
          <button type="button" className="submit-btn" onClick={handleGenerateBlog} disabled={blogLoading}>
            {blogLoading ? "Creating..." : "✨ Generate Blog"}
          </button>
        </div>

        {blogText && (
          <details className="raw-text">
            <summary>🗒️ View raw text from AI</summary>
            <pre>{blogText}</pre>
          </details>
        )}

        {blogHtml && (
          <div className="blog-preview" data-aos="fade-up">
            <h3>👀 Preview</h3>
            <div className="blog-render" dangerouslySetInnerHTML={{ __html: blogHtml }} />
          </div>
        )}
      </section>

      {/* ============== OLD: SINGLE-IMAGE ARTICLE FORM ============== */}
      <form className="blog-form" onSubmit={handleSubmit} data-aos="fade-up">

        <label>Title</label>
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          className={errors.title ? "error" : ""}
          placeholder="Enter blog title..."
          disabled={aiLoading}
        />
        {errors.title && <p className="error-text">{errors.title}</p>}

        <label>Description</label>
        <textarea
          name="description"
          ref={descriptionRef}
          value={form.description}
          onChange={handleChange}
          className={errors.description ? "error" : ""}
          placeholder="Write something interesting..."
          disabled={aiLoading}
        />
        {errors.description && <p className="error-text">{errors.description}</p>}



        {aiLoading && (
          <div style={{ marginBottom: 8 }}>
            <div style={{ marginBottom: 6 }}>
              {aiProgress < 100 ? `🤖 AI is composing... (${aiProgress}%)` : "✅ AI hoàn tất"}
            </div>
            <div style={{ background: "#eee", height: 8, borderRadius: 4 }}>
              <div style={{ width: `${aiProgress}%`, height: "100%", background: "#ff9800", borderRadius: 4 }} />
            </div>
          </div>
        )}


        <input type="file" id="file-upload" style={{ display: "none" }} onChange={handleFileChange} />
        {errors.file && <p className="error-text">{errors.file}</p>}

        {/* 🔥 Preview ảnh: nếu single image hoặc multi-image */}
        <div className="preview-container">
          {/* Single image */}
          {preview && blogFiles.length === 0 && (
            <img src={preview} className="preview-img" alt="Preview" />
          )}

          {/* Multi-image (AI Blog) */}
          {blogFileURLs.length > 0 && (
            <div className="preview-multi-images">
              {blogFileURLs.map((url, i) => (
                <div key={i} className="preview-thumb">
                  <img src={url} alt={`img-${i + 1}`} />
                  <div className="preview-index">{i + 1}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        <button type="submit" className="submit-btn" disabled={loading} style={{ marginTop: 10 }}>
          {loading ? "Uploading..." : "✨ Upload Blog"}
        </button>
      </form>

      {/* Tabs */}
      <div className="tabs-container" data-aos="fade-up">
        <button className={`tab-btn ${activeTab === "PENDING" ? "active" : ""}`} onClick={() => setActiveTab("PENDING")}>
          ⏳ Article is pending approval
        </button>
        <button className={`tab-btn ${activeTab === "APPROVED" ? "active" : ""}`} onClick={() => setActiveTab("APPROVED")}>
          ✅ Approved article
        </button>
      </div>

      {filteredArticles.length === 0 ? (
        <p className="empty-text">📭No posts</p>
      ) : (
        <div className="blog-list">
          {filteredArticles.map((a, idx) => (
            <article key={a.id} className={`blog-item ${idx % 2 === 0 ? "normal" : "reverse"}`} data-aos="fade-up">
              <div className="blog-images">
                {a.image ? (() => {
                  let urls = [];
                  try {
                    // thử parse nếu là JSON array
                    urls = JSON.parse(a.image);
                  } catch {
                    urls = [a.image]; // nếu không parse được thì coi là single URL
                  }
                  return urls.map((url, i) => (
                    <img key={i} src={url} alt={`img-${i + 1}`} />
                  ));
                })() : null}
              </div>

              <div className="blog-content">
                <h2>{a.title}</h2>
                <p>{a.description}</p>
                <div className="blog-meta">
                  <span>{new Date(a.createdAt).toLocaleDateString()}</span>
                  {a.user && <span>by {a.user.name}</span>}
                </div>
              </div>
            </article>
          ))}
        </div>

      )}

      {/* Zoom Image */}
      {zoomImage && (
        <div className="zoom-overlay" onClick={() => setZoomImage(null)}>
          <div className="zoom-container">
            <img src={zoomImage} alt="Zoom" />
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedArticle && (
        <div className="zoom-overlay" onClick={() => setSelectedArticle(null)}>
          <div className="zoom-container" onClick={(e) => e.stopPropagation()}>
            <h2>{selectedArticle.title}</h2>
            <img src={selectedArticle.image} alt={selectedArticle.title} style={{ width: "100%", borderRadius: 8, marginBottom: 10 }} />
            <p>
              <strong>Description:</strong> {selectedArticle.description}
            </p>
            <p>
              <strong>Created At:</strong> {new Date(selectedArticle.createdAt).toLocaleString()}
            </p>
            {selectedArticle.user && (
              <p>
                <strong>Author:</strong> {selectedArticle.user.name} ({selectedArticle.user.email})
              </p>
            )}
            <button
              onClick={() => handleDelete(selectedArticle.id)}
              style={{
                marginTop: 10,
                padding: "8px 16px",
                background: "#ff4d4f",
                color: "white",
                border: "none",
                borderRadius: 5,
                cursor: "pointer",
                marginRight: 10,
              }}
            >
              🗑 Delete
            </button>
            <button
              style={{
                marginTop: 10,
                padding: "8px 16px",
                background: "#007bff",
                color: "white",
                border: "none",
                borderRadius: 5,
                cursor: "pointer",
              }}
              onClick={() => setSelectedArticle(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
