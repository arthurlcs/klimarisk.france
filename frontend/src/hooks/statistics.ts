export function percentile(sorted: number[], value: number): number {
  const n = sorted.length;
  if (n === 0) return 0;

  // lower bound: first index >= value
  let low = 0;
  let high = n;
  while (low < high) {
    const mid = (low + high) >> 1;
    if (sorted[mid] < value) low = mid + 1;
    else high = mid;
  }
  const lower = low;

  // upper bound: first index > value
  high = n;
  while (low < high) {
    const mid = (low + high) >> 1;
    if (sorted[mid] <= value) low = mid + 1;
    else high = mid;
  }
  const upper = low;

  const countLess = lower;
  const countEqual = upper - lower;

  return ((countLess + 0.5 * countEqual) / n) * 100;
}