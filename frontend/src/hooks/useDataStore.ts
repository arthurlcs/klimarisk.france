import { create } from 'zustand';
import { getDataFileJSON } from './getPublicUrl';
import { type Language } from './useLanguageStore';

export type MetricKey = string & { readonly __brand: unique symbol};
export type ElementKey = string & { readonly __brand: unique symbol};

type Metric = {
  name: Record<Language, string>; 
  description?: Record<Language, string>;
  key: MetricKey;
  invert?: boolean;
  disabled: boolean;
}

type Element = {
  name: Record<Language, string>;
  description?: Record<Language, string>;
  key: ElementKey;
  invert?: boolean;
  disabled: boolean;
  metrics: Metric[];
}

type DataModel = { 
  elements: Element[];
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
      byKommune: { // Access values for a specific kommune
        [kommuneNr: KommuneNr]: KommuneCache;
      }
      byElement: { // Access values for a specific metric across all kommune
        [elementKey: ElementKey]: number[];
      }
      byTotalRisk: number[];
    }
  }
}

export type DistributionKey = 
  | { type: "risk" }
  | { type: "element"; key: ElementKey}
  | { type: "metric"; key: MetricKey}

const sumInvertibleValues = (metrics: Metric[], kommune: KommuneData): number => {
  return metrics.reduce((acc, metric) => acc + (metric.disabled ? 0 : (metric.invert === true ? 100-kommune[metric.key] : kommune[metric.key])), 0)
}

export const riskColors = [
  '#fff5f0',
  '#fcbba1',
  '#fb6a4a',
  '#cb181d',
  '#67000d'
]

interface DataStore {
  dataModel: DataModel | null;
  data: Data | null;
  fetchData: () => Promise<void>;

  cache: Cache | null;
  refreshCacheDeep: () => void;
  refreshCacheRisk: () => void;
  refreshCacheElement: (elementKey: ElementKey) => void;
  calculateElementValue: (elementKey: ElementKey, komNr: KommuneNr, year: Year) => number | null; // takes index of the element (hazard, vulnr, expo or resp) in the elements list

  getRiskColor: (komNr: KommuneNr, distKey?: DistributionKey) => string;


  selectedYear: Year | null;
  setSelectedYear: (year: Year) => void;

  highlightedKommune: KommuneNr | null;
  setHighlightedKommune: (kommune: KommuneNr | null) => void;
  
  selectedKommune: KommuneNr | null;
  setSelectedKommune: (kommune: KommuneNr | null) => void;

  selectedDistribuion: DistributionKey; //TODO allow null as value? or keep "risk" as default
  setSelectedDistribution: (key: DistributionKey) => void;

  getDistributionDomain: (distributionKey: DistributionKey) => [number, number] | undefined;

  layout: "first" | "second";
  setLayout: (layout: "first" | "second") => void;

  highlightedDistribution: DistributionKey | null;
  setHighlightedDistribution: (key: DistributionKey | null) => void;

  getFylkeDistribution: (komNr: KommuneNr, distKey: DistributionKey, year: Year) => number[] | null;

  checkDistribution: () => void;
}

const useDataStore = create<DataStore>((set, get) => ({
  
  dataModel: null,
  
  data: null,
  
  fetchData: async () => {
    const data: Data = await getDataFileJSON('kommune_data.json');
    const dataModel: DataModel = await getDataFileJSON('kommune_data_model.json');

    // Enable all elements and metrics by default (.json file might miss disabled property)
    dataModel.elements.forEach(element => {
      element.disabled = false;
      element.metrics.forEach(metric => {
        metric.disabled = false;
      });
    });

    const selectedYear = Object.keys(data.years)[0] as Year // TODO: Make default year property in kommune_data_model.json?
    set({ dataModel, data, selectedYear });

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
      // Kommuner {}
      for (const komNr of Object.keys(data.years[year as Year].byKommune)) {
        const kommuneCache: KommuneCache = { totalRisk: 0 };
        
        let totalRisk = 0;
        for (const element of Object.values(dataModel.elements)) {
          const elementValue = calculateElementValue(element.key, komNr as KommuneNr, year as Year);
          if (elementValue !== null) {
            kommuneCache[element.key] = elementValue;
            totalRisk += element.disabled ? 0 : (element.invert === true ? 100 - elementValue : elementValue);
          }
        }
        kommuneCache.totalRisk = totalRisk;

        cache.years[year as Year].byKommune[komNr as KommuneNr] = kommuneCache;
      }
      // byElement {}
      for (const element of dataModel.elements) { // Each element
        cache.years[year as Year].byElement[element.key] = 
          Object.values(cache.years[year as Year].byKommune)
          .map(kommune => kommune[element.key])
          .sort((a, b) => a - b);
      }
      cache.years[year as Year].byTotalRisk = // Total risk
        Object.values(cache.years[year as Year].byKommune)
        .map(kommune => kommune.totalRisk)
        .sort((a, b) => a - b);
    }
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
              return acc + (element.disabled ? 0 : (element.invert === true ? 100 - elementValue : elementValue));
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
        ]
      })
    );

    set({ cache: { ...cache, years: newYears } });
  },

  refreshCacheElement: (elementKey) => {
    const { cache, calculateElementValue, refreshCacheRisk, dataModel } = get();
    if (!cache || !dataModel) return;

    let newYears: Cache["years"];
    // If all metrics are disabled, fill with 0s
    if (dataModel.elements.find(e => e.key === elementKey)!.metrics.every(m => m.disabled)) {
      newYears = Object.fromEntries(
        Object.entries(cache.years).map(([year, yearCache]) => {
          const newByKommune = Object.fromEntries(
            Object.entries(yearCache.byKommune).map(([komNr, kommuneCache]) => [
              komNr,
              {
                ...kommuneCache,
                [elementKey]: 0,
              }
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
    } else { // If some metrics are enabled, recalculate element
      newYears = Object.fromEntries(
        Object.entries(cache.years).map(([year, yearCache]) => {
          const { byKommune, byElement, byTotalRisk } = yearCache;

          const newByKommune = Object.fromEntries(
            Object.entries(byKommune).map(([komNr, kommuneCache]) => {
              const elementValue = calculateElementValue(elementKey, komNr as KommuneNr, year as Year);
              if (elementValue === null) return [komNr, kommuneCache]; // No change if element value is null (e.g. all metrics disabled)
              return [
                komNr,
                { ...kommuneCache, [elementKey]: elementValue }
              ];
            })
          )
          
          // rebuild distribution for this element
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
              byTotalRisk: byTotalRisk, // Total risk distribution will be updated in refreshCacheRisk
            }
          ]
        })
      );
    }

    set({ cache: { ...cache, years: newYears } });
    refreshCacheRisk(); // Update total risk after element value change
  },

  calculateElementValue: (elementKey, komNr, year) => {
    const { dataModel, data } = get()
    if (!dataModel || !data || !komNr || !year ) return null

    const metrics = dataModel.elements.find(el => el.key === elementKey)!.metrics
    const kommune = data.years[year].byKommune[komNr]

    const tmpRes = sumInvertibleValues(metrics, kommune)
    let min = Infinity
    let max = -Infinity
    for (const year of Object.values(data.years)) {
      for (const kom of Object.values(year.byKommune)) {
        const calculatedRisk = sumInvertibleValues(metrics, kom)
        if (calculatedRisk < min) min = calculatedRisk;
        if (calculatedRisk > max) max = calculatedRisk;
      }
    }
    
    if (min === max) return null
    return (tmpRes - min)/(max - min)*100
  },


  getRiskColor: (komNr, distKey?) => {
    const { data, cache, selectedYear, getDistributionDomain, selectedDistribuion } = get();
    const dist = distKey ?? selectedDistribuion;
    if (!data || !cache || !selectedYear || riskColors.length === 0 || !cache.years[selectedYear]) return 'gray';
    const risk = dist.type === "risk" 
      ? cache.years[selectedYear].byKommune[komNr].totalRisk
      : dist.type === "element"
        ? cache.years[selectedYear].byKommune[komNr][dist.key]
        : data.years[selectedYear].byKommune[komNr][dist.key];
    const [minRisk, maxRisk] = getDistributionDomain(dist) ?? [0, 0];
    if (minRisk === maxRisk) return 'gray'; // Avoid division by zero and invalid risk values
    const colorIndex = Math.floor((risk - minRisk) / (maxRisk - minRisk) * riskColors.length);
    return riskColors[Math.min(colorIndex, riskColors.length - 1)];
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

  setSelectedDistribution: (key) => set({ selectedDistribuion: key}),

  getDistributionDomain: (distributionKey) => {
    let min = Infinity;
    let max = -Infinity;

    if (distributionKey.type === "metric") {
      const { data } = get();
      if (!data) return undefined;

      for (const year of Object.values(data.years)) {
        const dist = year.byMetric[distributionKey.key]
        min = Math.min(min, dist[0]);
        max = Math.max(max, dist[dist.length - 1]);
      }

    } else {
      const { cache } = get();
      if (!cache) return undefined;

      for (const year of Object.values(cache.years)) {
        const dist = distributionKey.type === "risk" ? year.byTotalRisk : year.byElement[distributionKey.key];
        min = Math.min(min, dist[0]);
        max = Math.max(max, dist[dist.length - 1]);
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

    if (!data || !cache || !year) return null;

    const fylkeNr = komNr.slice(0, 2);

    if (distKey.type === "risk") {
      return Object.entries(cache.years[year].byKommune).filter(([k]) => k.startsWith(fylkeNr)).map(([,k]) => (k as KommuneCache).totalRisk).sort((a, b) => a - b);
    } else if (distKey.type === "element") {
      return Object.entries(cache.years[year].byKommune).filter(([k]) => k.startsWith(fylkeNr)).map(([,k]) => (k as KommuneCache)[distKey.key]).sort((a, b) => a - b);
    } else {
      return Object.entries(data.years[year].byKommune).filter(([k]) => k.startsWith(fylkeNr)).map(([,k]) => (k as KommuneData)[distKey.key]).sort((a, b) => a - b);
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

}));

export default useDataStore;