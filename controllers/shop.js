const Product = require("../models/product");
const Cart = require("../models/cart");

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

exports.getProduct = (req, res, next) => {
  const { productId } = req.params;
  console.log("la puta madre");
  // console.log(productId);
  Product.findById(productId, (product) => {
    console.log(product);
    res.render("shop/product-detail", {
      product,
      pageTitle: product.title,
      path: `/products`,
    });
  });
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
  Cart.getCart(({ products: cartProducts }) => {
    Product.fetchAll((products) => {
      const cartItems = [];
      for (let product of products) {
        for (let cartProduct of cartProducts) {
          if (product.id === cartProduct.id)
            cartItems.push({ ...product, qty: cartProduct.qty });
        }
      }
      res.render("shop/cart", {
        products: cartItems,
        pageTitle: "Your Cart",
        path: "/cart",
      });
    });
  });
};

exports.postCart = (req, res, next) => {
  const { productId } = req.body;
  Product.findById(productId, ({ price }) =>
    Cart.add(productId, price, () => res.redirect("/cart"))
  );
};

exports.postCartDeleteProduct = (req, res, next) => {
  const { productId } = req.body;
  Product.findById(productId, ({ price }) => {
    Cart.deleteById(productId, price);
    res.redirect("/cart");
  });
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
