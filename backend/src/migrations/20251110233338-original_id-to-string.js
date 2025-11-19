"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn("AdminOrders", "original_id", {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.removeColumn("AdminLineItems", "original_id");
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn("AdminOrders", "original_id", {
      type: Sequelize.BIGINT,
      allowNull: true
    });

    await queryInterface.addColumn("AdminOrders", "original_id", {
      type: Sequelize.BIGINT,
      allowNull: true
    });
  }
};
