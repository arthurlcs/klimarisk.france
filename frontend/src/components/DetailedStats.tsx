import useDataStore, { type DistributionKey, type ElementKey} from "../hooks/useDataStore";
import { getDescendingRank } from "../hooks/statistics";
import { useMemo } from "react";

function DetailedStats() {

  const { 
    dataModel,
    data,
    cache,
    selectedYear,
    selectedKommune,
    setHighlightedDistribution,
    setSelectedDistribution,
    refreshCacheElement,
    refreshCacheRisk,
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
        key: e.key,
        rank: getDescendingRank(yearCache.byElement[e.key], yearCache.byKommune[selectedKommune][e.key]),
        metrics: e.metrics.filter(m => !m.disabled).map(m => ({
          name: m.name,
          key: m.key,
          rank: getDescendingRank(yearData.byMetric[m.key], yearData.byKommune[selectedKommune][m.key]),
        })),
      }))
    };
    return tmp
  }, [yearData, yearCache, dataModel, selectedKommune]);

  function handleInspectDistribution(key: DistributionKey) {
    setSelectedDistribution(key);
    
    if (!dataModel) return;
    switch (key.type) {
      case "risk": { 
        const toggledElements: Record<ElementKey, number> = {};
        dataModel.elements.forEach(e => {
          e.disabled = false;
          e.metrics.forEach(m => {
            if (m.disabled) toggledElements[e.key] = 1;
            m.disabled = false;
          })
        })
        const keys = Object.keys(toggledElements);
        if (keys.length === 0) {
          refreshCacheRisk();
        } else {
          keys.forEach(e => refreshCacheElement(e as ElementKey));
        }
        break;
      }
      case "element": {
        dataModel.elements.forEach(e => {
          if (key.key === e.key) {
            e.disabled = false;
            e.metrics.forEach(m => {
              m.disabled = false;
            })
          } else {
            e.disabled = true;
          }
        })
        refreshCacheElement(key.key);
        break;
      }  
      case "metric": {
        let el;
        dataModel.elements.forEach(e => {
          e.disabled = true;
          e.metrics.forEach(m => {
            if (key.key === m.key) {
              e.disabled = false;
              m.disabled = false;
              el = e.key;
            } else {
              m.disabled = true;
            }
          })
        })
        refreshCacheElement(el!);
        break;
      }
    }
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
            {ranks.name}: {ranks.rank}
          </span>
          <ul>
            {ranks.elements.map((e, eIndex) => (
              <li key={eIndex}>
                <span
                  onMouseEnter={() => setHighlightedDistribution({type: "element", key: e.key})}
                  onMouseLeave={() => setHighlightedDistribution(null)}
                  onClick={() => handleInspectDistribution({type: "element", key: e.key})}
                >
                  {e.name}: {e.rank}
                </span>
                <ul>
                  {e.metrics.map((m, mIndex) => (
                    <li 
                      key={`${eIndex}-${mIndex}`}
                      onMouseEnter={() => setHighlightedDistribution({type: "metric", key: m.key})}
                      onMouseLeave={() => setHighlightedDistribution(null)}
                      onClick={() => handleInspectDistribution({type: "metric", key: m.key})}
                    >
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