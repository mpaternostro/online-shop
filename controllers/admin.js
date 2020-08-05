const Product = require("../models/product");

exports.getAdminProducts = (req, res, next) => {
  Product.fetchAll((products) =>
    res.render("admin/products", {
      prods: products,
      pageTitle: "Admin Products",
      path: "/admin/products",
    })
  );
};

exports.getAddProduct = (req, res, next) => {
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editing: false,
  });
};

exports.postAddProduct = (req, res, next) => {
  const { title, imageUrl, description, price } = req.body;
  const product = new Product(title, imageUrl, description, price);
  product.save(() => res.redirect("/admin/products"));
};

exports.getEditProduct = (req, res, next) => {
  const { productId } = req.params;
  Product.findById(productId, (product) =>
    res.render("admin/edit-product", {
      pageTitle: "Edit Product",
      path: "/admin/edit-product",
      product,
      editing: true,
    })
  );
};

exports.postEditProduct = (req, res, next) => {
  const { title, imageUrl, description, price, id } = req.body;
  const product = new Product(title, imageUrl, description, price, id);
  product.save();
  res.redirect("/admin/products");
};

exports.postDeleteProduct = (req, res, next) => {
  const { productId } = req.body;
  Product.deleteById(productId);
  res.redirect("/admin/products");
};
