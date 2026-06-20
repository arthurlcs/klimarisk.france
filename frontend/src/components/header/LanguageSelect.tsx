import useLanguageStore from "../../hooks/useLanguageStore";
import { Globe } from "lucide-react";


function LanguageSelect() {
  const {
    language,
    setLanguage,
  } = useLanguageStore();

  return (
    <button
      onClick={() => language === "en" ? setLanguage("fr") : setLanguage("en")}
      className="languageSelect"
    >
      <div className="languageIcon">
        <Globe />
      </div>
      <div className="languageCode">
        {language === "en" ? "EN" : "FR"}
      </div>
    </button>
  )
}

export default LanguageSelect;