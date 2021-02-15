const express = require("express");

const {
  getAdminProducts,
  getAddProduct,
  postAddProduct,
  getEditProduct,
  postEditProduct,
  postDeleteProduct,
} = require("../controllers/admin");
const isAuth = require("../middlewares/is-auth");
const editProduct = require("../validators/editProduct");

const router = express.Router();

// /admin/products => GET
router.get("/products", isAuth, getAdminProducts);

// /admin/add-product => GET
router.get("/add-product", isAuth, getAddProduct);

// /admin/add-product => POST
router.post("/add-product", isAuth, editProduct, postAddProduct);

// /admin/edit-product/12345 => GET
router.get("/edit-product/:productId", isAuth, getEditProduct);

// /admin/edit-product/12345 => POST
router.post("/edit-product/:productId", isAuth, editProduct, postEditProduct);

// /admin/delete-product/12345 => POST
router.post("/delete-product", isAuth, postDeleteProduct);

module.exports = router;
