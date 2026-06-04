import { useEffect, useState } from "react";
import { fetchApi } from "../api/user.api";
import { useLang } from "../i18n/LanguageContext";

export function Xonalar() {
  const { t } = useLang();
  const [users, setUsers] = useState([]);
  const [view, setView] = useState("active"); // "active" | "archive"
  const [archived, setArchived] = useState([]);
  const [archiveLoading, setArchiveLoading] = useState(false);

  useEffect(() => {
    async function datas() {
      try {
        const data = await fetchApi(`rooms`);
        if (data.status === 200) {
          setUsers(data.data);
        }
      } catch (error) {
        console.log(error);
      }
    }
    datas();
  }, []);

  // Arxivlangan xonalar — GET /api/v1/rooms/arxive
  useEffect(() => {
    if (view !== "archive") return;
    async function loadArchive() {
      setArchiveLoading(true);
      try {
        const res = await fetchApi(`rooms/arxive`);
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
  const [editRoom, setEditRoom] = useState(null); 
  const [nom, setNom] = useState("");
  const [sigim, setSigim] = useState(0);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const handleRoom = async (e) => {
    e?.preventDefault?.();
    try {
      if (editRoom) {
        const res = await fetchApi.patch(`rooms/${editRoom.id}`, {
          name: nom,
          capacity: Number(sigim),
        });
        if (res.status === 200 || res.status === 201) {
          setUsers((prev) => ({
            ...prev,
            data: prev?.data?.map((room) =>
              room.id === editRoom.id
                ? { ...room, name: nom, capacity: Number(sigim) }
                : room,
            ),
          }));
          closeDrawer();
        }
      } else {
        const res = await fetchApi.post("rooms", {
          name: nom,
          capacity: Number(sigim),
        });
        if (res.status === 200 || res.status === 201) {
          setDrawer(false);
          setNom("");
          setSigim(0);
          // Butun sahifani qayta yuklamasdan faqat xonalar ro'yxatini yangilaymiz
          const r = await fetchApi(`rooms`);
          if (r.status === 200) setUsers(r.data);
        }
      }
    } catch (error) {
      alert(t("Xatolik yuz berdi. Iltimos barcha ma'lumotlarni to'ldiring."));
      console.log(error);
    }
  };

  function openAdd() {
    setEditRoom(null);
    setNom("");
    setSigim("");
    setDrawer(true);
  }
  function openEdit(room) {
    setEditRoom(room);
    setNom(room.name || "");
    setSigim(room.capacity || 0);
    setDrawer(true);
  }

  function closeDrawer() {
    setDrawer(false);
    setNom("");
    setSigim("");
    setEditRoom(null);
  }
  const confirmDelete = (id) => {
    setDeleteId(id);
    setDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetchApi.delete(`rooms/${deleteId}`);
      if (res.status === 200 || res.status === 201) {
        setUsers((prev) => ({
          ...prev,
          data: prev?.data?.filter((room) => room.id !== deleteId),
        }));
        setDeleteModal(false);
        setDeleteId(null);
      }
    } catch (error) {
      alert(t("Xatolik yuz berdi."));
      console.log(error);
    }
  };

  const cancelDelete = () => {
    setDeleteModal(false);
    setDeleteId(null);
  };

  return (
    <>
      <style>{`
        /* ── Overlay ── */
        .xona-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.18);
          z-index: 400;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.28s;
        }
        .xona-overlay.show { opacity: 1; pointer-events: all; }

        /* ── Right drawer ── */
        .xona-drawer {
          position: fixed;
          top: 0; right: 0;
          height: 100vh;
          width: 340px;
          background: #fff;
          box-shadow: -6px 0 32px rgba(0,0,0,0.13);
          z-index: 500;
          display: flex;
          flex-direction: column;
          transform: translateX(100%);
          transition: transform 0.30s cubic-bezier(0.4,0,0.2,1);
        }
        .xona-drawer.open { transform: translateX(0); }

        .xona-drawer-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 20px 20px 16px;
          border-bottom: 1px solid #f0f0f0;
        }
        .xona-drawer-title { font-size: 17px; font-weight: 700; color: #222; }
        .xona-drawer-close {
          width: 30px; height: 30px; border-radius: 8px;
          border: none; background: rgba(118,91,207,0.10);
          color: #765bcf; font-size: 14px; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
        }
        .xona-drawer-body { flex: 1; padding: 20px; overflow-y: auto; }
        .xona-drawer-footer {
          padding: 14px 20px;
          border-top: 1px solid #f0f0f0;
          display: flex; gap: 10px;
        }

        /* Form */
        .xona-label {
          display: block; font-size: 13px; font-weight: 600;
          color: #444; margin-bottom: 6px;
        }
        .xona-label span { color: #e53935; }
        .xona-input {
          width: 100%; height: 40px; border-radius: 10px;
          border: 1.5px solid #e0e0e0; padding: 0 12px;
          font-size: 14px; color: #222; outline: none;
          transition: border-color 0.15s;
          box-sizing: border-box;
        }
        .xona-input:focus { border-color: #765bcf; }
        .xona-input::placeholder { color: #bbb; }
        .xona-field { margin-bottom: 18px; }

        /* Buttons */
        .btn-cancel {
          flex: 1; height: 40px; border-radius: 10px;
          border: 1.5px solid #ddd; background: #fff;
          font-size: 14px; font-weight: 600; color: #666;
          cursor: pointer; transition: background 0.15s;
        }
        .btn-cancel:hover { background: #f5f5f5; }
        .btn-cancel:active { filter: brightness(1.05); }
        .btn-save {
          flex: 1; height: 40px; border-radius: 10px;
          border: none; background: #765bcf;
          font-size: 14px; font-weight: 600; color: #fff;
          cursor: pointer; transition: background 0.15s, filter 0.15s, transform 0.15s;
        }
        .btn-save:hover { background: #5e48a8; }
        .btn-save:active { filter: brightness(1.08); transform: translateY(1px); }

        /* Room card */
        .room-card {
          display: flex; align-items: center; justify-content: space-between;
          padding: 20px 24px; border-radius: 14px;
          border: 1px solid #eef0f5; background: #fff;
          box-shadow: 0 4px 14px rgba(0,0,0,0.02);
          transition: box-shadow 0.15s, transform 0.2s;
        }
        .room-card:hover { box-shadow: 0 6px 20px rgba(118,91,207,0.08); transform: translateY(-2px); }
        .room-name { font-size: 16px; font-weight: 700; color: #222; }
        .room-sigim { font-size: 13px; color: #888; margin-top: 4px; }
        .room-actions { display: flex; gap: 14px; align-items: center; }
        .room-btn {
          background: none; border: none; font-size: 16px;
          cursor: pointer; padding: 0;
          display: flex; align-items: center; justify-content: center;
          transition: color 0.15s;
        }
        .room-btn.delete { color: #e53935; }
        .room-btn.delete:hover { color: #c62828; }
        .room-btn.delete:active,
        .room-btn.edit:active {
          filter: brightness(1.15);
          transform: translateY(1px);
        }
        .room-btn.edit { color: #765bcf; }
        .room-btn.edit:hover { color: #5e48a8; }

        /* Grid */
        .rooms-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px;
        }

        /* Delete modal */
        .del-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.35);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .del-modal {
          background: #fff;
          border-radius: 16px;
          padding: 32px 28px 24px;
          width: 360px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.18);
          text-align: center;
        }
        .del-modal-title {
          font-size: 18px;
          font-weight: 700;
          color: #1a1a2e;
          margin: 0 0 12px;
        }
        .del-modal-text {
          font-size: 14px;
          color: #666;
          margin: 0 0 28px;
          line-height: 1.5;
        }
        .del-modal-btns {
          display: flex;
          gap: 12px;
          justify-content: center;
        }
        .del-btn-cancel {
          flex: 1; height: 42px; border-radius: 10px;
          border: 1.5px solid #e0e0e0; background: #fff;
          font-size: 14px; font-weight: 600; color: #555;
          cursor: pointer; transition: background 0.15s;
        }
        .del-btn-cancel:hover { background: #f5f5f5; }
        .del-btn-confirm {
          flex: 1; height: 42px; border-radius: 10px;
          border: none; background: #e53935;
          font-size: 14px; font-weight: 700; color: #fff;
          cursor: pointer; transition: background 0.15s;
        }
        .del-btn-confirm:hover { background: #c62828; }
      `}</style>

      {/* Delete Confirm Modal */}
      {deleteModal && (
        <div className="del-overlay" onClick={cancelDelete}>
          <div className="del-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="del-modal-title">{t("Xonani o'chirish")}</h3>
            <p className="del-modal-text">
              {t("Rostdan ham o'chirishni hohlaysizmi?")}
            </p>
            <div className="del-modal-btns">
              <button className="del-btn-cancel" onClick={cancelDelete}>
                {t("Bekor qilish")}
              </button>
              <button className="del-btn-confirm" onClick={handleDelete}>
                {t("Ha")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Overlay */}
      <div
        className={`xona-overlay${drawerOpen ? " show" : ""}`}
        onClick={closeDrawer}
      />

      {/* Right Drawer */}
      <div className={`xona-drawer${drawerOpen ? " open" : ""}`}>
        <div className="xona-drawer-header">
          <span className="xona-drawer-title">
            {editRoom ? t("Xonani tahrirlash") : t("Xonani qo'shish")}
          </span>
          <button className="xona-drawer-close" onClick={closeDrawer}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
        <div className="xona-drawer-body">
          <div className="xona-field">
            <label className="xona-label">
              {t("Nomi")} <span>*</span>
            </label>
            <input
              className="xona-input"
              placeholder={t("Xona nomi")}
              value={nom}
              onChange={(e) => setNom(e.target.value)}
            />
          </div>
          <div className="xona-field">
            <label className="xona-label">
              {t("Sig'imi")} <span>*</span>
            </label>
            <input
              className="xona-input"
              type="number"
              placeholder={t("Masalan: 20")}
              value={sigim}
              onChange={(e) => setSigim(e.target.value)}
            />
          </div>
        </div>
        <div className="xona-drawer-footer">
          <button className="btn-cancel" onClick={closeDrawer}>
            {t("Bekor qilish")}
          </button>
          <button className="btn-save" onClick={handleRoom}>
            {editRoom ? t("Yangilash") : t("Saqlash")}
          </button>
        </div>
      </div>

      {/* ── Page content ── */}
      <div
        style={{
          padding: "24px",
          background: "#fff",
          borderRadius: 16,
          marginTop: 10,
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 30,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <h2
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: "#222",
                margin: 0,
              }}
            >
              {t("Xonalar")}
            </h2>
            <div
              style={{
                display: "flex",
                gap: 6,
                background: "#f1f0f7",
                padding: 4,
                borderRadius: 8,
              }}
            >
              {[
                { key: "active", label: t("Xonalar") },
                { key: "archive", label: t("Arxiv") },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setView(tab.key)}
                  style={{
                    height: 32,
                    padding: "0 16px",
                    borderRadius: 6,
                    border: "none",
                    background: view === tab.key ? "#765bcf" : "transparent",
                    color: view === tab.key ? "#fff" : "#666",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
          {view === "active" && (
            <button
              onClick={openAdd}
              style={{
                height: 40,
                padding: "0 20px",
                borderRadius: 8,
                border: "none",
                background: "#765bcf",
                color: "#fff",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
                transition: "background 0.15s",
              }}
            >
              <i className="fa-solid fa-plus"></i>
              {t("Xonani qo'shish")}
            </button>
          )}
        </div>

        {/* Rooms grid */}
        {view === "active" ? (
          users?.data?.length === 0 ? (
            <div
              style={{ textAlign: "center", color: "#bbb", padding: "40px 0" }}
            >
              <i
                className="fa-solid fa-door-open"
                style={{ fontSize: 40, marginBottom: 10 }}
              ></i>
              <p style={{ fontWeight: 500 }}>{t("Hozircha xona yo'q")}</p>
            </div>
          ) : (
            <div className="rooms-grid">
              {users?.data?.map((room) => (
                <div key={room.id} className="room-card">
                  <div>
                    <div className="room-name">
                      {room.name === "genious room" ? "Autodesk" : room.name}
                    </div>
                    <div className="room-sigim">{t("Sig'imi:")} {room.capacity}</div>
                  </div>
                  <div className="room-actions">
                    <button
                      className="room-btn delete"
                      onClick={() => confirmDelete(room.id)}
                    >
                      <i className="fa-solid fa-trash"></i>
                    </button>
                    <button
                      className="room-btn edit"
                      onClick={() => openEdit(room)}
                    >
                      <i className="fa-solid fa-pen"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : archiveLoading ? (
          <p style={{ color: "#888" }}>{t("Arxiv yuklanmoqda...")}</p>
        ) : archived.length > 0 ? (
          <div className="rooms-grid">
            {archived.map((room) => (
              <div key={room.id} className="room-card" style={{ opacity: 0.85 }}>
                <div>
                  <div className="room-name">
                    {room.name === "genious room" ? "Autodesk" : room.name}
                    <span
                      style={{
                        marginLeft: 8,
                        fontSize: 11,
                        fontWeight: 600,
                        color: "#999",
                        background: "#eee",
                        padding: "2px 8px",
                        borderRadius: 4,
                      }}
                    >
                      {t("Arxiv")}
                    </span>
                  </div>
                  <div className="room-sigim">{t("Sig'imi:")} {room.capacity}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            style={{ textAlign: "center", color: "#bbb", padding: "40px 0" }}
          >
            <i
              className="fa-solid fa-box-archive"
              style={{ fontSize: 40, marginBottom: 10 }}
            ></i>
            <p style={{ fontWeight: 500 }}>{t("Arxivda xona yo'q")}</p>
          </div>
        )}
      </div>
    </>
  );
}

/* ── Boshqa sub-sahifalar ── */
const pages = {
  hodimlar: { icon: "fa-users", title: "Hodimlar", color: "#4CAF50" },
};

function SubPage({ pageKey }) {
  const { t } = useLang();
  const p = pages[pageKey];
  return (
    <div style={{ padding: "0 0 24px" }}>
      <div
        style={{
          background: "#fff",
          borderRadius: 14,
          border: "1px solid #ececec",
          padding: "28px 24px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              width: 46,
              height: 46,
              borderRadius: 12,
              background: p.color + "18",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <i
              className={`fa-solid ${p.icon}`}
              style={{ color: p.color, fontSize: 20 }}
            ></i>
          </div>
          <div>
            <h1
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: "#222",
                margin: 0,
              }}
            >
              {t(p.title)}
            </h1>
            <p style={{ fontSize: 13, color: "#888", marginTop: 2 }}>
              {t(p.title)} {t("bo'limi")}
            </p>
          </div>
        </div>
        <div style={{ textAlign: "center", color: "#ccc", padding: "32px 0" }}>
          <i
            className={`fa-solid ${p.icon}`}
            style={{ fontSize: 44, color: p.color + "55" }}
          ></i>
          <p style={{ fontWeight: 500, fontSize: 14, marginTop: 10 }}>
            {t("Hozircha ma'lumot yo'q")}
          </p>
        </div>
      </div>
    </div>
  );
}

export function Kurslar() {
  const { t } = useLang();
  const [users, setUsers] = useState([]);
  const [view, setView] = useState("active"); // "active" | "archive"
  const [archived, setArchived] = useState([]);
  const [archiveLoading, setArchiveLoading] = useState(false);

  useEffect(() => {
    async function datas() {
      try {
        const data = await fetchApi(`courses`);
        if (data.status === 200) {
          setUsers(data.data);
        }
      } catch (error) {
        console.log(error);
      }
    }
    datas();
  }, []);

  // Arxivlangan kurslar — GET /api/v1/courses/archive
  useEffect(() => {
    if (view !== "archive") return;
    async function loadArchive() {
      setArchiveLoading(true);
      try {
        const res = await fetchApi(`courses/archive`);
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
  const [editKurs, setEditKurs] = useState(null);

  const [nomi, setNomi] = useState("");
  const [darsDavomiyligi, setDarsDavomiyligi] = useState(0);
  const [oyDavomiyligi, setOyDavomiyligi] = useState(0);
  const [narx, setNarx] = useState(0);
  const [desc, setDesc] = useState("");

  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      if (editKurs) {
        const res = await fetchApi.patch(`courses/${editKurs.id}`, {
          name: nomi,
          description: desc,
          price: Number(narx),
          duration_month: Number(oyDavomiyligi),
          duration_hours: Number(darsDavomiyligi),
        });
        if (res.status === 200 || res.status === 201) {
          setUsers((prev) => ({
            ...prev,
            data: prev?.data?.map((row) =>
              row.id === editKurs.id
                ? {
                    ...row,
                    name: nomi,
                    description: desc,
                    price: Number(narx),
                    duration_month: Number(oyDavomiyligi),
                    duration_hours: Number(darsDavomiyligi),
                  }
                : row,
            ),
          }));
          setDrawer(false);
          setEditKurs(null);
        }
      } else {
        const res = await fetchApi.post("courses", {
          name: nomi,
          description: desc,
          price: Number(narx),
          duration_month: Number(oyDavomiyligi),
          duration_hours: Number(darsDavomiyligi),
        });
        if (res.status === 200 || res.status === 201) {
          setDrawer(false);
          // Butun sahifani qayta yuklamasdan faqat kurslar ro'yxatini yangilaymiz
          const c = await fetchApi(`courses`);
          if (c.status === 200) setUsers(c.data);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  function openAdd() {
    setEditKurs(null);
    setNomi("");
    setDarsDavomiyligi("");
    setOyDavomiyligi("");
    setNarx("");
    setDesc("");
    setDrawer(true);
  }

  function openEdit(course) {
    setEditKurs(course);
    setNomi(course.name || "");
    setDesc(course.description || "");
    setNarx(course.price || 0);
    setOyDavomiyligi(course.duration_month || 0);
    setDarsDavomiyligi(course.duration_hours || 0);
    setDrawer(true);
  }

  function closeDrawer() {
    setDrawer(false);
    setEditKurs(null);
  }
  const confirmDelete = (id) => {
    setDeleteId(id);
    setDeleteModal(true);
  };
  const cancelDelete = () => {
    setDeleteModal(false);
    setDeleteId(null);
  };
  const CourseDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetchApi.delete(`courses/${deleteId}`);
      if (res.status === 200 || res.status === 201) {
        setUsers((prev) => ({
          ...prev,
          data: prev?.data?.filter((room) => room.id !== deleteId),
        }));
        setDeleteModal(false);
        setDeleteId(null);
      }
      if (!users?.data) return;
      setUsers({ ...users, data: users.data.filter((x) => x.id !== deleteId) });
    } catch (error) {
      alert(t("Xatolik yuz berdi."));
      console.log(error);
    }
  };

  return (
    <>
      <style>{`
        /* ── Overlay ── */
        .kurs-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.4);
          z-index: 400;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.28s;
        }
        .kurs-overlay.show { opacity: 1; pointer-events: all; }

        /* ── Right drawer ── */
        .kurs-drawer {
          position: fixed;
          top: 0; right: 0;
          height: 100vh;
          width: 380px;
          background: #fff;
          box-shadow: -6px 0 32px rgba(0,0,0,0.13);
          z-index: 500;
          display: flex;
          flex-direction: column;
          transform: translateX(100%);
          transition: transform 0.30s cubic-bezier(0.4,0,0.2,1);
        }
        .kurs-drawer.open { transform: translateX(0); }

        .kurs-drawer-header {
          display: flex; align-items: flex-start; justify-content: space-between;
          padding: 24px 24px 16px;
        }
        .kurs-drawer-title { font-size: 20px; font-weight: 700; color: #222; margin: 0; }
        .kurs-drawer-subtitle { font-size: 13px; color: #666; margin-top: 4px; }
        .kurs-drawer-close {
          background: none; border: none; font-size: 18px; color: #999;
          cursor: pointer; padding: 4px; display: flex; align-items: center; justify-content: center;
        }

        .kurs-drawer-body { flex: 1; padding: 0 24px 24px; overflow-y: auto; }
        .kurs-drawer-footer {
          padding: 16px 24px;
          border-top: 1px solid #f0f0f0;
          display: flex; justify-content: flex-end; gap: 12px;
          background: #fff;
        }

        /* Form elements */
        .kurs-label {
          display: block; font-size: 13px; font-weight: 600;
          color: #333; margin-bottom: 8px;
        }
        .kurs-input, .kurs-select, .kurs-textarea {
          width: 100%; border-radius: 10px;
          border: 1.5px solid #e2e8f0; padding: 0 14px;
          font-size: 14px; color: #222; outline: none;
          transition: border-color 0.15s;
          box-sizing: border-box; background: #fff;
        }
        .kurs-input { height: 44px; }
        .kurs-select { height: 44px; appearance: none; background: url('data:image/svg+xml;utf8,<svg fill="%23999" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5z"/></svg>') no-repeat right 10px center; }
        .kurs-textarea { padding: 12px 14px; min-height: 100px; resize: none; font-family: inherit; }
        .kurs-input:focus, .kurs-select:focus, .kurs-textarea:focus { border-color: #765bcf; }
        .kurs-field { margin-bottom: 20px; }

        /* Buttons */
        .k-btn-cancel {
          height: 40px; padding: 0 20px; border-radius: 10px;
          border: 1.5px solid #e2e8f0; background: #fff;
          font-size: 14px; font-weight: 600; color: #555;
          cursor: pointer; transition: background 0.15s, filter 0.15s, transform 0.15s;
        }
        .k-btn-cancel:hover { background: #f5f5f5; }
        .k-btn-cancel:active { filter: brightness(1.05); transform: translateY(1px); }
        .k-btn-save {
          height: 40px; padding: 0 24px; border-radius: 10px;
          border: none; background: #765bcf;
          font-size: 14px; font-weight: 600; color: #fff;
          cursor: pointer; transition: background 0.15s, filter 0.15s, transform 0.15s;
        }
        .k-btn-save:hover { background: #5e48a8; }
        .k-btn-save:active { filter: brightness(1.08); transform: translateY(1px); }

        /* Cards */
        .kurslar-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 20px;
        }
        .k-card {
          padding: 24px;
          border-radius: 16px;
          background: #f4f6fa;
          transition: transform 0.2s;
        }
        .k-card-title { font-size: 16px; font-weight: 700; color: #222; margin: 0 0 10px 0; }
        .k-card-status { font-size: 14px; color: #999; font-weight: 500; }
        .k-badge {
          display: inline-block; padding: 6px 12px; border-radius: 6px;
          background: #fff;
          font-size: 12px; font-weight: 700; color: #444; margin-right: 8px;
        }
        .k-action-btn { background: none; border: none; color: #999; font-size: 15px; cursor: pointer; padding: 0; transition: color 0.15s; }
        .k-action-btn:hover { color: #444; }
        .k-action-btn.delete:hover { color: #e53935; }

        /* Delete modal */
        .del-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.35);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .del-modal {
          background: #fff;
          border-radius: 16px;
          padding: 32px 28px 24px;
          width: 360px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.18);
          text-align: center;
        }
        .del-modal-title {
          font-size: 18px;
          font-weight: 700;
          color: #1a1a2e;
          margin: 0 0 12px;
        }
        .del-modal-text {
          font-size: 14px;
          color: #666;
          margin: 0 0 28px;
          line-height: 1.5;
        }
        .del-modal-btns {
          display: flex;
          gap: 12px;
          justify-content: center;
        }
        .del-btn-cancel {
          flex: 1; height: 42px; border-radius: 10px;
          border: 1.5px solid #e0e0e0; background: #fff;
          font-size: 14px; font-weight: 600; color: #555;
          cursor: pointer; transition: background 0.15s;
        }
        .del-btn-cancel:hover { background: #f5f5f5; }
        .del-btn-confirm {
          flex: 1; height: 42px; border-radius: 10px;
          border: none; background: #e53935;
          font-size: 14px; font-weight: 700; color: #fff;
          cursor: pointer; transition: background 0.15s;
        }
        .del-btn-confirm:hover { background: #c62828; }
      `}</style>

      {/* Delete Confirm Modal */}
      {deleteModal && (
        <div className="del-overlay" onClick={cancelDelete}>
          <div className="del-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="del-modal-title">{t("Kursni o'chirish")}</h3>
            <p className="del-modal-text">
              {t("Rostdan ham o'chirishni hohlaysizmi?")}
            </p>
            <div className="del-modal-btns">
              <button className="del-btn-cancel" onClick={cancelDelete}>
                {t("Bekor qilish")}
              </button>
              <button className="del-btn-confirm" onClick={CourseDelete}>
                {t("Ha")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Overlay */}
      <div
        className={`kurs-overlay${drawerOpen ? " show" : ""}`}
        onClick={closeDrawer}
      />

      {/* Drawer */}
      <div className={`kurs-drawer${drawerOpen ? " open" : ""}`}>
        <div className="kurs-drawer-header">
          <div>
            <h2 className="kurs-drawer-title">
              {editKurs ? t("Kursni tahrirlash") : t("Kurs qoshish")}
            </h2>
            <p className="kurs-drawer-subtitle">
              {editKurs
                ? t("Bu yerda mavjud kursni tahrirlashingiz mumkin.")
                : t("Bu yerda siz yangi kurs qo'shishingiz mumkin.")}
            </p>
          </div>
          <button className="kurs-drawer-close" onClick={closeDrawer}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
        <div className="kurs-drawer-body">
          <div className="kurs-field">
            <label className="kurs-label">{t("Nomi")}</label>
            <input
              className="kurs-input"
              placeholder="HR Manager..."
              value={nomi}
              onChange={(e) => setNomi(e.target.value)}
            />
          </div>

          <div className="kurs-field">
            <label className="kurs-label">{t("Dars davomiyligi")}</label>
            <select
              className="kurs-select"
              value={darsDavomiyligi}
              onChange={(e) => setDarsDavomiyligi(e.target.value)}
            >
              <option value="">{t("Tanlang")}</option>
              <option value="60">60 min</option>
              <option value="90">90 min</option>
            </select>
          </div>

          <div className="kurs-field">
            <label className="kurs-label">{t("Kurs davomiyligi (oylarda)")}</label>
            <select
              className="kurs-select"
              value={oyDavomiyligi}
              onChange={(e) => setOyDavomiyligi(e.target.value)}
            >
              <option value="">{t("Tanlang")}</option>
              <option value="1">{t("1 oy")}</option>
              <option value="3">{t("3 oy")}</option>
              <option value="6">{t("6 oy")}</option>
            </select>
          </div>

          <div className="kurs-field">
            <label className="kurs-label">{t("Narx")}</label>
            <div style={{ position: "relative" }}>
              <i
                className="fa-solid fa-money-bill-1-wave"
                style={{
                  position: "absolute",
                  left: 14,
                  top: 14,
                  color: "#999",
                  fontSize: 16,
                }}
              ></i>
              <input
                className="kurs-input"
                style={{ paddingLeft: 40 }}
                placeholder={t("Narxini kiriting")}
                value={narx}
                onChange={(e) => setNarx(e.target.value)}
              />
            </div>
          </div>

          <div className="kurs-field">
            <label className="kurs-label">Description</label>
            <textarea
              className="kurs-textarea"
              placeholder="A little about the company and the team that you'll be working with."
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            ></textarea>
            <p style={{ fontSize: 12, color: "#888", marginTop: 6 }}>
              This is a hint text to help user.
            </p>
          </div>
        </div>
        <div className="kurs-drawer-footer">
          <button className="k-btn-cancel" onClick={closeDrawer}>
            {t("Bekor qilish")}
          </button>
          <button className="k-btn-save" onClick={handleLogin}>
            {editKurs ? t("Yangilash") : t("Saqlash")}
          </button>
        </div>
      </div>

      {/* Page content */}
      <div
        style={{
          padding: "24px",
          background: "#fff",
          borderRadius: 16,
          marginTop: 10,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 30,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <h2
              style={{ fontSize: 20, fontWeight: 700, color: "#222", margin: 0 }}
            >
              {t("Kurslar")}
            </h2>
            <div
              style={{
                display: "flex",
                gap: 6,
                background: "#f1f0f7",
                padding: 4,
                borderRadius: 8,
              }}
            >
              {[
                { key: "active", label: t("Kurslar") },
                { key: "archive", label: t("Arxiv") },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setView(tab.key)}
                  style={{
                    height: 32,
                    padding: "0 16px",
                    borderRadius: 6,
                    border: "none",
                    background: view === tab.key ? "#765bcf" : "transparent",
                    color: view === tab.key ? "#fff" : "#666",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
          {view === "active" && (
            <button
              onClick={openAdd}
              style={{
                height: 40,
                padding: "0 20px",
                borderRadius: 8,
                border: "none",
                background: "#765bcf",
                color: "#fff",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <i className="fa-solid fa-plus"></i>
              {t("Kurslar qo'shish")}
            </button>
          )}
        </div>

        {/* Grid */}
        {view === "active" ? (
          <div className="kurslar-grid">
            {users?.data?.map((row) => (
              <div key={row.id} className="k-card">
                <h3 className="k-card-title">{row.name}</h3>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 18,
                  }}
                >
                  <span className="k-card-status">{row.description}</span>
                  <div style={{ display: "flex", gap: 12 }}>
                    <button
                      className="k-action-btn delete"
                      onClick={() => confirmDelete(row.id)}
                    >
                      <i className="fa-solid fa-trash"></i>
                    </button>
                    <button className="k-action-btn" onClick={() => openEdit(row)}>
                      <i className="fa-solid fa-pen"></i>
                    </button>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <span className="k-badge">{row.duration_hours} {t("min")}</span>
                  <span className="k-badge">{row.duration_month} {t("oy")}</span>
                  <span className="k-badge">{row.price} {t("so'm")}</span>
                </div>
              </div>
            ))}
          </div>
        ) : archiveLoading ? (
          <p style={{ color: "#888" }}>{t("Arxiv yuklanmoqda...")}</p>
        ) : archived.length > 0 ? (
          <div className="kurslar-grid">
            {archived.map((row) => (
              <div key={row.id} className="k-card" style={{ opacity: 0.85 }}>
                <h3 className="k-card-title">
                  {row.name}
                  <span
                    style={{
                      marginLeft: 8,
                      fontSize: 11,
                      fontWeight: 600,
                      color: "#999",
                      background: "#eee",
                      padding: "2px 8px",
                      borderRadius: 4,
                    }}
                  >
                    {t("Arxiv")}
                  </span>
                </h3>
                <div style={{ marginBottom: 18 }}>
                  <span className="k-card-status">{row.description}</span>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <span className="k-badge">{row.duration_hours} {t("min")}</span>
                  <span className="k-badge">{row.duration_month} {t("oy")}</span>
                  <span className="k-badge">{row.price} {t("so'm")}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: "#888" }}>{t("Arxivda kurslar yo'q")}</p>
        )}
      </div>
    </>
  );
}
export function Hodimlar() {
  return <SubPage pageKey="hodimlar" />;
}
