'use strict';

module.exports = (sequelize, DataTypes) => {
  const Ingredient = sequelize.define('Ingredient', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    ingredient: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    number_label: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    string_label: {
      type: DataTypes.STRING,
      defaultValue: false,
    },
    original_product_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  });

  Ingredient.associate = (models) => {
    Ingredient.belongsTo(models.Product, {
      foreignKey: 'productId',
      as: 'product',
    });
  };

  return Ingredient;
};
