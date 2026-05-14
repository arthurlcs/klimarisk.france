import './App.css'
import { useEffect } from 'react';
import useDataStore from './hooks/useDataStore'
import Map from './components/map/Map'
import DistributionChart from './components/DistributionChart';
import RiskTree from './components/RiskTree';
import RiskTable from './components/RiskTable';
import DetailedStats from './components/DetailedStats';
import useLanguageStore, { t } from './hooks/useLanguageStore';

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

  const {
    language,
    setLanguage,
    l,
  } = useLanguageStore();

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
        <div>
          <button
            onClick={() => language === "en" ? setLanguage("no") : setLanguage("en")}
          >
            {language === "en" ? "English" : "Norsk"}
          </button>
          <button 
            onClick={() => layout === "first" ? setLayout("second") : setLayout("first")}
          >
            {layout === "first" ? l(t.header.layout) : l(t.header.layout)}
          </button>
        </div>
      </header>
      <div className={`dashboard ${layout === "first" ? "gridLayout1" : "gridLayout2"}`}>
        <div className="panel tree">
          <h2>{l(t.panels.tree)}</h2>
          <RiskTree />
        </div>
        <div className="panel map">
          <h2>{l(t.panels.map)}</h2>
          <Map />
        </div>
        <div className="panel chart">
          <h2>{l(t.panels.chart)}</h2>
          <DistributionChart distributionKey={selectedDistribuion} />
        </div>
        <div className="panel table">
          <h2>{l(t.panels.table)}</h2>
          <RiskTable />
        </div>
        {/* <div className="panel stats">
          <h2>Selected Kommune Details View</h2>
          <DistributionStats />
        </div> */}
        <div className="panel details">
          <h2>{l(t.panels.details)}</h2>
          <DetailedStats />
        </div>
      </div>
    </>
  )
}

export default App
