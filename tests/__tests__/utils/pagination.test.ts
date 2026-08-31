import { createVisiblePages } from '@/utils/pagination';

describe('createVisiblePages', () => {
  it.each([
    { currentPage: 1, totalPages: 1, expected: [1] },
    { currentPage: 1, totalPages: 15, expected: [1, 2, 15] },
    { currentPage: 5, totalPages: 15, expected: [1, 4, 5, 6, 15] },
    { currentPage: 15, totalPages: 15, expected: [1, 14, 15] },
  ])(
    'returns $expected for page $currentPage of $totalPages',
    ({ currentPage, totalPages, expected }) => {
      expect(createVisiblePages(currentPage, totalPages)).toEqual(expected);
    },
  );
});
