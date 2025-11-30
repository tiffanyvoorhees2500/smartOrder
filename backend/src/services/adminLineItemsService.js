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
  AdminLineItem,
  Product,
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
  { adminOrderId, adminLineItems },
  transaction
) {

  const adminLineItemsData = adminLineItems.map(item => {
    // Don't trust the frontend for finalPrice calculation
    const finalPrice = item.wholesale * (1 - (item.discountPercentage) / 100);

    return {
      adminOrderId,
      productId: item.id,
      quantity: item.adminQuantity,
      basePrice: item.wholesale,
      percentOff: item.discountPercentage / 100,
      finalPrice
    };
  });

  return await AdminLineItem.bulkCreate(adminLineItemsData, { transaction });
}

module.exports = {
  createSingleAdminLineItem,
  createBulkAdminLineItems
};
