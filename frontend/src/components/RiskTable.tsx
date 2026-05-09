import { useState, useMemo, useEffect, useRef } from "react";
import useDataStore, { type KommuneNr } from "../hooks/useDataStore";
import "./RiskTable.css";


function RiskTable() {

  const {
    dataModel,
    data,
    cache,
    selectedYear,
    selectedKommune,
    setSelectedKommune,
    highlightedKommune,
    setHighlightedKommune,
  } = useDataStore();

  const [sortKey, setSortKey] = useState<string>("totalRisk");
  const [sortAscending, setSortAscending] = useState<boolean>(false);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      if (!sortAscending) {
        setSortAscending(true);
      } else {
        setSortKey("totalRisk");
        setSortAscending(false);
      }
    } else {
      setSortKey(key);
      setSortAscending(false);
    }
  };

  const rows = useMemo(() => {
    if (!data || !cache || !dataModel || !selectedYear) return [];
    const tmp = Object.keys(data.years[selectedYear].byKommune).map(k => {
      const kommuneData = data.years[selectedYear].byKommune[k as KommuneNr];
      const kommuneCache = cache.years[selectedYear].byKommune[k as KommuneNr];
      return {
        name: kommuneData.name as string,
        komNr: k,
        totalRisk: kommuneCache.totalRisk as number,
        ...Object.fromEntries(dataModel.elements.map(e => [e.name, kommuneCache[e.key]])),
        ...Object.fromEntries(dataModel.elements.flatMap(e => e.metrics.map(m => [m.name, kommuneData[m.key]]))),
      }
    });
    return tmp as {
      name: string;
      komNr: KommuneNr;
      totalRisk: number;
      [key: string]: string | number;
    }[];
  }, [data, cache, dataModel, selectedYear]);
  
  
  const rowsSorted = useMemo(() => {
    return [...rows].sort((a, b) => {
      const aValue: string | number = a && sortKey in a ? (a[sortKey] as string | number) ?? '' : '';
      const bValue: string | number = b && sortKey in b ? (b[sortKey] as string | number) ?? '' : '';

      if (aValue === bValue) return 0;
      if (aValue === undefined) return 1;
      if (bValue === undefined) return -1;
      if (aValue < bValue) return sortAscending ? -1 : 1;
      if (aValue > bValue) return sortAscending ? 1 : -1;
      return 0;
    });
  }, [rows, sortKey, sortAscending]);
  

  const headers = [
    ...dataModel?.elements.flatMap(e => [e.name, ...e.metrics.map(m => m.name)]) || []
  ]

  // Scroll selected row into view when selectedKommune changes
  const selectedRowRef = useRef<HTMLTableRowElement>(null);
  useEffect(() => {
    if (selectedRowRef.current !== null) {
      selectedRowRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [selectedKommune]);

  if (!data || !cache) {
    return (
      <p>Loading...</p>
    )
  }
  return (
    <div>
      <h2>Risk Table</h2>
      <p>This is a placeholder for the risk table component.</p>
      <table>
        <thead>
          <tr>
            <th>
              #
            </th>
            <th>
              Kommune
            </th>
            <th>
              <button type="button" onClick={() => handleSort("totalRisk")}>
                Risk
                <div className="sortIcon">
                  {sortKey === "totalRisk" && (
                    sortAscending ? "↑" : "↓"
                  )}
                </div>
              </button>
            </th>
            {headers.map((header, index) => (
              <th key={index}>
                <button type="button" onClick={() => handleSort(header)}>
                  {header}
                  <div className="sortIcon">
                    {sortKey === header && (
                      sortAscending ? "↑" : "↓"
                    )}
                  </div>
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rowsSorted.map((row, index) => (
            <tr 
              key={index} 
              className={`${row.komNr === selectedKommune ? 'selected' : ''} ${row.komNr === highlightedKommune ? 'highlighted' : ''}`}
              onMouseEnter={() => setHighlightedKommune(row.komNr)}
              onMouseLeave={() => setHighlightedKommune(null)}
              ref={row.komNr === selectedKommune ? selectedRowRef : null}
              onClick={() => setSelectedKommune(row.komNr)}
            >
              <td>
                {index + 1}
              </td>
              <td>
                {row.name}
              </td>
              <td>
                {row.totalRisk !== null && row.totalRisk !== undefined ? row.totalRisk.toFixed(0) : ''}
              </td>
              {headers.map((header, headerIndex) => (
                <td key={headerIndex}>
                  {row[header] !== null && row[header] !== undefined ? (row[header] as number).toFixed(0) : ''}
                </td>
              ))}
            </tr>
          ))}
        </tbody>

      </table>
    </div>
  );
}

export default RiskTable;