/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */

exports.getPageNotFound = (req, res) => {
  return res.status(404).render("errors/404", {
    pageTitle: "Page Not Found",
    path: "",
  });
};

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */

exports.getForbidden = (err, req, res, next) => {
  if (err.code !== "EBADCSRFTOKEN") return next(err);
  return res.status(403).render("errors/403", {
    pageTitle: "Forbidden",
    path: "",
  });
};
