import { useEffect, useState } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import useDataStore from "../hooks/useDataStore";
import { getDataFileJSON } from '../hooks/getPublicUrl';
import type { KommuneGeoJSON } from "./KommuneLayer";

function FlyToSelectedKommune() {
  const map = useMap();
  const selectedKommune = useDataStore(s => s.selectedKommune);

  const [komGeoJSON, setKomGeoJSON] = useState<KommuneGeoJSON | null>(null);
  
  useEffect(() => {
    getDataFileJSON('kommune.geojson').then(geojson => setKomGeoJSON(geojson));
  }, []);

  useEffect(() => {
    if (!selectedKommune) return;

    const feature = komGeoJSON?.features.find(
      f => f.properties?.kommunenummer === selectedKommune
    );

    if (!feature) return;

    const bounds = L.geoJSON(feature).getBounds();

    if (bounds.isValid()) {
      map.fitBounds(bounds, {
        padding: [60, 60],
        maxZoom: 8,
        animate: true,
      });
    }
  }, [map, selectedKommune, komGeoJSON]);

  return null;
}

export default FlyToSelectedKommune;