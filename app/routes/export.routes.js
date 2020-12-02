"use strict";
module.exports = (app) => {
  const _exports = require("../controllers/export.controller.js");

  let router = require("express").Router();

  router.post("/", _exports.create);

  router.get("/", _exports.findAll);

  router.get("/:id", _exports.findOne);

  router.put("/:id", _exports.update);

  router.delete("/:id", _exports.delete);

  app.use("/api/exports", router);
};
