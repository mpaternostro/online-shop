const bcrypt = require("bcryptjs");

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
exports.getSignup = (req, res) => {
  res.render("auth/signup", {
    path: "/signup",
    pageTitle: "Signup",
    isAuthenticated: false,
  });
};

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.postLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error("There's no user registered with this email.");
    }
    const doMatchPassword = await bcrypt.compare(password, user.password);
    if (doMatchPassword) {
      req.session.user = user;
      req.session.isLoggedIn = true;
      req.session.save((err) => {
        if (err) {
          console.error(err);
        }
        res.redirect("/");
      });
    } else {
      throw new Error("Email and password does not match.");
    }
  } catch (error) {
    res.redirect("/login");
    console.error(error);
  }
};

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.postSignup = async (req, res) => {
  const { email, password, confirmPassword } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 12);
    await User.create({ email, password: hashedPassword });
    res.redirect("/login");
  } catch (error) {
    console.error(error);
    res.redirect("/signup");
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
