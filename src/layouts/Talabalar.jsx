import { useEffect, useState } from "react";
import { fetchApi } from "../api/user.api";


export default function Talabalar() {


  const [users, setUsers] = useState([]);
  const [allGroups, setAllGroups] = useState([]);

  useEffect(() => {
    async function datas() {
      try {
        const data = await fetchApi(`students`);
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
    setModalOpen(true);
  };

  const saveGuruhlar = () => {
    setSelectedGuruhlar([...tempSelected]);
    setModalOpen(false);
  };

  const toggleGuruh = (id) => {
    setTempSelected(prev => prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]);
  };

  const filteredGuruhlar = allGroups?.filter(g => 
    (g.name || g.nomi || "").toLowerCase().includes(guruhQidiruv.toLowerCase())
  ) || [];

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
      formData.append("birth_date", sana);

      // agar array bo'lsa
      selectedGuruhlar.forEach((g) => {
        formData.append("groups[]", g);
      });

      const res = await fetchApi.post("students", formData);

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
        .oq-input { width: 100%; height: 44px; border-radius: 8px; border: 1.5px solid #e2e8f0; padding: 0 14px; font-size: 14px; outline: none; transition: border-color 0.15s; margin-bottom: 16px; background: #fff; }
        .oq-input:focus { border-color: #765bcf; }
        
        /* Table styles */
        .oq-table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 12px; overflow: hidden; border: 1px solid #eee; }
        .oq-th { padding: 14px 16px; text-align: left; font-size: 13px; font-weight: 600; color: #888; border-bottom: 1px solid #eee; white-space: nowrap; }
        .oq-td { padding: 12px 16px; font-size: 13px; color: #444; border-bottom: 1px solid #f5f5f5; vertical-align: middle; white-space: nowrap; }
        .table-row { transition: background 0.15s; }
        .table-row:hover { background: #fafafa; }
        
        /* Checkbox & badges */
        .custom-cb { width: 18px; height: 18px; border-radius: 5px; border: 1.5px solid #ccc; display: flex; align-items: center; justify-content: center; cursor: pointer; background: #fff; }
        .custom-cb.checked { background: #765bcf; border-color: #765bcf; color: #fff; font-size: 10px; }
        
        .badge { display: inline-flex; padding: 4px 8px; border-radius: 6px; border: 1px solid #eee; font-size: 12px; margin-right: 4px; color: #555; background: #f5f5f5; font-weight: 500; }
        
        .act-btn { width: 28px; height: 28px; border-radius: 6px; border: 1px solid transparent; background: transparent; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #888; transition: 0.15s; font-size: 13px; }
        .act-btn:hover { background: #f0f0f0; color: #222; }
        
        /* Top buttons */
        .top-btn { height: 38px; padding: 0 16px; border-radius: 8px; display: inline-flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 600; cursor: pointer; transition: 0.15s; }
        .btn-outline { border: 1px solid #e0e0e0; background: #fff; color: #444; }
        .btn-outline:hover { background: #f5f5f5; }
        .btn-primary { border: none; background: #765bcf; color: #fff; }
        .btn-primary:hover { background: #5e48a8; }
        
        .drag-drop { border: 2px dashed #e2e8f0; border-radius: 10px; padding: 24px; text-align: center; cursor: pointer; margin-bottom: 16px; transition: 0.2s; }
        .drag-drop:hover { border-color: #765bcf; background: #f8f7ff; }

        /* Modal Overlay & Modal */
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 600; opacity: 0; pointer-events: none; transition: 0.3s; display: flex; align-items: center; justify-content: center; }
        .modal-overlay.open { opacity: 1; pointer-events: all; }
        
        .t-modal { background: #fff; width: 400px; border-radius: 12px; box-shadow: 0 8px 30px rgba(0,0,0,0.12); transform: scale(0.95); transition: 0.3s; padding: 24px; }
        .modal-overlay.open .t-modal { transform: scale(1); }

        .modal-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
        .modal-title { font-size: 18px; font-weight: 700; color: #222; margin: 0 0 4px 0; }
        .modal-subtitle { font-size: 13px; color: #666; margin: 0; }
        .modal-close { background: none; border: none; font-size: 16px; color: #999; cursor: pointer; }

        .guruh-btn {
          width: 100%; height: 44px; border-radius: 8px; border: 1px solid #e2e8f0; background: #fff;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          color: #765bcf; font-weight: 600; font-size: 14px; cursor: pointer; margin-bottom: 16px;
        }
      `}</style>

      {/* MODAL Overlay (Guruh qoshish) */}
      <div className={`modal-overlay ${modalOpen ? "open" : ""}`}>
        <div className="t-modal bg-white">
          <div className="modal-header">
            <div>
              <h2 className="modal-title">Guruhga biriktirish</h2>
              <p className="modal-subtitle">Bir yoki bir nechta guruhni tanlang</p>
            </div>
            <button className="modal-close" onClick={() => setModalOpen(false)}><i className="fa-solid fa-xmark"></i></button>
          </div>
          <input 
            className="oq-input" 
            placeholder="Guruh qidirish..." 
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
              <div style={{ padding: 8, fontSize: 13, color: "#999", textAlign: "center" }}>Guruh topilmadi</div>
            )}
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
            <button className="top-btn btn-outline" onClick={() => setModalOpen(false)}>Bekor qilish</button>
            <button className="top-btn btn-primary" onClick={saveGuruhlar}>Qo'shish</button>
          </div>
        </div>
      </div>

      {/* Drawer Overlay */}
      <div className={`oqit-overlay ${drawerOpen ? "open" : ""}`} onClick={() => setDrawer(false)}></div>

      {/* Drawer */}
      <div className={`oqit-drawer ${drawerOpen ? "open" : ""}`}>
        <div className="oq-header">
          <div>
            <h2 className="oq-title">Talaba qo'shish</h2>
            <p className="oq-subtitle">Bu yerda siz yangi Talaba qo'shishingiz mumkin.</p>
          </div>
          <button className="oq-close" onClick={() => setDrawer(false)}><i className="fa-solid fa-xmark"></i></button>
        </div>
        <div className="oq-body">
          <label className="oq-label">Telefon raqam</label>
          <input className="oq-input" value={tel} onChange={e => setTel(e.target.value)} />

          <label className="oq-label">Mail</label>
          <input className="oq-input" type="email" placeholder="Elektron pochtani kiriting" value={email} onChange={e => setEmail(e.target.value)} />

          <label className="oq-label">Talaba FIO</label>
          <input className="oq-input" placeholder="Ma'lumotni kiriting" value={fio} onChange={e => setFio(e.target.value)} />

          <label className="oq-label">Tug'ilgan sanasi</label>
          <div style={{ position: "relative" }}>
            <input type="date" className="oq-input" value={sana} onChange={e => setSana(e.target.value)} />
          </div>

          <label className="oq-label">Manzil</label>
          <input className="oq-input" placeholder="Manzilni kiriting" value={manzil} onChange={e => setManzil(e.target.value)} />

          <label className="oq-label">Parol</label>
          <input className="oq-input" type="password" placeholder="Parolni kiriting" value={parol} onChange={e => setParol(e.target.value)} />

          <label className="oq-label">Guruh</label>
          <button className="guruh-btn" onClick={openGuruhModal}>
            <i className="fa-solid fa-plus"></i> {selectedGuruhlar.length > 0 ? `${selectedGuruhlar.length} ta guruh tanlandi` : "Guruh qo'shish"}
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
                <i className="fa-solid fa-arrow-up-from-bracket" style={{ fontSize: 24, color: "#999", marginBottom: 10 }}></i>
                <div style={{ fontSize: 13, color: "#765bcf", fontWeight: 600 }}>Click to upload <span style={{ color: "#888", fontWeight: 400 }}>or drag and drop</span></div>
                <div style={{ fontSize: 12, color: "#999", marginTop: 4 }}>JPG or PNG (max. 2 MB)</div>
              </>
            )}
          </label>
        </div>
        <div className="oq-footer">
          <button className="top-btn btn-outline" onClick={() => setDrawer(false)} style={{ flex: 1, justifyContent: "center" }}>Bekor qilish</button>
          <button className="top-btn btn-primary" onClick={create} style={{ flex: 1, justifyContent: "center", background: "#765bcf", color: "#fff", border: "none" }}>Saqlash</button>
        </div>
      </div>

      {/* Page Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#222", margin: 0 }}>Talabalar</h1>
          <button className="top-btn btn-primary" onClick={() => setDrawer(true)}>
            <i className="fa-solid fa-plus"></i> Talaba qo'shish
          </button>
        </div>
        <p style={{ fontSize: 14, color: "#666", margin: 0 }}>
          Ushbu sahifada siz Talabalar ro'yxatini va ularning ma'lumotlarini topasiz. Har bir Talaba ismi, fanlari va aloqa ma'lumotlari keltirilgan.
        </p>
      </div>

      <div className="bg-white" style={{ border: "1px solid #eee", borderRadius: 12, padding: "16px 20px" }}>
        {/* Table Toolbar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ position: "relative" }}>
            <i className="fa-solid fa-magnifying-glass" style={{ position: "absolute", left: 12, top: 12, color: "#999" }}></i>
            <input placeholder="Search" style={{ height: 40, width: 280, borderRadius: 8, border: "1px solid #eee", paddingLeft: 36, outline: "none", fontSize: 14 }} />
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <button className="top-btn btn-outline">
              <i className="fa-solid fa-filter"></i> Filters
            </button>
            <button className="top-btn btn-outline" style={{ color: "#666" }}>
              Arxiv
            </button>
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: "auto" }}>
          <table className="oq-table" style={{ border: "none" }}>
            <thead>
              <tr>
                <th className="oq-th" style={{ width: 40, borderTop: "none" }}>
                  <div className={`custom-cb ${users?.data?.length > 0 && users.data.every(d => d.selected) ? "checked" : ""}`} onClick={toggleSelectAll}>
                    {users?.data?.length > 0 && users.data.every(d => d.selected) && <i className="fa-solid fa-check"></i>}
                  </div>
                </th>
                <th className="oq-th" style={{ borderTop: "none" }}>Nomi <i className="fa-solid fa-arrow-down" style={{ fontSize: 10, marginLeft: 4 }}></i></th>
                <th className="oq-th" style={{ borderTop: "none" }}>Guruh</th>
                <th className="oq-th" style={{ borderTop: "none" }}>Telefon raqamlari</th>
                <th className="oq-th" style={{ borderTop: "none" }}>Email</th>
                <th className="oq-th" style={{ borderTop: "none" }}>Tug'ilgan sanasi</th>
                <th className="oq-th" style={{ borderTop: "none" }}>Manzil</th>
                <th className="oq-th" style={{ borderTop: "none" }}>Yaratilgan sana</th>
                <th className="oq-th" style={{ borderTop: "none", textAlign: "right" }}>Amallar</th>
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
                      <img src={`https://najot-edu.softwareengineer.uz/files/${row.photo}`} alt="" style={{ width: 32, height: 32, borderRadius: "50%", background: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", color: "#765bcf", fontSize: 12 }}>
                      </img>
                      <span style={{ fontWeight: 600 }}>{row.full_name}</span>
                    </div>
                  </td>
                  <td className="oq-td">
                    {(row.groups || []).map((g, idx) => <span key={idx} className="badge">{g.name || g.nomi || g}</span>)}
                  </td>
                  <td className="oq-td">{row.phone}</td>
                  <td className="oq-td">{row.email}</td>
                  <td className="oq-td">{new Date(row.birth_date).toLocaleDateString("en-GB")}</td>
                  <td className="oq-td">{row.address}</td>
                  <td className="oq-td">{row.created_at ? new Date(row.created_at).toLocaleDateString("en-GB") : ""}</td>
                  <td className="oq-td">
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 4 }}>
                      <button className="act-btn"><i className="fa-regular fa-eye"></i></button>
                      <button className="act-btn"><i className="fa-regular fa-trash-can"></i></button>
                      <button className="act-btn"><i className="fa-solid fa-pen"></i></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 20, paddingTop: 16, borderTop: "1px solid #eee" }}>
          <button className="top-btn btn-outline" style={{ color: "#666", border: "none" }}><i className="fa-solid fa-arrow-left"></i> Previous</button>
          <div style={{ display: "flex", gap: 8 }}>
            {[1, 2, 3, "...", 8, 9, 10].map((page, i) => (
              <button key={i} style={{ width: 32, height: 32, borderRadius: 8, border: "none", background: page === 1 ? "rgba(118,91,207,0.1)" : "transparent", color: page === 1 ? "#765bcf" : "#666", fontWeight: page === 1 ? 700 : 500, cursor: page !== "..." ? "pointer" : "default" }}>
                {page}
              </button>
            ))}
          </div>
          <button className="top-btn btn-outline" style={{ color: "#666", border: "none" }}>Next <i className="fa-solid fa-arrow-right"></i></button>
        </div>
      </div>
    </div>
  );
}