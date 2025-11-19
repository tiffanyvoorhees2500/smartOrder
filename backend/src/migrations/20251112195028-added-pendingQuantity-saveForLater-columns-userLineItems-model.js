"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("UserLineItems", "pendingQuantity", {
      type: Sequelize.INTEGER,
      allowNull: true
    });

    await queryInterface.addColumn("UserLineItems", "saveForLater", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("UserLineItems", "pendingQuantity");
    await queryInterface.removeColumn("UserLineItems", "saveForLater");
  }
};
