const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const { mongoConnect } = require("./utils/database");

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
  const user = await User.findById("5f6cb7dc70b29035f4ef0cf1");
  req.user = new User(user);
  next();
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);

app.use(getPageNotFound);

mongoConnect(() => {
  app.listen(port, async () => {
    console.log(`Server listening at http://localhost:${port}`);
  });
});
