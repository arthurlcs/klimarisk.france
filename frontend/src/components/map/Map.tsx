import './Map.css';
import { Map as MapGl, NavigationControl, type MapLayerMouseEvent } from 'react-map-gl/maplibre';
import maplibregl from 'maplibre-gl';
import KommuneLayer from "./KommuneLayer";
import KommuneLabel from './KommuneLabel';
import KommuneSearch from '../../components/KommuneSearch';
import { useState, useRef, useEffect } from 'react';
import useDataStore from '../../hooks/useDataStore';

// EXTRACTION STRICTE : On place l'objet en dehors du composant.
const NO_BACKGROUND_STYLE: any = {
  version: 8,
  sources: {},
  layers: [
    {
      id: 'background',
      type: 'background',
      paint: {
        'background-color': '#f8f9fa'
      }
    }
  ]
};

function Map() {
  const [mouseOver, setMouseOver] = useState(false);
  const mapRef = useRef<any>(null);
  const { selectedKommune, setSelectedKommune } = useDataStore();

  useEffect(() => {
    if (!selectedKommune || !mapRef.current) return;

    const mapInstance = mapRef.current.getMap();
    const features = mapInstance.querySourceFeatures('communes-source', {
      sourceLayer: 'communes-layer',
      filter: ['==', ['get', 'code_insee'], selectedKommune]
    });

    if (features && features.length > 0) {
      const geometry = features[0].geometry;
      if (geometry.type === 'Polygon' || geometry.type === 'MultiPolygon') {
        const coords = geometry.type === 'Polygon' ? geometry.coordinates[0][0] : geometry.coordinates[0][0][0];
        mapInstance.flyTo({
          center: [coords[0], coords[1]],
          zoom: 8,
          essential: true
        });
      }
    }
  }, [selectedKommune]);

  const onMapClick = (event: MapLayerMouseEvent) => {
    const features = event.target.queryRenderedFeatures(event.point, {
      layers: ['communes-layer']
    });

    const clickedFeature = features && features[0];
    if (clickedFeature && clickedFeature.properties) {
      const komNr = clickedFeature.properties.code_insee;
      setSelectedKommune(komNr);
    }
  };

  return (
    <div
      className="mapContainer"
      onMouseEnter={() => setMouseOver(true)}
      onMouseLeave={() => setMouseOver(false)}
      style={{ position: 'relative' }} // Sécurité d'ancrage additionnelle au niveau du wrapper
    >
      <MapGl
        key="maplibre-pure-instance"
        ref={mapRef}
        style={{ width: '100%', height: '100%', position: 'relative' }}
        initialViewState={{
          longitude: 2.2,
          latitude: 46.6,
          zoom: 5.5
        }}
        maxZoom={12}
        minZoom={4}
        mapLib={maplibregl}
        mapStyle={NO_BACKGROUND_STYLE}
        interactiveLayerIds={['communes-layer']}
        onClick={onMapClick}
        trackResize={true}
      >
        {/* 🔥 INJECTÉ ICI : Devient un enfant direct du contexte absolu de la carte */}
        <KommuneSearch />

        <NavigationControl position="top-right" showCompass={false} />

        <KommuneLayer />

        <KommuneLabel mouseOnMap={mouseOver} />
      </MapGl>
    </div>
  );
}

export default Map;