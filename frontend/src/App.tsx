import './App.css'
import { useEffect } from 'react';
import useDataStore from './hooks/useDataStore'
import Map from './components/map/Map'
import DistributionChart from './components/DistributionChart';
import DistributionStats from './components/DistributionStats';
import RiskTree from './components/RiskTree';
import RiskTable from './components/RiskTable';
import DetailedStats from './components/DetailedStats';

function App() {

  const {
    fetchData,
    highlightedKommune,
    data,
    selectedYear,
    selectedDistribuion, 
    layout,
    setLayout,
  } = useDataStore();

  // Fetch data on mount, only once
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <>
      <header>
        <div></div>
        <h1>
          {
            highlightedKommune && data && selectedYear
              ? `${highlightedKommune} ${data.years[selectedYear].byKommune[highlightedKommune].name}` 
              : "Klimarisk"
          }
        </h1>
        <button 
          onClick={() => layout === "first" ? setLayout("second") : setLayout("first")}
        >
          {layout === "first" ? " (first view)" : " (second view)"}
        </button>
      </header>
      <div className={`dashboard ${layout === "first" ? "gridLayout1" : "gridLayout2"}`}>
        <div className="panel tree">
          <h2>Risk Customization Tree</h2>
          <RiskTree />
        </div>
        <div className="panel map">
          <h2>Map View</h2>
          <Map />
        </div>
        <div className="panel chart">
          <h2>Kommune Distribution Chart</h2>
          <DistributionChart distributionKey={selectedDistribuion} />
        </div>
        <div className="panel table">
          <h2>Data Table</h2>
          <RiskTable />
        </div>
        {/* <div className="panel stats">
          <h2>Selected Kommune Details View</h2>
          <DistributionStats />
        </div> */}
        <div className="panel details">
          <h2>Details</h2>
          <DetailedStats />
        </div>
      </div>
    </>
  )
}

export default App
