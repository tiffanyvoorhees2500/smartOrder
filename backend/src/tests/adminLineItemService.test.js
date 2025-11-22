const {
  createSingleAdminLineItem,
  createBulkAdminLineItems
} = require("../services/adminLineItemsService");

const {
  AdminOrderLineItem,
  Product,
  UserLineItem,
  User
} = require("../models");

jest.mock("../models", () => ({
  AdminOrderLineItem: { create: jest.fn(), bulkCreate: jest.fn() },
  Product: { findByPk: jest.fn() },
  UserLineItem: { findAll: jest.fn() },
  User: {}
}));

describe("adminLineItemsService", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createSingleAdminLineItem", () => {
    it("creates a single admin line item with correct prices", async () => {
      const mockProduct = { id: 1, wholesale: 10 };
      Product.findByPk.mockResolvedValue(mockProduct);
      const mockCreatedItem = { id: 123 };
      AdminOrderLineItem.create.mockResolvedValue(mockCreatedItem);

      const data = {
        adminOrderId: 1,
        productId: 1,
        quantity: 3,
        percentOff: 0.1
      };
      const result = await createSingleAdminLineItem(data);

      expect(Product.findByPk).toHaveBeenCalledWith(1, {
        transaction: undefined
      });
      expect(AdminOrderLineItem.create).toHaveBeenCalledWith(
        {
          adminOrderId: 1,
          productId: 1,
          quantity: 3,
          basePrice: 10,
          percentOff: 0.1,
          finalPrice: 9
        },
        { transaction: undefined }
      );
      expect(result).toBe(mockCreatedItem);
    });

    it("throws an error if product is not found", async () => {
      Product.findByPk.mockResolvedValue(null);
      const data = {
        adminOrderId: 1,
        productId: 99,
        quantity: 3,
        percentOff: 0.1
      };

      await expect(createSingleAdminLineItem(data)).rejects.toThrow(
        "Product not found"
      );
    });
  });

  describe("createBulkAdminLineItems", () => {
    it("creates bulk admin line items grouped by product", async () => {
      const mockUserLineItems = [
        {
          productId: 1,
          quantity: 2,
          user: { defaultShipToState: "UT" },
          saveForLater: false
        },
        {
          productId: 1,
          quantity: 3,
          user: { defaultShipToState: "UT" },
          saveForLater: false
        },
        {
          productId: 2,
          quantity: 4,
          user: { defaultShipToState: "UT" },
          saveForLater: false
        }
      ];
      UserLineItem.findAll.mockResolvedValue(mockUserLineItems);
      Product.findByPk.mockImplementation((id) => {
        return Promise.resolve({ id, wholesale: id * 10 });
      });
      AdminOrderLineItem.bulkCreate.mockResolvedValue(true);

      const result = await createBulkAdminLineItems(99, "UT", { 1: 0.1 });

      // Should call UserLineItem.findAll
      expect(UserLineItem.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { adminOrderId: null, saveForLater: false },
          include: {
            model: User,
            as: "user",
            where: { defaultShipToState: "UT" }
          },
          transaction: undefined
        })
      );

      // Check that Product.findByPk was called twice
      expect(Product.findByPk).toHaveBeenCalledTimes(2);

      // Check each call individually
      expect(Product.findByPk.mock.calls[0]).toEqual([
        1,
        { transaction: undefined }
      ]);
      expect(Product.findByPk.mock.calls[1]).toEqual([
        2,
        { transaction: undefined }
      ]);

      // Should call bulkCreate with correct data
      expect(AdminOrderLineItem.bulkCreate).toHaveBeenCalledWith(
        expect.arrayContaining([
          {
            adminOrderId: 99,
            productId: 1,
            quantity: 5, // 2 + 3
            basePrice: 10,
            percentOff: 0.1,
            finalPrice: 9
          },
          {
            adminOrderId: 99,
            productId: 2,
            quantity: 4,
            basePrice: 20,
            percentOff: 0, // no discount override
            finalPrice: 20
          }
        ]),
        { transaction: undefined }
      );

      expect(result).toBe(true);
    });
  });
});
