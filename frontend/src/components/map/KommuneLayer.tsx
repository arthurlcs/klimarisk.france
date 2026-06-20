import { useState, useEffect, useMemo, useRef } from 'react';
import { Source, Layer } from 'react-map-gl/maplibre';
import { useMap } from 'react-map-gl/maplibre';
import useDataStore from '../../hooks/useDataStore';
import { getDataFileJSON } from '../../hooks/getPublicUrl';
import type { FeatureCollection, Geometry } from 'geojson';

type KommuneProperties = {
  code_insee: string;
  nom_officiel: string;
};

export type KommuneGeoJSON = FeatureCollection<Geometry, KommuneProperties>;

function KommuneLayer() {
  const [komGeoJSON, setKomGeoJSON] = useState<KommuneGeoJSON | null>(null);
  const [deptGeoJSON, setDeptGeoJSON] = useState<any>(null);
  const [regGeoJSON, setRegGeoJSON] = useState<any>(null);

  const prevSelectedRef = useRef<string | null>(null);

  const {
    selectedKommune,
    selectedDistribuion,
    selectedYear,
    riskColors,
    getRiskColor,
    cache, // 🔥 AJOUTÉ : nécessaire pour détecter les changements issus de RiskTree
  } = useDataStore();

  const mapInstance = useMap();

  // LOAD GEOJSON ONCE
  useEffect(() => {
    getDataFileJSON('kommune.geojson').then(setKomGeoJSON);
    getDataFileJSON('departement.geojson').then(setDeptGeoJSON);
    getDataFileJSON('region.geojson').then(setRegGeoJSON);
  }, []);

  /**
   * 🔥 FIX IMPORTANT :
   * on NE clone PAS profondément (sinon feature-state casse)
   * on change juste les propriétés utiles
   *
   * 🔥 FIX BUG MAJ CARTE :
   * `cache` doit être dans les dépendances. refreshCacheRisk() et
   * refreshCacheElement() (appelés depuis RiskTree) remplacent `cache`
   * par une nouvelle référence d'objet, mais ne touchent jamais
   * `riskColors` ni `getRiskColor`. Sans `cache` ici, ce useMemo ne se
   * recalculait jamais quand on cochait/décochait un élément ou une
   * métrique dans RiskTree, même si le composant se re-render bien.
   */
  const enrichedGeoJSON = useMemo(() => {
    if (!komGeoJSON) return null;

    return {
      ...komGeoJSON,
      features: komGeoJSON.features.map(feature => {
        const komNr = feature.properties.code_insee;

        return {
          ...feature,
          id: feature.id ?? komNr, // 🔥 IMPORTANT : ID stable garanti
          properties: {
            ...feature.properties,
            fill_color: komNr ? getRiskColor(komNr as any) : '#808080'
          }
        };
      })
    };
  }, [komGeoJSON, selectedYear, selectedDistribuion, riskColors, getRiskColor, cache]);

  /**
   * SELECTION FEATURE-STATE (inchangé MAIS sécurisé)
   */
  useEffect(() => {
    if (!mapInstance?.current?.isStyleLoaded()) return;
    if (!komGeoJSON) return;

    const map = mapInstance.current;

    const findId = (code: string | null) => {
      if (!code) return null;
      const f = komGeoJSON.features.find(ft => ft.properties.code_insee === code);
      return f?.id ?? code;
    };

    const prevId = findId(prevSelectedRef.current);
    const nextId = findId(selectedKommune);

    if (prevId) {
      try {
        map.setFeatureState(
          { source: 'communes-source', id: prevId },
          { selected: false }
        );
      } catch { }
    }

    if (nextId) {
      try {
        map.setFeatureState(
          { source: 'communes-source', id: nextId },
          { selected: true }
        );
      } catch { }
    }

    prevSelectedRef.current = selectedKommune || null;
  }, [selectedKommune, mapInstance, komGeoJSON]);

  if (!enrichedGeoJSON) return null;

  /**
   * 🎨 STYLES (inchangés)
   */
  const layerStyle: any = {
    id: 'communes-layer',
    type: 'fill',
    paint: {
      'fill-color': ['get', 'fill_color'],
      'fill-opacity': 0.8,
    }
  };

  const borderStyle: any = {
    id: 'communes-border-layer',
    type: 'line',
    paint: {
      'line-color': [
        'case',
        ['to-boolean', ['feature-state', 'selected']],
        '#000000',
        '#8a8a8a'
      ],
      'line-width': [
        'case',
        ['to-boolean', ['feature-state', 'selected']],
        1,
        0.06
      ],
      'line-opacity': [
        'case',
        ['to-boolean', ['feature-state', 'selected']],
        1.0,
        0.15
      ]
    }
  };

  const deptBorderStyle: any = {
    id: 'dept-border-layer',
    type: 'line',
    paint: {
      'line-color': '#474747',
      'line-width': 0.3,
      'line-opacity': 0.25
    }
  };

  const regBorderStyle: any = {
    id: 'reg-border-layer',
    type: 'line',
    paint: {
      'line-color': '#474747',
      'line-width': 0.7,
      'line-opacity': 0.4
    }
  };

  return (
    <>
      <Source id="communes-source" type="geojson" data={enrichedGeoJSON}>
        <Layer {...layerStyle} />
        <Layer {...borderStyle} />
      </Source>

      {deptGeoJSON && (
        <Source id="dept-source" type="geojson" data={deptGeoJSON}>
          <Layer {...deptBorderStyle} />
        </Source>
      )}

      {regGeoJSON && (
        <Source id="reg-source" type="geojson" data={regGeoJSON}>
          <Layer {...regBorderStyle} />
        </Source>
      )}
    </>
  );
}

export default KommuneLayer;