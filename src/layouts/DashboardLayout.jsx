import Avatar from "@mui/material/Avatar";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import { useState, useEffect } from "react";
import { NavLink, Outlet } from "react-router-dom";

const boshqarishMenuItems = [
  { icon: "fa-graduation-cap", label: "Kurslar", to: "/dashboard/boshqarish/kurslar" },
  { icon: "fa-door-open", label: "Xonalar", to: "/dashboard/boshqarish/xonalar" },
  { icon: "fa-code-branch", label: "Filial", to: "/dashboard/boshqarish/filial" },
  { icon: "fa-users", label: "Hodimlar", to: "/dashboard/boshqarish/hodimlar" },
  { icon: "fa-circle-exclamation", label: "Sabablar", to: "/dashboard/boshqarish/sabablar" },
  { icon: "fa-user-shield", label: "Rollar", to: "/dashboard/boshqarish/rollar" },
  { icon: "fa-coins", label: "Coin", to: "/dashboard/boshqarish/coin" },
  { icon: "fa-paper-plane", label: "Xabar Yuborish", to: "/dashboard/boshqarish/xabar" },
  { icon: "fa-circle-question", label: "FAQ", to: "/dashboard/boshqarish/faq" },
  { icon: "fa-shield-halved", label: "Tekshiruv", to: "/dashboard/boshqarish/tekshiruv" },
];

export default function DashboardLayout() {
  const [isDark, setIsDark] = useState(false);
  const [boshqarishOpen, setBoshqarishOpen] = useState(false);

  useEffect(() => {
    if (isDark) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  }, [isDark]);

  return (
    <>
      <style>{`
        .layout-root {
          display: flex;
          height: 100vh;
          overflow: hidden;
          background: rgb(242,242,242);
        }

        /* ---- SIDEBAR ---- */
        .sidebar-wrapper {
          position: relative;
          width: 17%;
          flex-shrink: 0;
          height: 100vh;
        }
        .sidebar-inner {
          height: 100%;
          padding: 24px 12px 12px;
          border-radius: 0 14px 14px 0;
          background: #fff;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          overflow-y: auto;
        }

        /* ---- YON PANEL (sidebar-wrapper ga nisbatan) ---- */
        .side-panel {
          position: absolute;
          top: 0;
          left: 100%;          /* sidebar o'ng chekkasidan boshlanadi */
          height: 100%;
          width: 0;
          overflow: hidden;
          background: #fff;
          box-shadow: 6px 0 24px rgba(0,0,0,0.12);
          border-radius: 14px;
          transition: width 0.30s cubic-bezier(0.4,0,0.2,1),
                      opacity 0.25s ease;
          opacity: 0;
          z-index: 300;
          display: flex;
          flex-direction: column;
        }
        .side-panel.open {
          width: 200px;
          opacity: 1;
        }

        /* panel header */
        .panel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 14px 10px 16px;
          border-bottom: 1px solid #f0f0f0;
          flex-shrink: 0;
        }
        .panel-title {
          font-weight: 700;
          font-size: 15px;
          color: #222;
        }
        .panel-close-btn {
          width: 26px;
          height: 26px;
          border-radius: 7px;
          border: none;
          background: rgba(118,91,207,0.12);
          color: #765bcf;
          font-size: 13px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* panel items */
        .panel-items {
          flex: 1;
          overflow-y: auto;
          padding: 8px;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .panel-link {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 12px;
          border-radius: 9px;
          font-size: 13px;
          font-weight: 500;
          color: #444;
          text-decoration: none;
          white-space: nowrap;
          transition: background 0.15s, color 0.15s;
        }
        .panel-link:hover { background: rgba(118,91,207,0.09); color: #765bcf; }
        .panel-link.active { background: rgba(118,91,207,0.14); color: #765bcf; font-weight: 700; }

        .panel-icon-wrap {
          width: 28px;
          height: 28px;
          border-radius: 7px;
          background: rgba(118,91,207,0.10);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        /* ---- NAV LINKS ---- */
        .nav-item {
          width: 100%;
          height: 40px;
          padding-left: 10px;
          padding-right: 8px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 600;
          color: #555;
          text-decoration: none;
          transition: background 0.15s, color 0.15s;
          background: none;
          border: none;
          cursor: pointer;
        }
        .nav-item:hover  { background: rgba(118,91,207,0.07); color: #765bcf; }
        .nav-item.active { background: rgba(118,91,207,0.12); color: #765bcf; }
        .nav-item.boshqarish-active {
          background: rgba(118,91,207,0.13);
          color: #765bcf;
        }

        .chevron {
          margin-left: auto;
          font-size: 11px;
          color: #aaa;
          transition: transform 0.28s cubic-bezier(0.4,0,0.2,1), color 0.2s;
        }
        .chevron.open { transform: rotate(90deg); color: #765bcf; }

        /* ---- MAIN CONTENT ---- */
        .main-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          background: rgb(242,242,242);
        }
        .topbar {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          gap: 12px;
          padding: 16px 20px;
          flex-shrink: 0;
        }
        .page-content {
          flex: 1;
          overflow-y: auto;
          padding: 0 20px 20px;
        }
      `}</style>

      <div className="layout-root">

        {/* ===== SIDEBAR ===== */}
        <div className="sidebar-wrapper">
          <div className="sidebar-inner">

            {/* Nav links */}
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>

              {/* Logo */}
              <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 12 }}>
                <img style={{ width: 40, height: 40 }} src="/logoedu.png" alt="" />
                <i style={{ fontWeight: 700, fontSize: 18, color: "#765bcf" }}>EduCoin</i>
              </div>

              <NavLink to="/dashboard" end className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}>
                <i className="fa-solid fa-house" style={{ width: 16, textAlign: "center" }}></i>
                Asosiy
              </NavLink>

              <NavLink to="/dashboard/o'qituvcilar" className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}>
                <i className="fa-solid fa-user-tie" style={{ width: 16, textAlign: "center" }}></i>
                O'qituvcilar
              </NavLink>

              <NavLink to="/dashboard/sinflar" className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}>
                <i className="fa-solid fa-layer-group" style={{ width: 16, textAlign: "center" }}></i>
                Guruhlar
              </NavLink>

              <NavLink to="/dashboard/talabalar" className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}>
                <i className="fa-solid fa-user-graduate" style={{ width: 16, textAlign: "center" }}></i>
                Talabalar
              </NavLink>

              <NavLink to="/dashboard/sovg'alar" className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}>
                <i className="fa-regular fa-gem" style={{ width: 16, textAlign: "center" }}></i>
                Sovg'alar
              </NavLink>

              {/* Boshqarish trigger */}
              <button
                onClick={() => setBoshqarishOpen(!boshqarishOpen)}
                className={`nav-item${boshqarishOpen ? " boshqarish-active" : ""}`}
              >
                <i className="fa-solid fa-arrow-right-arrow-left" style={{ width: 16, textAlign: "center" }}></i>
                Boshqarish
                <i className={`fa-solid fa-chevron-right chevron${boshqarishOpen ? " open" : ""}`}></i>
              </button>
            </div>

            {/* Obuna box */}
            <div className="obuna-box" style={{
              border: "1px solid rgb(253,219,219)",
              borderRadius: 12,
              background: "rgb(255,239,239)",
              padding: 12,
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 32 }}>🔔</span>
                <div>
                  <p style={{ fontWeight: 600, fontSize: 14, margin: 0, color: "#222" }}>Obuna</p>
                  <p style={{ fontSize: 12, fontWeight: 500, margin: 0, color: "#888" }}>Obunangiz tugagan</p>
                </div>
              </div>
              <div style={{
                height: 40, borderRadius: 10,
                background: "rgb(222,76,43)",
                color: "#fff",
                display: "flex", alignItems: "center", justifyContent: "center",
                gap: 8, fontSize: 14, fontWeight: 600, cursor: "pointer",
              }}>
                <i className="fa-solid fa-arrow-rotate-right"></i>
                Obunani yangilash
              </div>
            </div>
          </div>

          {/* ===== YON PANEL — sidebar-wrapper ichida, absolute ===== */}
          <div className={`side-panel${boshqarishOpen ? " open" : ""}`}>
            <div className="panel-header">
              <span className="panel-title">Menu</span>
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
            <FormControl>
              <InputLabel id="lang-label"></InputLabel>
              <Select
                labelId="lang-label"
                id="lang-select"
                defaultValue={10}
                sx={{ width: 180, height: 40, bgcolor: "white", borderRadius: "12px" }}
              >
                <MenuItem value={10}>O'zbekcha</MenuItem>
                <MenuItem value={20}>Ruscha</MenuItem>
                <MenuItem value={30}>Ingilischa</MenuItem>
              </Select>
            </FormControl>

            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: "#fff", display: "flex", alignItems: "center",
              justifyContent: "center", cursor: "pointer",
            }}>
              <i className="fa-regular fa-bell"></i>
            </div>

            <div
              style={{
                backgroundColor: isDark ? "#fff" : "#3b4358",
                width: 42, height: 42, borderRadius: 14,
                display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
                boxShadow: isDark ? "0 2px 8px rgba(0,0,0,0.05)" : "none",
                transition: "all 0.3s ease"
              }}
              onClick={() => setIsDark(!isDark)}
            >
              <i className={`fa-regular ${isDark ? "fa-sun" : "fa-moon"}`} style={{ color: isDark ? "#f59e0b" : "#fff", fontSize: 20 }}></i>
            </div>

            <Avatar alt="User" src="/logoedu.png" />
          </div>

          <div className="page-content">
            <Outlet />
          </div>
        </div>

      </div>
    </>
  );
}
