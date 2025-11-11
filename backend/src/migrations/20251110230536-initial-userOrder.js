'use strict';

const US_STATES = require('../utils/stateEnum'); // make sure this path is correct

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('UserOrders', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      adminOrderId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'AdminOrders', // table name must match your AdminOrder table
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Users', // table name must match your User table
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      shipToState: {
        type: Sequelize.ENUM(...US_STATES),
        allowNull: false,
        defaultValue: 'UT',
      },
      shippingAmount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
      },
      taxAmount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    // Drop ENUM type first (Postgres specific)
    await queryInterface.dropTable('UserOrders');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_UserOrders_shipToState";');
  },
};
