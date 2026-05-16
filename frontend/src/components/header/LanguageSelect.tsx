import useLanguageStore from "../../hooks/useLanguageStore";
import { Globe } from "lucide-react";
import "./header.css";

function LanguageSelect() {
  const {
    language,
    setLanguage,
  } = useLanguageStore();

  return (
    <button
      onClick={() => language === "en" ? setLanguage("no") : setLanguage("en")}
      className="languageSelect"
    >
      <Globe />
      <div className="languageCode">
        {language === "en" ? "EN" : "NO"}
      </div>
    </button>
  )
}

export default LanguageSelect;