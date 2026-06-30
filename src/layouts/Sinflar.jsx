import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchApi } from "../api/user.api";
import { useLang } from "../i18n/LanguageContext";

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

function isGroupActive(group) {
  if (typeof group?.is_active === "boolean") return group.is_active;
  const status = String(group?.status || "").toLowerCase();
  if (status) return !["inactive", "archive", "archived", "tugagan", "finished"].includes(status);
  return true;
}

export default function Sinflar() {
  const navigate = useNavigate();
  const { t } = useLang();


  const [users, setUsers] = useState([]);
  const [allTeachers, setAllTeachers] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [allRooms, setAllRooms] = useState([]);
  const [studentsCount, setStudentsCount] = useState(0);
  const [archived, setArchived] = useState([]);
  const [archiveLoading, setArchiveLoading] = useState(false);

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
          setAllStudents(Array.isArray(list) ? list : []);
          setStudentsCount(Array.isArray(list) ? list.length : 0);
        }
      } catch (error) {
        console.log(error);
      }
    }
    datas();
  }, []);

  const [activeTab, setActiveTab] = useState("guruhlar");

  // Arxivlangan guruhlar — GET /api/v1/groups/archive
  useEffect(() => {
    if (activeTab !== "arxiv") return;
    async function loadArchive() {
      setArchiveLoading(true);
      try {
        const res = await fetchApi(`groups/archive`);
        if (res.status === 200) {
          setArchived(res.data?.data ?? res.data ?? []);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setArchiveLoading(false);
      }
    }
    loadArchive();
  }, [activeTab]);
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
      alert(t("Xatolik yuz berdi. Guruhni o'chirib bo'lmadi."));
      console.log(error);
    }
  };

  const toggleGroupFrontend = (group) => {
    const nextActive = !isGroupActive(group);
    const updatedGroup = {
      ...group,
      is_active: nextActive,
      status: nextActive ? "active" : "inactive",
    };

    if (activeTab === "arxiv") {
      setArchived((prev) => prev.map((g) => (g.id === group.id ? updatedGroup : g)));
      return;
    }

    setUsers((prev) => {
      if (prev?.data) {
        return {
          ...prev,
          data: prev.data.map((g) => (g.id === group.id ? updatedGroup : g)),
        };
      }
      if (Array.isArray(prev)) {
        return prev.map((g) => (g.id === group.id ? updatedGroup : g));
      }
      return prev;
    });
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

    // students -> ID massiv
    const studentIds = Array.isArray(group.students)
      ? group.students.map(s => (typeof s === "object" ? s.id : s)).filter(Boolean)
      : [];
    setSelectedTalabalar(studentIds);

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
        const patchPayload = {
          name: guruhNomi,
          description: tavsif || "",
          teachers: selectedTeachers,
          students: selectedTalabalar,
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
          setEditingGroup(null);
          // Butun sahifani qayta yuklamasdan faqat guruhlar ro'yxatini yangilaymiz
          const g = await fetchApi(`groups/all`);
          if (g.status === 200) setUsers(g.data);
        }
      }
    } catch (error) {
      const xato = error.response?.data?.message || error.response?.data?.error || t("Xatolik yuz berdi. Barcha maydonlarni tekshiring.");
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

  // Talaba modal state
  const [studentModalOpen, setStudentModal] = useState(false);
  const [studentTanlangan, setStudentTanlangan] = useState([]);
  const [studentQidiruv, setStudentQidiruv] = useState("");

  // Talaba modal functions
  const openStudentModal = () => {
    setStudentTanlangan([...selectedTalabalar]);
    setStudentQidiruv("");
    setStudentModal(true);
  };
  const closeStudentModal = () => setStudentModal(false);
  const saveStudents = () => {
    setSelectedTalabalar([...studentTanlangan]);
    setStudentModal(false);
  };
  const toggleStudent = (id) => {
    setStudentTanlangan(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };
  const filteredStudents = allStudents.filter(s =>
    (s.full_name || s.name || "").toLowerCase().includes(studentQidiruv.toLowerCase())
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
        .g-input:focus { border-color: #7c3aed; }
        .g-select { width: 100%; height: 42px; border-radius: 8px; border: 1.5px solid #e2e8f0; padding: 0 12px; font-size: 14px; outline: none; background: #fff; cursor: pointer; margin-bottom: 14px; box-sizing: border-box; }
        .g-select:focus { border-color: #7c3aed; }
        .g-textarea { width: 100%; min-height: 72px; border-radius: 8px; border: 1.5px solid #e2e8f0; padding: 10px 12px; font-size: 14px; outline: none; resize: vertical; transition: border-color 0.15s; margin-bottom: 14px; background: #fff; box-sizing: border-box; }
        .g-textarea:focus { border-color: #7c3aed; }

        /* ── Kunlar checkboxes ── */
        .g-kunlar { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 14px; }
        .g-kun-item { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #333; cursor: pointer; }
        .g-cb { width: 16px; height: 16px; border-radius: 4px; border: 1.5px solid #ccc; display: flex; align-items: center; justify-content: center; font-size: 10px; color: #fff; background: #fff; }
        .g-cb.checked { background: #7c3aed; border-color: #7c3aed; }

        /* ── Add btn ── */
        .g-add-btn { width: 100%; height: 42px; border-radius: 8px; border: 1px solid #e2e8f0; background: #fff; display: flex; align-items: center; justify-content: center; gap: 8px; color: #7c3aed; font-size: 14px; font-weight: 600; cursor: pointer; margin-bottom: 14px; }

        /* ── Footer btns ── */
        .g-btn { height: 38px; padding: 0 20px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; }
        .g-btn-outline { border: 1px solid #e0e0e0; background: #fff; color: #444; flex: 1; justify-content: center; }
        .g-btn-outline:hover { background: #f5f5f5; }
        .g-btn-primary { border: none; background: #7c3aed; color: #fff; flex: 1; justify-content: center; }
        .g-btn-primary:hover { background: #5e48a8; }

        /* ── Stat cards ── */
        .g-stat-card { flex: 1; background: #fff; border: none; border-radius: 16px; padding: 20px 22px; position: relative; min-width: 180px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
        .g-stat-card-menu { position: absolute; top: 14px; right: 14px; background: none; border: none; color: #d1d5db; font-size: 16px; cursor: pointer; }

        /* ── Table ── */
        .g-table { width: 100%; border-collapse: collapse; background: #fff; }
        .g-th { padding: 16px 20px; text-align: left; font-size: 13.5px; font-weight: 700; color: #1e293b; border-bottom: 1px solid #f1f5f9; white-space: nowrap; }
        .g-td { padding: 16px 20px; font-size: 14px; font-weight: 500; color: #1e293b; border-bottom: 1px solid #f1f5f9; vertical-align: middle; white-space: nowrap; }
        .g-row:hover { background: #f8fafc; }

        /* ── Teacher Column Scroll ── */
        .g-oqituvchi-cell { max-height: 90px; overflow-y: auto; min-width: 150px; padding-right: 8px; }
        .g-oqituvchi-cell::-webkit-scrollbar { width: 6px; }
        .g-oqituvchi-cell::-webkit-scrollbar-track { background: transparent; }
        .g-oqituvchi-cell::-webkit-scrollbar-thumb { background: #ddd; border-radius: 3px; }
        .g-oqituvchi-cell::-webkit-scrollbar-thumb:hover { background: #bbb; }
        .g-oqituvchi-name { display: block; font-size: 13px; padding: 4px 0; color: #222; white-space: nowrap; }

        /* ── Toggle ── */
        .g-toggle { width: 36px; height: 20px; border-radius: 20px; background: #ccc; position: relative; cursor: pointer; transition: background 0.25s; border: none; }
        .g-toggle.on { background: #7c3aed; }
        .g-toggle::after { content: ''; position: absolute; top: 2px; left: 2px; width: 16px; height: 16px; border-radius: 50%; background: #fff; transition: left 0.25s; }
        .g-toggle.on::after { left: 18px; }

        /* ── Tabs ── */
        .g-tab { padding: 8px 16px; border: none; background: none; font-size: 14px; font-weight: 500; color: #888; cursor: pointer; border-bottom: 2px solid transparent; }
        .g-tab.active { color: #222; border-color: #222; font-weight: 700; }

        /* ── Modal ── */
        .g-modal-wrap { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 700; display: flex; align-items: center; justify-content: center; opacity: 0; pointer-events: none; transition: 0.25s; }
        .g-modal-wrap.open { opacity: 1; pointer-events: all; }
        .g-modal { background: #fff; width: 380px; max-height: 80vh; border-radius: 16px; box-shadow: 0 8px 30px rgba(0,0,0,0.15); display: flex; flex-direction: column; transform: scale(0.95); transition: 0.25s; }
        .g-modal-wrap.open .g-modal { transform: scale(1); }
        .g-modal-header { padding: 20px 24px 14px; border-bottom: 1px solid #f0f0f0; display: flex; justify-content: space-between; align-items: flex-start; }
        .g-modal-title { font-size: 16px; font-weight: 700; color: #222; margin: 0 0 4px; }
        .g-modal-sub { font-size: 12px; color: #888; margin: 0; }
        .g-modal-body { flex: 1; overflow-y: auto; padding: 16px 24px; }
        .g-modal-footer { padding: 14px 24px; border-top: 1px solid #f0f0f0; display: flex; justify-content: flex-end; gap: 10px; }
        .g-modal-row { display: flex; align-items: center; gap: 10px; padding: 10px 0; border-bottom: 1px solid #f9f9f9; cursor: pointer; }
        .g-modal-row:last-child { border-bottom: none; }

        /* ── Action buttons ── */
        .g-act-btn { width: 32px; height: 32px; border-radius: 8px; border: none; background: transparent; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #94a3b8; transition: 0.15s; font-size: 15px; }
        .g-act-btn:hover { background: #f1f5f9; color: #334155; }
        .g-act-btn.red:hover { background: #fef2f2; color: #ef4444; }
        .g-act-btn.blue:hover { background: #eff6ff; color: #3b82f6; }

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
          <h3 className="g-del-title">{t("Guruhni o'chirish")}</h3>
          <p className="g-del-text">
            {t("Siz ushbu guruhni o'chirishga ishonchingiz komilmi?")}<br />{t("Bu amal qaytarib bo'lmaydi.")}
          </p>
          <div className="g-del-btns">
            <button className="g-del-btn-cancel" onClick={cancelDelete}>{t("Bekor qilish")}</button>
            <button className="g-del-btn-confirm" onClick={handleDelete}>{t("O'chirish")}</button>
          </div>
        </div>
      </div>

      {/* ── O'qituvchilar Modal ── */}
      <div className={`g-modal-wrap ${teacherModalOpen ? "open" : ""}`}>
        <div className="g-modal bg-white">
          <div className="g-modal-header">
            <div>
              <p className="g-modal-title">{t("O'qituvchi qo'shish")}</p>
              <p className="g-modal-sub">{t("Bitta yoki bir nechta o'qituvchini tanlang")}</p>
            </div>
            <button className="g-dc" onClick={closeTeacherModal}><i className="fa-solid fa-xmark"></i></button>
          </div>
          <div className="g-modal-body">
            <input
              className="g-input"
              placeholder={t("O'qituvchi qidirish...")}
              value={teacherQidiruv}
              onChange={e => setTeacherQidiruv(e.target.value)}
              style={{ marginBottom: 8 }}
            />
            {filteredTeachers.length === 0 && (
              <p style={{ color: "#aaa", fontSize: 13, textAlign: "center", padding: "16px 0" }}>{t("O'qituvchi topilmadi")}</p>
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
            <button className="g-btn g-btn-outline" style={{ flex: "unset", padding: "0 20px" }} onClick={closeTeacherModal}>{t("Bekor qilish")}</button>
            <button className="g-btn g-btn-primary" style={{ flex: "unset", padding: "0 20px" }} onClick={saveTeachers}>{t("Saqlash")}</button>
          </div>
        </div>
      </div>

      {/* ── Talabalar Modal ── */}
      <div className={`g-modal-wrap ${studentModalOpen ? "open" : ""}`}>
        <div className="g-modal bg-white">
          <div className="g-modal-header">
            <div>
              <p className="g-modal-title">{t("Talaba qo'shish")}</p>
              <p className="g-modal-sub">{t("Bitta yoki bir nechta talabani tanlang")}</p>
            </div>
            <button className="g-dc" onClick={closeStudentModal}><i className="fa-solid fa-xmark"></i></button>
          </div>
          <div className="g-modal-body">
            <input
              className="g-input"
              placeholder={t("Talaba qidirish...")}
              value={studentQidiruv}
              onChange={e => setStudentQidiruv(e.target.value)}
              style={{ marginBottom: 8 }}
            />
            {filteredStudents.length === 0 && (
              <p style={{ color: "#aaa", fontSize: 13, textAlign: "center", padding: "16px 0" }}>{t("Talaba topilmadi")}</p>
            )}
            {filteredStudents.map(s => (
              <div key={s.id} className="g-modal-row" onClick={() => toggleStudent(s.id)}>
                <div className={`g-cb ${studentTanlangan.includes(s.id) ? "checked" : ""}`}>
                  {studentTanlangan.includes(s.id) && <i className="fa-solid fa-check"></i>}
                </div>
                <span style={{ fontSize: 14, color: "#222" }}>{s.full_name || s.name || "—"}</span>
              </div>
            ))}
          </div>
          <div className="g-modal-footer">
            <button className="g-btn g-btn-outline" style={{ flex: "unset", padding: "0 20px" }} onClick={closeStudentModal}>{t("Bekor qilish")}</button>
            <button className="g-btn g-btn-primary" style={{ flex: "unset", padding: "0 20px" }} onClick={saveStudents}>{t("Saqlash")}</button>
          </div>
        </div>
      </div>

      {/* ── Drawer Overlay ── */}
      <div className={`g-overlay ${drawerOpen ? "open" : ""}`} onClick={() => setDrawer(false)} />

      {/* ── Drawer ── */}
      <div className={`g-drawer ${drawerOpen ? "open" : ""}`}>
        <div className="g-dh">
          <div>
            <p className="g-dt">{editingGroup ? t("Guruhni tahrirlash") : t("Guruh qo'shish")}</p>
            <p className="g-ds">{editingGroup ? t("Guruh ma'lumotlarini o'zgartiring va saqlang.") : t("Yangi guruh yaratish uchun quyidagi ma'lumotlarni kiriting.")}</p>
          </div>
          <button className="g-dc" onClick={() => setDrawer(false)}><i className="fa-solid fa-xmark"></i></button>
        </div>
        <div className="g-body">
          <label className="g-label">{t("Guruh nomi")} <span>*</span></label>
          <input className="g-input" placeholder="Frontend 2024" value={guruhNomi} onChange={e => setGuruhNomi(e.target.value)} />

          <label className="g-label">{t("Kurs")} <span>*</span></label>
          <select className="g-select" value={kurs} onChange={e => setKurs(e.target.value)}>
            <option value="" disabled hidden>{t("Tanlang")}</option>
            {allCourses.map(k => <option key={k.id} value={k.id}>{k.name}</option>)}
          </select>

          <label className="g-label">{t("Xona")} <span>*</span></label>
          <select className="g-select" value={xona} onChange={e => setXona(e.target.value)}>
            <option value="" disabled hidden>{t("Tanlang")}</option>
            {allRooms.map(x => <option key={x.id} value={x.id}>{x.name || x.nom}</option>)}
          </select>

          <label className="g-label">{t("Maksimal talabalar soni")} <span>*</span></label>
          <input className="g-input" type="number" placeholder={t("Masalan: 15")} value={maxStudent} onChange={e => setMaxStudent(e.target.value)} />

          <label className="g-label">{t("Dars kunlari")} <span>*</span></label>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {kunlarList.map(kun => {
              const isSelected = tanKunlar.includes(kun);
              return (
                <button
                  key={kun}
                  type="button"
                  onClick={() => togleKun(kun)}
                  className={`flex items-center gap-3 rounded-xl border px-3 py-3 text-sm font-medium transition ${isSelected ? "border-[#7c3aed] bg-[#f5f0ff] text-[#1f2937]" : "border-[#d1d5db] bg-white text-[#374151]"}`}
                >
                  <span className={`flex h-5 w-5 items-center justify-center rounded border text-white ${isSelected ? "border-[#7c3aed] bg-[#7c3aed]" : "border-[#d1d5db] bg-white text-transparent"}`}>
                    <i className="fa-solid fa-check text-[10px]" />
                  </span>
                  <span>{kun}</span>
                </button>
              );
            })}
          </div>

          <label className="g-label">{t("Dars vaqti")} <span>*</span></label>
          <input className="g-input" type="time" value={darsVaqti} onChange={e => setDarsVaqti(e.target.value)} />

          <label className="g-label">{t("Boshlanish sanasi")} <span>*</span></label>
          <input className="g-input" type="date" value={boshlanish} onChange={e => setBoshlanish(e.target.value)} />

          <label className="g-label">{t("Tavsif")}</label>
          <textarea className="g-textarea" placeholder={t("Guruh haqida qo'shimcha ma'lumot (ixtiyoriy)")} value={tavsif} onChange={e => setTavsif(e.target.value)} />

          <label className="g-label">{t("O'qituvchilar")}</label>
          {selectedTeachers.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
              {selectedTeachers.map(id => {
                const t = allTeachers.find(tl => tl.id === id);
                return t ? (
                  <span key={id} style={{ background: "rgba(124,58,237,0.1)", color: "#7c3aed", borderRadius: 6, padding: "3px 10px", fontSize: 13, fontWeight: 600 }}>
                    {t.full_name || t.name || "—"}
                  </span>
                ) : null;
              })}
            </div>
          )}
          <button className="g-add-btn" onClick={openTeacherModal}>
            <i className="fa-solid fa-plus"></i> {t("Qo'shish")}
            {selectedTeachers.length > 0 && (
              <span style={{ marginLeft: 6, background: "#7c3aed", color: "#fff", borderRadius: 10, padding: "1px 8px", fontSize: 12 }}>{selectedTeachers.length}</span>
            )}
          </button>

          <label className="g-label">{t("Talabalar")}</label>
          {selectedTalabalar.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
              {selectedTalabalar.map(id => {
                const s = allStudents.find(sl => sl.id === id);
                return s ? (
                  <span key={id} style={{ background: "rgba(124,58,237,0.1)", color: "#7c3aed", borderRadius: 6, padding: "3px 10px", fontSize: 13, fontWeight: 600 }}>
                    {s.full_name || s.name || "—"}
                  </span>
                ) : null;
              })}
            </div>
          )}
          <button className="g-add-btn" onClick={openStudentModal}>
            <i className="fa-solid fa-plus"></i> {t("Qo'shish")}
            {selectedTalabalar.length > 0 && (
              <span style={{ marginLeft: 6, background: "#7c3aed", color: "#fff", borderRadius: 10, padding: "1px 8px", fontSize: 12 }}>{selectedTalabalar.length}</span>
            )}
          </button>
        </div>
        <div className="g-footer">
          <button className="g-btn g-btn-outline" onClick={() => setDrawer(false)}>{t("Bekor qilish")}</button>
          <button className="g-btn g-btn-primary" onClick={create}>{editingGroup ? t("Yangilash") : t("Saqlash")}</button>
        </div>
      </div>

      {/* ── Page Header ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: "#1e293b", margin: "0 0 8px 0" }}>{t("Guruhlar")}</h1>
        </div>
        {activeTab !== "arxiv" && (
          <button
            onClick={openDrawer}
            style={{
              height: 44, padding: "0 20px", borderRadius: 12,
              border: "none", background: "#7c3aed", color: "#fff",
              fontSize: 14, fontWeight: 700, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 8,
              boxShadow: "0 10px 15px -3px rgba(124,58,237,0.2)"
            }}
          >
            <i className="fa-solid fa-plus" style={{ fontSize: 13 }}></i> {t("Guruh qo'shish")}
          </button>
        )}
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: "flex", gap: 4, marginBottom: 20 }}>
        <button
          onClick={() => setActiveTab("guruhlar")}
          style={{
            padding: "8px 18px", borderRadius: 10, border: "none", fontWeight: 600, fontSize: 14, cursor: "pointer",
            background: activeTab === "guruhlar" ? "#7c3aed" : "transparent",
            color: activeTab === "guruhlar" ? "#fff" : "#9ca3af",
            transition: "all 0.15s"
          }}
        >
          {t("Guruhlar")}
        </button>
        <button
          onClick={() => setActiveTab("arxiv")}
          style={{
            padding: "8px 18px", borderRadius: 10, border: "none", fontWeight: 600, fontSize: 14, cursor: "pointer",
            background: activeTab === "arxiv" ? "#7c3aed" : "transparent",
            color: activeTab === "arxiv" ? "#fff" : "#9ca3af",
            display: "flex", alignItems: "center", gap: 6,
            transition: "all 0.15s"
          }}
        >
          {t("Arxiv")}
        </button>
      </div>

      {/* ── Stat cards ── */}
      <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
        <div className="g-stat-card bg-white">
          <button className="g-stat-card-menu"><i className="fa-solid fa-ellipsis-vertical"></i></button>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <i className="fa-solid fa-users" style={{ color: "#7c3aed", fontSize: 18 }}></i>
            <span style={{ fontSize: 13, color: "#888" }}>{t("Jami guruhlar")}</span>
          </div>
          <div style={{ fontSize: 32, fontWeight: 700, color: "#222" }}>{users?.data?.length || users?.length || 0}</div>
        </div>

        <div className="g-stat-card bg-white">
          <button className="g-stat-card-menu"><i className="fa-solid fa-ellipsis-vertical"></i></button>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <i className="fa-solid fa-user-tie" style={{ color: "#7c3aed", fontSize: 18 }}></i>
            <span style={{ fontSize: 13, color: "#888" }}>{t("O'qituvchilar")}</span>
          </div>
          <div style={{ fontSize: 32, fontWeight: 700, color: "#222" }}>{allTeachers?.length || 0}</div>
        </div>

        <div className="g-stat-card bg-white">
          <button className="g-stat-card-menu"><i className="fa-solid fa-ellipsis-vertical"></i></button>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <i className="fa-solid fa-user-graduate" style={{ color: "#7c3aed", fontSize: 18 }}></i>
            <span style={{ fontSize: 13, color: "#888" }}>{t("O'quvchilar")}</span>
          </div>
          <div style={{ fontSize: 32, fontWeight: 700, color: "#222" }}>{studentsCount}</div>
         
        </div>
      </div>

      {/* ── Table ── */}
      <div className="bg-white" style={{ border: "none", borderRadius: 16, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
        <div style={{ overflowX: "auto" }}>
          <table className="g-table">
            <thead>
              <tr>
                <th className="g-th">{t("Status")}</th>
                <th className="g-th">{t("Guruh nomi")}</th>
                <th className="g-th">{t("Kurs")}</th>
                <th className="g-th">{t("Davomiyligi")}</th>
                <th className="g-th">{t("Dars vaqti")}</th>
                <th className="g-th">{t("Xona")}</th>
                <th className="g-th">{t("O'qituvchi")}</th>
                <th className="g-th">{t("Talabalar")}</th>
                <th className="g-th" style={{ textAlign: "right" }}>{t("Amallar")}</th>
              </tr>
            </thead>
            <tbody>
              {activeTab === "arxiv" && archiveLoading && (
                <tr>
                  <td className="g-td" colSpan={9} style={{ textAlign: "center", color: "#888" }}>
                    {t("Arxiv yuklanmoqda...")}
                  </td>
                </tr>
              )}
              {activeTab === "arxiv" && !archiveLoading && archived.length === 0 && (
                <tr>
                  <td className="g-td" colSpan={9} style={{ textAlign: "center", color: "#888" }}>
                    {t("Arxivda guruhlar yo'q")}
                  </td>
                </tr>
              )}
              {(activeTab === "arxiv" ? archived : users?.data || []).map(g => {
                const active = isGroupActive(g);
                return (
                <tr key={g.id} className="g-row">
                  <td className="g-td">
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {activeTab === "arxiv" ? (
                        <>
                          <button
                            className={`g-toggle ${active ? "on" : ""}`}
                            type="button"
                            onClick={() => toggleGroupFrontend(g)}
                          />
                          <span style={{
                            fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 6,
                            background: active ? "rgba(76,175,80,0.1)" : "rgba(150,150,150,0.15)",
                            color: active ? "#4caf50" : "#888"
                          }}>
                            {active ? t("FAOL") : t("ARXIV")}
                          </span>
                        </>
                      ) : (
                        <>
                          <button
                            className={`g-toggle ${active ? "on" : ""}`}
                            type="button"
                            onClick={() => toggleGroupFrontend(g)}
                          />
                          <span style={{
                            fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 6,
                            background: active ? "rgba(76,175,80,0.1)" : "rgba(200,200,200,0.2)",
                            color: active ? "#4caf50" : "#999"
                          }}>
                            {active ? t("FAOL") : t("NOFAOL")}
                          </span>
                        </>
                      )}
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
                    <span style={{ color: "#7c3aed", fontWeight: 600 }}>{g.course?.name || ""}</span>
                  </td>
                  <td className="g-td">{g.course?.duration_month || 0} {t("oy")}</td>
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
                    {activeTab === "arxiv" ? (
                      <div style={{ textAlign: "right", color: "#bbb" }}>—</div>
                    ) : (
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: 4 }}>
                        <button className="g-act-btn blue" title={t("Tahrirlash")} onClick={() => openEditGroup(g)}>
                          <i className="fa-solid fa-pen"></i>
                        </button>
                        <button className="g-act-btn red" title={t("O'chirish")} onClick={() => confirmDelete(g.id)}>
                          <i className="fa-regular fa-trash-can"></i>
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
