const fs = require("fs");
const path = require("path");

const Cart = require("./cart");

const getProductsPath = path.join(
  path.dirname(process.mainModule.filename),
  "data",
  "products.json"
);

const getProductsFromFile = (cb) => {
  fs.readFile(getProductsPath, (err, fileContent) => {
    if (!err) {
      return cb(JSON.parse(fileContent));
    }
    return cb([]);
  });
};

module.exports = class Product {
  constructor(title, imageUrl, description, price, id = undefined) {
    this.title = title;
    this.imageUrl = imageUrl;
    this.description = description;
    this.price = price;
    this.id = id;
  }

  save(cb) {
    getProductsFromFile((products) => {
      let newProducts;
      if (this.id) {
        newProducts = products.map((prod) => {
          if (prod.id === this.id) return this;
          return prod;
        });
      } else {
        this.id = Math.random().toString();
        newProducts = [...products, this];
      }

      fs.writeFile(getProductsPath, JSON.stringify(newProducts), (err) => {
        console.log(err);
        cb();
      });
    });
  }

  static fetchAll(cb) {
    getProductsFromFile(cb);
  }

  static findById(id, cb) {
    getProductsFromFile((products) => {
      const product = products.find((prod) => prod.id === id);
      cb(product);
    });
  }

  static deleteById(id, cb) {
    getProductsFromFile((products) => {
      const newProducts = products.filter((prod) => prod.id !== id);
      const { price } = products.find((prod) => prod.id === id);
      fs.writeFile(getProductsPath, JSON.stringify(newProducts), (err) => {
        if (!err) return Cart.deleteById(id, price);
        console.log(err);
      });
    });
  }
};
