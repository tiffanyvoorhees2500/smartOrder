"use strict";
const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcryptjs");

const STATES = [
  "AL",
  "AK",
  "AZ",
  "AR",
  "CA",
  "CO",
  "CT",
  "DE",
  "FL",
  "GA",
  "HI",
  "ID",
  "IL",
  "IN",
  "IA",
  "KS",
  "KY",
  "LA",
  "ME",
  "MD",
  "MA",
  "MI",
  "MN",
  "MS",
  "MO",
  "MT",
  "NE",
  "NV",
  "NH",
  "NJ",
  "NM",
  "NY",
  "NC",
  "ND",
  "OH",
  "OK",
  "OR",
  "PA",
  "RI",
  "SC",
  "SD",
  "TN",
  "TX",
  "UT",
  "VT",
  "VA",
  "WA",
  "WV",
  "WI",
  "WY"
];

const SALT_ROUNDS = 10;

module.exports = {
  async up(queryInterface, Sequelize) {
    const users = [];
    const filePath = path.join(__dirname, "../data/users.csv");

    // Wrap in a promise so Sequelize waits for CSV parsing and bcrypt hashing
    await new Promise((resolve, reject) => {
      const promises = [];

      fs.createReadStream(filePath)
        .pipe(csv())
        .on("data", (data) => {
          // Skip completely empty rows
          if (!data.name && !data.email && !data.password) return;

          promises.push(
            (async () => {
              const originalId = Number(data.original_id?.trim()) || null;

              // Handle boolean fields
              const isAdmin =
                String(data.isAdmin || data.role || "")
                  .trim()
                  .toLowerCase() === "yes";

              const pricingType =
                String(data.pricingType || "")
                  .trim()
                  .toLowerCase() === "wholesale"
                  ? "Wholesale"
                  : "Retail";

              const discountType =
                String(data.discountType || "")
                  .trim()
                  .toLowerCase() === "group"
                  ? "Group"
                  : "Individual";

              // Handle defaultShipToState with fallback to 'UT'
              let defaultShipToState = (data.defaultShipToState || "UT")
                .trim()
                .toUpperCase();
              if (!STATES.includes(defaultShipToState))
                defaultShipToState = "UT";

              // Handle email (placeholder if missing)
              const email =
                data.email?.trim()?.toLowerCase() ||
                `user_${uuidv4()}@example.com`;

              // Hash password
              const passwordHash = await bcrypt.hash(
                data.password,
                SALT_ROUNDS
              );

              return {
                id: uuidv4(),
                original_id: originalId,
                name: data.name?.trim(),
                email,
                password: passwordHash,
                isAdmin,
                pricingType,
                discountType,
                defaultShipToState,
                createdAt: new Date(),
                updatedAt: new Date()
              };
            })()
          );
        })
        .on("end", async () => {
          const usersToInsert = await Promise.all(promises);
          if (usersToInsert.length > 0) {
            await queryInterface.bulkInsert("Users", usersToInsert, {});
            console.log(`✅ Inserted ${usersToInsert.length} users.`);
          } else {
            console.warn("⚠️ No users inserted.");
          }
          resolve();
        })
        .on("error", reject);
    });
  },

  async down(queryInterface, Sequelize) {
    // Delete seeded users safely using original_id
    await queryInterface.bulkDelete("Users", {
      original_id: { [Sequelize.Op.ne]: null }
    });
  }
};
