import { describe, it, expect, mock, beforeEach } from "bun:test";

// Mock the prisma client module
const findManyMock = mock(() => Promise.resolve([]));
const countMock = mock(() => Promise.resolve(0));

mock.module("@repo/db", () => {
  return {
    prisma: {
      location: {
        findMany: findManyMock,
        count: countMock,
      },
    },
    default: {
      location: {
        findMany: findManyMock,
        count: countMock,
      },
    }
  };
});

// Mock other dependencies
mock.module("../../utils/location-helpers", () => ({
  fetchStates: mock(() => Promise.resolve([])),
  fetchDistricts: mock(() => Promise.resolve([])),
  fetchTalukas: mock(() => Promise.resolve([])),
  fetchVillages: mock(() => Promise.resolve([])),
}));

mock.module("../../utils/location-helpers-2", () => ({
  fetchLocationByPincode: mock(() => Promise.resolve(null)),
}));

describe("LocationController", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let LocationController: any;

  beforeEach(async () => {
    findManyMock.mockClear();
    countMock.mockClear();
    // Re-import to ensure mocks are applied
    const module = await import("./location.controller");
    LocationController = module.default;
  });

  it("GET /all should fetch locations with default pagination (limit 1000)", async () => {
    // We invoke the controller using .request() which simulates an HTTP request
    const res = await LocationController.request("/all", {
      method: "GET",
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    // Check backward compatibility
    expect(data.count).toBeDefined();
    // Check pagination
    expect(data.pagination).toBeDefined();
    expect(data.pagination.page).toBe(1);
    expect(data.pagination.limit).toBe(1000);

    // Verify findMany was called
    expect(findManyMock).toHaveBeenCalled();
    const args = findManyMock.mock.calls[0][0];

    // In optimized implementation, skip and take should be set
    expect(args.skip).toBe(0);
    expect(args.take).toBe(1000);
  });

  it("GET /all?page=2&limit=50 should fetch locations with custom pagination", async () => {
    const res = await LocationController.request("/all?page=2&limit=50", {
      method: "GET",
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.pagination.page).toBe(2);
    expect(data.pagination.limit).toBe(50);

    // Verify findMany was called
    expect(findManyMock).toHaveBeenCalled();
    const args = findManyMock.mock.calls[0][0];

    expect(args.skip).toBe(50); // (2-1) * 50
    expect(args.take).toBe(50);
  });
});
