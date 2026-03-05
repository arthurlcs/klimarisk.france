import useDataStore from "../hooks/useDataStore";

function StatList() {

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

  return (
    <div>
      <h2>Kommune Statistics</h2>
      {dataModel && currentKommune && currentKommuneCache ? 
      (
        <ul>
          <li><strong>Kommune:</strong> {currentKommune.name} ({selectedKommune})</li>
          <li><strong>Risk:</strong> {currentKommuneCache.totalRisk.toFixed(3) ?? "-"}
            <ul>
              {dataModel.elements.map((element, index) => (
                <li key={index}>
                  <input type="checkbox" checked={!element.disabled} onChange={(e) => {
                    element.disabled = !e.target.checked;
                    refreshCacheRisk(); //TODO: Check if a metric has changed while disabled
                  }} />
                  <strong>{element.name}:</strong> {currentKommuneCache[index]?.toFixed(0) ?? "-"}
                  
                  <ul>
                    {element.metrics.map((metric, mIndex) => (
                      <li key={mIndex}>
                        <input type="checkbox" checked={!metric.disabled} onChange={(e) => {
                          metric.disabled = !e.target.checked;
                          refreshCacheElement(index); // Update only this element's value
                        }} />
                        <strong>{metric.name}:</strong> {currentKommune[metric.key]?.toFixed(0) ?? "-"}</li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </li>
        </ul>
      ) : (
        <p>Click on a kommune to see details.</p>
      )
      }
    </div>
  );
}

export default StatList;