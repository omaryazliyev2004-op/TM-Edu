import { useEffect, useRef, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { fetchApi, fileUrl } from "../../api/user.api";
import { useLang } from "../../i18n/LanguageContext";

const UZ_MONTHS = ["Yan", "Fev", "Mar", "Apr", "May", "Iyn", "Iyl", "Avg", "Sen", "Okt", "Noy", "Dek"];

function fmtDate(value) {
  if (!value) return "-";
  const d = new Date(value);
  if (isNaN(d)) return value;
  return `${String(d.getDate()).padStart(2, "0")} ${UZ_MONTHS[d.getMonth()]}, ${d.getFullYear()}`;
}

function fmtTime(value) {
  if (!value) return "";
  const d = new Date(value);
  if (isNaN(d)) return "";
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm} ${fmtDate(value)}`;
}

// Uyga vazifa muddati = berilgan vaqt + 20 soat
function deadline(value) {
  if (!value) return "";
  const d = new Date(value);
  if (isNaN(d)) return "";
  return fmtTime(new Date(d.getTime() + 20 * 60 * 60 * 1000));
}

const STATUS_TEXT = {
  ACCEPTED: { label: "Vazifa qabul qilindi", color: "#2e9e5b" },
  REJECTED: { label: "Vazifa qaytarildi", color: "#e8492f" },
  RETURNED: { label: "Vazifa qaytarildi", color: "#f0b343" },
};

function FileChip({ name }) {
  const { t } = useLang();
  if (!name) return null;
  return (
    <a className="ld-file" href={fileUrl(name)} target="_blank" rel="noreferrer" title={t("Yuklab olish")}>
      <i className="fa-regular fa-file"></i>
      <span>{name}</span>
    </a>
  );
}

export default function StudentLessonDetail() {
  const { groupId, lessonId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLang();

  const groupName = location.state?.groupName || "";
  const [lessons, setLessons] = useState([]);
  // { key: tegishli lessonId, data: javob } — key mos kelmasa yuklanmoqda hisoblanadi
  const [hwState, setHwState] = useState({ key: null, data: null });
  const [videos, setVideos] = useState([]);
  const [selVid, setSelVid] = useState(null);
  const [collapsed, setCollapsed] = useState(false); // ochiq dars akkordioni yopilganmi
  const mainRef = useRef(null);
  const fileRef = useRef(null);
  const loading = hwState.key !== lessonId;

  // Uyga vazifa javobini yuborish
  const [subTitle, setSubTitle] = useState("");
  const [subFile, setSubFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  // Video tanlanganda chap panelni tepaga olib chiqib, pleyerni ko'rsatamiz
  const playVideo = (id) => {
    setSelVid(id);
    mainRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Guruhdagi barcha darslar (o'ng paneldagi ro'yxat uchun)
  useEffect(() => {
    let alive = true;
    fetchApi(`groups/${groupId}/lessons/all`)
      .then((res) => {
        if (!alive) return;
        const list = res.data?.data ?? res.data ?? [];
        setLessons(Array.isArray(list) ? list : []);
      })
      .catch(() => alive && setLessons([]));
    return () => { alive = false; };
  }, [groupId]);

  // Tanlangan dars uyga vazifasi
  useEffect(() => {
    let alive = true;
    fetchApi(`groups/${groupId}/lessons/${lessonId}/homeworks`)
      .then((res) => {
        if (!alive) return;
        setHwState({ key: lessonId, data: res.data?.data ?? res.data ?? null });
      })
      .catch(() => alive && setHwState({ key: lessonId, data: null }));
    return () => { alive = false; };
  }, [groupId, lessonId, reloadKey]);

  // Dars videolari
  useEffect(() => {
    let alive = true;
    fetchApi(`groups/${groupId}/lessons/${lessonId}/videos`)
      .then((res) => {
        if (!alive) return;
        const list = res.data?.data ?? res.data ?? [];
        setVideos(Array.isArray(list) ? list : []);
      })
      .catch(() => alive && setVideos([]));
    return () => { alive = false; };
  }, [groupId, lessonId]);

  const currentVideo = videos.find((v) => v.id === selVid) || videos[0] || null;

  const hw = hwState.data;
  const homework = hw?.homework;
  const answer = hw?.answer;
  const result = hw?.result;
  const current = lessons.find((l) => String(l.id) === String(lessonId));
  const lessonTitle = homework?.title || current?.topic || groupName || t("Dars");
  const status = result?.homeworkStatus ? STATUS_TEXT[result.homeworkStatus] : null;
  // Faqat uy ishi berilgan, lekin hali bajarilmagan bo'lsa javob yuborish mumkin
  const canSubmit = !!homework && String(current?.status || "").toLowerCase() === "bajarilmagan";

  // Javob yuborish
  const handleSubmit = async () => {
    if (!homework || submitting) return;
    if (!subTitle.trim() && !subFile) return;
    setSubmitting(true);
    try {
      const form = new FormData();
      form.append("title", subTitle);
      if (subFile) form.append("file", subFile);
      await fetchApi.post(`students/homeworkAnswer/${homework.id}`, form);
      setSubTitle("");
      setSubFile(null);
      if (fileRef.current) fileRef.current.value = "";
      setReloadKey((k) => k + 1);
    } catch {
      // xatolikni e'tiborsiz qoldiramiz
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <style>{`
        .ld-head { display:flex; align-items:center; gap:14px; margin:6px 0 16px; }
        .ld-back { width:40px; height:40px; border:none; border-radius:12px; cursor:pointer; background:#fff; color:#7a6b52; font-size:16px; display:flex; align-items:center; justify-content:center; box-shadow:0 1px 3px rgba(0,0,0,.06); }
        .ld-back:hover { background:#f5f3ff; color:#7c3aed; }
        .ld-grid { display:grid; grid-template-columns:1fr 340px; gap:20px; height:calc(100vh - 182px); }
        .ld-main { display:flex; flex-direction:column; gap:18px; min-height:0; overflow-y:auto; padding-right:8px; }
        @media (max-width:1100px){
          .ld-grid { grid-template-columns:1fr; height:auto; }
          .ld-main { overflow:visible; }
        }

        .ld-card { background:#fff; border-radius:16px; box-shadow:0 1px 3px rgba(0,0,0,.05); }
        .ld-player { position:relative; width:100%; height:clamp(260px, 42vh, 520px); background:#000; overflow:hidden; flex-shrink:0; }
        .ld-player video { position:absolute; inset:0; width:100%; height:100%; object-fit:contain; }
        .ld-video { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:18px; padding:60px 20px; }
        .ld-video i { font-size:80px; color:#c9a978; }
        .ld-video span { font-size:20px; font-weight:600; color:#222; }
        .ld-title-bar { padding:18px 22px; font-size:16px; color:#333; }

        .ld-tabs { display:flex; align-items:center; justify-content:space-between; padding:0 22px; border-bottom:1px solid #eee; }
        .ld-tab { padding:16px 0; font-size:15px; font-weight:600; color:#7c3aed; border-bottom:2px solid #7c3aed; }
        .ld-ball { font-size:15px; font-weight:600; color:#7c3aed; }

        .ld-hw { padding:20px 22px; }
        .ld-hw-head { display:flex; align-items:flex-start; justify-content:space-between; gap:14px; flex-wrap:wrap; }
        .ld-hw-title { font-size:19px; font-weight:600; color:#222; margin:0; }
        .ld-deadline { background:#e8492f; color:#fff; padding:11px 16px; border-radius:10px; font-size:14px; font-weight:600; display:inline-flex; align-items:center; gap:8px; }
        .ld-files-count { font-size:14px; color:#555; white-space:nowrap; }
        .ld-block { background:#faf6ef; border-radius:12px; padding:18px; margin-top:14px; }
        .ld-block-body { font-size:14.5px; color:#333; white-space:pre-wrap; line-height:1.7; }
        .ld-row-between { display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:10px; }
        .ld-section-title { font-size:17px; font-weight:600; color:#222; }
        .ld-time { font-size:13px; color:#8a8a8a; text-align:right; margin-top:10px; }
        .ld-file { display:inline-flex; align-items:center; gap:10px; background:#fff; border:1px solid #eee; border-radius:10px; padding:14px 16px; margin-top:12px; font-size:14px; color:#333; text-decoration:none; max-width:100%; }
        .ld-file:hover { border-color:#7c3aed; color:#7c3aed; }
        .ld-file span { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
        .ld-teacher-status { font-size:15px; font-weight:600; }
        .ld-footer { text-align:center; padding:18px; font-size:15px; color:#444; }
        .ld-submit { border:1px solid #e3e6ea; border-radius:14px; padding:16px 18px; margin-top:16px; }
        .ld-submit-top { display:flex; align-items:center; gap:14px; }
        .ld-submit-input { flex:1; border:none; outline:none; font-size:16px; color:#333; background:transparent; }
        .ld-submit-input::placeholder { color:#9a9a9a; }
        .ld-submit-clip, .ld-submit-send { border:none; background:transparent; cursor:pointer; color:#666; font-size:20px; display:flex; align-items:center; transition:color .15s; }
        .ld-submit-clip:hover { color:#7c3aed; }
        .ld-submit-send:hover { color:#7c3aed; }
        .ld-submit-send:disabled { color:#c7c7c7; cursor:not-allowed; }
        .ld-submit-bottom { display:flex; align-items:center; justify-content:space-between; margin-top:10px; }
        .ld-submit-file { font-size:13.5px; color:#7c3aed; display:inline-flex; align-items:center; gap:7px; }
        .ld-submit-counter { font-size:14px; color:#888; }
        .ld-empty { padding:40px; text-align:center; color:#999; }

        /* Right list (akkordion) */
        .ld-side { display:flex; flex-direction:column; gap:12px; min-height:0; overflow-y:auto; padding-right:4px; }
        @media (max-width:1100px){ .ld-side { overflow:visible; } }
        .ld-lesson { background:#f5f3ff; border-radius:14px; padding:8px; box-shadow:0 1px 3px rgba(0,0,0,.05); }
        .ld-lesson-head { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:14px 16px; border-radius:11px; cursor:pointer; transition:background .15s; }
        .ld-lesson:not(.active) { background:#f8fafc; }
        .ld-lesson:not(.active) .ld-lesson-head:hover { background:#f1f5f9; }
        .ld-lesson.active .ld-lesson-head { background:#ede9fe; }
        .ld-lesson-topic { font-size:15px; font-weight:700; color:#222; margin:0; }
        .ld-lesson-date { font-size:13px; color:#6b6b6b; margin:6px 0 0; }
        .ld-chevron { color:#7a6b52; font-size:14px; flex-shrink:0; }
        .ld-vid-sublist { display:flex; flex-direction:column; gap:8px; padding:8px 0 4px; }
        .ld-vid-sub { display:flex; align-items:center; gap:14px; width:100%; text-align:left; border:none; cursor:pointer; background:#ddd6fe; border-radius:11px; padding:15px 16px; font-size:15px; color:#2b2b2b; transition:background .15s; }
        .ld-vid-sub:hover { background:#c4b5fd; }
        .ld-vid-ic { font-size:20px; flex-shrink:0; }
        .ld-vid-sub .fa-circle-play { color:#6d28d9; }
        .ld-vid-sub .fa-circle { color:#8b5cf6; }
      `}</style>

      <div className="ld-head">
        <button className="ld-back" onClick={() => navigate(-1)} title={t("Orqaga")}>
          <i className="fa-solid fa-arrow-left"></i>
        </button>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: "#222", margin: 0 }}>{groupName || t("Darslar")}</h1>
      </div>

      <div className="ld-grid">
        {/* LEFT */}
        <div className="ld-main" ref={mainRef}>
          {currentVideo ? (
            <div className="ld-card ld-player">
              <video
                key={currentVideo.id}
                src={`https://najot-edu.softwareengineer.uz/files/files/${currentVideo.video_url}`}
                controls
                autoPlay
                preload="metadata"
              />
            </div>
          ) : (
            <div className="ld-card ld-video">
              <i className="fa-solid fa-video-slash"></i>
              <span>{t("Video mavjud emas")}</span>
            </div>
          )}

          <div className="ld-card ld-title-bar">{lessonTitle}</div>

          <div className="ld-card">
            <div className="ld-tabs">
              <span className="ld-tab">{t("Vazifalar")}</span>
              {result?.grade != null && <span className="ld-ball">{t("Ball")}: {result.grade}</span>}
            </div>

            {loading ? (
              <div className="ld-empty">{t("Yuklanmoqda...")}</div>
            ) : !homework && !answer ? (
              <div className="ld-empty">{t("Uyga vazifa berilmagan")}</div>
            ) : (
              <div className="ld-hw">
                {/* Uyga vazifa */}
                {homework && (
                  <>
                    <div className="ld-hw-head" style={{ justifyContent: "flex-end" }}>
                      <span className="ld-deadline">
                        <i className="fa-solid fa-circle-exclamation"></i>
                        {t("Uyga vazifa muddati")}: {deadline(homework.created_at)}
                      </span>
                    </div>
                    <div className="ld-block">
                      <div className="ld-row-between">
                        <span className="ld-section-title">{t("Uyga vazifa")}</span>
                        <span className="ld-files-count">{t("Fayllar soni")}: {homework.file ? 1 : 0}</span>
                      </div>
                      {homework.title && <div className="ld-block-body">{homework.title}</div>}
                      {homework.file && <FileChip name={homework.file} />}
                      <div className="ld-time">{fmtTime(homework.created_at)}</div>
                    </div>
                  </>
                )}

                {/* Mening jo'natmalarim — vazifa bajarilmagan bo'lsa ko'rsatilmaydi */}
                {!canSubmit && (
                  <div className="ld-block">
                    <div className="ld-row-between">
                      <span className="ld-section-title">{t("Mening jo'natmalarim")}</span>
                      <span className="ld-files-count">{t("Fayllar soni")}: {answer?.file ? 1 : 0}</span>
                    </div>
                    {answer ? (
                      <>
                        {answer.title && <div className="ld-block-body">{answer.title}</div>}
                        {answer.file && <FileChip name={answer.file} />}
                        <div className="ld-time">{fmtTime(answer.created_at)}</div>
                      </>
                    ) : (
                      <div className="ld-block-body" style={{ color: "#999" }}>{t("Hali jo'natma yo'q")}</div>
                    )}
                  </div>
                )}

                {/* O'qituvchi izohi */}
                {result && (
                  <div className="ld-block">
                    <div className="ld-row-between">
                      <span className="ld-section-title">{t("O'qituvchi izohi")}</span>
                      {status && (
                        <span className="ld-teacher-status" style={{ color: status.color }}>
                          {t(status.label)}
                        </span>
                      )}
                    </div>
                    {result.title && <div className="ld-block-body">{result.title}</div>}
                    {result.checker && (
                      <div className="ld-block-body" style={{ marginTop: 10 }}>
                        {t("Tekshiruvchi")}: {result.checker}
                      </div>
                    )}
                    <div className="ld-time">{fmtTime(result.created_at)}</div>
                  </div>
                )}

                {canSubmit ? (
                  <div className="ld-submit">
                    <div className="ld-submit-top">
                      <input
                        className="ld-submit-input"
                        placeholder={t("Fayl biriktiring va izoh qoldiring")}
                        value={subTitle}
                        maxLength={1000}
                        onChange={(e) => setSubTitle(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
                      />
                      <button
                        className="ld-submit-clip"
                        onClick={() => fileRef.current?.click()}
                        title={t("Fayl biriktirish")}
                      >
                        <i className="fa-solid fa-paperclip"></i>
                      </button>
                      <button
                        className="ld-submit-send"
                        onClick={handleSubmit}
                        disabled={submitting || (!subTitle.trim() && !subFile)}
                        title={t("Yuborish")}
                      >
                        <i className="fa-solid fa-paper-plane"></i>
                      </button>
                      <input
                        ref={fileRef}
                        type="file"
                        hidden
                        onChange={(e) => setSubFile(e.target.files?.[0] || null)}
                      />
                    </div>
                    <div className="ld-submit-bottom">
                      {subFile ? (
                        <span className="ld-submit-file">
                          <i className="fa-regular fa-file"></i> {subFile.name}
                        </span>
                      ) : <span />}
                      <span className="ld-submit-counter">{subTitle.length} / 1000</span>
                    </div>
                  </div>
                ) : (
                  <div className="ld-footer">{t("Qayta topshirish imkoniyati berilmagan")}</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT — darslar ro'yxati (akkordion) */}
        <div className="ld-side">
          {lessons.map((l) => {
            const isActive = String(l.id) === String(lessonId);
            const hasVideos = (l.videoCount ?? 0) > 0;
            const open = isActive && hasVideos && !collapsed;
            return (
              <div key={l.id} className={`ld-lesson${isActive ? " active" : ""}`}>
                <div
                  className="ld-lesson-head"
                  onClick={() => {
                    if (isActive) {
                      if (hasVideos) setCollapsed((c) => !c);
                    } else {
                      setCollapsed(false);
                      navigate(`/student/guruhlarim/${groupId}/${l.id}`, { state: { groupName } });
                    }
                  }}
                >
                  <div>
                    <p className="ld-lesson-topic">{l.topic}</p>
                    <p className="ld-lesson-date">{t("Dars sanasi")}: {fmtDate(l.created_at)}</p>
                  </div>
                  {hasVideos && (
                    <i className={`fa-solid fa-chevron-${open ? "up" : "down"} ld-chevron`}></i>
                  )}
                </div>

                {open && (
                  <div className="ld-vid-sublist">
                    {videos.map((v, i) => {
                      const playing = (currentVideo && v.id === currentVideo.id);
                      return (
                        <button
                          key={v.id}
                          className="ld-vid-sub"
                          onClick={() => playVideo(v.id)}
                        >
                          <i className={`${playing ? "fa-solid fa-circle-play" : "fa-regular fa-circle"} ld-vid-ic`}></i>
                          <span>{i + 1}-video: {v.originalname || v.video_url}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
