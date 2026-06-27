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
    checkDistribution,
  } = useDataStore();
  const { l } = useLanguageStore();

  if (!dataModel) {
    return <p>{l(t.common.loading)}</p>;
  }

  return (
    <div className="riskTree">
      <ul>
        {dataModel.elements.map(element => (
          <li
            key={element.key}
            onMouseEnter={() => setHighlightedDistribution({ type: "element", key: element.key })}
            onMouseLeave={() => setHighlightedDistribution(null)}
            className={`treeElement ${element.disabled ? "disabled" : ""}`}
          >
            <div className="treeRow">
              <label
                htmlFor={`risktree-${element.key}`}
                className="treeHandle"
              >
                <input
                  type="checkbox"
                  checked={!element.disabled}
                  onChange={(e) => {
                    element.disabled = !e.target.checked;
                    refreshCacheRisk();
                    checkDistribution();
                  }}
                  id={`risktree-${element.key}`}
                  className="treeBox"
                />
                <div className="treeName">{l(element.name)}</div>
              </label>

              {/* 🎯 Icône d'explication isolée pour l'élément parent */}
              {element.description && (
                <div className="treeInfoIcon">
                  <Tooltip text={l(element.description)}>
                    <span className="infoChar">ⓘ</span>
                  </Tooltip>
                </div>
              )}
            </div>

            <ul>
              {element.metrics.map(metric => (
                <li
                  key={metric.key}
                  className={`treeMetric ${element.disabled || metric.disabled ? "disabled" : ""}`}
                >
                  <div className="treeRow">
                    <label
                      htmlFor={`risktree-${element.key}-${metric.key}`}
                      className="treeHandle"
                    >
                      <input
                        type="checkbox"
                        disabled={element.disabled}
                        checked={!metric.disabled}
                        onChange={(e) => {
                          metric.disabled = !e.target.checked;
                          refreshCacheElement(element.key);
                          checkDistribution();
                        }}
                        id={`risktree-${element.key}-${metric.key}`}
                        className="treeBox"
                      />
                      <div className="treeName">{l(metric.name)}</div>
                    </label>

                    {/* 🎯 Icône d'explication isolée pour la métrique enfant */}
                    {metric.description && (
                      <div className="treeInfoIcon">
                        <Tooltip text={l(metric.description)}>
                          <span className="infoChar">ⓘ</span>
                        </Tooltip>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default RiskTree;