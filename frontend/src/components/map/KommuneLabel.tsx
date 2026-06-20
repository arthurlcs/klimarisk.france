import { memo, useMemo } from "react";
import useDataStore from "../../hooks/useDataStore";
import "./Map.css";

interface Props {
  mouseOnMap: boolean;
}

function KommuneLabel({ mouseOnMap }: Props) {
  const {
    highlightedKommune,
    data,
    selectedYear,
    selectedKommune,
  } = useDataStore();

  // Memoize the highlighted name lookup to avoid repeated expensive lookups
  const highlightedName = useMemo(() => {
    if (!highlightedKommune || !data || !selectedYear) return null;
    return data.years[selectedYear]?.byKommune[highlightedKommune]?.name ?? null;
  }, [highlightedKommune, data, selectedYear]);

  // Memoize the selected name lookup
  const selectedName = useMemo(() => {
    if (!selectedKommune || !data || !selectedYear) return null;
    return data.years[selectedYear]?.byKommune[selectedKommune]?.name ?? null;
  }, [selectedKommune, data, selectedYear]);

  return (
    <>
      {mouseOnMap ? (
        <>
          {highlightedName && (
            <div className="kommuneLabel">
              {highlightedName}
            </div>
          )}
        </>
      ) : (
        <>
          {selectedName && (
            <div className="kommuneLabel">
              {selectedName}
            </div>
          )}
        </>
      )}
    </>
  )
}

export default memo(KommuneLabel);