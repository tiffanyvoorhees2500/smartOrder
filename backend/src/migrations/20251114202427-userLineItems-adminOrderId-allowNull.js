"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn("UserLineItems", "adminOrderId", {
      type: Sequelize.UUID,
      allowNull: true
    });
    await queryInterface.changeColumn("UserLineItems", "basePrice", {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true
    });
    await queryInterface.changeColumn("UserLineItems", "percentOff", {
      type: Sequelize.DECIMAL(5, 2),
      allowNull: true
    });
    await queryInterface.changeColumn("UserLineItems", "finalPrice", {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn("UserLineItems", "adminOrderId", {
      type: Sequelize.UUID,
      allowNull: false
    });
    await queryInterface.changeColumn("UserLineItems", "basePrice", {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false
    });
    await queryInterface.changeColumn("UserLineItems", "percentOff", {
      type: Sequelize.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0.0
    });
    await queryInterface.changeColumn("UserLineItems", "finalPrice", {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false
    });
  }
};
