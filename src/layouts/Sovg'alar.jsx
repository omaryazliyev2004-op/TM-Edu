import { useLang } from "../i18n/LanguageContext";

export default function Sovgalar() {
    const { t } = useLang();
    return(
        <><h2>{t("Sovg'alar")}</h2></>
    )
}