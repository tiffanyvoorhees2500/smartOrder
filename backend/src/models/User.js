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
      type: DataTypes.ENUM(
        "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA",
        "HI","ID","IL","IN","IA","KS","KY","LA","ME","MD",
        "MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
        "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC",
        "SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"
      ),
      allowNull: false,
    },
    original_id:{
      type: DataTypes.INTEGER,
      allowNull: true,
    }
  }, {});
  return User;
};
