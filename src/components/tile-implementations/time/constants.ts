export const BusinessStatus = {
  OPEN: 'open',
  CLOSED: 'closed',
  UNKNOWN: 'unknown',
} as const;

export type BusinessStatusType = (typeof BusinessStatus)[keyof typeof BusinessStatus];
