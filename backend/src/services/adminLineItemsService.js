/**
 * NOTE on `transaction` parameter:
 *
 * A transaction is an object provided by Sequelize that allows multiple
 * database operations to be treated as a single atomic unit.
 *
 * - If all operations inside the transaction succeed, you call `transaction.commit()`
 *   and all changes are saved to the database.
 * - If any operation fails, you call `transaction.rollback()` and all changes
 *   made during the transaction are undone.
 *
 * This ensures data consistency, especially when creating multiple related rows,
 * such as AdminOrderLineItems for a bulk order.
 *
 * The `transaction` is optional; if passed, all Sequelize calls will run inside it.
 * This is important for workflows like `finalizeOrder` where we want all related
 * tables to be updated together.
 */

const {
  AdminOrderLineItem,
  Product,
  UserLineItem,
  User
} = require("../models");

/**
 * Create a single AdminOrderLineItem
 */
async function createSingleAdminLineItem(
  { adminOrderId, productId, quantity, percentOff },
  transaction
) {
  const product = await Product.findByPk(productId, { transaction });
  if (!product) throw new Error("Product not found");

  const finalPrice = product.wholesale * (1 - percentOff);

  return await AdminOrderLineItem.create(
    {
      adminOrderId,
      productId,
      quantity,
      basePrice: product.wholesale,
      percentOff,
      finalPrice
    },
    { transaction }
  );
}

/**
 * Create bulk AdminOrderLineItems from userLineItems
 * - adminOrderId: number
 * - selectedShipToState: string
 * - selectedDiscounts: { [productId]: percentOff }
 * - transaction: optional Sequelize transaction
 */
async function createBulkAdminLineItems(
  adminOrderId,
  selectedShipToState,
  selectedDiscounts = {},
  transaction
) {
  // Step 1: Get all relevant userLineItems
  const userLineItems = await UserLineItem.findAll({
    where: { adminOrderId: null, saveForLater: false },
    include: {
      model: User,
      as: "user",
      where: { defaultShipToState: selectedShipToState }
    },
    transaction
  });

  // Step 2: Group by product and sum quantities
  const grouped = {};
  userLineItems.forEach((item) => {
    if (!grouped[item.productId]) grouped[item.productId] = 0;
    grouped[item.productId] += item.quantity;
  });

  // Step 3: Build AdminOrderLineItem objects
  const adminLineItemsData = await Promise.all(
    Object.entries(grouped).map(async ([productId, quantity]) => {
      const numericProductId = Number(productId); // <-- convert to number
      const product = await Product.findByPk(numericProductId, { transaction });
      const percentOff = selectedDiscounts[numericProductId] ?? 0; // use numeric key
      const finalPrice = product.wholesale * (1 - percentOff);

      return {
        adminOrderId,
        productId: numericProductId, // <-- numeric
        quantity,
        basePrice: product.wholesale,
        percentOff,
        finalPrice
      };
    })
  );

  // Step 4: Bulk create
  return await AdminOrderLineItem.bulkCreate(adminLineItemsData, {
    transaction
  });
}

module.exports = {
  createSingleAdminLineItem,
  createBulkAdminLineItems
};
