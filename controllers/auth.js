const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");

const User = require("../models/user");

const transporter = nodemailer.createTransport({
  host: process.env.MAILTRAP_HOST,
  port: process.env.MAILTRAP_PORT,
  auth: {
    user: process.env.MAILTRAP_USERNAME,
    pass: process.env.MAILTRAP_PASSWORD,
  },
});

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.getLogin = (req, res) => {
  const [errorMessage] = req.flash("error");
  const [successMessage] = req.flash("success");
  res.render("auth/login", {
    pageTitle: "Log In",
    path: "/auth/login",
    errorMessage,
    successMessage,
  });
};

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.getSignup = (req, res) => {
  const [errorMessage] = req.flash("error");
  res.render("auth/signup", {
    path: "/signup",
    pageTitle: "Signup",
    errorMessage,
  });
};

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.getResetPassword = async (req, res) => {
  const [errorMessage] = req.flash("error");
  res.render("auth/reset-password", {
    path: "/reset-password",
    pageTitle: "Reset Password",
    errorMessage,
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
    req.flash("error", error.message);
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
    req.flash("success", "Account created successfully. Please log in.");
    res.redirect("/login");
  } catch (error) {
    console.error(error);
    req.flash("error", "Could not create new account. Email address already in use.");
    res.redirect("/signup");
  }
  try {
    transporter.sendMail({
      to: email,
      from: "no-reply@onlineshop.com",
      subject: "Signup succeeded",
      html: "<h1>You successfully signed up!</h1>",
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
