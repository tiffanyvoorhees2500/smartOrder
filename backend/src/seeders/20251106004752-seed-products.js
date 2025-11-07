'use strict';
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

module.exports = {
  async up(queryInterface, Sequelize) {
    const products = [];

    const filePath = path.join(__dirname, '../data/products.csv');

    // Wrap in a promise so Sequelize waits for CSV parsing
    await new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => {
          data.retail = parseFloat(data.retail.replace(/\$/g, '').trim());
          data.wholesale = parseFloat(data.wholesale.replace(/\$/g, '').trim());
          data.retail = isNaN(data.retail) ? 0.0 : data.retail;
          data.wholesale = isNaN(data.wholesale) ? 0.0 : data.wholesale;

          data.discontinued = data.discontinued
            ? data.discontinued.toString().toLowerCase() === 'true'
            : false;

          if (data.number_in_bottle === '') data.number_in_bottle = null;
          else data.number_in_bottle = parseInt(data.number_in_bottle);

          products.push({
            original_id: data.original_id ? parseInt(data.original_id) : null,
            name: data.name,
            retail: data.retail,
            wholesale: data.wholesale,
            discontinued: data.discontinued,
            number_in_bottle: data.number_in_bottle,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        })
        .on('end', () => resolve())
        .on('error', (err) => reject(err));
    });

    await queryInterface.bulkInsert('Products', products, {});
  },

  async down(queryInterface, Sequelize) {
    // Optionally delete all products seeded
    await queryInterface.bulkDelete('Products', null, {});
  },
};
