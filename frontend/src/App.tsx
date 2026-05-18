import './App.css'
import { useEffect } from 'react';
import useDataStore from './hooks/useDataStore'
import Map from './components/map/Map'
import DistributionChart from './components/chart/DistributionChart';
import RiskTree from './components/RiskTree';
import RiskTable from './components/RiskTable';
import DetailedStats from './components/details/DetailedStats';
import useLanguageStore, { t } from './hooks/useLanguageStore';
import Header from './components/header/Header';
import { CircleQuestionMark } from 'lucide-react';
import Tooltip from './components/Tooltip';

function App() {

  const {
    fetchData,
    selectedDistribuion, 
    layout,
  } = useDataStore();
  const { l } = useLanguageStore();

  // Fetch data on mount, only once
  useEffect(() => {
    fetchData();
  }, [fetchData]);


  return (
    <>
      <Header />
      <div className={`dashboard ${layout === "first" ? "gridLayout1" : "gridLayout2"}`}>
        <div className="panel tree">
          <h2>
            {l(t.panels.tree)}
            <Tooltip text={l(t.panels.tree.tooltip)}>
              <CircleQuestionMark />
            </Tooltip>
          </h2>
          <div className="panelScroll">
            <RiskTree />
          </div>
        </div>
        <div className="panel map">
          <h2>{l(t.panels.map)}</h2>
          <Map />
        </div>
        <div className="panel chart">
          <h2>
            {l(t.panels.chart)}
            <Tooltip text={l(t.panels.chart.tooltip)}>
              <CircleQuestionMark />
            </Tooltip>
          </h2>
          <DistributionChart distributionKey={selectedDistribuion} />
        </div>
        <div className="panel table">
          <h2>{l(t.panels.table)}</h2>
          <RiskTable />
        </div>
        <div className="panel details">
          <h2>{l(t.panels.details)}</h2>
          <div className="panelScroll">
            <DetailedStats />
          </div>
        </div>
      </div>
    </>
  )
}

export default App
