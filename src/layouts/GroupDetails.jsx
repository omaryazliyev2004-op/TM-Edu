import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchApi } from "../api/user.api";

export default function GroupDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [activeTab, setActiveTab] = useState("malumotlar");

  useEffect(() => {
    async function loadGroup() {
      try {
        const res = await fetchApi(`groups/${id}`);
        if (res.status === 200) {
          setGroup(res.data?.data || res.data);
        }
        console.log(res.data?.data);
        
      } catch (err) {
        console.error(err);
      }
    }
    loadGroup();
  }, [id]);

  return (
    <div style={{ padding: "0 10px", width: "100%", boxSizing: "border-box" }}>
      <style>{`
        .gd-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
        }
        .gd-back {
          background: none;
          border: none;
          font-size: 18px;
          cursor: pointer;
          color: #444;
          margin-right: 12px;
          display: flex;
          align-items: center;
        }
        .gd-title {
          font-size: 22px;
          font-weight: 700;
          color: #222;
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 0;
        }
        .gd-badge {
          font-size: 11px;
          font-weight: 600;
          padding: 4px 10px;
          border-radius: 6px;
          background: rgba(46, 204, 113, 0.15);
          color: #2ecc71;
        }
        .gd-stat-btn {
          border: 1px solid #e0e0e0;
          background: #fff;
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          color: #444;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .gd-tabs {
          display: flex;
          gap: 24px;
          border-bottom: 1px solid #e0e0e0;
          margin-bottom: 24px;
        }
        .gd-tab {
          padding: 10px 0;
          border: none;
          background: none;
          font-size: 14px;
          font-weight: 600;
          color: #888;
          cursor: pointer;
          position: relative;
        }
        .gd-tab.active {
          color: #765bcf;
        }
        .gd-tab.active::after {
          content: "";
          position: absolute;
          bottom: -1px;
          left: 0;
          width: 100%;
          height: 2px;
          background: #765bcf;
        }

        .gd-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 24px;
        }
        .gd-panel {
          border: 1px solid #e0e0e0;
          border-radius: 12px;
          background: #fff;
          overflow: hidden;
        }
        .gd-panel-header {
          background: #4285f4;
          color: #fff;
          padding: 12px 16px;
          font-size: 14px;
          font-weight: 600;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .gd-panel-body {
          padding: 16px;
        }

        /* Mentor List */
        .gd-mentor {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          width: fit-content;
        }
        .gd-mentor-img {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: #ddd;
          margin-bottom: 8px;
          object-fit: cover;
        }
        .gd-mentor-role {
          font-size: 11px;
          color: #2ecc71;
          font-weight: 600;
        }
        .gd-mentor-name {
          font-size: 13px;
          font-weight: 600;
          color: #222;
        }

        /* Params Table */
        .gd-param-row {
          display: flex;
          justify-content: space-between;
          padding: 12px 0;
          border-bottom: 1px solid #f5f5f5;
          font-size: 13px;
        }
        .gd-param-row:last-child {
          border-bottom: none;
        }
        .gd-param-label {
          color: #666;
        }
        .gd-param-value {
          font-weight: 600;
          color: #222;
        }

        /* Schedule Section */
        .gd-schedule {
          border: 1px solid #e0e0e0;
          border-radius: 12px;
          background: #fff;
          padding: 20px;
          margin-bottom: 24px;
        }
        .gd-schedule-title {
          font-size: 16px;
          font-weight: 700;
          color: #222;
          margin-bottom: 16px;
        }
        .gd-schedule-row {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 13px;
          margin-bottom: 8px;
          color: #555;
        }
        .gd-schedule-row strong {
          color: #4285f4;
          font-weight: 600;
          min-width: 150px;
        }

        /* Calendar Bottom */
        .gd-calendar-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin: 24px 0 16px;
          font-size: 14px;
          font-weight: 600;
        }
        .gd-cal-nav {
          width: 32px;
          height: 32px;
          border: 1px solid #e0e0e0;
          background: #fff;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #666;
        }
        .gd-dates {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding-bottom: 10px;
        }
        .gd-date-box {
          min-width: 50px;
          height: 60px;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: #fff;
          font-size: 12px;
          color: #666;
          cursor: pointer;
        }
        .gd-date-box.active {
          background: #e8f0fe;
          border-color: #d2e3fc;
          color: #4285f4;
          font-weight: 600;
        }
        .gd-date-box span {
          font-size: 18px;
          font-weight: 700;
          color: #222;
        }
        .gd-date-box.active span {
          color: #4285f4;
        }
      `}</style>

      {/* Header */}
      <div className="gd-header">
        <div className="gd-title">
          <button className="gd-back" onClick={() => navigate(-1)}>
            <i className="fa-solid fa-chevron-left"></i>
          </button>
          {group?.course?.name  || "Yuklanmoqda..."}
          <span className="gd-badge">Aktiv</span>
        </div>
        <button className="gd-stat-btn">
          <i className="fa-solid fa-chart-simple"></i> Statistika
        </button>
      </div>

      {/* Tabs */}
      <div className="gd-tabs">
        <button
          className={`gd-tab ${activeTab === "malumotlar" ? "active" : ""}`}
          onClick={() => setActiveTab("malumotlar")}
        >
          Ma'lumotlar
        </button>
        <button
          className={`gd-tab ${activeTab === "darsliklar" ? "active" : ""}`}
          onClick={() => setActiveTab("darsliklar")}
        >
          Guruh darsliklari
        </button>
        <button
          className={`gd-tab ${activeTab === "davomat" ? "active" : ""}`}
          onClick={() => setActiveTab("davomat")}
        >
          Akademik davomati
        </button>
      </div>

      {activeTab === "malumotlar" && (
        <>
          {/* Grid Panels */}
          <div className="gd-grid">
            {/* Mentorlar */}
            <div className="gd-panel">
              <div className="gd-panel-header">
                Guruh mentorlari
                <i className="fa-solid fa-xmark" style={{ cursor: "pointer", opacity: 0.8 }}></i>
              </div>
              <div className="gd-panel-body">
                <div className="gd-mentor">
                  <img src={`https://najot-edu.softwareengineer.uz/files/${group?.teachers?.[0]?.photo}`} alt="mentor" className="gd-mentor-img" />
                  <span className="gd-mentor-role">Teacher</span>
                  <span className="gd-mentor-name">
                    {group?.teachers?.[0]?.full_name || group?.oqituvchi || "Mohirbek"}
                  </span>
                </div>
              </div>
            </div>

            {/* Parametrlar */}
            <div className="gd-panel">
              <div className="gd-panel-header">
                Parametrlar
                <i className="fa-solid fa-xmark" style={{ cursor: "pointer", opacity: 0.8 }}></i>
              </div>
              <div className="gd-panel-body" style={{ padding: "0 16px" }}>
                <div className="gd-param-row">
                  <span className="gd-param-label">Kurs:</span>
                  <span className="gd-param-value">{group?.course?.name || "Backend"}</span>
                </div>
                <div className="gd-param-row">
                  <span className="gd-param-label">O'rta yosh:</span>
                  <span className="gd-param-value">{group?.averageAge}</span>
                </div>
                <div className="gd-param-row">
                  <span className="gd-param-label">O'quvchilar sig'imi:</span>
                  <span className="gd-param-value">{group?.max_student || 20}</span>
                </div>
                <div className="gd-param-row">
                  <span className="gd-param-label">Mavjud o'quvchilar:</span>
                  <span className="gd-param-value">{group?.students?.length || 4}</span>
                </div>
                <div className="gd-param-row">
                  <span className="gd-param-label">O'quv oyidagi darslar soni:</span>
                  <span className="gd-param-value">20</span>
                </div>
                <div className="gd-param-row">
                  <span className="gd-param-label">Kurs davomiyligi (oy):</span>
                  <span className="gd-param-value">6.0</span>
                </div>
                <div className="gd-param-row">
                  <span className="gd-param-label">Jami darslar soni:</span>
                  <span className="gd-param-value">20</span>
                </div>
              </div>
            </div>
          </div>

          {/* Dars jadvali */}
          <div className="gd-schedule">
            <div className="gd-schedule-title">Dars jadvali</div>
            
            <div className="gd-schedule-row">
              <strong>{group?.teachers?.[0]?.full_name || "Mohirbek"}</strong>
              <span>
                {Array.isArray(group?.week_day) 
                  ? group.week_day.map(d => d.slice(0, 2)).join("/") 
                  : "Du/Se/Ch/Pa/Ju"}
              </span>
              <span>{group?.start_time || "09:30"} dan - 12:30 gacha</span>
              <span>15 Yan, 2026 - 27 Iyun, 2026</span>
              <span>{group?.room?.name || "F2 Autodesk"} // 18</span>
            </div>
            
            <div className="gd-schedule-row" style={{ opacity: 0.7 }}>
              <strong>+++Yusupova Barchinoy</strong>
              <span>Du/Se/Ch/Pa/Ju</span>
              <span>08:00 dan - 09:30 gacha</span>
              <span>15 Yan, 2026 - 27 Iyun, 2026</span>
              <span>F2 Autodesk // 18</span>
            </div>

            <div style={{ textAlign: "center", marginTop: 16 }}>
              <button style={{ background: "#fff", border: "1px solid #e0e0e0", padding: "6px 16px", borderRadius: 8, fontSize: 13, color: "#666", cursor: "pointer" }}>
                Yana ko'rsatish (9)
              </button>
            </div>

            <div className="gd-calendar-header">
              <button className="gd-cal-nav"><i className="fa-solid fa-chevron-left"></i></button>
              1-o'quv oyi
              <button className="gd-cal-nav"><i className="fa-solid fa-chevron-right"></i></button>
            </div>

            <div className="gd-dates">
              {[2,5,7,9,12,14,16,19,21,23,26,28,30].map((d, i) => (
                <div key={i} className={`gd-date-box ${d === 14 ? "active" : ""}`}>
                  May <span>{d}</span>
                </div>
              ))}
            </div>

            <div style={{ textAlign: "center", marginTop: 24 }}>
              <button style={{ background: "#f5f5f5", border: "none", padding: "8px 20px", borderRadius: 8, fontSize: 13, fontWeight: 600, color: "#444", cursor: "pointer" }}>
                Barchasini ko'rish
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
