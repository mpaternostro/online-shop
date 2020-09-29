const { Schema, model } = require("mongoose");

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  cart: {
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        qty: {
          type: Number,
          required: true,
        },
      },
    ],
  },
});

userSchema.methods.addToCart = function addToCart(product) {
  let updatedCartItems;
  const existingProductIndex = this.cart.items.findIndex(
    (item) => item.productId.toString() === product._id.toString()
  );

  if (existingProductIndex >= 0) {
    updatedCartItems = [...this.cart.items];
    updatedCartItems[existingProductIndex].qty += 1;
  } else {
    updatedCartItems = [...this.cart.items, { productId: product._id, qty: 1 }];
  }

  this.cart.items = updatedCartItems;
  return this.save();
};

userSchema.methods.getCartProducts = async function getCartProducts() {
  const populatedUser = await this.populate("cart.items.productId", "title").execPopulate();
  const items = populatedUser.cart.items.filter((item) => item.productId !== null);

  if (this.cart.items.length !== items.length) {
    const updatedItems = this.cart.items.filter(({ productId }) => Boolean(productId));
    this.cart.items = updatedItems;
    await this.save();
  }

  return items;
};

userSchema.methods.getOrders = async function getOrders() {
  const populatedUser = await this.populate("orders.productId", "title").execPopulate();

  return populatedUser;
};

userSchema.methods.deleteCartProduct = function deleteCartProduct(productId) {
  const updatedCartItems = this.cart.items.filter(
    (item) => item.productId.toString() !== productId.toString()
  );
  this.cart.items = updatedCartItems;
  return this.save();
};

userSchema.methods.clearCart = function clearCart() {
  this.cart.items = [];
  return this.save();
};

module.exports = model("User", userSchema);
