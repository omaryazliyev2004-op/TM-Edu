import { useLang } from "../i18n/LanguageContext";

export default function Sovgalar() {
    const { t } = useLang();
    return(
        <><h2 style={{ fontSize: 26, fontWeight: 700, color: "#1e293b", margin: "0 0 24px 0" }}>{t("Sovg'alar")}</h2></>
    )
}