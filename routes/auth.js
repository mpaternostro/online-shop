const express = require("express");

const {
  getLogin,
  getSignup,
  getResetPassword,
  getNewPassword,
  postLogin,
  postSignup,
  postLogout,
  postResetPassword,
  postNewPassword,
} = require("../controllers/auth");
const loginValidator = require("../validators/login");
const signupValidator = require("../validators/signup");

const router = express.Router();

router.get("/login", getLogin);

router.get("/signup", getSignup);

router.get("/reset-password", getResetPassword);

router.get("/reset-password/:token", getNewPassword);

router.post("/login", loginValidator, postLogin);

router.post("/signup", signupValidator, postSignup);

router.post("/logout", postLogout);

router.post("/reset-password", postResetPassword);

router.post("/new-password", postNewPassword);

module.exports = router;
