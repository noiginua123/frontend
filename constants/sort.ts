/** Các chiều sắp xếp được API và giao diện hỗ trợ. */
export const SORT_ORDER = {
  ASC: 'ASC',
  DESC: 'DESC',
} as const;

/** Kiểu chiều sắp xếp hợp lệ. */
export type SortOrder = (typeof SORT_ORDER)[keyof typeof SORT_ORDER];
