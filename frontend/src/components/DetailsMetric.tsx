import useDataStore, { type DistributionKey } from "../hooks/useDataStore";
import type { RankMetric } from "./DetailedStats";

interface Props {
  m: RankMetric;
}

function DetailsMetric({ m }: Props) {

  const {
    setHighlightedDistribution,
    setSelectedDistribution,
    selectedKommune,
    getRiskColor,
  } = useDataStore();

  function handleInspectDistribution(key: DistributionKey) {
    setSelectedDistribution(key);
  }

  return (
    <li 
      onMouseEnter={() => setHighlightedDistribution({type: "metric", key: m.key})}
      onMouseLeave={() => setHighlightedDistribution(null)}
      onClick={() => handleInspectDistribution({type: "metric", key: m.key})}
    >
      <div
        className="colorBox"
        style={{ "--risk-color": selectedKommune ? getRiskColor(selectedKommune, { type: "metric", key: m.key }) : null } as React.CSSProperties}
      ></div>
      {m.name}: {m.rank} <span className="fylke">{m.rankFylke}</span>
    </li>
  )
}

export default DetailsMetric;