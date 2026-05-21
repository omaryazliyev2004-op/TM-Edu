import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchApi } from "../api/user.api";

export default function GroupDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [homework, setHomework] = useState(null);
  const [schedule, setSchedule] = useState(null);
  const [scheduleMonths, setScheduleMonths] = useState([]);
  const [activeScheduleMonth, setActiveScheduleMonth] = useState("");
  const [showAllMonths, setShowAllMonths] = useState(false);
  const [activeTab, setActiveTab] = useState("malumotlar");
  const [activeDarslikTab, setActiveDarslikTab] = useState("uyga");
  const [showMentors, setShowMentors] = useState(true);
  const [showParams, setShowParams] = useState(true);

  useEffect(() => {
    async function loadGroup() {
      try {
        const res = await fetchApi(`groups/${id}`);
        if (res.status === 200) {
          setGroup(res.data?.data || res.data);
        }
        console.log(res.data?.data, 2);
      } catch (err) {
        console.error(err);
      }
    }
    loadGroup();
  }, [id]);

  useEffect(() => {
    async function loadSchedule() {
      try {
        const res = await fetchApi(`groups/${id}/schedules`);
        if (res.status === 200) {
          const payload = res.data?.data || res.data;
          const scheduleObject = Array.isArray(payload) ? payload[0] || {} : payload || {};
          const months = Object.keys(scheduleObject).sort((a, b) => Number(a) - Number(b));
          const currentMonthName = new Date().toLocaleString("en-GB", { month: "long" });
          const currentMonthKey = months.find((key) =>
            scheduleObject[key]?.days?.some((day) => day.month === currentMonthName)
          ) || months[0] || "";

          setSchedule(scheduleObject);
          setScheduleMonths(months);
          setActiveScheduleMonth(currentMonthKey);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadSchedule();
  }, [id]);

  useEffect(() => {
    async function loadHomework() {
      try {
        const res = await fetchApi(`homework/${id}`);
        if (res.status === 200) {
          setHomework(res.data?.data || res.data);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadHomework();
  }, [id]);

  function formatDate(date) {
    if (!date) return "-";

    const d = new Date(date);

    const day = String(d.getDate()).padStart(2, "0");
    const month = d.toLocaleString("en-GB", { month: "short" });
    const year = d.getFullYear();

    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");

    return `${day} ${month}, ${year} ${hours}:${minutes}`;
  }

  const monthNameToIndex = {
    January: 1,
    February: 2,
    March: 3,
    April: 4,
    May: 5,
    June: 6,
    July: 7,
    August: 8,
    September: 9,
    October: 10,
    November: 11,
    December: 12,
  };
  const today = new Date();

  const currentSchedule = schedule?.[activeScheduleMonth] || {};
  const currentScheduleDays = Array.isArray(currentSchedule.days)
    ? currentSchedule.days
    : [];

  const sortedScheduleKeys = [...scheduleMonths].sort((a, b) => Number(a) - Number(b));
  const scheduleGroups = sortedScheduleKeys.map((key) => ({
    key,
    days: schedule?.[key]?.days || [],
  }));

  const getMonthLabel = (key) => schedule?.[key]?.days?.[0]?.month || key;
  const isPastDay = (day) => {
    if (!day?.month || !day?.day) return false;
    const monthIndex = monthNameToIndex[day.month];
    if (!monthIndex) return false;
    const date = new Date(today.getFullYear(), monthIndex - 1, Number(day.day));
    return date < new Date(today.getFullYear(), today.getMonth(), today.getDate());
  };

  function moveScheduleMonth(direction) {
    if (!scheduleMonths.length) return;
    const currentIndex = scheduleMonths.indexOf(activeScheduleMonth);
    if (currentIndex === -1) {
      setActiveScheduleMonth(scheduleMonths[0]);
      return;
    }
    const nextIndex = currentIndex + direction;
    if (nextIndex < 0 || nextIndex >= scheduleMonths.length) return;
    setActiveScheduleMonth(scheduleMonths[nextIndex]);
  }

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
          align-items: start;
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
          flex-direction: row;
          gap: 24px;
          flex-wrap: wrap;
        }
        .gd-mentor-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 4px;
        }
        .gd-mentor-img {
          width: 55px;
          height: 55px;
          border-radius: 50%;
          background: #ddd;
          object-fit: cover;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        .gd-mentor-role {
          font-size: 11px;
          color: #2ecc71;
          font-weight: 600;
          background: rgba(46, 204, 113, 0.1);
          padding: 2px 8px;
          border-radius: 4px;
          margin-top: 4px;
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
          padding-left: 8px;
          padding-right: 8px;
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
          white-space: nowrap;
        }
        .gd-date-box.active {
          background: white !important;
          border-color: #4285f4 !important;
          color: #4285f4;
          font-weight: 600;
        }
        .gd-date-box.past {
          background: #f5f5f5;
          border-color: #ddd;
          color: #999;
        }
        .gd-month-heading {
          font-size: 13px;
          font-weight: 700;
          color: #444;
          margin-bottom: 8px;
        }
        .gd-date-box span {
          font-size: 18px;
          font-weight: 700;
          color: #222;
        }
        .gd-date-box.active span {
          color: #4285f4;
        }

        /* Darsliklar Table */
        .gd-table-container {
          background: #fff;
          border: 1px solid #e0e0e0;
          border-radius: 12px;
          overflow: hidden;
          margin-bottom: 24px;
        }
        .gd-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
        }
        .gd-table thead {
          background: #f5f5f5;
          border-bottom: 1px solid #e0e0e0;
        }
        .gd-table th {
          padding: 14px 16px;
          text-align: left;
          font-weight: 600;
          color: #666;
          font-size: 12px;
        }
        .gd-table td {
          padding: 14px 16px;
          border-bottom: 1px solid #f0f0f0;
          color: #333;
        }
        .gd-table tbody tr:hover {
          background: #f9f9f9;
        }
        .gd-table tbody tr:last-child td {
          border-bottom: none;
        }
        .gd-table-index {
          color: #999;
          font-weight: 500;
        }
        .gd-table-subject {
          font-weight: 600;
          color: #222;
        }
        .gd-table-icon {
          text-align: center;
          color: #999;
        }
        .gd-table-time {
          color: #666;
        }
        .gd-table-date {
          color: #666;
        }
        .gd-tabs-buttons {
          display: flex;
          gap: 8px;
          background: #f5f5f5;
          padding: 8px;
          border-radius: 8px;
          margin-bottom: 24px;
        }
        .gd-tab-btn {
          padding: 8px 14px;
          border: none;
          background: transparent;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 500;
          color: #666;
          cursor: pointer;
        }
        .gd-tab-btn.active {
          background: #fff;
          color: #4285f4;
          font-weight: 600;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
      `}</style>

      {/* Header */}
      <div className="gd-header">
        <div className="gd-title">
          <button className="gd-back" onClick={() => navigate(-1)}>
            <i className="fa-solid fa-chevron-left"></i>
          </button>
          {group?.course?.name || "Yuklanmoqda..."}
          <span className="gd-badge">Aktiv</span>
        </div>
        <button className="gd-stat-btn">
          <i className="fa-solid fa-chart-simple"></i> Statistika
        </button>
      </div>

      {/* Tabs */}
      <div className="gd-tabs text-[#c7d9f6]">
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
                {showMentors ? (
                  <i
                    className="fa-solid fa-xmark"
                    style={{ cursor: "pointer", opacity: 0.8 }}
                    onClick={() => setShowMentors(false)}
                  ></i>
                ) : (
                  <i
                    className="fa-solid fa-plus"
                    style={{ cursor: "pointer", opacity: 0.8 }}
                    onClick={() => setShowMentors(true)}
                  ></i>
                )}
              </div>
              {showMentors && (
                <div className="gd-panel-body">
                  <div className="gd-mentor">
                    {group?.teachers?.map((teacher, index) => {
                      return (
                        <div key={index} className="gd-mentor-card">
                          <img
                            src={`https://najot-edu.softwareengineer.uz/files/${teacher?.photo}`}
                            alt="mentor"
                            className="gd-mentor-img"
                          />
                          <span className="gd-mentor-role">Teacher</span>
                          <span className="gd-mentor-name">
                            {teacher?.full_name}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Parametrlar */}
            <div className="gd-panel">
              <div className="gd-panel-header">
                Parametrlar
                {showParams ? (
                  <i
                    className="fa-solid fa-xmark"
                    style={{ cursor: "pointer", opacity: 0.8 }}
                    onClick={() => setShowParams(false)}
                  ></i>
                ) : (
                  <i
                    className="fa-solid fa-plus"
                    style={{ cursor: "pointer", opacity: 0.8 }}
                    onClick={() => setShowParams(true)}
                  ></i>
                )}
              </div>
              {showParams && (
                <div className="gd-panel-body" style={{ padding: "0 16px" }}>
                  <div className="gd-param-row">
                    <span className="gd-param-label">Kurs:</span>
                    <span className="gd-param-value">{group?.course?.name}</span>
                  </div>
                  <div className="gd-param-row">
                    <span className="gd-param-label">O'rta yosh:</span>
                    <span className="gd-param-value">{group?.averageAge}</span>
                  </div>
                  <div className="gd-param-row">
                    <span className="gd-param-label">O'quvchilar sig'imi:</span>
                    <span className="gd-param-value">{group?.room_capacity}</span>
                  </div>
                  <div className="gd-param-row">
                    <span className="gd-param-label">Mavjud o'quvchilar:</span>
                    <span className="gd-param-value">{group?.student_count}</span>
                  </div>
                  <div className="gd-param-row">
                    <span className="gd-param-label">
                      O'quv oyidagi darslar soni:
                    </span>
                    <span className="gd-param-value">20</span>
                  </div>
                  <div className="gd-param-row">
                    <span className="gd-param-label">Kurs davomiyligi (oy):</span>
                    <span className="gd-param-value">
                      {group?.course?.duration_month}
                    </span>
                  </div>
                  <div className="gd-param-row">
                    <span className="gd-param-label">Jami darslar soni:</span>
                    <span className="gd-param-value">20</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Dars jadvali */}
          <div className="gd-schedule">
            <div className="gd-schedule-title">Dars jadvali</div>

            <div className="gd-schedule-row">
              <strong>{group?.teachers?.[0]?.full_name || "Mohirbek"}</strong>
              <span>
                {Array.isArray(group?.week_day)
                  ? group.week_day.map((d) => d.slice(0, 2)).join("/")
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
              <button
                style={{
                  background: "#fff",
                  border: "1px solid #e0e0e0",
                  padding: "6px 16px",
                  borderRadius: 8,
                  fontSize: 13,
                  color: "#666",
                  cursor: "pointer",
                }}
              >
                Yana ko'rsatish (9)
              </button>
            </div>

            <div className="gd-calendar-header">
              {!showAllMonths && (
                <button className="gd-cal-nav" onClick={() => moveScheduleMonth(-1)}>
                  <i className="fa-solid fa-chevron-left"></i>
                </button>
              )}
              {showAllMonths
                ? "Barcha oyliklar"
                : `${getMonthLabel(activeScheduleMonth)} o'quv oyi`}
              {!showAllMonths && (
                <button className="gd-cal-nav" onClick={() => moveScheduleMonth(1)}>
                  <i className="fa-solid fa-chevron-right"></i>
                </button>
              )}
            </div>

            <div className="gd-dates" style={showAllMonths ? { flexDirection: "column", gap: 12 } : {}}>
              {showAllMonths ? (
                scheduleGroups.length > 0 ? (
                  scheduleGroups.map((group) => (
                    <div key={group.key} style={{ width: "100%" }}>
                      <div className="gd-month-heading">{getMonthLabel(group.key)}</div>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {group.days.map((d, i) => {
                          const isPast = isPastDay(d);
                          return (
                            <div
                              key={`${group.key}-${i}`}
                              className={`gd-date-box ${d.isCompleted ? "active" : ""} ${isPast ? "past" : ""}`}
                            >
                              {d.month}
                              <span>{d.day}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="gd-date-box active" style={{ minWidth: 120 }}>
                    <span>Malumot yo'q</span>
                  </div>
                )
              ) : currentScheduleDays.length > 0 ? (
                currentScheduleDays.map((d, i) => {
                  const isPast = isPastDay(d);
                  return (
                    <div
                      key={`${activeScheduleMonth}-${i}`}
                      className={`gd-date-box ${d.isCompleted ? "active" : ""} ${isPast ? "past" : ""}`}
                    >
                      {d.month}
                      <span>{d.day}</span>
                    </div>
                  );
                })
              ) : (
                <div className="gd-date-box active" style={{ minWidth: 120 }}>
                  <span>Malumot yo'q</span>
                </div>
              )}
            </div>

            <div style={{ textAlign: "center", marginTop: 24 }}>
              <button
                style={{
                  background: "#f5f5f5",
                  border: "none",
                  padding: "8px 20px",
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#444",
                  cursor: "pointer",
                }}
                onClick={() => setShowAllMonths((prev) => !prev)}
              >
                {showAllMonths ? "Yopish" : "Barchasini ko'rish"}
              </button>
            </div>
          </div>
        </>
      )}

      {activeTab === "darsliklar" && (
        <>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "24px",
            }}
          >
            <h3
              style={{
                fontSize: "16px",
                fontWeight: 700,
                color: "#222",
                margin: 0,
              }}
            >
              Guruh darsliklari
            </h3>
            <button
              onClick={() => navigate(`/dashboard/groups/${id}/homework/create`)}
              style={{
                background: "#1abc9c",
                border: "none",
                color: "#fff",
                padding: "8px 20px",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Qo'shish
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="gd-tabs-buttons">
            <button
              className={`gd-tab-btn ${activeDarslikTab === "uyga" ? "active" : ""}`}
              onClick={() => setActiveDarslikTab("uyga")}
            >
              Uyg'a vazifa
            </button>
            <button
              className={`gd-tab-btn ${activeDarslikTab === "video" ? "active" : ""}`}
              onClick={() => setActiveDarslikTab("video")}
            >
              Videolar
            </button>
            <button
              className={`gd-tab-btn ${activeDarslikTab === "imtihon" ? "active" : ""}`}
              onClick={() => setActiveDarslikTab("imtihon")}
            >
              Imtihonlar
            </button>
            <button
              className={`gd-tab-btn ${activeDarslikTab === "jurnal" ? "active" : ""}`}
              onClick={() => setActiveDarslikTab("jurnal")}
            >
              Jurnal
            </button>
          </div>

          {/* Uyg'a vazifa Table */}
          {activeDarslikTab === "uyga" && (
            <div className="gd-table-container">
              <table className="gd-table">
                <thead>
                  <tr>
                    <th style={{ width: "5%" }}>#</th>
                    <th style={{ width: "25%" }}>Mavzu</th>
                    <th style={{ width: "8%", textAlign: "center" }}>
                      <i className="fa-solid fa-user"></i>
                    </th>
                    <th style={{ width: "8%", textAlign: "center" }}>
                      <i className="fa-solid fa-clock"></i>
                    </th>
                    <th style={{ width: "8%", textAlign: "center" }}>
                      <i className="fa-solid fa-check"></i>
                    </th>
                    <th style={{ width: "15%" }}>Berilan vaqt</th>
                    <th style={{ width: "15%" }}>Tugash vaqti</th>
                    <th style={{ width: "12%" }}>Dars sanasi</th>
                    <th style={{ width: "4%", textAlign: "center" }}></th>
                  </tr>
                </thead>
                <tbody>
                  {homework.map((hw) => {
                    return (
                      <tr key={hw.id}>
                        <td className="gd-table-index">{hw.id}</td>
                        <td className="gd-table-subject">{hw.topic}</td>
                        <td style={{ textAlign: "center", color: "#666" }}>
                          {hw.existStudentsIngroup}
                        </td>
                        <td style={{ textAlign: "center", color: "#666" }}>
                          {hw.homeworkPending}
                        </td>
                        <td style={{ textAlign: "center", color: "#666" }}>
                          {hw.homeworkAccept}
                        </td>
                        <td className="gd-table-time">
                          {formatDate(hw.homework?.[0]?.created_at)}
                        </td>
                        <td className="gd-table-time">
                          {formatDate(
                            hw.homework?.[0]?.created_at
                              ? new Date(
                                  new Date(
                                    hw.homework[0].created_at,
                                  ).getTime() +
                                    20 * 60 * 60 * 1000,
                                )
                              : null,
                          )}
                        </td>
                        <td className="gd-table-date">
                          {formatDate(hw.created_at)}
                        </td>
                        <td
                          style={{
                            textAlign: "center",
                            color: "#999",
                            cursor: "pointer",
                          }}
                        >
                          <i className="fa-solid fa-ellipsis-vertical"></i>
                        </td>
                      </tr>
                    );
                  })}
                  {homework.data?.data?.length === 0 && (
                    <tr>
                      <td
                        colSpan="9"
                        style={{ textAlign: "center", color: "#999" }}
                      >
                        Ma'lumot yo'q
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Videolar Table */}
          {activeDarslikTab === "video" && (
            <div className="gd-table-container">
              <table className="gd-table">
                <thead>
                  <tr>
                    <th style={{ width: "5%" }}>#</th>
                    <th style={{ width: "25%" }}>Mavzu</th>
                    <th style={{ width: "8%", textAlign: "center" }}>
                      <i className="fa-solid fa-user"></i>
                    </th>
                    <th style={{ width: "8%", textAlign: "center" }}>
                      <i className="fa-solid fa-clock"></i>
                    </th>
                    <th style={{ width: "8%", textAlign: "center" }}>
                      <i className="fa-solid fa-check"></i>
                    </th>
                    <th style={{ width: "15%" }}>Berilan vaqt</th>
                    <th style={{ width: "15%" }}>Tugash vaqti</th>
                    <th style={{ width: "12%" }}>Dars sanasi</th>
                    <th style={{ width: "4%", textAlign: "center" }}></th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="gd-table-index">1</td>
                    <td className="gd-table-subject">CSS Asoslari - Qism 1</td>
                    <td style={{ textAlign: "center", color: "#666" }}>4</td>
                    <td style={{ textAlign: "center", color: "#666" }}>2</td>
                    <td style={{ textAlign: "center", color: "#666" }}>1</td>
                    <td className="gd-table-time">10 May, 2026 08:00</td>
                    <td className="gd-table-time">10 May, 2026 09:30</td>
                    <td className="gd-table-date">10 May, 2026</td>
                    <td
                      style={{
                        textAlign: "center",
                        color: "#999",
                        cursor: "pointer",
                      }}
                    >
                      <i className="fa-solid fa-ellipsis-vertical"></i>
                    </td>
                  </tr>
                  <tr>
                    <td className="gd-table-index">2</td>
                    <td className="gd-table-subject">JavaScript Basics</td>
                    <td style={{ textAlign: "center", color: "#666" }}>5</td>
                    <td style={{ textAlign: "center", color: "#666" }}>1</td>
                    <td style={{ textAlign: "center", color: "#666" }}>2</td>
                    <td className="gd-table-time">12 May, 2026 09:00</td>
                    <td className="gd-table-time">12 May, 2026 10:30</td>
                    <td className="gd-table-date">12 May, 2026</td>
                    <td
                      style={{
                        textAlign: "center",
                        color: "#999",
                        cursor: "pointer",
                      }}
                    >
                      <i className="fa-solid fa-ellipsis-vertical"></i>
                    </td>
                  </tr>
                  <tr>
                    <td className="gd-table-index">3</td>
                    <td className="gd-table-subject">React Kirishi</td>
                    <td style={{ textAlign: "center", color: "#666" }}>3</td>
                    <td style={{ textAlign: "center", color: "#666" }}>0</td>
                    <td style={{ textAlign: "center", color: "#666" }}>1</td>
                    <td className="gd-table-time">18 May, 2026 10:00</td>
                    <td className="gd-table-time">18 May, 2026 11:30</td>
                    <td className="gd-table-date">18 May, 2026</td>
                    <td
                      style={{
                        textAlign: "center",
                        color: "#999",
                        cursor: "pointer",
                      }}
                    >
                      <i className="fa-solid fa-ellipsis-vertical"></i>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* Imtihonlar Table */}
          {activeDarslikTab === "imtihon" && (
            <div className="gd-table-container">
              <table className="gd-table">
                <thead>
                  <tr>
                    <th style={{ width: "5%" }}>#</th>
                    <th style={{ width: "25%" }}>Mavzu</th>
                    <th style={{ width: "8%", textAlign: "center" }}>
                      <i className="fa-solid fa-user"></i>
                    </th>
                    <th style={{ width: "8%", textAlign: "center" }}>
                      <i className="fa-solid fa-clock"></i>
                    </th>
                    <th style={{ width: "8%", textAlign: "center" }}>
                      <i className="fa-solid fa-check"></i>
                    </th>
                    <th style={{ width: "15%" }}>Berilan vaqt</th>
                    <th style={{ width: "15%" }}>Tugash vaqti</th>
                    <th style={{ width: "12%" }}>Dars sanasi</th>
                    <th style={{ width: "4%", textAlign: "center" }}></th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="gd-table-index">1</td>
                    <td className="gd-table-subject">1-modul imtihoni</td>
                    <td style={{ textAlign: "center", color: "#666" }}>5</td>
                    <td style={{ textAlign: "center", color: "#666" }}>0</td>
                    <td style={{ textAlign: "center", color: "#666" }}>5</td>
                    <td className="gd-table-time">8 May, 2026 10:00</td>
                    <td className="gd-table-time">8 May, 2026 12:00</td>
                    <td className="gd-table-date">8 May, 2026</td>
                    <td
                      style={{
                        textAlign: "center",
                        color: "#999",
                        cursor: "pointer",
                      }}
                    >
                      <i className="fa-solid fa-ellipsis-vertical"></i>
                    </td>
                  </tr>
                  <tr>
                    <td className="gd-table-index">2</td>
                    <td className="gd-table-subject">2-modul imtihoni</td>
                    <td style={{ textAlign: "center", color: "#666" }}>4</td>
                    <td style={{ textAlign: "center", color: "#666" }}>1</td>
                    <td style={{ textAlign: "center", color: "#666" }}>3</td>
                    <td className="gd-table-time">25 May, 2026 10:00</td>
                    <td className="gd-table-time">25 May, 2026 12:00</td>
                    <td className="gd-table-date">25 May, 2026</td>
                    <td
                      style={{
                        textAlign: "center",
                        color: "#999",
                        cursor: "pointer",
                      }}
                    >
                      <i className="fa-solid fa-ellipsis-vertical"></i>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* Jurnal Table */}
          {activeDarslikTab === "jurnal" && (
            <div className="gd-table-container">
              <table className="gd-table">
                <thead>
                  <tr>
                    <th style={{ width: "5%" }}>#</th>
                    <th style={{ width: "30%" }}>Mavzu</th>
                    <th style={{ width: "8%", textAlign: "center" }}>
                      <i className="fa-solid fa-user"></i>
                    </th>
                    <th style={{ width: "8%", textAlign: "center" }}>
                      <i className="fa-solid fa-clock"></i>
                    </th>
                    <th style={{ width: "8%", textAlign: "center" }}>
                      <i className="fa-solid fa-check"></i>
                    </th>
                    <th style={{ width: "15%" }}>Berilan vaqt</th>
                    <th style={{ width: "15%" }}>Tugash vaqti</th>
                    <th style={{ width: "11%" }}>Dars sanasi</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="gd-table-index">1</td>
                    <td className="gd-table-subject">Dars 1 - Davomat</td>
                    <td style={{ textAlign: "center", color: "#666" }}>5</td>
                    <td style={{ textAlign: "center", color: "#666" }}>0</td>
                    <td style={{ textAlign: "center", color: "#666" }}>5</td>
                    <td className="gd-table-time">09:00</td>
                    <td className="gd-table-time">10:30</td>
                    <td className="gd-table-date">5 May, 2026</td>
                    <td
                      style={{
                        textAlign: "center",
                        color: "#999",
                        cursor: "pointer",
                      }}
                    >
                      <i className="fa-solid fa-ellipsis-vertical"></i>
                    </td>
                  </tr>
                  <tr>
                    <td className="gd-table-index">2</td>
                    <td className="gd-table-subject">Dars 2 - Davomat</td>
                    <td style={{ textAlign: "center", color: "#666" }}>5</td>
                    <td style={{ textAlign: "center", color: "#666" }}>0</td>
                    <td style={{ textAlign: "center", color: "#666" }}>4</td>
                    <td className="gd-table-time">10:45</td>
                    <td className="gd-table-time">12:15</td>
                    <td className="gd-table-date">7 May, 2026</td>
                    <td
                      style={{
                        textAlign: "center",
                        color: "#999",
                        cursor: "pointer",
                      }}
                    >
                      <i className="fa-solid fa-ellipsis-vertical"></i>
                    </td>
                  </tr>
                  <tr>
                    <td className="gd-table-index">3</td>
                    <td className="gd-table-subject">Dars 3 - Davomat</td>
                    <td style={{ textAlign: "center", color: "#666" }}>4</td>
                    <td style={{ textAlign: "center", color: "#666" }}>1</td>
                    <td style={{ textAlign: "center", color: "#666" }}>3</td>
                    <td className="gd-table-time">09:00</td>
                    <td className="gd-table-time">10:30</td>
                    <td className="gd-table-date">12 May, 2026</td>
                    <td
                      style={{
                        textAlign: "center",
                        color: "#999",
                        cursor: "pointer",
                      }}
                    >
                      <i className="fa-solid fa-ellipsis-vertical"></i>
                    </td>
                  </tr>
                  <tr>
                    <td className="gd-table-index">4</td>
                    <td className="gd-table-subject">Dars 4 - Davomat</td>
                    <td style={{ textAlign: "center", color: "#666" }}>5</td>
                    <td style={{ textAlign: "center", color: "#666" }}>0</td>
                    <td style={{ textAlign: "center", color: "#666" }}>5</td>
                    <td className="gd-table-time">10:45</td>
                    <td className="gd-table-time">12:15</td>
                    <td className="gd-table-date">14 May, 2026</td>
                    <td
                      style={{
                        textAlign: "center",
                        color: "#999",
                        cursor: "pointer",
                      }}
                    >
                      <i className="fa-solid fa-ellipsis-vertical"></i>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {activeTab === "davomat" && (
        <>
          <div className="gd-table-container">
            <table className="gd-table">
              <thead>
                <tr>
                  <th style={{ width: "5%" }}>#</th>
                  <th style={{ width: "25%" }}>Dars mavzusi</th>
                  <th style={{ width: "8%", textAlign: "center" }}>
                    <i className="fa-solid fa-user"></i>
                  </th>
                  <th style={{ width: "8%", textAlign: "center" }}>
                    <i className="fa-solid fa-clock"></i>
                  </th>
                  <th style={{ width: "8%", textAlign: "center" }}>
                    <i className="fa-solid fa-check"></i>
                  </th>
                  <th style={{ width: "15%" }}>Dars vaqti</th>
                  <th style={{ width: "15%" }}>Tugash vaqti</th>
                  <th style={{ width: "12%" }}>Dars sanasi</th>
                  <th style={{ width: "4%", textAlign: "center" }}></th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="gd-table-index">1</td>
                  <td className="gd-table-subject">1-dars: Kirish</td>
                  <td style={{ textAlign: "center", color: "#666" }}>5</td>
                  <td style={{ textAlign: "center", color: "#666" }}>0</td>
                  <td style={{ textAlign: "center", color: "#666" }}>5</td>
                  <td className="gd-table-time">09:00</td>
                  <td className="gd-table-time">10:30</td>
                  <td className="gd-table-date">5 May, 2026</td>
                  <td
                    style={{
                      textAlign: "center",
                      color: "#999",
                      cursor: "pointer",
                    }}
                  >
                    <i className="fa-solid fa-ellipsis-vertical"></i>
                  </td>
                </tr>
                <tr>
                  <td className="gd-table-index">2</td>
                  <td className="gd-table-subject">2-dars: Asoslar</td>
                  <td style={{ textAlign: "center", color: "#666" }}>5</td>
                  <td style={{ textAlign: "center", color: "#666" }}>0</td>
                  <td style={{ textAlign: "center", color: "#666" }}>4</td>
                  <td className="gd-table-time">10:45</td>
                  <td className="gd-table-time">12:15</td>
                  <td className="gd-table-date">7 May, 2026</td>
                  <td
                    style={{
                      textAlign: "center",
                      color: "#999",
                      cursor: "pointer",
                    }}
                  >
                    <i className="fa-solid fa-ellipsis-vertical"></i>
                  </td>
                </tr>
                <tr>
                  <td className="gd-table-index">3</td>
                  <td className="gd-table-subject">3-dars: Amaliyot</td>
                  <td style={{ textAlign: "center", color: "#666" }}>4</td>
                  <td style={{ textAlign: "center", color: "#666" }}>1</td>
                  <td style={{ textAlign: "center", color: "#666" }}>3</td>
                  <td className="gd-table-time">09:00</td>
                  <td className="gd-table-time">10:30</td>
                  <td className="gd-table-date">12 May, 2026</td>
                  <td
                    style={{
                      textAlign: "center",
                      color: "#999",
                      cursor: "pointer",
                    }}
                  >
                    <i className="fa-solid fa-ellipsis-vertical"></i>
                  </td>
                </tr>
                <tr>
                  <td className="gd-table-index">4</td>
                  <td className="gd-table-subject">4-dars: Takrorlash</td>
                  <td style={{ textAlign: "center", color: "#666" }}>5</td>
                  <td style={{ textAlign: "center", color: "#666" }}>0</td>
                  <td style={{ textAlign: "center", color: "#666" }}>5</td>
                  <td className="gd-table-time">10:45</td>
                  <td className="gd-table-time">12:15</td>
                  <td className="gd-table-date">14 May, 2026</td>
                  <td
                    style={{
                      textAlign: "center",
                      color: "#999",
                      cursor: "pointer",
                    }}
                  >
                    <i className="fa-solid fa-ellipsis-vertical"></i>
                  </td>
                </tr>
                <tr>
                  <td className="gd-table-index">5</td>
                  <td className="gd-table-subject">5-dars: Imtihon</td>
                  <td style={{ textAlign: "center", color: "#666" }}>5</td>
                  <td style={{ textAlign: "center", color: "#666" }}>0</td>
                  <td style={{ textAlign: "center", color: "#666" }}>5</td>
                  <td className="gd-table-time">09:00</td>
                  <td className="gd-table-time">10:30</td>
                  <td className="gd-table-date">19 May, 2026</td>
                  <td
                    style={{
                      textAlign: "center",
                      color: "#999",
                      cursor: "pointer",
                    }}
                  >
                    <i className="fa-solid fa-ellipsis-vertical"></i>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
