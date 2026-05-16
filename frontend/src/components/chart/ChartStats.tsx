import useLanguageStore, { t } from "../../hooks/useLanguageStore";

export type Region = "norge" | "fylke";
export type Stat = "mean" | "median";

type StatData = {
  visible: boolean,
  value: number | undefined,
}

type RegionData = Record<Stat, StatData>

export type ChartStatsData = Record<Region, RegionData>

interface Props {
  data: ChartStatsData;
  toggleStatVisible: (region: Region, stat: Stat) => void;
}

function ChartStats({ data, toggleStatVisible }: Props) {
  const { l } = useLanguageStore();

  return (
    <div>
      {(Object.entries(data) as [Region, RegionData][]).map(([region, x]) => (
        <div>
        {(Object.entries(x) as [Stat, StatData][]).map(([stat, val]) => (
          <label htmlFor={`${region}-${stat}`}>
            <input 
              type="checkbox" 
              id={`${region}-${stat}`}
              checked={data[region][stat].visible}
              onChange={() => toggleStatVisible(region, stat)}
            />
            <div>
              {region === "norge" ? l(t.chart.tooltip.norway) : l(t.chart.tooltip.county)} {stat === "mean" ? l(t.chart.stats.mean) : l(t.chart.stats.median)}: {val.value?.toFixed()}
            </div>
          </label>
        ))}
        </div>
      ))}
    </div>
  )
}

export default ChartStats;