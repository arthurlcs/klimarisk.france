import useDataStore, { type DistributionKey } from "../../hooks/useDataStore";
import type { RankMetric } from "./DetailedStats";
import useLanguageStore from "../../hooks/useLanguageStore";

interface Props {
  m: RankMetric;
}

function DetailsMetric({ m }: Props) {

  const {
    setHighlightedDistribution,
    setSelectedDistribution,
    selectedKommune,
    getRiskColor,
    selectedDistribuion,
    highlightedDistribution,
  } = useDataStore();
  const { l } = useLanguageStore();

  function handleInspectDistribution(key: DistributionKey) {
    if (selectedDistribuion.type === "metric" && key.type === "metric" && selectedDistribuion.key === key.key) return setSelectedDistribution({ type: "risk" });
    setSelectedDistribution(key);
  }

  return (
    <li 
      className={`detailsMetric ${selectedDistribuion.type === "metric" && selectedDistribuion.key === m.key ? "selected" : ""}`}
    >
      <div 
        onMouseEnter={() => setHighlightedDistribution({type: "metric", key: m.key})}
        onMouseLeave={() => setHighlightedDistribution(null)}
        onClick={() => handleInspectDistribution({type: "metric", key: m.key})}
        className={`detailsHandle ${highlightedDistribution && highlightedDistribution.type === "metric" && highlightedDistribution.key === m.key ? "highlighted" : ""}`}
      >
        <div
          className="colorBox"
          style={{ "--risk-color": selectedKommune ? getRiskColor(selectedKommune, { type: "metric", key: m.key }) : null } as React.CSSProperties}
        ></div>
        <div className="detailsName">
          {l(m.name)}:
        </div>
        <div className="detailsRank">
          {m.rank}
        </div>
        <div className="detailsRankFylke">
          {m.rankFylke}
        </div>
      </div>
    </li>
  )
}

export default DetailsMetric;