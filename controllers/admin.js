const Product = require("../models/product");

exports.getAdminProducts = async (req, res) => {
  let prods;
  try {
    prods = await Product.fetchAll();
  } catch (error) {
    console.error(error);
  }
  res.render("admin/products", {
    prods,
    pageTitle: "Admin Products",
    path: "/admin/products",
  });
};

exports.getAddProduct = (req, res) => {
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editing: false,
  });
};

exports.postAddProduct = async (req, res) => {
  const productData = Object.assign(req.body);
  req.body.userId = req.user._id;
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
  });
};

exports.postEditProduct = async (req, res) => {
  try {
    const product = new Product(req.body);
    product.save();
  } catch (error) {
    console.error(error);
  }
  res.redirect("/admin/products");
};

exports.postDeleteProduct = async (req, res) => {
  const { productId } = req.body;
  try {
    await Product.deleteById(productId);
  } catch (error) {
    console.error(error);
  }
  res.redirect("/admin/products");
};
