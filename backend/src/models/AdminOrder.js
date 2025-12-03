"use strict";
const US_STATES = require("../utils/stateEnum");

module.exports = (sequelize, DataTypes) => {
  const AdminOrder = sequelize.define(
    "AdminOrder",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      orderDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      paidForById: {
        type: DataTypes.UUID,
        allowNull: false
      },
      shipToState: {
        type: DataTypes.ENUM(...US_STATES),
        allowNull: false,
        defaultValue: "UT"
      },
      shippingAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
        get() {
          const value = this.getDataValue("shippingAmount");
          return value !== null ? parseFloat(value) : null;
        }
      },
      taxAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
        get() {
          const value = this.getDataValue("taxAmount");
          return value !== null ? parseFloat(value) : null;
        }
      },
      original_id: {
        type: DataTypes.STRING,
        allowNull: true
      }
    },
    {}
  );

  AdminOrder.associate = (models) => {
    AdminOrder.belongsTo(models.User, {
      foreignKey: "paidForById",
      as: "paidForBy"
    });

    // Cascade delete
    AdminOrder.hasMany(models.AdminLineItem, {
      foreignKey: "adminOrderId",
      as: "adminLineItems",
      onDelete: "Cascade"
    });

    // Set NULL
    AdminOrder.hasMany(models.UserLineItem, {
      foreignKey: "adminOrderId",
      as: "userLineItems",
      onDelete: "SET NULL"
    });

    // Cascade delete
    AdminOrder.hasMany(models.UserOrder, {
      foreignKey: "adminOrderId",
      as: "userOrders",
      onDelete: "Cascade"
    });
  };

  // Hook to reset pricing when onDelete for userLineItems
  AdminOrder.beforeDestroy(async (adminOrder, options) => {
    const { UserLineItem } = adminOrder.sequelize.models;

    await UserLineItem.update(
      {
        adminOrderId: null,
        basePrice: null,
        percentOff: null,
        finalPrice: null
      },
      {
        where: { adminOrderId: adminOrder.id },
        transaction: options.transaction
      }
    );
  });

  return AdminOrder;
};
