import useDataStore, { type DistributionKey } from "../../hooks/useDataStore";
import type { RankElement } from "./DetailedStats";
import DetailsMetric from "./DetailsMetric";
import useLanguageStore from "../../hooks/useLanguageStore";
import Tooltip from "../Tooltip";

interface Props {
  e: RankElement;
}

function DetailsElement({ e }: Props) {

  const {
    setHighlightedDistribution,
    setSelectedDistribution,
    getRiskColor,
    selectedKommune,
    data,
    selectedYear,
    selectedDistribuion,
    highlightedDistribution,
  } = useDataStore();
  const { l } = useLanguageStore();

  function handleInspectDistribution(key: DistributionKey) {
    if (selectedDistribuion.type === "element" && key.type === "element" && selectedDistribuion.key === key.key) return setSelectedDistribution({ type: "risk" });
    setSelectedDistribution(key);
  }

  const kommuneData = data && selectedYear && selectedKommune ? data.years[selectedYear].byKommune[selectedKommune] : null
  
  const sortedMetrics = kommuneData ? [...e.metrics].sort((a, b) => -(kommuneData[a.key] - kommuneData[b.key])) : e.metrics;

  return (
    <li className={`detailsElement ${selectedDistribuion.type === "element" && selectedDistribuion.key === e.key ? "selected" : ""}`}>
      <div 
        onMouseEnter={() => setHighlightedDistribution({type: "element", key: e.key})}
        onMouseLeave={() => setHighlightedDistribution(null)}
        onClick={() => handleInspectDistribution({type: "element", key: e.key})}
        className={`detailsHandle ${highlightedDistribution && highlightedDistribution.type === "element" && highlightedDistribution.key === e.key ? "highlighted" : ""}`}
      >
        <div
          className="colorBox"
          style={{ "--risk-color": selectedKommune ? getRiskColor(selectedKommune, { type: "element", key: e.key }) : null } as React.CSSProperties}
        ></div>
        <div className="detailsName">
          <Tooltip text={l(e.description)}>
            {l(e.name)}:
          </Tooltip>
        </div>
        <div className="detailsRank">
          {e.rank}
        </div>
        <div className="detailsRankFylke">
          {e.rankFylke}
        </div>
      </div>
      <ul>
        {sortedMetrics.map((m, mIndex) => (
          <DetailsMetric 
            key={`${e.key}-${mIndex}`} 
            m={m} 
          />
        ))}
      </ul>
    </li>
  )
}

export default DetailsElement;