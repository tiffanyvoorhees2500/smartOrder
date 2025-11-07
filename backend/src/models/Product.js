'use strict';

module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define('Product', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    retail: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    wholesale: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    discontinued: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    number_in_bottle: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    original_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  });

  Product.associate = (models) => {
    Product.hasMany(models.ProductIngredient, {
      foreignKey: 'productId',
      as: 'ingredients',
    });
  };

  return Product;
};
