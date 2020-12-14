module.exports = (app) => {
  const discount = require("../controllers/discount.controller.js");
  const { authJwt } = require("../middleware/");

  let router = require("express").Router();

  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  router.post("/", [authJwt.verifyToken], discount.create);

  router.put("/", [authJwt.verifyToken], discount.update);

  app.use("/api/discounts", router);
};
