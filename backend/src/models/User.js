"use strict";

const US_STATES = require("../utils/stateEnum");

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true
        }
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false
      },
      isAdmin: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      pricingType: {
        type: DataTypes.ENUM("Retail", "Wholesale"),
        defaultValue: "Retail",
        allowNull: false
      },
      discountType: {
        type: DataTypes.ENUM("Group", "Individual"),
        defaultValue: "Individual",
        allowNull: false
      },
      defaultShipToState: {
        type: DataTypes.ENUM(...US_STATES),
        allowNull: false
      },
      original_id: {
        type: DataTypes.INTEGER,
        allowNull: true
      }
    },
    {}
  );

  User.associate = (models) => {
    User.hasMany(models.AdminOrder, {
      foreignKey: "paidForById",
      as: "adminOrdersPaidFor"
    });

    User.hasMany(models.UserLineItem, {
      foreignKey: "userId",
      as: "userLineItems"
    });

    User.hasMany(models.UserOrder, {
      foreignKey: "userId",
      as: "userOrders"
    });
  };

  return User;
};
