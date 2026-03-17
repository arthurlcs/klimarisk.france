import { AreaChart, Area, XAxis, Tooltip, ReferenceLine, ResponsiveContainer } from "recharts";
import useDataStore, { type MetricKey } from "../hooks/useDataStore";
import { useMemo } from "react";

type Props = {
  elementKey: MetricKey | "risk"; // rename to metricKey and add support for metrics and elements and totalrisk
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

export default function DistributionChart({ elementKey, bins = 25 }: Props) {
  const { 
    cache, 
    selectedYear, 
    selectedKommune, 
  } = useDataStore();

  const yearCache = cache!.years[selectedYear!];

  const distribution =
    elementKey === "risk"
      ? yearCache.byElement.totalRisk
      : yearCache.byElement[elementKey]; //TODO yearData.byMetric support

  const chartData = useMemo(() => {
    if (!distribution) return []
    return buildHistogram(distribution, bins);
  }, [distribution, bins])
  

  let kommuneValue: number | null = null;

  if (selectedKommune) {
    const kommuneCache = yearCache.byKommune[selectedKommune];
    kommuneValue =
      elementKey === "risk"
        ? kommuneCache.totalRisk
        : kommuneCache[elementKey];
  }

  return (
    <ResponsiveContainer width="100%" height={250}>
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