const Product = require("../models/product");

exports.getAdminProducts = async (req, res) => {
  let prods;
  try {
    prods = await Product.find();
  } catch (error) {
    console.error(error);
  }
  res.render("admin/products", {
    prods,
    pageTitle: "Admin Products",
    path: "/admin/products",
    isAuthenticated: req.session.isLoggedIn,
  });
};

exports.getAddProduct = (req, res) => {
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editing: false,
    isAuthenticated: req.session.isLoggedIn,
  });
};

exports.postAddProduct = async (req, res) => {
  const productData = Object.assign(req.body);
  productData.userId = req.session.user;
  try {
    const product = new Product(productData);
    await product.save();
  } catch (error) {
    console.error(error);
  }
  res.redirect("/admin/products");
};

exports.getEditProduct = async (req, res) => {
  const { productId } = req.params;
  let product;
  try {
    product = await Product.findById(productId);
  } catch (error) {
    console.error(error);
  }
  res.render("admin/edit-product", {
    pageTitle: "Edit Product",
    path: "/admin/edit-product",
    product,
    editing: true,
    isAuthenticated: req.session.isLoggedIn,
  });
};

exports.postEditProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.body.id);
    product.title = req.body.title;
    product.imageUrl = req.body.imageUrl;
    product.description = req.body.description;
    product.price = req.body.price;
    await product.save();
  } catch (error) {
    console.error(error);
  }
  res.redirect("/admin/products");
};

exports.postDeleteProduct = async (req, res) => {
  const { productId } = req.body;
  try {
    await Product.findByIdAndDelete(productId);
  } catch (error) {
    console.error(error);
  }
  res.redirect("/admin/products");
};
