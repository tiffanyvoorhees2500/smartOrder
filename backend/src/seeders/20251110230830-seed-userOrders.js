"use strict";
const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const { v4: uuidv4 } = require("uuid");
const STATES = require("../utils/stateEnum");
const { STRING } = require("sequelize");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // === Load Admin Orders (for mapping original_id → id)
    const adminOrders = await queryInterface.sequelize.query(
      'SELECT id, original_id FROM "AdminOrders" WHERE original_id IS NOT NULL;',
      { type: Sequelize.QueryTypes.SELECT }
    );

    // Build a map of original_id (as string) → AdminOrder.id
    const adminOrderMap = {};
    for (const order of adminOrders) {
      if (!order.original_id) continue;

      // Ensure key is a string, handling possible scientific notation
      let key = order.original_id.toString();
      if (key.toUpperCase().includes("E")) {
        key = Number(key).toLocaleString("fullwide", { useGrouping: false });
      }

      adminOrderMap[key] = order.id;
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
    const userOrders = [];
    const filePath = path.join(__dirname, "../data/userOrders.csv");

    // Read and parse CSV
    await new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on("data", (data) => {
          if (!data.userId || !data.adminOrderId) return; // Skip invalid rows

          let adminOriginalId = data.adminOrderId?.trim();
          if (!adminOriginalId) return;

          if (adminOriginalId.toUpperCase().includes("E")) {
            adminOriginalId = Number(adminOriginalId).toLocaleString(
              "fullwide",
              { useGrouping: false }
            );
          }
          const userIdKey = Number(data.userId.trim());

          const adminOrderId = adminOrderMap[adminOriginalId];
          const userId = userMap[userIdKey];

          // Skip if no matches
          if (!adminOrderId) {
            console.warn(
              `⚠️ No matching AdminOrder for original_id: ${data.adminOrderId}`
            );
            return;
          }
          if (!userId) {
            console.warn(`⚠️ No matching User for userId: ${data.userId}`);
            return;
          }

          // Normalize and validate state
          let shipToState = (data.shipToState || "UT").trim().toUpperCase();
          if (!STATES.includes(shipToState)) shipToState = "UT";

          // Build record
          userOrders.push({
            id: uuidv4(),
            adminOrderId,
            userId,
            shipToState,
            shippingAmount: parseFloat(data.shippingAmount) || 0.0,
            taxAmount: parseFloat(data.taxAmount) || 0.0,
            createdAt: new Date(),
            updatedAt: new Date()
          });
        })
        .on("end", () => {
          resolve();
        })
        .on("error", (err) => {
          reject(err);
        });
    });

    // Bulk insert after CSV read
    if (userOrders.length > 0) {
      await queryInterface.bulkInsert("UserOrders", userOrders, {});
      console.log(`✅ Inserted ${userOrders.length} user orders.`);
    } else {
      console.log("⚠️ No user orders found to insert.");
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("UserOrders", null, {});
  }
};
