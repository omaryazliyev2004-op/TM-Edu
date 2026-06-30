import { useEffect, useMemo, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { fetchApi } from "../../api/user.api";
import { useLang } from "../../i18n/LanguageContext";

const UZ_MONTHS = [
  "Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun",
  "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr",
];

function formatDate(value, withTime = false) {
  if (!value) return "-";
  const d = new Date(value);
  if (isNaN(d)) return value;
  const base = `${String(d.getDate()).padStart(2, "0")} ${UZ_MONTHS[d.getMonth()]}, ${d.getFullYear()}`;
  if (!withTime) return base;
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${base} ${hh}:${mm}`;
}

// Holat -> rang
const STATUS_COLORS = {
  bajarilmagan: { bg: "#e8492f", color: "#fff" },
  qaytarilgan: { bg: "#f0b343", color: "#fff" },
  berilmagan: { bg: "#6b7280", color: "#fff" },
  bajarilgan: { bg: "#2e9e5b", color: "#fff" },
  "qabul qilingan": { bg: "#2e9e5b", color: "#fff" },
  kutilmoqda: { bg: "#5b7ce8", color: "#fff" },
  kutayotganlar: { bg: "#5b7ce8", color: "#fff" },
  tekshirilmoqda: { bg: "#3b82f6", color: "#fff" },
};

function statusStyle(status) {
  const key = String(status || "").toLowerCase();
  return STATUS_COLORS[key] || { bg: "#6b7280", color: "#fff" };
}

export default function StudentLessons() {
  const { groupId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLang();

  const groupName = location.state?.groupName || "";
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("Barchasi");
  const [sortBy, setSortBy] = useState("created_at"); // created_at | deadline
  const [sortDir, setSortDir] = useState("desc");

  useEffect(() => {
    let alive = true;
    fetchApi(`groups/${groupId}/lessons/all`)
      .then((res) => {
        if (!alive) return;
        const list = res.data?.data ?? res.data ?? [];
        setLessons(Array.isArray(list) ? list : []);
      })
      .catch(() => alive && setLessons([]))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [groupId]);

  const statuses = useMemo(
    () => ["Barchasi", ...Array.from(new Set(lessons.map((l) => l.status).filter(Boolean)))],
    [lessons]
  );

  // Tugash vaqti = dars yaratilgan vaqt + 20 soat
  const deadlineOf = (l) => {
    if (!l.created_at) return null;
    const d = new Date(l.created_at);
    if (isNaN(d)) return null;
    return new Date(d.getTime() + 20 * 60 * 60 * 1000);
  };

  const view = useMemo(() => {
    let arr = lessons;
    if (filter !== "Barchasi") arr = arr.filter((l) => l.status === filter);
    const dir = sortDir === "asc" ? 1 : -1;
    return [...arr].sort((a, b) => {
      const av = sortBy === "deadline" ? deadlineOf(a) : a.created_at;
      const bv = sortBy === "deadline" ? deadlineOf(b) : b.created_at;
      const at = av ? new Date(av).getTime() : 0;
      const bt = bv ? new Date(bv).getTime() : 0;
      return (at - bt) * dir;
    });
  }, [lessons, filter, sortBy, sortDir]);

  const toggleSort = (key) => {
    if (sortBy === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortBy(key); setSortDir("asc"); }
  };

  const sortIcon = (key) => {
    if (sortBy !== key) return "fa-arrow-up-long";
    return sortDir === "asc" ? "fa-arrow-up-long" : "fa-arrow-down-long";
  };

  return (
    <>
      <style>{`
        .sl-head { display:flex; align-items:center; gap:14px; margin:6px 0 18px; }
        .sl-back {
          width:40px; height:40px; border:none; border-radius:12px; cursor:pointer;
          background:#fff; color:#7a6b52; font-size:16px; display:flex; align-items:center; justify-content:center;
          box-shadow:0 1px 3px rgba(0,0,0,.06); transition:background .15s, color .15s;
        }
        .sl-back:hover { background:#f5f3ff; color:#7c3aed; }
        .sl-title { font-size:22px; font-weight:700; color:#222; margin:0; }

        .sl-filter-wrap { margin-bottom:8px; }
        .sl-filter-label { font-size:14px; color:#888; margin:0 0 8px 2px; }
        .sl-select {
          appearance:none; width:230px; height:46px; padding:0 40px 0 16px;
          border:1px solid #e3e6ea; border-radius:10px; background:#fff; cursor:pointer;
          font-size:15px; color:#333; outline:none;
          background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2'><path d='M6 9l6 6 6-6'/></svg>");
          background-repeat:no-repeat; background-position:right 14px center;
        }
        .sl-select:focus { border-color:#7c3aed; }

        .sl-wrap { background:#fff; border-radius:16px; overflow:hidden; box-shadow:0 1px 3px rgba(0,0,0,.05); margin-top:14px; }
        .sl-table { width:100%; border-collapse:collapse; }
        .sl-table th { text-align:left; font-size:15px; font-weight:700; color:#222; padding:18px 22px; white-space:nowrap; }
        .sl-table th.sortable { cursor:pointer; user-select:none; }
        .sl-table th.sortable i { margin-left:8px; color:#7c3aed; }
        .sl-row { border-top:1px solid #f0f0f0; }
        .sl-table td { font-size:15px; color:#333; padding:16px 22px; }
        .sl-topic-link { border:none; background:none; padding:0; cursor:pointer; font-size:15px; font-weight:500; color:#333; text-align:left; }
        .sl-topic-link:hover { color:#7c3aed; text-decoration:underline; }
        .sl-topic-locked { font-size:15px; font-weight:500; color:#333; cursor:default; }
        .sl-video {
          display:inline-flex; align-items:center; justify-content:center;
          min-width:30px; height:30px; padding:0 8px; border-radius:50px;
          border:1.5px solid #b9d3f0; color:#3b82f6; font-size:13px; font-weight:600;
        }
        .sl-exam {
          display:inline-flex; align-items:center; padding:5px 14px; border-radius:50px;
          background:#7c3aed; color:#fff; font-size:13px; font-weight:600;
        }
        .sl-status { display:inline-flex; align-items:center; padding:7px 16px; border-radius:8px; font-size:14px; font-weight:600; }
        .sl-empty { padding:48px; text-align:center; color:#999; font-size:15px; }
      `}</style>

      <div className="sl-head">
        <button className="sl-back" onClick={() => navigate(-1)} title={t("Orqaga")}>
          <i className="fa-solid fa-arrow-left"></i>
        </button>
        <h1 className="sl-title">{groupName || t("Darslar")}</h1>
      </div>

      <div className="sl-filter-wrap">
        <p className="sl-filter-label">{t("Uy vazifa statusi")}</p>
        <select className="sl-select" value={filter} onChange={(e) => setFilter(e.target.value)}>
          {statuses.map((s) => (
            <option key={s} value={s}>{s === "Barchasi" ? t("Barchasi") : s}</option>
          ))}
        </select>
      </div>

      <div className="sl-wrap">
        {loading ? (
          <div className="sl-empty">{t("Yuklanmoqda...")}</div>
        ) : view.length === 0 ? (
          <div className="sl-empty">{t("Darslar topilmadi")}</div>
        ) : (
          <table className="sl-table">
            <thead>
              <tr>
                <th>{t("Mavzular")}</th>
                <th>{t("Video")}</th>
                <th>{t("Uyga vazifa Holati")}</th>
                <th className="sortable" onClick={() => toggleSort("deadline")}>
                  {t("Uyga vazifa tugash vaqti")}
                  <i className={`fa-solid ${sortIcon("deadline")}`}></i>
                </th>
                <th className="sortable" onClick={() => toggleSort("created_at")}>
                  {t("Dars sanasi")}
                  <i className={`fa-solid ${sortIcon("created_at")}`}></i>
                </th>
              </tr>
            </thead>
            <tbody>
              {view.map((l, i) => {
                const st = statusStyle(l.status);
                const isExam = String(l.type || "").toLowerCase() === "exam" || l.isExam;
                // Video yo'q va uyga vazifa berilmagan bo'lsa — ichkariga kirib bo'lmaydi
                const noVideo = (l.videoCount ?? 0) === 0;
                const notGiven = String(l.status || "").toLowerCase() === "berilmagan";
                const locked = noVideo && notGiven;
                return (
                  <tr className="sl-row" key={l.id ?? i}>
                    <td>
                      {locked ? (
                        <span className="sl-topic-locked">{l.topic || "—"}</span>
                      ) : (
                        <button
                          className="sl-topic-link"
                          onClick={() =>
                            navigate(`/student/guruhlarim/${groupId}/${l.id}`, {
                              state: { groupName },
                            })
                          }
                        >
                          {l.topic || "—"}
                        </button>
                      )}
                    </td>
                    <td>
                      {isExam ? (
                        <span className="sl-exam">{t("Imtihon")}</span>
                      ) : (
                        <span className="sl-video">{l.videoCount ?? 0}</span>
                      )}
                    </td>
                    <td>
                      <span className="sl-status" style={{ background: st.bg, color: st.color }}>
                        {l.status || "—"}
                      </span>
                    </td>
                    <td>{formatDate(deadlineOf(l), true)}</td>
                    <td>{formatDate(l.created_at)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
