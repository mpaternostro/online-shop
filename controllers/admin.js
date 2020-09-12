const Product = require("../models/product");

exports.getAdminProducts = async (req, res) => {
  let prods;
  try {
    prods = await req.user.getProducts();
  } catch (error) {
    console.error(error);
  }
  res.render("admin/products", {
    prods,
    pageTitle: "Admin Products",
    path: "/admin/products",
  });
};

exports.getAddProduct = (req, res) => {
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editing: false,
  });
};

exports.postAddProduct = async (req, res) => {
  const { title, imageUrl, description, price } = req.body;
  try {
    await req.user.createProduct({ title, imageUrl, description, price });
  } catch (error) {
    console.error(error);
  }
  res.redirect("/admin/products");
};

exports.getEditProduct = async (req, res) => {
  const { productId } = req.params;
  let product;
  try {
    [product] = await req.user.getProducts({ where: { id: productId } });
  } catch (error) {
    console.error(error);
  }
  res.render("admin/edit-product", {
    pageTitle: "Edit Product",
    path: "/admin/edit-product",
    product,
    editing: true,
  });
};

exports.postEditProduct = async (req, res) => {
  const { title, imageUrl, description, price, id } = req.body;
  try {
    await Product.upsert({ id, title, imageUrl, description, price });
  } catch (error) {
    console.error(error);
  }
  res.redirect("/admin/products");
};

exports.postDeleteProduct = async (req, res) => {
  const { productId } = req.body;
  try {
    await Product.destroy({
      where: {
        id: productId,
      },
    });
  } catch (error) {
    console.error(error);
  }
  res.redirect("/admin/products");
};
