import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchApi } from "../../api/user.api";
import { useLang } from "../../i18n/LanguageContext";

const UZ_MONTHS = ["Yan", "Fev", "Mar", "Apr", "May", "Iyn", "Iyl", "Avg", "Sen", "Okt", "Noy", "Dek"];

const UZ_DAYS = {
  MONDAY: "Du",
  TUESDAY: "Se",
  WEDNESDAY: "Cho",
  THURSDAY: "Pa",
  FRIDAY: "Ju",
  SATURDAY: "Sha",
  SUNDAY: "Ya",
};

function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (isNaN(d)) return value;
  return `${d.getDate()} ${UZ_MONTHS[d.getMonth()]}, ${d.getFullYear()}`;
}

function formatDays(days) {
  if (!Array.isArray(days) || days.length === 0) return "—";
  return days.map((d) => UZ_DAYS[d] || d).join(", ");
}

// "09:00" + duration (daqiqa) -> "09:00 - 10:30"
function formatLessonTime(start, duration) {
  if (!start) return "—";
  if (!duration) return start;
  const [h, m] = start.split(":").map(Number);
  const total = h * 60 + m + Number(duration);
  const eh = String(Math.floor(total / 60) % 24).padStart(2, "0");
  const em = String(total % 60).padStart(2, "0");
  return `${start} - ${eh}:${em}`;
}

export default function StudentGroups() {
  const { t } = useLang();
  const navigate = useNavigate();
  const [tab, setTab] = useState("faol");
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalGroup, setModalGroup] = useState(null);

  useEffect(() => {
    let alive = true;
    fetchApi("students/my/groups")
      .then((res) => {
        if (!alive) return;
        const list = res.data?.data ?? res.data ?? [];
        setGroups(Array.isArray(list) ? list : []);
      })
      .catch(() => alive && setGroups([]))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, []);

  const isFinished = (g) => {
    const s = String(g.status || "").toLowerCase();
    if (s) return ["finished", "completed", "done", "tugagan", "inactive"].includes(s);
    if (typeof g.is_active === "boolean") return !g.is_active;
    if (g.endDate || g.end_date) return new Date(g.endDate || g.end_date) < new Date();
    return false;
  };

  const filtered = groups.filter((g) => (tab === "faol" ? !isFinished(g) : isFinished(g)));

  return (
    <>
      <style>{`
        .sg-wrap { background:#fff; border-radius:16px; overflow:hidden; box-shadow:0 1px 3px rgba(0,0,0,.05); }
        .sg-tabs { display:flex; gap:34px; padding:18px 26px 0; border-bottom:1px solid #eee; }
        .sg-tab { padding-bottom:14px; font-size:16px; font-weight:500; color:#888; cursor:pointer; border:none; background:none; border-bottom:2px solid transparent; transition:all .15s; }
        .sg-tab.active { color:#7c3aed; border-bottom-color:#7c3aed; font-weight:600; }
        .sg-table { width:100%; border-collapse:collapse; }
        .sg-table th { text-align:left; font-size:15px; font-weight:700; color:#222; padding:18px 20px; }
        .sg-table th:first-child, .sg-table td:first-child { padding-left:26px; }
        .sg-row { border-top:1px solid #f0f0f0; }
        .sg-table td { font-size:15px; color:#333; padding:18px 20px; }
        .sg-group-link {
          border:none; background:none; padding:0; cursor:pointer; font-size:15px;
          font-weight:600; color:#333; text-align:left; transition:color .15s;
        }
        .sg-group-link:hover { color:#7c3aed; text-decoration:underline; }
        .sg-count {
          min-width:34px; height:34px; padding:0 9px; border-radius:50px; background:#7c3aed; color:#fff;
          font-size:13px; font-weight:700; display:inline-flex; align-items:center; justify-content:center;
          gap:5px; cursor:pointer; border:none; transition:background .15s, transform .1s;
        }
        .sg-count:hover { background:#6d28d9; transform:translateY(-1px); }
        .sg-empty { padding:48px; text-align:center; color:#999; font-size:15px; }

        /* ── MODAL ── */
        .sg-overlay {
          position:fixed; inset:0; background:rgba(20,20,30,.45); z-index:1000;
          display:flex; align-items:center; justify-content:center; padding:24px;
          animation:sg-fade .15s ease;
        }
        @keyframes sg-fade { from { opacity:0 } to { opacity:1 } }
        .sg-modal {
          background:#fff; border-radius:18px; width:100%; max-width:760px;
          max-height:86vh; overflow:hidden; box-shadow:0 24px 60px rgba(0,0,0,.28);
          display:flex; flex-direction:column; animation:sg-pop .18s cubic-bezier(.34,1.56,.64,1);
        }
        @keyframes sg-pop { from { transform:scale(.96); opacity:0 } to { transform:scale(1); opacity:1 } }
        .sg-modal-head { display:flex; align-items:flex-start; justify-content:space-between; padding:26px 30px 0; }
        .sg-modal-title { font-size:26px; font-weight:700; color:#1f1f1f; margin:0; }
        .sg-modal-status { margin:6px 0 0; font-size:17px; color:#6b7280; }
        .sg-close {
          width:36px; height:36px; border:none; border-radius:10px; cursor:pointer;
          background:#f3f4f6; color:#555; font-size:15px; display:flex; align-items:center; justify-content:center;
          transition:background .15s, color .15s;
        }
        .sg-close:hover { background:#fdecea; color:#e53935; }
        .sg-modal-body { padding:22px 30px 30px; overflow-y:auto; }
        .sg-mtable { width:100%; border-collapse:collapse; border:1px solid #eef0f2; border-radius:12px; overflow:hidden; }
        .sg-mtable thead th { text-align:left; font-size:15px; font-weight:700; color:#222; padding:16px 22px; background:#f8fafc; }
        .sg-mtable tbody td { font-size:15px; color:#333; padding:16px 22px; border-top:1px solid #f0f0f0; }
        .sg-mtable tbody tr:hover td { background:#fafafa; }
      `}</style>

      <div style={{ paddingTop: 8 }}>
        <div className="sg-wrap">
          <div className="sg-tabs">
            <button className={`sg-tab${tab === "faol" ? " active" : ""}`} onClick={() => setTab("faol")}>
              {t("Faol")}
            </button>
            <button className={`sg-tab${tab === "tugagan" ? " active" : ""}`} onClick={() => setTab("tugagan")}>
              {t("Tugagan")}
            </button>
          </div>

          {loading ? (
            <div className="sg-empty">{t("Yuklanmoqda...")}</div>
          ) : filtered.length === 0 ? (
            <div className="sg-empty">{t("Guruhlar topilmadi")}</div>
          ) : (
            <table className="sg-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>{t("Guruh nomi")}</th>
                  <th>{t("Yo'nalishi")}</th>
                  <th>{t("O'qituvchi")}</th>
                  <th>{t("Boshlash vaqti")}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((g, i) => (
                  <tr className="sg-row" key={g.groupId ?? i}>
                    <td>{i + 1}</td>
                    <td>
                      <button
                        className="sg-group-link"
                        onClick={() =>
                          navigate(`/student/guruhlarim/${g.groupId}`, {
                            state: { groupName: g.groupName },
                          })
                        }
                      >
                        {g.groupName || "—"}
                      </button>
                    </td>
                    <td>{g.courseName || "—"}</td>
                    <td>
                      <button
                        className="sg-count"
                        onClick={() => setModalGroup(g)}
                        title={t("O'qituvchilarni ko'rish")}
                      >
                        {g.teachersCount ?? g.teachers?.length ?? 0}
                      </button>
                    </td>
                    <td>{formatDate(g.startDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {modalGroup && (
        <div className="sg-overlay" onClick={() => setModalGroup(null)}>
          <div className="sg-modal" onClick={(e) => e.stopPropagation()}>
            <div className="sg-modal-head">
              <div>
                <h2 className="sg-modal-title">{modalGroup.groupName || "—"}</h2>
                <p className="sg-modal-status">{tab === "faol" ? t("Faol") : t("Tugagan")}</p>
              </div>
              <button className="sg-close" onClick={() => setModalGroup(null)}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div className="sg-modal-body">
              <table className="sg-mtable">
                <thead>
                  <tr>
                    <th>{t("O'qituvchi")}</th>
                    <th>{t("Roli")}</th>
                    <th>{t("Dars kunlari")}</th>
                    <th>{t("Dars vaqti")}</th>
                  </tr>
                </thead>
                <tbody>
                  {(modalGroup.teachers || []).map((tch, i) => (
                    <tr key={i}>
                      <td>{tch.full_name || "—"}</td>
                      <td>{tch.role || "—"}</td>
                      <td>{formatDays(tch.week_day)}</td>
                      <td>{formatLessonTime(tch.start_time, tch.duration_hours)}</td>
                    </tr>
                  ))}
                  {(!modalGroup.teachers || modalGroup.teachers.length === 0) && (
                    <tr>
                      <td colSpan={4} style={{ textAlign: "center", color: "#999" }}>
                        {t("O'qituvchilar topilmadi")}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
