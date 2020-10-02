module.exports = (req, res) => {
  res.status(404).render("404", {
    pageTitle: "Page Not Found",
    path: "",
    isAuthenticated: req.session.isLoggedIn,
  });
};
