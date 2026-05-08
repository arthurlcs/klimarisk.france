import useDataStore from "../hooks/useDataStore";
import DistributionStats from "./DistributionStats";
import DistributionChart from "./DistributionChart";
import "./StatList.css";
import RiskTree from "./RiskTree";

function StatList() {

  const { 
    selectedDistribuion,
  } = useDataStore();

  return (
    <div className="stat-list">
      <h2>Kommune Statistics</h2>
      <DistributionChart distributionKey={selectedDistribuion} />
      <DistributionStats />
      <RiskTree />
    </div>
  );
}

export default StatList;