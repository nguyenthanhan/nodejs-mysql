module.exports = (app) => {
  const uploadMulter = require("../models/multer.model");
  const products = require("../controllers/product.controller.js");
  const { authJwt } = require("../middleware/");

  let router = require("express").Router();

  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  router.post(
    "/",
    [authJwt.verifyToken],
    uploadMulter.single("image"),
    products.create
  );

  router.get("/", [authJwt.verifyToken], products.findAll);

  router.get("/:id", [authJwt.verifyToken], products.findOne);

  router.put(
    "/:id",
    [authJwt.verifyToken],
    uploadMulter.single("image"),
    products.update
  );

  router.delete("/", [authJwt.verifyToken], products.delete);

  // router.delete("/", [authJwt.verifyToken], products.deleteAll);

  app.use("/api/products", router);
};
