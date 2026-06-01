import { AreaChart, Area, XAxis, Tooltip, ReferenceLine, ResponsiveContainer, Line } from "recharts";
import useDataStore, { type DistributionKey, type KommuneNr } from "../../hooks/useDataStore";
import { useMemo, useState } from "react";
import DistributionSelect from "./DistributionSelect";
import "./DistributionChart.css";
import SteppedDomainGradient from "./SteppedDomainGradient";
import useLanguageStore, { t } from "../../hooks/useLanguageStore";
import ChartStats, { type ChartStatsData, type Region, type Stat } from "./ChartStats";

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

function buildHistogram(values: number[], bins: number, fylkeValues: number[]): ChartPoint[] {
  if (values.length === 0) return [];

  const min = values[0];
  const max = values[values.length - 1];
  const step = (max - min) / bins;

  const counts = Array(bins).fill(0);
  const fylkeCounts = Array(bins).fill(0);

  for (const v of values) {
    const index = Math.min(
      Math.floor((v - min) / step),
      bins - 1
    );
    counts[index]++;
  }
  for (const v of fylkeValues) {
    const index = Math.min(
      Math.floor((v - min) / step),
      bins - 1
    );
    fylkeCounts[index]++;
  }

  return counts.map((count, i) => ({
    value: min + i * step + step / 2,
    count,
    countCounty: fylkeCounts[i],
    intervalStart: min + i * step,
    intervalEnd: min + (i + 1) * step,
  }));
}

function getTicks(domain?: [number, number]): number[] {
  if (!domain) return [0, 1000];
  const min10 = Math.floor(domain[0] / 10) * 10;
  const max10 = Math.ceil(domain[1] / 10) * 10;
  return [min10, (max10+min10)/2, max10];
}

function mean(arr: number[]): number | undefined {
  if (arr.length === 0) return undefined;
  return arr.reduce((sum, v) => sum + v, 0) / arr.length
}

function median(sortedArr: number[]): number | undefined {
  if (sortedArr.length === 0) return undefined;
  const mid = Math.floor(sortedArr.length / 2);
  return sortedArr.length % 2 === 0
    ? (sortedArr[mid - 1] + sortedArr[mid]) / 2
    : sortedArr[mid];
}



function DistributionChart({ distributionKey, bins = 25 }: Props) {
  const { 
    data,
    cache, 
    selectedYear, 
    selectedKommune, 
    highlightedKommune, 
    getDistributionDomain, 
    riskColors,
  } = useDataStore();
  const { l } = useLanguageStore();

  const yearData = data && data.years && selectedYear ? data!.years[selectedYear] : undefined;
  const yearCache = cache && cache.years && selectedYear ? cache!.years[selectedYear] : undefined;

  const distribution =
    !yearData || !yearCache
      ? undefined 
      : distributionKey.type === "risk"
        ? yearCache.byTotalRisk
        : distributionKey.type === "element" 
          ? yearCache.byElement[distributionKey.key]
          : yearData.byMetric[distributionKey.key];

  const fylkeDistribution = useMemo(() => {
    if (!distribution || !yearData || !yearCache) return []
    const byKommune = 
      distributionKey.type === "risk"
        ? yearCache?.byKommune
        : distributionKey.type === "element"
          ? yearCache?.byKommune
          : yearData?.byKommune;
    const fylkeValues = byKommune && selectedKommune ? Object.keys(byKommune).filter(k => k.slice(0, 2) === selectedKommune.slice(0,2)).map(k => {
      const kommuneData = yearData.byKommune[k as KommuneNr];
      const kommuneCache = yearCache.byKommune[k as KommuneNr];
      return distributionKey.type === "risk"
        ? kommuneCache.totalRisk
        : distributionKey.type === "element"
          ? kommuneCache[distributionKey.key]
          : kommuneData[distributionKey.key];
    }) : [];
    return fylkeValues.sort((a, b) => a - b)
  }, [distribution, selectedKommune, yearData, yearCache, distributionKey]);

  const chartData = useMemo(() => {
    if (!distribution) return []
    return buildHistogram(distribution, bins, fylkeDistribution);
  }, [distribution, bins, fylkeDistribution]);

  const kommuneData = yearData && selectedKommune ? yearData.byKommune[selectedKommune] : undefined;
  const kommuneCache = yearCache && selectedKommune ? yearCache.byKommune[selectedKommune] : undefined;
  const kommuneValue =
    !kommuneData || !kommuneCache 
      ? undefined 
      : distributionKey.type === "risk"
        ? kommuneCache.totalRisk
        : distributionKey.type === "element"
          ? kommuneCache[distributionKey.key]
          : kommuneData[distributionKey.key];

  const highlightData = yearData && highlightedKommune ? yearData.byKommune[highlightedKommune] : undefined;
  const highlightCache = yearCache && highlightedKommune ? yearCache.byKommune[highlightedKommune] : undefined;
  const highlightValue = 
    !highlightData || !highlightCache
      ? undefined
      : distributionKey.type === "risk"
        ? highlightCache.totalRisk
        : distributionKey.type === "element"
          ? highlightCache[distributionKey.key]
          : highlightData[distributionKey.key];

  const domain = useMemo(() => {
    if (!distribution) return undefined;
    return getDistributionDomain(distributionKey);
  }, [getDistributionDomain, distributionKey, distribution])

  const ticks = useMemo(() => {
    if (!distribution) return [0, 100];
    return getTicks(domain);
  }, [distribution, domain]);

  const [visibleStats, setVisibleStats] = useState<Record<Region, Record<Stat, boolean>>>({
    norge: {
      mean: false,
      median: false,
    },
    fylke: {
      mean: false,
      median: false,
    },
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
          value: fylkeDistribution ? mean(fylkeDistribution) : undefined,
        },
      },
      median: {
        norge: {
          visible: visibleStats.norge.median,
          value: distribution ? median(distribution) : undefined,
        },
        fylke: {
          visible: visibleStats.fylke.median,
          value: fylkeDistribution ? median(fylkeDistribution) : undefined,
        },
      },
    } as ChartStatsData
  ), [distribution, fylkeDistribution, visibleStats]);

  function toggleStatVisible(region: Region, stat: Stat) {
    setVisibleStats(prev => ({
      ...prev,
      [region]: {
        ...prev[region],
        [stat]: !prev[region][stat]
      },
    }));
  }
  
  return (
    <div className="chartContainer">
      <DistributionSelect />
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <SteppedDomainGradient 
            colors={riskColors} 
            domain={domain ?? [0, 1000]} 
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
          {/* <YAxis /> */}
          <Tooltip 
            content={(props) => {
              if (!props.active || !props.payload || props.payload.length === 0) return null;
              const payload = props.payload[0].payload as ChartPoint;
              if (payload.cosmetic) return null; // don't show tooltip for cosmetic points
              return (
                <div className="customTooltip">
                  <div>{`${l(t.chart.tooltip.interval)}: ${payload.intervalStart?.toFixed(0)} - ${payload.intervalEnd?.toFixed(0)}`}</div>
                  <div style={{ color: "var(--c-norge)" }}>{`${l(t.chart.tooltip.norway)}: ${payload.count} ${l(t.chart.tooltip.kommuner)}`}</div>
                  <div style={{ color: "var(--c-fylke)" }}>{`${l(t.chart.tooltip.county)}: ${payload.countCounty} ${l(t.chart.tooltip.kommuner)}`}</div>
                </div>
              )
            }}
          />
          <Area
            type="monotone"
            dataKey="count"
            stroke="var(--c-norge)"
            fill="url(#riskGradient)"
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey="countCounty"
            stroke="var(--c-fylke)"
            dot={false}
            isAnimationActive={false}
          />

          {kommuneValue !== null && (
            <ReferenceLine
              x={kommuneValue}
              stroke="var(--c-selected2)"
              strokeWidth={3}
            />
          )}
          {highlightValue !== null && (
            <ReferenceLine
              x={highlightValue}
              stroke="var(--c-accent2)"
              strokeWidth={2}
            />
          )}
          {Object.entries(chartStatsData).map(([stat, x]) => Object.entries(x).map(([region, v]) => v.visible && (
            <ReferenceLine
              key={`${region}-${stat}`}
              x={v.value}
              stroke={`var(--c-${region})`}
              strokeWidth={2}
              strokeDasharray={stat === "mean" ? "8 8" : "2 2"}
            />
          )))}
        </AreaChart>
      </ResponsiveContainer>
      <ChartStats data={chartStatsData} toggleStatVisible={toggleStatVisible} />
    </div>
  );
}

export default DistributionChart;









const CustomTick = (props: unknown) => {
  if (typeof props !== "object" || props === null) return null;
  if (!("x" in props) || !("y" in props) || !("payload" in props) || !("index" in props)) {
    return null;
  }
  const { x, y, payload, index } = props as {
    x: number;
    y: number;
    payload: { value: number };
    index: number;
  };
  if (
    typeof x !== "number" ||
    typeof y !== "number" ||
    typeof payload !== "object" ||
    payload === null ||
    typeof payload.value !== "number" ||
    typeof index !== "number"
  ) {
    return null;
  }

  let textAnchor: "start" | "middle" | "end" = "middle";

  if (index === 0) textAnchor = "start";           // first tick → left-aligned
  else if (index === 2) textAnchor = "end"; // last → right-aligned

  return (
    <text
      x={x}
      y={y + 12}
      textAnchor={textAnchor}
      fill="var(--c-accent2)"
      fontSize={16}
    >
      {payload.value}
    </text>
  );
};