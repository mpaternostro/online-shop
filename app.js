require("dotenv").config();
const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const getPageNotFound = require("./controllers/error");
const User = require("./models/user");

const app = express();
const port = 3000;

app.set("view engine", "ejs");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use(async (req, res, next) => {
  let user;
  try {
    user = await User.findById(process.env.DB_USER);
  } catch (error) {
    console.error(error);
  }
  req.user = user;
  next();
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);

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
