import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchApi } from "../api/user.api";

export default function HomeworkCreate() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [topic, setTopic] = useState(0);
  const [description, setDescription] = useState("");

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [topics, setTopics] = useState([]);

  const create = async () => {
     if (!topic.trim() || !description.trim()) {
        alert("Mavzu va izoh majburiy maydonlar");
        return;
      }

    setLoading(true);
    try {
      const formData = new FormData();

      formData.append("lesson_id", topic);
      formData.append("group_id", id);
      if (file) {
      formData.append("file", file);}
      formData.append("title", description);

      const res = await fetchApi.post("homework", formData);

      if (res.status === 200 || res.status === 201) {
        window.location.reload();
        console.log(res);
      }
    } catch (error) {
      alert("Xatolik yuz berdi. Iltimos barcha ma'lumotlarni to'ldiring.");
      console.log(error);
    }
  };

  useEffect(() => {
    async function fetchTopics() {
      try {
        const res = await fetchApi(`lessons/my/group/${id}`);
        if (res.status === 200) {
          setTopics(res.data?.data);
        }
        console.log(res.data?.data);
      } catch (error) {
        console.error(error);
      }
    }
    fetchTopics();
  }, []);

  // Handle file drop
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      setFile(files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleFileInput = (e) => {
    if (e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };


  return (
    <div style={{ padding: "20px 0" }}>
      <style>{`
        .hw-container { max-width: 800px; margin: 0 auto; }
        .hw-header { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; }
        .hw-back { background: none; border: none; font-size: 20px; color: #222; cursor: pointer; padding: 0; }
        .hw-title { font-size: 22px; font-weight: 700; color: #222; margin: 0; }
        .hw-field { margin-bottom: 20px; }
        .hw-label { display: block; font-size: 14px; font-weight: 600; color: #222; margin-bottom: 8px; }
        .hw-label span { color: #e53935; }
        .hw-input { width: 100%; height: 42px; border-radius: 8px; border: 1.5px solid #e2e8f0; padding: 0 12px; font-size: 14px; outline: none; background: #fff; box-sizing: border-box; }
        .hw-input:focus { border-color: #765bcf; }
        .hw-input[type="select"], .hw-input option { color: #222; }
        .hw-textarea { width: 100%; min-height: 200px; border-radius: 8px; border: 1.5px solid #e2e8f0; padding: 12px; font-size: 14px; outline: none; resize: vertical; background: #fff; box-sizing: border-box; font-family: inherit; }
        .hw-textarea:focus { border-color: #765bcf; }
        .hw-upload { border: 2px dashed #ddd; border-radius: 8px; padding: 40px 20px; text-align: center; cursor: pointer; transition: 0.2s; background: #fafafa; }
        .hw-upload:hover { border-color: #765bcf; background: #f5f0ff; }
        .hw-upload-icon { font-size: 32px; color: #765bcf; margin-bottom: 12px; }
        .hw-upload-text { font-size: 14px; color: #666; }
        .hw-file-input { display: none; }
        .hw-file-name { font-size: 13px; color: #765bcf; font-weight: 600; margin-top: 12px; }
        .hw-footer { display: flex; gap: 12px; margin-top: 24px; }
        .hw-btn { height: 42px; padding: 0 24px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; border: none; }
        .hw-btn-cancel { border: 1px solid #e0e0e0; background: #fff; color: #444; flex: 1; }
        .hw-btn-cancel:hover { background: #f5f5f5; }
        .hw-btn-submit { background: #16a34a; color: #fff; flex: 1; }
        .hw-btn-submit:hover { background: #15803d; }
        .hw-btn-submit:disabled { background: #ccc; cursor: not-allowed; }
      `}</style>

      <div className="hw-container">
        {/* Header */}
        <div className="hw-header">
          <button
            className="hw-back"
            onClick={() => navigate(`/dashboard/sinflar/${id}`)}
          >
            <i className="fa-solid fa-chevron-left"></i>
          </button>
          <h1 className="hw-title">Yangi uyga vazifa yaratish</h1>
        </div>

        {/* Form */}
        <div className="hw-field">
          <label className="hw-label">
            Mavzu <span>*</span>
          </label>
          <select
            className="hw-input"
            style={{
              appearance: "none",
              paddingRight: "30px",
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23222' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 12px center",
              backgroundSize: "12px",
            }}
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          >
            <option value="">Mavzulardan birini tanlang</option>
            {topics.map((t) => (
              <option key={t.id} value={t.id}>
                {t.topic}
              </option>
            ))}
          </select>
        </div>

        <div className="hw-field">
          <label className="hw-label">
            Izoh <span>*</span>
          </label>
          <textarea
            className="hw-textarea"
            placeholder="Vazifa haqida qo'shimcha ma'lumot kiriting..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* File Upload */}
        <div className="hw-field">
          <div
            className="hw-upload"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => document.getElementById("file-input").click()}
          >
            <div className="hw-upload-icon">
              <i className="fa-solid fa-cloud-arrow-up"></i>
            </div>
            <div className="hw-upload-text">
              Faylni tanlash yoki shu yerga tashlang
            </div>
            {file && <div className="hw-file-name">{file.name}</div>}
            <input
              id="file-input"
              className="hw-file-input"
              type="file"
              onChange={handleFileInput}
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="hw-footer">
          <button
            className="hw-btn hw-btn-cancel"
            onClick={() => navigate(`/dashboard/sinflar/${id}`)}
          >
            Bekor qilish
          </button>
          <button
            className="hw-btn hw-btn-submit"
            onClick={create}
            disabled={loading}
          >
            {loading ? "Saqlashyapti..." : "E'lon qilish"}
          </button>
        </div>
      </div>
    </div>
  );
}
