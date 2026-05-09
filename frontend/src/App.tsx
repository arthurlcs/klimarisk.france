import './App.css'
import { useEffect } from 'react';
import useDataStore from './hooks/useDataStore'
import Map from './components/Map'
import DistributionChart from './components/DistributionChart';
import DistributionStats from './components/DistributionStats';
import RiskTree from './components/RiskTree';
import RiskTable from './components/RiskTable';

function App() {

  const {
    fetchData,
    highlightedKommune,
    data,
    // cache,
    // dataModel,
    selectedYear,
    selectedDistribuion, 
    layout,
    setLayout,
  } = useDataStore();

  // Fetch data on mount, only once
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // if (!dataModel || !data || !cache) {
  //   return (
  //     <p>Loading...</p>
  //   )
  // }

  return (
    <>
      <header>
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
          <RiskTree />
        </div>
        <div className="panel map">
          <Map />
        </div>
        <div className="panel chart">
          <DistributionChart distributionKey={selectedDistribuion} />
        </div>
        <div className="panel table">
          <RiskTable />
        </div>
        <div className="panel stats">
          <DistributionStats />
        </div>
      </div>
    </>
  )
}

export default App
