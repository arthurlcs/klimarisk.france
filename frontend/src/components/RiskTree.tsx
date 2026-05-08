import useDataStore from "../hooks/useDataStore";
import "./RiskTree.css";

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
    <div className="risk-tree">
      <strong>Total Risk</strong>
      <ul>
        {dataModel.elements.map(element => (
          <li key={element.key}>
            <input 
              type="checkbox" 
              checked={!element.disabled} 
              onChange={(e) => {
                element.disabled = !e.target.checked;
                refreshCacheRisk(); //TODO: Check if a metric has changed while disabled
              }} 
              id={`risktree-${element.key}`}
            />
            <label htmlFor={`risktree-${element.key}`}>
              <strong>{element.name}</strong>
            </label>
            
            <ul>
              {element.metrics.map(metric => (
                <li key={metric.key}>
                  <input 
                    type="checkbox" 
                    checked={!metric.disabled} 
                    onChange={(e) => {
                      metric.disabled = !e.target.checked;
                      refreshCacheElement(element.key); // Update only this element's value
                    }}
                    id={`risktree-${element.key}-${metric.key}`}
                  />
                  <label htmlFor={`risktree-${element.key}-${metric.key}`}>
                    {metric.name}
                  </label>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default RiskTree;