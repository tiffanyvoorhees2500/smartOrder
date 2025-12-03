"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    //
    // 1. Drop existing constraints (required before altering)
    //

    await queryInterface
      .removeConstraint("AdminLineItems", "AdminLineItems_adminOrderId_fkey")
      .catch(() => {});

    await queryInterface
      .removeConstraint("UserLineItems", "UserLineItems_adminOrderId_fkey")
      .catch(() => {});

    await queryInterface
      .removeConstraint("UserOrders", "UserOrders_adminOrderId_fkey")
      .catch(() => {});

    //
    // 2. Re-add with correct ON DELETE behavior
    //

    await queryInterface.addConstraint("AdminLineItems", {
      fields: ["adminOrderId"],
      type: "foreign key",
      name: "AdminLineItems_adminOrderId_fkey",
      references: {
        table: "AdminOrders",
        field: "id"
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE"
    });

    await queryInterface.addConstraint("UserLineItems", {
      fields: ["adminOrderId"],
      type: "foreign key",
      name: "UserLineItems_adminOrderId_fkey",
      references: {
        table: "AdminOrders",
        field: "id"
      },
      onDelete: "SET NULL",
      onUpdate: "CASCADE"
    });

    await queryInterface.addConstraint("UserOrders", {
      fields: ["adminOrderId"],
      type: "foreign key",
      name: "UserOrders_adminOrderId_fkey",
      references: {
        table: "AdminOrders",
        field: "id"
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE"
    });
  },

  async down(queryInterface, Sequelize) {
    //
    // 1. Remove the updated constraints
    //
    await queryInterface.removeConstraint(
      "AdminLineItems",
      "AdminLineItems_adminOrderId_fkey"
    );
    await queryInterface.removeConstraint(
      "UserLineItems",
      "UserLineItems_adminOrderId_fkey"
    );
    await queryInterface.removeConstraint(
      "UserOrders",
      "UserOrders_adminOrderId_fkey"
    );

    //
    // 2. Restore generic RESTRICT constraints (or whatever you had previously)
    //
    await queryInterface.addConstraint("AdminLineItems", {
      fields: ["adminOrderId"],
      type: "foreign key",
      name: "AdminLineItems_adminOrderId_fkey",
      references: {
        table: "AdminOrders",
        field: "id"
      },
      onDelete: "RESTRICT",
      onUpdate: "CASCADE"
    });

    await queryInterface.addConstraint("UserLineItems", {
      fields: ["adminOrderId"],
      type: "foreign key",
      name: "UserLineItems_adminOrderId_fkey",
      references: {
        table: "AdminOrders",
        field: "id"
      },
      onDelete: "RESTRICT",
      onUpdate: "CASCADE"
    });

    await queryInterface.addConstraint("UserOrders", {
      fields: ["adminOrderId"],
      type: "foreign key",
      name: "UserOrders_adminOrderId_fkey",
      references: {
        table: "AdminOrders",
        field: "id"
      },
      onDelete: "RESTRICT",
      onUpdate: "CASCADE"
    });
  }
};
