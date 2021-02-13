const { body } = require("express-validator");
const { PASSWORD_MIN_LENGTH, PASSWORD_MAX_LENGTH } = require("../constants");

const User = require("../models/user");

module.exports = [
  body("email")
    .isEmail()
    .withMessage("Please enter a valid email.")
    .custom(async (value) => {
      return User.findOne({ email: value }).then((userDoc) => {
        if (userDoc) {
          return Promise.reject(
            new Error("Could not create new account. Email address already in use.")
          );
        }
        return Promise.resolve();
      });
    }),
  body("password")
    .isLength({ min: PASSWORD_MIN_LENGTH })
    .withMessage(`Password must have more than ${PASSWORD_MIN_LENGTH} characters.`)
    .isLength({ max: PASSWORD_MAX_LENGTH })
    .withMessage(`Password must have less than ${PASSWORD_MAX_LENGTH} characters.`),
  body("confirmPassword").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Passwords did not match.");
    }
  }),
];
