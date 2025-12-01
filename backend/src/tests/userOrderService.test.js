// src/tests/userOrderService.test.js

jest.mock("../models", () => ({
  UserOrder: {
    bulkCreate: jest.fn()
  },
  UserLineItem: {},
  User: {}
}));

const { UserOrder } = require("../models");
const { createBulkUserOrders } = require("../services/userOrderService");

describe("createBulkUserOrders", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should create bulk user orders when totals match", async () => {
    const adminOrderId = 99;
    const adminShippingAmount = 9;
    const adminTaxAmount = 3;
    const shipToState = "UT";
    const userAmounts = [
      { userId: "user1", shippingAmount: 5, taxAmount: 1 },
      { userId: "user2", shippingAmount: 4, taxAmount: 2 }
    ];

    // Mock bulkCreate to return the same array
    UserOrder.bulkCreate.mockResolvedValue(userAmounts);

    const result = await createBulkUserOrders(
      adminOrderId,
      userAmounts,
      adminShippingAmount,
      adminTaxAmount,
      shipToState
    );

    // Check that bulkCreate was called with correct data
    expect(UserOrder.bulkCreate).toHaveBeenCalledTimes(1);
    expect(UserOrder.bulkCreate).toHaveBeenCalledWith(
      [
        {
          userId: "user1",
          adminOrderId,
          shippingAmount: 5,
          taxAmount: 1,
          shipToState
        },
        {
          userId: "user2",
          adminOrderId,
          shippingAmount: 4,
          taxAmount: 2,
          shipToState
        }
      ],
      { transaction: undefined }
    );

    expect(result).toEqual(userAmounts);
  });

  it("should throw error if shipping totals do not match", async () => {
    const adminOrderId = 99;
    const adminShippingAmount = 10; // intentionally wrong
    const adminTaxAmount = 3;
    const shipToState = "UT";
    const userAmounts = [
      { userId: "user1", shippingAmount: 5, taxAmount: 1 },
      { userId: "user2", shippingAmount: 4, taxAmount: 2 }
    ];

    await expect(
      createBulkUserOrders(
        adminOrderId,
        userAmounts,
        adminShippingAmount,
        adminTaxAmount,
        shipToState
      )
    ).rejects.toThrow(
      "User shipping amounts do not match admin shipping amount"
    );

    expect(UserOrder.bulkCreate).not.toHaveBeenCalled();
  });

  it("should throw error if tax totals do not match", async () => {
    const adminOrderId = 99;
    const adminShippingAmount = 9;
    const adminTaxAmount = 4; // intentionally wrong
    const shipToState = "UT";
    const userAmounts = [
      { userId: "user1", shippingAmount: 5, taxAmount: 1 },
      { userId: "user2", shippingAmount: 4, taxAmount: 2 }
    ];

    await expect(
      createBulkUserOrders(
        adminOrderId,
        userAmounts,
        adminShippingAmount,
        adminTaxAmount,
        shipToState
      )
    ).rejects.toThrow("User tax amounts do not match admin tax amount");

    expect(UserOrder.bulkCreate).not.toHaveBeenCalled();
  });

  it("should allow passing a transaction", async () => {
    const adminOrderId = 99;
    const adminShippingAmount = 9;
    const adminTaxAmount = 3;
    const shipToState = "UT";
    const transaction = {}; // mock transaction
    const userAmounts = [
      { userId: "user1", shippingAmount: 5, taxAmount: 1 },
      { userId: "user2", shippingAmount: 4, taxAmount: 2 }
    ];

    UserOrder.bulkCreate.mockResolvedValue(userAmounts);

    await createBulkUserOrders(
      adminOrderId,
      userAmounts,
      adminShippingAmount,
      adminTaxAmount,
      shipToState,
      transaction
    );

    expect(UserOrder.bulkCreate).toHaveBeenCalledWith(
      [
        {
          userId: "user1",
          adminOrderId,
          shippingAmount: 5,
          taxAmount: 1,
          shipToState
        },
        {
          userId: "user2",
          adminOrderId,
          shippingAmount: 4,
          taxAmount: 2,
          shipToState
        }
      ],
      { transaction }
    );
  });
});
