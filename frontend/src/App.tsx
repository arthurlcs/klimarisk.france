import './App.css'
import { useEffect } from 'react';
import useDataStore from './hooks/useDataStore'
import Map from './components/Map'
import DistributionChart from './components/DistributionChart';
import DistributionStats from './components/DistributionStats';
import RiskTree from './components/RiskTree';

function App() {

  const {
    fetchData,
    highlightedKommune,
    data,
    selectedYear,
    selectedDistribuion, 
  } = useDataStore();

  // Fetch data on mount, only once
  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
      </header>
      <div className="dashboard">
        <div className="col">
          <RiskTree />
        </div>
        <div className="col">
          <Map />
        </div>
        <div className="col">
          <DistributionChart distributionKey={selectedDistribuion} />
        </div>
        <div className="col">
          <DistributionStats />
        </div>
      </div>
    </>
  )
}

export default App
