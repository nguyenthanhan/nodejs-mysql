"use strict";
module.exports = (app) => {
  const auth = require("../controllers/auth.controller.js");

  let router = require("express").Router();

  router.post("/login", auth.login);

  router.post("/changePassword", auth.changePassword);

  app.use("/api/auth", router);
};
