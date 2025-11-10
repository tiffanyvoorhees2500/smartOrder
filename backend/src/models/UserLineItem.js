'use strict';

module.exports = (sequelize, DataTypes) => {
  const UserLineItem = sequelize.define(
    'UserLineItem',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      basePrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      percentOff: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      finalPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      adminOrderId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      original_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
      },
    },
    {}
  );

  UserLineItem.associate = (models) => {
    UserLineItem.belongsTo(models.UserOrder, {
      foreignKey: 'userOrderId',
      as: 'userOrder',
    });

    UserLineItem.belongsTo(models.Product, {
      foreignKey: 'productId',
      as: 'product',
    });

    UserLineItem.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
    });
  };

  return UserLineItem;
};
