import './App.css'
import { useEffect } from 'react';
import useDataStore from './hooks/useDataStore'
import Map from './components/Map'
import StatList from './components/StatList';

function App() {

  const {
    fetchData,
    highlightedKommune,
    data,
    selectedYear,
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
        <Map />
        <StatList />
      </div>
    </>
  )
}

export default App
