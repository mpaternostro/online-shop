const Product = require("../models/product");

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.getIndex = async (req, res) => {
  let prods;
  try {
    prods = await Product.fetchAll();
  } catch (error) {
    console.error(error);
  }

  res.render("shop/index", {
    prods,
    pageTitle: "Online Shop",
    path: "/",
  });
};

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.getProducts = async (req, res) => {
  let prods;
  try {
    prods = await Product.fetchAll();
  } catch (error) {
    console.error(error);
  }

  res.render("shop/product-list", {
    prods,
    pageTitle: "Product List",
    path: "/products",
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
    pageTitle: product.title,
    path: `/products`,
  });
};

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.getOrders = async (req, res) => {
  let orders;
  try {
    orders = await req.user.getOrders();
  } catch (error) {
    console.error(error);
  }

  res.render("shop/orders", {
    orders,
    pageTitle: "Your Orders",
    path: "/orders",
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
  await req.user.addOrder();
  res.redirect("/orders");
};
