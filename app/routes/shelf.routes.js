"use strict";
module.exports = (app) => {
  const shelves = require("../controllers/shelf.controller.js");

  let router = require("express").Router();

  router.post("/", shelves.create);

  router.get("/", shelves.findAll);

  router.get("/:id", shelves.findOne);

  router.put("/:id", shelves.update);

  router.delete("/:id", shelves.delete);

  router.delete("/", shelves.deleteAll);

  app.use("/api/shelves", router);
};
