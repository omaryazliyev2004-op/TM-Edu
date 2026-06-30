import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { fetchApi } from "../api/user.api";
import { useLang } from "../i18n/LanguageContext";

const FILE_BASE = "https://najot-edu.softwareengineer.uz/files/";
const IMAGE_EXT = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp"];

function filePath(f) {
  if (!f) return "";
  if (typeof f === "string") return f;
  return f.path || f.url || f.file || f.name || "";
}

function isImage(path) {
  const p = String(path).toLowerCase();
  return IMAGE_EXT.some((ext) => p.endsWith(ext));
}

// Obyekt ichidan (ichma-ich) berilgan kalitlardan birining qiymatini topadi
function deepFindByKeys(obj, keys, depth = 0) {
  if (!obj || typeof obj !== "object" || depth > 5) return undefined;
  for (const k of keys) {
    if (obj[k] != null && typeof obj[k] !== "object") return obj[k];
  }
  for (const v of Object.values(obj)) {
    if (v && typeof v === "object") {
      const found = deepFindByKeys(v, keys, depth + 1);
      if (found != null) return found;
    }
  }
  return undefined;
}

export default function HomeworkReview() {
  const { t } = useLang();
  const navigate = useNavigate();
  const location = useLocation();
  const { groupId, homeworkId, studentId } = useParams();

  // Breadcrumb info passed from the list page (falls back to defaults)
  const statusLabel = location.state?.statusLabel || "Kutayotganlar";
  const homeworkTopic = location.state?.topic || "Uyga vazifa";

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [score, setScore] = useState(60);
  const [comment, setComment] = useState("");
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const isTeacherPath = location.pathname.startsWith("/teacher");
  const backToList = () =>
    navigate(
      isTeacherPath
        ? `/teacher/guruhlar/${groupId}/homework/${homeworkId}`
        : `/dashboard/groups/${groupId}/homework/${homeworkId}`
    );

  useEffect(() => {
    async function loadResult() {
      try {
        setLoading(true);
        setError(null);

        // Bitta talaba topshirig'ini olish uchun lessonId kerak.
        // Avval ro'yxat sahifasidan uzatilgan state/natija ichidan olamiz —
        // shunda qo'shimcha so'rov yubormaymiz. Topilmasagina homework/{groupId}.
        const passedResult = location.state?.result;
        let lessonId =
          location.state?.lessonId ??
          passedResult?.lesson_id ??
          passedResult?.lessonId ??
          passedResult?.lesson?.id;
        if (!lessonId) {
          try {
            const hwRes = await fetchApi(`homework/${groupId}`);
            const list = hwRes.data?.data ?? hwRes.data ?? [];
            const hw = (Array.isArray(list) ? list : []).find(
              (h) =>
                String(h.homework?.[0]?.id) === String(homeworkId) ||
                String(h.id) === String(homeworkId)
            );
            lessonId = hw?.id;
          } catch (metaErr) {
            console.error("lessonId aniqlashda xatolik:", metaErr);
          }
        }

        // Asosiy manba: alohida talaba topshirig'i endpointi.
        if (lessonId) {
          const res = await fetchApi(
            `group/${groupId}/lesson/${lessonId}/homework/${homeworkId}/student/${studentId}`
          );
          if (res.status === 200) {
            let payload = res.data?.data ?? res.data ?? {};
            if (Array.isArray(payload)) payload = payload[0] || {};
            console.log("homework result:", payload);
            setData(payload);
            if (payload.grade != null) setScore(Number(payload.grade));
            return;
          }
        }

        // Zaxira: ro'yxat sahifasidan uzatilgan natija.
        const passed = location.state?.result;
        if (passed && typeof passed === "object") {
          setData(passed);
          if (passed.grade != null) setScore(Number(passed.grade));
          return;
        }
        setError(t("Talaba topshirig'i topilmadi"));
      } catch (err) {
        console.error("Natijani yuklashda xatolik:", err);
        // Endpoint xato bersa ham, state'dagi natija bo'lsa ko'rsatamiz.
        const passed = location.state?.result;
        if (passed && typeof passed === "object") {
          setData(passed);
          if (passed.grade != null) setScore(Number(passed.grade));
        } else {
          setError(
            err.response?.data?.message || t("Ma'lumotni yuklashda xatolik yuz berdi")
          );
        }
      } finally {
        setLoading(false);
      }
    }
    if (groupId && homeworkId && studentId) loadResult();
  }, [groupId, homeworkId, studentId, t, location.state]);

  // Field extraction — API javob shakli: { id, file, title, students: { id, full_name } }
  const studentName =
    data?.students?.full_name ||
    data?.student?.full_name ||
    data?.full_name ||
    data?.student_name ||
    data?.name ||
    t("Noma'lum");
  const studentComment =
    data?.title || data?.text || data?.comment || data?.answer || "";
  // Uy vazifasining mavzusi va izohi (API: data.homework.{title,file})
  const homeworkTitle =
    data?.homework?.title || data?.homework?.topic || homeworkTopic;
  const homeworkDesc =
    data?.homework?.description ||
    data?.description ||
    location.state?.description ||
    "";
  // Uy vazifasiga biriktirilgan fayl(lar)
  const homeworkFiles = data?.homework?.file
    ? [data.homework.file]
    : Array.isArray(data?.homework?.files)
    ? data.homework.files
    : [];
  const submissionFiles = Array.isArray(data?.files)
    ? data.files
    : Array.isArray(data?.homework_files)
    ? data.homework_files
    : Array.isArray(data?.answer_files)
    ? data.answer_files
    : Array.isArray(data?.answer?.files)
    ? data.answer.files
    : data?.file
    ? [data.file]
    : [];
  // Answer id boshqa nom bilan kelishi mumkin — javob obyektini chuqur qidiramiz
  const answerId =
    deepFindByKeys(data, [
      "homework_answer_id",
      "answer_id",
      "homeworkAnswerId",
    ]) ??
    data?.answer?.id ??
    data?.homework_answer?.id ??
    data?.id;
  // API status'i odatda o'qiladigan matn ("Berilmagan", "Tekshirilmoqda" ...)
  // bo'lib keladi; enum kodlari kelsa, ularni tarjima qilamiz.
  const statusValue = data?.status || "";
  const STATUS_LABELS = {
    ACCEPTED: "Qabul qilingan",
    REJECTED: "Qaytarilgan",
    CHECKED: "Tekshirilgan",
    PENDING: "Kutayabti",
  };
  const statusText = statusValue
    ? t(STATUS_LABELS[statusValue] || statusValue)
    : t("Kutayabti");

  // Theme colors driven by passing score (>=60 accepted, else rejected)
  const isPassed = score >= 60;
  const themeColor = isPassed ? "#10b981" : "#f43f5e";
  const themeHover = isPassed ? "#059669" : "#e11d48";
  const glow = isPassed ? "rgba(16,185,129,0.15)" : "rgba(244,63,94,0.15)";
  const valBg = isPassed ? "#ecfdf5" : "#fff1f2";
  const valText = isPassed ? "#047857" : "#be123c";
  const valBorder = isPassed ? "#a7f3d0" : "#fecdd3";

  const handleFileInput = (e) => {
    if (e.target.files?.length) {
      setFiles((prev) => [...prev, ...Array.from(e.target.files)]);
    }
  };
  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files?.length) {
      setFiles((prev) => [...prev, ...Array.from(e.dataTransfer.files)]);
    }
  };

  const handleSubmit = async () => {
    if (!answerId) {
      alert(t("Homework answer ID topilmadi — baholab bo'lmaydi."));
      return;
    }
    setSubmitting(true);
    try {
      await fetchApi.post(`group/${groupId}/homework/${homeworkId}/check`, {
        grade: Number(score),
        title: comment,
        homework_answer_id: Number(answerId),
      });
      alert(
        isPassed
          ? t("Vazifa qabul qilindi!")
          : t("Vazifa qaytarildi!")
      );
      backToList();
    } catch (err) {
      console.error("Baholashda xatolik:", err);
      alert(
        err.response?.data?.message || t("Baholashda xatolik yuz berdi.")
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Fayl ro'yxatini rasm/ikonka thumbnail'lari ko'rinishida chizadi
  const renderThumbs = (list) => (
    <div className="hr-thumbs">
      {list.map((f, i) => {
        const path = filePath(f);
        // Uyga vazifa fayllari .../files/files/<nom> da turadi.
        // To'liq URL bo'lsa o'zini ishlatamiz; aks holda base + "files/" + nom.
        const clean = String(path).replace(/^\/+/, "");
        const url = /^https?:\/\//.test(path)
          ? path
          : FILE_BASE + (clean.startsWith("files/") ? clean : "files/" + clean);
        return isImage(path) ? (
          <a key={i} href={url} target="_blank" rel="noreferrer">
            <img
              className="hr-thumb"
              src={url}
              alt={`fayl-${i + 1}`}
              onError={(e) => {
                // Rasm yuklanmasa — fayl ikonkasini ko'rsatamiz (havola baribir ishlaydi)
                e.currentTarget.style.display = "none";
                const icon = e.currentTarget.nextElementSibling;
                if (icon) icon.style.display = "flex";
              }}
            />
            <span className="hr-file-icon" style={{ display: "none" }}>
              <i className="fa-solid fa-file"></i>
            </span>
          </a>
        ) : (
          <a key={i} className="hr-file-icon" href={url} target="_blank" rel="noreferrer">
            <i className="fa-solid fa-file"></i>
          </a>
        );
      })}
    </div>
  );

  if (loading) {
    return (
      <div style={{ padding: "24px" }}>
        <p>{t("Ma'lumot yuklanmoqda...")}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "24px" }}>
        <span
          onClick={backToList}
          style={{ cursor: "pointer", color: "#64748b", fontWeight: 600 }}
        >
          <i className="fa-solid fa-chevron-left"></i> {t("Orqaga")}
        </span>
        <div style={{ color: "#e53935", marginTop: 16 }}>{error}</div>
      </div>
    );
  }

  return (
    <div style={{ padding: "24px", minHeight: "100vh", background: "#f8fafc" }}>
      <style>{`
        .hr-container { max-width: 860px; margin: 0; }
        .hr-breadcrumbs {
          display: flex; align-items: center; gap: 8px;
          font-size: 18px; font-weight: 700; margin-bottom: 22px;
        }
        .hr-bc-link { color: #1e293b; cursor: pointer; }
        .hr-bc-link:hover { text-decoration: underline; }
        .hr-bc-sep { color: #cbd5e1; }
        .hr-bc-current { color: #94a3b8; }
        .hr-card {
          background: #fff; border: none; border-radius: 16px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          padding: 24px; margin-bottom: 24px;
        }
        .hr-card.muted { background: #f7f8fa; }
        .hr-card-title { font-size: 18px; font-weight: 700; color: #1e293b; margin: 0 0 16px; }
        .hr-inner {
          border: 1px solid #eceef2; border-radius: 10px; padding: 16px 18px; background: #fff;
        }
        .hr-label { font-size: 14px; color: #94a3b8; margin-bottom: 6px; display: block; }
        .hr-text { font-size: 15px; color: #1e293b; white-space: pre-wrap; line-height: 1.6; }
        .hr-meta-card {
          border: 1px solid #eceef2; border-radius: 10px; padding: 16px 18px;
          display: flex; gap: 48px; margin-bottom: 16px; background: #fff;
        }
        .hr-meta-label { font-size: 14px; color: #94a3b8; margin-bottom: 6px; }
        .hr-meta-val { font-size: 15px; font-weight: 700; color: #1e293b; }
        .hr-badge {
          background: #fef9c3; color: #b45309; font-size: 13px; font-weight: 600;
          padding: 4px 12px; border-radius: 6px; border: 1px solid #fde68a;
        }
        .hr-files-card { border: 1px solid #eceef2; border-radius: 10px; padding: 16px 18px; background: #fff; }
        .hr-thumbs { display: flex; gap: 14px; flex-wrap: wrap; margin: 12px 0 18px; }
        .hr-thumb {
          width: 150px; height: 150px; border-radius: 8px; border: 1px solid #e2e8f0;
          object-fit: cover; background: #f1f5f9; cursor: pointer; transition: transform .15s;
        }
        .hr-thumb:hover { transform: scale(1.03); }
        .hr-file-icon {
          width: 150px; height: 150px; border-radius: 8px; border: 1px solid #e2e8f0;
          display: flex; align-items: center; justify-content: center; font-size: 40px;
          color: #94a3b8; background: #f8fafc; text-decoration: none;
        }
        .hr-comment-box {
          border-left: 3px solid #7c3aed; background: #f8fafc; border-radius: 8px;
          padding: 14px 18px;
        }
        .hr-comment-box a { color: #2563eb; word-break: break-all; }
        .hr-info-box {
          background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px;
          padding: 12px 16px; display: flex; gap: 12px; font-size: 15px;
          color: #1e40af; margin-bottom: 24px; line-height: 1.5;
        }
        .hr-info-box i { font-size: 18px; margin-top: 2px; }
        .hr-slider-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
        .hr-slider-label { font-size: 16px; font-weight: 700; color: #1e293b; }
        .hr-value-box {
          min-width: 54px; height: 38px; padding: 0 12px; border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          font-size: 16px; font-weight: 700;
        }
        .hr-slider-wrapper { position: relative; padding: 8px 0 40px; }
        .hr-slider {
          -webkit-appearance: none; width: 100%; height: 8px; border-radius: 9999px;
          background: var(--slider-bg, #e2e8f0); outline: none; cursor: pointer; display: block; margin: 0;
        }
        .hr-slider::-webkit-slider-thumb {
          -webkit-appearance: none; width: 20px; height: 20px; border-radius: 50%;
          background: var(--thumb, #10b981); border: 3px solid #fff;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,.15); cursor: pointer; transition: transform .15s;
        }
        .hr-slider::-webkit-slider-thumb:hover { transform: scale(1.2); box-shadow: 0 0 0 6px var(--glow, rgba(16,185,129,.15)); }
        .hr-slider::-moz-range-thumb {
          width: 20px; height: 20px; border-radius: 50%; background: var(--thumb, #10b981);
          border: 3px solid #fff; cursor: pointer;
        }
        .hr-pass-badge {
          position: absolute; left: 60%; transform: translateX(-50%); top: 30px;
          font-size: 12px; color: #64748b; font-weight: 700; background: #f1f5f9;
          padding: 4px 12px; border-radius: 20px; border: 1px solid #e2e8f0; white-space: nowrap;
        }
        .hr-pass-badge.active { background: #ecfdf5; border-color: #a7f3d0; color: #047857; }
        .hr-section-label { font-size: 15px; font-weight: 700; color: #1e293b; margin: 8px 0 12px; }
        .hr-dropzone {
          border: 2px dashed #6ee7b7; border-radius: 10px; padding: 36px 20px; text-align: center;
          cursor: pointer; background: #fff; transition: all .2s; margin-bottom: 24px;
        }
        .hr-dropzone:hover { background: #f5f3ff; border-color: #7c3aed; }
        .hr-dropzone i { font-size: 34px; color: #7c3aed; margin-bottom: 12px; }
        .hr-dz-title { font-size: 16px; color: #334155; font-weight: 500; margin: 0 0 6px; }
        .hr-dz-sub { font-size: 13px; color: #94a3b8; margin: 0; }
        .hr-dz-files { margin-top: 12px; font-size: 13px; color: #475569; }
        .hr-comment-wrapper { position: relative; margin-bottom: 24px; }
        .hr-textarea {
          width: 100%; min-height: 110px; border: 1px solid #e2e8f0; border-radius: 10px;
          padding: 14px 48px 14px 14px; font-size: 15px; color: #334155; outline: none;
          resize: vertical; box-sizing: border-box; font-family: inherit; background: #fff;
        }
        .hr-textarea:focus { border-color: var(--theme, #10b981); box-shadow: 0 0 0 3px var(--glow, rgba(16,185,129,.15)); }
        .hr-mic-btn {
          position: absolute; right: 12px; bottom: 12px; width: 40px; height: 40px; border-radius: 8px;
          background: var(--theme, #10b981); border: none; color: #fff; cursor: pointer; font-size: 16px;
        }
        .hr-footer { display: flex; justify-content: flex-end; gap: 12px; }
        .hr-btn { height: 44px; padding: 0 28px; border-radius: 8px; font-size: 15px; font-weight: 600; cursor: pointer; border: none; }
        .hr-btn-cancel { background: #fff; color: #475569; border: 1px solid #e2e8f0; }
        .hr-btn-cancel:hover { background: #f1f5f9; }
        .hr-btn-submit { background: var(--theme, #10b981); color: #fff; }
        .hr-btn-submit:hover { background: var(--theme-hover, #059669); }
        .hr-btn-submit:disabled { background: #cbd5e1; cursor: not-allowed; }
      `}</style>

      <div
        className="hr-container"
        style={{
          "--theme": themeColor,
          "--theme-hover": themeHover,
          "--glow": glow,
          "--thumb": themeColor,
          "--slider-bg": `linear-gradient(to right, ${themeColor} 0%, ${themeColor} ${score}%, #e2e8f0 ${score}%, #e2e8f0 100%)`,
        }}
      >
        {/* Breadcrumbs */}
        <div className="hr-breadcrumbs">
          <span className="hr-bc-link" onClick={backToList}>
            {t(statusLabel)}
          </span>
          <span className="hr-bc-sep">&gt;</span>
          <span className="hr-bc-current">{homeworkTitle}</span>
        </div>

        {/* Homework task */}
        <div className="hr-card muted">
          <h2 className="hr-card-title">{t("Uy vazifasi")}</h2>
          <div
            className="hr-inner"
            style={{ marginBottom: homeworkDesc || homeworkFiles.length ? 12 : 0 }}
          >
            <span className="hr-label">{t("Mavzu:")}</span>
            <div className="hr-text">{homeworkTitle}</div>
          </div>
          {homeworkDesc && (
            <div
              className="hr-inner"
              style={{ marginBottom: homeworkFiles.length ? 12 : 0 }}
            >
              <span className="hr-label">{t("Izoh:")}</span>
              <div className="hr-text">{homeworkDesc}</div>
            </div>
          )}
          {homeworkFiles.length > 0 && (
            <div className="hr-inner">
              <span className="hr-label">{t("Vazifa fayli:")}</span>
              {renderThumbs(homeworkFiles)}
            </div>
          )}
        </div>

        {/* Student submission */}
        <div className="hr-card muted">
          <h2 className="hr-card-title">{studentName}</h2>

          <div className="hr-meta-card">
            <div>
              <div className="hr-meta-label">{t("Fayllar soni:")}</div>
              <div className="hr-meta-val">{submissionFiles.length}</div>
            </div>
            <div>
              <div className="hr-meta-label">{t("Status:")}</div>
              <span className="hr-badge">{statusText}</span>
            </div>
          </div>

          <div className="hr-files-card">
            <div className="hr-label" style={{ marginBottom: 0 }}>
              {t("Fayl:")} <strong style={{ color: "#1e293b" }}>{submissionFiles.length}</strong>
            </div>
            {submissionFiles.length > 0 && renderThumbs(submissionFiles)}
            {studentComment && (
              <div className="hr-comment-box">
                <span className="hr-label">{t("Uyga vazifa izohi:")}</span>
                <div className="hr-text" style={{ fontSize: 15 }}>
                  {/\bhttps?:\/\//.test(studentComment) ? (
                    <a href={studentComment.match(/https?:\/\/\S+/)?.[0]} target="_blank" rel="noreferrer">
                      {studentComment}
                    </a>
                  ) : (
                    studentComment
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Grading */}
        <div className="hr-card">
          <div className="hr-info-box">
            <i className="fa-solid fa-circle-info"></i>
            <span>
              {t("60-100 oralig'ida ball qo'yilgan vazifa 'Qabul qilingan', 0-59 oralig'ida ball qo'yilgan vazifa 'Qaytarilgan' hisoblanadi.")}
            </span>
          </div>

          {/* Score slider */}
          <div className="hr-slider-header">
            <span className="hr-slider-label">{t("Ball")}</span>
            <div
              className="hr-value-box"
              style={{ backgroundColor: valBg, color: valText, border: `1.5px solid ${valBorder}` }}
            >
              {score}
            </div>
          </div>
          <div className="hr-slider-wrapper">
            <input
              type="range"
              className="hr-slider"
              min="0"
              max="100"
              value={score}
              onChange={(e) => setScore(Number(e.target.value))}
              disabled={submitting}
            />
            <div className={`hr-pass-badge ${isPassed ? "active" : ""}`}>
              {t("O'tish bali: 60")}
            </div>
          </div>

          {/* Files dropzone */}
          <div className="hr-section-label">{t("Fayllar")}</div>
          <label
            className="hr-dropzone"
            style={{ display: "block" }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
          >
            <i className="fa-solid fa-cloud-arrow-up"></i>
            <p className="hr-dz-title">
              {t("Faylni yuklash uchun ushbu hudud ustiga bosing yoki faylni shu yerga olib keling")}
            </p>
            <p className="hr-dz-sub">
              {t(".jpg, .png, .pdf, .mp4, .docs formatlaridan birida bo'lishi mumkin")}
            </p>
            {files.length > 0 && (
              <div className="hr-dz-files">{files.map((f) => f.name).join(", ")}</div>
            )}
            <input type="file" multiple hidden onChange={handleFileInput} />
          </label>

          {/* Comment */}
          <div className="hr-comment-wrapper">
            <textarea
              className="hr-textarea"
              placeholder={t("Izohingiz")}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              disabled={submitting}
            />
            <button className="hr-mic-btn" type="button" title={t("Ovoz yozish")}>
              <i className="fa-solid fa-microphone"></i>
            </button>
          </div>

          {/* Actions */}
          <div className="hr-footer">
            <button className="hr-btn hr-btn-cancel" onClick={backToList} disabled={submitting}>
              {t("Bekor qilish")}
            </button>
            <button className="hr-btn hr-btn-submit" onClick={handleSubmit} disabled={submitting}>
              {submitting ? t("Yuborilmoqda...") : t("Yuborish")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
