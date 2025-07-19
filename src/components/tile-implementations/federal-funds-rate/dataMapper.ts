import { BaseDataMapper } from '../../../services/dataMapper';
import type { FederalFundsRateTileData, FederalFundsRateApiResponse } from './types';

export interface FederalFundsRateApiResponseWithIndex extends FederalFundsRateApiResponse {
  [key: string]: unknown;
}

export class FederalFundsRateDataMapper extends BaseDataMapper<
  FederalFundsRateApiResponseWithIndex,
  FederalFundsRateTileData
> {
  map(apiResponse: FederalFundsRateApiResponseWithIndex): FederalFundsRateTileData {
    const observations = apiResponse.observations;
    const latestObservation = observations[observations.length - 1];

    return {
      currentRate: parseFloat(latestObservation.value),
      lastUpdate: new Date(latestObservation.date),
      historicalData: observations.map((obs) => ({
        date: new Date(obs.date),
        rate: parseFloat(obs.value),
      })),
    };
  }

  validate(apiResponse: unknown): apiResponse is FederalFundsRateApiResponseWithIndex {
    if (!apiResponse || typeof apiResponse !== 'object') {
      return false;
    }

    const response = apiResponse as Record<string, unknown>;

    if (!response.observations || !Array.isArray(response.observations)) {
      return false;
    }

    const observations = response.observations as Array<Record<string, unknown>>;

    if (observations.length === 0) {
      return false;
    }

    const requiredFields = ['realtime_start', 'realtime_end', 'date', 'value'];

    for (const observation of observations) {
      for (const field of requiredFields) {
        if (!(field in observation)) {
          return false;
        }
      }
    }

    const firstObs = observations[0];
    return (
      typeof firstObs.realtime_start === 'string' &&
      typeof firstObs.realtime_end === 'string' &&
      typeof firstObs.date === 'string' &&
      typeof firstObs.value === 'string'
    );
  }
}
