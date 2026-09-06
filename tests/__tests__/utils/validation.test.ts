import {
  codePointLength,
  isEmpty,
  isValidDate,
  toTimestamp,
  isValidEmail,
  isPositiveNumber,
  KATAKANA_HALF_WIDTH_REGEX,
  LOGIN_ID_REGEX,
} from '@/utils/validation';

describe('Validation Helpers (utils/validation)', () => {
  describe('codePointLength', () => {
    it('accurately counts surrogate pairs and emoji', () => {
      expect(codePointLength('abc')).toBe(3);
      expect(codePointLength('😀')).toBe(1);
      expect(codePointLength('a😀b')).toBe(3);
    });
  });

  describe('isEmpty', () => {
    it('returns true for undefined, null, empty or whitespace strings', () => {
      expect(isEmpty(undefined)).toBe(true);
      expect(isEmpty(null)).toBe(true);
      expect(isEmpty('')).toBe(true);
      expect(isEmpty('   ')).toBe(true);
    });

    it('returns false for non-empty strings', () => {
      expect(isEmpty('a')).toBe(false);
      expect(isEmpty('  hello  ')).toBe(false);
    });
  });

  describe('isValidDate', () => {
    it('validates YYYY/MM/DD calendar dates correctly', () => {
      expect(isValidDate('2024/02/29')).toBe(true); // Leap year
      expect(isValidDate('2023/02/29')).toBe(false); // Non leap year
      expect(isValidDate('2024/02/30')).toBe(false);
      expect(isValidDate('2024/13/01')).toBe(false);
      expect(isValidDate('invalid-date')).toBe(false);
      expect(isValidDate('2024-01-01')).toBe(false);
    });
  });

  describe('toTimestamp', () => {
    it('converts YYYY/MM/DD to correct epoch timestamp', () => {
      const ts1 = toTimestamp('2025/01/01');
      const ts2 = toTimestamp('2025/01/02');
      expect(ts2).toBeGreaterThan(ts1);
    });
  });

  describe('isValidEmail', () => {
    it('validates basic email format requirements', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('test @example.com')).toBe(false);
      expect(isValidEmail('test@.com')).toBe(false);
    });
  });

  describe('isPositiveNumber', () => {
    it('returns true only for integer numbers greater than 0', () => {
      expect(isPositiveNumber('1')).toBe(true);
      expect(isPositiveNumber('990')).toBe(true);
      expect(isPositiveNumber('0')).toBe(false);
      expect(isPositiveNumber('-5')).toBe(false);
      expect(isPositiveNumber('abc')).toBe(false);
      expect(isPositiveNumber('1.5')).toBe(false);
    });
  });

  describe('Regex patterns', () => {
    it('KATAKANA_HALF_WIDTH_REGEX matches half-width katakana', () => {
      expect(KATAKANA_HALF_WIDTH_REGEX.test('ｱｲｳｴｵ')).toBe(true);
      expect(KATAKANA_HALF_WIDTH_REGEX.test('あいうえお')).toBe(false);
    });

    it('LOGIN_ID_REGEX starts with letter or underscore and contains alphanumeric/underscore', () => {
      expect(LOGIN_ID_REGEX.test('user_123')).toBe(true);
      expect(LOGIN_ID_REGEX.test('_admin')).toBe(true);
      expect(LOGIN_ID_REGEX.test('123user')).toBe(false);
      expect(LOGIN_ID_REGEX.test('user-name')).toBe(false);
    });
  });
});
