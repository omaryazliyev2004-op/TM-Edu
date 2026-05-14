import { useState } from "react";

const initialData = Array(10).fill({}).map((_, i) => ({
  id: i,
  nomi: "Qwerty qwert",
  guruh: i % 2 === 0 ? ["Label"] : ["Label", "Label", "Label", "+4"],
  telefon: "+998(33)4082808",
  tugilganSana: "24 Jan 2022",
  yaratilganSana: "24 Jan 2022",
  coin: "123 123",
  avatar: "https://i.pravatar.cc/150?img=" + (i + 1),
  selected: i < 2
}));

export default function Oqituvchilar() {
  const [data, setData] = useState(initialData);
  const [drawerOpen, setDrawer] = useState(false);

  // Drawer fields
  const [tel, setTel] = useState("+998");
  const [email, setEmail] = useState("");
  const [fio, setFio] = useState("");
  const [sana, setSana] = useState("01.03.1990");
  const [jinsi, setJinsi] = useState("Erkak");

  const toggleSelectAll = () => {
    const allSelected = data.every(d => d.selected);
    setData(data.map(d => ({ ...d, selected: !allSelected })));
  };

  const toggleSelect = (id) => {
    setData(data.map(d => d.id === id ? { ...d, selected: !d.selected } : d));
  };

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
        .oq-footer { padding: 16px 24px; border-top: 1px solid #f0f0f0; display: flex; justify-content: flex-end; gap: 12px; }
        
        .oq-label { display: block; font-size: 13px; font-weight: 600; color: #444; margin-bottom: 8px; }
        .oq-input { width: 100%; height: 44px; border-radius: 8px; border: 1.5px solid #e2e8f0; padding: 0 14px; font-size: 14px; outline: none; transition: border-color 0.15s; margin-bottom: 16px; background: #fff; }
        .oq-input:focus { border-color: #765bcf; }
        
        .oq-table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 12px; overflow: hidden; border: 1px solid #eee; }
        .oq-th { padding: 14px 16px; text-align: left; font-size: 13px; font-weight: 600; color: #888; border-bottom: 1px solid #eee; white-space: nowrap; }
        .oq-td { padding: 12px 16px; font-size: 13px; color: #444; border-bottom: 1px solid #f5f5f5; vertical-align: middle; white-space: nowrap; }
        .table-row { transition: background 0.15s; }
        .table-row:hover { background: #fafafa; }
        
        .custom-cb { width: 18px; height: 18px; border-radius: 5px; border: 1.5px solid #ccc; display: flex; align-items: center; justify-content: center; cursor: pointer; background: #fff; }
        .custom-cb.checked { background: #765bcf; border-color: #765bcf; color: #fff; font-size: 10px; }
        
        .badge { display: inline-flex; padding: 4px 8px; border-radius: 6px; border: 1px solid #eee; font-size: 12px; margin-right: 4px; color: #555; background: #fff; font-weight: 500; }
        .coin-wrap { display: flex; align-items: center; gap: 6px; font-weight: 600; color: #222; }
        
        .action-btns { display: flex; align-items: center; gap: 2px; }
        .act-btn { width: 28px; height: 28px; border-radius: 6px; border: 1px solid transparent; background: transparent; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #888; transition: 0.15s; font-size: 13px; }
        .act-btn:hover { background: #f0f0f0; color: #222; }
        .act-btn.red { color: #e53935; }
        .act-btn.red:hover { background: #ffebee; }
        .act-btn.green { color: #4caf50; }
        .act-btn.green:hover { background: #e8f5e9; }
        
        .top-btn { height: 38px; padding: 0 16px; border-radius: 8px; display: inline-flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 600; cursor: pointer; transition: 0.15s; }
        .btn-outline { border: 1px solid #e0e0e0; background: #fff; color: #444; }
        .btn-outline:hover { background: #f5f5f5; }
        .btn-primary { border: none; background: #765bcf; color: #fff; }
        .btn-primary:hover { background: #5e48a8; }
        
        .drag-drop { border: 2px dashed #e2e8f0; border-radius: 10px; padding: 24px; text-align: center; cursor: pointer; margin-bottom: 16px; transition: 0.2s; }
        .drag-drop:hover { border-color: #765bcf; background: #f8f7ff; }

        .radio-wrap { display: flex; gap: 16px; margin-bottom: 20px; }
        .radio-item { display: flex; align-items: center; gap: 6px; font-size: 14px; color: #444; cursor: pointer; }
        .radio-circle { width: 18px; height: 18px; border-radius: 50%; border: 1.5px solid #ccc; display: flex; align-items: center; justify-content: center; }
        .radio-circle.active { border-color: #765bcf; }
        .radio-circle.active::after { content: ''; width: 10px; height: 10px; border-radius: 50%; background: #765bcf; }
      `}</style>

      {/* Drawer Overlay */}
      <div className={`oqit-overlay ${drawerOpen ? "open" : ""}`} onClick={() => setDrawer(false)}></div>

      {/* Drawer */}
      <div className={`oqit-drawer ${drawerOpen ? "open" : ""}`}>
        <div className="oq-header">
          <div>
            <h2 className="oq-title">O'qituvchi qoshish</h2>
            <p className="oq-subtitle">Bu yerda siz yangi o'qituvchi qo'shishingiz mumkin.</p>
          </div>
          <button className="oq-close" onClick={() => setDrawer(false)}><i className="fa-solid fa-xmark"></i></button>
        </div>
        <div className="oq-body">
          <label className="oq-label">Telefon raqam</label>
          <input className="oq-input" value={tel} onChange={e => setTel(e.target.value)} />

          <label className="oq-label">Mail</label>
          <div style={{ position: "relative" }}>
            <i className="fa-regular fa-envelope" style={{ position: "absolute", left: 14, top: 14, color: "#999" }}></i>
            <input className="oq-input" style={{ paddingLeft: 40 }} placeholder="Elektron pochtani kiriting" value={email} onChange={e => setEmail(e.target.value)} />
          </div>

          <label className="oq-label">O'qituvchi FIO</label>
          <input className="oq-input" placeholder="Ma'lumotni kiriting" value={fio} onChange={e => setFio(e.target.value)} />

          <label className="oq-label">Tug'ilgan sanasi</label>
          <div style={{ position: "relative" }}>
            <i className="fa-regular fa-calendar" style={{ position: "absolute", left: 14, top: 14, color: "#999" }}></i>
            <input className="oq-input" style={{ paddingLeft: 40 }} value={sana} onChange={e => setSana(e.target.value)} />
          </div>

          <label className="oq-label">Guruh</label>
          <div className="oq-input" style={{ height: "auto", padding: "8px 12px", display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
            <i className="fa-solid fa-magnifying-glass" style={{ color: "#999" }}></i>
            <span style={{ background: "#f5f5f5", padding: "4px 8px", borderRadius: "6px", fontSize: "12px", display: "flex", alignItems: "center", gap: "6px" }}>dFDFASC <i className="fa-solid fa-xmark" style={{ cursor: "pointer" }}></i></span>
            <span style={{ background: "#f5f5f5", padding: "4px 8px", borderRadius: "6px", fontSize: "12px", display: "flex", alignItems: "center", gap: "6px" }}>JDCCXH <i className="fa-solid fa-xmark" style={{ cursor: "pointer" }}></i></span>
          </div>

          <label className="oq-label">Jinsi</label>
          <div className="radio-wrap">
            <div className="radio-item" onClick={() => setJinsi("Erkak")}>
              <div className={`radio-circle ${jinsi === "Erkak" ? "active" : ""}`}></div> Erkak
            </div>
            <div className="radio-item" onClick={() => setJinsi("Ayol")}>
              <div className={`radio-circle ${jinsi === "Ayol" ? "active" : ""}`}></div> Ayol
            </div>
          </div>

          <label className="oq-label">Surati</label>
          <div className="drag-drop">
            <i className="fa-solid fa-cloud-arrow-up" style={{ fontSize: 24, color: "#765bcf", marginBottom: 10 }}></i>
            <div style={{ fontSize: 13, color: "#765bcf", fontWeight: 600 }}>Click to upload <span style={{ color: "#888", fontWeight: 400 }}>or drag and drop</span></div>
            <div style={{ fontSize: 12, color: "#999", marginTop: 4 }}>JPG or PNG (max. 800x800px)</div>
          </div>

          <div style={{ textAlign: "right", marginTop: 8 }}>
            <span style={{ color: "#765bcf", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>+ Parol qo'shish</span>
          </div>
        </div>
        <div className="oq-footer">
          <button className="top-btn btn-outline" onClick={() => setDrawer(false)}>Bekor qilish</button>
          <button className="top-btn btn-primary" onClick={() => setDrawer(false)}>Saqlash</button>
        </div>
      </div>

      {/* Page Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#222", margin: "0 0 8px 0" }}>O'qituvchilar</h1>
        <p style={{ fontSize: 14, color: "#666", margin: 0 }}>
          Ushbu sahifada siz o'qituvchilar ro'yxatini va ularning ma'lumotlarini topasiz. Har bir o'qituvchining ismi, fanlari va aloqa ma'lumotlari keltirilgan.
        </p>
      </div>

      {/* Toolbar 1 */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <button className="top-btn btn-outline">
          <i className="fa-solid fa-filter"></i> Filters
        </button>
        <div style={{ display: "flex", gap: 12 }}>
          <button className="top-btn btn-outline">
            <i className="fa-solid fa-cloud-arrow-up"></i> Export
          </button>
          <button className="top-btn btn-primary" onClick={() => setDrawer(true)}>
            <i className="fa-solid fa-plus"></i> O'qituvchi qo'shish
          </button>
        </div>
      </div>

      {/* Toolbar 2 (Table Actions) */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 16 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: "#444", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
            <i className="fa-solid fa-cloud-arrow-up"></i> Export
          </span>
          <span style={{ fontSize: 14, fontWeight: 600, color: "#e53935", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
            <i className="fa-regular fa-trash-can"></i> Delete
          </span>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ position: "relative" }}>
            <i className="fa-solid fa-magnifying-glass" style={{ position: "absolute", left: 12, top: 12, color: "#999" }}></i>
            <input placeholder="Search" style={{ height: 38, width: 220, borderRadius: 8, border: "1px solid #e0e0e0", paddingLeft: 36, outline: "none" }} />
          </div>
          <button className="top-btn btn-outline" style={{ color: "#666" }}>
            Arxiv <i className="fa-solid fa-chevron-down" style={{ fontSize: 10 }}></i>
          </button>
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: "auto" }}>
        <table className="oq-table">
          <thead>
            <tr>
              <th className="oq-th" style={{ width: 40 }}>
                <div className={`custom-cb ${data.every(d => d.selected) ? "checked" : ""}`} onClick={toggleSelectAll}>
                  {data.every(d => d.selected) && <i className="fa-solid fa-check"></i>}
                </div>
              </th>
              <th className="oq-th">Nomi <i className="fa-solid fa-arrow-down" style={{ fontSize: 10, marginLeft: 4 }}></i></th>
              <th className="oq-th">Guruh</th>
              <th className="oq-th">Telefon raqamlari</th>
              <th className="oq-th">Tug'ilgan sanasi</th>
              <th className="oq-th">Yaratilgan sana</th>
              <th className="oq-th">Coin</th>
              <th className="oq-th" style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.id} className="table-row">
                <td className="oq-td">
                  <div className={`custom-cb ${row.selected ? "checked" : ""}`} onClick={() => toggleSelect(row.id)}>
                    {row.selected && <i className="fa-solid fa-check"></i>}
                  </div>
                </td>
                <td className="oq-td">
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <img src={row.avatar} alt="" style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover" }} />
                    <span style={{ fontWeight: 600 }}>{row.nomi}</span>
                  </div>
                </td>
                <td className="oq-td">
                  {row.guruh.map((g, idx) => <span key={idx} className="badge">{g}</span>)}
                </td>
                <td className="oq-td">{row.telefon}</td>
                <td className="oq-td">{row.tugilganSana}</td>
                <td className="oq-td">{row.yaratilganSana}</td>
                <td className="oq-td">
                  <div className="coin-wrap">
                    <img src="/logoedu.png" alt="coin" style={{ width: 16, height: 16 }} />
                    {row.coin}
                  </div>
                </td>
                <td className="oq-td">
                  <div className="action-btns" style={{ justifyContent: "flex-end" }}>
                    <button className="act-btn red"><i className="fa-solid fa-minus"></i></button>
                    <button className="act-btn green"><i className="fa-solid fa-plus"></i></button>
                    <button className="act-btn"><i className="fa-regular fa-eye"></i></button>
                    <button className="act-btn"><i className="fa-solid fa-cloud-arrow-up"></i></button>
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 20 }}>
        <button className="top-btn btn-outline" style={{ color: "#666" }}><i className="fa-solid fa-arrow-left"></i> Previous</button>
        <div style={{ display: "flex", gap: 8 }}>
          {[1, 2, 3, "...", 8, 9, 10].map((page, i) => (
            <button key={i} style={{ width: 32, height: 32, borderRadius: 8, border: "none", background: page === 1 ? "rgba(118,91,207,0.1)" : "transparent", color: page === 1 ? "#765bcf" : "#666", fontWeight: page === 1 ? 700 : 500, cursor: page !== "..." ? "pointer" : "default" }}>
              {page}
            </button>
          ))}
        </div>
        <button className="top-btn btn-outline" style={{ color: "#666" }}>Next <i className="fa-solid fa-arrow-right"></i></button>
      </div>
    </div>
  );
}
