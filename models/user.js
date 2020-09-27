// const { ObjectId } = require("mongodb");

// const { getDb } = require("../utils/database");

// class User {
//   constructor({ name, email, cart, _id }) {
//     this.name = name;
//     this.email = email;
//     this.cart = cart;
//     this._id = _id;
//   }

//   save() {
//     const db = getDb();
//     return db.collection("users").insertOne(this);
//   }

//   static findById(userId) {
//     const db = getDb();
//     const query = { _id: new ObjectId(userId) };
//     return db.collection("users").findOne(query);
//   }

//   getOrders() {
//     const db = getDb();
//     const query = { "user._id": this._id };
//     return db.collection("orders").find(query).toArray();
//   }

//   async getCartProducts() {
//     const db = getDb();
//     const productsIds = this.cart.items.map((item) => item.productId);
//     const query = { _id: { $in: productsIds } };
//     const products = await db.collection("products").find(query).toArray();

//     if (products.length !== productsIds.length) {
//       const updatedItems = this.cart.items.filter(({ productId }) =>
//         products.some((product) => product._id.toString() === productId.toString())
//       );
//       await db
//         .collection("users")
//         .updateOne({ _id: this._id }, { $set: { cart: { items: updatedItems } } });
//     }

//     return products.map((product) => {
//       return {
//         ...product,
//         qty: this.cart.items.find((item) => item.productId.toString() === product._id.toString())
//           .qty,
//       };
//     });
//   }

//   addToCart(product) {
//     const db = getDb();
//     const query = { _id: this._id };
//     let updatedCartItems;
//     const existingProductIndex = this.cart.items.findIndex(
//       (item) => item.productId.toString() === product._id.toString()
//     );

//     if (existingProductIndex >= 0) {
//       updatedCartItems = Array.from(this.cart.items);
//       updatedCartItems[existingProductIndex] = { ...this.cart.items[existingProductIndex] };
//       updatedCartItems[existingProductIndex].qty += 1;
//     } else {
//       updatedCartItems = [...this.cart.items, { productId: product._id, qty: 1 }];
//     }

//     return db.collection("users").updateOne(query, { $set: { cart: { items: updatedCartItems } } });
//   }

//   deleteCartProduct(productId) {
//     const db = getDb();
//     const query = { _id: this._id };
//     const updatedCartItems = this.cart.items.filter(
//       (item) => item.productId.toString() !== productId.toString()
//     );
//     return db.collection("users").updateOne(query, { $set: { cart: { items: updatedCartItems } } });
//   }

//   async addOrder() {
//     const db = getDb();
//     const orders = {
//       user: {
//         _id: this._id,
//         name: this.name,
//       },
//       products: await this.getCartProducts(),
//     };
//     await db.collection("orders").insertOne(orders);

//     const query = { _id: this._id };
//     await db.collection("users").updateOne(query, { $set: { cart: { items: [] } } });
//   }
// }

// module.exports = User;
