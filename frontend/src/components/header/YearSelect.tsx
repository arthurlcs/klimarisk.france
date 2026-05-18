import useDataStore, { type Year } from "../../hooks/useDataStore";
import { useMemo } from "react";
import Tooltip from "../Tooltip";
import useLanguageStore, { t } from "../../hooks/useLanguageStore";


function YearSelect() {
  const {
    selectedYear,
    setSelectedYear,
    data,
  } = useDataStore();
  const { l } = useLanguageStore();

  const availableYears = useMemo(() => {
    return (data && data.years ? Object.keys(data.years) : []) as Year[];
  }, [data]);

  if (!selectedYear || availableYears.length === 0) return null;

  return (
    <div className="yearSelect">
      <div className="label">
        {l(t.header.year.selected)}:
      </div>
      {availableYears.map(year => (
        <button
          key={year}
          onClick={() => setSelectedYear(year)}
          className={year === selectedYear ? "selected" : ""}
        >
          <Tooltip text={l(t.header.year[year as "2000" | "2050" | "2100"])}>
            {year}
          </Tooltip>
        </button>
      ))}
    </div>
  )
}

export default YearSelect;