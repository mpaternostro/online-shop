const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");

const getPageNotFound = require("./controllers/error");
const sequelize = require("./utils/database");
const Product = require("./models/product");
const User = require("./models/user");
const Cart = require("./models/cart");
const CartItem = require("./models/cart-item");
const Order = require("./models/order");
const OrderItem = require("./models/order-item");

const app = express();
const port = 3000;

app.set("view engine", "ejs");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use(async (req, res, next) => {
  const user = await User.findByPk(1);
  req.user = user;
  next();
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);

app.use(getPageNotFound);

User.hasMany(Product, { onDelete: "CASCADE" });
Product.belongsTo(User);

User.hasOne(Cart);
Cart.belongsTo(User);

Cart.belongsToMany(Product, { through: CartItem });
Product.belongsToMany(Cart, { through: CartItem });

User.hasMany(Order);
Order.belongsTo(User);

Order.belongsToMany(Product, { through: OrderItem });
Product.belongsToMany(Order, { through: OrderItem });

sequelize
  .sync()
  .then(async () => {
    let user = await User.findByPk(1);
    if (!user) {
      user = await User.create({
        name: "Test",
        email: "test@test.com",
      });
    }
    let cart = await user.getCart();
    if (!cart) cart = await user.createCart();
    app.listen(port, () => console.log(`Server listening at http://localhost:${port}`));
  })
  .catch((err) => console.error(err));
