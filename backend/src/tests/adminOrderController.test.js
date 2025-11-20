const { createAdminOrder } = require("../controllers/adminOrderController");
const { AdminOrder } = require("../models");

// Mock the model so no DB calls happen
jest.mock("../models", () => ({
  AdminOrder: {
    create: jest.fn()
  }
}));

describe("createAdminOrder controller", () => {
  it("should create an admin order and return status 201", async () => {
    // Mock request body
    const req = {
      body: {
        paidForById: 1,
        shipToState: "UT",
        shippingAmount: 10.5,
        taxAmount: 1.25
      }
    };

    // Mock response object
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    // Mock what AdminOrder.create returns
    const fakeOrder = { id: 1, ...req.body };
    AdminOrder.create.mockResolvedValue(fakeOrder);

    // Call controller
    await createAdminOrder(req, res);

    // Assertions
    expect(AdminOrder.create).toHaveBeenCalledWith({
      paidForById: 1,
      shipToState: "UT",
      shippingAmount: 10.5,
      taxAmount: 1.25
    });

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: "Admin Order Created",
      adminOrder: fakeOrder
    });
  });
});
