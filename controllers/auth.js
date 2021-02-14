const crypto = require("crypto");

const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const { validationResult } = require("express-validator");

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
  const [successMessage] = req.flash("success");
  res.render("auth/login", {
    pageTitle: "Log In",
    path: "/auth/login",
    errorMessage: "",
    successMessage,
    originalInput: {
      email: "",
      password: "",
    },
    errors: [],
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
    errorMessage: "",
    originalInput: {
      email: "",
      password: "",
      confirmPassword: "",
    },
    errors: [],
  });
};

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.getResetPassword = async (req, res) => {
  res.render("auth/reset-password", {
    path: "/reset-password",
    pageTitle: "Reset Password",
    errorMessage: "",
    originalInput: {
      email: "",
    },
    errors: [],
  });
};

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.getNewPassword = async (req, res) => {
  const { token } = req.params;
  try {
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiration: {
        $gt: Date.now(),
      },
    });
    if (!user) {
      throw new Error("Reset password link has expired. Please request a new password reset.");
    }
    res.render("auth/new-password", {
      path: "/new-password",
      pageTitle: "Reset Password",
      errorMessage: "",
      userId: user._id.toString(),
      resetToken: token,
      originalInput: {
        password: "",
      },
      errors: [],
    });
  } catch (error) {
    req.flash("error", error.message);
    console.error(error);
    res.redirect("/login");
  }
};

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.postLogin = async (req, res) => {
  const { email, password } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorsArr = errors.array();
    const [{ msg: errorMsg }] = errorsArr;
    res.status(422).render("auth/login", {
      pageTitle: "Log In",
      path: "/auth/login",
      successMessage: "",
      errorMessage: errorMsg,
      originalInput: {
        email,
        password,
      },
      errors: errorsArr.map(({ param }) => param),
    });
    return false;
  }

  const loginErrors = [];
  try {
    const user = await User.findOne({ email });
    if (!user) {
      loginErrors.push("email");
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
      loginErrors.push("password");
      throw new Error("Email and password does not match.");
    }
  } catch (error) {
    res.status(422).render("auth/login", {
      pageTitle: "Log In",
      path: "/auth/login",
      successMessage: "",
      errorMessage: error.message,
      originalInput: {
        email,
        password,
      },
      errors: loginErrors,
    });
    console.error(error);
  }
  return true;
};

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.postSignup = async (req, res) => {
  const { email, password } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorsArr = errors.array();
    const [{ msg: errorMessage }] = errorsArr;
    return res.status(422).render("auth/signup", {
      path: "/signup",
      pageTitle: "Signup",
      errorMessage,
      originalInput: req.body,
      errors: errorsArr.map(({ param }) => param),
    });
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 12);
    await User.create({ email, password: hashedPassword });
    req.flash("success", "Account created successfully. Please log in.");
    res.redirect("/login");
  } catch (error) {
    console.error(error);
    req.flash("error", "Could not create new account. Please try again later.");
    res.redirect("/signup");
  }
  try {
    return transporter.sendMail({
      to: email,
      from: "no-reply@onlineshop.com",
      subject: "Signup succeeded",
      html: "<h1>You successfully signed up!</h1>",
    });
  } catch (error) {
    return console.error(error);
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

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.postResetPassword = async (req, res) => {
  const { email } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorsArr = errors.array();
    const [{ msg: errorMsg }] = errorsArr;
    res.status(422).render("auth/reset-password", {
      path: "/reset-password",
      pageTitle: "Reset Password",
      errorMessage: errorMsg,
      originalInput: {
        email,
      },
      errors: ["email"],
    });
    return false;
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error(
        "There's no account linked with email entered. Please verify email and try again."
      );
    }
    crypto.randomBytes(32, async (err, buffer) => {
      if (err) {
        throw new Error("Could not generate token. Please try again later.");
      }
      const ONE_HOUR_IN_MILLISECONDS = 3600000;
      const resetToken = buffer.toString("hex");
      user.resetToken = resetToken;
      user.resetTokenExpiration = Date.now() + ONE_HOUR_IN_MILLISECONDS;
      await user.save();

      transporter
        .sendMail({
          to: email,
          from: "no-reply@onlineshop.com",
          subject: "Password reset",
          html: `
            <p>To reset your password, click the link below or copy and paste the link into your browser location bar:</p>
            <p><a href="localhost:3000/reset-password/${resetToken}">localhost:3000/reset-password/${resetToken}</a></p>
            <p>This link will remain active for an hour.</p>
          `,
        })
        .then(() => {
          req.flash("success", "An email with instructions to reset your password has been sent.");
          res.redirect("/login");
        })
        .catch((error) => {
          console.error(error);
        });
    });
  } catch (err) {
    console.error(err);
    res.status(422).render("auth/reset-password", {
      path: "/reset-password",
      pageTitle: "Reset Password",
      errorMessage: err.message,
      originalInput: {
        email,
      },
      errors: ["email"],
    });
  }
  return true;
};

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.postNewPassword = async (req, res) => {
  const { userId, resetToken, password } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorsArr = errors.array();
    const [{ msg: errorMsg }] = errorsArr;
    res.status(422).render("auth/new-password", {
      path: "/new-password",
      pageTitle: "Reset Password",
      errorMessage: errorMsg,
      userId,
      resetToken,
      originalInput: {
        password,
      },
      errors: ["password"],
    });
    return false;
  }

  try {
    const user = await User.findOne({
      _id: userId,
      resetToken,
      resetTokenExpiration: {
        $gt: Date.now(),
      },
    });
    if (!user) {
      throw new Error("Reset password link has expired. Please request a new password reset.");
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    if (!hashedPassword) {
      throw new Error("Could not update password. Please try again later.");
    }
    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiration = undefined;
    await user.save();

    req.flash("success", "Password has been updated. You can now log in with the new password.");
    res.redirect("/login");
  } catch (error) {
    console.error(error);
    req.flash("error", error.message);
    res.redirect("/login");
  }
  return true;
};
