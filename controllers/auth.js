const User = require("../models/user");

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.getLogin = (req, res) => {
  res.render("auth/login", {
    pageTitle: "Log In",
    path: "/auth/login",
    isAuthenticated: req.session.isLoggedIn,
  });
};

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.postLogin = async (req, res) => {
  try {
    req.session.user = await User.findById(process.env.DB_USER);
    req.session.isLoggedIn = true;
    req.session.save((err) => {
      if (err) {
        console.error(err);
      }
      res.redirect("/");
    });
  } catch (error) {
    console.error(error);
  }
};

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.postLogout = async (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error(err);
    }
    res.redirect("/");
  });
};
