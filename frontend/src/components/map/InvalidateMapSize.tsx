import { useEffect } from "react";
import { useMap } from "react-leaflet";
import useDataStore from "../../hooks/useDataStore";

function InvalidateMapSize() {
  const map = useMap();

  const {
    layout,
  } = useDataStore();

  useEffect(() => {
    const interval = window.setInterval(() => {
      map.invalidateSize();
    }, 100); // during layout transition

    const timeout = window.setTimeout(() => {
      map.invalidateSize();
      window.clearInterval(interval);
    }, 500); // after layout transition

    return () => {
      window.clearInterval(interval);
      window.clearTimeout(timeout);
    };
  }, [map, layout]);

  return null;
}

export default InvalidateMapSize;