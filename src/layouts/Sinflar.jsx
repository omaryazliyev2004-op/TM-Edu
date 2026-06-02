import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchApi } from "../api/user.api";

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
  const navigate = useNavigate();


  const [users, setUsers] = useState([]);
  const [allTeachers, setAllTeachers] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [allRooms, setAllRooms] = useState([]);
  const [studentsCount, setStudentsCount] = useState(0);

  const [drawerDataLoaded, setDrawerDataLoaded] = useState(false);

  const fetchDrawerData = async () => {
    if (drawerDataLoaded) return;
    try {
      const [cData, rData] = await Promise.all([
        fetchApi(`courses`).catch(() => null),
        fetchApi(`rooms`).catch(() => null),
      ]);

      if (cData?.status === 200) {
        setAllCourses(cData.data?.data || cData.data || []);
      }

      if (rData?.status === 200) {
        setAllRooms(rData.data?.data || rData.data || []);
      }

      setDrawerDataLoaded(true);
    } catch (error) {
      console.log("Xatolik drawer ma'lumotlarini yuklashda:", error);
    }
  };

  useEffect(() => {
    async function datas() {
      try {
        const [gData, tData, sData] = await Promise.all([
          fetchApi(`groups/all`).catch(() => null),
          fetchApi(`teachers`).catch(() => null),
          fetchApi(`students`).catch(() => null),
        ]);

        if (gData && gData.status === 200) {
          setUsers(gData.data);
        }

        if (tData && tData.status === 200) {
          const list = tData.data?.data || tData.data || [];
          setAllTeachers(Array.isArray(list) ? list : []);
        }

        if (sData && sData.status === 200) {
          const list = sData.data?.data || sData.data || [];
          setStudentsCount(Array.isArray(list) ? list.length : 0);
        }
      } catch (error) {
        console.log(error);
      }
    }
    datas();
  }, []);

  const [activeTab, setActiveTab] = useState("guruhlar");
  const [drawerOpen, setDrawer] = useState(false);

  // Delete modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const confirmDelete = (id) => {
    setDeleteId(id);
    setDeleteModalOpen(true);
  };
  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setDeleteId(null);
  };
  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetchApi.delete(`groups/${deleteId}`);
      if (res.status === 200 || res.status === 201 || res.status === 204) {
        setUsers(prev => {
          if (prev?.data) return { ...prev, data: prev.data.filter(g => g.id !== deleteId) };
          if (Array.isArray(prev)) return prev.filter(g => g.id !== deleteId);
          return prev;
        });
        setDeleteModalOpen(false);
        setDeleteId(null);
      }
    } catch (error) {
      alert("Xatolik yuz berdi. Guruhni o'chirib bo'lmadi.");
      console.log(error);
    }
  };

  // Edit state
  const [editingGroup, setEditingGroup] = useState(null);

  // Drawer fields
  const [guruhNomi, setGuruhNomi] = useState("");
  const [kurs, setKurs] = useState("");
  const [xona, setXona] = useState("");
  const [maxStudent, setMaxStudent] = useState("");
  const [tanKunlar, setTanKunlar] = useState([]);
  const [darsVaqti, setDarsVaqti] = useState("");
  const [boshlanish, setBoshlanish] = useState("");
  const [tavsif, setTavsif] = useState("");
  const [selectedTalabalar, setSelectedTalabalar] = useState([]);
  const [selectedTeachers, setSelectedTeachers] = useState([]);

  // kunlarMap teskari (MONDAY -> Dushanba)
  const kunlarMapReverse = Object.fromEntries(Object.entries(kunlarMap).map(([k, v]) => [v, k]));

  const togleKun = (kun) => {
    setTanKunlar(prev =>
      prev.includes(kun)
        ? prev.filter(item => item !== kun)
        : [...prev, kun]
    );
  };

  const openDrawer = () => {
    setEditingGroup(null);
    setGuruhNomi(""); setKurs(""); setXona("");
    setTanKunlar([]); setDarsVaqti("09:00"); setBoshlanish("");
    setTavsif(""); setSelectedTalabalar([]); setSelectedTeachers([]);
    fetchDrawerData();
    setDrawer(true);
  };

  const openEditGroup = (group) => {
    setEditingGroup(group);
    setGuruhNomi(group.name || "");
    setKurs(group.course?.id ? String(group.course.id) : "");
    setXona(group.room?.id ? String(group.room.id) : "");
    setMaxStudent(String(group.max_student || ""));
    setTavsif(group.description || "");
    setBoshlanish(group.start_date ? group.start_date.slice(0, 10) : "");
    setDarsVaqti(group.start_time || "09:00");

    // week_day ['MONDAY','TUESDAY'] -> ['Dushanba','Seshanba']
    const kunlar = Array.isArray(group.week_day)
      ? group.week_day.map(d => kunlarMapReverse[d] || d).filter(Boolean)
      : [];
    setTanKunlar(kunlar);

    // teachers -> ID massiv
    const teacherIds = Array.isArray(group.teachers)
      ? group.teachers.map(t => (typeof t === "object" ? t.id : t)).filter(Boolean)
      : [];
    setSelectedTeachers(teacherIds);
    setSelectedTalabalar([]);

    fetchDrawerData();
    setDrawer(true);
  };

  const create = async () => {
    try {
      // undefined bo'lmasin deb filter qilamiz
      const formattedKunlar = tanKunlar
        .map(kun => kunlarMap[kun])
        .filter(Boolean);

      let res;
      if (editingGroup) {
        // PATCH uchun faqat o'zgargan maydonlarni yuboramiz
        // students ni editingGroup dan olamiz (UI da o'zgartirish yo'q)
        const existingStudentIds = Array.isArray(editingGroup.students)
          ? editingGroup.students.map(s => typeof s === "object" ? s.id : s).filter(Boolean)
          : [];

        const patchPayload = {
          name: guruhNomi,
          description: tavsif || "",
          teachers: selectedTeachers,
          students: existingStudentIds,
          start_date: boshlanish,
          week_day: formattedKunlar,
          start_time: darsVaqti,
          max_student: Number(maxStudent) || 20,
        };
        // Faqat valid raqam bo'lsagina qo'shamiz
        if (kurs && Number(kurs) > 0) patchPayload.course_id = Number(kurs);
        if (xona && Number(xona) > 0) patchPayload.room_id = Number(xona);

        res = await fetchApi.patch(`groups/${editingGroup.id}`, patchPayload);
      } else {
        const postPayload = {
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
        };
        res = await fetchApi.post("groups", postPayload);
      }

      if (res.status === 200 || res.status === 201) {
        if (editingGroup) {
          const updatedGroup = res.data?.data || res.data || {};
          const finalGroup = {
            ...editingGroup,
            name: guruhNomi,
            description: tavsif,
            start_date: boshlanish,
            start_time: darsVaqti,
            week_day: formattedKunlar,
            max_student: Number(maxStudent) || 20,
            ...updatedGroup,
          };
          setUsers(prev => {
            if (prev?.data) return { ...prev, data: prev.data.map(g => g.id === editingGroup.id ? finalGroup : g) };
            if (Array.isArray(prev)) return prev.map(g => g.id === editingGroup.id ? finalGroup : g);
            return prev;
          });
          setDrawer(false);
          setEditingGroup(null);
        } else {
          setDrawer(false);
          window.location.reload();
        }
      }
    } catch (error) {
      const xato = error.response?.data?.message || error.response?.data?.error || "Xatolik yuz berdi. Barcha maydonlarni tekshiring.";
      alert(xato);
      console.log(error.response?.data || error);
    }
  };

  // O'qituvchi modal state
  const [teacherModalOpen, setTeacherModal] = useState(false);
  const [teacherTanlangan, setTeacherTanlangan] = useState([]);
  const [teacherQidiruv, setTeacherQidiruv] = useState("");

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

        /* ── Action buttons ── */
        .g-act-btn { width: 30px; height: 30px; border-radius: 7px; border: 1px solid transparent; background: transparent; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #888; transition: 0.15s; font-size: 13px; }
        .g-act-btn:hover { background: #f0f0f0; color: #333; }
        .g-act-btn.red:hover { background: #ffebee; color: #e53935; }
        .g-act-btn.blue:hover { background: #e8f0fe; color: #1a73e8; }

        /* ── Guruh o'chirish modali ── */
        .g-del-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 1000; display: flex; align-items: center; justify-content: center; opacity: 0; pointer-events: none; transition: opacity 0.2s ease-out; }
        .g-del-overlay.open { opacity: 1; pointer-events: all; }
        .g-del-modal { background: #fff; border-radius: 24px; padding: 40px 36px 36px; width: 440px; box-shadow: 0 20px 50px rgba(0,0,0,0.15); text-align: center; transform: scale(0.95); transition: transform 0.2s cubic-bezier(0.34,1.56,0.64,1); }
        .g-del-overlay.open .g-del-modal { transform: scale(1); }
        .g-del-icon { width: 64px; height: 64px; border-radius: 50%; background: #fff0f0; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; }
        .g-del-title { font-size: 22px; font-weight: 700; color: #1f2937; margin: 0 0 12px; }
        .g-del-text { font-size: 15px; color: #4b5563; margin: 0 0 32px; line-height: 1.6; }
        .g-del-btns { display: flex; gap: 16px; justify-content: center; }
        .g-del-btn-cancel { flex: 1; height: 48px; border-radius: 12px; border: none; background: #f3f4f6; font-size: 16px; font-weight: 700; color: #374151; cursor: pointer; transition: background 0.15s; }
        .g-del-btn-cancel:hover { background: #e5e7eb; }
        .g-del-btn-confirm { flex: 1; height: 48px; border-radius: 12px; border: none; background: #ef4444; font-size: 16px; font-weight: 700; color: #fff; cursor: pointer; transition: background 0.15s; }
        .g-del-btn-confirm:hover { background: #dc2626; }
      `}</style>

      {/* ── Guruhni o'chirish tasdiqlash modali ── */}
      <div className={`g-del-overlay ${deleteModalOpen ? "open" : ""}`} onClick={cancelDelete}>
        <div className="g-del-modal" onClick={e => e.stopPropagation()}>
          <div className="g-del-icon">
            <i className="fa-solid fa-trash-can" style={{ fontSize: 26, color: "#ef4444" }}></i>
          </div>
          <h3 className="g-del-title">Guruhni o'chirish</h3>
          <p className="g-del-text">
            Siz ushbu guruhni o'chirishga ishonchingiz komilmi?<br />Bu amal qaytarib bo'lmaydi.
          </p>
          <div className="g-del-btns">
            <button className="g-del-btn-cancel" onClick={cancelDelete}>Bekor qilish</button>
            <button className="g-del-btn-confirm" onClick={handleDelete}>O'chirish</button>
          </div>
        </div>
      </div>

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
            <p className="g-dt">{editingGroup ? "Guruhni tahrirlash" : "Guruh qo'shish"}</p>
            <p className="g-ds">{editingGroup ? "Guruh ma'lumotlarini o'zgartiring va saqlang." : "Yangi guruh yaratish uchun quyidagi ma'lumotlarni kiriting."}</p>
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
          <button className="g-btn g-btn-primary" onClick={create}>{editingGroup ? "Yangilash" : "Saqlash"}</button>
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
          <div style={{ fontSize: 32, fontWeight: 700, color: "#222" }}>{users?.data?.length || users?.length || 0}</div>
        </div>

        <div className="g-stat-card bg-white">
          <button className="g-stat-card-menu"><i className="fa-solid fa-ellipsis-vertical"></i></button>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <i className="fa-solid fa-user-tie" style={{ color: "#765bcf", fontSize: 18 }}></i>
            <span style={{ fontSize: 13, color: "#888" }}>O'qituvchilar</span>
          </div>
          <div style={{ fontSize: 32, fontWeight: 700, color: "#222" }}>{allTeachers?.length || 0}</div>
        </div>

        <div className="g-stat-card bg-white">
          <button className="g-stat-card-menu"><i className="fa-solid fa-ellipsis-vertical"></i></button>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <i className="fa-solid fa-user-graduate" style={{ color: "#765bcf", fontSize: 18 }}></i>
            <span style={{ fontSize: 13, color: "#888" }}>O'quvchilar</span>
          </div>
          <div style={{ fontSize: 32, fontWeight: 700, color: "#222" }}>{studentsCount}</div>
         
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
                <th className="g-th" style={{ textAlign: "right" }}>Amallar</th>
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
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: 4 }}>
                      <button className="g-act-btn blue" title="Tahrirlash" onClick={() => openEditGroup(g)}>
                        <i className="fa-solid fa-pen"></i>
                      </button>
                      <button className="g-act-btn red" title="O'chirish" onClick={() => confirmDelete(g.id)}>
                        <i className="fa-regular fa-trash-can"></i>
                      </button>
                    </div>
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
