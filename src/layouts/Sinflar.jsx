import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchApi } from "../api/user.api";
import { useAppContext } from "../context/AppContext";

const kunlarMap = {
  Dushanba: "MONDAY",
  Seshanba: "TUESDAY",
  Chorshanba: "WEDNESDAY",
  Payshanba: "THURSDAY",
  Juma: "FRIDAY",
  Shanba: "SATURDAY",
  Yakshanba: "SUNDAY",
};
const kunlarList = Object.keys(kunlarMap);

export default function Sinflar() {
  const { stats } = useAppContext();
  const navigate = useNavigate();


  const [users, setUsers] = useState([]);
  const [allTeachers, setAllTeachers] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [allRooms, setAllRooms] = useState([]);

  useEffect(() => {
    async function datas() {
      try {
        const data = await fetchApi(`groups/all`);
        if (data.status === 200) setUsers(data.data);

        const tData = await fetchApi(`teachers`);
        if (tData.status === 200) {
          const list = tData.data?.data || tData.data || [];
          setAllTeachers(Array.isArray(list) ? list : []);
        }

        const cData = await fetchApi(`courses`);
        if (cData.status === 200) {
          setAllCourses(cData.data?.data || cData.data || []);
        }

        const rData = await fetchApi(`rooms`);
        if (rData.status === 200) {
          setAllRooms(rData.data?.data || rData.data || []);
        }
      } catch (error) {
        console.log(error);
      }
    }
    datas();
  }, []);

  const [activeTab, setActiveTab] = useState("guruhlar");
  const [drawerOpen, setDrawer] = useState(false);

  // Drawer fields
  const [guruhNomi, setGuruhNomi] = useState("");
  const [kurs, setKurs] = useState("");
  const [xona, setXona] = useState("");
  const [maxStudent, setMaxStudent] = useState("");
  const [tanKunlar, setTanKunlar] = useState([]);
  console.log( tanKunlar);
  const [darsVaqti, setDarsVaqti] = useState("");
  const [boshlanish, setBoshlanish] = useState("");
  const [tavsif, setTavsif] = useState("");
  const [selectedTalabalar, setSelectedTalabalar] = useState([]);
  const [selectedTeachers, setSelectedTeachers] = useState([]);

  const togleKun = (kun) => {
    setTanKunlar(prev =>
      prev.includes(kun)
        ? prev.filter(item => item !== kun)
        : [...prev, kun]
    );
  };

  const create = async () => {
    try {
      const formattedKunlar = tanKunlar.map(kun => kunlarMap[kun]);

      const res = await fetchApi.post("groups", {
        name: guruhNomi,
        description: tavsif,
        course_id: Number(kurs),
        teachers: selectedTeachers,
        students: selectedTalabalar,
        room_id: Number(xona),
        start_date: boshlanish,
        week_day: formattedKunlar,
        start_time: darsVaqti,
        max_student: Number(maxStudent) || 20,
      });

      if (res.status === 200 || res.status === 201) {
        setDrawer(false);
        window.location.reload();
      }
    } catch (error) {
      const xato = error.response?.data?.message || error.response?.data?.error || "Xatolik yuz berdi. Barcha maydonlarni tekshiring.";
      alert(xato);
      console.log(error.response?.data || error);
    }
  };



  // O'qituvchi modal
  const [teacherModalOpen, setTeacherModal] = useState(false);
  const [teacherTanlangan, setTeacherTanlangan] = useState([]);
  const [teacherQidiruv, setTeacherQidiruv] = useState("");

  const openDrawer = () => {
    setGuruhNomi(""); setKurs(""); setXona("");
    setTanKunlar([]); setDarsVaqti("09:00"); setBoshlanish("");
    setTavsif(""); setSelectedTalabalar([]); setSelectedTeachers([]);
    setDrawer(true);
  };

  // O'qituvchi modal functions
  const openTeacherModal = () => {
    setTeacherTanlangan([...selectedTeachers]);
    setTeacherQidiruv("");
    setTeacherModal(true);
  };
  const closeTeacherModal = () => setTeacherModal(false);
  const saveTeachers = () => {
    setSelectedTeachers([...teacherTanlangan]);
    setTeacherModal(false);
  };
  const toggleTeacher = (id) => {
    setTeacherTanlangan(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };
  const filteredTeachers = allTeachers.filter(t =>
    (t.full_name || "").toLowerCase().includes(teacherQidiruv.toLowerCase())
  );

  return (
    <div style={{ padding: "10px 0" }}>
      <style>{`
        /* ── Overlay ── */
        .g-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.35); z-index: 400; opacity: 0; pointer-events: none; transition: 0.3s; }
        .g-overlay.open { opacity: 1; pointer-events: all; }

        /* ── Drawer ── */
        .g-drawer { position: fixed; right: 0; top: 0; height: 100vh; width: 420px; background: #fff; z-index: 500; transform: translateX(100%); transition: 0.3s cubic-bezier(0.4,0,0.2,1); box-shadow: -4px 0 24px rgba(0,0,0,0.1); display: flex; flex-direction: column; }
        .g-drawer.open { transform: translateX(0); }

        .g-dh { padding: 20px 24px 16px; border-bottom: 1px solid #f0f0f0; display: flex; justify-content: space-between; align-items: flex-start; }
        .g-dt { font-size: 18px; font-weight: 700; color: #222; margin: 0 0 4px 0; }
        .g-ds { font-size: 13px; color: #666; margin: 0; }
        .g-dc { background: none; border: none; font-size: 18px; color: #999; cursor: pointer; }

        .g-body { flex: 1; overflow-y: auto; padding: 20px 24px; }
        .g-footer { padding: 16px 24px; border-top: 1px solid #f0f0f0; display: flex; gap: 10px; }

        .g-label { display: block; font-size: 13px; font-weight: 600; color: #333; margin-bottom: 6px; }
        .g-label span { color: #e53935; }
        .g-input { width: 100%; height: 42px; border-radius: 8px; border: 1.5px solid #e2e8f0; padding: 0 12px; font-size: 14px; outline: none; transition: border-color 0.15s; margin-bottom: 14px; background: #fff; box-sizing: border-box; }
        .g-input:focus { border-color: #765bcf; }
        .g-select { width: 100%; height: 42px; border-radius: 8px; border: 1.5px solid #e2e8f0; padding: 0 12px; font-size: 14px; outline: none; background: #fff; cursor: pointer; margin-bottom: 14px; box-sizing: border-box; }
        .g-select:focus { border-color: #765bcf; }
        .g-textarea { width: 100%; min-height: 72px; border-radius: 8px; border: 1.5px solid #e2e8f0; padding: 10px 12px; font-size: 14px; outline: none; resize: vertical; transition: border-color 0.15s; margin-bottom: 14px; background: #fff; box-sizing: border-box; }
        .g-textarea:focus { border-color: #765bcf; }

        /* ── Kunlar checkboxes ── */
        .g-kunlar { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 14px; }
        .g-kun-item { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #333; cursor: pointer; }
        .g-cb { width: 16px; height: 16px; border-radius: 4px; border: 1.5px solid #ccc; display: flex; align-items: center; justify-content: center; font-size: 10px; color: #fff; background: #fff; }
        .g-cb.checked { background: #765bcf; border-color: #765bcf; }

        /* ── Add btn ── */
        .g-add-btn { width: 100%; height: 42px; border-radius: 8px; border: 1px solid #e2e8f0; background: #fff; display: flex; align-items: center; justify-content: center; gap: 8px; color: #765bcf; font-size: 14px; font-weight: 600; cursor: pointer; margin-bottom: 14px; }

        /* ── Footer btns ── */
        .g-btn { height: 38px; padding: 0 20px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; }
        .g-btn-outline { border: 1px solid #e0e0e0; background: #fff; color: #444; flex: 1; justify-content: center; }
        .g-btn-outline:hover { background: #f5f5f5; }
        .g-btn-primary { border: none; background: #765bcf; color: #fff; flex: 1; justify-content: center; }
        .g-btn-primary:hover { background: #5e48a8; }

        /* ── Stat cards ── */
        .g-stat-card { flex: 1; background: #fff; border: 1px solid #eee; border-radius: 12px; padding: 18px 20px; position: relative; min-width: 180px; }
        .g-stat-card-menu { position: absolute; top: 14px; right: 14px; background: none; border: none; color: #bbb; font-size: 16px; cursor: pointer; }

        /* ── Table ── */
        .g-table { width: 100%; border-collapse: collapse; background: #fff; }
        .g-th { padding: 12px 16px; text-align: left; font-size: 12px; font-weight: 600; color: #888; border-bottom: 1px solid #eee; white-space: nowrap; }
        .g-td { padding: 14px 16px; font-size: 13px; color: #444; border-bottom: 1px solid #f5f5f5; vertical-align: middle; white-space: nowrap; }
        .g-row:hover { background: #fafafa; }

        /* ── Teacher Column Scroll ── */
        .g-oqituvchi-cell { max-height: 90px; overflow-y: auto; min-width: 150px; padding-right: 8px; }
        .g-oqituvchi-cell::-webkit-scrollbar { width: 6px; }
        .g-oqituvchi-cell::-webkit-scrollbar-track { background: transparent; }
        .g-oqituvchi-cell::-webkit-scrollbar-thumb { background: #ddd; border-radius: 3px; }
        .g-oqituvchi-cell::-webkit-scrollbar-thumb:hover { background: #bbb; }
        .g-oqituvchi-name { display: block; font-size: 13px; padding: 4px 0; color: #222; white-space: nowrap; }

        /* ── Toggle ── */
        .g-toggle { width: 36px; height: 20px; border-radius: 20px; background: #ccc; position: relative; cursor: pointer; transition: background 0.25s; border: none; }
        .g-toggle.on { background: #765bcf; }
        .g-toggle::after { content: ''; position: absolute; top: 2px; left: 2px; width: 16px; height: 16px; border-radius: 50%; background: #fff; transition: left 0.25s; }
        .g-toggle.on::after { left: 18px; }

        /* ── Tabs ── */
        .g-tab { padding: 8px 16px; border: none; background: none; font-size: 14px; font-weight: 500; color: #888; cursor: pointer; border-bottom: 2px solid transparent; }
        .g-tab.active { color: #222; border-color: #222; font-weight: 700; }

        /* ── Modal ── */
        .g-modal-wrap { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 700; display: flex; align-items: center; justify-content: center; opacity: 0; pointer-events: none; transition: 0.25s; }
        .g-modal-wrap.open { opacity: 1; pointer-events: all; }
        .g-modal { background: #fff; width: 380px; max-height: 80vh; border-radius: 12px; box-shadow: 0 8px 30px rgba(0,0,0,0.15); display: flex; flex-direction: column; transform: scale(0.95); transition: 0.25s; }
        .g-modal-wrap.open .g-modal { transform: scale(1); }
        .g-modal-header { padding: 20px 24px 14px; border-bottom: 1px solid #f0f0f0; display: flex; justify-content: space-between; align-items: flex-start; }
        .g-modal-title { font-size: 16px; font-weight: 700; color: #222; margin: 0 0 4px; }
        .g-modal-sub { font-size: 12px; color: #888; margin: 0; }
        .g-modal-body { flex: 1; overflow-y: auto; padding: 16px 24px; }
        .g-modal-footer { padding: 14px 24px; border-top: 1px solid #f0f0f0; display: flex; justify-content: flex-end; gap: 10px; }
        .g-modal-row { display: flex; align-items: center; gap: 10px; padding: 10px 0; border-bottom: 1px solid #f9f9f9; cursor: pointer; }
        .g-modal-row:last-child { border-bottom: none; }
      `}</style>

      {/* ── O'qituvchilar Modal ── */}
      <div className={`g-modal-wrap ${teacherModalOpen ? "open" : ""}`}>
        <div className="g-modal bg-white">
          <div className="g-modal-header">
            <div>
              <p className="g-modal-title">O'qituvchi qo'shish</p>
              <p className="g-modal-sub">Bitta yoki bir nechta o'qituvchini tanlang</p>
            </div>
            <button className="g-dc" onClick={closeTeacherModal}><i className="fa-solid fa-xmark"></i></button>
          </div>
          <div className="g-modal-body">
            <input
              className="g-input"
              placeholder="O'qituvchi qidirish..."
              value={teacherQidiruv}
              onChange={e => setTeacherQidiruv(e.target.value)}
              style={{ marginBottom: 8 }}
            />
            {filteredTeachers.length === 0 && (
              <p style={{ color: "#aaa", fontSize: 13, textAlign: "center", padding: "16px 0" }}>O'qituvchi topilmadi</p>
            )}
            {filteredTeachers.map(t => (
              <div key={t.id} className="g-modal-row" onClick={() => toggleTeacher(t.id)}>
                <div className={`g-cb ${teacherTanlangan.includes(t.id) ? "checked" : ""}`}>
                  {teacherTanlangan.includes(t.id) && <i className="fa-solid fa-check"></i>}
                </div>
                <span style={{ fontSize: 14, color: "#222" }}>{t.full_name || t.name || "—"}</span>
              </div>
            ))}
          </div>
          <div className="g-modal-footer">
            <button className="g-btn g-btn-outline" style={{ flex: "unset", padding: "0 20px" }} onClick={closeTeacherModal}>Bekor qilish</button>
            <button className="g-btn g-btn-primary" style={{ flex: "unset", padding: "0 20px" }} onClick={saveTeachers}>Saqlash</button>
          </div>
        </div>
      </div>

      {/* ── Drawer Overlay ── */}
      <div className={`g-overlay ${drawerOpen ? "open" : ""}`} onClick={() => setDrawer(false)} />

      {/* ── Drawer ── */}
      <div className={`g-drawer ${drawerOpen ? "open" : ""}`}>
        <div className="g-dh">
          <div>
            <p className="g-dt">Guruh qo'shish</p>
            <p className="g-ds">Yangi guruh yaratish uchun quyidagi ma'lumotlarni kiriting.</p>
          </div>
          <button className="g-dc" onClick={() => setDrawer(false)}><i className="fa-solid fa-xmark"></i></button>
        </div>
        <div className="g-body">
          <label className="g-label">Guruh nomi <span>*</span></label>
          <input className="g-input" placeholder="Frontend 2024" value={guruhNomi} onChange={e => setGuruhNomi(e.target.value)} />

          <label className="g-label">Kurs <span>*</span></label>
          <select className="g-select" value={kurs} onChange={e => setKurs(e.target.value)}>
            <option value="">Tanlang</option>
            {allCourses.map(k => <option key={k.id} value={k.id}>{k.name}</option>)}
          </select>

          <label className="g-label">Xona <span>*</span></label>
          <select className="g-select" value={xona} onChange={e => setXona(e.target.value)}>
            <option value="">Tanlang</option>
            {allRooms.map(x => <option key={x.id} value={x.id}>{x.name || x.nom}</option>)}
          </select>

          <label className="g-label">Maksimal talabalar soni <span>*</span></label>
          <input className="g-input" type="number" placeholder="Masalan: 15" value={maxStudent} onChange={e => setMaxStudent(e.target.value)} />

          <label className="g-label">Dars kunlari <span>*</span></label>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {kunlarList.map(kun => {
              const isSelected = tanKunlar.includes(kun);
              return (
                <button
                  key={kun}
                  type="button"
                  onClick={() => togleKun(kun)}
                  className={`flex items-center gap-3 rounded-xl border px-3 py-3 text-sm font-medium transition ${isSelected ? "border-[#765bcf] bg-[#f5f0ff] text-[#1f2937]" : "border-[#d1d5db] bg-white text-[#374151]"}`}
                >
                  <span className={`flex h-5 w-5 items-center justify-center rounded border text-white ${isSelected ? "border-[#765bcf] bg-[#765bcf]" : "border-[#d1d5db] bg-white text-transparent"}`}>
                    <i className="fa-solid fa-check text-[10px]" />
                  </span>
                  <span>{kun}</span>
                </button>
              );
            })}
          </div>

          <label className="g-label">Dars vaqti <span>*</span></label>
          <input className="g-input" type="time" value={darsVaqti} onChange={e => setDarsVaqti(e.target.value)} />

          <label className="g-label">Boshlanish sanasi <span>*</span></label>
          <input className="g-input" type="date" value={boshlanish} onChange={e => setBoshlanish(e.target.value)} />

          <label className="g-label">Tavsif</label>
          <textarea className="g-textarea" placeholder="Guruh haqida qo'shimcha ma'lumot (ixtiyoriy)" value={tavsif} onChange={e => setTavsif(e.target.value)} />

          <label className="g-label">O'qituvchilar</label>
          {selectedTeachers.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
              {selectedTeachers.map(id => {
                const t = allTeachers.find(tl => tl.id === id);
                return t ? (
                  <span key={id} style={{ background: "rgba(118,91,207,0.1)", color: "#765bcf", borderRadius: 6, padding: "3px 10px", fontSize: 13, fontWeight: 600 }}>
                    {t.full_name || t.name || "—"}
                  </span>
                ) : null;
              })}
            </div>
          )}
          <button className="g-add-btn" onClick={openTeacherModal}>
            <i className="fa-solid fa-plus"></i> Qo'shish
            {selectedTeachers.length > 0 && (
              <span style={{ marginLeft: 6, background: "#765bcf", color: "#fff", borderRadius: 10, padding: "1px 8px", fontSize: 12 }}>{selectedTeachers.length}</span>
            )}
          </button>
        </div>
        <div className="g-footer">
          <button className="g-btn g-btn-outline" onClick={() => setDrawer(false)}>Bekor qilish</button>
          <button className="g-btn g-btn-primary" onClick={create}>Saqlash</button>
        </div>
      </div>

      {/* ── Page Header ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#222", margin: 0 }}>Guruhlar</h1>
        <button
          onClick={openDrawer}
          style={{
            height: 36, padding: "0 14px", borderRadius: 8,
            border: "none", background: "#765bcf", color: "#fff",
            fontSize: 13, fontWeight: 600, cursor: "pointer",
            display: "flex", alignItems: "center", gap: 6
          }}
        >
          <i className="fa-solid fa-plus" style={{ fontSize: 12 }}></i> Guruh qo'shish
        </button>
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: "flex", gap: 0, borderBottom: "1px solid #eee", marginBottom: 20 }}>
        <button className={`g-tab ${activeTab === "guruhlar" ? "active" : ""}`} onClick={() => setActiveTab("guruhlar")}>
          Guruhlar
        </button>
        <button
          className={`g-tab ${activeTab === "arxiv" ? "active" : ""}`}
          style={{ display: "flex", alignItems: "center", gap: 6 }}
          onClick={() => setActiveTab("arxiv")}
        >
          <i className="fa-solid fa-calendar-days" style={{ fontSize: 12 }}></i> Arxiv
        </button>
      </div>

      {/* ── Stat cards ── */}
      <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
        <div className="g-stat-card bg-white">
          <button className="g-stat-card-menu"><i className="fa-solid fa-ellipsis-vertical"></i></button>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <i className="fa-solid fa-users" style={{ color: "#765bcf", fontSize: 18 }}></i>
            <span style={{ fontSize: 13, color: "#888" }}>Jami guruhlar</span>
          </div>
          <div style={{ fontSize: 32, fontWeight: 700, color: "#222" }}>{stats?.guruhlar || 0}</div>
        </div>

        <div className="g-stat-card bg-white">
          <button className="g-stat-card-menu"><i className="fa-solid fa-ellipsis-vertical"></i></button>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <i className="fa-solid fa-user-tie" style={{ color: "#765bcf", fontSize: 18 }}></i>
            <span style={{ fontSize: 13, color: "#888" }}>O'qituvchilar</span>
          </div>
          <div style={{ fontSize: 32, fontWeight: 700, color: "#222" }}>{stats?.oqituvchilar || 0}</div>
        </div>

        <div className="g-stat-card bg-white">
          <button className="g-stat-card-menu"><i className="fa-solid fa-ellipsis-vertical"></i></button>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <i className="fa-solid fa-user-graduate" style={{ color: "#765bcf", fontSize: 18 }}></i>
            <span style={{ fontSize: 13, color: "#888" }}>O'quvchilar</span>
          </div>
          <div style={{ fontSize: 32, fontWeight: 700, color: "#222" }}>{stats?.talabalar || 0}</div>
         
        </div>
      </div>

      {/* ── Table ── */}
      <div className="bg-white" style={{ border: "1px solid #eee", borderRadius: 12, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table className="g-table">
            <thead>
              <tr>
                <th className="g-th">Status</th>
                <th className="g-th">Guruh nomi</th>
                <th className="g-th">Kurs</th>
                <th className="g-th">Davomiyligi</th>
                <th className="g-th">Dars vaqti</th>
                <th className="g-th">Xona</th>
                <th className="g-th">O'qituvchi</th>
                <th className="g-th">Talabalar</th>
                <th className="g-th" style={{ textAlign: "right" }}>
                  <button style={{ background: "none", border: "none", color: "#aaa", cursor: "pointer", fontSize: 15, padding: 0 }}>
                    <i className="fa-solid fa-rotate-right"></i>
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {users?.data?.map(g => (
                <tr key={g.id} className="g-row">
                  <td className="g-td">
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <button className={`g-toggle ${g.id ? "on" : ""}`} disabled />
                      <span style={{
                        fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 6,
                        background: g.id ? "rgba(76,175,80,0.1)" : "rgba(200,200,200,0.2)",
                        color: g.id ? "#4caf50" : "#999"
                      }}>
                        {g.id ? "FAOL" : "NOFAOL"}
                      </span>
                    </div>
                  </td>
                  <td 
                    className="g-td" 
                    style={{ fontWeight: 600, color: "#222", cursor: "pointer" }} 
                    onClick={() => navigate(`/dashboard/sinflar/${g.id}`)}
                  >
                    <span style={{ borderBottom: "1px dashed #aaa", paddingBottom: "2px" }}>
                      {g.name}
                    </span>
                  </td>
                  <td className="g-td">
                    <span style={{ color: "#765bcf", fontWeight: 600 }}>{g.course?.name || ""}</span>
                  </td>
                  <td className="g-td">{g.course?.duration_month || 0} oy</td>
                  <td className="g-td">
                    <div style={{ fontWeight: 600, color: "#222" }}>{g.start_time}</div>
                    <div style={{ fontSize: 11, color: "#999", marginTop: 2 }}>{Array.isArray(g.week_day) ? g.week_day.join("/") : g.week_day}</div>
                  </td>
                  <td className="g-td">{g.room?.name || g.room || ""}</td>
                  <td className="g-td" style={{ fontWeight: 600, color: "#222" }}>
                    {Array.isArray(g.teachers) && g.teachers.length > 0 ? (
                      <div className="g-oqituvchi-cell">
                        {g.teachers.map((t, idx) => (
                          <div key={idx} className="g-oqituvchi-name">
                            {t?.full_name || t?.name || ""}
                          </div>
                        ))}
                      </div>
                    ) : (g.teachers?.full_name || g.teachers?.name || g.teachers || "")}
                  </td>
                  <td className="g-td" style={{ fontWeight: 600, color: "#222" }}>{g.student_count || 0}</td>
                  <td className="g-td">
                    <button style={{ background: "none", border: "none", color: "#bbb", cursor: "pointer", fontSize: 16 }}>
                      <i className="fa-solid fa-ellipsis-vertical"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
