import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Home, CreditCard, Users, BarChart2, Award,
  ShoppingCart, PlayCircle, Settings, ChevronLeft,
  Calendar, Plus, ChevronDown, Search, Globe, Bell, Moon
} from "lucide-react";

const navItems = [
  { icon: <Home size={20} />, label: "Bosh sahifa", to: "/student/bosh-sahifa" },
  { icon: <CreditCard size={20} />, label: "To'lovlarim", to: "/student/tolovlarim" },
  { icon: <Users size={20} />, label: "Guruhlarim", to: "/student/guruhlarim" },
  { icon: <BarChart2 size={20} />, label: "Ko'rsatgichlarim", to: "/student/korsatgichlarim" },
  { icon: <Award size={20} />, label: "Reyting", to: "/student/reyting" },
  { icon: <ShoppingCart size={20} />, label: "Do`kon", to: "/student/dokon" },
  { icon: <PlayCircle size={20} />, label: "Qo'shimcha darslar", to: "/student/qoshimcha-darslar" },
  { icon: <Settings size={20} />, label: "Sozlamalar", to: "/student/sozlamalar" },
];

export default function StudentLayout() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const W = collapsed ? 84 : 260;

  return (
    <>
      <style>{`
        .st-root { display:flex; flex-direction:column; height:100vh; overflow:hidden; background:#f3f4f6; }

        /* ── TOP HEADER ── */
        .st-header {
          display:flex; align-items:center; justify-content:space-between;
          height:72px; padding:0 26px; background:#fff; flex-shrink:0;
        }
        .st-header-left { display:flex; align-items:center; gap:14px; width:285px; }
        .st-logo { display:flex; align-items:center; gap:10px; white-space:nowrap; }
        .st-logo img { width:38px; height:38px; object-fit:contain; }
        .st-logo-text { font-weight:800; font-size:24px; letter-spacing:.3px; color:#7c6fe8; }
        .st-burger {
          width:46px; height:46px; border:none; border-radius:12px; cursor:pointer;
          background:#e3d3bb; color:#9c7232; font-size:17px; margin-left:auto;
          display:flex; align-items:center; justify-content:center; transition:background .15s;
        }
        .st-burger:hover { background:#d8c4a4; }
        .st-header-right { display:flex; align-items:center; gap:22px; }
        .st-icon-btn {
          position:relative; border:none; background:transparent; cursor:pointer;
          color:#a07c4f; font-size:24px; display:flex; align-items:center; padding:0;
          transition:color .15s;
        }
        .st-icon-btn:hover { color:#b07d3c; }
        .st-icon-btn.logout { color:#333; }
        .st-icon-btn.logout:hover { color:#e53935; }
        .st-badge {
          position:absolute; top:-6px; right:-8px; min-width:19px; height:19px;
          padding:0 4px; border-radius:10px; background:#e53935; color:#fff;
          font-size:11px; font-weight:700; display:flex; align-items:center; justify-content:center;
        }

        /* ── BODY (sidebar + content) ── */
        .st-body { flex:1; display:flex; min-height:0; }
        .st-sidebar {
          width:${W}px; flex-shrink:0; background:#fff; overflow:hidden;
          transition:width .26s cubic-bezier(.4,0,.2,1);
        }
        .st-sidebar-inner { width:260px; padding:22px 14px; }
        .st-nav { display:flex; flex-direction:column; gap:5px; }
        .st-nav-item {
          position:relative; display:flex; align-items:center; gap:14px;
          height:46px; padding:0 14px; border-radius:12px;
          font-size:14.5px; font-weight:500; color:#4b4b4b;
          text-decoration:none; transition:background .15s, color .15s; white-space:nowrap;
        }
        .st-nav-item:hover { background:#faf5ec; color:#b07d3c; }
        .st-nav-item.active { background:#fbf2e4; color:#a8742f; font-weight:600; }
        .st-nav-item.active::before {
          content:""; position:absolute; left:0; top:9px; bottom:9px;
          width:3.5px; border-radius:3px; background:#b07d3c;
        }
        .st-nav-icon { width:22px; text-align:center; font-size:17px; flex-shrink:0; }
        .st-content { flex:1; overflow-y:auto; padding:18px 26px 26px; min-width:0; }

        .st-root { flex-direction:row; background:#f3f4f6; color:#111827; }
        .st-shell { flex:1; display:flex; flex-direction:column; min-width:0; }
        .st-body { display:contents; }
        .st-sidebar {
          position:relative;
          width:${W}px;
          height:100vh;
          overflow:visible;
          border-right:1px solid #f3f4f6;
          box-shadow:0 1px 3px rgba(15,23,42,.04);
          transition:width .30s ease;
          order:0;
        }
        .st-sidebar-inner { width:${W}px; padding:10px 16px 22px; overflow:hidden; }
        .st-nav { gap:6px; margin-top:8px; }
        .st-nav-item {
          min-height:50px;
          height:auto;
          padding:0 16px;
          border-radius:16px;
          font-size:15px;
          font-weight:700;
          color:#6b7280;
          justify-content:${collapsed ? "center" : "flex-start"};
          transition:background .2s, color .2s, box-shadow .2s;
        }
        .st-nav-item:hover { background:#f9fafb; color:#1f2937; }
        .st-nav-item.active { background:#fff7ed; color:#f97316; box-shadow:0 1px 4px rgba(255,237,213,.80); }
        .st-nav-item.active::before {
          left:0;
          top:9px;
          bottom:9px;
          width:6px;
          border-radius:0 6px 6px 0;
          background:#f97316;
          display:${collapsed ? "none" : "block"};
        }
        .st-nav-icon { width:20px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
        .st-nav-label { display:${collapsed ? "none" : "inline"}; flex:1; }
        .st-side-logo {
          height:78px;
          padding:0 20px;
          display:flex;
          align-items:center;
          justify-content:${collapsed ? "center" : "flex-start"};
          white-space:nowrap;
          overflow:hidden;
        }
        .st-side-logo-text { font-weight:900; font-size:20px; letter-spacing:-.3px; color:#1f2d5a; }
        .st-collapse {
          position:absolute;
          right:-16px;
          top:51px;
          width:32px;
          height:32px;
          border-radius:50%;
          border:1px solid rgba(249,115,22,.12);
          background:#f97316;
          color:#fff;
          cursor:pointer;
          display:flex;
          align-items:center;
          justify-content:center;
          font-size:18px;
          box-shadow:0 8px 16px rgba(251,146,60,.30);
          z-index:300;
        }
        .st-collapse:hover { background:#ea580c; }
        .st-collapse svg { transform:${collapsed ? "rotate(180deg)" : "rotate(0deg)"}; transition:transform .30s; }

        .st-header {
          height:64px;
          padding:0 28px;
          gap:18px;
          border-bottom:1px solid #f3f4f6;
          order:0;
        }
        .st-header-left { width:auto; gap:12px; min-width:0; }
        .st-logo, .st-burger { display:none; }
        .st-header-right { gap:12px; }
        .st-top-btn {
          width:40px;
          height:40px;
          border:1px solid #e5e7eb;
          border-radius:12px;
          background:#fff;
          color:#4b5563;
          cursor:pointer;
          display:flex;
          align-items:center;
          justify-content:center;
          font-size:17px;
        }
        .st-add-btn {
          height:40px;
          padding:0 20px;
          border:none;
          border-radius:12px;
          background:#7c3aed;
          color:#fff;
          cursor:pointer;
          display:flex;
          align-items:center;
          gap:10px;
          font-size:13px;
          font-weight:800;
          box-shadow:0 10px 15px -3px rgba(124,58,237,.20);
        }
        .st-search { position:relative; width:300px; }
        .st-search input {
          width:100%;
          height:40px;
          border:1px solid #e5e7eb;
          border-radius:12px;
          background:#fff;
          padding:0 14px 0 40px;
          outline:none;
          color:#111827;
          font-size:14.5px;
          font-weight:600;
          box-shadow:0 1px 3px rgba(15,23,42,.08);
        }
        .st-search input::placeholder { color:#9ca3af; }
        .st-search svg { position:absolute; left:14px; top:50%; transform:translateY(-50%); color:#9ca3af; }
        .st-lang { height:36px; min-width:150px; border:1px solid #e5e7eb; border-radius:12px; background:#f9fafb; color:#4b5563; padding:0 32px 0 36px; font-size:13px; font-weight:700; appearance:none; outline:none; cursor:pointer; }
        .st-lang-wrap { position:relative; display:flex; align-items:center; }
        .st-lang-wrap .globe { position:absolute; left:12px; color:#6b7280; pointer-events:none; }
        .st-lang-wrap .chev { position:absolute; right:12px; color:#9ca3af; font-size:11px; pointer-events:none; }
        .st-icon-btn { width:36px; height:36px; border:1px solid #e5e7eb; border-radius:12px; background:#f9fafb; color:#6b7280; font-size:16px; align-items:center; justify-content:center; }
        .st-icon-btn.logout { color:#6b7280; }
        .st-badge { top:7px; right:8px; width:9px; min-width:0; height:9px; padding:0; border-radius:50%; border:2px solid #fff; font-size:0; }
        .st-avatar { width:36px; height:36px; border:none; border-radius:12px; background:#7c3aed; color:#fff; cursor:pointer; font-size:13px; font-weight:900; display:flex; align-items:center; justify-content:center; }
        .st-profile { position:relative; }
        .st-menu { position:absolute; top:calc(100% + 14px); right:0; min-width:160px; background:#fff; border:1px solid #f3f4f6; border-radius:16px; box-shadow:0 10px 25px -5px rgba(0,0,0,.05),0 8px 10px -6px rgba(0,0,0,.05); padding:4px; z-index:1000; overflow:hidden; }
        .st-role { padding:10px 12px; font-size:14.5px; font-weight:800; color:#1f2937; border-bottom:1px solid #f9fafb; margin-bottom:4px; }
        .st-logout { width:100%; padding:10px 12px; border:none; background:transparent; border-radius:10px; color:#ef4444; font-size:12px; font-weight:700; text-align:left; cursor:pointer; }
      `}</style>

      <div className="st-root">
        <aside className="st-sidebar">
          <div className="st-side-logo">
            <span className="st-side-logo-text">{collapsed ? "TM" : "TM-Edu"}</span>
          </div>
          <div className="st-sidebar-inner">
            <nav className="st-nav">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) => `st-nav-item${isActive ? " active" : ""}`}
                >
                  <span className="st-nav-icon">{item.icon}</span>
                  <span className="st-nav-label">{item.label}</span>
                </NavLink>
              ))}
            </nav>
          </div>
          <button className="st-collapse" onClick={() => setCollapsed((c) => !c)}>
            <ChevronLeft size={18} />
          </button>
        </aside>

        <div className="st-shell">
        {/* Top header */}
        <header className="st-header">
          <div className="st-header-left">
            <div className="st-logo">
              <img src="/logoedu.png" alt="EduCoin" />
              <span className="st-logo-text">EduCoin</span>
            </div>
            <button className="st-burger" onClick={() => setCollapsed((c) => !c)}>
              <ChevronLeft size={18} />
            </button>
            <button className="st-top-btn"><Calendar size={18} /></button>
            <button className="st-add-btn">
              <Plus size={16} />
              Qo'shish
              <ChevronDown size={14} />
            </button>
            <div className="st-search">
              <Search size={16} />
              <input placeholder="Qidirish..." />
            </div>
          </div>

          <div className="st-header-right">
            {/* Til icon (dekorativ) */}
            <button className="st-icon-btn" style={{ cursor: "default" }} disabled>
              <Globe size={18} />
            </button>
            <button className="st-icon-btn">
              <Bell size={18} />
              <span className="st-badge"></span>
            </button>
            {/* Dark mode icon (dekorativ) */}
            <button className="st-icon-btn" style={{ cursor: "default" }} disabled>
              <Moon size={18} />
            </button>
            <div className="st-profile">
              <button className="st-avatar" onClick={() => setProfileOpen((o) => !o)}>S</button>
              {profileOpen && (
                <div className="st-menu">
                  <div className="st-role">Talaba</div>
                  <button className="st-logout" onClick={handleLogout}>
                    Chiqish
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Body */}
        <div className="st-body">
          <main className="st-content">
            <Outlet />
          </main>
        </div>
        </div>
      </div>
    </>
  );
}
