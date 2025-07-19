import type { TyphoonApiResponse, TyphoonTileData } from './types';
import { BaseDataMapper } from '../../../services/dataMapper';

export class TyphoonDataMapper extends BaseDataMapper<TyphoonApiResponse, TyphoonTileData> {
  map(apiResponse: TyphoonApiResponse): TyphoonTileData {
    const locations = apiResponse.records?.location || [];
    const typhoons = locations.map((loc) => {
      const name = loc.locationName;
      let category = '';
      let lat = 0;
      let lon = 0;
      let forecast: TyphoonTileData['typhoons'][0]['forecast'] = [];
      loc.weatherElement.forEach((el) => {
        if (el.elementName === 'TyphoonCategory') {
          // Find the parameter with parameterName 'Category' and use its parameterValue
          const param = el.time[0]?.parameter.find((p) => p.parameterName === 'Category');
          category = param?.parameterValue || '';
        }
        if (el.elementName === 'TyphoonPosition') {
          lat = parseFloat(
            el.time[0]?.parameter.find((p) => p.parameterName === 'Latitude')?.parameterValue ||
              '0',
          );
          lon = parseFloat(
            el.time[0]?.parameter.find((p) => p.parameterName === 'Longitude')?.parameterValue ||
              '0',
          );
        }
        if (el.elementName === 'TyphoonForecast') {
          forecast = el.time.map((t) => ({
            time: t.startTime,
            lat: parseFloat(
              t.parameter.find((p) => p.parameterName === 'Latitude')?.parameterValue || '0',
            ),
            lon: parseFloat(
              t.parameter.find((p) => p.parameterName === 'Longitude')?.parameterValue || '0',
            ),
            windSpeed: parseFloat(
              t.parameter.find((p) => p.parameterName === 'WindSpeed')?.parameterValue || '0',
            ),
          }));
        }
      });
      return { name, category, position: { lat, lon }, forecast };
    });
    return {
      typhoons,
      lastUpdated: new Date().toISOString(),
    };
  }
  validate(apiResponse: unknown): apiResponse is TyphoonApiResponse {
    if (typeof apiResponse !== 'object' || apiResponse === null || !('records' in apiResponse)) {
      return false;
    }
    const records = (apiResponse as { records?: unknown }).records;
    return (
      typeof records === 'object' &&
      records !== null &&
      'location' in records &&
      Array.isArray((records as { location?: unknown }).location)
    );
  }
}
