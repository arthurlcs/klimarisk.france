import { useState, useMemo, useEffect, useRef } from "react";
import useDataStore, { type KommuneNr } from "../hooks/useDataStore";
import "./RiskTable.css";
import useLanguageStore, { t } from "../hooks/useLanguageStore";
import Tooltip from "./Tooltip";
import { MoveDown as ArrowDown, MoveUp as ArrowUp } from "lucide-react";


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
    highlightedDistribution,
    selectedDistribuion,
    getRiskColor,
  } = useDataStore();
  const { l } = useLanguageStore();

  const [sortKey, setSortKey] = useState<string>("totalRisk");
  const [sortAscending, setSortAscending] = useState<boolean>(false);

  const handleSort = (key: string, invert?: boolean) => {
    // Special case for kommune name (and inverted): Ascending -> Descending -> default
    if (key === "name" || invert) {
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
      description: e.description,
      ...(e.invert ? {invert: true} : {}),
    })) || [],
    ...layout === "second" ? dataModel?.elements.filter(e => !e.disabled).flatMap(e => e.metrics.filter(m => !m.disabled).map(m => ({
      key: m.key,
      name: m.name,
      description: m.description,
      ...(!!m.invert !== !!e.invert ? {invert: true} : {}),
    }))) || [] : [],
  ]

  // Scroll selected row into view when selectedKommune changes
  const selectedRowRef = useRef<HTMLTableRowElement>(null);
  useEffect(() => {
    if (selectedRowRef.current !== null) {
      selectedRowRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [selectedKommune, rowsSorted]); // Should scroll when table rows change

  // Scroll selected distribution column into view
  const selectedColRef = useRef<HTMLTableCellElement>(null)
  useEffect(() => {
    if (selectedColRef.current !== null) {
      selectedColRef.current.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "end" });
    }
  }, [selectedDistribuion]); // Scroll only when selectedDistribution changes


  if (!data || !cache) {
    return (
      <p>{l(t.common.loading)}</p>
    )
  }
  return (
    <div className="riskTableContainer">
      <table>
        <thead>
          <tr>
            <th className="indexCol">
              #
            </th>
            <th className="kommuneCol">
              <button type="button" onClick={() => handleSort("name")}>
                {l(t.table.kommune)}
                <div className="sortIcon">
                  {sortKey === "name" && (
                    sortAscending ? <ArrowUp /> : <ArrowDown />
                  )}
                </div>
              </button>
            </th>
            <th
              className={`${highlightedDistribution && highlightedDistribution.type === "risk" ? "highlightedCol" : ""} ${selectedDistribuion.type === "risk" ? "selectedCol" : ""}`}
              ref={selectedDistribuion.type === "risk" ? selectedColRef : null}
            >
              <button type="button" onClick={() => handleSort("totalRisk")}>
                {l(t.common.totalRisk)}
                <div className="sortIcon">
                  {sortKey === "totalRisk" && (
                    sortAscending ? <ArrowUp /> : <ArrowDown />
                  )}
                </div>
              </button>
            </th>
            {headers.map((header, index) => (
              <th 
                key={index}
                className={`${highlightedDistribution && highlightedDistribution?.type !== "risk" && highlightedDistribution.key === header.key ? "highlightedCol" : ""} ${selectedDistribuion.type !== "risk" && selectedDistribuion.key === header.key ? "selectedCol" : ""}`}
                ref={selectedDistribuion.type !== "risk" && selectedDistribuion.key === header.key ? selectedColRef : null}
              >
                <button type="button" onClick={() => handleSort(header.key, header.invert)}>
                  <Tooltip text={l(header.description)}>
                    {l(header.name)}
                  </Tooltip>
                  <div className="sortIcon">
                    {sortKey === header.key && (
                      sortAscending ? <ArrowUp /> : <ArrowDown />
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
              <td 
                className="indexCol"
                style={{ "--risk-color": getRiskColor(row.komNr) } as React.CSSProperties}
              >
                {index + 1}
              </td>
              <td className="kommuneCol">
                {row.name}
              </td>
              <td
                className={`${highlightedDistribution && highlightedDistribution.type === "risk" ? "highlightedCol" : ""} ${selectedDistribuion.type === "risk" ? "selectedCol" : ""}`}
              >
                {row.totalRisk !== null && row.totalRisk !== undefined ? row.totalRisk.toFixed(0) : ''}
              </td>
              {headers.map((header, headerIndex) => (
                <td 
                  key={`${index}-${headerIndex}`}
                  className={`${(highlightedDistribution && highlightedDistribution?.type !== "risk" && highlightedDistribution.key === header.key)  ? "highlightedCol" : ""} ${selectedDistribuion.type !== "risk" && selectedDistribuion.key === header.key ? "selectedCol" : ""}`}
                >
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