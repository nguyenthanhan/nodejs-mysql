"use strict";
module.exports = (app) => {
  const bills = require("../controllers/bill.controller.js");

  let router = require("express").Router();

  router.post("/", bills.create);

  router.get("/", bills.findAll);

  router.get("/:id", bills.findOne);

  router.put("/:id", bills.update);

  router.delete("/:id", bills.delete);

  app.use("/api/bills", router);
};
