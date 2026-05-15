import useDataStore from "../hooks/useDataStore";
import "./RiskTree.css";
import useLanguageStore, { t } from "../hooks/useLanguageStore";
import Tooltip from "./Tooltip";

function RiskTree() {

  const { 
    dataModel,
    refreshCacheRisk,
    refreshCacheElement,
    setHighlightedDistribution,
  } = useDataStore();
  const { l } = useLanguageStore();

  if (!dataModel) {
    return (
      <p>{l(t.common.loading)}</p>
    )
  }        

  return (
    <div className="riskTree">
      {/* <div className="treeHandle">
        {l(t.common.totalRisk)}
      </div> */}
      <ul>
        {dataModel.elements.map(element => (
          <li 
            key={element.key}
            onMouseEnter={() => setHighlightedDistribution({type: "element", key: element.key})}
            onMouseLeave={() => setHighlightedDistribution(null)}
            className={`treeElement ${element.disabled ? "disabled" : ""}`}
          >
            <label 
              htmlFor={`risktree-${element.key}`}
              className="treeHandle"
            >
              <input 
                type="checkbox" 
                checked={!element.disabled} 
                onChange={(e) => {
                  element.disabled = !e.target.checked;
                  refreshCacheRisk(); //TODO: Check if a metric has changed while disabled
                }} 
                id={`risktree-${element.key}`}
                className="treeBox"
              />
              <div className="treeName">
                <Tooltip text={l(element.description)}>
                  {l(element.name)}
                </Tooltip>
              </div>
            </label>

            <ul>
              {element.metrics.map(metric => (
                <li 
                  key={metric.key}
                  className={`treeMetric ${element.disabled || metric.disabled ? "disabled" : ""}`}
                >
                  <label 
                    htmlFor={`risktree-${element.key}-${metric.key}`}
                    className="treeHandle"
                  >
                    <input 
                      type="checkbox" 
                      checked={!metric.disabled} 
                      onChange={(e) => {
                        metric.disabled = !e.target.checked;
                        refreshCacheElement(element.key); // Update only this element's value
                      }}
                      id={`risktree-${element.key}-${metric.key}`}
                      className="treeBox"
                    />
                    <div className="treeName">
                      <Tooltip text={l(metric.description)}>
                        {l(metric.name)}
                      </Tooltip>
                    </div>
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