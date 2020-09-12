const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("online-shop", "root", "1963", {
  host: "localhost",
  dialect: "mysql",
});

module.exports = sequelize;
