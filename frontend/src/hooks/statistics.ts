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

/*
* Returns number of values higher than the given value, in a sorted ascending array.
*
* @param arr Sorted ascending numeric array
* @param value Value to find and rank
* @returns Number of stricktly worse items in arr
*/
export function getDescendingRank(arr: number[], value: number, invert?: boolean): number {

  let left = 0;
  let right = arr.length;

  if (invert) { // Lower value --> better rank

    while (left < right) {
      const mid = Math.floor((left + right) / 2);

      if (arr[mid] < value) {
        left = mid + 1;
      } else {
        right = mid;
      }
    }

    const stricklyWorse = left;
    return stricklyWorse + 1;
  }

  // find first value > target
  while (left < right) {
    const mid = Math.floor((left + right) / 2);

    if (arr[mid] <= value) {
      left = mid + 1;
    } else {
      right = mid;
    }
  }

  const strictlyWorse = arr.length - left;

  return strictlyWorse + 1;
}