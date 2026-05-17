import { useEffect, useState } from "react";
import { fetchApi } from "../api/user.api";

/* ── dastlabki xonalar ── */
const initialRooms = [
  { id: 1, nom: "genious room", sigim: 15 },
  { id: 2, nom: "Impact room", sigim: 12 },
  { id: 3, nom: "1A", sigim: 25 },
  { id: 4, nom: "205-xona", sigim: 32 },
  { id: 5, nom: "16-xona", sigim: 18 },
  { id: 6, nom: "5 xona", sigim: 30 },
  { id: 7, nom: "IELTS with islombek", sigim: 20 },
  { id: 8, nom: "Beginner", sigim: 18 },
];

export function Xonalar() {

  const [users, setUsers] = useState([]);

  useEffect(() => {
    async function datas() {
      try {
        const data = await fetchApi(
          `rooms`,
        );
        if (data.status === 200) {
          setUsers(data.data);
        }
      } catch (error) {
        console.log(error);
      }
    }
    datas();

  }, []);



  const [rooms, setRooms] = useState(initialRooms);
  const [drawerOpen, setDrawer] = useState(false);
  const [editRoom, setEditRoom] = useState(null); // null = qo'shish, obj = tahrirlash
  const [nom, setNom] = useState("");
  const [sigim, setSigim] = useState("");

  function openAdd() {
    setEditRoom(null);
    setNom(""); setSigim("");
    setDrawer(true);
  }
  function openEdit(room) {
    setEditRoom(room);
    setNom(room.nom); setSigim(room.sigim);
    setDrawer(true);
  }
  function closeDrawer() {
    setDrawer(false);
    setNom(""); setSigim(""); setEditRoom(null);
  }
  function handleSave() {
    if (!nom.trim() || !sigim) return;
    if (editRoom) {
      setRooms(r => r.map(x => x.id === editRoom.id ? { ...x, nom, sigim: +sigim } : x));
    } else {
      setRooms(r => [...r, { id: Date.now(), nom, sigim: +sigim }]);
    }
    closeDrawer();
  }
  function handleDelete(id) {
    setRooms(r => r.filter(x => x.id !== id));
  }

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
        .btn-save {
          flex: 1; height: 40px; border-radius: 10px;
          border: none; background: #765bcf;
          font-size: 14px; font-weight: 600; color: #fff;
          cursor: pointer; transition: background 0.15s;
        }
        .btn-save:hover { background: #5e48a8; }

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
        .room-btn.edit { color: #765bcf; }
        .room-btn.edit:hover { color: #5e48a8; }

        /* Grid */
        .rooms-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px;
        }
      `}</style>

      {/* Overlay */}
      <div className={`xona-overlay${drawerOpen ? " show" : ""}`} onClick={closeDrawer} />

      {/* Right Drawer */}
      <div className={`xona-drawer${drawerOpen ? " open" : ""}`}>
        <div className="xona-drawer-header">
          <span className="xona-drawer-title">
            {editRoom ? "Xonani tahrirlash" : "Xonani qo'shish"}
          </span>
          <button className="xona-drawer-close" onClick={closeDrawer}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
        <div className="xona-drawer-body">
          <div className="xona-field">
            <label className="xona-label">Nomi <span>*</span></label>
            <input
              className="xona-input"
              placeholder="Xona nomi"
              value={nom}
              onChange={e => setNom(e.target.value)}
            />
          </div>
          <div className="xona-field">
            <label className="xona-label">Sig'imi <span>*</span></label>
            <input
              className="xona-input"
              type="number"
              placeholder="Masalan: 20"
              value={sigim}
              onChange={e => setSigim(e.target.value)}
            />
          </div>
        </div>
        <div className="xona-drawer-footer">
          <button className="btn-cancel" onClick={closeDrawer}>Bekor qilish</button>
          <button className="btn-save" onClick={handleSave}>Saqlash</button>
        </div>
      </div>

      {/* ── Page content ── */}
      <div style={{ padding: "24px", background: "#fff", borderRadius: 16, marginTop: 10 }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 30 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "#222", margin: 0 }}>Xonalar</h2>
            <button style={{
              background: "none", border: "none",
              color: "#aaa", cursor: "pointer", fontSize: 16,
              display: "flex", alignItems: "center", justifyContent: "center",
              padding: 0
            }}>
              <i className="fa-solid fa-rotate-right"></i>
            </button>
          </div>
          <button
            onClick={openAdd}
            style={{
              height: 40, padding: "0 20px", borderRadius: 8,
              border: "none", background: "#765bcf",
              color: "#fff", fontSize: 14, fontWeight: 600,
              cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
              transition: "background 0.15s",
            }}
          >
            <i className="fa-solid fa-plus"></i>
            Xonani qo'shish
          </button>
        </div>

        {/* Rooms grid */}
        {rooms.length === 0 ? (
          <div style={{ textAlign: "center", color: "#bbb", padding: "40px 0" }}>
            <i className="fa-solid fa-door-open" style={{ fontSize: 40, marginBottom: 10 }}></i>
            <p style={{ fontWeight: 500 }}>Hozircha xona yo'q</p>
          </div>
        ) : (
          <div className="rooms-grid">
            {users?.data?.map(room => (
              <div key={room.id} className="room-card">
                <div>
                  <div className="room-name">{room.name === "genious room" ? "Autodesk" : room.name}</div>
                  <div className="room-sigim">Sig'imi: {room.capacity}</div>
                </div>
                <div className="room-actions">
                  <button className="room-btn delete" onClick={() => handleDelete(room.id)}>
                    <i className="fa-solid fa-trash"></i>
                  </button>
                  <button className="room-btn edit" onClick={() => openEdit(room)}>
                    <i className="fa-solid fa-pen"></i>
                  </button>
                </div>
              </div>
            ))}
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
  const p = pages[pageKey];
  return (
    <div style={{ padding: "0 0 24px" }}>
      <div style={{
        background: "#fff", borderRadius: 14,
        border: "1px solid #ececec", padding: "28px 24px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <div style={{
            width: 46, height: 46, borderRadius: 12,
            background: p.color + "18",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <i className={`fa-solid ${p.icon}`} style={{ color: p.color, fontSize: 20 }}></i>
          </div>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: "#222", margin: 0 }}>{p.title}</h1>
            <p style={{ fontSize: 13, color: "#888", marginTop: 2 }}>
              {p.title} bo'limi
            </p>
          </div>
        </div>
        <div style={{ textAlign: "center", color: "#ccc", padding: "32px 0" }}>
          <i className={`fa-solid ${p.icon}`} style={{ fontSize: 44, color: p.color + "55" }}></i>
          <p style={{ fontWeight: 500, fontSize: 14, marginTop: 10 }}>Hozircha ma'lumot yo'q</p>
        </div>
      </div>
    </div>
  );
}



export function Kurslar() {

  const [users, setUsers] = useState([]);

  useEffect(() => {
    async function datas() {
      try {
        const data = await fetchApi(
          `courses`,
        );
        if (data.status === 200) {
          setUsers(data.data);
        }
      } catch (error) {
        console.log(error);
      }
    }
    datas();

  }, []);




  const [drawerOpen, setDrawer] = useState(false);
  const [editKurs, setEditKurs] = useState(null);

  const [nomi, setNomi] = useState("");
  const [darsDavomiyligi, setDarsDavomiyligi] = useState(0);
  const [oyDavomiyligi, setOyDavomiyligi] = useState(0);
  const [narx, setNarx] = useState(0);
  const [desc, setDesc] = useState("");


  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetchApi.post("courses", {
        name: nomi,
        description: desc,
        price: Number(narx),
        duration_month: Number(oyDavomiyligi),
        duration_hours: Number(darsDavomiyligi)
      });
      if (res.status === 200 || res.status === 201) {
        setDrawer(false);
        window.location.reload();
      }
    } catch (error) {
      console.log(error);
    }
  };

  function openAdd() {
    setEditKurs(null);
    setNomi(""); setDarsDavomiyligi(""); setOyDavomiyligi(""); setNarx(""); setDesc("");
    setDrawer(true);
  }
  function closeDrawer() {
    setDrawer(false);
  }
  function handleDelete(id) {
    if (!users?.data) return;
    setUsers({ ...users, data: users.data.filter(x => x.id !== id) });
  }

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
          cursor: pointer; transition: background 0.15s;
        }
        .k-btn-save {
          height: 40px; padding: 0 24px; border-radius: 10px;
          border: none; background: #765bcf;
          font-size: 14px; font-weight: 600; color: #fff;
          cursor: pointer; transition: background 0.15s;
        }

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
      `}</style>

      {/* Overlay */}
      <div className={`kurs-overlay${drawerOpen ? " show" : ""}`} onClick={closeDrawer} />

      {/* Drawer */}
      <div className={`kurs-drawer${drawerOpen ? " open" : ""}`}>
        <div className="kurs-drawer-header">
          <div>
            <h2 className="kurs-drawer-title">Kurs qoshish</h2>
            <p className="kurs-drawer-subtitle">Bu yerda siz yangi Kurs qo'shishingiz mumkin.</p>
          </div>
          <button className="kurs-drawer-close" onClick={closeDrawer}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
        <div className="kurs-drawer-body">
          <div className="kurs-field">
            <label className="kurs-label">Nomi</label>
            <input className="kurs-input" placeholder="HR Manager..." value={nomi} onChange={e => setNomi(e.target.value)} />
          </div>

          <div className="kurs-field">
            <label className="kurs-label">Dars davomiyligi</label>
            <select className="kurs-select" value={darsDavomiyligi} onChange={e => setDarsDavomiyligi(e.target.value)}>
              <option value="">Tanlang</option>
              <option value="60">60 min</option>
              <option value="90">90 min</option>
            </select>
          </div>

          <div className="kurs-field">
            <label className="kurs-label">Kurs davomiyligi (oylarda)</label>
            <select className="kurs-select" value={oyDavomiyligi} onChange={e => setOyDavomiyligi(e.target.value)}>
              <option value="">Tanlang</option>
              <option value="1">1 oy</option>
              <option value="3">3 oy</option>
              <option value="6">6 oy</option>
            </select>
          </div>

          <div className="kurs-field">
            <label className="kurs-label">Narx</label>
            <div style={{ position: "relative" }}>
              <i className="fa-solid fa-money-bill-1-wave" style={{ position: "absolute", left: 14, top: 14, color: "#999", fontSize: 16 }}></i>
              <input className="kurs-input" style={{ paddingLeft: 40 }} placeholder="Narxini kiriting" value={narx} onChange={e => setNarx(e.target.value)} />
            </div>
          </div>

          <div className="kurs-field">
            <label className="kurs-label">Description</label>
            <textarea className="kurs-textarea" placeholder="A little about the company and the team that you'll be working with." value={desc} onChange={e => setDesc(e.target.value)}></textarea>
            <p style={{ fontSize: 12, color: "#888", marginTop: 6 }}>This is a hint text to help user.</p>
          </div>
        </div>
        <div className="kurs-drawer-footer">
          <button className="k-btn-cancel" onClick={closeDrawer}>Bekor qilish</button>
          <button className="k-btn-save" onClick={handleLogin}>Saqlash</button>
        </div>
      </div>

      {/* Page content */}
      <div style={{ padding: "24px", background: "#fff", borderRadius: 16, marginTop: 10 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 30 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "#222", margin: 0 }}>Kurslar</h2>
          <button
            onClick={openAdd}
            style={{
              height: 40, padding: "0 20px", borderRadius: 8,
              border: "none", background: "#765bcf",
              color: "#fff", fontSize: 14, fontWeight: 600,
              cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
            }}
          >
            <i className="fa-solid fa-plus"></i>
            Kurslar qo'shish
          </button>
        </div>

        {/* Grid */}
        <div className="kurslar-grid">
          {users?.data?.map(row => (
            <div key={row.id} className="k-card">
              <h3 className="k-card-title">{row.name}</h3>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                <span className="k-card-status">{row.description}</span>
                <div style={{ display: "flex", gap: 12 }}>
                  <button className="k-action-btn delete" onClick={() => handleDelete(row.id)}>
                    <i className="fa-solid fa-trash"></i>
                  </button>
                  <button className="k-action-btn">
                    <i className="fa-solid fa-pen"></i>
                  </button>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <span className="k-badge">{row.duration_hours} min</span>
                <span className="k-badge">{row.duration_month} oy</span>
                <span className="k-badge">{row.price} so'm</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
export function Filial() { return <SubPage pageKey="filial" />; }
export function Hodimlar() { return <SubPage pageKey="hodimlar" />; }
export function Sabablar() { return <SubPage pageKey="sabablar" />; }
export function Rollar() { return <SubPage pageKey="rollar" />; }
export function Coin() { return <SubPage pageKey="coin" />; }
export function XabarYuborish() { return <SubPage pageKey="xabar" />; }
export function FAQ() { return <SubPage pageKey="faq" />; }
export function Tekshiruv() { return <SubPage pageKey="tekshiruv" />; }
