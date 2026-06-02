import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchApi } from "../api/user.api";

export default function ExamDetails() {
  const navigate = useNavigate();
  const { groupId, examId } = useParams();

  const [exam, setExam] = useState({
    title: "Examination",
    topic: "React JS asoslari va React Router bilan ishlash",
    startTime: "24 Apr, 2026 09:25",
    endTime: "24 Apr, 2026 13:00"
  });

  const [activeTab, setActiveTab] = useState("accepted");
  const [editingStudent, setEditingStudent] = useState(null);
  const [editScore, setEditScore] = useState("");

  // Student submission lists
  const [acceptedStudents, setAcceptedStudents] = useState([
    {
      id: 1,
      name: "Dilshodbek O'ktamjon o'g'li Tokhirov",
      submittedTime: "24 Apr, 2026 12:56",
      checkedTime: "27 Apr, 2026 10:30",
      score: 65
    },
    {
      id: 2,
      name: "Rahmonbergan Otabek o'g'li Mahmudov",
      submittedTime: "24 Apr, 2026 10:42",
      checkedTime: "24 Apr, 2026 11:32",
      score: 85
    },
    {
      id: 3,
      name: "Mirsaid Abduqulov",
      submittedTime: "24 Apr, 2026 11:59",
      checkedTime: "24 Apr, 2026 14:50",
      score: 70
    },
    {
      id: 4,
      name: "Oydin Kamolovna Qalandarova",
      submittedTime: "24 Apr, 2026 09:27",
      checkedTime: "29 Apr, 2026 12:17",
      score: 100
    },
    {
      id: 5,
      name: "Guliza Ayitqulova",
      submittedTime: "24 Apr, 2026 12:41",
      checkedTime: "24 Apr, 2026 14:40",
      score: 70
    },
    {
      id: 6,
      name: "Nozima Abdugapparova",
      submittedTime: "24 Apr, 2026 09:27",
      checkedTime: "24 Apr, 2026 09:47",
      score: 85
    }
  ]);

  const [waitingStudents, setWaitingStudents] = useState([
    {
      id: 11,
      name: "Sardorbek Rahimov",
      submittedTime: "24 Apr, 2026 13:02",
      checkedTime: "-",
      score: "-"
    }
  ]);

  const [returnedStudents, setReturnedStudents] = useState([]);

  const [notSubmittedStudents, setNotSubmittedStudents] = useState([
    {
      id: 21,
      name: "Shaxzod Alimov",
      submittedTime: "-",
      checkedTime: "-",
      score: "-"
    },
    {
      id: 22,
      name: "Jasur Nematov",
      submittedTime: "-",
      checkedTime: "-",
      score: "-"
    }
  ]);

  // Try to load exam info from API
  useEffect(() => {
    async function getExamDetails() {
      try {
        const res = await fetchApi(`exams/group/${groupId}`);
        if (res.status === 200) {
          const list = res.data?.data || res.data || [];
          const currentExam = list.find((x) => String(x.id) === String(examId));
          if (currentExam) {
            const deadlineDate = currentExam.deadline ? new Date(currentExam.deadline) : null;
            const createdDate = currentExam.created_at ? new Date(currentExam.created_at) : null;
            
            const formatTime = (d) => {
              if (!d) return "-";
              return d.toLocaleString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
              });
            };

            setExam({
              title: currentExam.title || "Examination",
              topic: currentExam.lesson?.topic || currentExam.description || "React JS asoslari va React Router bilan ishlash",
              startTime: formatTime(createdDate),
              endTime: formatTime(deadlineDate)
            });
          }
        }
      } catch (err) {
        console.error("Error loading exam info from API:", err);
      }
    }
    if (groupId && examId) {
      getExamDetails();
    }
  }, [groupId, examId]);

  const handleEditScore = (student) => {
    setEditingStudent(student);
    setEditScore(student.score === "-" ? "" : student.score);
  };

  const handleSaveScore = () => {
    if (editingStudent) {
      const val = editScore === "" ? "-" : Number(editScore);
      
      if (activeTab === "accepted") {
        setAcceptedStudents(prev =>
          prev.map(s => s.id === editingStudent.id ? { ...s, score: val } : s)
        );
      } else if (activeTab === "waiting") {
        setWaitingStudents(prev =>
          prev.map(s => s.id === editingStudent.id ? { ...s, score: val } : s)
        );
      } else if (activeTab === "returned") {
        setReturnedStudents(prev =>
          prev.map(s => s.id === editingStudent.id ? { ...s, score: val } : s)
        );
      } else if (activeTab === "notSubmitted") {
        setNotSubmittedStudents(prev =>
          prev.map(s => s.id === editingStudent.id ? { ...s, score: val } : s)
        );
      }
      setEditingStudent(null);
    }
  };

  const getActiveList = () => {
    switch (activeTab) {
      case "waiting": return waitingStudents;
      case "returned": return returnedStudents;
      case "accepted": return acceptedStudents;
      case "notSubmitted": return notSubmittedStudents;
      default: return [];
    }
  };

  return (
    <div style={{ padding: "24px", minHeight: "100vh", background: "#f8fafc" }}>
      <style>{`
        .ed-container {
          max-width: 1200px;
          margin: 0;
          font-family: 'Outfit', 'Inter', sans-serif;
        }

        .ed-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
        }

        .ed-back-btn {
          background: none;
          border: none;
          font-size: 18px;
          color: #334155;
          cursor: pointer;
          padding: 8px 12px 8px 0;
          display: flex;
          align-items: center;
          transition: transform 0.2s;
        }

        .ed-back-btn:hover {
          transform: translateX(-3px);
        }

        .ed-title {
          font-size: 22px;
          font-weight: 700;
          color: #1e293b;
          margin: 0;
        }

        /* Detail Card */
        .ed-card {
          background: #fff;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          overflow: hidden;
          margin-bottom: 24px;
        }

        .ed-detail-block {
          padding: 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid #f1f5f9;
          flex-wrap: wrap;
          gap: 20px;
        }

        .ed-info-group {
          display: flex;
          gap: 48px;
          flex-wrap: wrap;
        }

        .ed-info-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .ed-info-label {
          font-size: 13px;
          font-weight: 500;
          color: #94a3b8;
          text-transform: capitalize;
        }

        .ed-info-value {
          font-size: 15px;
          font-weight: 700;
          color: #1e293b;
        }

        .ed-publish-btn {
          background: #f1f5f9;
          border: 1px solid #cbd5e1;
          color: #94a3b8;
          font-size: 13px;
          font-weight: 600;
          padding: 8px 24px;
          border-radius: 6px;
          cursor: not-allowed;
        }

        /* Tabs Section */
        .ed-tabs {
          display: flex;
          padding: 0 24px;
          background: #fff;
          border-bottom: 1px solid #f1f5f9;
          gap: 24px;
        }

        .ed-tab-btn {
          background: none;
          border: none;
          padding: 16px 0;
          font-size: 14px;
          font-weight: 600;
          color: #64748b;
          cursor: pointer;
          position: relative;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .ed-tab-btn:hover {
          color: #0f172a;
        }

        .ed-tab-btn.active {
          color: #0f172a;
        }

        .ed-tab-btn.active::after {
          content: "";
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 2.5px;
          background: #10b981;
          border-radius: 4px;
        }

        .ed-badge {
          background: #fef3c7;
          color: #d97706;
          font-size: 11px;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 20px;
        }

        /* Table Section */
        .ed-table-wrapper {
          background: #fff;
          padding: 8px 0;
        }

        .ed-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .ed-table th {
          font-size: 13px;
          font-weight: 600;
          color: #94a3b8;
          padding: 14px 24px;
          border-bottom: 1px solid #f1f5f9;
        }

        .ed-table td {
          font-size: 14px;
          color: #334155;
          padding: 16px 24px;
          border-bottom: 1px solid #f8fafc;
          font-weight: 500;
        }

        .ed-student-link {
          color: #3b82f6;
          text-decoration: none;
          font-weight: 600;
          cursor: pointer;
          background: none;
          border: none;
          padding: 0;
          font-size: 14px;
          font-family: inherit;
          text-align: left;
        }

        .ed-student-link:hover {
          text-decoration: underline;
        }

        .ed-table tr {
          transition: background 0.15s;
        }

        .ed-table tr:hover {
          background: #f8fafc;
        }

        .ed-score {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          color: #ea580c;
          font-weight: 700;
        }

        .ed-score i {
          color: #eab308;
          font-size: 13px;
        }

        .ed-edit-icon {
          color: #94a3b8;
          cursor: pointer;
          transition: color 0.15s;
          background: none;
          border: none;
          padding: 4px;
          font-size: 14px;
        }

        .ed-edit-icon:hover {
          color: #10b981;
        }

        .ed-empty {
          text-align: center;
          padding: 40px;
          color: #94a3b8;
          font-size: 14px;
        }

        /* Edit Dialog Modal */
        .ed-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.4);
          backdrop-filter: blur(2px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 11000;
        }

        .ed-modal {
          background: #fff;
          border-radius: 12px;
          width: min(400px, 90vw);
          box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04);
          padding: 20px;
        }

        .ed-modal-title {
          font-size: 16px;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 14px;
        }

        .ed-modal-input {
          width: 100%;
          height: 40px;
          border: 1.5px solid #e2e8f0;
          border-radius: 6px;
          padding: 0 12px;
          font-size: 14px;
          outline: none;
          margin-bottom: 18px;
          box-sizing: border-box;
        }

        .ed-modal-input:focus {
          border-color: #10b981;
        }

        .ed-modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
        }

        .ed-modal-btn {
          height: 36px;
          padding: 0 16px;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          border: none;
        }

        .ed-modal-btn-cancel {
          background: #f1f5f9;
          color: #475569;
        }

        .ed-modal-btn-save {
          background: #10b981;
          color: #fff;
        }
      `}</style>

      <div className="ed-container">
        {/* Header */}
        <div className="ed-header">
          <button className="ed-back-btn" onClick={() => navigate(`/dashboard/sinflar/${groupId}`)}>
            <i className="fa-solid fa-chevron-left"></i>
          </button>
          <h1 className="ed-title">{exam.title}</h1>
        </div>

        {/* Card containing Info, Tabs, and Table */}
        <div className="ed-card">
          {/* Top Detail Block */}
          <div className="ed-detail-block">
            <div className="ed-info-group">
              <div className="ed-info-item">
                <span className="ed-info-label">Mavzu</span>
                <span className="ed-info-value">{exam.topic}</span>
              </div>
              <div className="ed-info-item">
                <span className="ed-info-label">Imtihon vaqti</span>
                <span className="ed-info-value">{exam.startTime} - {exam.endTime}</span>
              </div>
            </div>
            <button className="ed-publish-btn" disabled>
              E'lon qilish
            </button>
          </div>

          {/* Submissions Tabs */}
          <div className="ed-tabs">
            <button
              className={`ed-tab-btn ${activeTab === "waiting" ? "active" : ""}`}
              onClick={() => setActiveTab("waiting")}
            >
              Kutayotganlar
            </button>
            <button
              className={`ed-tab-btn ${activeTab === "returned" ? "active" : ""}`}
              onClick={() => setActiveTab("returned")}
            >
              Qaytarilganlar
            </button>
            <button
              className={`ed-tab-btn ${activeTab === "accepted" ? "active" : ""}`}
              onClick={() => setActiveTab("accepted")}
            >
              Qabul qilinganlar <span className="ed-badge">{acceptedStudents.length}</span>
            </button>
            <button
              className={`ed-tab-btn ${activeTab === "notSubmitted" ? "active" : ""}`}
              onClick={() => setActiveTab("notSubmitted")}
            >
              Bajarilmagan
            </button>
          </div>

          {/* Table Area */}
          <div className="ed-table-wrapper">
            {getActiveList().length === 0 ? (
              <div className="ed-empty">Ma'lumotlar mavjud emas</div>
            ) : (
              <table className="ed-table">
                <thead>
                  <tr>
                    <th style={{ width: "40%" }}>O'quvchi ismi</th>
                    <th style={{ width: "22%" }}>Topshirilgan vaqti</th>
                    <th style={{ width: "22%" }}>Tekshirilgan vaqti</th>
                    <th style={{ width: "12%" }}>Ball</th>
                    <th style={{ width: "4%" }}></th>
                  </tr>
                </thead>
                <tbody>
                  {getActiveList().map((student) => (
                    <tr key={student.id}>
                      <td>
                        <button
                          className="ed-student-link"
                          onClick={() => navigate(`/dashboard/groups/${groupId}/exams/${examId}/student/${student.id}/review`)}
                        >
                          {student.name}
                        </button>
                      </td>
                      <td>{student.submittedTime}</td>
                      <td>{student.checkedTime}</td>
                      <td>
                        {student.score !== "-" ? (
                          <span className="ed-score">
                            <i className="fa-solid fa-bolt"></i>
                            {student.score}
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td>
                        <button
                          className="ed-edit-icon"
                          onClick={() => handleEditScore(student)}
                          title="Ballni tahrirlash"
                        >
                          <i className="fa-solid fa-pencil"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Edit Score Modal */}
      {editingStudent && (
        <div className="ed-modal-overlay">
          <div className="ed-modal">
            <h3 className="ed-modal-title">{editingStudent.name} uchun ball kiritish</h3>
            <input
              type="number"
              className="ed-modal-input"
              value={editScore}
              onChange={(e) => setEditScore(e.target.value)}
              placeholder="Ballni kiriting"
              min="0"
              max="100"
              autoFocus
            />
            <div className="ed-modal-actions">
              <button
                className="ed-modal-btn ed-modal-btn-cancel"
                onClick={() => setEditingStudent(null)}
              >
                Bekor qilish
              </button>
              <button
                className="ed-modal-btn ed-modal-btn-save"
                onClick={handleSaveScore}
              >
                Saqlash
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
