'use strict';
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { v4: uuidv4 } = require('uuid');
const { STRING } = require('sequelize');
const normalizeOriginalId = require('../utils/normalizeOriginalAdminId');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    console.log('📥 Starting userLineItems seed...');

    // === Load Admin Orders (for mapping original_id → id)
    const adminOrders = await queryInterface.sequelize.query(
      'SELECT id, original_id FROM "AdminOrders" WHERE original_id IS NOT NULL;',
      { type: Sequelize.QueryTypes.SELECT }
    );

    // Build a map of original_id (as string) → AdminOrder.id
    const adminOrderMap = {};
    for (const order of adminOrders) {
      const key = normalizeOriginalId(order.original_id);
      if (key) adminOrderMap[key] = order.id;
    }

    // === Load Products (for mapping original_id → id)
    const products = await queryInterface.sequelize.query(
      'SELECT id, original_id FROM "Products" WHERE original_id IS NOT NULL;',
      { type: Sequelize.QueryTypes.SELECT }
    );

    const productMap = {};
    for (const product of products) {
      const key = Number(product.original_id);
      productMap[key] = product.id;
    }

    // === Load Users (for mapping original_id → id)
    const users = await queryInterface.sequelize.query(
      'SELECT id, original_id FROM "Users" WHERE original_id IS NOT NULL;',
      { type: Sequelize.QueryTypes.SELECT }
    );

    const userMap = {};
    for (const user of users) {
      const key = Number(user.original_id);
      userMap[key] = user.id;
    }

    // === Read CSV data
    const userLineItems = [];
    const filePath = path.join(__dirname, '../data/userLineItems.csv');

    await new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => {
          // Skip empty rows
          if (
            !data.original_id ||
            !data.userId ||
            !data.adminOrderId ||
            !data.productId
          )
            return;

          const adminOriginalId = normalizeOriginalId(data.adminOrderId);
          const productIdKey = Number(data.productId.trim());
          const userIdKey = Number(data.userId.trim());

          const adminOrderId = adminOrderMap[adminOriginalId];
          const productId = productMap[productIdKey];
          const userId = userMap[userIdKey];

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
            console.warn(
              `⚠️ No matching AdminOrder for original_id: ${data.adminOrderId}`
            );
            return;
          }
          if (!productId) {
            console.warn(
              `⚠️ No matching Product for productId: ${data.productId}`
            );
            return;
          }
          if (!userId) {
            console.warn(`⚠️ No matching User for userId: ${data.userId}`);
            return;
          }

          // === 6️⃣ Build record
          userLineItems.push({
            id: uuidv4(),
            adminOrderId,
            productId,
            userId,
            quantity: Number(data.quantity) || 0,
            basePrice: parseFloat(data.basePrice) || 0.0,
            percentOff: parseFloat(data.percentOff) || 0.0,
            finalPrice: parseFloat(data.finalPrice) || 0.0,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        })
        .on('end', resolve)
        .on('error', reject);
    });

    // === 7️⃣ Bulk insert
    if (userLineItems.length > 0) {
      await queryInterface.bulkInsert('UserLineItems', userLineItems, {});
      console.log(
        `✅ Inserted ${userLineItems.length} user line items successfully.`
      );
    } else {
      console.log('⚠️ No user line items found to insert.');
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('UserLineItems', null, {});
    console.log('🗑️ Deleted all UserLineItems.');
  },
};
