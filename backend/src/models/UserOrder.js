"use strict";
const US_STATES = require("../utils/stateEnum");

module.exports = (sequelize, DataTypes) => {
  const UserOrder = sequelize.define(
    "UserOrder",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      adminOrderId: {
        type: DataTypes.UUID,
        allowNull: false
      },
      userId: {
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
      }
    },
    {}
  );

  UserOrder.associate = (models) => {
    UserOrder.belongsTo(models.User, {
      foreignKey: "userId",
      as: "user"
    });

    UserOrder.belongsTo(models.AdminOrder, {
      foreignKey: "adminOrderId",
      as: "adminOrder"
    });
  };

  return UserOrder;
};
