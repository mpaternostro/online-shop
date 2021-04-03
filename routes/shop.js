const express = require("express");

const {
  getIndex,
  getProducts,
  getProduct,
  getOrders,
  getInvoice,
  getCart,
  postCart,
  postCartDeleteProduct,
  postOrder,
} = require("../controllers/shop");
const isAuth = require("../middlewares/is-auth");

const router = express.Router();

router.get("/", getIndex);

router.get("/products", getProducts);

router.get("/products/:productId", getProduct);

router.get("/orders", isAuth, getOrders);

router.get("/orders/:orderId", isAuth, getInvoice);

router.get("/cart", isAuth, getCart);

router.post("/cart", isAuth, postCart);

router.post("/cart-delete-product", isAuth, postCartDeleteProduct);

router.post("/create-order", isAuth, postOrder);

module.exports = router;
