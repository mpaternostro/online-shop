require("dotenv").config();
const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const csrf = require("csurf");
const flash = require("connect-flash");

const { getPageNotFound, getForbidden, getInternalServerError } = require("./controllers/error");
const User = require("./models/user");

const app = express();
const port = 3000;
const store = new MongoDBStore({
  uri: process.env.MONGO_DB_URI,
  collection: "sessions",
});
const csrfProtection = csrf();

app.set("view engine", "ejs");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({ secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: false, store })
);

app.use(csrfProtection);
app.use(flash());

app.use(async (req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  let user;
  try {
    user = await User.findById(req.session.user._id);
    if (!user) {
      return next();
    }
  } catch (error) {
    throw new Error();
  }
  req.user = user;
  return next();
});

app.use((req, res, next) => {
  app.locals.isAuthenticated = req.session.isLoggedIn;
  app.locals.csrfToken = req.csrfToken();
  next();
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.get("/500", getInternalServerError);
app.use(getForbidden);
app.use(getPageNotFound);

(() => {
  return mongoose.connect(
    process.env.MONGO_DB_URI,
    { useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true },
    async () => {
      app.listen(port, async () => {
        console.log(`Server listening at http://localhost:${port}`);
      });
    }
  );
})();
