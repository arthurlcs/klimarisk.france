import useLanguageStore, { t } from "../../hooks/useLanguageStore";
import Tooltip from "../Tooltip";

export type Region = "norge" | "fylke";
export type Stat = "mean" | "median";

type RegionData = {
  visible: boolean,
  value: number | undefined,
}

type StatData = Record<Region, RegionData>

export type ChartStatsData = Record<Stat, StatData>

interface Props {
  data: ChartStatsData;
  toggleStatVisible: (region: Region, stat: Stat) => void;
}

function ChartStats({ data, toggleStatVisible }: Props) {
  const { l } = useLanguageStore();

  return (
    <div className="chartStatsContainer">
      <div>
        <div className="chartStatHeader">
          <div className="norge">
            <Tooltip text={l(t.chart.stats.tooltip.norge)}>
              {l(t.chart.tooltip.norway)}
            </Tooltip>
          </div>
          {(data.mean.fylke.value !== undefined || data.median.fylke.value !== undefined) && (
            <div className="fylke">
              <Tooltip text={l(t.chart.stats.tooltip.fylke)}>
                {l(t.chart.tooltip.county)}
              </Tooltip>
            </div>
          ) || null}
        </div>
        {(Object.entries(data) as [Stat, StatData][]).map(([stat, x]) => (
          <div key={stat} className="chartStat">
            <div className={`chartStatName ${stat}`}>
              {stat === "mean" ? l(t.chart.stats.mean) : l(t.chart.stats.median)}:
            </div>
            {(Object.entries(x) as [Region, RegionData][]).map(([region, val]) => val.value !== undefined && (
              <label 
                htmlFor={`${region}-${stat}`} 
                key={`${region}-${stat}`}
                className={`chartStatVal ${region}`}
              >
                <input 
                  type="checkbox" 
                  id={`${region}-${stat}`}
                  checked={data[stat][region].visible}
                  onChange={() => toggleStatVisible(region, stat)}
                />
                <div>
                  {val.value.toFixed()}
                </div>
              </label>
            ) || null)}
          </div>
        ))}
      </div>
    </div>
  )
}

export default ChartStats;