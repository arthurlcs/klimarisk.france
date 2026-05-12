import useDataStore, { type DistributionKey } from "../hooks/useDataStore";
import { getDescendingRank } from "../hooks/statistics";
import { useMemo } from "react";
import "./DetailedStats.css";

function DetailedStats() {

  const { 
    dataModel,
    data,
    cache,
    selectedYear,
    selectedKommune,
    setHighlightedDistribution,
    setSelectedDistribution,
    getFylkeDistribution,
  } = useDataStore();

  const yearData = data && selectedYear ? data.years[selectedYear] : null
  const yearCache = cache && selectedYear ? cache.years[selectedYear] : null

  const ranks = useMemo(() => {
    if (!yearData || !yearCache || !dataModel || !selectedKommune || !selectedYear) return null;
    const tmp = {
      name: "Total Risk",
      rank: getDescendingRank(yearCache.byTotalRisk, yearCache.byKommune[selectedKommune].totalRisk),
      rankFylke: getDescendingRank(getFylkeDistribution(selectedKommune, { type: "risk" }, selectedYear)!, yearCache.byKommune[selectedKommune].totalRisk),
      elements: dataModel.elements.filter(e => !e.disabled).map(e => ({
        name: e.name,
        key: e.key,
        rank: getDescendingRank(yearCache.byElement[e.key], yearCache.byKommune[selectedKommune][e.key]),
        rankFylke: getDescendingRank(getFylkeDistribution(selectedKommune, { type: "element", key: e.key }, selectedYear)!, yearCache.byKommune[selectedKommune][e.key]),
        metrics: e.metrics.filter(m => !m.disabled).map(m => ({
          name: m.name,
          key: m.key,
          rank: getDescendingRank(yearData.byMetric[m.key], yearData.byKommune[selectedKommune][m.key]),
          rankFylke: getDescendingRank(getFylkeDistribution(selectedKommune, { type: "metric", key: m.key }, selectedYear)!, yearData.byKommune[selectedKommune][m.key])
        })),
      }))
    };
    return tmp
  }, [yearData, yearCache, dataModel, selectedKommune, getFylkeDistribution, selectedYear]);

  function handleInspectDistribution(key: DistributionKey) {
    setSelectedDistribution(key);
  }

  if (!yearData || !yearCache || !dataModel) {
    return (
      <div>Loading...</div>
    )
  }

  return (
    <div>
      {!selectedKommune || !ranks ? (
        <div>
          Select a kommune.
        </div>
      ) : (
        <div>
          <span
            onMouseEnter={() => setHighlightedDistribution({type: "risk"})}
            onMouseLeave={() => setHighlightedDistribution(null)}
            onClick={() => handleInspectDistribution({type: "risk"})}
          >
            {ranks.name}: {ranks.rank} <span className="fylke">{ranks.rankFylke}</span>
          </span>
          <ul>
            {ranks.elements.map((e, eIndex) => (
              <li key={eIndex}>
                <span
                  onMouseEnter={() => setHighlightedDistribution({type: "element", key: e.key})}
                  onMouseLeave={() => setHighlightedDistribution(null)}
                  onClick={() => handleInspectDistribution({type: "element", key: e.key})}
                >
                  {e.name}: {e.rank} <span className="fylke">{e.rankFylke}</span>
                </span>
                <ul>
                  {e.metrics.map((m, mIndex) => (
                    <li 
                      key={`${eIndex}-${mIndex}`}
                      onMouseEnter={() => setHighlightedDistribution({type: "metric", key: m.key})}
                      onMouseLeave={() => setHighlightedDistribution(null)}
                      onClick={() => handleInspectDistribution({type: "metric", key: m.key})}
                    >
                      {m.name}: {m.rank} <span className="fylke">{m.rankFylke}</span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default DetailedStats;