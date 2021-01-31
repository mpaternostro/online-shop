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

const router = express.Router();

router.get("/login", getLogin);

router.get("/signup", getSignup);

router.get("/reset-password", getResetPassword);

router.get("/reset-password/:token", getNewPassword);

router.post("/login", postLogin);

router.post("/signup", postSignup);

router.post("/logout", postLogout);

router.post("/reset-password", postResetPassword);

router.post("/new-password", postNewPassword);

module.exports = router;
