const fs = require("fs");
const path = require("path");

const Product = require("../models/product");
const Order = require("../models/order");
const ServerError = require("../error/server-error");
const UnauthorizedError = require("../error/unauthorized-error");
const generateInvoice = require("../utils/invoice-generator");
const {
  getTotalProducts,
  getPageProducts,
  getLastPage,
  getTotalSum,
} = require("../utils/products");

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.getIndex = async (req, res, next) => {
  const currentPage = Number(req.query.page) || 1;
  try {
    const totalProducts = await getTotalProducts();
    const prods = await getPageProducts(currentPage);
    res.render("shop/index", {
      prods,
      pageTitle: "Online Shop",
      path: "/",
      currentPage,
      lastPage: getLastPage(totalProducts),
    });
  } catch (error) {
    next(new ServerError(error));
  }
};

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.getProducts = async (req, res, next) => {
  const currentPage = Number(req.query.page) || 1;
  try {
    const totalProducts = await getTotalProducts();
    const prods = await getPageProducts(currentPage);
    res.render("shop/product-list", {
      prods,
      pageTitle: "Product List",
      path: "/products",
      currentPage,
      lastPage: getLastPage(totalProducts),
    });
  } catch (error) {
    next(new ServerError(error));
  }
};

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.getProduct = async (req, res, next) => {
  const { productId } = req.params;
  let product;
  try {
    if (productId.length !== 24) {
      const error = new Error(
        "Product does not exists or user has no editing access to this resource."
      );
      error.code = "PRODUCTNOTFOUND";
      throw error;
    }
    product = await Product.findById(productId);
  } catch (error) {
    if (error.code !== "PRODUCTNOTFOUND") {
      return next(new ServerError(error));
    }
  }

  if (!product) {
    res.status(404);
  }
  return res.render("shop/product-detail", {
    product,
    pageTitle: product ? product.title : "Product not found",
    path: `/products`,
  });
};

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.getOrders = async (req, res, next) => {
  let orders;
  try {
    orders = await Order.find({ "user.userId": req.user._id });
  } catch (error) {
    return next(new ServerError(error));
  }

  return res.render("shop/orders", {
    orders,
    pageTitle: "Your Orders",
    path: "/orders",
  });
};

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.getInvoice = async (req, res, next) => {
  const { orderId } = req.params;
  try {
    if (orderId.length !== 24) {
      const error = new Error();
      error.code = "ORDERNOTFOUND";
      throw error;
    }
    const order = await Order.findById(orderId);
    if (!order) {
      const error = new Error();
      error.code = "ORDERNOTFOUND";
      throw error;
    } else if (order.user.userId.toString() !== req.user._id.toString()) {
      throw new UnauthorizedError();
    }
    const doc = generateInvoice(order);
    const invoiceName = `invoice-${orderId}.pdf`;
    const invoicePath = path.join("data", "invoices", invoiceName);
    doc.pipe(fs.createWriteStream(invoicePath));
    doc.pipe(res);
    doc.end();
  } catch (error) {
    if (error.code === "ORDERNOTFOUND") {
      next();
    } else if (error.code === 401) {
      next(error);
    } else {
      next(new ServerError());
    }
  }
};

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.getCart = async (req, res, next) => {
  let products;
  try {
    products = await req.user.getCartProducts();
  } catch (error) {
    return next(new ServerError(error));
  }

  return res.render("shop/cart", {
    products,
    pageTitle: "Your Cart",
    path: "/cart",
  });
};

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.getCheckout = async (req, res, next) => {
  try {
    const products = await req.user.getCartProducts();
    const totalSum = getTotalSum(products);
    res.render("shop/checkout", {
      products,
      totalSum,
      pageTitle: "Checkout",
      path: "/checkout",
    });
  } catch (error) {
    next(new ServerError(error));
  }
};

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.postCart = async (req, res, next) => {
  const { productId } = req.body;
  try {
    const product = await Product.findById(productId);
    await req.user.addToCart(product);
  } catch (error) {
    return next(new ServerError(error));
  }
  return res.redirect("/cart");
};

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.postCartDeleteProduct = async (req, res, next) => {
  const { productId } = req.body;
  try {
    await req.user.deleteCartProduct(productId);
  } catch (error) {
    return next(new ServerError(error));
  }
  return res.redirect("/cart");
};

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.postOrder = async (req, res, next) => {
  try {
    const products = await req.user.getCartProducts();
    const orderProducts = products.map((product) => {
      return {
        product: { ...product.productId._doc },
        qty: product.qty,
      };
    });
    const order = new Order({
      user: {
        email: req.user.email,
        userId: req.user,
      },
      products: orderProducts,
    });
    await order.save();
    await req.user.clearCart();
  } catch (error) {
    return next(new ServerError(error));
  }
  return res.redirect("/orders");
};
