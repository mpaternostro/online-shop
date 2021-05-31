require("dotenv").config();
const path = require("path");
const fs = require("fs");

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const csrf = require("csurf");
const flash = require("connect-flash");
const multer = require("multer");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");

const {
  handlePageNotFound,
  handleUnauthorizedError,
  handleForbiddenError,
  handleServerError,
} = require("./controllers/error");
const User = require("./models/user");

const app = express();
const port = 3000;
const store = new MongoDBStore({
  uri: process.env.MONGO_DB_URI,
  collection: "sessions",
});
const csrfProtection = csrf();

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "images/");
  },
  filename(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const fileFilter = (req, file, cb) => {
  switch (file.mimetype) {
    case "image/png":
    case "image/jpg":
    case "image/jpeg":
      cb(null, true);
      break;
    default:
      cb(null, false);
      break;
  }
};

app.set("view engine", "ejs");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(multer({ storage, fileFilter }).single("image"));
app.use(compression());
app.use(express.static(path.join(__dirname, "public")));
app.use("/images/", express.static(path.join(__dirname, "images")));
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

app.use(helmet());

const accessLogStream = fs.createWriteStream(path.join(__dirname, "access.log"), { flags: "a" });

app.use(
  morgan("combined", {
    stream: accessLogStream,
  })
);

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(handleUnauthorizedError);
app.use(handleForbiddenError);
app.use(handleServerError);
app.use(handlePageNotFound);

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
