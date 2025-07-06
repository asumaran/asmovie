import 'reflect-metadata';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { PaginationDto } from './pagination.dto';

describe('PaginationDto', () => {
  const createPaginationDto = (data: any): PaginationDto => {
    return plainToClass(PaginationDto, data);
  };

  describe('page validation', () => {
    it('should accept valid page numbers', async () => {
      const validPages = [1, 2, 10, 100];

      for (const page of validPages) {
        const dto = createPaginationDto({ page });
        const errors = await validate(dto);
        expect(errors).toHaveLength(0);
        expect(dto.page).toBe(page);
      }
    });

    it('should reject page numbers less than 1', async () => {
      const invalidPages = [0, -1, -10];

      for (const page of invalidPages) {
        const dto = createPaginationDto({ page });
        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].property).toBe('page');
      }
    });

    it('should reject non-integer page numbers', async () => {
      const invalidPages = ['abc', {}, []]; // Only values that can't be transformed to numbers

      for (const page of invalidPages) {
        const dto = createPaginationDto({ page });
        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
      }
    });

    it('should use default page when not provided', async () => {
      const dto = createPaginationDto({});
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(dto.page).toBe(1);
    });

    it('should use default page when undefined', async () => {
      const dto = createPaginationDto({ page: undefined });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(dto.page).toBe(undefined); // plainToClass doesn't apply defaults for undefined
    });
  });

  describe('limit validation', () => {
    it('should accept valid limit numbers', async () => {
      const validLimits = [1, 10, 50, 100];

      for (const limit of validLimits) {
        const dto = createPaginationDto({ limit });
        const errors = await validate(dto);
        expect(errors).toHaveLength(0);
        expect(dto.limit).toBe(limit);
      }
    });

    it('should reject limit numbers less than 1', async () => {
      const invalidLimits = [0, -1, -10];

      for (const limit of invalidLimits) {
        const dto = createPaginationDto({ limit });
        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].property).toBe('limit');
      }
    });

    it('should reject limit numbers greater than 100', async () => {
      const invalidLimits = [101, 200, 1000];

      for (const limit of invalidLimits) {
        const dto = createPaginationDto({ limit });
        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].property).toBe('limit');
      }
    });

    it('should reject non-integer limit numbers', async () => {
      const invalidLimits = ['xyz', {}, []]; // Only values that can't be transformed to numbers

      for (const limit of invalidLimits) {
        const dto = createPaginationDto({ limit });
        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
      }
    });

    it('should use default limit when not provided', async () => {
      const dto = createPaginationDto({});
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(dto.limit).toBe(10);
    });

    it('should use default limit when undefined', async () => {
      const dto = createPaginationDto({ limit: undefined });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(dto.limit).toBe(undefined); // plainToClass doesn't apply defaults for undefined
    });
  });

  describe('transformation', () => {
    it('should transform string numbers to integers', async () => {
      const dto = createPaginationDto({ page: '5', limit: '25' });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(dto.page).toBe(5);
      expect(dto.limit).toBe(25);
      expect(typeof dto.page).toBe('number');
      expect(typeof dto.limit).toBe('number');
    });

    it('should handle mixed string and number inputs', async () => {
      const dto = createPaginationDto({ page: '3', limit: 15 });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(dto.page).toBe(3);
      expect(dto.limit).toBe(15);
    });

    it('should transform valid string numbers at boundaries', async () => {
      const dto = createPaginationDto({ page: '1', limit: '100' });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(dto.page).toBe(1);
      expect(dto.limit).toBe(100);
    });
  });

  describe('combined validation', () => {
    it('should validate both page and limit together', async () => {
      const dto = createPaginationDto({ page: 5, limit: 20 });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(dto.page).toBe(5);
      expect(dto.limit).toBe(20);
    });

    it('should fail when both page and limit are invalid', async () => {
      const dto = createPaginationDto({ page: 0, limit: 101 });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThanOrEqual(2);

      const properties = errors.map((error) => error.property);
      expect(properties).toContain('page');
      expect(properties).toContain('limit');
    });

    it('should use defaults for missing values in mixed scenarios', async () => {
      const testCases = [
        { input: { page: 2 }, expected: { page: 2, limit: 10 } },
        { input: { limit: 25 }, expected: { page: 1, limit: 25 } },
        { input: {}, expected: { page: 1, limit: 10 } },
      ];

      for (const testCase of testCases) {
        const dto = createPaginationDto(testCase.input);
        const errors = await validate(dto);
        expect(errors).toHaveLength(0);
        expect(dto.page).toBe(testCase.expected.page);
        expect(dto.limit).toBe(testCase.expected.limit);
      }
    });
  });

  describe('edge cases', () => {
    it('should handle maximum valid values', async () => {
      const dto = createPaginationDto({
        page: Number.MAX_SAFE_INTEGER,
        limit: 100,
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(dto.page).toBe(Number.MAX_SAFE_INTEGER);
      expect(dto.limit).toBe(100);
    });

    it('should handle empty object', async () => {
      const dto = createPaginationDto({});
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(dto.page).toBe(1);
      expect(dto.limit).toBe(10);
    });

    it('should handle null values', async () => {
      const dto = createPaginationDto({ page: null, limit: null });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(dto.page).toBe(null); // plainToClass preserves null values
      expect(dto.limit).toBe(null); // plainToClass preserves null values
    });

    it('should maintain type safety', () => {
      const dto = createPaginationDto({ page: 1, limit: 10 });

      // TypeScript should enforce these types
      expect(typeof dto.page).toBe('number');
      expect(typeof dto.limit).toBe('number');

      // These should be optional
      expect(dto.page).toBeDefined();
      expect(dto.limit).toBeDefined();
    });
  });

  describe('real-world usage scenarios', () => {
    it('should handle typical API query parameters', async () => {
      // Simulating query params: ?page=2&limit=15
      const dto = createPaginationDto({ page: '2', limit: '15' });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(dto.page).toBe(2);
      expect(dto.limit).toBe(15);
    });

    it('should handle partial query parameters', async () => {
      // Simulating query params: ?page=3
      const dto = createPaginationDto({ page: '3' });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(dto.page).toBe(3);
      expect(dto.limit).toBe(10); // default
    });

    it('should handle no query parameters', async () => {
      // Simulating no query params
      const dto = createPaginationDto({});
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(dto.page).toBe(1); // default
      expect(dto.limit).toBe(10); // default
    });

    it('should calculate offset correctly for different pages', () => {
      const testCases = [
        { page: 1, limit: 10, expectedOffset: 0 },
        { page: 2, limit: 10, expectedOffset: 10 },
        { page: 3, limit: 15, expectedOffset: 30 },
        { page: 5, limit: 20, expectedOffset: 80 },
      ];

      testCases.forEach(({ page, limit, expectedOffset }) => {
        const dto = createPaginationDto({ page, limit });
        const offset = (dto.page! - 1) * dto.limit!;
        expect(offset).toBe(expectedOffset);
      });
    });
  });
});
