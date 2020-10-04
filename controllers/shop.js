const Product = require("../models/product");
const Order = require("../models/order");

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.getIndex = async (req, res) => {
  let prods;
  try {
    prods = await Product.find();
  } catch (error) {
    console.error(error);
  }

  res.render("shop/index", {
    prods,
    pageTitle: "Online Shop",
    path: "/",
    isAuthenticated: req.session.isLoggedIn,
  });
};

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.getProducts = async (req, res) => {
  let prods;
  try {
    prods = await Product.find();
  } catch (error) {
    console.error(error);
  }

  res.render("shop/product-list", {
    prods,
    pageTitle: "Product List",
    path: "/products",
    isAuthenticated: req.session.isLoggedIn,
  });
};

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.getProduct = async (req, res) => {
  const { productId } = req.params;
  let product;
  try {
    product = await Product.findById(productId);
  } catch (error) {
    console.error(error);
  }

  res.render("shop/product-detail", {
    product,
    pageTitle: product ? product.title : "Product not found",
    path: `/products`,
    isAuthenticated: req.session.isLoggedIn,
  });
};

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.getOrders = async (req, res) => {
  let orders;
  try {
    orders = await Order.find({ userId: req.user._id });
  } catch (error) {
    console.error(error);
  }

  res.render("shop/orders", {
    orders,
    pageTitle: "Your Orders",
    path: "/orders",
    isAuthenticated: req.session.isLoggedIn,
  });
};

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.getCart = async (req, res) => {
  let products;
  try {
    products = await req.user.getCartProducts();
  } catch (error) {
    console.error(error);
  }

  res.render("shop/cart", {
    products,
    pageTitle: "Your Cart",
    path: "/cart",
    isAuthenticated: req.session.isLoggedIn,
  });
};

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.postCart = async (req, res) => {
  const { productId } = req.body;
  const product = await Product.findById(productId);
  await req.user.addToCart(product);
  res.redirect("/cart");
};

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.postCartDeleteProduct = async (req, res) => {
  const { productId } = req.body;
  await req.user.deleteCartProduct(productId);
  res.redirect("/cart");
};

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.postOrder = async (req, res) => {
  try {
    const products = await req.user.getCartProducts();
    const orderProducts = products.map((product) => {
      return {
        product: { ...product.productId._doc },
        qty: product.qty,
      };
    });
    const order = new Order({ userId: req.user, products: orderProducts });
    await order.save();
    await req.user.clearCart();
  } catch (error) {
    console.error(error);
  }
  res.redirect("/orders");
};
