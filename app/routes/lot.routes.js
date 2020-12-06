module.exports = (app) => {
  const lots = require("../controllers/lot.controller.js");
  const { authJwt } = require("../middleware/");

  let router = require("express").Router();

  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  router.post("/", [authJwt.verifyToken], lots.create);

  router.get("/", [authJwt.verifyToken], lots.findAll);

  router.get("/:id", [authJwt.verifyToken], lots.findOne);

  router.put("/:id", [authJwt.verifyToken], lots.update);

  router.delete("/:id", [authJwt.verifyToken], lots.delete);

  app.use("/api/lots", router);
};
