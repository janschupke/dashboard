import type { TileCategory } from '../../../types/tileCategories';
import type { TileMeta } from '../../tile/GenericTile';
export const timeTileMeta = (city?: string): TileMeta => {
  let title = 'Time';
  switch (city?.toLowerCase()) {
    case 'helsinki':
      title = 'Helsinki Time';
      break;
    case 'prague':
      title = 'Prague Time';
      break;
    case 'taipei':
      title = 'Taipei Time';
      break;
    default:
      title = 'Time';
  }
  return { title, icon: 'clock', category: 'Time' as TileCategory };
};
export const meta: TileMeta = timeTileMeta();
