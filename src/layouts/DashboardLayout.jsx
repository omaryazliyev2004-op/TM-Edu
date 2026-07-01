import Avatar from "@mui/material/Avatar";
import { useState, useEffect, useRef } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Home, UserSquare2, Users, GraduationCap, Gift,
  BookOpen, LayoutGrid, Building2, ListTodo,
  LayoutDashboard, ChevronRight, ChevronLeft, X, Zap,ClipboardList
} from "lucide-react";

const boshqarishMenuItems = [
  { icon: BookOpen, label: "Kurslar", to: "/dashboard/boshqarish/kurslar" },
  { icon: LayoutGrid, label: "Xonalar", to: "/dashboard/boshqarish/xonalar" },
  { icon: Building2, label: "Filiallar", to: "/dashboard/boshqarish/filiallar" },
  { icon: UserSquare2, label: "Xodimlar", to: "/dashboard/boshqarish/hodimlar" },
  { icon: ListTodo, label: "Sabablar", to: "/dashboard/boshqarish/sabablar" },
];

const navItems = [
  { icon: Home,          label: "Asosiy",        to: "/dashboard", end: true },
  { icon: UserSquare2,   label: "O'qituvchilar", to: "/dashboard/o'qituvcilar" },
  { icon: Users,         label: "Guruhlar",      to: "/dashboard/sinflar" },
  { icon: GraduationCap, label: "Talabalar",     to: "/dashboard/talabalar" },
  { icon: Gift,          label: "Sov'g'alar",    to: "/dashboard/sovg'alar" },
];

export default function DashboardLayout() {
  const [isDark, setIsDark] = useState(() => localStorage.getItem("theme") === "dark");
  const [boshqarishOpen, setBoshqarishOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  const location = useLocation();
  const navigate = useNavigate();
  const isBoshqarish = location.pathname.startsWith("/dashboard/boshqarish");

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  // Profil menyusidan tashqariga bosilganda yopamiz
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

  useEffect(() => {
    document.body.classList.toggle("dark", isDark);
    localStorage.setItem("theme", isDark ? "dark" : "light");
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
          background: #f1f5f9;
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
          padding: 0 0 16px 0;
          background: #fff;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          overflow: hidden;
          border-right: 1px solid #f3f4f6;
          box-shadow: 1px 0 0 #f3f4f6;
        }

        /* ── TOGGLE BUTTON on sidebar right edge ── */
        .toggle-btn {
          position: absolute;
          right: -16px;
          top: 51px;
          width: 32px; height: 32px;
          border-radius: 50%;
          border: 1.5px solid rgba(124,58,237,0.15);
          background: #7c3aed;
          color: #fff;
          font-size: 14px;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 12px rgba(124,58,237,0.3);
          transition: background 0.15s, transform 0.15s;
          z-index: 400;
        }
        .toggle-btn:hover {
          background: #6d28d9;
          transform: scale(1.1);
        }

        /* ── NAV ITEM ── */
        .nav-item {
          position: relative;
          width: 100%;
          height: 54px;
          padding: 0 16px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          gap: 14px;
          font-size: 14px;
          font-weight: 600;
          color: #6b7280;
          text-decoration: none;
          transition: background 0.2s, color 0.2s, transform 0.2s;
          background: none;
          border: none;
          cursor: pointer;
          white-space: nowrap;
          overflow: hidden;
        }
        .nav-item:hover { background: #f5f3ff; color: #7c3aed; transform: translateX(4px); }
        .nav-item.active,
        .nav-item.bq-active {
          background: #7c3aed;
          color: #fff;
          box-shadow: 0 20px 25px -5px rgba(167,139,250,0.35), 0 8px 10px -6px rgba(124,58,237,0.2);
          transform: scale(1.02);
        }
        .nav-item.active .nav-icon,
        .nav-item.bq-active .nav-icon { color: #fff; transform: none; }

        .nav-icon { width: 20px; height: 20px; flex-shrink: 0; color: #6b7280; transition: color 0.2s, transform 0.2s; }
        .nav-item:hover .nav-icon { color: #7c3aed; transform: scale(1.1); }

        .nav-label {
          overflow: hidden;
          white-space: nowrap;
          transition: opacity 0.2s, max-width 0.28s;
          opacity: ${collapsed ? 0 : 1};
          max-width: ${collapsed ? "0px" : "180px"};
        }
        .chevron {
          margin-left: auto;
          width: 15px;
          height: 15px;
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
        .side-panel.open { width: 280px; opacity: 1; }

        .panel-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 16px 16px 12px 20px;
          border-bottom: 1px solid #f0f0f0; flex-shrink: 0;
        }
        .panel-title { font-weight: 700; font-size: 16px; color: #222; }
        .panel-close-btn {
          width: 28px; height: 28px; border-radius: 8px; border: none;
          background: rgba(124,58,237,0.12); color: #7c3aed; font-size: 14px;
          cursor: pointer; display: flex; align-items: center; justify-content: center;
        }
        .panel-items {
          flex: 1; overflow-y: auto; padding: 12px;
          display: flex; flex-direction: column; gap: 6px;
        }
        .panel-link {
          display: flex; align-items: center; gap: 12px;
          padding: 10px 14px; border-radius: 10px;
          font-size: 14px; font-weight: 500; color: #444;
          text-decoration: none; white-space: nowrap;
          transition: background 0.15s, color 0.15s;
        }
        .panel-link:hover { background: rgba(124,58,237,0.09); color: #7c3aed; }
        .panel-link.active { background: rgba(124,58,237,0.14); color: #7c3aed; font-weight: 700; }
        .panel-icon-wrap {
          width: 32px; height: 32px; border-radius: 8px;
          background: rgba(124,58,237,0.10);
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .side-panel-overlay {
          position: fixed; inset: 0; z-index: 299; background: transparent;
        }

        /* ── OBUNA ── */
        .obuna-box {
          margin: 0 16px 8px;
          border-radius: 24px;
          background: rgba(255,247,237,0.6);
          border: 1px solid rgba(254,215,170,0.5);
          padding: 20px;
          display: flex; flex-direction: column; gap: 14px;
          overflow: hidden; flex-shrink: 0;
        }

        /* ── MAIN ── */
        .main-content {
          flex: 1; display: flex; flex-direction: column;
          overflow: hidden; background: #f1f5f9;
        }
        .topbar {
          display: flex; align-items: center; justify-content: space-between;
          gap: 12px; padding: 12px 24px; flex-shrink: 0;
          background: #fff;
          border-bottom: 1px solid #f3f4f6;
        }
        .topbar-left { display: flex; align-items: center; gap: 12px; }
        .topbar-right { display: flex; align-items: center; gap: 12px; }
        .tb-icon-btn {
          width: 40px; height: 40px; border-radius: 12px;
          background: #f9fafb; border: 1px solid #e5e7eb; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          color: #4b5563; font-size: 16px;
          transition: background 0.15s;
        }
        .tb-icon-btn:hover { background: #f3f4f6; }
        .tb-icon-btn-sm {
          width: 36px; height: 36px; border-radius: 12px;
          background: #f9fafb; border: 1px solid #e5e7eb; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          color: #6b7280; font-size: 15px;
          transition: background 0.15s;
          position: relative;
        }
        .tb-icon-btn-sm:hover { background: #f3f4f6; }
        .tb-add-btn {
          height: 40px; padding: 0 20px;
          border-radius: 12px; border: none;
          background: #7c3aed; color: #fff;
          font-size: 13px; font-weight: 800;
          cursor: pointer; display: flex; align-items: center; gap: 8px;
          transition: background 0.15s, box-shadow 0.15s;
          box-shadow: 0 10px 15px -3px rgba(124,58,237,0.2);
        }
        .tb-add-btn:hover { background: #6d28d9; box-shadow: 0 10px 15px -3px rgba(109,40,217,0.3); }
        .tb-search-wrap {
          display: flex; align-items: center; gap: 8px;
          padding: 0 12px;
          border-radius: 12px; border: 1px solid #e5e7eb;
          background: #fff; height: 40px; width: 240px;
          box-shadow: 0 1px 2px rgba(0,0,0,0.04);
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .tb-search-wrap:focus-within { border-color: #c4b5fd; box-shadow: 0 0 0 4px rgba(124,58,237,0.07); }
        .tb-search {
          width: 100%; border: none; outline: none;
          font-size: 14.5px; color: #111; background: transparent;
          font-weight: 500;
        }
        .tb-search::placeholder { color: #9ca3af; }
        .tb-search-icon { color: #9ca3af; font-size: 13px; flex-shrink: 0; }
        .page-content { flex: 1; overflow-y: auto; padding: 16px 20px 20px; }
      `}</style>

      <div className="layout-root">

        {/* ===== SIDEBAR ===== */}
        <div className="sidebar-wrapper">
          <div className="sidebar-inner">

            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {/* Logo */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "28px 20px 20px", overflow: "hidden" }}>
                <div style={{ width: 48, height: 48, flexShrink: 0, borderRadius: 16, background: "#ede9fe", display: "flex", alignItems: "center", justifyContent: "center", color: "#7c3aed", fontSize: 24, boxShadow: "0 2px 8px rgba(124,58,237,0.15)" }}>
                  <GraduationCap size={24} />
                </div>
                <span style={{
                  fontWeight: 800, fontSize: 22, color: "#1f2d5a", whiteSpace: "nowrap", letterSpacing: "-0.5px",
                  opacity: collapsed ? 0 : 1, maxWidth: collapsed ? 0 : 180, overflow: "hidden",
                  transition: "opacity 0.2s, max-width 0.28s"
                }}>TM-Edu</span>
              </div>

            <div style={{ flex: 1, padding: "0 12px", display: "flex", flexDirection: "column", gap: 6 }}>
              {/* Nav items */}
              {navItems.map((item, idx) => (
                <NavLink
                  key={idx}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) => `nav-item${isActive && !isBoshqarish ? " active" : ""}`}
                >
                  <item.icon className="nav-icon" />
                  <span className="nav-label">{item.label}</span>
                  <span className="nav-tip">{item.label}</span>
                </NavLink>
              ))}

              {/* Boshqarish */}
              <button
                onClick={() => setBoshqarishOpen(o => !o)}
                className={`nav-item${isBoshqarish ? " bq-active" : ""}`}
              >
                <LayoutDashboard className="nav-icon" />
                <span className="nav-label">Boshqarish</span>
                <span className="nav-tip">Boshqarish</span>
                <ChevronRight size={15} className={`chevron${boshqarishOpen ? " open" : ""}`} />
              </button>
            </div>
            </div>

            {/* Obuna box */}
            {!collapsed && (
              <div className="obuna-box">
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 16, background: "#fed7aa", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "#f97316", boxShadow: "0 2px 8px rgba(249,115,22,0.15)" }}>
                    <ClipboardList size={22} />
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: 15.5, margin: "0 0 2px", color: "#1e293b", lineHeight: 1.2 }}>Obuna</p>
                    <p style={{ fontSize: 13.5, margin: 0, color: "#f97316", fontWeight: 600 }}>Obunangiz tugagan</p>
                  </div>
                </div>
                <button style={{
                  width: "100%", height: 48, borderRadius: 16, background: "#f97316",
                  color: "#fff", display: "flex", alignItems: "center", border: "none",
                  justifyContent: "center", gap: 8, fontSize: 14.5, fontWeight: 700, cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(249,115,22,0.25)", transition: "background 0.15s, transform 0.15s"
                }}
                  onMouseEnter={e => e.currentTarget.style.background = "#ea580c"}
                  onMouseLeave={e => e.currentTarget.style.background = "#f97316"}
                >
                  <Zap size={15} />
                  Obunani yangilash
                </button>
              </div>
            )}
          </div>

          {/* Toggle button — sidebar o'ng chegarasida */}
          <button className="toggle-btn" onClick={() => setCollapsed(c => !c)}>
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>

          {/* Boshqarish yon panel */}
          {boshqarishOpen && (
            <div className="side-panel-overlay" onClick={() => setBoshqarishOpen(false)} />
          )}
          <div className={`side-panel${boshqarishOpen ? " open" : ""}`}>
            <div className="panel-header">
              <span className="panel-title">Boshqarish</span>
              <button className="panel-close-btn" onClick={() => setBoshqarishOpen(false)}>
                <X size={15} />
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
                    <item.icon size={12} color="#765bcf" />
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
                <i className="fa-solid fa-magnifying-glass tb-search-icon"></i>
                <input className="tb-search" placeholder="Qidirish..." />
              </div>
            </div>

            {/* Right side */}
            <div className="topbar-right">

              {/* Til icon (dekorativ) */}
              <button className="tb-icon-btn-sm" style={{ cursor: "default" }} disabled>
                <i className="fa-solid fa-globe" style={{ color: "#6b7280" }}></i>
              </button>

              {/* Bell */}
              <button className="tb-icon-btn-sm" style={{ position: "relative" }}>
                <i className="fa-regular fa-bell"></i>
                <span style={{ position: "absolute", top: 9, right: 9, width: 7, height: 7, background: "#ef4444", borderRadius: "50%", border: "1.5px solid #fff" }}></span>
              </button>

              {/* Dark mode icon (dekorativ) */}
              <button className="tb-icon-btn-sm" style={{ cursor: "default" }} disabled>
                <i className="fa-regular fa-moon" style={{ color: "#6b7280" }}></i>
              </button>


              <div ref={profileRef} style={{ position: "relative" }}>
                <div
                  onClick={() => setProfileOpen((o) => !o)}
                  style={{
                    width: 36, height: 36, borderRadius: 12,
                    background: "#7c3aed", color: "#fff",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontWeight: 700, fontSize: 13, cursor: "pointer"
                  }}
                >
                  A
                </div>
                {profileOpen && (
                  <div
                    style={{
                      position: "absolute",
                      top: "calc(100% + 10px)",
                      right: 0,
                      minWidth: 160,
                      background: "#fff",
                      borderRadius: 16,
                      boxShadow: "0 10px 25px -5px rgba(0,0,0,0.08), 0 8px 10px -6px rgba(0,0,0,0.04)",
                      border: "1px solid #f3f4f6",
                      padding: 4,
                      zIndex: 1000,
                    }}
                  >
                    <div style={{ padding: "10px 12px", fontSize: 14.5, fontWeight: 700, color: "#1f2937", borderBottom: "1px solid #f9fafb", marginBottom: 4 }}>Admin</div>
                    <button
                      onClick={handleLogout}
                      style={{
                        display: "flex", alignItems: "center", gap: 10,
                        width: "100%", padding: "10px 12px",
                        border: "none", background: "transparent",
                        borderRadius: 10, cursor: "pointer",
                        fontSize: 12, fontWeight: 600, color: "#ef4444", textAlign: "left",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#fef2f2")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <i className="fa-solid fa-right-from-bracket"></i>
                      Chiqish
                    </button>
                  </div>
                )}
              </div>
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
