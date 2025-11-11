'use strict';
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Load all products (we need their IDs + original_ids)
    const products = await queryInterface.sequelize.query(
      'SELECT id, original_id FROM "Products";',
      { type: Sequelize.QueryTypes.SELECT }
    );

    // Create a mapping from original_id to id
    const productMap = {};
    for (const product of products) {
      productMap[Number(product.original_id)] = product.id;
    }

    // Parse CSV for Ingredients
    const ingredients = [];
    const filePath = path.join(__dirname, '../data/ingredients.csv');

    await new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => {
          const rawId = data.original_product_id?.trim?.();
          const originalId = Number(rawId);
          const productId = productMap[originalId]; // look up the new ID
          if (!productId) {
            console.warn(
              `⚠️ No matching product found for original ID ${originalId}`
            );
            return;
          }

          ingredients.push({
            productId,
            original_product_id: originalId,
            ingredient: data.ingredient?.trim?.(),
            number_label: parseFloat(data.number_label) || 0,
            string_label: data.string_label?.trim?.() || null,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        })
        .on('end', resolve)
        .on('error', reject);
    });

    // Insert ingredients into the database
    if (ingredients.length > 0) {
      await queryInterface.bulkInsert('Ingredients', ingredients, {});
      console.log(`✅ Inserted ${ingredients.length} ingredients.`);
    } else {
      console.warn('⚠️ No ingredients inserted.');
    }
  },

  async down(queryInterface, Sequelize) {
    // Optionally delete all ingredients seeded
    await queryInterface.bulkDelete('Ingredients', null, {});
  },
};
