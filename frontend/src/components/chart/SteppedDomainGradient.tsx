import { usePlotArea } from "recharts";

interface Props {
  colors: string[];
  domain: [number, number];
  ticks: number[];
}

function SteppedDomainGradient({ colors, domain, ticks }: Props) {
  const plotArea = usePlotArea();

  if (!plotArea || ticks.length < 2) return null;

  const axisMin = ticks[0];
  const axisMax = ticks[ticks.length - 1];

  if (axisMin === axisMax) return null;

  const valueToX = (value: number) => {
    const t = (value - axisMin) / (axisMax - axisMin);
    return plotArea.x + t * plotArea.width;
  };

  const x1 = valueToX(domain[0]);
  const x2 = valueToX(domain[1]);

  return (
    <defs>
      <linearGradient
        id="riskGradient"
        gradientUnits="userSpaceOnUse"
        x1={x1}
        x2={x2}
        y1={0}
        y2={0}
      >
        {colors.flatMap((color, i) => {
          const start = (i / colors.length) * 100;
          const end = ((i + 1) / colors.length) * 100;

          return [
            <stop key={`${i}-start`} offset={`${start}%`} stopColor={color} />,
            <stop key={`${i}-end`} offset={`${end}%`} stopColor={color} />,
          ];
        })}
      </linearGradient>
    </defs>
  );
}

export default SteppedDomainGradient;