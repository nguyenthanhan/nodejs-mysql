"use strict";
const common = require("../utils/common");
const _ = require("lodash");
const db = require("../models/db");
const config = require("../config/auth.config");
const lang = require("../lang");
const constants = require("../constants");
var validator = require("validator");
var bcrypt = require("bcrypt");
var jwt = require("jsonwebtoken");
const Manager = db.manager;
const saltRounds = 10;

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
            "",
            "",
            0,
            lang.general.error.accountNotFound
          )
        );
    }

    const result = await bcrypt.compare(
      req.body.password,
      managerData.password
    );

    if (!result) {
      res
        .status(401)
        .send(common.returnAPIError(401, "", "", 0, `Mật khẩu không đúng!`));
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
  if (
    !req.body.newPassword ||
    !req.body.oldPassword ||
    !req.body.confirmPassword
  ) {
    res
      .status(400)
      .send(common.returnAPIError(400, "0", "0", 0, lang.general.error._400));
    return;
  }

  const { newPassword, oldPassword, confirmPassword } = req.body;

  if (!validator.isAscii(oldPassword)) {
    res
      .status(400)
      .send(common.returnAPIError(0, "", "", 0, "Mật khẩu không hợp lệ"));
    return;
  }

  if (!validator.isAscii(newPassword) || !validator.isAscii(confirmPassword)) {
    res
      .status(400)
      .send(common.returnAPIError(0, "", "", 0, "Mật khẩu mới không hợp lệ"));
    return;
  }

  if (newPassword !== confirmPassword) {
    res
      .status(400)
      .send(
        common.returnAPIError(0, "", "", 0, lang.general.error.notSamePassword)
      );
    return;
  }

  try {
    //get password from db
    const managerData = await Manager.findByPk(req.userId, { raw: true });
    if (_.isEmpty(managerData)) {
      return res
        .status(404)
        .send(
          common.returnAPIError(
            400,
            "",
            "",
            0,
            lang.general.error.accountNotFound
          )
        );
    }

    //compare password
    const result = bcrypt.compare(oldPassword, managerData.password);
    if (!result) {
      res
        .status(401)
        .send(
          common.returnAPIError(
            401,
            "",
            "",
            0,
            lang.general.error.notSamePassword
          )
        );
      return;
    } else {
      const hashNewPassword = await bcrypt.hash(newPassword, saltRounds);
      const manager = {
        password: hashNewPassword,
        updatedAt: new Date(),
      };

      Manager.update(manager, {
        where: { MngID: req.userId },
      })
        .then((num) => {
          if (num == 1) {
            res.send(common.returnAPIData({}));
          } else {
            res
              .status(400)
              .send(
                common.returnAPIError(
                  400,
                  "",
                  "",
                  0,
                  `Không thể cập nhật mật khẩu! Có thể không tìm thấy thông tin người quản lí hoặc req.body trống!`
                )
              );
          }
        })
        .catch((err) => {
          res
            .status(400)
            .send(
              common.returnAPIError(
                400,
                "put",
                "người quản lí",
                id,
                err.message
              )
            );
        });
    }
  } catch (error) {
    res
      .status(400)
      .send(common.returnAPIError(400, "post", "", 0, error.message));
  }
};
