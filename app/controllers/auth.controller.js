"use strict";
const common = require("../utils/common");
const _ = require("lodash");
const db = require("../models/db");
const config = require("../config/auth.config");
const lang = require("../lang");
const Manager = db.manager;
const Op = db.Sequelize.Op;
const constants = require("../constants");

var bcrypt = require("bcrypt");
var jwt = require("jsonwebtoken");

exports.login = async (req, res) => {
  if (!req.body.account || !req.body.password) {
    res
      .status(400)
      .send(
        common.returnAPIError(
          400,
          "post",
          "người quản lí",
          0,
          lang.general.error._400
        )
      );
    return;
  }

  try {
    const accountName = req.body.account;
    const managerData = await Manager.findOne({
      where: {
        accountName: accountName,
      },
      raw: true,
    });

    if (_.isEmpty(managerData)) {
      return res
        .status(404)
        .send(
          common.returnAPIError(
            400,
            "post",
            "",
            0,
            lang.general.error.accountNotFound
          )
        );
    }

    const result = bcrypt.compare(req.body.password, managerData.password);

    if (!result) {
      res
        .status(401)
        .send(
          common.returnAPIError(
            401,
            "delete",
            "hoá đơn",
            0,
            `Mật khẩu không đúng!`
          )
        );
    } else {
    }

    let token = jwt.sign({ id: managerData.MngID }, config.secret, {
      expiresIn: constants.EXPIRES_TIME_OF_TOKEN,
    });

    res.send(
      common.returnAPIData({ ..._.omit(managerData, "password"), token }, "")
    );
  } catch (error) {
    res
      .status(400)
      .send(common.returnAPIError(400, "post", "", 0, error.message));
  }
};

exports.changePassword = async (req, res) => {
  //TODO
  if (
    !req.body.newPassword ||
    !req.body.oldPassword ||
    !req.body.confirmPassword
  ) {
    res
      .status(400)
      .send(
        common.returnAPIError(
          400,
          "post",
          "người quản lí",
          0,
          lang.general.error._400
        )
      );
    return;
  }

  try {
    const accountName = req.body.account;
    const managerData = await Manager.findAll({
      where: {
        accountName: accountName,
      },
      raw: true,
    });

    if (_.isEmpty(managerData)) {
      res
        .status(400)
        .send(
          common.returnAPIError(
            400,
            "post",
            "",
            0,
            lang.general.error.accountNotFound
          )
        );
      return;
    }

    bcrypt.compare(
      req.body.password,
      managerData[0].password,
      function (err, result) {
        console.log(result);
        if (result) {
          res.send(common.returnAPIData(_.omit(managerData[0], "password")));
        } else {
          res
            .status(400)
            .send(
              common.returnAPIError(
                400,
                "delete",
                "hoá đơn",
                0,
                `Mật khẩu không đúng!`
              )
            );
        }
      }
    );
  } catch (error) {
    res
      .status(400)
      .send(common.returnAPIError(400, "post", "", 0, error.message));
  }
};
