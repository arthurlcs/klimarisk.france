import { create } from 'zustand';
import { getDataFileJSON } from './getPublicUrl';
import { type Language } from './useLanguageStore';

export type MetricKey = string & { readonly __brand: unique symbol};
export type ElementKey = string & { readonly __brand: unique symbol};

type Metric = {
  key: MetricKey;
  name: Record<Language, string>; 
  description?: Record<Language, string>;
  invert?: boolean;
  disabled: boolean;
}

type Element = {
  key: ElementKey;
  name: Record<Language, string>;
  description?: Record<Language, string>;
  invert?: boolean;
  disabled: boolean;
  metrics: Metric[];
}

type YearInfo = {
  key: Year;
  name: Record<Language, string>;
  description?: Record<Language, string>;
}

type DataModel = { 
  elements: Element[];
  years: YearInfo[];
};

type KommuneData = {
  name: string;
  [key: MetricKey]: number;
}

export type Year = string & { readonly __brand: unique symbol};
export type KommuneNr = string & { readonly __brand: unique symbol};

type Data = {
  years: {
    [year: Year]: {
      byKommune: {
        [kommuneNr: KommuneNr]: KommuneData;
      }
      byMetric: {
        [metricKey: MetricKey]: number[];
      }
    }
  }
}

type KommuneCache = {
  [elementKey: ElementKey]: number;
  totalRisk: number;
}

type Cache = {
  years: {
    [year: Year]: {
      byKommune: { 
        [kommuneNr: KommuneNr]: KommuneCache;
      }
      byElement: { 
        [elementKey: ElementKey]: number[];
      }
      byTotalRisk: number[];
    }
  }
}

type DistributionKeyType = 
  | { type: "risk" }
  | { type: "element"; key: ElementKey}
  | { type: "metric"; key: MetricKey}

export type DistributionKey = DistributionKeyType;

const distributionKeyToString = (key: DistributionKeyType) => {
  if (key.type === 'risk') return 'risk';
  return `${key.type}:${String(key.key)}`;
};

const getDistributionDomainForKey = (distributionKey: DistributionKeyType, data: Data | null, cache: Cache | null): [number, number] | undefined => {
  let min = Infinity;
  let max = -Infinity;

  if (distributionKey.type === 'metric') {
    if (!data) return undefined;
    for (const year of Object.values(data.years)) {
      const dist = year.byMetric[distributionKey.key];
      if (dist && dist.length > 0) {
        min = Math.min(min, dist[0]);
        max = Math.max(max, dist[dist.length - 1]);
      }
    }
  } else {
    if (!cache) return undefined;
    for (const year of Object.values(cache.years)) {
      const dist = distributionKey.type === 'risk' ? year.byTotalRisk : year.byElement[distributionKey.key];
      if (dist && dist.length > 0) {
        min = Math.min(min, dist[0]);
        max = Math.max(max, dist[dist.length - 1]);
      }
    }
  }

  if (min === Infinity || max === -Infinity) return undefined;
  return [min, max];
};

const buildRiskColorMapForKey = (distKey: DistributionKeyType, year: Year, data: Data | null, cache: Cache | null, colors: string[]): Record<string, string> | null => {
  if (!data || !cache || !cache.years[year]) return null;
  const domain = getDistributionDomainForKey(distKey, data, cache);
  if (!domain) return null;
  const [minRisk, maxRisk] = domain;
  if (minRisk === maxRisk) return null;

  const yearData = data.years[year];
  const yearCache = cache.years[year];
  return Object.fromEntries(
    Object.entries(yearData.byKommune).map(([komNr, kommuneData]) => {
      const rawValue =
        distKey.type === 'risk'
          ? yearCache.byKommune[komNr as KommuneNr].totalRisk
          : distKey.type === 'element'
            ? yearCache.byKommune[komNr as KommuneNr][distKey.key]
            : kommuneData[distKey.key];

      const value = rawValue ?? minRisk;
      const colorIndex = Math.min(
        Math.max(0, Math.floor((value - minRisk) / (maxRisk - minRisk) * colors.length)),
        colors.length - 1
      );

      return [komNr, colors[colorIndex] ?? 'gray'];
    })
  );
};

type ColorMapCache = {
  [year: string]: {
    [distributionKey: string]: Record<string, string>;
  };
};

type DomainCache = {
  [distributionKey: string]: [number, number] | undefined;
};

let riskColorCache: ColorMapCache = {};
let distributionDomainCache: DomainCache = {};

const clearComputedCaches = () => {
  riskColorCache = {};
  distributionDomainCache = {};
};

const sumInvertibleValues = (metrics: Metric[], kommune: KommuneData): number => {
  return metrics.reduce((acc, metric) => acc + (metric.disabled ? 0 : (metric.invert === true ? 100-kommune[metric.key] : kommune[metric.key])), 0)
}

const defaultRiskColors = [
  '#fff5f0',
  '#f3c8b7',
  '#fc9272',
  '#fb6a4a',
  '#ef3b2c',
  '#cb181d',
  '#67000d'
];

// Structure mémoire globale pour stocker les plages d'indices (Min/Max) calculées une seule fois
type MinMaxMap = { [elementKey: string]: { min: number; max: number } };
let globalMinMaxCache: MinMaxMap = {};

interface DataStore {
  dataModel: DataModel | null;
  data: Data | null;
  fetchData: () => Promise<void>;

  cache: Cache | null;
  refreshCacheDeep: () => void;
  refreshCacheRisk: () => void;
  refreshCacheElement: (elementKey: ElementKey) => void;
  calculateElementValue: (elementKey: ElementKey, komNr: KommuneNr, year: Year) => number | null;

  getRiskColor: (komNr: KommuneNr, distKey?: DistributionKey) => string;

  selectedYear: Year | null;
  setSelectedYear: (year: Year) => void;

  highlightedKommune: KommuneNr | null;
  setHighlightedKommune: (kommune: KommuneNr | null) => void;
  
  selectedKommune: KommuneNr | null;
  setSelectedKommune: (kommune: KommuneNr | null) => void;

  selectedDistribuion: DistributionKey; 
  setSelectedDistribution: (key: DistributionKey) => void;

  getDistributionDomain: (distributionKey: DistributionKey) => [number, number] | undefined;

  layout: "first" | "second";
  setLayout: (layout: "first" | "second") => void;

  highlightedDistribution: DistributionKey | null;
  setHighlightedDistribution: (key: DistributionKey | null) => void;

  getFylkeDistribution: (komNr: KommuneNr, distKey: DistributionKey, year: Year) => number[] | null;

  checkDistribution: () => void;

  riskColors: string[];
  getRiskColors: (distKey?: DistributionKey) => string[];
}

const useDataStore = create<DataStore>((set, get) => ({
  
  dataModel: null,
  data: null,
  
  fetchData: async () => {
    const data: Data = await getDataFileJSON('kommune_data.json');
    const dataModel: DataModel = await getDataFileJSON('kommune_data_model.json');

    dataModel.elements.forEach(element => {
      element.disabled = false;
      element.metrics.forEach(metric => {
        metric.disabled = false;
      });
    });

    const selectedYear = dataModel.years[0].key;
    set({ dataModel, data, selectedYear });

    // OPTIMISATION FRONTIÈRE : Calculer la matrice globale des Min/Max UNE SEULE FOIS pour l'ensemble du territoire national
    globalMinMaxCache = {};
    for (const element of dataModel.elements) {
      let min = Infinity;
      let max = -Infinity;
      for (const yearData of Object.values(data.years)) {
        for (const kom of Object.values(yearData.byKommune)) {
          const calculatedRisk = sumInvertibleValues(element.metrics, kom);
          if (calculatedRisk < min) min = calculatedRisk;
          if (calculatedRisk > max) max = calculatedRisk;
        }
      }
      globalMinMaxCache[element.key] = { min, max };
    }

    get().refreshCacheDeep();
  },

  cache: null,

  refreshCacheDeep: () => {
    const { dataModel, data, calculateElementValue } = get();
    if (!dataModel || !data || !data.years) return;

    const cache: Cache = {
      years: {},
    } as Cache;

    for (const year of Object.keys(data.years)) {
      cache.years[year as Year] = {
        byKommune: {},
        byElement: {},
        byTotalRisk: [],
      };
      
      for (const komNr of Object.keys(data.years[year as Year].byKommune)) {
        const kommuneCache: KommuneCache = { totalRisk: 0 };
        
        let totalRisk = 0;
        for (const element of Object.values(dataModel.elements)) {
          const elementValue = calculateElementValue(element.key, komNr as KommuneNr, year as Year);
          if (elementValue !== null) {
            kommuneCache[element.key] = elementValue; // Le score individuel reste intact (0-100)
    
            // Calcul de la valeur de base
            const baseValue = element.disabled ? 0 : (element.invert === true ? 100 - elementValue : elementValue);
            
            // NOUVEAU : On applique le facteur 0,3 uniquement lors de l'addition au total
           const isResponse = String(element.key).toLowerCase() === "r";

           totalRisk += isResponse ? baseValue * 0.3 : baseValue;
  }
}
kommuneCache.totalRisk = totalRisk;

        cache.years[year as Year].byKommune[komNr as KommuneNr] = kommuneCache;
      }

      for (const element of dataModel.elements) {
        cache.years[year as Year].byElement[element.key] = 
          Object.values(cache.years[year as Year].byKommune)
          .map(kommune => kommune[element.key])
          .sort((a, b) => a - b);
      }
      cache.years[year as Year].byTotalRisk = 
        Object.values(cache.years[year as Year].byKommune)
        .map(kommune => kommune.totalRisk)
        .sort((a, b) => a - b);
    }
    clearComputedCaches();
    set({ cache });
  },

 refreshCacheRisk: () => {
    const { dataModel, cache } = get();
    if (!dataModel || !cache) return;

    const newYears = Object.fromEntries(
      Object.entries(cache.years).map(([year, yearCache]) => {
        const { byKommune, byElement } = yearCache;

        const newByKommune = Object.fromEntries(
          Object.entries(byKommune).map(([komNr, kommuneCache]) => {
            const totalRisk = dataModel.elements.reduce((acc, element) => {
              const elementValue = cache.years[year as Year].byKommune[komNr as KommuneNr][element.key];
              const baseValue = element.disabled ? 0 : (element.invert === true ? 100 - elementValue : elementValue);
              
              // Identification stricte de l'élément Réponse via sa clé "r"
              const isResponse = String(element.key).toLowerCase() === "r";
              
              // On applique le facteur de pondération 0,3 si c'est la Réponse
              return acc + (isResponse ? baseValue * 0.3 : baseValue);
            }, 0);
            
            return [komNr, { ...kommuneCache, totalRisk }];
          })
        );

        const newTotalRiskDistribution = Object.values(newByKommune)
          .map(k => k.totalRisk)
          .sort((a, b) => a - b);

        return [
          year,
          {
            byKommune: newByKommune,
            byElement: byElement,
            byTotalRisk: newTotalRiskDistribution,
          }
        ];
      })
    );

    set({ cache: { ...cache, years: newYears } });
    clearComputedCaches();
  },
  
  refreshCacheElement: (elementKey) => {
    const { cache, calculateElementValue, refreshCacheRisk, dataModel } = get();
    if (!cache || !dataModel) return;

    let newYears: Cache["years"];
    if (dataModel.elements.find(e => e.key === elementKey)!.metrics.every(m => m.disabled)) {
      newYears = Object.fromEntries(
        Object.entries(cache.years).map(([year, yearCache]) => {
          const newByKommune = Object.fromEntries(
            Object.entries(yearCache.byKommune).map(([komNr, kommuneCache]) => [
              komNr,
              { ...kommuneCache, [elementKey]: 0 }
            ])
          );
          const newByElement = {
            ...yearCache.byElement,
            [elementKey]: Array(Object.keys(newByKommune).length).fill(0),
          };
          return [
            year,
            {
              byKommune: newByKommune,
              byElement: newByElement,
              byTotalRisk: yearCache.byTotalRisk,
            }
          ];
        })
      ) as Cache["years"]
    } else {
      newYears = Object.fromEntries(
        Object.entries(cache.years).map(([year, yearCache]) => {
          const { byKommune, byElement, byTotalRisk } = yearCache;

          const newByKommune = Object.fromEntries(
            Object.entries(byKommune).map(([komNr, kommuneCache]) => {
              const elementValue = calculateElementValue(elementKey, komNr as KommuneNr, year as Year);
              if (elementValue === null) return [komNr, kommuneCache];
              return [
                komNr,
                { ...kommuneCache, [elementKey]: elementValue }
              ];
            })
          )
          
          const newElementDistribution = Object.values(newByKommune)
            .map(k => k[elementKey])
            .sort((a, b) => a - b);

          const newByElement = {
            ...byElement,
            [elementKey]: newElementDistribution,
          }
          
          return [
            year,
            {
              byKommune: newByKommune,
              byElement: newByElement,
              byTotalRisk: byTotalRisk,
            }
          ]
        })
      );
    }

    set({ cache: { ...cache, years: newYears } });
    refreshCacheRisk();
  },

  // OPTIMISATION CRITIQUE : Lecture directe de la plage d'index pré-calculée pour éviter les boucles imbriquées
  calculateElementValue: (elementKey, komNr, year) => {
    const { dataModel, data } = get()
    if (!dataModel || !data || !komNr || !year) return null

    const metrics = dataModel.elements.find(el => el.key === elementKey)!.metrics
    const kommune = data.years[year].byKommune[komNr]
    if (!kommune) return null;

    const tmpRes = sumInvertibleValues(metrics, kommune)
    
    // Accès instantané O(1) aux extrema globaux calculés dans fetchData
    const bounds = globalMinMaxCache[elementKey];
    if (!bounds || bounds.min === bounds.max) return null;
    
    return (tmpRes - bounds.min) / (bounds.max - bounds.min) * 100;
  },

  getRiskColor: (komNr, distKey?) => {
    const { data, cache, selectedYear, selectedDistribuion, getRiskColors, riskColors } = get();
    const dist = distKey ?? selectedDistribuion;
    const colors = distKey ? getRiskColors(dist) : riskColors;
    if (!data || !cache || !selectedYear || colors.length === 0 || !cache.years[selectedYear]) return 'gray';

    const distKeyString = distributionKeyToString(dist);
    if (!riskColorCache[selectedYear]) {
      riskColorCache[selectedYear] = {};
    }

    if (!riskColorCache[selectedYear][distKeyString]) {
      const colorMap = buildRiskColorMapForKey(dist, selectedYear, data, cache, colors);
      if (!colorMap) return 'gray';
      riskColorCache[selectedYear][distKeyString] = colorMap;
    }

    return riskColorCache[selectedYear][distKeyString][komNr] ?? 'gray';
  },

  selectedYear: null,
  setSelectedYear: (year) => set({ selectedYear: year }),
  highlightedKommune: null,
  setHighlightedKommune: (kommune) => set({ highlightedKommune: kommune }), 
  selectedKommune: null,
  setSelectedKommune: (kommune) => set((state) => {
    if (state.selectedKommune === kommune) {
      return { selectedKommune: null };
    }
    return { selectedKommune: kommune };
  }),

  selectedDistribuion: { type: "risk" } as DistributionKey,
  setSelectedDistribution: (key) => set({ 
    selectedDistribuion: key, 
    riskColors: get().getRiskColors(key),
  }),

  getDistributionDomain: (distributionKey) => {
    let min = Infinity;
    let max = -Infinity;

    if (distributionKey.type === "metric") {
      const { data } = get();
      if (!data) return undefined;

      for (const year of Object.values(data.years)) {
        const dist = year.byMetric[distributionKey.key]
        if (dist && dist.length > 0) {
          min = Math.min(min, dist[0]);
          max = Math.max(max, dist[dist.length - 1]);
        }
      }
    } else {
      const { cache } = get();
      if (!cache) return undefined;

      for (const year of Object.values(cache.years)) {
        const dist = distributionKey.type === "risk" ? year.byTotalRisk : year.byElement[distributionKey.key];
        if (dist && dist.length > 0) {
          min = Math.min(min, dist[0]);
          max = Math.max(max, dist[dist.length - 1]);
        }
      }
    }
    return [min, max];
  },
  
  layout: "first",
  setLayout: (layout) => set({ layout }),
  highlightedDistribution: null,
  setHighlightedDistribution: (key) => set({ highlightedDistribution: key }),

  getFylkeDistribution(komNr, distKey, year) {
    const { data, cache } = get()
    if (!data || !cache || !year || !cache.years[year]) return null;

    // Adaptation pour la France : Regroupement par département (2 premiers caractères du code INSEE)
    const deptNr = komNr.slice(0, 2);

    if (distKey.type === "risk") {
      return Object.entries(cache.years[year].byKommune).filter(([k]) => k.startsWith(deptNr)).map(([,k]) => (k as KommuneCache).totalRisk).sort((a, b) => a - b);
    } else if (distKey.type === "element") {
      return Object.entries(cache.years[year].byKommune).filter(([k]) => k.startsWith(deptNr)).map(([,k]) => (k as KommuneCache)[distKey.key]).sort((a, b) => a - b);
    } else {
      return Object.entries(data.years[year].byKommune).filter(([k]) => k.startsWith(deptNr)).map(([,k]) => (k as KommuneData)[distKey.key]).sort((a, b) => a - b);
    }
  },

  checkDistribution() {
    const { selectedDistribuion, dataModel, setSelectedDistribution } = get()
    if (!dataModel) return;

    if (selectedDistribuion.type === "element") {
      if (dataModel.elements.find(e => e.key === selectedDistribuion.key)?.disabled) {
        setSelectedDistribution({ type: "risk" });
      }
    } else if (selectedDistribuion.type === "metric") {
      dataModel.elements.forEach(e => {
        e.metrics.forEach(m => {
          if (m.key === selectedDistribuion.key) {
            if (e.disabled || m.disabled) {
              setSelectedDistribution({ type: "risk" });
            }
            return;
          }
        })
      });
    }
  },

  riskColors: defaultRiskColors,

  getRiskColors: (key) => {
    const { dataModel } = get();
    if (!dataModel || !key) return defaultRiskColors;
    if (key.type === "risk") {
      return defaultRiskColors;
    } else if (key.type === "element") {
      return dataModel.elements.find(e => e.key === key.key)?.invert ? [...defaultRiskColors].reverse() : defaultRiskColors;
    } else if (key.type === "metric") {
      const e = dataModel.elements.find(e => e.metrics.some(m => m.key === key.key))!;
      const m = e.metrics.find(m => m.key === key.key)!;
      return !!e.invert !== !!m.invert ? [...defaultRiskColors].reverse() : defaultRiskColors;
    } else {
      return defaultRiskColors;
    }
  },

}));

export default useDataStore;