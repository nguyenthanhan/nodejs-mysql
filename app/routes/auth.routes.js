"use strict";
module.exports = (app) => {
  const auth = require("../controllers/auth.controller.js");
  const { verifyManager, authJwt } = require("../middleware/");

  let router = require("express").Router();

  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  router.post("/login", auth.login);

  router.put("/changePassword", [authJwt.verifyToken], auth.changePassword);

  app.use("/api/auth", router);
};
