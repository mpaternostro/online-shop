const Product = require("../models/product");
const { ITEMS_PER_PAGE } = require("../constants");

/**
 * @param {import("mongoose").Schema.Types.ObjectId}[userId] - userId
 */
async function getTotalProducts(userId) {
  if (userId) {
    return Product.find({ userId }).countDocuments();
  }
  return Product.find().countDocuments();
}

/**
 * @param {Number} page
 * @param {import("mongoose").Schema.Types.ObjectId}[userId] - userId
 */
async function getPageProducts(page, userId) {
  const skipDocs = ITEMS_PER_PAGE * (page - 1);
  if (userId) {
    return Product.find({ userId }).skip(skipDocs).limit(ITEMS_PER_PAGE);
  }
  return Product.find().skip(skipDocs).limit(ITEMS_PER_PAGE);
}

/**
 * @param {Number} totalProducts
 */
function getLastPage(totalProducts) {
  return Math.ceil(totalProducts / ITEMS_PER_PAGE);
}

/**
 * @param {Array} products
 * @returns {Number}
 */
function getTotalSum(products) {
  return products.reduce((accumulator, currentValue) => {
    const productTotalPrice = currentValue.qty * currentValue.productId.price;
    return accumulator + productTotalPrice;
  }, 0);
}

exports.getTotalProducts = getTotalProducts;
exports.getPageProducts = getPageProducts;
exports.getLastPage = getLastPage;
exports.getTotalSum = getTotalSum;
