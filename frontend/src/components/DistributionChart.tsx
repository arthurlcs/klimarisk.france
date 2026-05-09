import { AreaChart, Area, XAxis, Tooltip, ReferenceLine, ResponsiveContainer, Line } from "recharts";
import useDataStore, { type DistributionKey, type KommuneNr } from "../hooks/useDataStore";
import { useMemo } from "react";
import DistributionSelect from "./DistributionSelect";
import "./DistributionChart.css";

type Props = {
  distributionKey: DistributionKey; 
  bins?: number;
};

type ChartPoint = {
  value: number;
  count: number;
  countCounty?: number;
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
    countCounty: fylkeCounts[i]
  }));
}

function getTicks(domain?: [number, number]): number[] {
  if (!domain) return [0, 1000];
  const min10 = Math.floor(domain[0] / 10) * 10;
  const max10 = Math.ceil(domain[1] / 10) * 10;
  return [min10, (max10+min10)/2, max10];
}




function DistributionChart({ distributionKey, bins = 25 }: Props) {
  const { 
    data,
    cache, 
    selectedYear, 
    selectedKommune, 
    highlightedKommune, 
    getDistributionDomain, 
  } = useDataStore();

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

  const chartData = useMemo(() => {
    if (!distribution || !yearData || !yearCache) return []

    // Find number of kommuner in the same fylke as the selected kommune
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
    return buildHistogram(distribution, bins, fylkeValues.sort((a, b) => a - b));
  }, [distribution, bins, selectedKommune, yearData, yearCache, distributionKey]);

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

  const ticks = useMemo(() => {
    if (!distribution) return [0, 100];
    return getTicks(getDistributionDomain(distributionKey));
  }, [distribution, distributionKey, getDistributionDomain]);
  
  return (
    <div className="chartContainer">
      <DistributionSelect />
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={chartData}>
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
            formatter={(value, name) => {
              if (name === "count") return [`${value} kommuner`, "Norge"];
              if (name === "countCounty") return [`${value} kommuner`, "Fylke"];
              return [value, name];
            }}
            labelFormatter={(label) => `Verdi: ${Number(label).toFixed(1)}`}
          />
          <Area
            type="monotone"
            dataKey="count"
            stroke="#3b82f6"
            fill="#93c5fd"
          />
          <Line
            type="monotone"
            dataKey="countCounty"
            stroke="#3b82f6"
            fill="#93c5fd"
            dot={false}
          />

          {kommuneValue !== null && (
            <ReferenceLine
              x={kommuneValue}
              stroke="red"
              strokeWidth={2}
            />
          )}
          {highlightValue !== null && (
            <ReferenceLine
              x={highlightValue}
              stroke="black"
              strokeWidth={2}
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
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
      fill="#666"
      fontSize={16}
    >
      {payload.value}
    </text>
  );
};