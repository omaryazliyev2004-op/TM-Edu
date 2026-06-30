import { useEffect, useState } from "react";
import { fetchApi, fileUrl } from "../../api/user.api";
import { useLang } from "../../i18n/LanguageContext";

function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (isNaN(d)) return value;
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}.${mm}.${d.getFullYear()}`;
}

export default function TeacherProfile() {
  const { t } = useLang();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    fetchApi("teachers/my/profile")
      .then((res) => {
        if (!alive) return;
        setData(res.data?.data ?? res.data ?? null);
      })
      .catch(() => alive && setData(null))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, []);

  const groups = Array.isArray(data?.groups) ? data.groups : [];

  const infoItems = [
    { icon: "fa-envelope", label: "Email", value: data?.email },
    { icon: "fa-phone", label: "Telefon raqam", value: data?.phone },
    { icon: "fa-location-dot", label: "Manzil", value: data?.address },
    { icon: "fa-calendar", label: "Ro'yxatdan o'tgan sana", value: formatDate(data?.created_at) },
  ];

  return (
    <>
      <style>{`
        .tp-title { font-size:30px; font-weight:900; color:#07122d; margin:0 0 28px; letter-spacing:-.25px; }
        .tp-grid { display:block; }

        .tp-card { background:#fff; border:1px solid #e7ebf2; border-radius:14px; box-shadow:0 2px 8px rgba(18,29,52,.08); }
        .tp-panel { display:flex; align-items:stretch; gap:30px; min-height:270px; padding:30px; }
        .tp-left { width:225px; min-height:208px; border-radius:14px; overflow:hidden; padding-bottom:0; background:#08d466; display:flex; flex-direction:column; align-items:center; justify-content:center; flex-shrink:0; }
        .tp-banner { display:none; }
        .tp-avatar-wrap { display:flex; justify-content:center; margin:0 0 24px; }
        .tp-avatar { width:100px; height:100px; border-radius:50%; border:5px solid #eafff3; object-fit:cover; background:#08d466; }
        .tp-avatar-ph { display:flex; align-items:center; justify-content:center; font-size:34px; color:#fff; }
        .tp-name { display:none; }
        .tp-role { text-align:center; font-size:16px; color:#fff; margin:0; font-weight:500; }
        .tp-right .tp-role { color:#8f9ab0; font-size:14px; font-weight:700; }

        .tp-right { flex:1; min-width:0; padding:0; display:flex; flex-direction:column; justify-content:center; }
        .tp-section { font-size:18px; font-weight:900; color:#07122d; margin:0 0 26px; }
        .tp-section.groups { margin:30px 0 16px; }
        .tp-info { display:flex; flex-wrap:wrap; gap:24px 34px; align-items:center; }
        .tp-item { display:flex; align-items:center; gap:11px; min-width:150px; }
        .tp-ic-wrap { width:40px; height:40px; border-radius:50%; background:#dcfce7; color:#16a34a; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
        .tp-ic { font-size:15px; }
        .tp-lbl { font-size:13px; line-height:1.1; color:#9aa4b5; margin:0 0 5px; font-weight:700; }
        .tp-val { font-size:15px; font-weight:800; color:#07122d; margin:0; white-space:nowrap; }
        .tp-divider { display:none; }
        .tp-pills { display:flex; flex-wrap:wrap; gap:10px; }
        .tp-pill { display:inline-flex; align-items:center; gap:9px; padding:9px 16px; border-radius:999px; background:#eafff3; border:1px solid #c6f6d5; color:#047b38; font-size:15px; font-weight:800; }
        .tp-pill-dot { width:20px; height:20px; border-radius:50%; background:#0bd264; color:#fff; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:900; }

        .tp-empty { padding:48px; text-align:center; color:#8f9ab0; font-size:16px; font-weight:700; }

        @media (max-width: 900px) {
          .tp-panel { flex-direction:column; padding:20px; }
          .tp-left { width:100%; }
          .tp-info { gap:18px; }
        }
      `}</style>

      <h1 className="tp-title">{t("Profil")}</h1>

      {loading ? (
        <div className="tp-card tp-empty">{t("Yuklanmoqda...")}</div>
      ) : !data ? (
        <div className="tp-card tp-empty">{t("Ma'lumot topilmadi")}</div>
      ) : (
        <div className="tp-card tp-panel">
          {/* LEFT */}
          <div className="tp-left">
            <div className="tp-banner" />
            <div className="tp-avatar-wrap">
              {data.photo ? (
                <img className="tp-avatar" src={fileUrl(data.photo)} alt={data.full_name} />
              ) : (
                <div className="tp-avatar tp-avatar-ph">
                  <i className="fa-solid fa-user"></i>
                </div>
              )}
            </div>
            <h2 className="tp-name">{data.full_name || "—"}</h2>
            <p className="tp-role">{t("O'qituvchi")}</p>
          </div>

          {/* RIGHT */}
          <div className="tp-right">
            <h3 className="tp-section">{t("Shaxsiy ma'lumotlar")}</h3>
            <div className="tp-info">
              {infoItems.map((it) => (
                <div className="tp-item" key={it.label}>
                  <span className="tp-ic-wrap">
                    <i className={`fa-solid ${it.icon} tp-ic`}></i>
                  </span>
                  <div>
                    <p className="tp-lbl">{t(it.label)}</p>
                    <p className="tp-val">{it.value || "—"}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="tp-divider" />

            <h3 className="tp-section groups">{t("Guruhlar")}</h3>
            {groups.length === 0 ? (
              <p className="tp-role" style={{ textAlign: "left" }}>{t("Guruhlar yo'q")}</p>
            ) : (
              <div className="tp-pills">
                {groups.map((g, i) => (
                  <span className="tp-pill" key={i}>
                    <span className="tp-pill-dot">N</span>
                    {typeof g === "object" ? g.name || g.groupName : g}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
