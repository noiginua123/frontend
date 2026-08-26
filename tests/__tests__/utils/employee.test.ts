import {
  formatEmployeeDate,
  truncateEmployeeName,
} from '@/utils/employee';

describe('employee utilities', () => {
  describe('truncateEmployeeName', () => {
    it('keeps a name with 20 characters or fewer unchanged', () => {
      const employeeName = 'a'.repeat(20);

      expect(truncateEmployeeName(employeeName)).toBe(employeeName);
    });

    it('adds an ellipsis when a name exceeds 20 characters', () => {
      const employeeName = 'a'.repeat(21);

      expect(truncateEmployeeName(employeeName)).toBe(`${'a'.repeat(20)}...`);
    });

    it('keeps only the first 20 characters before the ellipsis', () => {
      const employeeName = 'a'.repeat(25);

      expect(truncateEmployeeName(employeeName)).toBe(`${'a'.repeat(20)}...`);
    });

    it('counts a surrogate-pair Unicode character as one character', () => {
      const employeeName = `${'名'.repeat(19)}𠮷`;

      expect(truncateEmployeeName(employeeName)).toBe(employeeName);

      const longerName = `${'名'.repeat(20)}𠮷`;
      expect(truncateEmployeeName(longerName)).toBe(`${'名'.repeat(20)}...`);
    });

    it('returns empty string when text is null or undefined', () => {
      expect(truncateEmployeeName(undefined)).toBe('');
      expect(truncateEmployeeName(null)).toBe('');
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
