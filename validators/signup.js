const { body } = require("express-validator");

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
        return true;
      });
    }),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must have more than 6 characters.")
    .isLength({ max: 20 })
    .withMessage("Password must have less than 20 characters."),
  body("confirmPassword").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Passwords did not match.");
    }
    return true;
  }),
];
