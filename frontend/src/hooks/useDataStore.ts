import { create } from 'zustand';
import { getDataFileJSON } from './getPublicUrl';

type MetricKey = string & { readonly __brand: unique symbol};

type Metric = {
  name: string; 
  key: MetricKey;
  invert?: boolean;
  disabled: boolean;
}

type Element = {
  name: string;
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
  [elementIndex: number]: number;
  totalRisk: number;
}

type Cache = {
  years: {
    [year: Year]: {
      byKommune: { // Access values for a specific kommune
        [kommuneNr: KommuneNr]: KommuneCache;
      }
      byMetric: { // Access values for a specific metric across all kommune
        [metricKey: MetricKey]: number[];
      }
    }
  }
  minRisk: number;
  maxRisk: number;
}


const sumInvertibleValues = (metrics: Metric[], kommune: KommuneData): number => {
  return metrics.reduce((acc, metric) => acc + (metric.disabled ? 0 : (metric.invert === true ? 100-kommune[metric.key] : kommune[metric.key])), 0)
}

interface DataStore {
  dataModel: DataModel | null;
  data: Data | null;
  fetchData: () => Promise<void>;

  cache: Cache | null;
  refreshCache: (elementIndex?: number | "risk") => void;
  refreshCacheDeep: () => void;
  refreshCacheRisk: () => void;
  refreshCacheElement: (elementIndex: number) => void;
  calculateElementValue: (elementIndex: number, komNr: KommuneNr, year: Year) => number | null; // takes index of the element (hazard, vulnr, expo or resp) in the elements list

  getRiskColor: (komNr: KommuneNr, colors?: string[]) => string;


  selectedYear: Year | null;
  setSelectedYear: (year: Year) => void;

  highlightedKommune: KommuneNr | null;
  setHighlightedKommune: (kommune: KommuneNr | null) => void;
  
  selectedKommune: KommuneNr | null;
  setSelectedKommune: (kommune: KommuneNr | null) => void;
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

  refreshCache: (elementIndex?: number | "risk") => {
    if (elementIndex === undefined) { // Recalculate entire cache
      get().refreshCacheDeep();

    } else if (elementIndex === "risk") { // Only recalculate total risk for all kommunes (used when toggling element on/off to update total risk without recalculating all element values)
      get().refreshCacheRisk();

    } else { // Recalculate only specified element for all kommunes (used when toggling metric on/off to update element value without recalculating total risk)
      get().refreshCacheElement(elementIndex);

    }
  },

  refreshCacheDeep: () => {
    const { dataModel, data, calculateElementValue } = get();
    if (!dataModel || !data || !data.years) return;

    const cache: Cache = {
      years: {},
      minRisk: Infinity,
      maxRisk: -Infinity,
    } as Cache;

    for (const year of Object.keys(data.years)) {
      cache.years[year as Year] = {
        byKommune: {},
        byMetric: {},
      };
      // Kommuner {}
      for (const komNr of Object.keys(data.years[year as Year].byKommune)) {
        const kommuneCache: KommuneCache = { totalRisk: 0 };
        
        let totalRisk = 0;
        for (let i = 0; i < dataModel.elements.length; i++) {
          const elementValue = calculateElementValue(i, komNr as KommuneNr, year as Year);
          if (elementValue !== null) {
            kommuneCache[i] = elementValue;
            totalRisk += dataModel.elements[i].disabled ? 0 : (dataModel.elements[i].invert === true ? 100 - elementValue : elementValue);
          }
        }
        kommuneCache.totalRisk = totalRisk;
        if (totalRisk < cache.minRisk) cache.minRisk = totalRisk;
        if (totalRisk > cache.maxRisk) cache.maxRisk = totalRisk;

        cache.years[year as Year].byKommune[komNr as KommuneNr] = kommuneCache;
      }
      // Metrics {}
      for (const metric of dataModel.elements.flatMap(e => e.metrics)) {
        cache.years[year as Year].byMetric[metric.key] = Object.values(data.years[year as Year].byKommune).map(kommune => {
          return sumInvertibleValues([metric], kommune);
        });
        cache.years[year as Year].byMetric[metric.key].sort((a, b) => a - b);
      }
    }
    set({ cache });
  },

  refreshCacheRisk: () => {
    const { dataModel, cache } = get();
    if (!dataModel || !cache) return;

    let minRisk = Infinity;
    let maxRisk = -Infinity;

    const newYears = Object.fromEntries(
      Object.entries(cache.years).map(([year, yearCache]) => {
        const { byKommune, byMetric } = yearCache;

        const newByKommune = Object.fromEntries(
          Object.entries(byKommune).map(([komNr, kommuneCache]) => {

            const totalRisk = dataModel.elements.reduce((acc, element, index) => {
              const elementValue = cache.years[year as Year].byKommune[komNr as KommuneNr][index];
              return acc + (element.disabled ? 0 : (element.invert === true ? 100 - elementValue : elementValue));
            }, 0);

            if (totalRisk < minRisk) minRisk = totalRisk;
            if (totalRisk > maxRisk) maxRisk = totalRisk;
            return [komNr, { ...kommuneCache, totalRisk }];
          })
        );

        return [
          year,
          {
            byKommune: newByKommune,
            byMetric, // preserve old byMetric
          }
        ]
      })
    );

    set({ cache: { ...cache, years: newYears, minRisk, maxRisk } });
  },

  refreshCacheElement: (elementIndex) => {
    const { cache, calculateElementValue, refreshCacheRisk } = get();
    if (!cache) return;

    const newYears = Object.fromEntries(
      Object.entries(cache.years).map(([year, yearCache]) => {
        const { byKommune, byMetric } = yearCache;

        const newByKommune = Object.fromEntries(
          Object.entries(byKommune).map(([komNr, kommuneCache]) => {
            const elementValue = calculateElementValue(elementIndex, komNr as KommuneNr, year as Year);
            if (elementValue === null) return [komNr, kommuneCache]; // No change if element value is null (e.g. all metrics disabled)
            return [
              komNr,
              { ...kommuneCache, [elementIndex]: elementValue }
            ];
          })
        )
        
        return [
          year,
          {
            byKommune: newByKommune,
            byMetric, // preserve old byMetric
          }
        ]
      })
    );

    set({ cache: { ...cache, years: newYears } });
    refreshCacheRisk(); // Update total risk after element value change
  },

  calculateElementValue: (elementIndex, komNr, year) => {
    const { dataModel, data } = get()
    if (!dataModel || !data || !komNr || !year ) return null

    const metrics = dataModel.elements[elementIndex].metrics
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


  getRiskColor: (komNr, colors = ['green', 'yellow', 'orange', 'red']) => {
    const { cache, selectedYear } = get();
    if (!cache || !selectedYear || colors.length === 0 || !cache.years[selectedYear]) return 'gray';
    const risk = cache.years[selectedYear].byKommune[komNr].totalRisk;
    const { minRisk, maxRisk } = cache;
    if (minRisk === maxRisk) return 'gray'; // Avoid division by zero and invalid risk values
    const colorIndex = Math.floor((risk - minRisk) / (maxRisk - minRisk) * colors.length);
    return colors[Math.min(colorIndex, colors.length - 1)];
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

}));

export default useDataStore;