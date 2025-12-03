"use strict";

module.exports = (sequelize, DataTypes) => {
  const UserLineItem = sequelize.define(
    "UserLineItem",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false
      },
      productId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      basePrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        get() {
          const value = this.getDataValue("basePrice");
          return value !== null ? parseFloat(value) : null;
        }
      },
      percentOff: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        defaultValue: 0.0,
        get() {
          const value = this.getDataValue("percentOff");
          return value !== null ? parseFloat(value) : null;
        }
      },
      finalPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
      },
      adminOrderId: {
        type: DataTypes.UUID,
        allowNull: true // rows without adminOrderId belong to the admin current bulk order
      },
      original_id: {
        type: DataTypes.BIGINT,
        allowNull: true
      },
      pendingQuantity: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      saveForLater: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      }
    },
    {}
  );

  UserLineItem.associate = (models) => {
    UserLineItem.belongsTo(models.Product, {
      foreignKey: "productId",
      as: "product"
    });

    UserLineItem.belongsTo(models.User, {
      foreignKey: "userId",
      as: "user"
    });

    UserLineItem.belongsTo(models.AdminOrder, {
      foreignKey: "adminOrderId",
      as: "adminOrder"
    });
  };

  return UserLineItem;
};
