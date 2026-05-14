import useDataStore, { type ElementKey, type MetricKey } from "../hooks/useDataStore";
import { getDescendingRank } from "../hooks/statistics";
import { useMemo } from "react";
import "./DetailedStats.css";
import DetailsRisk from "./DetailsRisk";
import useLanguageStore, { t } from "../hooks/useLanguageStore";

export type RankMetric = {
  name: string;
  key: MetricKey;
  rank: number;
  rankFylke: number;
}
export type RankElement = {
  name: string;
  key: ElementKey;
  rank: number;
  rankFylke: number;
  metrics: RankMetric[];
}
export type RankRisk = {
  name: string;
  rank: number;
  rankFylke: number;
  elements: RankElement[];
}

function DetailedStats() {

  const { 
    dataModel,
    data,
    cache,
    selectedYear,
    selectedKommune,
    getFylkeDistribution,
  } = useDataStore();

  const yearData = data && selectedYear ? data.years[selectedYear] : null
  const yearCache = cache && selectedYear ? cache.years[selectedYear] : null

  const ranks = useMemo(() => {
    if (!yearData || !yearCache || !dataModel || !selectedKommune || !selectedYear) return null;
    const tmp: RankRisk = {
      name: "Total Risk",
      rank: getDescendingRank(yearCache.byTotalRisk, yearCache.byKommune[selectedKommune].totalRisk),
      rankFylke: getDescendingRank(getFylkeDistribution(selectedKommune, { type: "risk" }, selectedYear)!, yearCache.byKommune[selectedKommune].totalRisk),
      elements: dataModel.elements.filter(e => !e.disabled).map(e => ({
        name: e.name,
        key: e.key,
        rank: getDescendingRank(yearCache.byElement[e.key], yearCache.byKommune[selectedKommune][e.key]),
        rankFylke: getDescendingRank(getFylkeDistribution(selectedKommune, { type: "element", key: e.key }, selectedYear)!, yearCache.byKommune[selectedKommune][e.key]),
        metrics: e.metrics.filter(m => !m.disabled).map(m => ({
          name: m.name,
          key: m.key,
          rank: getDescendingRank(yearData.byMetric[m.key], yearData.byKommune[selectedKommune][m.key]),
          rankFylke: getDescendingRank(getFylkeDistribution(selectedKommune, { type: "metric", key: m.key }, selectedYear)!, yearData.byKommune[selectedKommune][m.key])
        })),
      }))
    };
    return tmp
  }, [yearData, yearCache, dataModel, selectedKommune, getFylkeDistribution, selectedYear]);

  const { l } = useLanguageStore();
  

  if (!yearData || !yearCache || !dataModel) {
    return (
      <div>{l(t.common.loading)}</div>
    )
  }

  return (
    <div className="detailsList">
      {!selectedKommune || !ranks ? (
        <div>
          {l(t.details.selectSomething)}
        </div>
      ) : (
        <DetailsRisk r={ranks} />
      )}
    </div>
  )
}

export default DetailedStats;