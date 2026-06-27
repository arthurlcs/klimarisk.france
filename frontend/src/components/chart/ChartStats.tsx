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
  countyName?: string; //
}

function ChartStats({ data, toggleStatVisible, countyName }: Props) {
  const { l } = useLanguageStore();

  return (
    <div className="chartStatsContainer">
      {(Object.entries(data) as [Stat, StatData][]).map(([stat, regions]) => (
        <table key={stat} className="statsTable">
          <tbody>
            <tr className="statsRow">
              {/* Intitulé aligné à gauche */}
              <td className="statGroupLabel">
                {stat === "mean" ? l(t.chart.stats.mean) : l(t.chart.stats.median)} :
              </td>

              {/* Puces d'options */}
              <td className="statGroupOptions">
                {(Object.entries(regions) as [Region, RegionData][]).map(([region, val]) => {
                  if (val.value === undefined) return null;

                  const tooltipText = region === "norge"
                    ? l(t.chart.stats.tooltip.norge)
                    : l(t.chart.stats.tooltip.fylke);

                  return (
                    <Tooltip key={`${region}-${stat}`} text={tooltipText}>
                      <label
                        htmlFor={`${region}-${stat}`}
                        className={`compactStatToggle ${region} ${stat} ${val.visible ? "active" : ""}`}
                      >
                        <input
                          type="checkbox"
                          id={`${region}-${stat}`}
                          checked={val.visible}
                          onChange={() => toggleStatVisible(region, stat)}
                          className="hiddenCheckbox"
                        />
                        <span className="statIndicator"></span>
                        <span className="statLabelText">
                          {region === "norge"
                            ? l(t.chart.tooltip.norway)
                            : (countyName || l(t.chart.tooltip.county))
                          }
                        </span>
                        <span className="statValueNumber">
                          {val.value.toFixed()}
                        </span>
                      </label>
                    </Tooltip>
                  );
                })}
              </td>
            </tr>
          </tbody>
        </table>
      ))}
    </div>
  );
}

export default ChartStats;