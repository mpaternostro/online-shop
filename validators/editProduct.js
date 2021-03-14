const { body } = require("express-validator");

const TITLE_MIN_LENGTH = 5;
const TITLE_MAX_LENGTH = 30;
const DESCRIPTION_MIN_LENGTH = 5;
const DESCRIPTION_MAX_LENGTH = 255;
const MIN_PRICE = 0.25;
const MAX_PRICE = 1000;

module.exports = [
  body("title")
    .notEmpty()
    .withMessage("Please enter a title.")
    .bail()
    .isLength({ min: TITLE_MIN_LENGTH })
    .withMessage(`Title must have more than ${TITLE_MIN_LENGTH} characters.`)
    .isLength({ max: TITLE_MAX_LENGTH })
    .withMessage(`Title must have less than ${TITLE_MAX_LENGTH} characters.`)
    .trim(),
  body("imageUrl").isURL().withMessage("Please enter a valid image URL.").trim(),
  body("description")
    .notEmpty()
    .withMessage("Please enter a description.")
    .bail()
    .isLength({ min: DESCRIPTION_MIN_LENGTH })
    .withMessage(`Description must have more than ${DESCRIPTION_MIN_LENGTH} characters.`)
    .isLength({ max: DESCRIPTION_MAX_LENGTH })
    .withMessage(`Description must have less than ${DESCRIPTION_MAX_LENGTH} characters.`)
    .trim(),
  body("price")
    .notEmpty()
    .withMessage("Please enter a price.")
    .bail()
    .isFloat({ min: MIN_PRICE })
    .withMessage(`Price must be higher than $ ${MIN_PRICE}.`)
    .isFloat({ max: MAX_PRICE })
    .withMessage(`Price must be lower than $ ${MAX_PRICE}.`)
    .customSanitizer((value) => Number(value).toFixed(2)),
];
