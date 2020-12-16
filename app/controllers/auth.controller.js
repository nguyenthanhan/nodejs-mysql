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

exports.login = async (req, res, next) => {
  if (!req.body.account || !req.body.password) {
    next({ status: 400, message: lang.general.error._400 });
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
      next({ status: 404, message: lang.general.error.accountNotFound });
      return;
    }

    const result = await bcrypt.compare(
      req.body.password,
      managerData.password
    );

    if (!result) {
      next({ status: 401, message: `Mật khẩu không đúng!` });
      return;
    }

    let token = jwt.sign({ id: managerData.MngID }, config.secret, {
      expiresIn: constants.EXPIRES_TIME_OF_TOKEN,
    });

    res.send(
      common.returnAPIData({ ..._.omit(managerData, "password"), token }, "")
    );
  } catch (error) {
    next({ status: 400, message: error.message });
    return;
  }
};

exports.changePassword = async (req, res, next) => {
  if (
    !req.body.newPassword ||
    !req.body.oldPassword ||
    !req.body.confirmPassword
  ) {
    next({ status: 400, message: lang.general.error._400 });
    return;
  }

  const { newPassword, oldPassword, confirmPassword } = req.body;

  if (!validator.isAscii(oldPassword)) {
    next({ status: 400, message: "Mật khẩu không hợp lệ" });
    return;
  }

  if (!validator.isAscii(newPassword) || !validator.isAscii(confirmPassword)) {
    next({ status: 400, message: "Mật khẩu mới không hợp lệ" });
    return;
  }

  if (newPassword !== confirmPassword) {
    next({ status: 400, message: lang.general.error.notSamePassword });
    return;
  }

  try {
    //get password from db
    const managerData = await Manager.findByPk(req.userId, {
      raw: true,
      attributes: { include: ["password"] },
    });
    if (_.isEmpty(managerData)) {
      next({ status: 404, message: lang.general.error.accountNotFound });
      return;
    }

    //compare password
    const result = bcrypt.compare(oldPassword, managerData.password);
    if (!result) {
      next({ status: 401, message: lang.general.error.notSamePassword });
      return;
    } else {
      const hashNewPassword = await bcrypt.hash(
        newPassword,
        constants.SALT_ROUNDS
      );
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
            next({
              status: 400,
              message: `Không thể cập nhật mật khẩu! Có thể không tìm thấy thông tin người quản lí hoặc req.body trống!`,
            });
            return;
          }
        })
        .catch((err) => {
          next({
            status: 400,
            message: err.message,
            method: "put",
            name: "người quản lí",
            id: req.userId,
          });
          return;
        });
    }
  } catch (err) {
    next({
      status: 400,
      message: err.message,
      method: "put",
      name: "người quản lí",
      id: req.userId,
    });
    return;
  }
};
