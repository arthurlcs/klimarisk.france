import { AreaChart, Area, XAxis, YAxis, Tooltip, ReferenceLine, ResponsiveContainer } from "recharts";
import useDataStore, { type DistributionKey, type KommuneNr } from "../../hooks/useDataStore";
import { useMemo, useState } from "react";
import DistributionSelect from "./DistributionSelect";
import "./DistributionChart.css";
import SteppedDomainGradient from "./SteppedDomainGradient";
import useLanguageStore, { t } from "../../hooks/useLanguageStore";
import ChartStats, { type ChartStatsData, type Region, type Stat } from "./ChartStats";

const DEPARTEMENTS_MAP: Record<string, string> = {
  "01": "Ain", "02": "Aisne", "03": "Allier", "04": "Alpes-de-Haute-Provence", "05": "Hautes-Alpes",
  "06": "Alpes-Maritimes", "07": "Ardèche", "08": "Ardennes", "09": "Ariège", "10": "Aube",
  "11": "Aude", "12": "Aveyron", "13": "Bouches-du-Rhône", "14": "Calvados", "15": "Cantal",
  "16": "Charente", "17": "Charente-Maritime", "18": "Cher", "19": "Corrèze", "2A": "Corse-du-Sud",
  "2B": "Haute-Corse", "21": "Côte-d'Or", "22": "Côtes-d'Armor", "23": "Creuse", "24": "Dordogne",
  "25": "Doubs", "26": "Drôme", "27": "Eure", "28": "Eure-et-Loir", "29": "Finistère",
  "30": "Gard", "31": "Haute-Garonne", "32": "Gers", "33": "Gironde", "34": "Hérault",
  "35": "Ille-et-Vilaine", "36": "Indre", "37": "Indre-et-Loire", "38": "Isère", "39": "Jura",
  "40": "Landes", "41": "Loir-et-Cher", "42": "Loire", "43": "Haute-Loire", "44": "Loire-Atlantique",
  "45": "Loiret", "46": "Lot", "47": "Lot-et-Garonne", "48": "Lozère", "49": "Maine-et-Loire",
  "50": "Manche", "51": "Marne", "52": "Haute-Marne", "53": "Mayenne", "54": "Meurthe-et-Moselle",
  "55": "Meuse", "56": "Morbihan", "57": "Moselle", "58": "Nièvre", "59": "Nord",
  "60": "Oise", "61": "Orne", "62": "Pas-de-Calais", "63": "Puy-de-Dôme", "64": "Pyrénées-Atlantiques",
  "65": "Hautes-Pyrénées", "66": "Pyrénées-Orientales", "67": "Bas-Rhin", "68": "Haut-Rhin",
  "69": "Rhône", "70": "Haute-Saône", "71": "Saône-et-Loire", "72": "Sarthe", "73": "Savoie",
  "74": "Haute-Savoie", "75": "Paris", "76": "Seine-Maritime", "77": "Seine-et-Marne", "78": "Yvelines",
  "79": "Deux-Sèvres", "80": "Somme", "81": "Tarn", "82": "Tarn-et-Garonne", "83": "Var",
  "84": "Vaucluse", "85": "Vendée", "86": "Vienne", "87": "Haute-Vienne", "88": "Vosges",
  "89": "Yonne", "90": "Territoire de Belfort", "91": "Essonne", "92": "Hauts-de-Seine",
  "93": "Seine-Saint-Denis", "94": "Val-de-Marne", "95": "Val-d'Oise",
  "971": "Guadeloupe", "972": "Martinique", "973": "Guyane", "974": "La Réunion", "976": "Mayotte"
};

type Props = {
  distributionKey: DistributionKey;
  bins?: number;
};

type ChartPoint = {
  value: number;
  count: number;
  countCounty?: number;
  intervalStart?: number;
  intervalEnd?: number;
  cosmetic?: boolean;
};

function buildHistogram(values: number[], bins: number, subValues: number[]): ChartPoint[] {
  if (values.length === 0) return [];

  const min = values[0];
  const max = values[values.length - 1];
  const step = (max - min) / bins || 1;

  const counts = Array(bins).fill(0);
  const subCounts = Array(bins).fill(0);

  for (const v of values) {
    const index = Math.min(Math.floor((v - min) / step), bins - 1);
    if (index >= 0) counts[index]++;
  }
  for (const v of subValues) {
    const index = Math.min(Math.floor((v - min) / step), bins - 1);
    if (index >= 0) subCounts[index]++;
  }

  return counts.map((count, i) => ({
    value: min + i * step + step / 2,
    count,
    countCounty: subCounts[i],
    intervalStart: min + i * step,
    intervalEnd: min + (i + 1) * step,
  }));
}

function getTicks(domain?: [number, number]): number[] {
  if (!domain) return [0, 100];
  const min10 = Math.floor(domain[0] / 10) * 10;
  const max10 = Math.ceil(domain[1] / 10) * 10;
  return [min10, (max10 + min10) / 2, max10];
}

function mean(arr: number[]): number | undefined {
  if (arr.length === 0) return undefined;
  return arr.reduce((sum, v) => sum + v, 0) / arr.length;
}

function median(sortedArr: number[]): number | undefined {
  if (sortedArr.length === 0) return undefined;
  const mid = Math.floor(sortedArr.length / 2);
  return sortedArr.length % 2 === 0
    ? (sortedArr[mid - 1] + sortedArr[mid]) / 2
    : sortedArr[mid];
}

function DistributionChart({ distributionKey, bins = 35 }: Props) {
  const {
    data,
    cache,
    selectedYear,
    selectedKommune,
    highlightedKommune,
    getDistributionDomain,
    riskColors,
    aggregationLevel,
    entityMapping, // 🎯 FIX : Ajouté ici pour résoudre l'erreur d'identification TypeScript
  } = useDataStore();
  const { l, language } = useLanguageStore();

  const yearData = data && data.years && selectedYear ? data.years[String(selectedYear)] : undefined;
  const yearCache = cache && cache.years && selectedYear ? cache.years[String(selectedYear)] : undefined;

  const distribution =
    !yearData || !yearCache
      ? undefined
      : distributionKey.type === "risk"
        ? yearCache.byTotalRisk
        : distributionKey.type === "element"
          ? yearCache.byElement[String(distributionKey.key)]
          : yearData.byMetric[String(distributionKey.key)];

  const localDistribution = useMemo(() => {
    if (!distribution || !yearData || !yearCache || !selectedKommune) return [];

    const byKommune =
      distributionKey.type === "risk"
        ? yearCache.byKommune
        : distributionKey.type === "element"
          ? yearCache.byKommune
          : yearData.byKommune;

    if (!byKommune) return [];

    let targetPrefix = String(selectedKommune).slice(0, 2);

    if (aggregationLevel === "epci") {
      const sampleCommuneInsee = Object.keys(entityMapping || {}).find(
        (communeInsee) => String(entityMapping[communeInsee]) === String(selectedKommune)
      );
      if (sampleCommuneInsee) {
        targetPrefix = sampleCommuneInsee.slice(0, 2);
      }
    }

    const filteredValues = Object.keys(byKommune)
      .filter(k => {
        if (aggregationLevel === "departement") return true;

        if (aggregationLevel === "epci") {
          const sampleCommune = Object.keys(entityMapping || {}).find(
            (communeInsee) => String(entityMapping[communeInsee]) === String(k)
          );
          return sampleCommune ? sampleCommune.slice(0, 2) === targetPrefix : false;
        }

        return k.slice(0, 2) === targetPrefix;
      })
      .map(k => {
        const kommuneData = yearData.byKommune[k as KommuneNr];
        const kommuneCache = yearCache.byKommune[k as KommuneNr];
        return distributionKey.type === "risk"
          ? kommuneCache?.totalRisk
          : distributionKey.type === "element"
            ? kommuneCache?.[String(distributionKey.key)]
            : kommuneData?.[String(distributionKey.key)];
      })
      .filter((v): v is number => v !== undefined);

    return filteredValues.sort((a, b) => a - b);
  }, [distribution, selectedKommune, yearData, yearCache, distributionKey, aggregationLevel, entityMapping]);

  const chartData = useMemo(() => {
    if (!distribution) return [];
    return buildHistogram(distribution, bins, localDistribution);
  }, [distribution, bins, localDistribution]);

  const kommuneData = yearData && selectedKommune ? yearData.byKommune[selectedKommune] : undefined;
  const kommuneCache = yearCache && selectedKommune ? yearCache.byKommune[selectedKommune] : undefined;
  const kommuneValue =
    !kommuneData || !kommuneCache
      ? undefined
      : distributionKey.type === "risk"
        ? kommuneCache.totalRisk
        : distributionKey.type === "element"
          ? kommuneCache[String(distributionKey.key)]
          : kommuneData[String(distributionKey.key)];

  const highlightData = yearData && highlightedKommune ? yearData.byKommune[highlightedKommune] : undefined;
  const highlightCache = yearCache && highlightedKommune ? yearCache.byKommune[highlightedKommune] : undefined;
  const highlightValue =
    !highlightData || !highlightCache
      ? undefined
      : distributionKey.type === "risk"
        ? highlightCache.totalRisk
        : distributionKey.type === "element"
          ? highlightCache[String(distributionKey.key)]
          : highlightData[String(distributionKey.key)];

  const domain = useMemo(() => {
    if (!distribution) return undefined;
    return getDistributionDomain(distributionKey);
  }, [getDistributionDomain, distributionKey, distribution]);

  const ticks = useMemo(() => {
    if (!distribution) return [0, 100];
    return getTicks(domain);
  }, [distribution, domain]);

  const [visibleStats, setVisibleStats] = useState<Record<Region, Record<Stat, boolean>>>({
    norge: { mean: false, median: false },
    fylke: { mean: false, median: false },
  });

  const chartStatsData = useMemo(() => (
    {
      mean: {
        norge: {
          visible: visibleStats.norge.mean,
          value: distribution ? mean(distribution) : undefined,
        },
        fylke: {
          visible: visibleStats.fylke.mean,
          value: localDistribution ? mean(localDistribution) : undefined,
        },
      },
      median: {
        norge: {
          visible: visibleStats.norge.median,
          value: distribution ? median(distribution) : undefined,
        },
        fylke: {
          visible: visibleStats.fylke.median,
          value: localDistribution ? median(localDistribution) : undefined,
        },
      },
    } as ChartStatsData
  ), [distribution, localDistribution, visibleStats]);

  function toggleStatVisible(region: Region, stat: Stat) {
    setVisibleStats(prev => ({
      ...prev,
      [region]: {
        ...prev[region],
        [stat]: !prev[region][stat]
      },
    }));
  }

  const currentCountyLabel = useMemo(() => {
    if (!selectedKommune || aggregationLevel === "departement") return undefined;

    let deptCode = selectedKommune.slice(0, 2);
    if (aggregationLevel === "epci" && yearData) {
      const sampleCommuneInsee = Object.keys(entityMapping || {}).find(
        (communeInsee) => String(entityMapping[communeInsee]) === String(selectedKommune)
      );
      if (sampleCommuneInsee) {
        deptCode = sampleCommuneInsee.slice(0, 2);
      }
    }

    const deptName = DEPARTEMENTS_MAP[deptCode];
    return deptName ? deptName : `Dép. ${deptCode}`;
  }, [selectedKommune, aggregationLevel, yearData, entityMapping]);

  const entityUnitLabel = useMemo(() => {
    if (aggregationLevel === "departement") return language === "en" ? "departments" : "départements";
    if (aggregationLevel === "epci") return "EPCI";
    return language === "en" ? "municipalities" : "communes";
  }, [aggregationLevel, language]);

  return (
    <div className="chartContainer">
      <div className="distSelect">
        <DistributionSelect />
      </div>

      <div className="mainChartArea">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
            <SteppedDomainGradient
              colors={riskColors}
              domain={domain ?? [0, 100]}
              ticks={ticks}
            />

            <XAxis
              dataKey="value"
              type="number"
              ticks={ticks}
              interval={0}
              allowDataOverflow
              tick={<CustomTick />}
            />

            <YAxis yAxisId="left" hide domain={[0, 'auto']} />
            <YAxis yAxisId="right" hide domain={[0, 'auto']} />

            <Tooltip
              content={(props) => {
                if (!props.active || !props.payload || props.payload.length === 0) return null;
                const payload = props.payload[0].payload as ChartPoint;
                if (payload.cosmetic) return null;
                return (
                  <div className="customTooltip">
                    <div>
                      {`${l(t.chart.tooltip.interval)}: ${payload.intervalStart?.toFixed(0)} - ${payload.intervalEnd?.toFixed(0)}`}
                    </div>
                    <div style={{ color: "var(--c-norge)" }}>
                      {`${language === "en" ? "France" : "France"} : ${payload.count} ${entityUnitLabel}`}
                    </div>
                    {selectedKommune && aggregationLevel !== "departement" && (
                      <div style={{ color: "var(--c-fylke)" }}>
                        {`${currentCountyLabel || l(t.chart.tooltip.county)} : ${payload.countCounty} ${entityUnitLabel}`}
                      </div>
                    )}
                  </div>
                );
              }}
            />

            <Area
              yAxisId="left"
              type="monotone"
              dataKey="count"
              stroke="var(--c-norge)"
              fill="url(#riskGradient)"
              isAnimationActive={false}
            />

            <Area
              yAxisId="right"
              type="monotone"
              dataKey="countCounty"
              stroke="var(--c-fylke)"
              strokeWidth={1}
              fill="none"
              isAnimationActive={false}
            />

            {kommuneValue !== null && kommuneValue !== undefined && (
              <ReferenceLine
                yAxisId="left"
                x={kommuneValue}
                stroke="var(--c-selected2)"
                strokeWidth={3}
              />
            )}
            {highlightValue !== null && highlightValue !== undefined && (
              <ReferenceLine
                yAxisId="left"
                x={highlightValue}
                stroke="var(--c-accent2)"
                strokeWidth={2}
              />
            )}
            {Object.entries(chartStatsData).map(([stat, x]) => Object.entries(x).map(([region, v]) => v.visible && v.value !== undefined && (
              <ReferenceLine
                yAxisId="left"
                key={`${region}-${stat}`}
                x={v.value}
                stroke={`var(--c-${region})`}
                strokeWidth={2}
                strokeDasharray={stat === "mean" ? "8 8" : "2 2"}
              />
            )))}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="chartStatsContainer">
        <ChartStats
          data={chartStatsData}
          toggleStatVisible={toggleStatVisible}
          countyName={currentCountyLabel}
        />
      </div>
    </div>
  );
}

export default DistributionChart;

const CustomTick = (props: unknown) => {
  if (typeof props !== "object" || props === null) return null;
  if (!("x" in props) || !("y" in props) || !("payload" in props) || !("index" in props)) return null;

  const { x, y, payload, index } = props as {
    x: number;
    y: number;
    payload: { value: number };
    index: number;
  };

  let textAnchor: "start" | "middle" | "end" = "middle";
  if (index === 0) textAnchor = "start";
  else if (index === 2) textAnchor = "end";

  return (
    <text x={x} y={y + 12} textAnchor={textAnchor} fill="var(--c-accent2)" fontSize={16}>
      {payload.value}
    </text>
  );
};