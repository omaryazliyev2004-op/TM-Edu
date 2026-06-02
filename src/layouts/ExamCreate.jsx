import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchApi } from "../api/user.api";

export default function ExamCreate() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [topic, setTopic] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [deadlineDate, setDeadlineDate] = useState("");
  const [deadlineTime, setDeadlineTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [topics, setTopics] = useState([]);
  const [topicsLoading, setTopicsLoading] = useState(false);

  const editorRef = useRef(null);

  // Load lessons for dropdown
  useEffect(() => {
    async function loadLessons() {
      setTopicsLoading(true);
      try {
        const res = await fetchApi(`lessons/my/group/${id}`);
        if (res.status === 200) {
          setTopics(res.data?.data || res.data || []);
        }
      } catch (err) {
        console.error("Error loading lessons for dropdown:", err);
      } finally {
        setTopicsLoading(false);
      }
    }
    loadLessons();
  }, [id]);

  // Execute editor command
  const execCmd = (command, value = null) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      setDescription(editorRef.current.innerHTML);
    }
  };

  const handleEditorInput = () => {
    if (editorRef.current) {
      setDescription(editorRef.current.innerHTML);
    }
  };

  // Submit Exam
  const createExam = async () => {
    const cleanDesc = description.replace(/<[^>]*>/g, "").trim();
    if (!topic || !cleanDesc || !deadlineDate || !deadlineTime) {
      alert("Iltimos, barcha majburiy maydonlarni to'ldiring!");
      return;
    }

    setLoading(true);
    try {
      const deadlineISO = `${deadlineDate}T${deadlineTime}:00`;
      const formData = new FormData();
      formData.append("lesson_id", topic);
      formData.append("group_id", id);
      formData.append("description", description);
      formData.append("deadline", deadlineISO);
      if (file) {
        formData.append("file", file);
      }

      const res = await fetchApi.post("exams", formData);
      if (res.status === 200 || res.status === 201) {
        alert("Imtihon muvaffaqiyatli e'lon qilindi!");
        navigate(`/dashboard/sinflar/${id}`);
      }
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || err.response?.data?.error || "Xatolik yuz berdi.";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "24px", minHeight: "100vh", background: "#fff" }}>
      <style>{`
        .ec-container {
          max-width: 720px;
          margin: 0;
          font-family: 'Outfit', 'Inter', sans-serif;
        }
        
        .ec-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
        }

        .ec-back-btn {
          background: none;
          border: none;
          font-size: 18px;
          color: #334155;
          cursor: pointer;
          padding: 8px 12px 8px 0;
          display: flex;
          align-items: center;
          transition: transform 0.2s;
        }

        .ec-back-btn:hover {
          transform: translateX(-3px);
        }

        .ec-title {
          font-size: 24px;
          font-weight: 700;
          color: #1e293b;
          margin: 0;
        }

        .ec-info-box {
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          border-radius: 8px;
          padding: 12px 16px;
          display: flex;
          align-items: flex-start;
          gap: 12px;
          font-size: 14px;
          color: #1e40af;
          margin-bottom: 24px;
          line-height: 1.5;
        }

        .ec-info-box i {
          font-size: 18px;
          margin-top: 1px;
          flex-shrink: 0;
        }

        .ec-form {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .ec-field {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .ec-label {
          font-size: 14px;
          font-weight: 600;
          color: #1e293b;
        }

        .ec-label span {
          color: #ef4444;
          margin-right: 4px;
        }

        .ec-select, .ec-input {
          width: 100%;
          height: 44px;
          border: 1.5px solid #e2e8f0;
          border-radius: 8px;
          font-size: 14px;
          color: #334155;
          background: #fff;
          outline: none;
          box-sizing: border-box;
          padding: 0 14px;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .ec-select {
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23475569' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 14px center;
          padding-right: 36px;
        }

        .ec-select:focus, .ec-input:focus {
          border-color: #10b981;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
        }

        /* Rich Text Editor Styling */
        .ec-editor-container {
          border: 1.5px solid #e2e8f0;
          border-radius: 8px;
          overflow: hidden;
          background: #fff;
          transition: border-color 0.2s;
        }

        .ec-editor-container:focus-within {
          border-color: #10b981;
        }

        .ec-editor-toolbar {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 4px;
          padding: 8px;
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
          user-select: none;
        }

        .ec-tb-btn {
          height: 32px;
          min-width: 32px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 1px solid transparent;
          background: transparent;
          border-radius: 4px;
          color: #475569;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s;
          padding: 0 6px;
        }

        .ec-tb-btn:hover {
          background: #f1f5f9;
          color: #0f172a;
        }

        .ec-tb-btn:active {
          background: #e2e8f0;
        }

        .ec-tb-select {
          height: 32px;
          border: 1.5px solid #e2e8f0;
          border-radius: 4px;
          padding: 0 24px 0 8px;
          font-size: 13px;
          color: #475569;
          background: #fff;
          cursor: pointer;
          outline: none;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 12 12'%3E%3Cpath fill='%23475569' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 8px center;
        }

        .ec-editor-area {
          min-height: 180px;
          padding: 16px;
          outline: none;
          font-size: 14px;
          line-height: 1.6;
          color: #334155;
          overflow-y: auto;
        }

        .ec-editor-area blockquote {
          border-left: 3px solid #cbd5e1;
          margin-left: 0;
          padding-left: 12px;
          color: #64748b;
          font-style: italic;
        }

        .ec-editor-area pre {
          background: #f1f5f9;
          padding: 8px 12px;
          border-radius: 6px;
          font-family: monospace;
          font-size: 13px;
        }

        /* Upload styling */
        .ec-upload-box {
          border: 1.5px dashed #e2e8f0;
          border-radius: 8px;
          background: #f8fafc;
          padding: 16px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: border-color 0.2s, background 0.2s;
        }

        .ec-upload-box:hover {
          border-color: #10b981;
          background: #f0fdf4;
        }

        .ec-upload-btn-text {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 500;
          color: #475569;
        }

        .ec-upload-btn-text i {
          font-size: 16px;
        }

        .ec-file-info {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: #10b981;
          font-weight: 600;
          margin-top: 8px;
        }

        /* Row of date and time */
        .ec-row-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        @media (max-width: 600px) {
          .ec-row-2 {
            grid-template-columns: 1fr;
            gap: 16px;
          }
        }

        /* Input icons styling */
        .ec-input-wrapper {
          position: relative;
        }

        .ec-input-wrapper i {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
          pointer-events: none;
        }

        .ec-footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 24px;
          margin-bottom: 40px;
        }

        .ec-btn {
          height: 44px;
          padding: 0 32px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
        }

        .ec-btn-cancel {
          background: #f1f5f9;
          color: #475569;
          border: 1px solid #e2e8f0;
        }

        .ec-btn-cancel:hover {
          background: #e2e8f0;
          color: #0f172a;
        }

        .ec-btn-submit {
          background: #10b981;
          color: #fff;
        }

        .ec-btn-submit:hover {
          background: #059669;
        }

        .ec-btn-submit:disabled {
          background: #cbd5e1;
          cursor: not-allowed;
        }
      `}</style>

      <div className="ec-container">
        {/* Header */}
        <div className="ec-header">
          <button className="ec-back-btn" onClick={() => navigate(`/dashboard/sinflar/${id}`)}>
            <i className="fa-solid fa-chevron-left"></i>
          </button>
          <h1 className="ec-title">Imtihon yaratish</h1>
        </div>

        {/* Info box */}
        <div className="ec-info-box">
          <i className="fa-solid fa-circle-info"></i>
          <span>Oxirgi 7 kundagi uyga vazifa berilmagan mavzularni tanlay olasiz!</span>
        </div>

        {/* Form */}
        <div className="ec-form">
          {/* Mavzu dropdown */}
          <div className="ec-field">
            <label className="ec-label">
              <span>*</span>Mavzu
            </label>
            <select
              className="ec-select"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              disabled={loading || topicsLoading}
            >
              <option value="">Mavzulardan birini tanlang</option>
              {topics.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.topic}
                </option>
              ))}
            </select>
          </div>

          {/* Izoh Rich text editor */}
          <div className="ec-field">
            <label className="ec-label">
              <span>*</span>Izoh
            </label>
            <div className="ec-editor-container">
              {/* Toolbar */}
              <div className="ec-editor-toolbar">
                <button type="button" className="ec-tb-btn" onClick={() => execCmd("formatBlock", "h1")}>H1</button>
                <button type="button" className="ec-tb-btn" onClick={() => execCmd("formatBlock", "h2")}>H2</button>
                
                {/* Font Selector */}
                <select 
                  className="ec-tb-select" 
                  defaultValue="sans-serif"
                  onChange={(e) => execCmd("fontName", e.target.value)}
                >
                  <option value="sans-serif">Sans Serif</option>
                  <option value="serif">Serif</option>
                  <option value="monospace">Monospace</option>
                </select>

                {/* Size Selector */}
                <select 
                  className="ec-tb-select" 
                  defaultValue="3"
                  onChange={(e) => execCmd("fontSize", e.target.value)}
                >
                  <option value="2">Small</option>
                  <option value="3">Normal</option>
                  <option value="5">Large</option>
                  <option value="7">Huge</option>
                </select>

                {/* Basic styles */}
                <button type="button" className="ec-tb-btn" style={{ fontWeight: "bold" }} onClick={() => execCmd("bold")}>B</button>
                <button type="button" className="ec-tb-btn" style={{ fontStyle: "italic" }} onClick={() => execCmd("italic")}>I</button>
                <button type="button" className="ec-tb-btn" style={{ textDecoration: "underline" }} onClick={() => execCmd("underline")}>U</button>
                <button type="button" className="ec-tb-btn" style={{ textDecoration: "line-through" }} onClick={() => execCmd("strikeThrough")}>S</button>
                
                {/* Formatting */}
                <button type="button" className="ec-tb-btn" onClick={() => execCmd("formatBlock", "blockquote")}>
                  <i className="fa-solid fa-quote-left"></i>
                </button>
                <button type="button" className="ec-tb-btn" onClick={() => execCmd("formatBlock", "pre")}>
                  <i className="fa-solid fa-code"></i>
                </button>
                
                {/* Lists */}
                <button type="button" className="ec-tb-btn" onClick={() => execCmd("insertUnorderedList")}>
                  <i className="fa-solid fa-list-ul"></i>
                </button>
                <button type="button" className="ec-tb-btn" onClick={() => execCmd("insertOrderedList")}>
                  <i className="fa-solid fa-list-ol"></i>
                </button>
                
                {/* Indentation */}
                <button type="button" className="ec-tb-btn" onClick={() => execCmd("outdent")}>
                  <i className="fa-solid fa-outdent"></i>
                </button>
                <button type="button" className="ec-tb-btn" onClick={() => execCmd("indent")}>
                  <i className="fa-solid fa-indent"></i>
                </button>

                {/* Link */}
                <button 
                  type="button" 
                  className="ec-tb-btn" 
                  onClick={() => {
                    const url = prompt("Link manzilini kiriting:");
                    if (url) execCmd("createLink", url);
                  }}
                >
                  <i className="fa-solid fa-link"></i>
                </button>
              </div>

              {/* Editable area */}
              <div
                ref={editorRef}
                className="ec-editor-area"
                contentEditable={true}
                onInput={handleEditorInput}
                placeholder="Izoh kiriting..."
                style={{ minHeight: "150px" }}
              />
            </div>
          </div>

          {/* Yuklash file input */}
          <div className="ec-field">
            <input
              type="file"
              id="ec-file-input"
              style={{ display: "none" }}
              onChange={(e) => {
                if (e.target.files.length > 0) {
                  setFile(e.target.files[0]);
                }
              }}
            />
            <div className="ec-upload-box" onClick={() => document.getElementById("ec-file-input").click()}>
              <div className="ec-upload-btn-text">
                <i className="fa-solid fa-arrow-down-to-bracket"></i>
                Yuklash
              </div>
              {file && (
                <div className="ec-file-info">
                  <i className="fa-solid fa-paperclip"></i>
                  {file.name}
                </div>
              )}
            </div>
          </div>

          {/* Row for Tugash sanasi and vaqti */}
          <div className="ec-row-2">
            {/* Tugash sanasi */}
            <div className="ec-field">
              <label className="ec-label">
                <span>*</span>Tugash sanasi
              </label>
              <div className="ec-input-wrapper">
                <input
                  type="date"
                  className="ec-input"
                  value={deadlineDate}
                  onChange={(e) => setDeadlineDate(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Tugash vaqti */}
            <div className="ec-field">
              <label className="ec-label">
                <span>*</span>Tugash vaqti
              </label>
              <div className="ec-input-wrapper">
                <input
                  type="time"
                  className="ec-input"
                  value={deadlineTime}
                  onChange={(e) => setDeadlineTime(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="ec-footer">
            <button
              type="button"
              className="ec-btn ec-btn-cancel"
              onClick={() => navigate(`/dashboard/sinflar/${id}`)}
              disabled={loading}
            >
              Bekor qilish
            </button>
            <button
              type="button"
              className="ec-btn ec-btn-submit"
              onClick={createExam}
              disabled={loading || !topic || !description.trim() || !deadlineDate || !deadlineTime}
            >
              {loading ? "Saqlanmoqda..." : "E'lon qilish"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
