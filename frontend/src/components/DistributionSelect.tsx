import useDataStore, { type ElementKey, type MetricKey, type DistributionKey } from "../hooks/useDataStore";
import { Fragment } from "react";
import useLanguageStore from "../hooks/useLanguageStore";

function encodeDistributionKey(key: DistributionKey): string {
  if (key.type === "risk") return "risk";
  return `${key.type}:${key.key}`;
}
function decodeDistributionKey(value: string): DistributionKey {
  if (value === "risk") return { type: "risk" };
  const [type, key] = value.split(":");
  if (type === "element") {
    return { type: "element", key: key as ElementKey}
  }
  return { type: "metric", key: key as MetricKey}
}



function DistributionSelect() {
  const {
    dataModel, 
    selectedDistribuion, 
    setSelectedDistribution, 
  } = useDataStore();
  const { l } = useLanguageStore();

  return (
    <select
      onChange={e => setSelectedDistribution(decodeDistributionKey(e.target.value))}
      value={encodeDistributionKey(selectedDistribuion)}
    >
      <option value="risk">
        Total Risk
      </option>
      {dataModel && dataModel.elements.map(element => (
        <Fragment key={element.key}>

          <option 
            value={encodeDistributionKey({type: "element", key: element.key})}
          >
            {l(element.name)}
          </option>

          {element.metrics.map(metric => (
            <option 
              key={metric.key} 
              value={encodeDistributionKey({type: "metric", key: metric.key})}
            >
              {"— " + l(metric.name)}
            </option>
          ))}
          
        </Fragment>
      ))}
    </select>
  )
}

export default DistributionSelect;