const fs = require("fs");
const path = require("path");

const getCartPath = path.join(
  path.dirname(process.mainModule.filename),
  "data",
  "cart.json"
);

module.exports = class Cart {
  static add(id, productPrice, cb) {
    fs.readFile(getCartPath, (err, fileContent) => {
      let cart = { totalPrice: 0, products: [] };
      if (!err) {
        cart = JSON.parse(fileContent);
      }
      cart.totalPrice += Number(productPrice);

      const existingProduct = cart.products.find((prod) => prod.id === id);
      if (existingProduct) {
        cart.products = cart.products.map((prod) => {
          if (prod.id === id) return { ...prod, qty: prod.qty + 1 };
          return prod;
        });
      } else {
        cart.products.push({ id, productPrice, qty: 1 });
      }

      fs.writeFile(getCartPath, JSON.stringify(cart), (err) =>
        console.log(err)
      );
      cb();
    });
  }

  static deleteById(id, productPrice) {
    fs.readFile(getCartPath, (err, fileContent) => {
      if (err) return;
      const newCart = { ...JSON.parse(fileContent) };
      const product = newCart.products.find((prod) => prod.id === id);
      if (!product) return;
      newCart.products = newCart.products.filter((prod) => prod.id !== id);
      newCart.totalPrice -= productPrice * product.qty;

      fs.writeFile(getCartPath, JSON.stringify(newCart), (err) => {
        console.log(err);
      });
    });
  }

  static getCart(cb) {
    fs.readFile(getCartPath, (err, fileContent) => {
      if (!err) return cb(JSON.parse(fileContent));
      return cb({ products: [] });
    });
  }
};
