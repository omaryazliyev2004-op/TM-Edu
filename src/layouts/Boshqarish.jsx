import { NavLink, Outlet, Navigate, useLocation } from "react-router-dom";

export default function Boshqarish() {
  const location = useLocation();
  
  if (location.pathname === "/dashboard/boshqarish" || location.pathname === "/dashboard/boshqarish/") {
    return <Navigate to="/dashboard/boshqarish/xonalar" replace />;
  }

  const tabs = [
    { name: "Kurslar", path: "/dashboard/boshqarish/kurslar" },
    { name: "Xonalar", path: "/dashboard/boshqarish/xonalar" },
    { name: "Xodimlar", path: "/dashboard/boshqarish/hodimlar" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#222", marginBottom: 16 }}>Boshqarish</h1>
        <div style={{ display: "flex", gap: 24, borderBottom: "2px solid #eee" }}>
          {tabs.map((tab, idx) => (
            <NavLink
              key={idx}
              to={tab.path}
              style={({ isActive }) => ({
                paddingBottom: 8,
                fontSize: 14,
                fontWeight: isActive ? 600 : 500,
                color: isActive ? "#765bcf" : "#888",
                borderBottom: isActive ? "2px solid #765bcf" : "2px solid transparent",
                marginBottom: -2,
                textDecoration: "none",
                transition: "color 0.2s, border-color 0.2s"
              })}
            >
              {tab.name}
            </NavLink>
          ))}
        </div>
      </div>
      <div style={{ flex: 1 }}>
        <Outlet />
      </div>
    </div>
  );
}