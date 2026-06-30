import { useState, useEffect } from "react";
import { useAppContext } from "../context/AppContext";
import { useLang } from "../i18n/LanguageContext";

export default function Asosiy() {
  const { t } = useLang();
  const { stats, fetchStats } = useAppContext();

  useEffect(() => {
    fetchStats();
  }, []);

  const [openAcc, setOpenAcc] = useState(null);

  const toggleAcc = (idx) => {
    setOpenAcc((prev) => (prev === idx ? null : idx));
  };

  const statsData = [
    { icon: "fa-solid fa-graduation-cap", label: t("Faol talabalar"), count: stats?.talabalar || 0 },
    { icon: "fa-solid fa-users", label: t("Guruhlar"), count: stats?.guruhlar || 0 },
    { icon: "fa-solid fa-credit-card", label: t("Joriy oy to'lovlar"), count: 0 },
    { icon: "fa-solid fa-triangle-exclamation", label: t("Qarzdorlar"), count: 104 },
    { icon: "fa-solid fa-snowflake", label: t("Muzlatilganlar"), count: 0 },
    { icon: "fa-solid fa-box-archive", label: t("Arxivdagilar"), count: 23 },
  ];

  const accordions = [
    { id: 1, title: t("Joriy oy uchun to'lovlar") },
    { id: 2, title: t("Yillik Foyda") },
    { id: 3, title: t("Dars jadvali") },
  ];

  return (
    <>
      <style>{`
        .stat-card {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          border-radius: 16px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
        .stat-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 24px rgba(124,58,237,0.12);
        }
        .acc-item {
          background: #fff;
          border: none;
          border-radius: 16px;
          margin-bottom: 12px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
        .acc-header {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 18px 24px;
          background: none;
          border: none;
          cursor: pointer;
          font-weight: 700;
          font-size: 15px;
          color: #222;
        }
        .acc-body {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.35s cubic-bezier(0.4,0,0.2,1);
          background: #fafafa;
        }
        .acc-body.open {
          max-height: 300px;
          border-top: 1px solid #e2e8f0;
        }
        .acc-chevron {
          transition: transform 0.3s ease;
          color: #888;
        }
        .acc-chevron.open {
          transform: rotate(180deg);
        }
      `}</style>

      <div className="flex flex-col gap-6 pt-2">
        {/* Stat cards grid */}
        <div className="grid grid-cols-6 gap-4">
          {statsData.map((item, idx) => (
            <div
              key={idx}
              className="stat-card bg-white flex justify-center items-center flex-col gap-2 cursor-pointer py-6"
            >
              <i className={item.icon + " text-[#7c3aed] text-[22px]"}></i>
              <h2 className="font-medium text-[12px] text-[#64748b]">{item.label}</h2>
              <h2 className="font-bold text-[24px] text-[#1e293b]">{item.count}</h2>
            </div>
          ))}
        </div>

        {/* Accordions */}
        <div className="flex flex-col mt-2">
          {accordions.map((acc) => (
            <div key={acc.id} className="acc-item">
              <button className="acc-header" onClick={() => toggleAcc(acc.id)}>
                <span>{acc.title}</span>
                <i className={`fa-solid fa-chevron-down acc-chevron ${openAcc === acc.id ? "open" : ""}`}></i>
              </button>
              <div className={`acc-body ${openAcc === acc.id ? "open" : ""}`}>
                <div style={{ padding: "24px", color: "#888", fontSize: 14, textAlign: "center" }}>
                  {t("Ma'lumot mavjud emas")}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
