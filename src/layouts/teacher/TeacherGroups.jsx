import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchApi, getName } from "../../api/user.api";
const UZ_DAYS = {
  MONDAY: "Du",
  TUESDAY: "Se",
  WEDNESDAY: "Chor",
  THURSDAY: "Pay",
  FRIDAY: "Ju",
  SATURDAY: "Shan",
  SUNDAY: "Yak",
};

function formatDays(days) {
  if (!Array.isArray(days) || days.length === 0) return "—";
  return days.map((d) => UZ_DAYS[d] || d).join(", ");
}

function isActiveGroup(g) {
  if (typeof g.is_active === "boolean") return g.is_active;
  const s = String(g.status || "").toLowerCase();
  if (s) return !["finished", "completed", "tugagan", "inactive"].includes(s);
  return true;
}

function groupKey(g) {
  return g.groupId ?? g.id;
}

export default function TeacherGroups() {
const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("guruhlar");
  const myName = getName() || "";

  useEffect(() => {
    let alive = true;
    fetchApi("teachers/my/groups")
      .then((res) => {
        if (!alive) return;
        const list = res.data?.data ?? res.data ?? [];
        setGroups(Array.isArray(list) ? list : []);
      })
      .catch(() => alive && setGroups([]))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, []);

  const toggleGroupStatus = (group) => {
    const key = groupKey(group);
    const nextActive = !isActiveGroup(group);

    setGroups((prev) =>
      prev.map((item) =>
        groupKey(item) === key
          ? {
              ...item,
              is_active: nextActive,
              status: nextActive ? "active" : "inactive",
            }
          : item
      )
    );
  };

  const view = tab === "arxiv" ? groups.filter((g) => !isActiveGroup(g)) : groups;
  const activeGroups = groups.filter(isActiveGroup);
  const studentsTotal = activeGroups.reduce((sum, g) => {
    return sum + Number(g.studentsCount ?? g.students?.length ?? g.student_count ?? 0);
  }, 0);

  return (
    <>
      <style>{`
        .tg-title { font-size:26px; font-weight:900; color:#07122d; margin:0 0 18px; letter-spacing:-.25px; }
        .tg-tabs { display:flex; gap:12px; align-items:center; margin-bottom:18px; }
        .tg-tab { display:flex; align-items:center; gap:8px; min-width:100px; justify-content:center; padding:9px 18px; border:none; border-radius:10px; background:transparent; font-size:13.5px; font-weight:800; color:#07122d; cursor:pointer; transition:background .15s,box-shadow .15s; }
        .tg-tab.active { background:#fff; color:#07122d; box-shadow:0 3px 10px rgba(15,23,42,.08); }
        .tg-tab i { color:#07122d; font-size:15px; }

        .tg-stats { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:16px; margin-bottom:20px; }
        .tg-stat-card { position:relative; min-height:115px; background:#fff; border:1px solid #e7ebf2; border-radius:12px; padding:16px 20px; box-shadow:0 2px 8px rgba(18,29,52,.08); }
        .tg-stat-icon { width:34px; height:34px; border-radius:10px; background:#fafbfe; color:#07122d; display:flex; align-items:center; justify-content:center; font-size:15px; margin-bottom:10px; }
        .tg-stat-menu { position:absolute; top:16px; right:16px; border:none; background:transparent; color:#9aa4b5; font-size:16px; cursor:pointer; padding:4px; }
        .tg-stat-label { margin:0 0 6px; font-size:13.5px; font-weight:600; color:#24314a; }
        .tg-stat-value { margin:0; font-size:26px; line-height:1; font-weight:900; color:#07122d; letter-spacing:-.3px; }
        .tg-mini-avatars { position:absolute; right:32px; bottom:20px; display:flex; align-items:center; }
        .tg-mini-avatar { width:19px; height:19px; margin-left:-4px; border-radius:50%; border:2px solid #fff; color:#fff; display:flex; align-items:center; justify-content:center; font-size:9px; font-weight:900; }
        .tg-mini-avatar:nth-child(1) { background:#102865; }
        .tg-mini-avatar:nth-child(2) { background:#ff8b28; }
        .tg-mini-avatar:nth-child(3) { background:#ef3b9a; }

        .tg-wrap { background:#fff; border:1px solid #e7ebf2; border-radius:12px; overflow:hidden; box-shadow:0 2px 8px rgba(18,29,52,.08); }
        .tg-table { width:100%; border-collapse:collapse; }
        .tg-table th { text-align:left; font-size:13.5px; font-weight:900; color:#63708a; padding:15px 20px; white-space:nowrap; background:#fff; }
        .tg-table th:first-child, .tg-table td:first-child { padding-left:22px; }
        .tg-table th:last-child, .tg-table td:last-child { padding-right:18px; text-align:right; }
        .tg-row { border-top:1px solid #edf0f6; }
        .tg-table td { font-size:13.5px; color:#2a354d; padding:18px 20px; vertical-align:middle; }

        .tg-status { display:flex; align-items:center; gap:10px; }
        .tg-toggle { width:42px; height:22px; border-radius:50px; border:none; cursor:pointer; position:relative; padding:0; transition:background .2s; }
        .tg-toggle.on { background:#8627ff; }
        .tg-toggle.off { background:#d1d5db; }
        .tg-toggle span { position:absolute; top:3px; left:3px; width:16px; height:16px; border-radius:50%; background:#fff; transition:left .2s; }
        .tg-toggle.on span { left:23px; }
        .tg-faol, .tg-arxiv-lbl { min-width:68px; height:26px; display:inline-flex; align-items:center; justify-content:center; border-radius:999px; font-size:11.5px; font-weight:900; letter-spacing:.3px; }
        .tg-faol { color:#00b775; background:#e9fff4; }
        .tg-arxiv-lbl { color:#8c96a8; background:#f2f4f8; }

        .tg-name-link { border:none; background:none; padding:0; cursor:pointer; font-size:14px; font-weight:900; color:#831eff; text-align:left; }
        .tg-name-link:hover { color:#6417ce; text-decoration:underline; }
        .tg-kurs { display:inline-flex; align-items:center; padding:6px 13px; border-radius:50px; background:#fff1ff; color:#e100d8; font-size:11.5px; font-weight:900; }
        .tg-duration { font-weight:800; color:#6d7890; font-size:13.5px; }
        .tg-time { font-weight:900; color:#07122d; font-size:13.5px; }
        .tg-days { font-size:12px; font-weight:700; color:#8f9ab0; margin-top:4px; }
        .tg-teacher { display:inline-flex; min-width:96px; height:30px; align-items:center; justify-content:center; border-radius:999px; background:#f7f9fc; color:#071846; font-size: 12px; font-weight:900; padding:0 12px; }
        .tg-students { color:#07122d; font-weight:900; font-size: 13.5px; text-align:center; }
        .tg-refresh { border:none; background:transparent; cursor:pointer; color:#9ca3af; font-size:15px; }
        .tg-arrow { color:#cfd5df; font-size:18px; }
        .tg-empty { padding:48px; text-align:center; color:#8f9ab0; font-size:16px; font-weight:700; }

        @media (max-width: 1100px) {
          .tg-stats { grid-template-columns:1fr; }
          .tg-wrap { overflow-x:auto; }
          .tg-table { min-width:980px; }
        }
      `}</style>

      <h1 className="tg-title">{"Guruhlar"}</h1>

      <div className="tg-tabs">
        <button className={`tg-tab${tab === "guruhlar" ? " active" : ""}`} onClick={() => setTab("guruhlar")}>
          {"Guruhlar"}
        </button>
        <button className={`tg-tab${tab === "arxiv" ? " active" : ""}`} onClick={() => setTab("arxiv")}>
          <i className="fa-solid fa-box-archive"></i> {"Arxiv"}
        </button>
      </div>

      <div className="tg-stats">
        <div className="tg-stat-card">
          <button className="tg-stat-menu"><i className="fa-solid fa-ellipsis-vertical"></i></button>
          <div className="tg-stat-icon"><i className="fa-regular fa-user"></i></div>
          <p className="tg-stat-label">{"Mening guruhlarim"}</p>
          <p className="tg-stat-value">{activeGroups.length}</p>
        </div>
        <div className="tg-stat-card">
          <button className="tg-stat-menu"><i className="fa-solid fa-ellipsis-vertical"></i></button>
          <div className="tg-stat-icon"><i className="fa-solid fa-graduation-cap"></i></div>
          <p className="tg-stat-label">{"Jami o'quvchilar"}</p>
          <p className="tg-stat-value">{studentsTotal}</p>
          <div className="tg-mini-avatars">
            <span className="tg-mini-avatar">I</span>
            <span className="tg-mini-avatar">M</span>
            <span className="tg-mini-avatar">S</span>
          </div>
        </div>
      </div>

      <div className="tg-wrap">
        {loading ? (
          <div className="tg-empty">{"Yuklanmoqda..."}</div>
        ) : view.length === 0 ? (
          <div className="tg-empty">{"Guruhlar topilmadi"}</div>
        ) : (
          <table className="tg-table">
            <thead>
              <tr>
                <th>{"Status"}</th>
                <th>{"Guruh nomi"}</th>
                <th>{"Kurs"}</th>
                <th>{"Davomiyligi"}</th>
                <th>{"Dars vaqti"}</th>
                <th>{"Xona"}</th>
                <th>{"O'qituvchi"}</th>
                <th>{"Talabalar"}</th>
                <th><button className="tg-refresh"><i className="fa-solid fa-rotate-right"></i></button></th>
              </tr>
            </thead>
            <tbody>
              {view.map((g, i) => {
                const active = isActiveGroup(g);
                const duration = g.duration_month ?? g.duration_months ?? g.duration ?? g.course?.duration_month;
                const room = g.room?.name || g.roomName || g.room || "—";
                const teacher = myName || g.teacher?.full_name || g.teacherName || "";
                const studentsCount = g.studentsCount ?? g.students?.length ?? g.student_count ?? 0;
                return (
                  <tr className="tg-row" key={g.groupId ?? g.id ?? i}>
                    <td>
                      <div className="tg-status">
                        <button
                          className={`tg-toggle ${active ? "on" : "off"}`}
                          type="button"
                          onClick={() => toggleGroupStatus(g)}
                        >
                          <span />
                        </button>
                        <span className={active ? "tg-faol" : "tg-arxiv-lbl"}>
                          {active ? "FAOL" : "ARXIV"}
                        </span>
                      </div>
                    </td>
                    <td>
                      <button
                        className="tg-name-link"
                        onClick={() => navigate(`/teacher/guruhlar/${g.groupId ?? g.id}`)}
                      >
                        {g.groupName || g.name || "—"}
                      </button>
                    </td>
                    <td><span className="tg-kurs">{g.courseName || g.course?.name || "—"}</span></td>
                    <td><span className="tg-duration">{duration ? `${duration} ${"oy"}` : "—"}</span></td>
                    <td>
                      <div className="tg-time">{g.start_time || g.startTime || "—"}</div>
                      <div className="tg-days">{formatDays(g.week_day || g.weekDay)}</div>
                    </td>
                    <td>{room}</td>
                    <td><span className="tg-teacher">{teacher || "Noma'lum"}</span></td>
                    <td className="tg-students">{studentsCount}</td>
                    <td><span className="tg-arrow"><i className="fa-solid fa-chevron-right"></i></span></td>
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
