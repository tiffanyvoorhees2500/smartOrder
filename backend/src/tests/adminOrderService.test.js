// tests/adminOrderService.test.js
const { createAdminOrderService } = require("../services/adminOrderService");
const { AdminOrder } = require("../models");

// Mock AdminOrder.create
jest.mock("../models", () => ({
  AdminOrder: {
    create: jest.fn()
  }
}));

describe("createAdminOrderService", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("calls AdminOrder.create with the correct data and returns the result", async () => {
    const mockAdminOrder = { id: 1, paidForById: 2, shipToState: "UT", shippingAmount: 10, taxAmount: 1 };
    
    // Mock the create method to resolve to mockAdminOrder
    AdminOrder.create.mockResolvedValue(mockAdminOrder);

    const orderData = { paidForById: 2, shipToState: "UT", shippingAmount: 10, taxAmount: 1 };

    const result = await createAdminOrderService(orderData);

    // Check that AdminOrder.create was called with the correct data
    expect(AdminOrder.create).toHaveBeenCalledWith(orderData, { transaction: undefined });

    // Check that the returned value is the mocked admin order
    expect(result).toBe(mockAdminOrder);
  });

  it("passes a transaction if provided", async () => {
    const mockTransaction = {};
    const mockAdminOrder = { id: 2 };
    AdminOrder.create.mockResolvedValue(mockAdminOrder);

    const orderData = { paidForById: 3, shipToState: "CA", shippingAmount: 20, taxAmount: 2 };

    const result = await createAdminOrderService(orderData, mockTransaction);

    expect(AdminOrder.create).toHaveBeenCalledWith(orderData, { transaction: mockTransaction });
    expect(result).toBe(mockAdminOrder);
  });
});
