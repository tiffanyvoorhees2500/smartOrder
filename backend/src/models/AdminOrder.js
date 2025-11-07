'use strict';

module.exports = (sequelize, DataTypes) => {
  const AdminOrder = sequelize.define('AdminOrder', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    orderDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    paidForById: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    shipToState: {
      type: DataTypes.ENUM(
        "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA",
        "HI","ID","IL","IN","IA","KS","KY","LA","ME","MD",
        "MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
        "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC",
        "SD","TN","TX","UT","VT","VA","WA","WV","WI"
      ),
      allowNull: false,
      defaultValue: 'UT',
    },
    shippingAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
    },
    taxAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
    },
    original_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    }
  }, {});

  AdminOrder.associate = (models) => {
    AdminOrder.belongsTo(models.User, {
      foreignKey: 'paidForById',
      as: 'paidForBy',
    });
  };

  return AdminOrder;
};