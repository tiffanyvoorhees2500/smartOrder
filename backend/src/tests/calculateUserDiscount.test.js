// tests/calculateUserDiscount.test.js

jest.mock("../models", () => ({
  UserLineItem: {
    findAll: jest.fn()
  },
  User: {}
}));

const { calculateUserDiscount } = require("../services/pricingService");
const { UserLineItem } = require("../models");
const { getDiscountByBottleCount } = require("../utils/discounts");

describe("calculateUserDiscount", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("counts only current user items for Individual user, uses pendingQuantity if present", async () => {
    const user = {
      id: 1,
      discountType: "Individual",
      defaultShipToState: "UT"
    };

    UserLineItem.findAll.mockResolvedValue([
      { userId: 1, quantity: 3, pendingQuantity: 5, adminOrderId: null },
      { userId: 1, quantity: 2, adminOrderId: null }
    ]);

    const result = await calculateUserDiscount(user);

    expect(result.totalBottlesForCurrentQuantities).toBe(5); // 3 + 2
    expect(result.totalBottlesWithPendingQuantities).toBe(7); // 5 (pending) + 2
    expect(result.selectedDiscountForCurrent).toEqual(getDiscountByBottleCount(5).discount);
    expect(result.selectedDiscountForPending).toEqual(getDiscountByBottleCount(7).discount);
  });

  it("counts only items in same state for Group user, uses pendingQuantity for self", async () => {
    const user = { id: 1, discountType: "Group", defaultShipToState: "UT" };

    // Mock: only line items with matching state included
    UserLineItem.findAll.mockResolvedValue([
      {
        userId: 1,
        quantity: 2,
        pendingQuantity: 5,
        adminOrderId: null,
        User: { defaultShipToState: "UT" }
      },
      {
        userId: 2,
        quantity: 3,
        adminOrderId: null,
        User: { defaultShipToState: "UT" }
      }
    ]);

    const result = await calculateUserDiscount(user);

    expect(result.totalBottlesForCurrentQuantities).toBe(5); // 2 + 3
    expect(result.totalBottlesWithPendingQuantities).toBe(8); // 5 (pending for self) + 3
    expect(result.selectedDiscountForCurrent).toEqual(getDiscountByBottleCount(5).discount);
    expect(result.selectedDiscountForPending).toEqual(getDiscountByBottleCount(8).discount);
  });

  it("handles no matching items gracefully", async () => {
    const user = { id: 4, discountType: "Group", defaultShipToState: "NV" };

    UserLineItem.findAll.mockResolvedValue([]); // nothing matches

    const result = await calculateUserDiscount(user);

    expect(result.totalBottlesForCurrentQuantities).toBe(0);
    expect(result.totalBottlesWithPendingQuantities).toBe(0);
    expect(result.selectedDiscountForCurrent).toEqual(getDiscountByBottleCount(0).discount);
    expect(result.selectedDiscountForPending).toEqual(getDiscountByBottleCount(0).discount);
  });
});
