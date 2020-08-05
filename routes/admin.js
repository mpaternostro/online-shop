const path = require("path");

const express = require("express");

const {
  getAdminProducts,
  getAddProduct,
  postAddProduct,
  getEditProduct,
  postEditProduct,
  postDeleteProduct,
} = require("../controllers/admin");

const router = express.Router();

// /admin/products => GET
router.get("/products", getAdminProducts);

// /admin/add-product => GET
router.get("/add-product", getAddProduct);

// /admin/add-product => POST
router.post("/add-product", postAddProduct);

// /admin/edit-product/12345 => GET
router.get("/edit-product/:productId", getEditProduct);

// /admin/edit-product/12345 => POST
router.post("/edit-product", postEditProduct);

// /admin/delete-product/12345 => POST
router.post("/delete-product", postDeleteProduct);

module.exports = router;
