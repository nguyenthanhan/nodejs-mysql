"use strict";
module.exports = (app) => {
  const suppliers = require("../controllers/supplier.controller.js");

  let router = require("express").Router();

  router.post("/", suppliers.create);

  router.get("/", suppliers.findAll);

  router.get("/:id", suppliers.findOne);

  router.put("/:id", suppliers.update);

  router.delete("/", suppliers.delete);

  app.use("/api/suppliers", router);
};
