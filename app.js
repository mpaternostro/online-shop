require("dotenv").config();
const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);

const getPageNotFound = require("./controllers/error");
const User = require("./models/user");

const app = express();
const port = 3000;
const store = new MongoDBStore({
  uri: process.env.MONGO_DB_URI,
  collection: "sessions",
});

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

app.use(async (req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  let user;
  try {
    user = await User.findById(req.session.user._id);
  } catch (error) {
    console.error(error);
  }
  req.user = user;
  return next();
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(getPageNotFound);

(() => {
  return mongoose.connect(
    process.env.MONGO_DB_URI,
    { useUnifiedTopology: true, useNewUrlParser: true },
    async () => {
      let user;
      try {
        user = await User.findOne();
        if (!user) {
          user = new User({
            name: "Test",
            email: "test@test.com",
            cart: {
              items: [],
            },
          });
          await user.save();
        }
      } catch (error) {
        console.error(error);
      }
      app.listen(port, async () => {
        console.log(`Server listening at http://localhost:${port}`);
      });
    }
  );
})();
