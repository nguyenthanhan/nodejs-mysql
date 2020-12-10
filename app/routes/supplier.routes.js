"use strict";
module.exports = (app) => {
  const suppliers = require("../controllers/supplier.controller.js");
  const { authJwt } = require("../middleware/");

  let router = require("express").Router();

  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  router.post("/", [authJwt.verifyToken], suppliers.create);

  router.get("/", [authJwt.verifyToken], suppliers.findAll);

  router.get("/:id", [authJwt.verifyToken], suppliers.findOne);

  router.put("/:id", [authJwt.verifyToken], suppliers.update);

  router.delete("/", [authJwt.verifyToken], suppliers.delete);

  app.use("/api/suppliers", router);
};
