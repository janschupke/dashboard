import type { TileCategory } from '../../../types/tileCategories';
import type { TileMeta } from '../../tile/GenericTile';
export const timeTileMeta = (city?: string): TileMeta => {
  let title = 'Time';
  const cityLower = city?.toLowerCase();
  switch (cityLower) {
    case 'helsinki':
      title = 'Helsinki Time';
      break;
    case 'prague':
      title = 'Prague Time';
      break;
    case 'taipei':
      title = 'Taipei Time';
      break;
    case undefined:
    default:
      title = 'Time';
      break;
  }
  return { title, icon: 'clock', category: 'Time' as TileCategory };
};
