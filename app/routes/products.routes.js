"use strict"
module.exports = app => {
  const products = require("../controllers/product.controller.js");

  var router = require("express").Router();

  router.post("/", products.create);

  router.get("/", products.findAll);

  router.get("/published", products.findAllPublished);

  router.get("/:id", products.findOne);

  router.put("/:id", products.update);

  router.delete("/:id", products.delete);

  router.delete("/", products.deleteAll);

  app.use('/api/products', router);
};
