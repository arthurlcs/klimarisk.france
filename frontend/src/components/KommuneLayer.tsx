import { useState, useEffect } from 'react';
import { GeoJSON } from 'react-leaflet';
import useDataStore, { type KommuneNr } from '../hooks/useDataStore';

import type { FeatureCollection, Feature, Polygon, MultiPolygon, Geometry } from 'geojson';
import type { Polygon as LeafletPolygon } from 'leaflet';
import { getDataFileJSON } from '../hooks/getPublicUrl';

type KommuneProperties = { 
  kommunenummer: KommuneNr; 
};
type KommuneFeature = Feature<Polygon | MultiPolygon, KommuneProperties>;
type KommuneGeometryFeature = Feature<Geometry, KommuneProperties>;
type KommuneGeoJSON = FeatureCollection<Polygon | MultiPolygon, KommuneProperties>;


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
    // const colors = ['green', 'yellow', 'orange', 'red']; // Define your color scale here
    let colors = [
      '#a50026',
      '#d73027',
      '#f46d43',
      '#fdae61',
      '#fee08b',
      '#d9ef8b',
      '#a6d96a',
      '#66bd63',
      '#1a9850',
      '#006837',
    ].reverse();

    colors = [
      '#d7191c',
      '#fdae61',
      '#ffffbf',
      '#a6d96a',
      '#1a9641'
    ].reverse();

    colors = [
      '#fff5eb',
      '#fee6ce',
      '#fdd0a2',
      '#fdae6b',
      '#fd8d3c',
      '#f16913',
      '#d94801',
      '#a63603',
      '#7f2704'
    ]

    colors = [
      '#fff5f0',
      '#fcbba1',
      '#fb6a4a',
      '#cb181d',
      '#67000d'
    ]

    // colors = [
    //   '#fff5f0',
    //   '#fee0d2',
    //   '#fcbba1',
    //   '#fc9272',
    //   '#fb6a4a',
    //   '#ef3b2c',
    //   '#cb181d',
    //   '#a50f15',
    //   '#67000d'
    // ]

    return komNr ? getRiskColor(komNr, colors): 'gray';
  }

  const style = (feature?: KommuneGeometryFeature) => {

    const komNr = feature?.properties.kommunenummer || undefined;

    return {
      fillColor: getColor(komNr || null),
      weight: komNr === highlightedKommune || komNr === selectedKommune ? 3 : 0.5,
      opacity: 1,
      color: 'black',
      fillOpacity: 0.8,
      // TODO: fix zindex issue, border goes under neighbour polygons
    };
  }

  return <GeoJSON data={komGeoJSON} onEachFeature={onEachFeature} style={style} />;
}

export default KommuneLayer;