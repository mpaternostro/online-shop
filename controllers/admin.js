const { validationResult } = require("express-validator");
const ServerError = require("../error/server-error");

const Product = require("../models/product");
const { deleteFile } = require("../utils/file");
const { getTotalProducts, getPageProducts, getLastPage } = require("../utils/products");

exports.getAdminProducts = async (req, res, next) => {
  const currentPage = Number(req.query.page) || 1;
  try {
    const totalProducts = await getTotalProducts(req.user._id);
    const prods = await getPageProducts(currentPage, req.user._id);
    res.render("admin/products", {
      prods,
      pageTitle: "Admin Products",
      path: "/admin/products",
      currentPage,
      lastPage: getLastPage(totalProducts),
    });
  } catch (error) {
    next(new ServerError(error));
  }
};

exports.getAddProduct = (req, res) => {
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editing: false,
    product: {
      title: "",
      description: "",
      price: "",
    },
    errorMessages: [],
    errors: [],
  });
};

exports.postAddProduct = async (req, res, next) => {
  const productData = { ...req.body };
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorsArr = errors.array();
    res.status(422).render("admin/edit-product", {
      pageTitle: "Add Product",
      path: "/admin/add-product",
      editing: false,
      product: productData,
      errorMessages: errorsArr.map(({ msg }) => msg),
      errors: errorsArr.map(({ param }) => param),
    });
    return false;
  }
  if (!req.file) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Add Product",
      path: "/admin/add-product",
      editing: false,
      product: productData,
      errorMessages: ["Please enter a valid image."],
      errors: [],
    });
  }
  productData.userId = req.user;
  productData.imageUrl = req.file.path;
  try {
    const product = new Product({ ...productData });
    await product.save();
  } catch (error) {
    return next(new ServerError(error));
  }
  res.redirect("/admin/products");
  return true;
};

exports.getEditProduct = async (req, res, next) => {
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
    product = await Product.findOne({ _id: productId, userId: req.user._id });
    if (!product) {
      const error = new Error(
        "Product does not exists or user has no editing access to this resource."
      );
      error.code = "PRODUCTNOTFOUND";
      throw error;
    }
  } catch (error) {
    if (error.code !== "PRODUCTNOTFOUND") {
      return next(new ServerError(error));
    }
  }

  if (!product) {
    res.status(404);
  }
  return res.render("admin/edit-product", {
    pageTitle: product ? "Edit Product" : "Product not found",
    path: "/admin/edit-product",
    editing: true,
    product,
    errorMessages: [],
    errors: [],
  });
};

exports.postEditProduct = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorsArr = errors.array();
    res.status(422).render("admin/edit-product", {
      pageTitle: "Edit Product",
      path: `/admin/edit-product/${req.body.id}`,
      editing: true,
      errorMessages: errorsArr.map(({ msg }) => msg),
      product: { ...req.body, _id: req.body.id },
      errors: errorsArr.map(({ param }) => param),
    });
    return false;
  }
  try {
    const product = await Product.findOne({ _id: req.body.id, userId: req.user._id });
    if (!product) {
      const error = new Error(
        "Product does not exists or user has no editing access to this resource."
      );
      error.code = "PRODUCTNOTFOUND";
      throw error;
    }
    product.title = req.body.title;
    if (req.file) {
      deleteFile(product.imageUrl);
      product.imageUrl = req.file.path;
    }
    product.description = req.body.description;
    product.price = req.body.price;
    await product.save();
    res.redirect("/admin/products");
  } catch (error) {
    if (error.code === "PRODUCTNOTFOUND") {
      return res.redirect("/admin/products");
    }
    res.status(422).render("admin/edit-product", {
      pageTitle: "Edit Product",
      path: `/admin/edit-product/${req.body.id}`,
      editing: true,
      errorMessages: ["Internal Server Error"],
      product: { ...req.body, _id: req.body.id },
      errors: [],
    });
  }
  return true;
};

exports.deleteProduct = async (req, res) => {
  const { productId } = req.params;
  try {
    const product = await Product.findOne({ _id: productId, userId: req.user._id });
    if (!product) {
      const error = new Error("Could not find the requested product.");
      error.code = "PRODUCTNOTFOUND";
    }
    deleteFile(product.imageUrl);
    await product.delete();
    res.status(200).json({ message: "Success!" });
  } catch (error) {
    if (error.code === "PRODUCTNOTFOUND") {
      res.status(500).json({ message: error });
    } else {
      res.status(500).json({ message: "Failed to delete product." });
    }
  }
};
