module.exports = (app) => {
  const shelves = require("../controllers/shelf.controller.js");
  const { authJwt } = require("../middleware/");

  let router = require("express").Router();

  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  router.post("/", [authJwt.verifyToken], shelves.create);

  router.get("/", [authJwt.verifyToken], shelves.findAll);

  router.get("/:id", [authJwt.verifyToken], shelves.findOne);

  router.put("/:id", [authJwt.verifyToken], shelves.update);

  router.delete("/:id", [authJwt.verifyToken], shelves.delete);

  router.delete("/", [authJwt.verifyToken], shelves.deleteAll);

  app.use("/api/shelves", router);
};
