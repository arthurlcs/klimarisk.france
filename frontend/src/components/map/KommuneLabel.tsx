import useDataStore from "../../hooks/useDataStore";
import "./Map.css";

function KommuneLabel() {
  const {
    highlightedKommune,
    data,
    selectedYear,
  } = useDataStore();

  return (
    <div className="kommuneLabel">
      {highlightedKommune && data && selectedYear && (
        <div className="kommuneLabel">
          {data.years[selectedYear].byKommune[highlightedKommune].name}
        </div>
      )}
    </div>
  )
}

export default KommuneLabel;