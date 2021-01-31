const crypto = require("crypto");

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
    const [errorMessage] = req.flash("error");
    res.render("auth/new-password", {
      path: "/new-password",
      pageTitle: "Reset Password",
      errorMessage,
      userId: user._id.toString(),
      resetToken: token,
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

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.postResetPassword = async (req, res) => {
  const { email } = req.body;
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
    req.flash("error", err.message);
    res.redirect("/reset-password");
  }
};

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.postNewPassword = async (req, res) => {
  const { userId, resetToken, password } = req.body;
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
};
