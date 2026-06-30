import { useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useLang } from "../i18n/LanguageContext";

export default function TeacherLayout() {
  const navigate = useNavigate();
  const { lang, changeLang, t } = useLang();
  const [collapsed, setCollapsed] = useState(false);
  const [groupOpen, setGroupOpen] = useState(true);
  const [isDark, setIsDark] = useState(() => localStorage.getItem("theme") === "dark");
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    document.body.classList.toggle("dark", isDark);
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark]);

  useEffect(() => {
    if (!profileOpen) return;
    const onClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [profileOpen]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const W = collapsed ? 0 : 220;

  return (
    <>
      <style>{`
        .tl-root { display:flex; height:100vh; overflow:hidden; background:#f5f6fb; color:#07122d; }

        .tl-header { display:flex; align-items:center; gap:14px; height:64px; padding:0 30px; background:#fff; flex-shrink:0; border-bottom:1px solid #f3f4f6; }
        .tl-logo { display:flex; align-items:center; gap:12px; height:74px; padding:0 20px; white-space:nowrap; border-bottom:1px solid #f8fafc; }
        .tl-logo-mark { width:40px; height:40px; border-radius:14px; background:#ede9fe; color:#7c3aed; display:flex; align-items:center; justify-content:center; font-size:18px; box-shadow:0 1px 3px rgba(15,23,42,.08); }
        .tl-logo-text { font-weight:900; font-size:20px; letter-spacing:-.3px; color:#1f2d5a; }
        .tl-collapse { display:none; }
        .tl-iconbtn { width:40px; height:40px; border:1px solid #e5e7eb; border-radius:12px; background:#fff; color:#4b5563; cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:17px; transition:background .15s,color .15s; }
        .tl-iconbtn:hover { background:#f9fafb; color:#4b5563; }
        .tl-add { height:40px; padding:0 20px; border:none; border-radius:12px; background:#7c3aed; color:#fff; font-size:13px; font-weight:800; cursor:pointer; display:flex; align-items:center; gap:10px; box-shadow:0 10px 15px -3px rgba(124,58,237,.20); }
        .tl-add:hover { background:#6d28d9; box-shadow:0 10px 15px -3px rgba(109,40,217,.30); }
        .tl-search { position:relative; width:300px; }
        .tl-search input { width:100%; height:40px; border:1px solid #e5e7eb; border-radius:12px; background:#fff; padding:0 14px 0 40px; font-size:14.5px; font-weight:600; color:#111827; outline:none; box-shadow:0 1px 3px rgba(15,23,42,.08); }
        .tl-search input::placeholder { color:#9ca3af; }
        .tl-search i { position:absolute; left:14px; top:50%; transform:translateY(-50%); color:#9ca3af; font-size:14px; }
        .tl-spacer { flex:1; }
        .tl-right { display:flex; align-items:center; gap:12px; }
        .tl-lang-wrap { position:relative; display:flex; align-items:center; }
        .tl-lang-wrap .globe { position:absolute; left:12px; color:#6b7280; font-size:15px; pointer-events:none; }
        .tl-lang { height:36px; min-width:160px; padding:0 34px 0 36px; border:1px solid #e5e7eb; border-radius:12px; background:#f9fafb; font-size:13px; font-weight:700; color:#4b5563; cursor:pointer; outline:none; appearance:none; }
        .tl-lang-wrap .chev { position:absolute; right:12px; color:#9ca3af; font-size:11px; pointer-events:none; }
        .tl-ghost { width:36px; height:36px; border:1px solid #e5e7eb; border-radius:12px; background:#f9fafb; cursor:pointer; color:#6b7280; font-size:16px; display:flex; align-items:center; justify-content:center; position:relative; }
        .tl-ghost:hover { color:#6b7280; background:#f3f4f6; }
        .tl-badge { position:absolute; top:7px; right:8px; width:9px; height:9px; border-radius:50%; background:#ef4444; border:2px solid #fff; }
        .tl-avatar { width:36px; height:36px; border-radius:12px; background:#7c3aed; color:#fff; cursor:pointer; display:flex; align-items:center; justify-content:center; font-weight:900; font-size:13px; }
        .tl-profile { position:relative; }
        .tl-menu { position:absolute; top:calc(100% + 14px); right:0; min-width:160px; background:#fff; border-radius:16px; box-shadow:0 10px 25px -5px rgba(0,0,0,.05),0 8px 10px -6px rgba(0,0,0,.05); border:1px solid #f3f4f6; padding:4px; z-index:1000; overflow:hidden; }
        .tl-role { padding:10px 12px; font-size:14.5px; font-weight:800; color:#1f2937; border-bottom:1px solid #f9fafb; margin-bottom:4px; }
        .tl-logout { display:flex; align-items:center; gap:10px; width:100%; padding:10px 12px; border:none; background:transparent; border-radius:10px; cursor:pointer; font-size:12px; font-weight:700; color:#ef4444; text-align:left; transition:background .15s; }
        .tl-logout:hover { background:#fef2f2; }

        .tl-shell { flex:1; display:flex; flex-direction:column; min-width:0; }
        .tl-sidebar { width:${W}px; flex-shrink:0; background:#fff; overflow:hidden; border-right:1px solid #f3f4f6; transition:width .26s cubic-bezier(.4,0,.2,1); }
        .tl-sidebar-inner { width:220px; padding:16px 12px; }
        .tl-group-head { display:flex; align-items:center; gap:12px; padding:10px 12px; font-size:14.5px; font-weight:700; color:#374151; cursor:pointer; border-radius:12px; }
        .tl-group-head:hover { background:#f8f5ff; }
        .tl-group-head i:first-child, .tl-item i { width:18px; text-align:center; font-size:18px; color:#6b7280; }
        .tl-group-head .tl-chev { margin-left:auto; font-size:12px; color:#9ca3af; transition:transform .2s; }
        .tl-sub { display:flex; flex-direction:column; gap:2px; padding:4px 0 12px 8px; }
        .tl-subitem { display:block; padding:10px 16px; border-radius:12px; font-size:14px; font-weight:700; color:#4b5563; text-decoration:none; transition:background .15s,color .15s,box-shadow .15s; }
        .tl-subitem:hover { background:#f8f5ff; color:#7c2cff; }
        .tl-subitem.active { background:#7c3aed; color:#fff; box-shadow:0 4px 10px rgba(167,139,250,.65); }
        .tl-item { display:flex; align-items:center; gap:12px; padding:10px 12px; margin-top:4px; border-radius:12px; font-size:14.5px; font-weight:700; color:#4b5563; text-decoration:none; transition:background .15s,color .15s; }
        .tl-item:hover { background:#f8f5ff; color:#7c2cff; }
        .tl-item.active { background:#7c3aed; color:#fff; box-shadow:0 4px 10px rgba(167,139,250,.65); }
        .tl-item.active i { color:#fff; }
        .tl-content { flex:1; overflow-y:auto; padding:34px 40px; min-width:0; background:#f5f6fb; }

        @media (max-width: 900px) {
          .tl-sidebar { width:0; }
          .tl-header { padding:0 16px; gap:10px; overflow-x:auto; }
          .tl-search { width:220px; }
          .tl-content { padding:28px 18px; }
        }
      `}</style>

      <div className="tl-root">
        <aside className="tl-sidebar">
          <div className="tl-logo">
            <span className="tl-logo-mark"><i className="fa-solid fa-graduation-cap"></i></span>
            <span className="tl-logo-text">NajotEdu</span>
          </div>
          <div className="tl-sidebar-inner">
            <div className="tl-group-head" onClick={() => setGroupOpen((o) => !o)}>
              <i className="fa-regular fa-user"></i>
              <span>{t("Guruhlar")}</span>
              <i className={`fa-solid fa-chevron-${groupOpen ? "up" : "down"} tl-chev`}></i>
            </div>
            {groupOpen && (
              <div className="tl-sub">
                <NavLink to="/teacher/guruhlar" className={({ isActive }) => `tl-subitem${isActive ? " active" : ""}`}>
                  {t("Guruhlar")}
                </NavLink>
                <NavLink to="/teacher/planned-groups" className={({ isActive }) => `tl-subitem${isActive ? " active" : ""}`}>
                  {t("Yig'ilayotgan guruhlar")}
                </NavLink>
              </div>
            )}
            <NavLink to="/teacher/profil" className={({ isActive }) => `tl-item${isActive ? " active" : ""}`}>
              <i className="fa-regular fa-circle-user"></i>
              <span>{t("Profil")}</span>
            </NavLink>
          </div>
        </aside>

        <div className="tl-shell">
          <header className="tl-header">
            <button className="tl-collapse" onClick={() => setCollapsed((c) => !c)}>
              <i className={`fa-solid fa-angle-${collapsed ? "right" : "left"}`}></i>
            </button>
            <button className="tl-iconbtn"><i className="fa-regular fa-calendar"></i></button>
            <button className="tl-add">
              <i className="fa-solid fa-plus"></i> {t("Qo'shish")}
              <i className="fa-solid fa-chevron-down" style={{ fontSize: 11 }}></i>
            </button>
            <div className="tl-search">
              <i className="fa-solid fa-magnifying-glass"></i>
              <input placeholder={t("Qidirish...")} />
            </div>

            <div className="tl-spacer" />

            <div className="tl-right">
              <div className="tl-lang-wrap">
                <i className="fa-solid fa-globe globe"></i>
                <select className="tl-lang" value={lang} onChange={(e) => changeLang(e.target.value)}>
                  <option value="uz">O'zbekcha</option>
                  <option value="ru">Ruscha</option>
                  <option value="en">Inglizcha</option>
                </select>
                <i className="fa-solid fa-chevron-down chev"></i>
              </div>
              <button className="tl-ghost">
                <i className="fa-regular fa-bell"></i>
                <span className="tl-badge"></span>
              </button>
              <button className="tl-ghost" onClick={() => setIsDark((d) => !d)}>
                <i className={`fa-${isDark ? "solid fa-sun" : "regular fa-moon"}`}></i>
              </button>
              <div className="tl-profile" ref={profileRef}>
                <div className="tl-avatar" onClick={() => setProfileOpen((o) => !o)}>O</div>
                {profileOpen && (
                  <div className="tl-menu">
                    <div className="tl-role">{t("O'qituvchi")}</div>
                    <button className="tl-logout" onClick={handleLogout}>
                      {t("Chiqish")}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          <main className="tl-content">
            <Outlet />
          </main>
        </div>
      </div>
    </>
  );
}
