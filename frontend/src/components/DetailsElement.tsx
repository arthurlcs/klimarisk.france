import useDataStore, { type DistributionKey } from "../hooks/useDataStore";
import type { RankElement } from "./DetailedStats";
import DetailsMetric from "./DetailsMetric";
import { useState } from "react";

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
  } = useDataStore();

  function handleInspectDistribution(key: DistributionKey) {
    setSelectedDistribution(key);
  }

  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);

  const kommuneData = data && selectedYear && selectedKommune ? data.years[selectedYear].byKommune[selectedKommune] : null
  
  const sortedMetrics = kommuneData ? [...e.metrics].sort((a, b) => -(kommuneData[a.key] - kommuneData[b.key])) : e.metrics;

  return (
    <li>
      <div
        className="colorBox"
        style={{ "--risk-color": selectedKommune ? getRiskColor(selectedKommune, { type: "element", key: e.key }) : null } as React.CSSProperties}
      ></div>
      <span
        onMouseEnter={() => setHighlightedDistribution({type: "element", key: e.key})}
        onMouseLeave={() => setHighlightedDistribution(null)}
        onClick={() => handleInspectDistribution({type: "element", key: e.key})}
      >
        {e.name}: {e.rank} <span className="fylke">{e.rankFylke}</span>
      </span>
      <button
        onClick={() => setDrawerOpen(!drawerOpen)}
      >
        {drawerOpen ? "Hide details" : "View details"}
      </button>
      {drawerOpen && (<ul>
        {sortedMetrics.map((m, mIndex) => (
          <DetailsMetric 
            key={`${e.key}-${mIndex}`} 
            m={m} 
          />
        ))}
      </ul>)}
    </li>
  )
}

export default DetailsElement;