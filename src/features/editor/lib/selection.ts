export interface SelectionRange {
  start: number;
  end: number;
}

export const normalizeRange = (range: SelectionRange): SelectionRange => {
  if (range.start <= range.end) {
    return range;
  }

  return { start: range.end, end: range.start };
};
