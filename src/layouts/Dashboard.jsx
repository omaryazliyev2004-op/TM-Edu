import { useState } from "react";

const statsData = [
  { icon: "fa-solid fa-school", label: "Sinflar", count: 12 },
  { icon: "fa-solid fa-book-open", label: "Fanlar", count: 80000 },
  { icon: "fa-solid fa-graduation-cap", label: "Talabalar", count: 246 },
  { icon: "fa-solid fa-gift", label: "Sovg'alar", count: 34 },
  { icon: "fa-solid fa-user-check", label: "O'qituvchilar", count: 18 },
];

export default function Asosiy() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <style>{`
        .stat-card {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .stat-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 24px rgba(124,77,255,0.13);
        }
        .acc-body {
          overflow: hidden;
          max-height: 0;
          transition: max-height 0.35s cubic-bezier(0.4,0,0.2,1);
        }
        .acc-body.open {
          max-height: 200px;
        }
        .acc-chevron {
          transition: transform 0.3s ease;
          font-size: 13px;
          color: #888;
        }
        .acc-chevron.open {
          transform: rotate(180deg);
        }
      `}</style>

      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-[32px] font-semibold">Salom, Ahmadjon</h2>
          <p className="font-medium text-[#555555]">
            EduCoin platformasiga xush kelibsiz!
          </p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-5 gap-3">
          {statsData.map((item, idx) => (
            <div
              key={idx}
              className="stat-card border h-36 rounded-xl bg-white border-[#e0e0e0] flex justify-center items-center flex-col gap-1 cursor-pointer"
            >
              <div
                style={{
                  background: "rgba(124,77,255,0.10)",
                  borderRadius: "50%",
                  width: 40, height: 40,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                <i className={item.icon + " text-[#7C4DFF] text-[18px]"}></i>
              </div>
              <h2 className="font-semibold text-[13px] text-[#555]">{item.label}</h2>
              <h2 className="font-bold text-[22px] text-[#222]">{item.count}</h2>
            </div>
          ))}
        </div>

        {/* Dars Jadvali — Accordion */}
        <div className="bg-white rounded-2xl border border-[#e0e0e0] overflow-hidden">
          {/* Accordion header */}
          <button
            onClick={() => setOpen(o => !o)}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "16px 20px",
              background: "none",
              border: "none",
              cursor: "pointer",
              borderBottom: open ? "1px solid #f0f0f0" : "none",
              transition: "border-bottom 0.3s",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  background: "rgba(124,77,255,0.12)",
                  borderRadius: 8,
                  width: 34, height: 34,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                <i className="fa-solid fa-calendar-days text-[#7C4DFF] text-[15px]"></i>
              </div>
              <span style={{ fontWeight: 700, fontSize: 17, color: "#222" }}>Dars Jadvali</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span
                style={{
                  background: "rgba(124,77,255,0.10)",
                  color: "#7C4DFF",
                  borderRadius: 8,
                  padding: "4px 14px",
                  fontWeight: 600,
                  fontSize: 13,
                }}
              >
                2025-2026 o'quv yili
              </span>
              <i className={`fa-solid fa-chevron-down acc-chevron${open ? " open" : ""}`}></i>
            </div>
          </button>

          {/* Accordion body — bo'sh */}
          <div className={`acc-body${open ? " open" : ""}`}>
            <div style={{ padding: "24px 20px", color: "#aaa", fontSize: 14, textAlign: "center" }}>
              Ma'lumot mavjud emas
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
