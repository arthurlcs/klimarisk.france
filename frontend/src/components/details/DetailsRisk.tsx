import useDataStore, { type DistributionKey } from "../../hooks/useDataStore";
import type { RankRisk } from "./DetailedStats";
import DetailsElement from "./DetailsElement";
import useLanguageStore from "../../hooks/useLanguageStore";


interface Props {
  r: RankRisk;
}

function DetailsRisk({ r }: Props) {

  const {
    selectedKommune,
    setHighlightedDistribution,
    setSelectedDistribution,
    getRiskColor,
    cache,
    selectedYear,
    selectedDistribuion,
    highlightedDistribution,
  } = useDataStore();
  const { l } = useLanguageStore();

  function handleInspectDistribution(key: DistributionKey) {
    setSelectedDistribution(key);
  }

  const kommuneCache = cache && selectedYear && selectedKommune ? cache.years[selectedYear].byKommune[selectedKommune] : null
  
  const sortedElements = kommuneCache ? [...r.elements].sort((a, b) => {
    const aVal = a.invert ? 100 - kommuneCache[a.key] : kommuneCache[a.key];
    const bVal = b.invert ? 100 - kommuneCache[b.key] : kommuneCache[b.key];
    return -(aVal - bVal)
  }) : r.elements;


  return (
    <div 
      className={`detailsRisk ${selectedDistribuion.type === "risk" ? "selected" : ""}`}
    >
      <div 
        onMouseEnter={() => setHighlightedDistribution({type: "risk"})}
        onMouseLeave={() => setHighlightedDistribution(null)}
        onClick={() => handleInspectDistribution({type: "risk"})}
        className={`detailsHandle ${highlightedDistribution && highlightedDistribution.type === "risk" ? "highlighted" : ""}`}
      >
        <div
          className="colorBox"
          style={{ "--risk-color": selectedKommune ? getRiskColor(selectedKommune, { type: "risk" }) : null } as React.CSSProperties}
        ></div>
        <div className="detailsName">
          {l(r.name)}:
        </div>
        <div className="detailsRank">
          {r.rank}
        </div>
        <div className="detailsRankFylke">
          {r.rankFylke}
        </div>
      </div>
      <ul>
        {sortedElements.map((e, eIndex) => (
          <DetailsElement key={eIndex} e={e} />
        ))}
      </ul>
    </div>
  )
}

export default DetailsRisk;