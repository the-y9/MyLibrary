import { useMemo } from "react";

import {
  buildBookMap,
  buildBookSummary,
  computeTotals,
} from "../utils/selectors/bookSelectors";

export const useBookSummary = (sessions, books) => {
  return useMemo(() => {
    if (!sessions || !books) {
      return { summary: [], totals: null };
    }

    const map = buildBookMap(sessions);
    const summary = buildBookSummary(map, books);
    const totals = computeTotals(summary);

    return { summary, totals };
  }, [sessions, books]);
};
