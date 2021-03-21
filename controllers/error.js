/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */

exports.handlePageNotFound = (req, res) => {
  return res.status(404).render("errors/404", {
    pageTitle: "Page Not Found",
    path: "/404",
  });
};

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */

exports.handleForbiddenError = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }
  if (err.code !== "EBADCSRFTOKEN") return next(err);
  return res.status(403).render("errors/403", {
    pageTitle: "Forbidden",
    path: "/403",
  });
};

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */

exports.handleServerError = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }
  if (err.code !== 500) return next(err);
  return res.status(500).render("errors/500", {
    pageTitle: "Internal Server Error",
    path: "/500",
  });
};
