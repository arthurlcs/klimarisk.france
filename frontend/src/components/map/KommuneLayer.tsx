import { useState, useEffect } from 'react';
import { GeoJSON } from 'react-leaflet';
import useDataStore, { type KommuneNr } from '../../hooks/useDataStore';

import type { FeatureCollection, Feature, Polygon, MultiPolygon, Geometry } from 'geojson';
import type { Polygon as LeafletPolygon } from 'leaflet';
import { getDataFileJSON } from '../../hooks/getPublicUrl';

type KommuneProperties = { 
  kommunenummer: KommuneNr; 
};
type KommuneFeature = Feature<Polygon | MultiPolygon, KommuneProperties>;
type KommuneGeometryFeature = Feature<Geometry, KommuneProperties>;
export type KommuneGeoJSON = FeatureCollection<Polygon | MultiPolygon, KommuneProperties>;


function KommuneLayer() {

  const [komGeoJSON, setKomGeoJSON] = useState<KommuneGeoJSON | null>(null);

  useEffect(() => {
    getDataFileJSON('kommune.geojson').then(geojson => setKomGeoJSON(geojson));
  }, []);

  const {
    highlightedKommune,
    setHighlightedKommune,
    selectedKommune,
    setSelectedKommune,
    getRiskColor,
  } = useDataStore();

  if (!komGeoJSON) return null;

  const onEachFeature = (feature: KommuneFeature, layer: LeafletPolygon) => {
    const komNr = feature.properties.kommunenummer;
    layer.on({
      mouseover: () => {
        setHighlightedKommune(komNr);
      },
      mouseout: () => {
        setHighlightedKommune(null);
      },
      click: () => {
        setSelectedKommune(komNr);
      }
    });
  };

  const getColor = (komNr: KommuneNr | null) => {
    return komNr ? getRiskColor(komNr): 'gray';
  }

  const style = (feature?: KommuneGeometryFeature) => {

    const komNr = feature?.properties.kommunenummer || undefined;

    return {
      fillColor: getColor(komNr || null),
      weight: komNr === highlightedKommune ? 3 : komNr === selectedKommune ? 2 : 0.3,
      opacity: 1,
      color: 'black',
      fillOpacity: 0.8,
      // TODO: fix zindex issue, border goes under neighbour polygons
    };
  }

  return <GeoJSON data={komGeoJSON} onEachFeature={onEachFeature} style={style} />;
}

export default KommuneLayer;