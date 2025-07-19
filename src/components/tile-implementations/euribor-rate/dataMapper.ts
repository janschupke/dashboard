import type { EuriborRateApiResponse, EuriborRateTileData, EuriborRateHistoryEntry } from './types';
import type { DataMapper } from '../../../services/dataMapper';

/**
 * Maps ECB API response to EuriborRateTileData for the tile.
 * Expects ECB JSON format (dataSets/structure).
 */
export const ecbEuriborDataMapper: DataMapper<EuriborRateApiResponse, EuriborRateTileData> = {
  map: (apiResponse: EuriborRateApiResponse): EuriborRateTileData => {
    // ECB JSON: dataSets[0].series, structure.dimensions.observation[0] is time
    const series =
      (apiResponse.dataSets?.[0] as { series?: Record<string, unknown> })?.series || {};
    const timeDim =
      (apiResponse.structure as { dimensions?: { observation?: { values?: { id: string }[] }[] } })
        ?.dimensions?.observation?.[0]?.values || [];
    const historicalData = Object.entries(series).flatMap(([, seriesObj]) => {
      const observations =
        (seriesObj as { observations?: Record<string, unknown[]> })?.observations || {};
      return Object.entries(observations)
        .map(([obsIdx, obsArr]) => {
          const date = timeDim[parseInt(obsIdx, 10)]?.id;
          const rate = parseFloat((obsArr as unknown[])[0] as string);
          return date && !isNaN(rate) ? { date: new Date(date), rate } : null;
        })
        .filter(Boolean);
    });
    const sorted = (historicalData as EuriborRateHistoryEntry[]).sort(
      (a, b) => a.date.getTime() - b.date.getTime(),
    );
    const latest = sorted[sorted.length - 1];
    return {
      currentRate: latest?.rate ?? 0,
      lastUpdate: latest?.date ?? new Date(0),
      historicalData: sorted,
    };
  },
  safeMap: function (apiResponse: EuriborRateApiResponse): EuriborRateTileData {
    try {
      return this.map(apiResponse);
    } catch {
      throw new Error('Failed to map Euribor rate data - no valid data available');
    }
  },
  validate: (data: unknown): data is EuriborRateApiResponse => {
    return typeof data === 'object' && data !== null && 'dataSets' in data && 'structure' in data;
  },
};
