const Product = require("../models/products");

exports.getIndex = (req, res, next) => {
  Product.fetchAll((products) =>
    res.render("shop/index", {
      prods: products,
      pageTitle: "Online Shop",
      path: "/",
    })
  );
};

exports.getProducts = (req, res, next) => {
  Product.fetchAll((products) =>
    res.render("shop/product-list", {
      prods: products,
      pageTitle: "Product List",
      path: "/products",
    })
  );
};

exports.getOrders = (req, res, next) => {
  Product.fetchAll((products) =>
    res.render("shop/orders", {
      prods: products,
      pageTitle: "Your Orders",
      path: "/orders",
    })
  );
};

exports.getCart = (req, res, next) => {
  Product.fetchAll((products) =>
    res.render("shop/cart", {
      prods: products,
      pageTitle: "Your Cart",
      path: "/cart",
    })
  );
};

exports.getCheckout = (req, res, next) => {
  Product.fetchAll((products) =>
    res.render("shop/checkout", {
      prods: products,
      pageTitle: "Checkout",
      path: "/shop/checkout",
    })
  );
};
