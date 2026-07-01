import { useState } from "react";
export default function TeacherPlannedGroups() {
const [tab, setTab] = useState("guruhlar");

  return (
    <>
      <style>{`
        .tpg-page { width:100%; max-width:1508px; margin:0 auto; }
        .tpg-title { font-size:30px; font-weight:900; color:#07122d; margin:32px 0 34px; letter-spacing:-.25px; }
        .tpg-tabs {
          display:inline-flex;
          align-items:center;
          gap:8px;
          padding:4px;
          margin-bottom:30px;
          border-radius:12px;
          background:#f1f3f7;
        }
        .tpg-tab {
          display:flex;
          align-items:center;
          gap:10px;
          min-width:110px;
          height:42px;
          justify-content:center;
          border:none;
          border-radius:10px;
          background:transparent;
          color:#63708a;
          cursor:pointer;
          font-size:15px;
          font-weight:800;
          transition:background .15s, color .15s, box-shadow .15s;
        }
        .tpg-tab.active {
          background:#fff;
          color:#07122d;
          box-shadow:0 3px 9px rgba(15,23,42,.10);
        }
        .tpg-tab i { font-size:14px; color:currentColor; }
        .tpg-card {
          overflow:hidden;
          min-height:210px;
          background:#fff;
          border:1px solid #e7ebf2;
          border-radius:20px;
          box-shadow:0 2px 8px rgba(18,29,52,.08);
        }
        .tpg-table { width:100%; border-collapse:collapse; table-layout:fixed; }
        .tpg-table th {
          height:60px;
          padding:0 30px;
          text-align:left;
          color:#929caf;
          font-size:14px;
          font-weight:900;
          text-transform:uppercase;
          letter-spacing:.2px;
          background:#fff;
          white-space:nowrap;
        }
        .tpg-table th:last-child { text-align:center; width:70px; padding:0 24px; }
        .tpg-empty {
          height:126px;
          border-top:1px solid #f1f3f7;
          display:flex;
          align-items:center;
          justify-content:center;
          color:#9aa4b5;
          font-size:16px;
          font-weight:800;
        }

        @media (max-width: 1100px) {
          .tpg-card { overflow-x:auto; }
          .tpg-table { min-width:980px; }
        }
      `}</style>

      <div className="tpg-page">
        <h1 className="tpg-title">{"Yig'ilayotgan guruhlar"}</h1>

        <div className="tpg-tabs">
          <button
            className={`tpg-tab${tab === "guruhlar" ? " active" : ""}`}
            onClick={() => setTab("guruhlar")}
            type="button"
          >
            {"Guruhlar"}
          </button>
          <button
            className={`tpg-tab${tab === "arxiv" ? " active" : ""}`}
            onClick={() => setTab("arxiv")}
            type="button"
          >
            <i className="fa-solid fa-box-archive"></i>
            {"Arxiv"}
          </button>
        </div>

        <div className="tpg-card">
          <table className="tpg-table">
            <thead>
              <tr>
                <th>{"STATUS"}</th>
                <th>{"GURUH NOMI"}</th>
                <th>{"KURS"}</th>
                <th>{"DAVOMIYLIGI"}</th>
                <th>{"DARS VAQTI"}</th>
                <th>{"XONA"}</th>
                <th>{"O'QITUVCHI"}</th>
                <th>{"TALABALAR"}</th>
                <th><i className="fa-solid fa-rotate-right"></i></th>
              </tr>
            </thead>
          </table>
          <div className="tpg-empty">{"Hozircha guruhlar yo'q"}</div>
        </div>
      </div>
    </>
  );
}
