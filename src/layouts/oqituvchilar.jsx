import { useState, useEffect } from "react";
import { fetchApi } from "../api/user.api";



export default function Oqituvchilar() {

  const [users, setUsers] = useState([]);
  const [allGroups, setAllGroups] = useState([]);

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



  const [drawerOpen, setDrawer] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  // Drawer fields
  const [tel, setTel] = useState("+998");
  const [email, setEmail] = useState("");
  const [fio, setFio] = useState("");
  const [manzil, setManzil] = useState("");
  const [parol, setParol] = useState("");
  const [rasm, setRasm] = useState(null);



  const create = async () => {
    try {
      const formData = new FormData();

      formData.append("full_name", fio);
      formData.append("email", email);
      formData.append("password", parol);
      formData.append("phone", tel);
      if (rasm) {
        formData.append("photo", rasm);
      }
      formData.append("address", manzil);

      // agar array bo'lsa
      selectedGuruhlar.forEach((g) => {
        formData.append("groups[]", g);
      });

      const res = await fetchApi.post("teachers", formData);

      if (res.status === 200 || res.status === 201) {
        setDrawer(false);
        window.location.reload();
      }
    } catch (error) {
      alert("Xatolik yuz berdi. Iltimos barcha ma'lumotlarni to'ldiring.");
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

  const handleDelete = (id) => {
    if (!users?.data) return;
    setUsers({ ...users, data: users.data.filter(d => d.id !== id) });
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

        .badge { display: inline-flex; padding: 3px 8px; border-radius: 6px; border: 1px solid #eee; font-size: 12px; margin-right: 4px; color: #555; background: #f5f5f5; font-weight: 500; }

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
      `}</style>

      {/* ── Guruh tanlash modali ── */}
      <div className={`oq-modal-wrap ${modalOpen ? "open" : ""}`}>
        <div className="oq-modal">
          <div className="oq-modal-header">
            <div>
              <p className="oq-modal-title">Guruhga biriktirish</p>
              <p className="oq-modal-sub">Bir yoki bir nechta guruhni tanlang</p>
            </div>
            <button className="oq-close" onClick={() => setModalOpen(false)}><i className="fa-solid fa-xmark"></i></button>
          </div>
          <div className="oq-modal-body">
            <input
              className="oq-input"
              placeholder="Guruh qidirish..."
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
            <button className="top-btn btn-outline" style={{ padding: "0 20px" }} onClick={() => setModalOpen(false)}>Bekor qilish</button>
            <button className="top-btn btn-primary" style={{ padding: "0 20px" }} onClick={saveGuruhlar}>Qo'shish</button>
          </div>
        </div>
      </div>

      {/* Drawer Overlay */}
      <div className={`oqit-overlay ${drawerOpen ? "open" : ""}`} onClick={() => setDrawer(false)} />

      {/* Drawer */}
      <div className={`oqit-drawer ${drawerOpen ? "open" : ""}`}>
        <div className="oq-header">
          <div>
            <h2 className="oq-title">O'qituvchi qo'shish</h2>
            <p className="oq-subtitle">Bu yerda siz yangi o'qituvchi qo'shishingiz mumkin.</p>
          </div>
          <button className="oq-close" onClick={() => setDrawer(false)}><i className="fa-solid fa-xmark"></i></button>
        </div>
        <div className="oq-body">
          <label className="oq-label">Telefon raqam</label>
          <input className="oq-input" value={tel} onChange={e => setTel(e.target.value)} />

          <label className="oq-label">Mail</label>
          <input className="oq-input" placeholder="Elektron pochtani kiriting" value={email} onChange={e => setEmail(e.target.value)} />

          <label className="oq-label">O'qituvchi FIO</label>
          <input className="oq-input" placeholder="Ma'lumotni kiriting" value={fio} onChange={e => setFio(e.target.value)} />

          <label className="oq-label">Manzil</label>
          <input className="oq-input" placeholder="Manzilni kiriting" value={manzil} onChange={e => setManzil(e.target.value)} />

          <label className="oq-label">Parol</label>
          <input className="oq-input" placeholder="Parolni kiriting" type="password" value={parol} onChange={e => setParol(e.target.value)} />

          <label className="oq-label">Guruh</label>
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
            <i className="fa-solid fa-plus"></i> {selectedGuruhlar.length > 0 ? `${selectedGuruhlar.length} ta guruh tanlandi` : "Qo'shish"}
          </button>

          <label className="oq-label">Surati</label>
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
            Bekor qilish
          </button>
          <button
            onClick={create}
            style={{
              flex: 1, height: 44, borderRadius: 10,
              border: "none", background: "#765bcf",
              color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer"
            }}
          >
            Saqlash
          </button>
        </div>
      </div>

      {/* Page Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#222", margin: 0 }}>O'qituvchilar</h1>
        <button
          className="top-btn btn-primary"
          onClick={() => setDrawer(true)}
          style={{ height: 36, fontSize: 13 }}
        >
          <i className="fa-solid fa-plus" style={{ fontSize: 12 }}></i> O'qituvchi qo'shish
        </button>
      </div>
      <p style={{ fontSize: 13, color: "#666", margin: "0 0 20px 0" }}>
        Ushbu sahifada siz o'qituvchilar ro'yxatini va ularning ma'lumotlarini topasiz. Har bir o'qituvchining ismi, fanlari va aloqa ma'lumotlari keltirilgan.
      </p>

      {/* Table Card */}
      <div className="bg-white" style={{ border: "1px solid #eee", borderRadius: 12, overflow: "hidden" }}>
        {/* Toolbar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderBottom: "1px solid #f0f0f0" }}>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="top-btn btn-outline">
              <i className="fa-solid fa-filter" style={{ fontSize: 12 }}></i> Filters
            </button>
            <button className="top-btn btn-outline">Arxiv</button>
          </div>
          <div style={{ position: "relative" }}>
            <i className="fa-solid fa-magnifying-glass" style={{ position: "absolute", left: 12, top: 12, color: "#bbb", fontSize: 13 }}></i>
            <input
              placeholder="Search"
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
                <th className="oq-th">Nomi <i className="fa-solid fa-arrow-down" style={{ fontSize: 10, marginLeft: 2 }}></i></th>
                <th className="oq-th">Guruh</th>
                <th className="oq-th">Telefon raqamlari</th>
                <th className="oq-th">Email</th>
                <th className="oq-th">Manzil</th>
                <th className="oq-th">Yaratilgan sana</th>
                <th className="oq-th" style={{ textAlign: "right" }}>Amallar</th>
              </tr>
            </thead>
            <tbody>
              {users?.data?.map((row, index) => (
                <tr key={row.id || index} className="table-row">
                  <td className="oq-td">
                    <div className={`custom-cb ${row.selected ? "checked" : ""}`} onClick={() => toggleSelect(row.id)}>
                      {row.selected && <i className="fa-solid fa-check"></i>}
                    </div>
                  </td>
                  <td className="oq-td">
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <img src={`https://najot-edu.softwareengineer.uz/files/${row.photo}`} alt="" style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover" }} />
                      <span style={{ fontWeight: 600, color: "#222" }}>{row.full_name || "Ism yo'q"}</span>
                    </div>
                  </td>
                  <td className="oq-td">
                    {(row.groups || []).map((g, i) => <span key={i} className="badge">{g.name || g.nomi || g}</span>)}
                  </td>
                  <td className="oq-td">{row.phone || "Yo'q"}</td>
                  <td className="oq-td">{row.email || "Yo'q"}</td>
                  <td className="oq-td">{row.address || "Yo'q"}</td>
                  <td className="oq-td">{row.created_at ? new Date(row.created_at).toLocaleDateString("ru-RU") : "Yo'q"}</td>
                  <td className="oq-td">
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: 4 }}>
                      <button className="act-btn"><i className="fa-regular fa-eye"></i></button>
                      <button className="act-btn red" onClick={() => handleDelete(row.id)}><i className="fa-regular fa-trash-can"></i></button>
                      <button className="act-btn"><i className="fa-solid fa-pen"></i></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderTop: "1px solid #f0f0f0" }}>
          <button className="top-btn btn-outline" style={{ border: "none", color: "#666" }}>
            <i className="fa-solid fa-arrow-left"></i> Previous
          </button>
          <div style={{ display: "flex", gap: 6 }}>
            {[1, 2, 3, "...", 8, 9, 10].map((p, i) => (
              <button key={i} style={{
                width: 32, height: 32, borderRadius: 8, border: "none",
                background: p === 1 ? "#765bcf" : "transparent",
                color: p === 1 ? "#fff" : "#666",
                fontWeight: p === 1 ? 700 : 400,
                cursor: p !== "..." ? "pointer" : "default",
                fontSize: 14
              }}>{p}</button>
            ))}
          </div>
          <button className="top-btn btn-outline" style={{ border: "none", color: "#666" }}>
            Next <i className="fa-solid fa-arrow-right"></i>
          </button>
        </div>
      </div>
    </div>
  );
}
