module.exports = (app) => {
  const categories = require("../controllers/category.controller.js");
  const { authJwt } = require("../middleware/");

  let router = require("express").Router();

  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  router.post("/", [authJwt.verifyToken], categories.create);

  router.get("/", [authJwt.verifyToken], categories.findAll);

  router.get("/:id", [authJwt.verifyToken], categories.findOne);

  router.put("/:id", [authJwt.verifyToken], categories.update);

  router.delete("/:id", [authJwt.verifyToken], categories.delete);

  app.use("/api/categories", router);
};
