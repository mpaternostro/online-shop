const Product = require("../models/product");

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.getIndex = async (req, res) => {
  let prods;
  try {
    prods = await req.user.getProducts();
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
    prods = await req.user.getProducts();
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
    product = await Product.findByPk(productId);
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
    orders = await req.user.getOrders({ include: ["products"] });
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
  let cart;
  let products;
  try {
    cart = await req.user.getCart();
    products = await cart.getProducts();
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
  let product;
  let cart;
  let existingProduct;
  let newQuantity = 1;
  try {
    [product] = await req.user.getProducts({
      where: {
        id: productId,
      },
    });
    cart = await req.user.getCart();
    [existingProduct] = await cart.getProducts({
      where: {
        id: productId,
      },
    });
  } catch (error) {
    console.error(error);
  }

  if (existingProduct) {
    const previousQuantity = existingProduct.cartItem.quantity;
    newQuantity = previousQuantity + 1;
  }

  try {
    await cart.addProduct(product, {
      through: {
        quantity: newQuantity,
      },
    });
  } catch (error) {
    console.error(error);
  }

  res.redirect("/cart");
};

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.postCartDeleteProduct = async (req, res) => {
  const { productId } = req.body;
  let cart;
  let product;
  try {
    cart = await req.user.getCart();
    [product] = await cart.getProducts({
      where: {
        id: productId,
      },
    });
    await product.cartItem.destroy();
  } catch (error) {
    console.error(error);
  }

  res.redirect("/cart");
};

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.postOrder = async (req, res) => {
  let cart;
  let cartItems;
  let order;

  try {
    cart = await req.user.getCart();
    cartItems = await cart.getProducts();
    order = await req.user.createOrder();
    await order.addProducts(
      cartItems.map((item) => {
        const newItem = Object.assign(item);
        newItem.orderItem = { quantity: item.cartItem.quantity };
        return newItem;
      })
    );
    await cart.removeProducts(cartItems);
  } catch (error) {
    console.error(error);
  }

  res.redirect("/orders");
};
