import "./YearControl.css"
import { useMemo } from "react";
import useDataStore, { type Year } from "../hooks/useDataStore";

function Yearcontrol() {

  const { 
    selectedYear, 
    setSelectedYear, 
    data, 
  } = useDataStore();

  const availableYears = useMemo(() => {
    return data && data.years ? Object.keys(data.years) : [];
  }, [data]);

  const currentYearIndex = useMemo(() => {
    if (!selectedYear || availableYears.length === 0) return -1;
    return availableYears.indexOf(selectedYear);
  }, [selectedYear, availableYears]);
  

  const onPrevious = () => {
    if (!selectedYear || availableYears.length === 0) return;
    const previousIndex = (currentYearIndex - 1 + availableYears.length) % availableYears.length;
    setSelectedYear(availableYears[previousIndex] as Year);
  };

  const onNext = () => {
    if (!selectedYear || availableYears.length === 0) return;
    const nextIndex = (currentYearIndex + 1) % availableYears.length;
    setSelectedYear(availableYears[nextIndex] as Year);
  };

  return (
    <div className="year-control">
      <button onClick={onPrevious} disabled={availableYears.length === 0 || currentYearIndex === 0}>{"<"}</button>
      <div>{selectedYear}</div>
      <button onClick={onNext} disabled={availableYears.length === 0 || currentYearIndex === availableYears.length - 1}>{">"}</button>
    </div>
  )
}

export default Yearcontrol;