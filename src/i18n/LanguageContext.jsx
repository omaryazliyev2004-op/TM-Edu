import { createContext, useContext, useState, useCallback } from "react";
import { dictionary } from "./translations";

const LanguageContext = createContext();

// Til kodlari: "uz" (manba), "ru", "en"
export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem("lang") || "uz");

  const changeLang = useCallback((next) => {
    setLang(next);
    localStorage.setItem("lang", next);
  }, []);

  // t("o'zbekcha matn") -> joriy tildagi ekvivalent (topilmasa o'zbekcha qaytadi)
  const t = useCallback(
    (text) => {
      if (lang === "uz" || text == null) return text;
      return dictionary[lang]?.[text] ?? text;
    },
    [lang]
  );

  return (
    <LanguageContext.Provider value={{ lang, changeLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useLang() {
  const ctx = useContext(LanguageContext);
  // Provider tashqarisida ham yiqilmasligi uchun xavfsiz fallback
  return ctx || { lang: "uz", changeLang: () => {}, t: (x) => x };
}
