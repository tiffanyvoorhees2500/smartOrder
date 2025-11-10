'use strict';

module.exports = (sequelize, DataTypes) => {
  const AdminLineItem = sequelize.define(
    'AdminLineItem',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      productId: {
        type: DataTypes.UUID,
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

  AdminLineItem.associate = (models) => {
    AdminLineItem.belongsTo(models.AdminOrder, {
      foreignKey: 'adminOrderId',
      as: 'adminOrder',
    });

    AdminLineItem.belongsTo(models.Product, {
      foreignKey: 'productId',
      as: 'product',
    });
  };

  return AdminLineItem;
};
