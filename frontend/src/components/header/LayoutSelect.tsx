import useDataStore from "../../hooks/useDataStore";
import useLanguageStore, { t } from "../../hooks/useLanguageStore";


function LayoutSelect() {
  const {
    layout,
    setLayout,
  } = useDataStore();
  const { l } = useLanguageStore();

  return (
    <div className="layoutSelect">
      <div className="label">
        {l(t.header.layout.selected)}:
      </div>
      <button 
        onClick={() => layout === "first" ? setLayout("second") : setLayout("first")}
      >
        {layout === "first" ? l(t.header.layout.l1) : l(t.header.layout.l2)}
      </button>
    </div>
  )
}

export default LayoutSelect;