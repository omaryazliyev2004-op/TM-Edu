import Avatar from "@mui/material/Avatar";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import { useState, useEffect } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";

const boshqarishMenuItems = [
  { icon: "fa-graduation-cap", label: "Kurslar", to: "/dashboard/boshqarish/kurslar" },
  { icon: "fa-door-open", label: "Xonalar", to: "/dashboard/boshqarish/xonalar" },
  { icon: "fa-users", label: "Hodimlar", to: "/dashboard/boshqarish/hodimlar" },
];

const navItems = [
  { icon: "fa-house", label: "Asosiy", to: "/dashboard", end: true },
  { icon: "fa-user-tie", label: "O'qituvcilar", to: "/dashboard/o'qituvcilar" },
  { icon: "fa-layer-group", label: "Guruhlar", to: "/dashboard/sinflar" },
  { icon: "fa-user-graduate", label: "Talabalar", to: "/dashboard/talabalar" },
  { icon: "fa-gem", label: "Sovg'alar", to: "/dashboard/sovg'alar" },
];

export default function DashboardLayout() {
  const [isDark, setIsDark] = useState(false);
  const [boshqarishOpen, setBoshqarishOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const location = useLocation();
  const isBoshqarish = location.pathname.startsWith("/dashboard/boshqarish");

  useEffect(() => {
    document.body.classList.toggle("dark", isDark);
  }, [isDark]);

  useEffect(() => {
    setBoshqarishOpen(false);
  }, [location.pathname]);

  const W = collapsed ? 68 : 260;

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        .layout-root {
          display: flex;
          height: 100vh;
          overflow: hidden;
          background: #f2f2f2;
        }

        /* ── SIDEBAR ── */
        .sidebar-wrapper {
          position: relative;
          width: ${W}px;
          flex-shrink: 0;
          height: 100vh;
          transition: width 0.28s cubic-bezier(0.4,0,0.2,1);
        }
        .sidebar-inner {
          height: 100%;
          padding: 20px 8px 14px;
          border-radius: 0 16px 16px 0;
          background: #fff;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          overflow: hidden;
        }

        /* ── TOGGLE BUTTON on sidebar right edge ── */
        .toggle-btn {
          position: absolute;
          right: -14px;
          top: 32px;
          width: 28px; height: 28px;
          border-radius: 12px;
          border: 2px solid #e8e8e8;
          background: #765bcf;
          color: #fff;
          font-size: 11px;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.12);
          transition: background 0.15s, box-shadow 0.15s;
          z-index: 400;
        }
        .toggle-btn:hover {
          background: #5e48a8;
          box-shadow: 0 2px 12px rgba(118,91,207,0.4);
        }

        /* ── NAV ITEM ── */
        .nav-item {
          position: relative;
          width: 100%;
          height: 42px;
          padding: 0 10px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13.5px;
          font-weight: 600;
          color: #555;
          text-decoration: none;
          transition: background 0.15s, color 0.15s;
          background: none;
          border: none;
          cursor: pointer;
          white-space: nowrap;
          overflow: hidden;
        }
        .nav-item:hover  { background: rgba(118,91,207,0.07); color: #765bcf; }
        .nav-item.active,
        .nav-item.bq-active { background: rgba(118,91,207,0.14); color: #765bcf; }

        .nav-icon { width: 20px; text-align: center; flex-shrink: 0; font-size: 15px; }

        .nav-label {
          overflow: hidden;
          white-space: nowrap;
          transition: opacity 0.2s, max-width 0.28s;
          opacity: ${collapsed ? 0 : 1};
          max-width: ${collapsed ? "0px" : "180px"};
        }
        .chevron {
          margin-left: auto;
          font-size: 11px;
          color: #aaa;
          flex-shrink: 0;
          transition: transform 0.28s, opacity 0.2s;
          opacity: ${collapsed ? 0 : 1};
        }
        .chevron.open { transform: rotate(90deg); color: #765bcf; }

        /* tooltip when collapsed */
        .nav-tip {
          display: none;
          position: absolute;
          left: calc(100% + 16px);
          top: 50%;
          transform: translateY(-50%);
          background: #333;
          color: #fff;
          padding: 5px 10px;
          border-radius: 7px;
          font-size: 12px;
          font-weight: 600;
          white-space: nowrap;
          z-index: 9999;
          pointer-events: none;
        }
        ${collapsed ? ".nav-item:hover .nav-tip { display: block; }" : ""}

        /* ── YON PANEL ── */
        .side-panel {
          position: absolute;
          top: 0;
          left: 100%;
          height: 100%;
          width: 0;
          overflow: hidden;
          background: #fff;
          box-shadow: 6px 0 24px rgba(0,0,0,0.12);
          border-radius: 14px;
          transition: width 0.30s cubic-bezier(0.4,0,0.2,1), opacity 0.25s ease;
          opacity: 0;
          z-index: 300;
          display: flex;
          flex-direction: column;
        }
        .side-panel.open { width: 200px; opacity: 1; }

        .panel-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 14px 14px 10px 16px;
          border-bottom: 1px solid #f0f0f0; flex-shrink: 0;
        }
        .panel-title { font-weight: 700; font-size: 15px; color: #222; }
        .panel-close-btn {
          width: 26px; height: 26px; border-radius: 7px; border: none;
          background: rgba(118,91,207,0.12); color: #765bcf; font-size: 13px;
          cursor: pointer; display: flex; align-items: center; justify-content: center;
        }
        .panel-items {
          flex: 1; overflow-y: auto; padding: 8px;
          display: flex; flex-direction: column; gap: 2px;
        }
        .panel-link {
          display: flex; align-items: center; gap: 10px;
          padding: 9px 12px; border-radius: 9px;
          font-size: 13px; font-weight: 500; color: #444;
          text-decoration: none; white-space: nowrap;
          transition: background 0.15s, color 0.15s;
        }
        .panel-link:hover { background: rgba(118,91,207,0.09); color: #765bcf; }
        .panel-link.active { background: rgba(118,91,207,0.14); color: #765bcf; font-weight: 700; }
        .panel-icon-wrap {
          width: 28px; height: 28px; border-radius: 7px;
          background: rgba(118,91,207,0.10);
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .side-panel-overlay {
          position: fixed; inset: 0; z-index: 299; background: transparent;
        }

        /* ── OBUNA ── */
        .obuna-box {
          border: 1px solid rgb(253,219,219); border-radius: 12px;
          background: rgb(255,239,239); padding: 12px;
          display: flex; flex-direction: column; gap: 8px;
          overflow: hidden; flex-shrink: 0;
        }

        /* ── MAIN ── */
        .main-content {
          flex: 1; display: flex; flex-direction: column;
          overflow: hidden; background: #f2f2f2;
        }
        .topbar {
          display: flex; align-items: center; justify-content: space-between;
          gap: 12px; padding: 4px 20px; flex-shrink: 0;
          background: #f2f2f2;
          margin-top: 10px;
        }
        .topbar-left { display: flex; align-items: center; gap: 10px; }
        .topbar-right { display: flex; align-items: center; gap: 10px; }
        .tb-icon-btn {
          width: 38px; height: 38px; border-radius: 10px;
          background: #fff; border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          color: #555; font-size: 15px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.06);
          transition: background 0.15s;
        }
        .tb-icon-btn:hover { background: #f0eeff; color: #765bcf; }
        .tb-add-btn {
          height: 38px; padding: 0 16px;
          border-radius: 10px; border: none;
          background: #765bcf; color: #fff;
          font-size: 13.5px; font-weight: 700;
          cursor: pointer; display: flex; align-items: center; gap: 8px;
          transition: background 0.15s;
        }
        .tb-add-btn:hover { background: #5e48a8; }
        .tb-search {
          height: 38px; width: 200px;
          border-radius: 10px; border: 1.5px solid #eee;
          background: #fff; padding: 0 14px 0 36px;
          font-size: 13px; color: #555; outline: none;
          transition: border-color 0.15s;
        }
        .tb-search:focus { border-color: #765bcf; }
        .tb-search-wrap { position: relative; }
        .tb-search-wrap i { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #aaa; font-size: 13px; pointer-events: none; }
        .page-content { flex: 1; overflow-y: auto; padding: 16px 20px 20px; }
      `}</style>

      <div className="layout-root">

        {/* ===== SIDEBAR ===== */}
        <div className="sidebar-wrapper">
          <div className="sidebar-inner">

            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {/* Logo */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, paddingLeft: 2, overflow: "hidden" }}>
                <img style={{ width: 36, height: 36, flexShrink: 0, borderRadius: 10 }} src="/logoedu.png" alt="" />
                <span style={{
                  fontWeight: 700, fontSize: 17, color: "#765bcf", whiteSpace: "nowrap",
                  opacity: collapsed ? 0 : 1, maxWidth: collapsed ? 0 : 180, overflow: "hidden",
                  transition: "opacity 0.2s, max-width 0.28s"
                }}>EduCoin</span>
              </div>

              {/* Nav items */}
              {navItems.map((item, idx) => (
                <NavLink
                  key={idx}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}
                >
                  <i className={`fa-solid ${item.icon} nav-icon`}></i>
                  <span className="nav-label">{item.label}</span>
                  <span className="nav-tip">{item.label}</span>
                </NavLink>
              ))}

              {/* Boshqarish */}
              <button
                onClick={() => setBoshqarishOpen(o => !o)}
                className={`nav-item${isBoshqarish ? " bq-active" : ""}`}
              >
                <i className="fa-solid fa-gear nav-icon"></i>
                <span className="nav-label">Boshqarish</span>
                <span className="nav-tip">Boshqarish</span>
                <i className={`fa-solid fa-chevron-right chevron${boshqarishOpen ? " open" : ""}`}></i>
              </button>
            </div>

            {/* Obuna box */}
            {!collapsed && (
              <div className="obuna-box">
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 26, flexShrink: 0 }}>🔔</span>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: 14, margin: 0, color: "#222" }}>Obuna</p>
                    <p style={{ fontSize: 12, margin: 0, color: "#e53935" }}>Obunangiz tugagan</p>
                  </div>
                </div>
                <div style={{
                  height: 36, borderRadius: 10, background: "rgb(222,76,43)",
                  color: "#fff", display: "flex", alignItems: "center",
                  justifyContent: "center", gap: 8, fontSize: 13, fontWeight: 600, cursor: "pointer",
                }}>
                  <i className="fa-solid fa-arrow-rotate-right"></i>
                  Obunani yangilash
                </div>
              </div>
            )}
          </div>

          {/* Toggle button — sidebar o'ng chegarasida */}
          <button className="toggle-btn" onClick={() => setCollapsed(c => !c)}>
            <i className={`fa-solid fa-chevron-${collapsed ? "right" : "left"}`}></i>
          </button>

          {/* Boshqarish yon panel */}
          {boshqarishOpen && (
            <div className="side-panel-overlay" onClick={() => setBoshqarishOpen(false)} />
          )}
          <div className={`side-panel${boshqarishOpen ? " open" : ""}`}>
            <div className="panel-header">
              <span className="panel-title">Boshqarish</span>
              <button className="panel-close-btn" onClick={() => setBoshqarishOpen(false)}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div className="panel-items">
              {boshqarishMenuItems.map((item, idx) => (
                <NavLink
                  key={idx}
                  to={item.to}
                  onClick={() => setBoshqarishOpen(false)}
                  className={({ isActive }) => `panel-link${isActive ? " active" : ""}`}
                >
                  <span className="panel-icon-wrap">
                    <i className={`fa-solid ${item.icon}`} style={{ fontSize: 12, color: "#765bcf" }}></i>
                  </span>
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
        </div>

        {/* ===== MAIN CONTENT ===== */}
        <div className="main-content">
          <div className="topbar">
            {/* Left side */}
            <div className="topbar-left">
              <button className="tb-icon-btn">
                <i className="fa-regular fa-calendar"></i>
              </button>

              <button className="tb-add-btn">
                <i className="fa-solid fa-plus"></i>
                Qo'shish
                <i className="fa-solid fa-chevron-down" style={{ fontSize: 11 }}></i>
              </button>

              <div className="tb-search-wrap">
                <i className="fa-solid fa-magnifying-glass"></i>
                <input className="tb-search" placeholder="Qidirish..." />
              </div>
            </div>

            {/* Right side */}
            <div className="topbar-right">
              <FormControl>
                <InputLabel id="lang-label"></InputLabel>
                <Select
                  labelId="lang-label"
                  id="lang-select"
                  defaultValue={10}
                  sx={{ width: 150, height: 38, bgcolor: "white", borderRadius: "10px" }}
                >
                  <MenuItem value={10}>O'zbekcha</MenuItem>
                  <MenuItem value={20}>Ruscha</MenuItem>
                  <MenuItem value={30}>Ingilischa</MenuItem>
                </Select>
              </FormControl>

              <button className="tb-icon-btn">
                <i className="fa-regular fa-bell"></i>
              </button>

              <div
                style={{
                  backgroundColor: isDark ? "#fff" : "#3b4358",
                  width: 38, height: 38, borderRadius: 12,
                  display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
                  transition: "all 0.3s ease"
                }}
                onClick={() => setIsDark(!isDark)}
              >
                <i className={`fa-regular ${isDark ? "fa-sun" : "fa-moon"}`} style={{ color: isDark ? "#f59e0b" : "#fff", fontSize: 18 }}></i>
              </div>

              <Avatar alt="User" src="/logoedu.png" sx={{ width: 36, height: 36 }} />
            </div>
          </div>

          <div className="page-content">
            <Outlet />
          </div>
        </div>

      </div>
    </>
  );
}
