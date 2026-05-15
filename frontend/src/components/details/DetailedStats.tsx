import useDataStore, { type ElementKey, type MetricKey } from "../../hooks/useDataStore";
import { getDescendingRank } from "../../hooks/statistics";
import { useMemo } from "react";
import "./DetailedStats.css";
import DetailsRisk from "./DetailsRisk";
import useLanguageStore, { t, type Language } from "../../hooks/useLanguageStore";

export type RankMetric = {
  name: Record<Language, string>;
  description?: Record<Language, string>;
  key: MetricKey;
  invert?: boolean;
  rank: number;
  rankFylke: number;
}
export type RankElement = {
  name: Record<Language, string>;
  description?: Record<Language, string>;
  key: ElementKey;
  invert?: boolean;
  rank: number;
  rankFylke: number;
  metrics: RankMetric[];
}
export type RankRisk = {
  name: Record<Language, string>;
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
  const { l } = useLanguageStore();

  const yearData = data && selectedYear ? data.years[selectedYear] : null
  const yearCache = cache && selectedYear ? cache.years[selectedYear] : null

  const ranks = useMemo(() => {
    if (!yearData || !yearCache || !dataModel || !selectedKommune || !selectedYear) return null;
    const tmp: RankRisk = {
      name: t.common.totalRisk,
      rank: getDescendingRank(yearCache.byTotalRisk, yearCache.byKommune[selectedKommune].totalRisk),
      rankFylke: getDescendingRank(getFylkeDistribution(selectedKommune, { type: "risk" }, selectedYear)!, yearCache.byKommune[selectedKommune].totalRisk),
      elements: dataModel.elements.filter(e => !e.disabled).map(e => ({
        name: e.name,
        description: e.description,
        key: e.key,
        ...(e.invert ? {invert: true} : {}),
        rank: getDescendingRank(yearCache.byElement[e.key], yearCache.byKommune[selectedKommune][e.key], e.invert),
        rankFylke: getDescendingRank(getFylkeDistribution(selectedKommune, { type: "element", key: e.key }, selectedYear)!, yearCache.byKommune[selectedKommune][e.key], e.invert),
        metrics: e.metrics.filter(m => !m.disabled).map(m => ({
          name: m.name,
          description: m.description,
          key: m.key,
          ...(!!m.invert !== !!e.invert ? {invert: true} : {}),
          rank: getDescendingRank(yearData.byMetric[m.key], yearData.byKommune[selectedKommune][m.key], !!m.invert !== !!e.invert),
          rankFylke: getDescendingRank(getFylkeDistribution(selectedKommune, { type: "metric", key: m.key }, selectedYear)!, yearData.byKommune[selectedKommune][m.key], !!m.invert !== !!e.invert)
        })),
      }))
    };
    return tmp
  }, [yearData, yearCache, dataModel, selectedKommune, getFylkeDistribution, selectedYear]);
  

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