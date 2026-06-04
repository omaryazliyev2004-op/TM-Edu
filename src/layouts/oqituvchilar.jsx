import { useState, useEffect } from "react";
import { fetchApi } from "../api/user.api";
import { useLang } from "../i18n/LanguageContext";

const PER_PAGE = 10;

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

export default function Oqituvchilar() {

  const { t } = useLang();

  const [users, setUsers] = useState([]);
  const [allGroups, setAllGroups] = useState([]);
  const [view, setView] = useState("active"); // "active" | "archive"
  const [archived, setArchived] = useState([]);
  const [archiveLoading, setArchiveLoading] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    async function datas() {
      try {
        const data = await fetchApi(`teachers`);
        if (data.status === 200) {
          setUsers(data.data);

        }
        const gData = await fetchApi(`groups/all`);
        if (gData.status === 200) {
          setAllGroups(gData.data?.data || gData.data || []);
        }
      } catch (error) {
        console.log(error);
      }
    }
    datas();
  }, []);

  // Arxivlangan o'qituvchilar — GET /api/v1/teachers/archive
  useEffect(() => {
    if (view !== "archive") return;
    async function loadArchive() {
      setArchiveLoading(true);
      try {
        const res = await fetchApi(`teachers/archive`);
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



  const [drawerOpen, setDrawer] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [editingTeacher, setEditingTeacher] = useState(null);

  // Drawer fields
  const [tel, setTel] = useState("+998");
  const [email, setEmail] = useState("");
  const [fio, setFio] = useState("");
  const [manzil, setManzil] = useState("");
  const [parol, setParol] = useState("");
  const [rasm, setRasm] = useState(null);

  const resetForm = () => {
    setTel("+998");
    setEmail("");
    setFio("");
    setManzil("");
    setParol("");
    setRasm(null);
    setSelectedGuruhlar([]);
    setTempSelected([]);
    setEditingTeacher(null);
  };

  const openAddTeacher = () => {
    resetForm();
    setDrawer(true);
  };

  const openEditTeacher = (teacher) => {
    setEditingTeacher(teacher);
    setTel(teacher.phone || "+998");
    setEmail(teacher.email || "");
    setFio(teacher.full_name || "");
    setManzil(teacher.address || "");
    setParol("");
    setRasm(null);
    
    // Extract and filter valid active group IDs that exist in allGroups
    const activeGroupIds = (teacher.groups || [])
      .map((g) => (g && typeof g === "object" ? g.id : g))
      .map(Number)
      .filter((id) => !isNaN(id) && id > 0 && allGroups.some((ag) => ag.id === id));
      
    setSelectedGuruhlar(activeGroupIds);
    setTempSelected(activeGroupIds);
    setDrawer(true);
  };



  const create = async () => {
    try {
      const cleanedPhone = tel.replace(/[^0-9+]/g, "");
      const formData = new FormData();

      formData.append("full_name", fio);
      formData.append("email", email);
      if (parol && !editingTeacher) {
        formData.append("password", parol);
      }
      formData.append("phone", cleanedPhone);
      if (rasm) {
        formData.append("photo", rasm);
      }
      formData.append("address", manzil);

      // Filter selectedGuruhlar to only send valid active group IDs
      const validGroupIds = selectedGuruhlar
        .map(Number)
        .filter((id) => !isNaN(id) && id > 0 && allGroups.some((ag) => ag.id === id));

      validGroupIds.forEach((g) => {
        formData.append("groups[]", g);
      });

      let res;
      if (editingTeacher) {
        const payload = {
          full_name: fio,
          email: email,
          phone: cleanedPhone,
          address: manzil,
          groups: validGroupIds
        };
        if (parol) {
          payload.password = parol;
        }
        res = await fetchApi.patch(`teachers/${editingTeacher.id}`, payload);
      } else {
        res = await fetchApi.post("teachers", formData);
      }

      if (res.status === 200 || res.status === 201) {
        if (editingTeacher) {
          let updatedTeacher = res.data?.data || res.data || {};
          
          // Populate group details from allGroups to ensure beautiful local rendering
          const finalGroups = (updatedTeacher.groups || validGroupIds).map((g) => {
            const gid = g && typeof g === "object" ? g.id : g;
            const found = allGroups.find((ag) => ag.id === Number(gid));
            return found || (g && typeof g === "object" ? g : { id: Number(gid), name: `${t("Guruh")} #${gid}` });
          });
          
          updatedTeacher = {
            full_name: fio,
            email: email,
            phone: cleanedPhone,
            address: manzil,
            ...updatedTeacher,
            groups: finalGroups
          };

          setUsers((prev) => {
            if (Array.isArray(prev)) {
              return prev.map((row) => (row.id === editingTeacher.id ? { ...row, ...updatedTeacher } : row));
            } else if (prev && prev.data) {
              return {
                ...prev,
                data: prev.data.map((row) => (row.id === editingTeacher.id ? { ...row, ...updatedTeacher } : row))
              };
            }
            return prev;
          });
          setDrawer(false);
          resetForm();
        } else {
          setDrawer(false);
          resetForm();
          // Butun sahifani qayta yuklamasdan faqat o'qituvchilar ro'yxatini yangilaymiz
          const refreshed = await fetchApi(`teachers`);
          if (refreshed.status === 200) setUsers(refreshed.data);
        }
      }
    } catch (error) {
      const xato = error.response?.data?.message || error.response?.data?.error || t("Xatolik yuz berdi. Iltimos barcha ma'lumotlarni to'ldiring.");
      alert(xato);
      console.log(error);
    }
  };

  // Guruh modal
  const [selectedGuruhlar, setSelectedGuruhlar] = useState([]);
  const [guruhQidiruv, setGuruhQidiruv] = useState("");
  const [tempSelected, setTempSelected] = useState([]);

  const toggleSelectAll = () => {
    if (!users?.data) return;
    const allSelected = users.data.every(d => d.selected);
    setUsers({ ...users, data: users.data.map(d => ({ ...d, selected: !allSelected })) });
  };

  const toggleSelect = (id) => {
    if (!users?.data) return;
    setUsers({ ...users, data: users.data.map(d => d.id === id ? { ...d, selected: !d.selected } : d) });
  };

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
      const res = await fetchApi.delete(`teachers/${deleteId}`);
      if (res.status === 200 || res.status === 201) {
        if (users?.data) {
          setUsers({ ...users, data: users.data.filter(d => d.id !== deleteId) });
        } else if (Array.isArray(users)) {
          setUsers(users.filter(d => d.id !== deleteId));
        }
        setDeleteModalOpen(false);
        setDeleteId(null);
      }
    } catch (error) {
      alert(t("Xatolik yuz berdi. O'qituvchini o'chirib bo'lmadi."));
      console.log(error);
    }
  };

  const openGuruhModal = () => {
    setTempSelected([...selectedGuruhlar]);
    setGuruhQidiruv("");
    setModalOpen(true);
  };
  const saveGuruhlar = () => {
    setSelectedGuruhlar([...tempSelected]);
    setModalOpen(false);
  };
  const toggleGuruh = (id) => {
    setTempSelected(prev =>
      prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]
    );
  };

  const filteredGuruhlar = allGroups?.filter(g =>
    (g.name || g.nomi || "").toLowerCase().includes(guruhQidiruv.toLowerCase())
  ) || [];

  // Pagination
  const sourceList = view === "archive" ? archived : (users?.data || []);
  const totalPages = Math.max(1, Math.ceil(sourceList.length / PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const pagedRows = sourceList.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  return (
    <div style={{ padding: "10px 0" }}>
      <style>{`
        .oqit-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.3); z-index: 400; opacity: 0; pointer-events: none; transition: 0.3s; }
        .oqit-overlay.open { opacity: 1; pointer-events: all; }

        .oqit-drawer { position: fixed; right: 0; top: 0; height: 100vh; width: 420px; background: #fff; z-index: 500; transform: translateX(100%); transition: 0.3s cubic-bezier(0.4,0,0.2,1); box-shadow: -4px 0 24px rgba(0,0,0,0.1); display: flex; flex-direction: column; }
        .oqit-drawer.open { transform: translateX(0); }

        .oq-header { padding: 24px; border-bottom: 1px solid #f0f0f0; display: flex; justify-content: space-between; align-items: flex-start; }
        .oq-title { font-size: 20px; font-weight: 700; color: #222; margin: 0 0 6px 0; }
        .oq-subtitle { font-size: 13px; color: #666; margin: 0; line-height: 1.4; }
        .oq-close { background: none; border: none; font-size: 18px; color: #999; cursor: pointer; }

        .oq-body { flex: 1; overflow-y: auto; padding: 24px; }
        .oq-footer { padding: 16px 24px; border-top: 1px solid #f0f0f0; display: flex; gap: 12px; }

        .oq-label { display: block; font-size: 13px; font-weight: 600; color: #444; margin-bottom: 8px; }
        .oq-input { width: 100%; height: 44px; border-radius: 8px; border: 1.5px solid #e2e8f0; padding: 0 14px; font-size: 14px; outline: none; transition: border-color 0.15s; margin-bottom: 16px; background: #fff; box-sizing: border-box; }
        .oq-input:focus { border-color: #765bcf; }

        .oq-table { width: 100%; border-collapse: collapse; }
        .oq-th { padding: 12px 16px; text-align: left; font-size: 13px; font-weight: 600; color: #888; border-bottom: 1px solid #eee; white-space: nowrap; }
        .oq-td { padding: 14px 16px; font-size: 13px; color: #444; border-bottom: 1px solid #f5f5f5; vertical-align: middle; white-space: nowrap; }
        .table-row { transition: background 0.15s; }
        .table-row:hover { background: #fafafa; }

        .custom-cb { width: 18px; height: 18px; border-radius: 5px; border: 1.5px solid #ccc; display: flex; align-items: center; justify-content: center; cursor: pointer; background: #fff; flex-shrink: 0; }
        .custom-cb.checked { background: #765bcf; border-color: #765bcf; color: #fff; font-size: 10px; }

        .badge { display: inline-flex; padding: 3px 8px; border-radius: 6px; border: 1px solid #eee; font-size: 12px; margin-right: 4px; color: #555; background: #f5f5f5; font-weight: 500; white-space: nowrap; }
        .badge-row { display: flex; align-items: center; gap: 6px; overflow-x: auto; max-width: 260px; min-width: 0; padding-bottom: 2px; }
        .badge-row::-webkit-scrollbar { height: 6px; }
        .badge-row::-webkit-scrollbar-track { background: transparent; }
        .badge-row::-webkit-scrollbar-thumb { background: #ddd; border-radius: 3px; }
        .oq-td.group-cell { max-width: 260px; min-width: 0; }

        .act-btn { width: 28px; height: 28px; border-radius: 6px; border: 1px solid transparent; background: transparent; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #888; transition: 0.15s; font-size: 13px; }
        .act-btn:hover { background: #f0f0f0; color: #333; }
        .act-btn.red:hover { background: #ffebee; color: #e53935; }

        .top-btn { height: 38px; padding: 0 16px; border-radius: 8px; display: inline-flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 600; cursor: pointer; transition: 0.15s; }
        .btn-outline { border: 1px solid #e0e0e0; background: #fff; color: #444; }
        .btn-outline:hover { background: #f5f5f5; }
        .btn-primary { border: none; background: #765bcf; color: #fff; }
        .btn-primary:hover { background: #5e48a8; }

        .drag-drop { border: 2px dashed #e2e8f0; border-radius: 10px; padding: 24px; text-align: center; cursor: pointer; margin-bottom: 16px; transition: 0.2s; }
        .drag-drop:hover { border-color: #765bcf; background: #f8f7ff; }

        /* ── Guruh modal ── */
        .oq-modal-wrap { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 700; display: flex; align-items: center; justify-content: center; opacity: 0; pointer-events: none; transition: 0.25s; }
        .oq-modal-wrap.open { opacity: 1; pointer-events: all; }
        .oq-modal { background: #fff; width: 400px; max-height: 70vh; border-radius: 12px; box-shadow: 0 8px 30px rgba(0,0,0,0.15); display: flex; flex-direction: column; transform: scale(0.95); transition: 0.25s; }
        .oq-modal-wrap.open .oq-modal { transform: scale(1); }
        .oq-modal-header { padding: 20px 24px 14px; border-bottom: 1px solid #f0f0f0; display: flex; justify-content: space-between; align-items: flex-start; }
        .oq-modal-title { font-size: 16px; font-weight: 700; color: #222; margin: 0 0 4px; }
        .oq-modal-sub { font-size: 12px; color: #888; margin: 0; }
        .oq-modal-body { flex: 1; overflow-y: auto; padding: 16px 24px; }
        .oq-modal-footer { padding: 14px 24px; border-top: 1px solid #f0f0f0; display: flex; justify-content: flex-end; gap: 10px; }
        .oq-modal-row { display: flex; align-items: center; gap: 10px; padding: 10px 0; border-bottom: 1px solid #f5f5f5; cursor: pointer; }
        .oq-modal-row:last-child { border-bottom: none; }

        /* ── O'qituvchi o'chirish modali ── */
        .teacher-del-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.4);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.2s ease-out;
        }
        .teacher-del-overlay.open {
          opacity: 1;
          pointer-events: all;
        }
        .teacher-del-modal {
          background: #fff;
          border-radius: 24px;
          padding: 40px 36px 36px;
          width: 440px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15);
          text-align: center;
          transform: scale(0.95);
          transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .teacher-del-overlay.open .teacher-del-modal {
          transform: scale(1);
        }
        .teacher-del-title {
          font-size: 22px;
          font-weight: 700;
          color: #1f2937;
          margin: 0 0 16px;
        }
        .teacher-del-text {
          font-size: 15px;
          color: #4b5563;
          margin: 0 0 32px;
          line-height: 1.6;
        }
        .teacher-del-btns {
          display: flex;
          gap: 16px;
          justify-content: center;
        }
        .teacher-del-btn-cancel {
          flex: 1;
          height: 48px;
          border-radius: 12px;
          border: none;
          background: #f3f4f6;
          font-size: 16px;
          font-weight: 700;
          color: #374151;
          cursor: pointer;
          transition: background 0.15s;
        }
        .teacher-del-btn-cancel:hover {
          background: #e5e7eb;
        }
        .teacher-del-btn-confirm {
          flex: 1;
          height: 48px;
          border-radius: 12px;
          border: none;
          background: #ef4444;
          font-size: 16px;
          font-weight: 700;
          color: #fff;
          cursor: pointer;
          transition: background 0.15s;
        }
        .teacher-del-btn-confirm:hover {
          background: #dc2626;
        }
      `}</style>

      {/* ── Guruh tanlash modali ── */}
      <div className={`oq-modal-wrap ${modalOpen ? "open" : ""}`}>
        <div className="oq-modal">
          <div className="oq-modal-header">
            <div>
              <p className="oq-modal-title">{t("Guruhga biriktirish")}</p>
              <p className="oq-modal-sub">{t("Bir yoki bir nechta guruhni tanlang")}</p>
            </div>
            <button className="oq-close" onClick={() => setModalOpen(false)}><i className="fa-solid fa-xmark"></i></button>
          </div>
          <div className="oq-modal-body">
            <input
              className="oq-input"
              placeholder={t("Guruh qidirish...")}
              value={guruhQidiruv}
              onChange={e => setGuruhQidiruv(e.target.value)}
              style={{ marginBottom: 8 }}
            />
            {filteredGuruhlar.map(g => (
              <div key={g.id} className="oq-modal-row" onClick={() => toggleGuruh(g.id)}>
                <div className={`custom-cb ${tempSelected.includes(g.id) ? "checked" : ""}`}>
                  {tempSelected.includes(g.id) && <i className="fa-solid fa-check"></i>}
                </div>
                <span style={{ fontSize: 14, color: "#222" }}>{g.name || g.nomi}</span>
              </div>
            ))}
          </div>
          <div className="oq-modal-footer">
            <button className="top-btn btn-outline" style={{ padding: "0 20px" }} onClick={() => setModalOpen(false)}>{t("Bekor qilish")}</button>
            <button className="top-btn btn-primary" style={{ padding: "0 20px" }} onClick={saveGuruhlar}>{t("Qo'shish")}</button>
          </div>
        </div>
      </div>

      {/* ── O'qituvchini o'chirish tasdiqlash modali ── */}
      <div className={`teacher-del-overlay ${deleteModalOpen ? "open" : ""}`} onClick={cancelDelete}>
        <div className="teacher-del-modal" onClick={(e) => e.stopPropagation()}>
          <h3 className="teacher-del-title">{t("O'qituvchini o'chirish")}</h3>
          <p className="teacher-del-text">
            {t("Siz ushbu o'qituvchini o'chirishga ishonchingiz komilmi? Bu amal qaytarib bo'lmaydi.")}
          </p>
          <div className="teacher-del-btns">
            <button className="teacher-del-btn-cancel" onClick={cancelDelete}>
              {t("Bekor qilish")}
            </button>
            <button className="teacher-del-btn-confirm" onClick={handleDelete}>
              {t("O'chirish")}
            </button>
          </div>
        </div>
      </div>

      {/* Drawer Overlay */}
      <div className={`oqit-overlay ${drawerOpen ? "open" : ""}`} onClick={() => setDrawer(false)} />

      {/* Drawer */}
      <div className={`oqit-drawer ${drawerOpen ? "open" : ""}`}>
        <div className="oq-header">
          <div>
            <h2 className="oq-title">{editingTeacher ? t("O'qituvchi tahrirlash") : t("O'qituvchi qo'shish")}</h2>
            <p className="oq-subtitle">{editingTeacher ? t("O'qituvchi ma'lumotlarini o'zgartiring va saqlang.") : t("Bu yerda siz yangi o'qituvchi qo'shishingiz mumkin.")}</p>
          </div>
          <button className="oq-close" onClick={() => setDrawer(false)}><i className="fa-solid fa-xmark"></i></button>
        </div>
        <div className="oq-body">
          <label className="oq-label">{t("Telefon raqam")}</label>
          <input className="oq-input" value={tel} onChange={e => setTel(e.target.value)} />

          <label className="oq-label">{t("Mail")}</label>
          <input className="oq-input" placeholder={t("Elektron pochtani kiriting")} value={email} onChange={e => setEmail(e.target.value)} />

          <label className="oq-label">{t("O'qituvchi FIO")}</label>
          <input className="oq-input" placeholder={t("Ma'lumotni kiriting")} value={fio} onChange={e => setFio(e.target.value)} />

          <label className="oq-label">{t("Manzil")}</label>
          <input className="oq-input" placeholder={t("Manzilni kiriting")} value={manzil} onChange={e => setManzil(e.target.value)} />

          <label className="oq-label">
            {editingTeacher ? t("Parol (ixtiyoriy, faqat o'zgartirish uchun)") : t("Parol")}
          </label>
          <input
            className="oq-input"
            placeholder={editingTeacher ? t("Yangi parol kiriting (ixtiyoriy)") : t("Parolni kiriting")}
            type="password"
            value={parol}
            onChange={(e) => setParol(e.target.value)}
          />

          <label className="oq-label">{t("Guruh")}</label>
          {selectedGuruhlar.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
              {selectedGuruhlar.map(id => {
                const g = allGroups.find(gl => gl.id === id);
                return g ? (
                  <span key={id} style={{ background: "rgba(118,91,207,0.1)", color: "#765bcf", borderRadius: 6, padding: "3px 10px", fontSize: 13, fontWeight: 600 }}>
                    {g.name || g.nomi}
                  </span>
                ) : null;
              })}
            </div>
          )}
          <button
            onClick={openGuruhModal}
            style={{
              width: "100%", height: 48, borderRadius: 8,
              border: "1.5px solid #e2e8f0", background: "#fff",
              display: "flex", alignItems: "center", gap: 10,
              paddingLeft: 16, cursor: "pointer", marginBottom: 16,
              color: "#765bcf", fontWeight: 600, fontSize: 15
            }}
          >
            <i className="fa-solid fa-plus"></i> {selectedGuruhlar.length > 0 ? `${selectedGuruhlar.length} ${t("ta guruh tanlandi")}` : t("Qo'shish")}
          </button>

          <label className="oq-label">{t("Surati")}</label>
          <label className="drag-drop" style={{ display: "block" }}>
            <input
              type="file"
              accept="image/jpeg, image/png"
              style={{ display: "none" }}
              onChange={(e) => setRasm(e.target.files[0])}
            />
            {rasm ? (
              <div style={{ color: "#765bcf", fontWeight: 600, fontSize: 14 }}>
                <i className="fa-solid fa-file-image" style={{ marginRight: 8 }}></i>
                {rasm.name}
              </div>
            ) : (
              <>
                <i className="fa-solid fa-cloud" style={{ fontSize: 28, color: "#aaa", marginBottom: 10 }}></i>
                <div style={{ fontSize: 13 }}>
                  <span style={{ color: "#765bcf", fontWeight: 600, cursor: "pointer" }}>Click to upload</span>
                  <span style={{ color: "#888" }}> or drag and drop</span>
                </div>
                <div style={{ fontSize: 12, color: "#aaa", marginTop: 4 }}>JPG or PNG (max. 800x800px)</div>
              </>
            )}
          </label>
        </div>
        <div className="oq-footer">
          <button
            onClick={() => setDrawer(false)}
            style={{
              flex: 1, height: 44, borderRadius: 10,
              border: "1px solid #e0e0e0", background: "#fff",
              color: "#444", fontSize: 14, fontWeight: 600, cursor: "pointer"
            }}
          >
            {t("Bekor qilish")}
          </button>
          <button
            onClick={create}
            style={{
              flex: 1, height: 44, borderRadius: 10,
              border: "none", background: "#765bcf",
              color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer"
            }}
          >
            {editingTeacher ? t("Yangilash") : t("Saqlash")}
          </button>
        </div>
      </div>

      {/* Page Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#222", margin: 0 }}>{t("O'qituvchilar")}</h1>
        <button
          className="top-btn btn-primary"
          onClick={openAddTeacher}
          style={{ height: 36, fontSize: 13 }}
        >
          <i className="fa-solid fa-plus" style={{ fontSize: 12 }}></i> {t("O'qituvchi qo'shish")}
        </button>
      </div>
      <p style={{ fontSize: 13, color: "#666", margin: "0 0 20px 0" }}>
        {t("Ushbu sahifada siz o'qituvchilar ro'yxatini va ularning ma'lumotlarini topasiz. Har bir o'qituvchining ismi, fanlari va aloqa ma'lumotlari keltirilgan.")}
      </p>

      {/* Table Card */}
      <div className="bg-white" style={{ border: "1px solid #eee", borderRadius: 12, overflow: "hidden" }}>
        {/* Toolbar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderBottom: "1px solid #f0f0f0" }}>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="top-btn btn-outline">
              <i className="fa-solid fa-filter" style={{ fontSize: 12 }}></i> {t("Filters")}
            </button>
            <button
              className="top-btn btn-outline"
              onClick={() => { setView(view === "archive" ? "active" : "archive"); setPage(1); }}
              style={view === "archive" ? { background: "#765bcf", color: "#fff", borderColor: "#765bcf" } : undefined}
            >
              <i className="fa-solid fa-box-archive" style={{ fontSize: 12 }}></i> {t("Arxiv")}
            </button>
          </div>
          <div style={{ position: "relative" }}>
            <i className="fa-solid fa-magnifying-glass" style={{ position: "absolute", left: 12, top: 12, color: "#bbb", fontSize: 13 }}></i>
            <input
              placeholder={t("Search")}
              style={{
                height: 38, width: 220, borderRadius: 8, border: "1px solid #eee",
                paddingLeft: 36, outline: "none", fontSize: 14, background: "#fafafa"
              }}
            />
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: "auto" }}>
          <table className="oq-table">
            <thead>
              <tr>
                <th className="oq-th" style={{ width: 40 }}>
                  <div className={`custom-cb ${users?.data?.length > 0 && users.data.every(d => d.selected) ? "checked" : ""}`} onClick={toggleSelectAll}>
                    {users?.data?.length > 0 && users.data.every(d => d.selected) && <i className="fa-solid fa-check"></i>}
                  </div>
                </th>
                <th className="oq-th">{t("Nomi")} <i className="fa-solid fa-arrow-down" style={{ fontSize: 10, marginLeft: 2 }}></i></th>
                <th className="oq-th">{t("Guruh")}</th>
                <th className="oq-th">{t("Telefon raqamlari")}</th>
                <th className="oq-th">{t("Email")}</th>
                <th className="oq-th">{t("Manzil")}</th>
                <th className="oq-th">{t("Yaratilgan sana")}</th>
                <th className="oq-th" style={{ textAlign: "right" }}>{t("Amallar")}</th>
              </tr>
            </thead>
            <tbody>
              {view === "archive" && archiveLoading && (
                <tr>
                  <td className="oq-td" colSpan={8} style={{ textAlign: "center", color: "#888" }}>
                    {t("Arxiv yuklanmoqda...")}
                  </td>
                </tr>
              )}
              {view === "archive" && !archiveLoading && archived.length === 0 && (
                <tr>
                  <td className="oq-td" colSpan={8} style={{ textAlign: "center", color: "#888" }}>
                    {t("Arxivda o'qituvchi yo'q")}
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
                      <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(118,91,207,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "#765bcf", fontSize: 13, overflow: "hidden", flexShrink: 0, position: "relative" }}>
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
                      <span style={{ fontWeight: 600, color: "#222" }}>{row.full_name || t("Ism yo'q")}</span>
                    </div>
                  </td>
                  <td className="oq-td group-cell">
                    <div className="badge-row">
                      {(row.groups || []).map((g, i) => <span key={i} className="badge">{g.name || g.nomi || g}</span>)}
                    </div>
                  </td>
                  <td className="oq-td">{row.phone || t("Yo'q")}</td>
                  <td className="oq-td">{row.email || t("Yo'q")}</td>
                  <td className="oq-td">{row.address || t("Yo'q")}</td>
                  <td className="oq-td">{row.created_at ? new Date(row.created_at).toLocaleDateString("ru-RU") : t("Yo'q")}</td>
                  <td className="oq-td">
                    {view === "archive" ? (
                      <div style={{ textAlign: "right", color: "#bbb" }}>—</div>
                    ) : (
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: 4 }}>
                        <button className="act-btn"><i className="fa-regular fa-eye"></i></button>
                        <button className="act-btn red" onClick={() => confirmDelete(row.id)}><i className="fa-regular fa-trash-can"></i></button>
                        <button className="act-btn" onClick={() => openEditTeacher(row)}><i className="fa-solid fa-pen"></i></button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderTop: "1px solid #f0f0f0" }}>
          <button
            className="top-btn btn-outline"
            style={{ border: "none", color: "#666", cursor: safePage > 1 ? "pointer" : "not-allowed", opacity: safePage > 1 ? 1 : 0.5 }}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={safePage <= 1}
          >
            <i className="fa-solid fa-arrow-left"></i> {t("Previous")}
          </button>
          <div style={{ display: "flex", gap: 6 }}>
            {getPageNumbers(safePage, totalPages).map((p, i) => (
              <button
                key={i}
                onClick={() => typeof p === "number" && setPage(p)}
                style={{
                  width: 32, height: 32, borderRadius: 8, border: "none",
                  background: p === safePage ? "#765bcf" : "transparent",
                  color: p === safePage ? "#fff" : "#666",
                  fontWeight: p === safePage ? 700 : 400,
                  cursor: p !== "..." ? "pointer" : "default",
                  fontSize: 14
                }}
              >{p}</button>
            ))}
          </div>
          <button
            className="top-btn btn-outline"
            style={{ border: "none", color: "#666", cursor: safePage < totalPages ? "pointer" : "not-allowed", opacity: safePage < totalPages ? 1 : 0.5 }}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage >= totalPages}
          >
            {t("Next")} <i className="fa-solid fa-arrow-right"></i>
          </button>
        </div>
      </div>
    </div>
  );
}
