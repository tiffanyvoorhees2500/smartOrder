"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add original product ID to Products table
    await queryInterface.addColumn("Products", "original_id", {
      type: Sequelize.INTEGER,
      allowNull: true
    });

    // Add original product ID to Ingredients table
    await queryInterface.addColumn("Ingredients", "original_product_id", {
      type: Sequelize.INTEGER,
      allowNull: true
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove original product ID from Products and Ingredients table
    await queryInterface.removeColumn("Products", "original_id");
    await queryInterface.removeColumn("Ingredients", "original_product_id");
  }
};
