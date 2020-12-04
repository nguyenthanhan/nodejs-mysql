"use strict";
const uploadMulter = require("../models/multer.model");

module.exports = (app) => {
  const managers = require("../controllers/manager.controller.js");

  let router = require("express").Router();

  router.post("/", managers.create);

  router.get("/", managers.findAll);

  router.get("/:id", managers.findOne);

  router.put("/:id", uploadMulter.single("avatar"), managers.update);

  router.delete("/:id", managers.delete);

  app.use("/api/managers", router);
};
