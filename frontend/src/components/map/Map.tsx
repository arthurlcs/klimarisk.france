import './Map.css';
import { Map as MapGl, NavigationControl, type MapLayerMouseEvent } from 'react-map-gl/maplibre';
import maplibregl from 'maplibre-gl';
import KommuneLayer from "./KommuneLayer";
import KommuneSearch from '../../components/KommuneSearch';
import { useRef, useEffect, useState, useMemo } from 'react';
import useDataStore, { type KommuneNr } from '../../hooks/useDataStore';
import { getDataFileJSON } from '../../hooks/getPublicUrl';
import { LoadingScreen } from '../../../LoadingScreen'; // 🎯 FIX : Chemin d'accès direct dans frontend

const NO_BACKGROUND_STYLE: any = {
  version: 8,
  sources: {},
  layers: [{ id: 'background', type: 'background', paint: { 'background-color': '#f8f9fa' } }]
};

function updateBoundsWithGeometry(geometry: any, currentBounds: [[number, number], [number, number]]) {
  let [minX, minY] = currentBounds[0];
  let [maxX, maxY] = currentBounds[1];
  const coords = geometry.type === 'Polygon' ? geometry.coordinates : geometry.coordinates.flat(1);
  for (const ring of coords) {
    for (const [lng, lat] of ring) {
      if (lng < minX) minX = lng;
      if (lat < minY) minY = lat;
      if (lng > maxX) maxX = lng;
      if (lat > maxY) maxY = lat;
    }
  }
  return [[minX, minY], [maxX, maxY]] as [[number, number], [number, number]];
}

function Map() {
  const mapRef = useRef<any>(null);
  const { selectedKommune, setSelectedKommune, entityMapping, aggregationLevel, selectedDistribution } = useDataStore();

  const [komGeoJSON, setKomGeoJSON] = useState<any>(null);
  const [epciGeoJSON, setEpciGeoJSON] = useState<any>(null);
  const [deptGeoJSON, setDeptGeoJSON] = useState<any>(null);

  // 🎯 ÉTAT LOCAL : Gestion autonome du chargement de l'affichage de la carte
  const [mapLoading, setMapLoading] = useState<boolean>(true);

  useEffect(() => {
    getDataFileJSON('kommune.geojson').then(setKomGeoJSON).catch(console.error);
    getDataFileJSON('epci.geojson').then(setEpciGeoJSON).catch(console.error);
    getDataFileJSON('departement.geojson').then(setDeptGeoJSON).catch(console.error);
  }, []);

  const currentContext = useMemo(() => {
    if (aggregationLevel === "departement") return { geojson: deptGeoJSON, key: "code_insee" };
    if (aggregationLevel === "epci") return { geojson: epciGeoJSON, key: "code_siren" };
    return { geojson: komGeoJSON, key: "code_insee" };
  }, [aggregationLevel, komGeoJSON, epciGeoJSON, deptGeoJSON]);

  // Identifiant unique combiné pour rafraîchir la couche de manière synchrone avec le RiskTree
  const layerUpdateKey = useMemo(() => {
    const distId = selectedDistribution ? `${selectedDistribution.type}-${(selectedDistribution as any).key || ''}` : 'risk';
    return `${aggregationLevel}-${distId}`;
  }, [aggregationLevel, selectedDistribution]);

  // ZOOM
  useEffect(() => {
    const { geojson, key } = currentContext;
    if (!selectedKommune || !mapRef.current || !geojson?.features) return;

    const mapInstance = mapRef.current.getMap();
    const target = String(selectedKommune).trim();

    let bounds: [[number, number], [number, number]] = [[Infinity, Infinity], [-Infinity, -Infinity]];
    let hasFeatures = false;

    geojson.features.forEach((f: any) => {
      if (!f.properties || !f.geometry || !f.properties[key]) return;

      const entityId = aggregationLevel === "commune"
        ? String(f.properties[key]).padStart(5, '0')
        : String(f.properties[key]).trim();

      if (entityId === target) {
        bounds = updateBoundsWithGeometry(f.geometry, bounds);
        hasFeatures = true;
      }
    });

    if (hasFeatures && bounds[0][0] !== Infinity) {
      const maxZoomLevel = aggregationLevel === "commune" ? 10 : aggregationLevel === "epci" ? 9 : 8;
      mapInstance.fitBounds(bounds, { padding: 60, maxZoom: maxZoomLevel, animate: true, duration: 1200 });
    }
  }, [selectedKommune, currentContext, aggregationLevel]);

  // CLIC
  const onMapClick = (event: MapLayerMouseEvent) => {
    const features = event.target.queryRenderedFeatures(event.point, { layers: ['dynamic-layer'] });
    const clickedFeature = features?.[0];

    if (clickedFeature && clickedFeature.properties) {
      let entityId = "";
      if (aggregationLevel === "departement") {
        entityId = String(clickedFeature.properties.code_insee || "").trim();
      } else if (aggregationLevel === "epci") {
        entityId = String(clickedFeature.properties.code_siren || "").trim();
      } else {
        entityId = String(clickedFeature.properties.code_insee || "").padStart(5, '0');
      }

      if (entityId) {
        const targetEntity = aggregationLevel === "commune" ? (entityMapping[entityId] || entityId) : entityId;
        setSelectedKommune(targetEntity as KommuneNr);
      }
    }
  };

  return (
    <div className="mapContainer" style={{ position: 'relative', width: '100%', height: '100%' }}>

      {/* 🎯 MASQUE ABSOLU : Superposé de manière étanche par-dessus la carte active */}
      {mapLoading && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 9999,
          pointerEvents: 'all'
        }}>
          <LoadingScreen />
        </div>
      )}

      <MapGl
        key="maplibre-pure-instance"
        ref={mapRef}
        style={{ width: '100%', height: '100%', position: 'relative' }}
        initialViewState={{ longitude: 2.2, latitude: 46.6, zoom: 5.5 }}
        maxZoom={12} minZoom={4}
        mapLib={maplibregl}
        mapStyle={NO_BACKGROUND_STYLE}
        interactiveLayerIds={['dynamic-layer']}
        onClick={onMapClick}
      >
        <KommuneSearch />
        <NavigationControl position="top-right" showCompass={false} />
        {/* 🎯 TRANSMISSION : Passage de la fonction de contrôle locale vers KommuneLayer */}
        <KommuneLayer key={layerUpdateKey} setIsLoading={setMapLoading} />
      </MapGl>
    </div>
  );
}

export default Map;