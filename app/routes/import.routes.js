"use strict";
module.exports = (app) => {
  const _imports = require("../controllers/import.controller.js");

  let router = require("express").Router();

  router.post("/", _imports.create);

  router.get("/", _imports.findAll);

  router.get("/:id", _imports.findOne);

  router.put("/:id", _imports.update);

  router.delete("/:id", _imports.delete);

  app.use("/api/imports", router);
};
