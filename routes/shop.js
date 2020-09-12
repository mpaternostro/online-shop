const express = require("express");

const {
  getIndex,
  getProducts,
  getProduct,
  getOrders,
  getCart,
  postCart,
  postCartDeleteProduct,
  postOrder,
} = require("../controllers/shop");

const router = express.Router();

router.get("/", getIndex);

router.get("/products", getProducts);

router.get("/products/:productId", getProduct);

router.get("/orders", getOrders);

router.get("/cart", getCart);

router.post("/cart", postCart);

router.post("/cart-delete-product", postCartDeleteProduct);

router.post("/create-order", postOrder);

module.exports = router;
