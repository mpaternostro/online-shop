const { body } = require("express-validator");

module.exports = [body("email").isEmail().withMessage("Please enter a valid email.")];
