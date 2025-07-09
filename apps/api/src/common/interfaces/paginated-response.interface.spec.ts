import {
  PaginationHelper,
  PaginatedResponse,
  PaginationMeta,
} from "./paginated-response.interface";

describe("PaginationHelper", () => {
  describe("createMeta", () => {
    it("should create pagination meta for first page", () => {
      const meta = PaginationHelper.createMeta(1, 10, 25);

      expect(meta).toEqual({
        page: 1,
        limit: 10,
        total: 25,
        totalPages: 3,
        hasNext: true,
        hasPrev: false,
      });
    });

    it("should create pagination meta for middle page", () => {
      const meta = PaginationHelper.createMeta(2, 10, 25);

      expect(meta).toEqual({
        page: 2,
        limit: 10,
        total: 25,
        totalPages: 3,
        hasNext: true,
        hasPrev: true,
      });
    });

    it("should create pagination meta for last page", () => {
      const meta = PaginationHelper.createMeta(3, 10, 25);

      expect(meta).toEqual({
        page: 3,
        limit: 10,
        total: 25,
        totalPages: 3,
        hasNext: false,
        hasPrev: true,
      });
    });

    it("should handle exact page division", () => {
      const meta = PaginationHelper.createMeta(2, 10, 20);

      expect(meta).toEqual({
        page: 2,
        limit: 10,
        total: 20,
        totalPages: 2,
        hasNext: false,
        hasPrev: true,
      });
    });

    it("should handle empty results", () => {
      const meta = PaginationHelper.createMeta(1, 10, 0);

      expect(meta).toEqual({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      });
    });

    it("should handle single page with fewer items than limit", () => {
      const meta = PaginationHelper.createMeta(1, 10, 5);

      expect(meta).toEqual({
        page: 1,
        limit: 10,
        total: 5,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      });
    });

    it("should handle large page numbers correctly", () => {
      const meta = PaginationHelper.createMeta(10, 5, 50);

      expect(meta).toEqual({
        page: 10,
        limit: 5,
        total: 50,
        totalPages: 10,
        hasNext: false,
        hasPrev: true,
      });
    });

    it("should handle edge case with 1 total item", () => {
      const meta = PaginationHelper.createMeta(1, 10, 1);

      expect(meta).toEqual({
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      });
    });
  });

  describe("createResponse", () => {
    it("should create paginated response with data and meta", () => {
      const data = [
        { id: 1, title: "Movie 1" },
        { id: 2, title: "Movie 2" },
      ];
      const meta: PaginationMeta = {
        page: 1,
        limit: 10,
        total: 2,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      };

      const response = PaginationHelper.createResponse(data, meta);

      expect(response).toEqual({
        data,
        meta,
      });
    });

    it("should create response with empty data array", () => {
      const data: any[] = [];
      const meta: PaginationMeta = {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      };

      const response = PaginationHelper.createResponse(data, meta);

      expect(response).toEqual({
        data: [],
        meta,
      });
    });

    it("should preserve data structure", () => {
      const data = [
        {
          id: 1,
          title: "Complex Movie",
          actors: [{ id: 1, name: "Actor 1" }],
          ratings: [{ id: 1, rating: 8.5 }],
        },
      ];
      const meta: PaginationMeta = {
        page: 1,
        limit: 1,
        total: 1,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      };

      const response = PaginationHelper.createResponse(data, meta);

      expect(response.data).toEqual(data);
      expect(response.data[0].actors).toBeDefined();
      expect(response.data[0].ratings).toBeDefined();
    });
  });

  describe("Combined usage", () => {
    it("should work together to create complete pagination", () => {
      const mockData = [
        { id: 1, name: "Item 1" },
        { id: 2, name: "Item 2" },
        { id: 3, name: "Item 3" },
      ];
      const page = 2;
      const limit = 5;
      const total = 13;

      const meta = PaginationHelper.createMeta(page, limit, total);
      const response = PaginationHelper.createResponse(mockData, meta);

      expect(response).toEqual({
        data: mockData,
        meta: {
          page: 2,
          limit: 5,
          total: 13,
          totalPages: 3,
          hasNext: true,
          hasPrev: true,
        },
      });
    });

    it("should handle real-world scenario with movies", () => {
      const movies = [
        { id: 1, title: "Movie 1", genre: "Action" },
        { id: 2, title: "Movie 2", genre: "Drama" },
      ];
      const page = 1;
      const limit = 2;
      const total = 2;

      const meta = PaginationHelper.createMeta(page, limit, total);
      const response = PaginationHelper.createResponse(movies, meta);

      expect(response.data).toHaveLength(2);
      expect(response.meta.totalPages).toBe(1);
      expect(response.meta.hasNext).toBe(false);
    });
  });

  describe("Edge cases and validation", () => {
    it("should handle zero limit gracefully", () => {
      // This would be prevented by validation, but testing the math
      expect(() => PaginationHelper.createMeta(1, 0, 10)).not.toThrow();
      const meta = PaginationHelper.createMeta(1, 0, 10);
      expect(meta.totalPages).toBe(Infinity);
    });

    it("should handle negative total", () => {
      const meta = PaginationHelper.createMeta(1, 10, -1);
      expect(meta.total).toBe(-1);
      expect(meta.totalPages).toBe(-0); // Math.ceil(-1 / 10) = -0 in JavaScript
    });

    it("should handle page beyond total pages", () => {
      const meta = PaginationHelper.createMeta(5, 10, 20); // Page 5 of 2 pages
      expect(meta.page).toBe(5);
      expect(meta.totalPages).toBe(2);
      expect(meta.hasNext).toBe(false);
      expect(meta.hasPrev).toBe(true);
    });

    it("should maintain consistency with different data types", () => {
      interface TestItem {
        id: number;
        value: string;
      }

      const typedData: TestItem[] = [
        { id: 1, value: "test1" },
        { id: 2, value: "test2" },
      ];

      const meta = PaginationHelper.createMeta(1, 10, 2);
      const response: PaginatedResponse<TestItem> =
        PaginationHelper.createResponse(typedData, meta);

      expect(response.data[0].id).toBe(1);
      expect(response.data[0].value).toBe("test1");
      expect(response.meta.total).toBe(2);
    });
  });
});
