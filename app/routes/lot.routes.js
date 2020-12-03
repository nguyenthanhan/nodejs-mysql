"use strict";
module.exports = (app) => {
  const lots = require("../controllers/lot.controller.js");

  let router = require("express").Router();

  router.post("/", lots.create);

  router.get("/", lots.findAll);

  router.get("/:id", lots.findOne);

  router.put("/:id", lots.update);

  router.delete("/:id", lots.delete);

  app.use("/api/lots", router);
};
