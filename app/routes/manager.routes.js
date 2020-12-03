"use strict";
module.exports = (app) => {
  const managers = require("../controllers/manager.controller.js");

  let router = require("express").Router();

  router.post("/", managers.create);

  router.get("/", managers.findAll);

  router.get("/:id", managers.findOne);

  router.put("/:id", managers.update);

  router.delete("/:id", managers.delete);

  app.use("/api/managers", router);
};
