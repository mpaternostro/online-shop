const Product = require("../models/product");

exports.getAdminProducts = async (req, res) => {
  let prods;
  try {
    prods = await Product.find({ userId: req.user._id });
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
  productData.userId = req.user;
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
    product = await Product.findOne({ _id: productId, userId: req.user._id });
    if (!product) {
      throw new Error("Product does not exists or user has no editing access to this resource.");
    }
    res.render("admin/edit-product", {
      pageTitle: "Edit Product",
      path: "/admin/edit-product",
      product,
      editing: true,
    });
  } catch (error) {
    console.error(error);
    res.redirect("/");
  }
};

exports.postEditProduct = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.body.id, userId: req.user._id });
    if (!product) {
      throw new Error("Could not update the requested product");
    }
    product.title = req.body.title;
    product.imageUrl = req.body.imageUrl;
    product.description = req.body.description;
    product.price = req.body.price;
    await product.save();
    res.redirect("/admin/products");
  } catch (error) {
    console.error(error);
    res.redirect("/");
  }
};

exports.postDeleteProduct = async (req, res) => {
  const { productId } = req.body;
  try {
    const product = await Product.findOneAndDelete({ _id: productId, userId: req.user._id });
    if (!product) {
      throw new Error("Could not delete the requested product");
    }
    res.redirect("/admin/products");
  } catch (error) {
    console.error(error);
    res.redirect("/");
  }
};
