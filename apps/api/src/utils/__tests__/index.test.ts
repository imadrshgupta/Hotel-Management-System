import {
  generateId,
  generateInvoiceNumber,
  generateKotNumber,
  generateOrderNumber,
  capitalize,
  slugify,
  omit,
  pick,
  formatDate,
  addDays,
  getNights,
  toBoolean,
  parseDecimal,
  deepClone,
} from '../index';

describe('Utility Functions', () => {
  describe('generateId', () => {
    it('should generate a UUID', () => {
      const id = generateId();
      expect(id).toBeDefined();
      expect(typeof id).toBe('string');
      expect(id.length).toBe(36);
    });

    it('should generate unique IDs', () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id1).not.toBe(id2);
    });
  });

  describe('generateInvoiceNumber', () => {
    it('should generate invoice number with default prefix', () => {
      const num = generateInvoiceNumber();
      expect(num).toMatch(/^INV\d{2}\d{2}[A-Z0-9]{6}$/);
    });

    it('should generate invoice number with custom prefix', () => {
      const num = generateInvoiceNumber('BILL');
      expect(num).toMatch(/^BILL\d{2}\d{2}[A-Z0-9]{6}$/);
    });
  });

  describe('generateKotNumber', () => {
    it('should generate KOT number', () => {
      const num = generateKotNumber();
      expect(num).toMatch(/^KOT\d{6}$/);
    });
  });

  describe('generateOrderNumber', () => {
    it('should generate order number', () => {
      const num = generateOrderNumber();
      expect(num).toMatch(/^ORD\d{2}\d{2}[A-Z0-9]{6}$/);
    });
  });

  describe('capitalize', () => {
    it('should capitalize first letter and lowercase rest', () => {
      expect(capitalize('hello')).toBe('Hello');
      expect(capitalize('HELLO')).toBe('Hello');
      expect(capitalize('hELLO')).toBe('Hello');
      expect(capitalize('a')).toBe('A');
    });
  });

  describe('slugify', () => {
    it('should convert string to slug', () => {
      expect(slugify('Hello World')).toBe('hello-world');
      expect(slugify('  spaces  everywhere  ')).toBe('spaces-everywhere');
      expect(slugify('Special!@#Chars')).toBe('special-chars');
      expect(slugify('already-slug')).toBe('already-slug');
    });
  });

  describe('omit', () => {
    it('should omit specified keys', () => {
      const obj = { a: 1, b: 2, c: 3 };
      expect(omit(obj, ['a', 'c'])).toEqual({ b: 2 });
    });

    it('should return same object if no keys to omit', () => {
      const obj = { a: 1, b: 2 };
      expect(omit(obj, [])).toEqual({ a: 1, b: 2 });
    });
  });

  describe('pick', () => {
    it('should pick specified keys', () => {
      const obj = { a: 1, b: 2, c: 3 };
      expect(pick(obj, ['a', 'c'])).toEqual({ a: 1, c: 3 });
    });

    it('should skip non-existent keys', () => {
      const obj = { a: 1, b: 2 };
      expect(pick(obj, ['a' as any, 'x' as any])).toEqual({ a: 1 });
    });
  });

  describe('formatDate', () => {
    it('should format date to YYYY-MM-DD', () => {
      const date = new Date('2024-03-15T10:30:00');
      expect(formatDate(date)).toBe('2024-03-15');
    });
  });

  describe('addDays', () => {
    it('should add days to date', () => {
      const date = new Date('2024-01-01');
      const result = addDays(date, 5);
      expect(result.getDate()).toBe(6);
    });

    it('should not mutate original date', () => {
      const date = new Date('2024-01-01');
      addDays(date, 5);
      expect(date.getDate()).toBe(1);
    });
  });

  describe('getNights', () => {
    it('should calculate nights between two dates', () => {
      const checkIn = new Date('2024-01-01');
      const checkOut = new Date('2024-01-05');
      expect(getNights(checkIn, checkOut)).toBe(4);
    });

    it('should return 0 for same day', () => {
      const date = new Date('2024-01-01');
      expect(getNights(date, date)).toBe(0);
    });
  });

  describe('toBoolean', () => {
    it('should convert truthy values', () => {
      expect(toBoolean(true)).toBe(true);
      expect(toBoolean('true')).toBe(true);
      expect(toBoolean('1')).toBe(true);
      expect(toBoolean(1)).toBe(true);
    });

    it('should convert falsy values', () => {
      expect(toBoolean(false)).toBe(false);
      expect(toBoolean('false')).toBe(false);
      expect(toBoolean('0')).toBe(false);
      expect(toBoolean(0)).toBe(false);
      expect(toBoolean('')).toBe(false);
    });
  });

  describe('parseDecimal', () => {
    it('should parse valid numbers', () => {
      expect(parseDecimal('123.45')).toBe(123.45);
      expect(parseDecimal('0')).toBe(0);
      expect(parseDecimal(100)).toBe(100);
    });

    it('should round to 2 decimal places', () => {
      expect(parseDecimal('123.456')).toBe(123.46);
      expect(parseDecimal('123.454')).toBe(123.45);
    });

    it('should return 0 for invalid values', () => {
      expect(parseDecimal('abc')).toBe(0);
      expect(parseDecimal(undefined)).toBe(0);
      expect(parseDecimal(null)).toBe(0);
    });
  });

  describe('deepClone', () => {
    it('should deep clone objects', () => {
      const original = { a: 1, b: { c: 2 } };
      const cloned = deepClone(original);
      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
      expect(cloned.b).not.toBe(original.b);
    });
  });
});
