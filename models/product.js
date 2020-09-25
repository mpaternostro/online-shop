const { ObjectId } = require("mongodb");

const { getDb } = require("../utils/database");

class Product {
  constructor({ title, imageUrl, description, price, id, userId }) {
    this.title = title;
    this.imageUrl = imageUrl;
    this.description = description;
    this.price = price;
    this._id = id ? new ObjectId(id) : null;
    this.userId = userId;
  }

  async save() {
    const db = getDb();
    if (this._id) {
      const query = { _id: this._id };
      return db.collection("products").updateOne(query, { $set: this });
    }
    return db.collection("products").insertOne(this);
  }

  static fetchAll() {
    const db = getDb();
    return db.collection("products").find().toArray();
  }

  static findById(productId) {
    const db = getDb();
    const query = { _id: new ObjectId(productId) };
    return db.collection("products").find(query).next();
  }

  static deleteById(productId) {
    const db = getDb();
    const query = { _id: new ObjectId(productId) };
    return db.collection("products").deleteOne(query);
  }
}

module.exports = Product;
