const fs = require("fs");
const path = require("path");

const getProductsPath = () => {
  return path.join(
    path.dirname(process.mainModule.filename),
    "data",
    "products.json"
  );
};

const getProductsFromFile = (cb) => {
  fs.readFile(getProductsPath(), (err, fileContent) => {
    if (!err) {
      return cb(JSON.parse(fileContent));
    }
    return cb([]);
  });
};

module.exports = class Product {
  constructor(title, imageUrl, description, price) {
    this.title = title;
    this.imageUrl = imageUrl;
    this.description = description;
    this.price = price;
  }

  save() {
    getProductsFromFile((products) => {
      products.push(this);
      fs.writeFile(getProductsPath(), JSON.stringify(products), (err) => {
        console.log(err);
      });
    });
  }

  static fetchAll(cb) {
    getProductsFromFile(cb);
  }
};
