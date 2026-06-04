
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchApi } from "../api/user.api";
import { useLang } from "../i18n/LanguageContext";

export default function ExamReview() {
  const { t } = useLang();
  const navigate = useNavigate();
  const { groupId, examId, studentId } = useParams();

  const [student, setStudent] = useState({
    name: "Rahmonbergan Otabek o'g'li Mahmudov",
    time: "22 May, 2026 09:32",
    filesCount: 0,
    status: "Kutayabti",
    studentComment: "1.https://github.com/uzbboos34-blip/CRM-Backend\n2.https://github.com/uzbboos34-blip/CRM-Frontent 3.https://7-oy-xuep.vercel.app/login"
  });

  const [examDesc, setExamDesc] = useState("crm loyihasi\n\n1. backend github link\n2. frontend github link");
  const [score, setScore] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const isPassed = score >= 60;
  const statusColor = isPassed ? "#10b981" : "#f43f5e";
  const statusHoverColor = isPassed ? "#059669" : "#e11d48";
  const glowColor = isPassed ? "rgba(16, 185, 129, 0.15)" : "rgba(244, 63, 94, 0.15)";
  const activeGlowColor = isPassed ? "rgba(16, 185, 129, 0.25)" : "rgba(244, 63, 94, 0.25)";
  const statusBg = isPassed ? "#ecfdf5" : "#fff1f2";
  const statusText = isPassed ? "#047857" : "#be123c";
  const statusBorder = isPassed ? "#a7f3d0" : "#fecdd3";

  // Mock list of students to find the clicked one if available
  const mockStudents = [
    {
      id: 1,
      name: "Dilshodbek O'ktamjon o'g'li Tokhirov",
      submittedTime: "24 Apr, 2026 12:56",
      checkedTime: "27 Apr, 2026 10:30",
      score: 65,
      studentComment: "1.https://github.com/dilshod-tokhirov/CRM-Backend\n2.https://github.com/dilshod-tokhirov/CRM-Frontend"
    },
    {
      id: 2,
      name: "Rahmonbergan Otabek o'g'li Mahmudov",
      submittedTime: "24 Apr, 2026 10:42",
      checkedTime: "24 Apr, 2026 11:32",
      score: 85,
      studentComment: "1.https://github.com/uzbboos34-blip/CRM-Backend\n2.https://github.com/uzbboos34-blip/CRM-Frontent 3.https://7-oy-xuep.vercel.app/login"
    },
    {
      id: 3,
      name: "Mirsaid Abduqulov",
      submittedTime: "24 Apr, 2026 11:59",
      checkedTime: "24 Apr, 2026 14:50",
      score: 70,
      studentComment: "Loyiha tayyor, tekshirib bering iltimos."
    },
    {
      id: 4,
      name: "Oydin Kamolovna Qalandarova",
      submittedTime: "24 Apr, 2026 09:27",
      checkedTime: "29 Apr, 2026 12:17",
      score: 100,
      studentComment: "CRM Loyiha deployment havolasi: https://crm-oydin.vercel.app"
    },
    {
      id: 5,
      name: "Guliza Ayitqulova",
      submittedTime: "24 Apr, 2026 12:41",
      checkedTime: "24 Apr, 2026 14:40",
      score: 70,
      studentComment: "Vazifa yuklandi."
    },
    {
      id: 6,
      name: "Nozima Abdugapparova",
      submittedTime: "24 Apr, 2026 09:27",
      checkedTime: "24 Apr, 2026 09:47",
      score: 85,
      studentComment: "Hamma shartlar bajarildi."
    }
  ];

  useEffect(() => {
    // Find if student matches any of mock students
    const found = mockStudents.find(s => String(s.id) === String(studentId));
    if (found) {
      setStudent({
        name: found.name,
        time: found.submittedTime,
        filesCount: found.filesCount || 0,
        status: found.checkedTime !== "-" ? "Tekshirilgan" : "Kutayabti",
        studentComment: found.studentComment
      });
      setScore(found.score === "-" ? 0 : Number(found.score));
    }
  }, [studentId]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Typically we would post to an API like `exams/submissions/${studentId}/grade` or similar
      // Since it's mock API for now, we'll alert success and go back
      alert(`Muvaffaqiyatli saqlandi! Ball: ${score}. Izoh: ${comment}`);
      navigate(`/dashboard/groups/${groupId}/exams/${examId}`);
    } catch (err) {
      console.error(err);
      alert(t("Xatolik yuz berdi."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "24px", minHeight: "100vh", background: "#f8fafc" }}>
      <style>{`
        .er-container {
          max-width: 820px;
          margin: 0;
          font-family: 'Outfit', 'Inter', sans-serif;
        }

        /* Breadcrumbs styling */
        .er-breadcrumbs {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 14px;
          font-weight: 600;
          color: #94a3b8;
          margin-bottom: 24px;
        }

        .er-bc-link {
          color: #64748b;
          text-decoration: none;
          cursor: pointer;
          transition: color 0.15s;
        }

        .er-bc-link:hover {
          color: #0f172a;
          text-decoration: underline;
        }

        .er-bc-separator {
          color: #cbd5e1;
        }

        .er-bc-current {
          color: #0f172a;
        }

        /* Cards Layout */
        .er-card {
          background: #fff;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          padding: 24px;
          margin-bottom: 20px;
        }

        .er-card-title {
          font-size: 16px;
          font-weight: 700;
          color: #1e293b;
          margin-top: 0;
          margin-bottom: 16px;
        }

        .er-inner-box {
          border: 1.5px solid #f1f5f9;
          border-radius: 8px;
          padding: 16px;
          background: #fff;
        }

        .er-sub-label {
          font-size: 13px;
          font-weight: 500;
          color: #94a3b8;
          margin-bottom: 4px;
          display: block;
        }

        .er-sub-text {
          font-size: 14px;
          font-weight: 600;
          color: #1e293b;
          white-space: pre-wrap;
          line-height: 1.6;
        }

        /* Student submission details row */
        .er-meta-row {
          display: flex;
          gap: 32px;
          margin-bottom: 16px;
          border-bottom: 1px solid #f1f5f9;
          padding-bottom: 16px;
        }

        .er-meta-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 14px;
        }

        .er-meta-label {
          color: #94a3b8;
          font-weight: 500;
        }

        .er-meta-val {
          color: #1e293b;
          font-weight: 700;
        }

        .er-badge {
          background: #fef3c7;
          color: #d97706;
          font-size: 12px;
          font-weight: 700;
          padding: 3px 10px;
          border-radius: 20px;
        }

        /* Blue info box */
        .er-info-box {
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

        .er-info-box i {
          font-size: 18px;
          margin-top: 2px;
          flex-shrink: 0;
        }

        /* Grading section */
        .er-slider-group {
          margin-bottom: 24px;
        }

        .er-slider-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .er-slider-label {
          font-size: 15px;
          font-weight: 700;
          color: #1e293b;
        }

        .er-value-box {
          width: 54px;
          height: 36px;
          border: 1.5px solid #e2e8f0;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          font-weight: 700;
          color: #1e293b;
          background: #fff;
          box-shadow: inset 0 1px 2px rgba(0,0,0,0.02);
        }

        .er-slider-wrapper {
          position: relative;
          padding: 8px 0 36px 0;
        }

        .er-slider {
          -webkit-appearance: none;
          width: 100%;
          height: 8px;
          border-radius: 9999px;
          background: var(--slider-bg, #e2e8f0);
          outline: none;
          cursor: pointer;
          transition: background 0.15s;
          display: block;
          margin: 0;
        }

        .er-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: var(--thumb-color, #10b981);
          border: 3px solid #fff;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.15), 0 2px 4px -1px rgba(0, 0, 0, 0.1);
          cursor: pointer;
          transition: transform 0.15s, background-color 0.15s, box-shadow 0.15s;
        }

        .er-slider::-webkit-slider-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 0 0 6px var(--thumb-hover-glow, rgba(16, 185, 129, 0.15)), 0 4px 6px -1px rgba(0, 0, 0, 0.15);
        }

        .er-slider::-webkit-slider-thumb:active {
          transform: scale(1.1);
          box-shadow: 0 0 0 8px var(--thumb-active-glow, rgba(16, 185, 129, 0.25)), 0 4px 6px -1px rgba(0, 0, 0, 0.15);
        }

        /* Firefox support */
        .er-slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: var(--thumb-color, #10b981);
          border: 3px solid #fff;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.15), 0 2px 4px -1px rgba(0, 0, 0, 0.1);
          cursor: pointer;
          transition: transform 0.15s, background-color 0.15s, box-shadow 0.15s;
        }

        .er-slider::-moz-range-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 0 0 6px var(--thumb-hover-glow, rgba(16, 185, 129, 0.15));
        }

        .er-slider-passing-line {
          position: absolute;
          left: 60%;
          top: 8px; /* lines up with the input padding-top: 8px */
          height: 8px; /* matches track height exactly */
          width: 3px;
          background: #fff; /* white break line in the track */
          border-radius: 2px;
          transform: translateX(-50%);
          pointer-events: none;
          z-index: 2;
        }

        .er-slider-markers {
          display: flex;
          justify-content: space-between;
          padding: 0 2px;
          margin-top: 10px;
          font-size: 12px;
          color: #94a3b8;
          font-weight: 600;
          user-select: none;
        }

        .er-slider-passing-badge {
          position: absolute;
          left: 60%;
          transform: translateX(-50%);
          text-align: center;
          font-size: 11px;
          color: #64748b;
          font-weight: 700;
          top: 36px;
          background: #f1f5f9;
          padding: 3px 10px;
          border-radius: 20px;
          border: 1px solid #e2e8f0;
          white-space: nowrap;
          display: flex;
          align-items: center;
          gap: 5px;
          box-shadow: 0 1px 2px rgba(0,0,0,0.02);
          user-select: none;
          transition: all 0.2s ease;
        }

        .er-slider-passing-dot {
          width: 5px;
          height: 5px;
          background-color: #94a3b8;
          border-radius: 50%;
        }

        /* If the score reaches 60, make the badge look active and successful! */
        .er-slider-passing-badge.active {
          background: #ecfdf5;
          border-color: #a7f3d0;
          color: #047857;
        }

        .er-slider-passing-badge.active .er-slider-passing-dot {
          background-color: #10b981;
        }

        /* Comment Input Styling */
        .er-comment-wrapper {
          position: relative;
          margin-bottom: 24px;
        }

        .er-textarea {
          width: 100%;
          min-height: 100px;
          border: 1.5px solid #e2e8f0;
          border-radius: 8px;
          padding: 14px 44px 14px 14px;
          font-size: 14px;
          color: #334155;
          outline: none;
          resize: vertical;
          box-sizing: border-box;
          font-family: inherit;
          transition: all 0.15s ease;
        }

        .er-textarea:focus {
          border-color: var(--theme-color, #10b981);
          box-shadow: 0 0 0 3px var(--theme-focus-glow, rgba(16, 185, 129, 0.15));
        }

        .er-mic-btn {
          position: absolute;
          right: 12px;
          bottom: 12px;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--theme-color, #10b981);
          border: none;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.15s, transform 0.15s;
        }

        .er-mic-btn:hover {
          background: var(--theme-hover-color, #059669);
          transform: scale(1.05);
        }

        .er-footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 24px;
          margin-bottom: 20px;
        }

        .er-btn {
          height: 42px;
          padding: 0 32px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
        }

        .er-btn-cancel {
          background: #fff;
          color: #475569;
          border: 1px solid #e2e8f0;
        }

        .er-btn-cancel:hover {
          background: #f1f5f9;
          color: #0f172a;
        }

        .er-btn-submit {
          background: var(--theme-color, #10b981);
          color: #fff;
        }

        .er-btn-submit:hover {
          background: var(--theme-hover-color, #059669);
        }

        .er-btn-submit:disabled {
          background: #cbd5e1;
          cursor: not-allowed;
        }
      `}</style>

      <div 
        className="er-container"
        style={{
          "--theme-color": statusColor,
          "--theme-hover-color": statusHoverColor,
          "--theme-focus-glow": glowColor,
          "--theme-active-glow": activeGlowColor,
          "--slider-bg": `linear-gradient(to right, ${statusColor} 0%, ${statusColor} ${score}%, #e2e8f0 ${score}%, #e2e8f0 100%)`,
          "--thumb-color": statusColor,
          "--thumb-hover-glow": glowColor,
          "--thumb-active-glow": activeGlowColor,
        }}
      >
        {/* Breadcrumbs */}
        <div className="er-breadcrumbs">
          <span className="er-bc-link" onClick={() => navigate(`/dashboard/groups/${groupId}/exams/${examId}`)}>
            {t("Kutayotganlar")}
          </span>
          <span className="er-bc-separator">&gt;</span>
          <span className="er-bc-current">{t("Imtihon")}</span>
        </div>

        {/* Card 1: Imtihon vazifasi */}
        <div className="er-card">
          <h2 className="er-card-title">{t("Imtihon vazifasi")}</h2>
          <div className="er-inner-box">
            <span className="er-sub-label">{t("Imtihon izohi:")}</span>
            <div className="er-sub-text">{examDesc}</div>
          </div>
        </div>

        {/* Card 2: Student submission info */}
        <div className="er-card">
          <h2 className="er-card-title" style={{ fontSize: "17px" }}>{student.name}</h2>
          
          {/* Metadata Row */}
          <div className="er-meta-row">
            <div className="er-meta-item">
              <span className="er-meta-label">{t("Vaqti:")}</span>
              <span className="er-meta-val">{student.time}</span>
            </div>
            <div className="er-meta-item">
              <span className="er-meta-label">{t("Fayllar soni:")}</span>
              <span className="er-meta-val">{student.filesCount}</span>
            </div>
            <div className="er-meta-item">
              <span className="er-meta-label">{t("Status:")}</span>
              <span className="er-badge">{t(student.status)}</span>
            </div>
          </div>

          {/* Student comments */}
          <div className="er-inner-box" style={{ background: "#f8fafc", border: "none" }}>
            <span className="er-sub-label">{t("Uyga vazifa izohi:")}</span>
            <div className="er-sub-text" style={{ fontWeight: "500", color: "#334155" }}>
              {student.studentComment}
            </div>
          </div>
        </div>

        {/* Grading Card */}
        <div className="er-card">
          {/* Info notification */}
          <div className="er-info-box">
            <i className="fa-solid fa-circle-info"></i>
            <span>
              {t("60-100 oralig'ida ball qo'yilgan vazifa 'Qabul qilingan', 0-59 oralig'ida ball qo'yilgan vazifa 'Qaytarilgan' hisoblanadi.")}
            </span>
          </div>

          {/* Score Slider */}
          <div className="er-slider-group">
            <div className="er-slider-header">
              <span className="er-slider-label">{t("Ball")}</span>
              <div 
                className="er-value-box"
                style={{
                  borderColor: statusBorder,
                  color: statusText,
                  backgroundColor: statusBg,
                  transition: "all 0.2s ease"
                }}
              >
                {score}
              </div>
            </div>
            <div className="er-slider-wrapper">
              <input
                type="range"
                className="er-slider"
                min="0"
                max="100"
                value={score}
                onChange={(e) => setScore(Number(e.target.value))}
                disabled={loading}
              />
              {/* White divider marker on the track */}
              <div className="er-slider-passing-line"></div>
              
              <div className="er-slider-markers">
                <span>0</span>
                <span>100</span>
              </div>
              
              {/* Premium Passing Threshold Pill Badge */}
              <div className={`er-slider-passing-badge ${score >= 60 ? 'active' : ''}`}>
                <span className="er-slider-passing-dot"></span>
                {t("O'tish bali: 60")}
              </div>
            </div>
          </div>

          {/* Textarea comments */}
          <div className="er-comment-wrapper">
            <textarea
              className="er-textarea"
              placeholder={t("Izohingiz")}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              disabled={loading}
            />
            <button className="er-mic-btn" type="button" title={t("Ovoz yozish")}>
              <i className="fa-solid fa-microphone"></i>
            </button>
          </div>

          {/* Action buttons */}
          <div className="er-footer" style={{ margin: "0", padding: "0" }}>
            <button
              className="er-btn er-btn-cancel"
              onClick={() => navigate(`/dashboard/groups/${groupId}/exams/${examId}`)}
              disabled={loading}
              style={{ flex: 1, maxWidth: "180px" }}
            >
              {t("Bekor qilish")}
            </button>
            <button
              className="er-btn er-btn-submit"
              onClick={handleSubmit}
              disabled={loading}
              style={{ flex: 1, maxWidth: "180px" }}
            >
              {loading ? t("Yuborilmoqda...") : score >= 60 ? t("Qabul qilish") : t("Qaytarish")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
