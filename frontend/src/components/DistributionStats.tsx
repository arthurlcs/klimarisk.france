import useDataStore from "../hooks/useDataStore";
import { percentile } from "../hooks/statistics";

function DistributionStats() {

  const { 
    dataModel,
    data,
    cache,
    selectedYear,
    selectedKommune,
  } = useDataStore();

  const currentKommune = data && selectedYear && selectedKommune ? data.years[selectedYear].byKommune[selectedKommune] : null
  const yearCache = cache && selectedYear ? cache.years[selectedYear] : null

  return (
    <ul>
      {dataModel && currentKommune && yearCache && dataModel.elements.flatMap(e => e.metrics).map(metric => {
        const key = metric.key
        return (
          <li key={key}>
            <strong>{metric.name}:</strong> Dårligere enn {percentile(yearCache.byMetric[key], currentKommune[key]).toFixed()}% av kommuner.
          </li>
        )
      })}
    </ul>
  )
}

export default DistributionStats