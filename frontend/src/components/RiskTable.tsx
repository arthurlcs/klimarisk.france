import { useState, useMemo, useEffect, useRef } from "react";
import { FixedSizeList as List, type ListChildComponentProps } from 'react-window';
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
    if (key === "name" || invert) {
      if (sortKey !== key) {
        setSortKey(key);
        setSortAscending(true);
      } else {
        if (sortAscending) {
          setSortAscending(false);
        } else {
          setSortKey("totalRisk");
          setSortAscending(false);
        }
      }
      return;
    }
    if (sortKey !== key) {
      setSortKey(key);
      setSortAscending(false);
    } else {
      if (!sortAscending) {
        setSortAscending(true);
      } else {
        setSortKey("totalRisk");
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
      ...(e.invert ? { invert: true } : {}),
    })) || [],
    ...layout === "second" ? dataModel?.elements.filter(e => !e.disabled).flatMap(e => e.metrics.filter(m => !m.disabled).map(m => ({
      key: m.key,
      name: m.name,
      description: m.description,
      ...(!!m.invert !== !!e.invert ? { invert: true } : {}),
    }))) || [] : [],
  ]

  const listRef = useRef<List | null>(null);
  const selectedRowRef = useRef<HTMLDivElement>(null);
  const selectedColRef = useRef<HTMLDivElement>(null);

  const headerRef = useRef<HTMLDivElement>(null);
  const outerListRef = useRef<HTMLDivElement>(null);
  const tbodyRef = useRef<HTMLDivElement>(null);

  const [tableHeight, setTableHeight] = useState<number>(420);

  useEffect(() => {
    const currentTbody = tbodyRef.current;
    if (!currentTbody) return;

    const updateHeight = () => {
      const height = currentTbody.clientHeight;
      if (height > 50) {
        setTableHeight(height);
      }
    };

    updateHeight();
    window.addEventListener("resize", updateHeight);

    const observer = new ResizeObserver(updateHeight);
    observer.observe(currentTbody);

    return () => {
      window.removeEventListener("resize", updateHeight);
      observer.disconnect();
    };
  }, [data, cache]);

  useEffect(() => {
    const listContainer = outerListRef.current;
    const headerContainer = headerRef.current;

    if (!listContainer || !headerContainer) return;

    const handleScroll = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target === listContainer) {
        headerContainer.scrollLeft = listContainer.scrollLeft;
      } else if (target === headerContainer) {
        listContainer.scrollLeft = headerContainer.scrollLeft;
      }
    };

    listContainer.addEventListener("scroll", handleScroll, { passive: true });
    headerContainer.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      listContainer.removeEventListener("scroll", handleScroll);
      headerContainer.removeEventListener("scroll", handleScroll);
    };
  }, [data, cache, tableHeight, layout]);

  useEffect(() => {
    if (!listRef.current || !selectedKommune) return;
    const idx = rowsSorted.findIndex(r => r.komNr === selectedKommune);
    if (idx >= 0) {
      listRef.current.scrollToItem(idx, 'center');
    }
  }, [selectedKommune, rowsSorted]);

  if (!data || !cache) {
    return <p>{l(t.common.loading)}</p>;
  }

  const Row = ({ index, style }: ListChildComponentProps) => {
    const row = rowsSorted[index];
    if (!row) return null;

    const renderValue = (val: any) => {
      if (val === null || val === undefined) return '';
      const num = Number(val);
      return isNaN(num) ? String(val) : num.toFixed(0);
    };

    return (
      <div
        style={style}
        className={`rt-row ${row.komNr === selectedKommune ? 'selected' : ''} ${row.komNr === highlightedKommune ? 'highlighted' : ''}`}
        onMouseEnter={() => setHighlightedKommune(row.komNr)}
        onMouseLeave={() => setHighlightedKommune(null)}
        ref={row.komNr === selectedKommune ? selectedRowRef : null}
        onClick={() => setSelectedKommune(row.komNr)}
      >
        <div className="rt-cell indexCol" style={{ "--risk-color": getRiskColor(row.komNr) } as React.CSSProperties}>
          {index + 1}
        </div>
        <div className="rt-cell kommuneCol">
          {row.name}
        </div>
        <div className={`rt-cell numeric ${highlightedDistribution && highlightedDistribution.type === "risk" ? "highlightedCol" : ""} ${selectedDistribuion.type === "risk" ? "selectedCol" : ""}`}>
          {renderValue(row.totalRisk)}
        </div>
        {headers.map((header, headerIndex) => (
          <div
            key={`${index}-${headerIndex}`}
            className={`rt-cell numeric ${(highlightedDistribution && highlightedDistribution?.type !== "risk" && highlightedDistribution.key === header.key) ? "highlightedCol" : ""} ${selectedDistribuion.type !== "risk" && selectedDistribuion.key === header.key ? "selectedCol" : ""}`}
          >
            {renderValue(row[header.key])}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="riskTableContainer">
      <div className="rt-table">
        <div className="rt-thead" ref={headerRef}>
          <div className="rt-row rt-header">
            <div className="rt-cell indexCol">#</div>
            <div className="rt-cell kommuneCol">
              <button type="button" onClick={() => handleSort("name")}>
                {l(t.table.kommune)}
                <div className="sortIcon">
                  {sortKey === "name" && (sortAscending ? <ArrowUp /> : <ArrowDown />)}
                </div>
              </button>
            </div>
            <div
              className={`rt-cell numeric ${highlightedDistribution && highlightedDistribution.type === "risk" ? "highlightedCol" : ""} ${selectedDistribuion.type === "risk" ? "selectedCol" : ""}`}
              ref={selectedDistribuion.type === "risk" ? selectedColRef : null}
            >
              <button type="button" onClick={() => handleSort("totalRisk")}>
                {l(t.common.totalRisk)}
                <div className="sortIcon">
                  {sortKey === "totalRisk" && (sortAscending ? <ArrowUp /> : <ArrowDown />)}
                </div>
              </button>
            </div>
            {headers.map((header, index) => (
              <div
                key={index}
                className={`rt-cell numeric ${highlightedDistribution && highlightedDistribution?.type !== "risk" && highlightedDistribution.key === header.key ? "highlightedCol" : ""} ${selectedDistribuion.type !== "risk" && selectedDistribuion.key === header.key ? "selectedCol" : ""}`}
                ref={selectedDistribuion.type !== "risk" && selectedDistribuion.key === header.key ? selectedColRef : null}
              >
                <button type="button" onClick={() => handleSort(header.key, header.invert)}>
                  <Tooltip text={l(header.description)}>
                    {l(header.name)}
                  </Tooltip>
                  <div className="sortIcon">
                    {sortKey === header.key && (sortAscending ? <ArrowUp /> : <ArrowDown />)}
                  </div>
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="rt-tbody" ref={tbodyRef}>
          <List
            ref={(el: List<any> | null) => {
              listRef.current = el;
              if (el) {
                outerListRef.current = (el as any)._outerRef;
              }
            }}
            height={tableHeight}
            itemCount={rowsSorted.length}
            itemSize={24}
            width="100%"
          >
            {Row}
          </List>
        </div>
      </div>
    </div>
  );
}

export default RiskTable;