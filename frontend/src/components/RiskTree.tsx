import useDataStore from "../hooks/useDataStore";

function RiskTree() {

  const { 
    dataModel,
    data,
    cache,
    refreshCacheRisk,
    refreshCacheElement,
    selectedYear,
    selectedKommune,
  } = useDataStore();

  const currentKommune = data && selectedYear && selectedKommune ? data.years[selectedYear].byKommune[selectedKommune] : null
  const currentKommuneCache = cache && selectedYear && selectedKommune ? cache.years[selectedYear].byKommune[selectedKommune] : null

  if (!dataModel || !currentKommune || !currentKommuneCache) {
    return (
      <p>Click on a kommune to see details.</p>
    )
  }        

  return (
    <ul>
      <li><strong>Kommune:</strong> {currentKommune.name} ({selectedKommune})</li>
      <li><strong>Risk:</strong> {currentKommuneCache.totalRisk.toFixed(3) ?? "-"}
        <ul>
          {dataModel.elements.map(element => (
            <li key={element.key}>
              <input type="checkbox" checked={!element.disabled} onChange={(e) => {
                element.disabled = !e.target.checked;
                refreshCacheRisk(); //TODO: Check if a metric has changed while disabled
              }} />
              <strong>{element.name}:</strong> {currentKommuneCache[element.key]?.toFixed(0) ?? "-"}
              
              <ul>
                {element.metrics.map(metric => (
                  <li key={metric.key}>
                    <input type="checkbox" checked={!metric.disabled} onChange={(e) => {
                      metric.disabled = !e.target.checked;
                      refreshCacheElement(element.key); // Update only this element's value
                    }} />
                    <strong>{metric.name}:</strong> {currentKommune[metric.key]?.toFixed(0) ?? "-"}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </li>
    </ul>
  )
}

export default RiskTree;