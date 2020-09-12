const { DataTypes } = require("sequelize");

const sequelize = require("../utils/database");

const CartItem = sequelize.define("cartItem", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

module.exports = CartItem;
