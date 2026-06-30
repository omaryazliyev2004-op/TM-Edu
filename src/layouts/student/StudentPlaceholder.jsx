import { useLang } from "../../i18n/LanguageContext";

export default function StudentPlaceholder({ title }) {
  const { t } = useLang();
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 16,
        boxShadow: "0 1px 3px rgba(0,0,0,.05)",
        padding: 48,
        marginTop: 8,
        textAlign: "center",
      }}
    >
      <i className="fa-solid fa-screwdriver-wrench" style={{ fontSize: 34, color: "#7c3aed" }}></i>
      <h2 style={{ marginTop: 16, fontSize: 20, fontWeight: 700, color: "#222" }}>{t(title)}</h2>
      <p style={{ marginTop: 8, color: "#999", fontSize: 15 }}>{t("Tez orada")}</p>
    </div>
  );
}
