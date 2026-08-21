import {
  formatEmployeeDate,
  truncateEmployeeName,
} from '@/utils/employee';

describe('employee utilities', () => {
  describe('truncateEmployeeName', () => {
    it('keeps a name shorter than 22 characters', () => {
      const employeeName = 'a'.repeat(21);

      expect(truncateEmployeeName(employeeName)).toBe(employeeName);
    });

    it('adds an ellipsis when a name has exactly 22 characters', () => {
      const employeeName = 'a'.repeat(22);

      expect(truncateEmployeeName(employeeName)).toBe(`${employeeName}...`);
    });

    it('keeps only the first 22 characters before the ellipsis', () => {
      const employeeName = 'a'.repeat(23);

      expect(truncateEmployeeName(employeeName)).toBe(`${'a'.repeat(22)}...`);
    });

    it('counts a surrogate-pair Unicode character as one character', () => {
      const employeeName = `${'名'.repeat(21)}𠮷`;

      expect(truncateEmployeeName(employeeName)).toBe(`${employeeName}...`);
    });
  });

  describe('formatEmployeeDate', () => {
    it('changes a hyphen-separated date to slash-separated format', () => {
      expect(formatEmployeeDate('2026-08-22')).toBe('2026/08/22');
    });

    it('returns an empty string when a date is not available', () => {
      expect(formatEmployeeDate()).toBe('');
    });
  });
});
