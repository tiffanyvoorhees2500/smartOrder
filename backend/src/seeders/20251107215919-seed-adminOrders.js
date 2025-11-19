"use strict";
const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const { v4: uuidv4 } = require("uuid");

const STATES = require("../utils/stateEnum");
const normalizeOriginalId = require("../utils/normalizeOriginalAdminId");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Load all users (we need their IDs + original_ids)
    const users = await queryInterface.sequelize.query(
      'SELECT id, original_id FROM "Users" WHERE original_id IS NOT NULL;',
      { type: Sequelize.QueryTypes.SELECT }
    );

    // Create a mapping from original_id to id
    const userMap = {};
    for (const user of users) {
      userMap[Number(user.original_id)] = user.id;
    }

    const adminOrders = [];
    const filePath = path.join(__dirname, "../data/adminOrders.csv");

    await new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on("data", (data) => {
          // Original AdminOrder ID in CSV
          const originalId = normalizeOriginalId(data.original_id);

          // Raw paidForById from CSV
          const rawPaidForById = Number(data.paidForById?.trim());
          const paidForById = userMap[rawPaidForById];
          if (!paidForById) {
            console.warn(
              `⚠️ No matching user found for original ID ${rawPaidForById}`
            );
            return;
          }

          // Normalize and validate state
          let shipToState = (data.shipToState || "UT").trim().toUpperCase();
          if (!STATES.includes(shipToState)) shipToState = "UT";

          adminOrders.push({
            id: uuidv4(),
            orderDate: new Date(data.orderDate),
            paidForById: paidForById,
            shipToState,
            shippingAmount: parseFloat(data.shippingAmount) || 0.0,
            taxAmount: parseFloat(data.taxAmount) || 0.0,
            original_id: originalId,
            createdAt: new Date(),
            updatedAt: new Date()
          });
        })
        .on("end", resolve)
        .on("error", reject);
    });

    // Bulk insert after CSV read
    if (adminOrders.length > 0) {
      await queryInterface.bulkInsert("AdminOrders", adminOrders, {});
      console.log(`✅ Inserted ${adminOrders.length} admin orders.`);
    } else {
      console.log("⚠️ No admin orders found to insert.");
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("AdminOrders", null, {});
  }
};
