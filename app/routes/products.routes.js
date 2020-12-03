"use strict";
const uploadMulter = require("../models/multer.model");

module.exports = (app) => {
  const products = require("../controllers/product.controller.js");

  let router = require("express").Router();

  router.post("/", uploadMulter.single("image"), products.create);

  router.get("/", products.findAll);

  router.get("/:id", products.findOne);

  router.put("/:id", uploadMulter.single("image"), products.update);

  router.delete("/:id", products.delete);

  router.delete("/", products.deleteAll);

  app.use("/api/products", router);
};
