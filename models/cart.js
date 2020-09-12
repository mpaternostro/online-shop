const { DataTypes } = require("sequelize");

const sequelize = require("../utils/database");

const Cart = sequelize.define("cart", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
  },
});
module.exports = Cart;
