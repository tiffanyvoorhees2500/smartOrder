'use strict';
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    console.log('📥 Starting adminLineItems seed...');

    // === 1️⃣ Load Admin Orders (for mapping original_id → id)
    const adminOrders = await queryInterface.sequelize.query(
      'SELECT id, original_id FROM "AdminOrders" WHERE original_id IS NOT NULL;',
      { type: Sequelize.QueryTypes.SELECT }
    );

    const adminOrderMap = {};
    for (const order of adminOrders) {
      // Convert safely in case original_id is stored as string or number
      const key = BigInt(order.original_id);
      adminOrderMap[key] = order.id;
    }

    // === 2️⃣ Load Products (for mapping original_id → id)
    const products = await queryInterface.sequelize.query(
      'SELECT id, original_id FROM "Products" WHERE original_id IS NOT NULL;',
      { type: Sequelize.QueryTypes.SELECT }
    );

    const productMap = {};
    for (const product of products) {
      const key = Number(product.original_id);
      productMap[key] = product.id;
    }

    // === 3️⃣ Read CSV data
    const adminLineItems = [];
    const filePath = path.join(__dirname, '../data/adminLineItems.csv');

    // Utility: safely convert scientific notation or weird numeric text → BigInt
    const safeBigInt = (value) => {
      if (!value) return null;
      const num = Number(value);
      if (Number.isNaN(num)) return null;
      return BigInt(Math.round(num));
    };

    await new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => {
          // Skip empty rows
          if (!data.original_id || !data.adminOrderId || !data.productId) return;

          // === 4️⃣ Convert & map keys
          const adminOrderKey = safeBigInt(data.adminOrderId.trim());
          const originalId = safeBigInt(data.original_id.trim());
          const productIdKey = Number(data.productId.trim());

          const adminOrderId = adminOrderMap[adminOrderKey];
          const productId = productMap[productIdKey];

          // Debug (optional)
          // console.log({
          //   adminOrderKey,
          //   productIdKey,
          //   adminOrderId,
          //   productId,
          //   originalId
          // });

          // === 5️⃣ Skip if no matches
          if (!adminOrderId) {
            console.warn(`⚠️ No matching AdminOrder for original_id: ${data.adminOrderId}`);
            return;
          }
          if (!productId) {
            console.warn(`⚠️ No matching Product for productId: ${data.productId}`);
            return;
          }

          // === 6️⃣ Build record
          adminLineItems.push({
            id: uuidv4(),
            adminOrderId,
            productId,
            quantity: Number(data.quantity) || 0,
            basePrice: parseFloat(data.basePrice) || 0.0,
            percentOff: parseFloat(data.percentOff) || 0.0,
            finalPrice: parseFloat(data.finalPrice) || 0.0,
            original_id: originalId,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        })
        .on('end', resolve)
        .on('error', reject);
    });

    // === 7️⃣ Bulk insert
    if (adminLineItems.length > 0) {
      await queryInterface.bulkInsert('AdminLineItems', adminLineItems, {});
      console.log(`✅ Inserted ${adminLineItems.length} admin line items successfully.`);
    } else {
      console.log('⚠️ No admin line items found to insert.');
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('AdminLineItems', null, {});
    console.log('🗑️ Deleted all AdminLineItems.');
  },
};
