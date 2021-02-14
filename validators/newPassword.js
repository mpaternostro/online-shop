const { body } = require("express-validator");
const { PASSWORD_MIN_LENGTH, PASSWORD_MAX_LENGTH } = require("../constants");

module.exports = [
  body("password")
    .isLength({ min: PASSWORD_MIN_LENGTH })
    .withMessage(`Password must have more than ${PASSWORD_MIN_LENGTH} characters.`)
    .isLength({ max: PASSWORD_MAX_LENGTH })
    .withMessage(`Password must have less than ${PASSWORD_MAX_LENGTH} characters.`)
    .trim(),
];
