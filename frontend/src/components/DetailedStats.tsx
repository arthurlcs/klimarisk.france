import useDataStore from "../hooks/useDataStore";
import { getDescendingRank } from "../hooks/statistics";
import { useMemo } from "react";

function DetailedStats() {

  const { 
    dataModel,
    data,
    cache,
    selectedYear,
    selectedKommune,
  } = useDataStore();

  const yearData = data && selectedYear ? data.years[selectedYear] : null
  const yearCache = cache && selectedYear ? cache.years[selectedYear] : null

  const ranks = useMemo(() => {
    if (!yearData || !yearCache || !dataModel || !selectedKommune) return null;
    const tmp = {
      name: "Total Risk",
      rank: getDescendingRank(yearCache.byTotalRisk, yearCache.byKommune[selectedKommune].totalRisk),
      elements: dataModel.elements.filter(e => !e.disabled).map(e => ({
        name: e.name,
        rank: getDescendingRank(yearCache.byElement[e.key], yearCache.byKommune[selectedKommune][e.key]),
        metrics: e.metrics.filter(m => !m.disabled).map(m => ({
          name: m.name,
          rank: getDescendingRank(yearData.byMetric[m.key], yearData.byKommune[selectedKommune][m.key]),
        })),
      }))
    };
    return tmp
  }, [yearData, yearCache, dataModel, selectedKommune]);

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
          {ranks.name}: {ranks.rank}
          <ul>
            {ranks.elements.map((e, eIndex) => (
              <li key={eIndex}>
                {e.name}: {e.rank}
                <ul>
                  {e.metrics.map((m, mIndex) => (
                    <li key={`${eIndex}-${mIndex}`}>
                      {m.name}: {m.rank}
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