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
        allowNull: false
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
        defaultValue: 0.0
      },
      taxAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0
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

    AdminOrder.hasMany(models.AdminLineItem, {
      foreignKey: "adminOrderId",
      as: "adminLineItems"
    });

    AdminOrder.hasMany(models.UserLineItem, {
      foreignKey: "adminOrderId",
      as: "userLineItems"
    });

    AdminOrder.hasMany(models.UserOrder, {
      foreignKey: "adminOrderId",
      as: "userOrders"
    });
  };

  return AdminOrder;
};
