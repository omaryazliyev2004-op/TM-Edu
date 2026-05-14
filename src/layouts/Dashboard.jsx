const schedule = [
  {
    vaqt: "08:00 - 08:45",
    dushanba: { fan: "Matematika", sinf: "9-A", rang: "#7C4DFF" },
    seshanba: { fan: "Fizika", sinf: "10-B", rang: "#FF6B6B" },
    chorshanba: { fan: "Biologiya", sinf: "8-A", rang: "#4CAF50" },
    payshanba: { fan: "Kimyo", sinf: "11-A", rang: "#FF9800" },
    juma: { fan: "Matematika", sinf: "9-B", rang: "#7C4DFF" },
  },
  {
    vaqt: "09:00 - 09:45",
    dushanba: { fan: "Ingliz tili", sinf: "10-A", rang: "#2196F3" },
    seshanba: { fan: "Matematika", sinf: "8-B", rang: "#7C4DFF" },
    chorshanba: { fan: "Tarix", sinf: "9-A", rang: "#9C27B0" },
    payshanba: { fan: "Ingliz tili", sinf: "8-A", rang: "#2196F3" },
    juma: { fan: "Fizika", sinf: "11-B", rang: "#FF6B6B" },
  },
  {
    vaqt: "10:00 - 10:45",
    dushanba: { fan: "Biologiya", sinf: "11-A", rang: "#4CAF50" },
    seshanba: { fan: "Kimyo", sinf: "9-B", rang: "#FF9800" },
    chorshanba: { fan: "Matematika", sinf: "10-A", rang: "#7C4DFF" },
    payshanba: { fan: "Fizika", sinf: "9-A", rang: "#FF6B6B" },
    juma: { fan: "Tarix", sinf: "8-B", rang: "#9C27B0" },
  },
  {
    vaqt: "11:00 - 11:45",
    dushanba: { fan: "Kimyo", sinf: "8-B", rang: "#FF9800" },
    seshanba: { fan: "Tarix", sinf: "11-A", rang: "#9C27B0" },
    chorshanba: { fan: "Ingliz tili", sinf: "9-B", rang: "#2196F3" },
    payshanba: { fan: "Matematika", sinf: "8-A", rang: "#7C4DFF" },
    juma: { fan: "Biologiya", sinf: "10-A", rang: "#4CAF50" },
  },
  {
    vaqt: "12:00 - 12:45",
    dushanba: { fan: "Tarix", sinf: "10-B", rang: "#9C27B0" },
    seshanba: { fan: "Biologiya", sinf: "9-A", rang: "#4CAF50" },
    chorshanba: { fan: "Fizika", sinf: "8-B", rang: "#FF6B6B" },
    payshanba: { fan: "Ingliz tili", sinf: "11-A", rang: "#2196F3" },
    juma: { fan: "Kimyo", sinf: "9-A", rang: "#FF9800" },
  },
];

const kunlar = ["Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma"];
const kunKeys = ["dushanba", "seshanba", "chorshanba", "payshanba", "juma"];
const bugunIndex = new Date().getDay() - 1;

const statsData = [
  { icon: "fa-solid fa-school", label: "Sinflar", count: 12 },
  { icon: "fa-solid fa-book-open", label: "Fanlar", count: 80000 },
  { icon: "fa-solid fa-graduation-cap", label: "Talabalar", count: 246 },
  { icon: "fa-solid fa-gift", label: "Sovg'alar", count: 34 },
  { icon: "fa-solid fa-user-check", label: "O'qituvchilar", count: 18 },
];

export default function Asosiy() {
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
        .schedule-cell {
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .schedule-cell:hover {
          transform: scale(1.03);
          box-shadow: 0 4px 16px rgba(0,0,0,0.10);
          z-index: 2;
        }
      `}</style>

      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-[32px] font-semibold">Salom, creator!</h2>
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
                  width: 40,
                  height: 40,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <i className={item.icon + " text-[#7C4DFF] text-[18px]"}></i>
              </div>
              <h2 className="font-semibold text-[13px] text-[#555]">{item.label}</h2>
              <h2 className="font-bold text-[22px] text-[#222]">{item.count}</h2>
            </div>
          ))}
        </div>

        {/* Dars Jadvali */}
        <div className="bg-white rounded-2xl border border-[#e0e0e0] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#f0f0f0]">
            <div className="flex items-center gap-2">
              <div
                style={{
                  background: "rgba(124,77,255,0.12)",
                  borderRadius: 8,
                  width: 34,
                  height: 34,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <i className="fa-solid fa-calendar-days text-[#7C4DFF] text-[15px]"></i>
              </div>
              <h3 className="font-bold text-[18px] text-[#222]">Dars Jadvali</h3>
            </div>
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
          </div>

          <div className="overflow-x-auto">
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th
                    style={{
                      padding: "12px 16px",
                      textAlign: "center",
                      fontSize: 13,
                      fontWeight: 700,
                      color: "#888",
                      background: "#fafafa",
                      borderBottom: "2px solid #f0f0f0",
                      minWidth: 110,
                    }}
                  >
                    Vaqt
                  </th>
                  {kunlar.map((kun, i) => (
                    <th
                      key={i}
                      style={{
                        padding: "12px 8px",
                        textAlign: "center",
                        fontSize: 13,
                        fontWeight: 700,
                        borderBottom: "2px solid #f0f0f0",
                        background: i === bugunIndex ? "rgba(124,77,255,0.08)" : "#fafafa",
                        color: i === bugunIndex ? "#7C4DFF" : "#555",
                        minWidth: 130,
                      }}
                    >
                      <span
                        style={
                          i === bugunIndex
                            ? {
                                background: "#7C4DFF",
                                color: "#fff",
                                borderRadius: 8,
                                padding: "4px 14px",
                                display: "inline-block",
                              }
                            : {}
                        }
                      >
                        {kun}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {schedule.map((qator, rowIdx) => (
                  <tr
                    key={rowIdx}
                    style={{
                      borderBottom: rowIdx < schedule.length - 1 ? "1px solid #f3f3f3" : "none",
                    }}
                  >
                    <td
                      style={{
                        padding: "10px 16px",
                        textAlign: "center",
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#888",
                        background: "#fafafa",
                        whiteSpace: "nowrap",
                      }}
                    >
                      <i className="fa-regular fa-clock text-[#7C4DFF] mr-1 text-[11px]"></i>
                      {qator.vaqt}
                    </td>
                    {kunKeys.map((key, colIdx) => {
                      const dars = qator[key];
                      const isToday = colIdx === bugunIndex;
                      return (
                        <td
                          key={colIdx}
                          style={{
                            padding: "8px",
                            textAlign: "center",
                            background: isToday ? "rgba(124,77,255,0.04)" : "transparent",
                          }}
                        >
                          <div
                            className="schedule-cell"
                            style={{
                              background: dars.rang + "18",
                              border: `1.5px solid ${dars.rang}30`,
                              borderRadius: 10,
                              padding: "8px 6px",
                              cursor: "pointer",
                              position: "relative",
                            }}
                          >
                            <div
                              style={{
                                width: 6,
                                height: 6,
                                background: dars.rang,
                                borderRadius: "50%",
                                margin: "0 auto 4px",
                              }}
                            />
                            <p
                              style={{
                                fontWeight: 700,
                                fontSize: 12,
                                color: "#222",
                                marginBottom: 2,
                              }}
                            >
                              {dars.fan}
                            </p>
                            <span
                              style={{
                                fontSize: 11,
                                fontWeight: 600,
                                color: dars.rang,
                                background: dars.rang + "20",
                                borderRadius: 6,
                                padding: "1px 8px",
                                display: "inline-block",
                              }}
                            >
                              {dars.sinf}
                            </span>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center gap-4 px-5 py-3 border-t border-[#f0f0f0] flex-wrap">
            {[
              { rang: "#7C4DFF", fan: "Matematika" },
              { rang: "#FF6B6B", fan: "Fizika" },
              { rang: "#4CAF50", fan: "Biologiya" },
              { rang: "#FF9800", fan: "Kimyo" },
              { rang: "#2196F3", fan: "Ingliz tili" },
              { rang: "#9C27B0", fan: "Tarix" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div
                  style={{
                    width: 10,
                    height: 10,
                    background: item.rang,
                    borderRadius: "50%",
                  }}
                />
                <span style={{ fontSize: 12, fontWeight: 600, color: "#666" }}>{item.fan}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
