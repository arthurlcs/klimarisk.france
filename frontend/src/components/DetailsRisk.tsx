import useDataStore, { type DistributionKey } from "../hooks/useDataStore";
import type { RankRisk } from "./DetailedStats";
import DetailsElement from "./DetailsElement";


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
  } = useDataStore();

  function handleInspectDistribution(key: DistributionKey) {
    setSelectedDistribution(key);
  }

  const kommuneCache = cache && selectedYear && selectedKommune ? cache.years[selectedYear].byKommune[selectedKommune] : null
  
  const sortedElements = kommuneCache ? [...r.elements].sort((a, b) => -(kommuneCache[a.key] - kommuneCache[b.key])) : r.elements;


  return (
    <div>
      <div
        className="colorBox"
        style={{ "--risk-color": selectedKommune ? getRiskColor(selectedKommune, { type: "risk" }) : null } as React.CSSProperties}
      ></div>
      <span
        onMouseEnter={() => setHighlightedDistribution({type: "risk"})}
        onMouseLeave={() => setHighlightedDistribution(null)}
        onClick={() => handleInspectDistribution({type: "risk"})}
      >
        {r.name}: {r.rank} <span className="fylke">{r.rankFylke}</span>
      </span>
      <ul>
        {sortedElements.map((e, eIndex) => (
          <DetailsElement key={eIndex} e={e} />
        ))}
      </ul>
    </div>
  )
}

export default DetailsRisk;