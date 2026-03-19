import { AreaChart, Area, XAxis, Tooltip, ReferenceLine, ResponsiveContainer } from "recharts";
import useDataStore, { type DistributionKey } from "../hooks/useDataStore";
import { useMemo } from "react";
import DistributionSelect from "./DistributionSelect";

type Props = {
  distributionKey: DistributionKey; 
  bins?: number;
};

type ChartPoint = {
  value: number;
  count: number;
};

function buildHistogram(values: number[], bins: number): ChartPoint[] {
  if (values.length === 0) return [];

  const min = values[0];
  const max = values[values.length - 1];
  const step = (max - min) / bins;

  const counts = Array(bins).fill(0);

  for (const v of values) {
    const index = Math.min(
      Math.floor((v - min) / step),
      bins - 1
    );
    counts[index]++;
  }

  return counts.map((count, i) => ({
    value: min + i * step + step / 2,
    count
  }));
}

function DistributionChart({ distributionKey, bins = 25 }: Props) {
  const { 
    data,
    cache, 
    selectedYear, 
    selectedKommune, 
  } = useDataStore();

  const yearData = data && data.years && selectedYear ? data!.years[selectedYear] : undefined;
  const yearCache = cache && cache.years && selectedYear ? cache!.years[selectedYear] : undefined;

  const distribution =
    !yearData || !yearCache
      ? undefined 
      : distributionKey.type === "risk"
        ? yearCache.byElement.totalRisk
        : distributionKey.type === "element" 
          ? yearCache.byElement[distributionKey.key]
          : yearData.byMetric[distributionKey.key];

  const chartData = useMemo(() => {
    if (!distribution) return []
    return buildHistogram(distribution, bins);
  }, [distribution, bins])

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

  return (
    <ResponsiveContainer width="100%" height={250}>
      <DistributionSelect />
      <AreaChart data={chartData}>
        <XAxis dataKey="value" type="number" />
        {/* <YAxis /> */}
        <Tooltip />
        <Area
          type="monotone"
          dataKey="count"
          stroke="#3b82f6"
          fill="#93c5fd"
        />

        {kommuneValue !== null && (
          <ReferenceLine
            x={kommuneValue}
            stroke="red"
            strokeWidth={2}
          />
        )}
        {/* <ReferenceLine 
          x={distribution[0]}
        />
        <ReferenceLine
          x={distribution[distribution.length-1]}
        /> */}
      </AreaChart>
    </ResponsiveContainer>
  );
}

export default DistributionChart;