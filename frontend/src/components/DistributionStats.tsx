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

  const yearData = data && selectedYear ? data.years[selectedYear] : null
  const yearCache = cache && selectedYear ? cache.years[selectedYear] : null

  return (
    <ul>
      {dataModel && yearData && selectedKommune && dataModel.elements.flatMap(e => e.metrics).map(metric => {
        const key = metric.key
        return (
          <li key={key}>
            <strong>{metric.name}:</strong> Dårligere enn {percentile(yearData.byMetric[key], yearData.byKommune[selectedKommune][key]).toFixed()}% av kommuner.
          </li>
        )
      })}
      {dataModel && yearCache && selectedKommune && dataModel.elements.map(element => {
        const key = element.key
        return (
          <li key={key}>
            <strong>{element.name}:</strong> Dårligere enn {percentile(yearCache.byElement[key], yearCache.byKommune[selectedKommune][key]).toFixed()}% av kommuner.
          </li>
        )
      })}
      { yearCache && selectedKommune &&
        (
          <li>
            <strong>Total Risk:</strong> Dårligere enn {percentile(yearCache.byElement.totalRisk, yearCache.byKommune[selectedKommune].totalRisk).toFixed()}% av kommuner.
          </li>
        )
      }
    </ul>
  )
}

export default DistributionStats