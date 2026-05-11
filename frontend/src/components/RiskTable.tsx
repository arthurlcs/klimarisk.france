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
    layout,
  } = useDataStore();

  const [sortKey, setSortKey] = useState<string>("totalRisk");
  const [sortAscending, setSortAscending] = useState<boolean>(false);

  const handleSort = (key: string) => {
    // Special case for kommune name: Ascending -> Descending -> default
    if (key === "name") {
      if (sortKey !== key) { // First click on this column
        setSortKey(key);
        setSortAscending(true);
      } else {
        if (sortAscending) {
          setSortAscending(false);
        } else {
          setSortKey("totalRisk"); // default
          setSortAscending(false);
        }
      }
      return;
    }
    // Normal case: Descending -> Ascending -> default
    if (sortKey !== key) { // First click on this column
      setSortKey(key);
      setSortAscending(false);
    } else {
      if (!sortAscending) {
        setSortAscending(true);
      } else {
        setSortKey("totalRisk"); // default
        setSortAscending(false);
      }
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
        ...Object.fromEntries(dataModel.elements.map(e => [e.key, kommuneCache[e.key]])),
        ...layout === "second" ? Object.fromEntries(dataModel.elements.flatMap(e => e.metrics.map(m => [m.key, kommuneData[m.key]]))) : {},
      }
    });
    return tmp as {
      name: string;
      komNr: KommuneNr;
      totalRisk: number;
      [key: string]: string | number;
    }[];
  }, [data, cache, dataModel, selectedYear, layout]);
  
  
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
    ...dataModel?.elements.filter(e => !e.disabled).map(e => ({
      key: e.key,
      name: e.name,
    })) || [],
    ...layout === "second" ? dataModel?.elements.filter(e => !e.disabled).flatMap(e => e.metrics.filter(m => !m.disabled).map(m => ({
      key: m.key,
      name: m.name,
    }))) || [] : [],
  ]

  // Scroll selected row into view when selectedKommune changes
  const selectedRowRef = useRef<HTMLTableRowElement>(null);
  useEffect(() => {
    if (selectedRowRef.current !== null) {
      selectedRowRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [selectedKommune, rowsSorted]); // Should scroll when table rows change

  if (!data || !cache) {
    return (
      <p>Loading...</p>
    )
  }
  return (
    <div className="riskTableContainer">
      <table>
        <thead>
          <tr>
            <th>
              #
            </th>
            <th>
              <button type="button" onClick={() => handleSort("name")}>
                Kommune
                <div className="sortIcon">
                  {sortKey === "name" && (
                    sortAscending ? "↑" : "↓"
                  )}
                </div>
              </button>
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
                <button type="button" onClick={() => handleSort(header.key)}>
                  {header.name}
                  <div className="sortIcon">
                    {sortKey === header.key && (
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
                <td key={`${index}-${headerIndex}`}>
                  {row[header.key] !== null && row[header.key] !== undefined ? (row[header.key] as number).toFixed(0) : ''}
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