import { useEffect, useState } from "react";
import { fetchApi } from "../api/user.api";
import { useLang } from "../i18n/LanguageContext";

const PER_PAGE = 10;

// Javob obyektidan jami son maydonini (total/count) ichma-ich qidiradi
function findTotal(obj, depth = 0) {
  if (!obj || typeof obj !== "object" || depth > 4) return undefined;
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === "number" && /total|count|jami/i.test(k)) return v;
  }
  for (const v of Object.values(obj)) {
    if (v && typeof v === "object") {
      const r = findTotal(v, depth + 1);
      if (typeof r === "number") return r;
    }
  }
  return undefined;
}

// Pagination raqamlarini hosil qiladi: [1, ..., 4, 5, 6, ..., 10]
function getPageNumbers(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = [1];
  if (current > 3) pages.push("...");
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) pages.push(i);
  if (current < total - 2) pages.push("...");
  pages.push(total);
  return pages;
}

export default function Talabalar() {

  const { t } = useLang();

  const [users, setUsers] = useState([]);
  const [allGroups, setAllGroups] = useState([]);
  const [groupsLoaded, setGroupsLoaded] = useState(false);
  const [view, setView] = useState("active"); // "active" | "archive"
  const [archived, setArchived] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0); // server bergan jami talabalar soni (active)
  const [archiveLoading, setArchiveLoading] = useState(false);

  // Joriy sahifadagi talabalarni server-side pagination bilan yuklaymiz
  const loadStudents = async (pageNum) => {
    try {
      const res = await fetchApi(`students?page=${pageNum}&limit=${PER_PAGE}`);
      if (res.status === 200) {
        setUsers(res.data);
        const tot = findTotal(res.data);
        setTotal(typeof tot === "number" ? tot : 0);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Active ko'rinishda sahifa o'zgarganda serverdan yuklaymiz
  useEffect(() => {
    if (view !== "active") return;
    let alive = true;
    (async () => {
      try {
        const res = await fetchApi(`students?page=${page}&limit=${PER_PAGE}`);
        if (res.status === 200 && alive) {
          console.log("students response:", res.data);
          setUsers(res.data);
          const tot = findTotal(res.data);
          setTotal(typeof tot === "number" ? tot : 0);
        }
      } catch (error) {
        console.log(error);
      }
    })();
    return () => { alive = false; };
  }, [page, view]);

  // Arxivlangan talabalar — GET /api/v1/students/archive
  useEffect(() => {
    if (view !== "archive") return;
    async function loadArchive() {
      setArchiveLoading(true);
      try {
        const res = await fetchApi(`students/archive`);
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
  }, [view]);

  const fetchGroups = async () => {
    if (groupsLoaded) return;
    try {
      const gData = await fetchApi(`groups/all`);
      if (gData.status === 200) {
        setAllGroups(gData.data?.data || gData.data || []);
        setGroupsLoaded(true);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Guruhlarni bir marta yuklab qo'yamiz (modal/chiplar uchun)
  useEffect(() => {
    async function loadGroupsOnce() {
      try {
        const gData = await fetchApi(`groups/all`);
        if (gData.status === 200) {
          setAllGroups(gData.data?.data || gData.data || []);
          setGroupsLoaded(true);
        }
      } catch (error) {
        console.log(error);
      }
    }
    loadGroupsOnce();
  }, []);

  const [drawerOpen, setDrawer] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [editingStudent, setEditingStudent] = useState(null);

  // Drawer fields
  const [tel, setTel] = useState("+998");
  const [email, setEmail] = useState("");
  const [fio, setFio] = useState("");
  const [sana, setSana] = useState("");
  const [manzil, setManzil] = useState("");
  const [parol, setParol] = useState("");
  const [rasm, setRasm] = useState(null);
  const [selectedGuruhlar, setSelectedGuruhlar] = useState([]);
  const [guruhQidiruv, setGuruhQidiruv] = useState("");
  const [tempSelected, setTempSelected] = useState([]);

  const openGuruhModal = () => {
    setTempSelected([...selectedGuruhlar]);
    setGuruhQidiruv("");
    fetchGroups();
    setModalOpen(true);
  };

  const saveGuruhlar = () => {
    setSelectedGuruhlar([...tempSelected]);
    setModalOpen(false);
  };

  const resetForm = () => {
    setTel("+998");
    setEmail("");
    setFio("");
    setSana("");
    setManzil("");
    setParol("");
    setRasm(null);
    setSelectedGuruhlar([]);
    setTempSelected([]);
    setEditingStudent(null);
  };

  const openAddStudent = () => {
    resetForm();
    setEditingStudent(null);
    setDrawer(true);
  };

  const openEditStudent = (student) => {
    setEditingStudent(student);
    setTel(student.phone || "+998");
    setEmail(student.email || "");
    setFio(student.full_name || "");
    setSana(student.birth_date ? student.birth_date.slice(0, 10) : "");
    setManzil(student.address || "");
    setParol("");
    setRasm(null);

    // Faqat mavjud va aktiv guruh IDlarini filtrlab olamiz
    const activeGroupIds = (student.groups || [])
      .map((g) => (g && typeof g === "object" ? g.id : g))
      .map(Number)
      .filter((id) => !isNaN(id) && id > 0 && allGroups.some((ag) => ag.id === id));

    setSelectedGuruhlar(activeGroupIds);
    setTempSelected(activeGroupIds);
    setDrawer(true);
  };

  const confirmDelete = (id) => {
    setDeleteId(id);
    setDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetchApi.delete(`students/${deleteId}`);
      if (res.status === 200 || res.status === 201) {
        setDeleteModal(false);
        setDeleteId(null);
        // Joriy sahifani serverdan qayta yuklaymiz (jami son ham yangilanadi)
        loadStudents(page);
      }
    } catch (error) {
      alert(t("O'chirishda xatolik yuz berdi."));
      console.log(error);
    }
  };

  const cancelDelete = () => {
    setDeleteModal(false);
    setDeleteId(null);
  };

  const toggleGuruh = (id) => {
    setTempSelected(prev => prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]);
  };

  const filteredGuruhlar = allGroups?.filter(g =>
    (g.name || g.nomi || "").toLowerCase().includes(guruhQidiruv.toLowerCase())
  ) || [];

  const normalizePhone = (value) => {
    const digits = String(value || "").replace(/\D/g, "");
    if (!digits) return "";
    if (digits.startsWith("998") && digits.length === 12) return `+${digits}`;
    if (digits.length === 9) return `+998${digits}`;
    return value?.startsWith("+") ? `+${digits}` : digits;
  };

  const phoneForApi = (value) => {
    const digits = String(value || "").replace(/\D/g, "");
    if (digits.startsWith("998") && digits.length === 12) return digits.slice(3);
    if (digits.length >= 9) return digits.slice(-9);
    return digits;
  };

  // Pagination
  // Active: server-side (?page=&limit=) — qatorlar allaqachon kerakli sahifa.
  // Archive: client-side (hammasi yuklangan).
  const activeRows = users?.data || [];
  // total topilsa undan; topilmasa heuristika: sahifa to'la (10 ta) bo'lsa keyingisi bor deb hisoblaymiz
  const totalPages =
    view === "archive"
      ? Math.max(1, Math.ceil(archived.length / PER_PAGE))
      : total > 0
      ? Math.max(1, Math.ceil(total / PER_PAGE))
      : activeRows.length >= PER_PAGE
      ? page + 1
      : page;
  const safePage = Math.min(page, totalPages);
  const pagedRows =
    view === "archive"
      ? archived.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE)
      : activeRows;

  const create = async () => {
    try {
      const displayPhone = normalizePhone(tel);
      const cleanedPhone = phoneForApi(displayPhone);
      if (!/^\d{9}$/.test(cleanedPhone)) {
        alert(t("Telefon raqam +998XXXXXXXXX formatida bo'lishi kerak."));
        return;
      }
      const formData = new FormData();

      formData.append("full_name", fio);
      formData.append("email", email);
      formData.append("phone", cleanedPhone);
      if (parol && !editingStudent) {
        formData.append("password", parol);
      }
      if (rasm) {
        formData.append("photo", rasm);
      }
      formData.append("address", manzil);
      formData.append("birth_date", sana);

      // Faqat mavjud va aktiv guruh IDlarini jo'natamiz
      const validGroupIds = selectedGuruhlar
        .map(Number)
        .filter((id) => !isNaN(id) && id > 0 && allGroups.some((ag) => ag.id === id));

      validGroupIds.forEach((g) => {
        formData.append("groups", g);
      });

      let res;
      if (editingStudent) {
        if (parol) {
          formData.append("password", parol);
        }
        res = await fetchApi.patch(`students/${editingStudent.id}`, formData);
      } else {
        res = await fetchApi.post("students", formData);
      }

      if (res.status === 200 || res.status === 201) {
        if (editingStudent) {
          let updatedStudent = res.data?.data || res.data || {};

          // Populate group details from allGroups to ensure beautiful local rendering
          const finalGroups = (updatedStudent.groups || validGroupIds).map((g) => {
            const gid = g && typeof g === "object" ? g.id : g;
            const found = allGroups.find((ag) => ag.id === Number(gid));
            return found || (g && typeof g === "object" ? g : { id: Number(gid), name: `Guruh #${gid}` });
          });

          updatedStudent = {
            full_name: fio,
            email: email,
            phone: cleanedPhone,
            address: manzil,
            birth_date: sana,
            ...updatedStudent,
            groups: finalGroups
          };

          setUsers((prev) => {
            if (Array.isArray(prev)) {
              return prev.map((row) => (row.id === editingStudent.id ? { ...row, ...updatedStudent } : row));
            } else if (prev && prev.data) {
              return {
                ...prev,
                data: prev.data.map((row) => (row.id === editingStudent.id ? { ...row, ...updatedStudent } : row))
              };
            }
            return prev;
          });
          setDrawer(false);
          resetForm();
        } else {
          setDrawer(false);
          resetForm();
          // Yangi talaba qo'shilgach birinchi sahifaga o'tib, serverdan yangilaymiz
          if (page !== 1) setPage(1);
          else loadStudents(1);
        }
      }
    } catch (error) {
      const xato = error.response?.data?.message || error.response?.data?.error || t("Xatolik yuz berdi. Barcha maydonlarni tekshiring.");
      alert(xato);
      console.log(error.response?.data || error);
    }
  };


  const toggleSelectAll = () => {
    if (!users?.data) return;
    const allSelected = users.data.every(d => d.selected);
    setUsers({ ...users, data: users.data.map(d => ({ ...d, selected: !allSelected })) });
  };

  const toggleSelect = (id) => {
    if (!users?.data) return;
    setUsers({ ...users, data: users.data.map(d => d.id === id ? { ...d, selected: !d.selected } : d) });
  };

  return (
    <div style={{ padding: "10px 0" }}>
      <style>{`
        /* Drawer & Overlay styles */
        .oqit-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.3); z-index: 400; opacity: 0; pointer-events: none; transition: 0.3s; }
        .oqit-overlay.open { opacity: 1; pointer-events: all; }
        
        .oqit-drawer { position: fixed; right: 0; top: 0; height: 100vh; width: 420px; background: #fff; z-index: 500; transform: translateX(100%); transition: 0.3s cubic-bezier(0.4,0,0.2,1); box-shadow: -4px 0 24px rgba(0,0,0,0.1); display: flex; flex-direction: column; }
        .oqit-drawer.open { transform: translateX(0); }
        
        .oq-header { padding: 24px; border-bottom: 1px solid #f0f0f0; display: flex; justify-content: space-between; align-items: flex-start; }
        .oq-title { font-size: 20px; font-weight: 700; color: #222; margin: 0 0 6px 0; }
        .oq-subtitle { font-size: 13px; color: #666; margin: 0; line-height: 1.4; }
        .oq-close { background: none; border: none; font-size: 18px; color: #999; cursor: pointer; }
        
        .oq-body { flex: 1; overflow-y: auto; padding: 24px; }
        .oq-footer { padding: 16px 24px; border-top: 1px solid #f0f0f0; display: flex; justify-content: flex-end; gap: 12px; }
        
        .oq-label { display: block; font-size: 13px; font-weight: 600; color: #444; margin-bottom: 8px; }
        .oq-input { width: 100%; height: 44px; border-radius: 8px; border: 1.5px solid #e2e8f0; padding: 0 14px; font-size: 14px; outline: none; transition: border-color 0.15s; margin-bottom: 16px; background: #fff; box-sizing: border-box; }
        .oq-input:focus { border-color: #7c3aed; }
        
        /* Table styles */
        .oq-table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 16px; overflow: hidden; border: none; table-layout: fixed; }
        .oq-th { padding: 16px 12px; text-align: left; font-size: 13.5px; font-weight: 700; color: #1e293b; border-bottom: 1px solid #f1f5f9; white-space: nowrap; }
        .oq-td { padding: 12px; font-size: 14px; font-weight: 500; color: #1e293b; border-bottom: 1px solid #f1f5f9; vertical-align: middle; white-space: normal; word-break: break-word; overflow-wrap: anywhere; }
        .table-row { transition: background 0.15s; }
        .table-row:hover { background: #f8fafc; }
        
        /* Checkbox & badges */
        .custom-cb { width: 18px; height: 18px; border-radius: 5px; border: 1.5px solid #ccc; display: flex; align-items: center; justify-content: center; cursor: pointer; background: #fff; }
        .custom-cb.checked { background: #7c3aed; border-color: #7c3aed; color: #fff; font-size: 10px; }
        
        .badge { display: inline-flex; padding: 4px 8px; border-radius: 6px; border: 1px solid #eee; font-size: 12px; margin-right: 4px; color: #555; background: #f5f5f5; font-weight: 500; white-space: nowrap; }
        .badge-row { display: flex; align-items: center; gap: 6px; flex-wrap: nowrap; max-width: 100%; overflow-x: auto; padding-bottom: 4px; }
        .badge-row::-webkit-scrollbar { height: 6px; }
        .badge-row::-webkit-scrollbar-track { background: transparent; }
        .badge-row::-webkit-scrollbar-thumb { background: #ddd; border-radius: 3px; }

        .act-btn { width: 28px; height: 28px; border-radius: 6px; border: 1px solid transparent; background: transparent; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #888; transition: 0.15s; font-size: 13px; }
        .act-btn:hover { background: #f0f0f0; color: #222; }
        
        /* Top buttons */
        .top-btn { height: 40px; padding: 0 18px; border-radius: 10px; display: inline-flex; align-items: center; gap: 8px; font-size: 13.5px; font-weight: 600; cursor: pointer; transition: 0.15s; }
        .btn-outline { border: 1px solid #e5e7eb; background: #f9fafb; color: #4b5563; }
        .btn-outline:hover { background: #f3f4f6; }
        .btn-primary { border: none; background: #7c3aed; color: #fff; box-shadow: 0 10px 15px -3px rgba(124,58,237,0.2); }
        .btn-primary:hover { background: #6d28d9; }
        
        .drag-drop { border: 2px dashed #e2e8f0; border-radius: 10px; padding: 24px; text-align: center; cursor: pointer; margin-bottom: 16px; transition: 0.2s; }
        .drag-drop:hover { border-color: #7c3aed; background: #f8f7ff; }

        /* Modal Overlay & Modal */
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 600; opacity: 0; pointer-events: none; transition: 0.3s; display: flex; align-items: center; justify-content: center; }
        .modal-overlay.open { opacity: 1; pointer-events: all; }
        
        .oq-modal { background: #fff; width: 420px; max-height: 70vh; border-radius: 16px; box-shadow: 0 8px 30px rgba(0,0,0,0.15); display: flex; flex-direction: column; transform: scale(0.95); transition: 0.25s; padding: 24px; }
        .modal-overlay.open .oq-modal { transform: scale(1); }

        .modal-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
        .delete-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.45); z-index: 700; display: flex; align-items: center; justify-content: center; }
        .delete-modal { background: #fff; width: 360px; border-radius: 14px; box-shadow: 0 16px 40px rgba(0,0,0,0.18); padding: 24px; text-align: center; }
        .delete-title { font-size: 18px; font-weight: 700; color: #222; margin-bottom: 12px; }
        .delete-text { font-size: 14px; color: #555; margin-bottom: 24px; line-height: 1.6; }
        .delete-actions { display: flex; gap: 12px; justify-content: center; }
        .delete-btn { flex: 1; height: 42px; border-radius: 10px; font-weight: 700; cursor: pointer; border: none; }
        .delete-btn.cancel { background: #f4f4f4; color: #444; }
        .delete-btn.confirm { background: #e53935; color: #fff; }

        .modal-title { font-size: 18px; font-weight: 700; color: #222; margin: 0 0 4px 0; }
        .modal-subtitle { font-size: 13px; color: #666; margin: 0; }
        .modal-close { background: none; border: none; font-size: 16px; color: #999; cursor: pointer; }

        .guruh-btn {
          width: 100%; min-height: 46px; border-radius: 10px; border: 1.5px dashed #cbd5e1;
          background: #f8f9fc; display: flex; align-items: center; justify-content: center; gap: 8px;
          color: #7c3aed; font-weight: 600; font-size: 14px; cursor: pointer; margin-bottom: 8px;
        }
        .guruh-btn i { font-size: 16px; }
        .guruh-btn:hover { border-color: #7c3aed; background: rgba(124,58,237,0.06); }
        .guruh-btn.has-selection { border-style: solid; border-color: #7c3aed; background: rgba(124,58,237,0.06); }

        .guruh-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 16px; }
        .guruh-chip {
          display: inline-flex; align-items: center; gap: 6px; padding: 5px 10px; border-radius: 999px;
          background: rgba(124,58,237,0.1); color: #7c3aed; font-size: 13px; font-weight: 600;
        }
        .guruh-chip i { cursor: pointer; font-size: 11px; opacity: 0.7; }
        .guruh-chip i:hover { opacity: 1; }
      `}</style>

      {/* MODAL Overlay (Guruh qoshish) */}
      <div className={`modal-overlay ${modalOpen ? "open" : ""}`}>
        <div className="oq-modal bg-white">
          <div className="modal-header">
            <div>
              <h2 className="modal-title">{t("Guruhga biriktirish")}</h2>
              <p className="modal-subtitle">{t("Bir yoki bir nechta guruhni tanlang")}</p>
            </div>
            <button className="modal-close" onClick={() => setModalOpen(false)}><i className="fa-solid fa-xmark"></i></button>
          </div>
          <input
            className="oq-input"
            placeholder={t("Guruh qidirish...")}
            value={guruhQidiruv}
            onChange={e => setGuruhQidiruv(e.target.value)}
            style={{ marginBottom: 12, height: 40 }}
          />

          <div style={{ border: "1px solid #eee", borderRadius: 8, padding: 8, marginBottom: 20, maxHeight: 200, overflowY: "auto" }}>
            {filteredGuruhlar.map((g, i) => (
              <div key={g.id || i}>
                <label style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={tempSelected.includes(g.id)}
                    onChange={() => toggleGuruh(g.id)}
                    style={{ width: 16, height: 16 }}
                  />
                  <span style={{ fontSize: 14, color: "#222" }}>{g.name || g.nomi}</span>
                </label>
                {i < filteredGuruhlar.length - 1 && <div style={{ borderBottom: "1px solid #eee", margin: "0 8px" }}></div>}
              </div>
            ))}
            {filteredGuruhlar.length === 0 && (
              <div style={{ padding: 8, fontSize: 13, color: "#999", textAlign: "center" }}>{t("Guruh topilmadi")}</div>
            )}
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
            <button className="top-btn btn-outline" onClick={() => setModalOpen(false)}>{t("Bekor qilish")}</button>
            <button className="top-btn btn-primary" onClick={saveGuruhlar}>{t("Qo'shish")}</button>
          </div>
        </div>
      </div>

      {deleteModal && (
        <div className="delete-overlay" onClick={cancelDelete}>
          <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="delete-title">{t("Talabani o'chirish")}</h2>
            <p className="delete-text">{t("Siz ushbu talabani o'chirishga ishonchingiz komilmi? Bu amal qaytarib bo'lmaydi.")}</p>
            <div className="delete-actions">
              <button className="delete-btn cancel" onClick={cancelDelete}>{t("Bekor qilish")}</button>
              <button className="delete-btn confirm" onClick={handleDelete}>{t("O'chirish")}</button>
            </div>
          </div>
        </div>
      )}

      {/* Drawer Overlay */}
      <div className={`oqit-overlay ${drawerOpen ? "open" : ""}`} onClick={() => setDrawer(false)}></div>

      {/* Drawer */}
      <div className={`oqit-drawer ${drawerOpen ? "open" : ""}`}>
        <div className="oq-header">
          <div>
            <h2 className="oq-title">{editingStudent ? t("Talaba tahrirlash") : t("Talaba qo'shish")}</h2>
            <p className="oq-subtitle">{editingStudent ? t("Talaba ma'lumotlarini o'zgartiring va saqlang.") : t("Bu yerda siz yangi Talaba qo'shishingiz mumkin.")}</p>
          </div>
          <button className="oq-close" onClick={() => setDrawer(false)}><i className="fa-solid fa-xmark"></i></button>
        </div>
        <div className="oq-body">
          <label className="oq-label">{t("Telefon raqam")}</label>
          <input
            className="oq-input"
            type="tel"
            placeholder="+998901234567"
            value={tel}
            onChange={(e) => setTel(normalizePhone(e.target.value))}
          />

          <label className="oq-label">{t("Mail")}</label>
          <input className="oq-input" type="email" placeholder={t("Elektron pochtani kiriting")} value={email} onChange={e => setEmail(e.target.value)} />

          <label className="oq-label">{t("Talaba FIO")}</label>
          <input className="oq-input" placeholder={t("Ma'lumotni kiriting")} value={fio} onChange={e => setFio(e.target.value)} />

          <label className="oq-label">{t("Tug'ilgan sanasi")}</label>
          <div style={{ position: "relative" }}>
            <input type="date" className="oq-input" value={sana} onChange={e => setSana(e.target.value)} />
          </div>

          <label className="oq-label">{t("Manzil")}</label>
          <input className="oq-input" placeholder={t("Manzilni kiriting")} value={manzil} onChange={e => setManzil(e.target.value)} />

          <label className="oq-label">
            {editingStudent ? t("Parol (ixtiyoriy, faqat o'zgartirish uchun)") : t("Parol")}
          </label>
          <input
            className="oq-input"
            type="password"
            placeholder={editingStudent ? t("Yangi parol kiriting (ixtiyoriy)") : t("Parolni kiriting")}
            value={parol}
            onChange={e => setParol(e.target.value)}
          />

          <label className="oq-label">{t("Guruh")}</label>
          <button
            className={`guruh-btn ${selectedGuruhlar.length > 0 ? "has-selection" : ""}`}
            onClick={openGuruhModal}
          >
            <i className="fa-solid fa-plus"></i>
            {selectedGuruhlar.length > 0 ? `${selectedGuruhlar.length} ${t("ta guruh tanlandi")}` : t("Guruh qo'shish")}
          </button>
          {selectedGuruhlar.length > 0 && (
            <div className="guruh-chips">
              {selectedGuruhlar.map((id) => {
                const g = allGroups.find((gr) => gr.id === id);
                return (
                  <span key={id} className="guruh-chip">
                    {g?.name || g?.nomi || `#${id}`}
                    <i
                      className="fa-solid fa-xmark"
                      onClick={() =>
                        setSelectedGuruhlar((prev) => prev.filter((x) => x !== id))
                      }
                    ></i>
                  </span>
                );
              })}
            </div>
          )}

          <label className="oq-label">{t("Surati")}</label>
          <label className="drag-drop" style={{ display: "block" }}>
            <input
              type="file"
              accept="image/jpeg, image/png"
              style={{ display: "none" }}
              onChange={(e) => setRasm(e.target.files[0])}
            />
            {rasm ? (
              <div style={{ color: "#7c3aed", fontWeight: 600, fontSize: 14 }}>
                <i className="fa-solid fa-file-image" style={{ marginRight: 8 }}></i>
                {rasm.name}
              </div>
            ) : (
              <>
                <i className="fa-solid fa-cloud-arrow-up" style={{ fontSize: 28, color: "#aaa", marginBottom: 10 }}></i>
                <div style={{ fontSize: 13, color: "#7c3aed", fontWeight: 600 }}>{t("Click to upload")} <span style={{ color: "#888", fontWeight: 400 }}>{t("or drag and drop")}</span></div>
                <div style={{ fontSize: 12, color: "#aaa", marginTop: 4 }}>JPG, PNG (max. 5MB)</div>
              </>
            )}
          </label>
        </div>
        <div className="oq-footer">
          <button className="top-btn btn-outline" onClick={() => setDrawer(false)} style={{ flex: 1, justifyContent: "center" }}>{t("Bekor qilish")}</button>
          <button className="top-btn btn-primary" onClick={create} style={{ flex: 1, justifyContent: "center", background: "#7c3aed", color: "#fff", border: "none" }}>
            {editingStudent ? t("Yangilash") : t("Saqlash")}
          </button>
        </div>
      </div>

      {/* Page Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: "#1e293b", margin: 0 }}>{t("Talabalar")}</h1>
          <button className="top-btn btn-primary" onClick={openAddStudent} style={{ height: 44, borderRadius: 12, padding: "0 20px", fontSize: 14, fontWeight: 700 }}>
            <i className="fa-solid fa-plus"></i> {t("Talaba qo'shish")}
          </button>
        </div>
        <p style={{ fontSize: 14, color: "#94a3b8", margin: 0 }}>
          {t("Ushbu sahifada siz Talabalar ro'yxatini va ularning ma'lumotlarini topasiz. Har bir Talaba ismi, fanlari va aloqa ma'lumotlari keltirilgan.")}
        </p>
      </div>

      <div className="bg-white" style={{ border: "none", borderRadius: 16, padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
        {/* Table Toolbar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ position: "relative" }}>
            <i className="fa-solid fa-magnifying-glass" style={{ position: "absolute", left: 12, top: 12, color: "#999" }}></i>
            <input placeholder={t("Search")} style={{ height: 40, width: 280, borderRadius: 8, border: "1px solid #eee", paddingLeft: 36, outline: "none", fontSize: 14 }} />
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <button className="top-btn btn-outline">
              <i className="fa-solid fa-filter"></i> {t("Filters")}
            </button>
            <button
              className="top-btn btn-outline"
              onClick={() => { setView(view === "archive" ? "active" : "archive"); setPage(1); }}
              style={view === "archive" ? { background: "#7c3aed", color: "#fff", borderColor: "#7c3aed" } : { color: "#666" }}
            >
              <i className="fa-solid fa-box-archive"></i> {t("Arxiv")}
            </button>
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: "auto" }}>
          <table className="oq-table" style={{ border: "none" }}>
            <thead>
              <tr>
                <th className="oq-th" style={{ width: "4%", borderTop: "none" }}>
                  <div className={`custom-cb ${users?.data?.length > 0 && users.data.every(d => d.selected) ? "checked" : ""}`} onClick={toggleSelectAll}>
                    {users?.data?.length > 0 && users.data.every(d => d.selected) && <i className="fa-solid fa-check"></i>}
                  </div>
                </th>
                <th className="oq-th" style={{ width: "16%", borderTop: "none" }}>{t("Nomi")} <i className="fa-solid fa-arrow-down" style={{ fontSize: 10, marginLeft: 4 }}></i></th>
                <th className="oq-th" style={{ width: "12%", borderTop: "none" }}>{t("Guruh")}</th>
                <th className="oq-th" style={{ width: "12%", borderTop: "none" }}>{t("Telefon raqamlari")}</th>
                <th className="oq-th" style={{ width: "16%", borderTop: "none" }}>{t("Email")}</th>
                <th className="oq-th" style={{ width: "10%", borderTop: "none" }}>{t("Tug'ilgan sanasi")}</th>
                <th className="oq-th" style={{ width: "14%", borderTop: "none" }}>{t("Manzil")}</th>
                <th className="oq-th" style={{ width: "10%", borderTop: "none" }}>{t("Yaratilgan sana")}</th>
                <th className="oq-th" style={{ width: "6%", borderTop: "none", textAlign: "right" }}>{t("Amallar")}</th>
              </tr>
            </thead>
            <tbody>
              {view === "archive" && archiveLoading && (
                <tr>
                  <td className="oq-td" colSpan={9} style={{ textAlign: "center", color: "#888" }}>
                    {t("Arxiv yuklanmoqda...")}
                  </td>
                </tr>
              )}
              {view === "archive" && !archiveLoading && archived.length === 0 && (
                <tr>
                  <td className="oq-td" colSpan={9} style={{ textAlign: "center", color: "#888" }}>
                    {t("Arxivda talaba yo'q")}
                  </td>
                </tr>
              )}
              {pagedRows.map((row, index) => (
                <tr key={row.id || index} className="table-row">
                  <td className="oq-td">
                    {view === "archive" ? (
                      <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 6, background: "rgba(150,150,150,0.15)", color: "#888" }}>
                        {t("ARXIV")}
                      </span>
                    ) : (
                      <div className={`custom-cb ${row.selected ? "checked" : ""}`} onClick={() => toggleSelect(row.id)}>
                        {row.selected && <i className="fa-solid fa-check"></i>}
                      </div>
                    )}
                  </td>
                  <td className="oq-td">
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(124,58,237,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "#7c3aed", fontSize: 13, overflow: "hidden", flexShrink: 0, position: "relative" }}>
                        {(row.full_name || "?").trim().charAt(0).toUpperCase()}
                        {row.photo && (
                          <img
                            src={`https://najot-edu.softwareengineer.uz/files/${row.photo}`}
                            alt=""
                            onError={(e) => { e.currentTarget.style.display = "none"; }}
                            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        )}
                      </div>
                      <span style={{ fontWeight: 600 }}>{row.full_name}</span>
                    </div>
                  </td>
                  <td className="oq-td">
                    <div className="badge-row">
                      {(row.groups || []).map((g, idx) => <span key={idx} className="badge">{g.name || g.nomi || g}</span>)}
                    </div>
                  </td>
                  <td className="oq-td">{row.phone}</td>
                  <td className="oq-td">{row.email}</td>
                  <td className="oq-td">{row.birth_date ? new Date(row.birth_date).toLocaleDateString("en-GB") : ""}</td>
                  <td className="oq-td">{row.address}</td>
                  <td className="oq-td">{row.created_at ? new Date(row.created_at).toLocaleDateString("en-GB") : ""}</td>
                  <td className="oq-td">
                    {view === "archive" ? (
                      <div style={{ textAlign: "right", color: "#bbb" }}>—</div>
                    ) : (
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 4 }}>
                        <button className="act-btn" onClick={() => openEditStudent(row)}><i className="fa-solid fa-pen"></i></button>
                        <button className="act-btn" onClick={() => confirmDelete(row.id)}><i className="fa-regular fa-trash-can"></i></button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 20, paddingTop: 16, borderTop: "1px solid #eee" }}>
          <button
            className="top-btn btn-outline"
            style={{ color: "#666", border: "none", cursor: safePage > 1 ? "pointer" : "not-allowed", opacity: safePage > 1 ? 1 : 0.5 }}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={safePage <= 1}
          ><i className="fa-solid fa-arrow-left"></i> {t("Previous")}</button>
          <div style={{ display: "flex", gap: 8 }}>
            {getPageNumbers(safePage, totalPages).map((p, i) => (
              <button
                key={i}
                onClick={() => typeof p === "number" && setPage(p)}
                style={{ width: 32, height: 32, borderRadius: 8, border: "none", background: p === safePage ? "rgba(124,58,237,0.1)" : "transparent", color: p === safePage ? "#7c3aed" : "#666", fontWeight: p === safePage ? 700 : 500, cursor: p !== "..." ? "pointer" : "default" }}
              >
                {p}
              </button>
            ))}
          </div>
          <button
            className="top-btn btn-outline"
            style={{ color: "#666", border: "none", cursor: safePage < totalPages ? "pointer" : "not-allowed", opacity: safePage < totalPages ? 1 : 0.5 }}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage >= totalPages}
          >{t("Next")} <i className="fa-solid fa-arrow-right"></i></button>
        </div>
      </div>
    </div>
  );
}
