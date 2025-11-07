'use strict';

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isAdmin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    pricingType: {
      type: DataTypes.ENUM('Retail', 'Wholesale'),
      defaultValue: 'Retail',
      allowNull: false,
    },
    discountType: {
      type: DataTypes.ENUM('Group', 'Individual'),
      defaultValue: 'Individual',
      allowNull: false,
    },
    defaultShipToState: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  }, {});
  return User;
};
