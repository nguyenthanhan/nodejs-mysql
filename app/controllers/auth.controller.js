'use strict';
const common = require('../utils/common');
const _ = require('lodash');
const db = require('../models/db');
const { manager: Manager } = db;
const config = require('../config/auth.config');
const lang = require('../lang');
const constants = require('../constants');
const validator = require('validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const moment = require('moment');
const LogController = require('./log.controller');
const { Table, ActionOnTable } = require('../constants');

exports.login = async (req, res, next) => {
  if (!req.body.account || !req.body.password) {
    next({ status: 400, message: lang.general.error._400 });
    return;
  }

  if (!validator.isAlphanumeric(req.body.account.replace('_', 'a').replace('.', 'a'))) {
    next({ status: 400, message: 'Tên tài khoản không hợp lệ!' });
    return;
  }

  if (!validator.isAscii(req.body.password)) {
    next({ status: 400, message: 'Mật khẩu không hợp lệ!' });
    return;
  }

  try {
    const accountName = req.body.account;
    const managerData = await Manager.findOne({
      where: {
        accountName: accountName,
      },
      attributes: { exclude: ['deletedAt'] },
      raw: true,
    });

    if (_.isEmpty(managerData)) {
      next({ status: 404, message: lang.general.error.accountNotFound });
      return;
    }
    console.log('hashing', managerData);
    const result = await bcrypt.compare(req.body.password, managerData.password);

    if (!result) {
      next({ status: 401, message: `Mật khẩu không đúng!` });
      return;
    }

    let token = jwt.sign({ id: managerData.MngID }, config.secret, {
      expiresIn: constants.EXPIRES_TIME_OF_TOKEN,
    });

    res.send(
      common.returnAPIData(
        { ..._.omit(managerData, 'password'), token, tokenInfo: { expires: moment().add(1, 'days') } },
        ''
      )
    );

    LogController.createLog({
      MngID: managerData.MngID,
      action: ActionOnTable.LOGIN,
      tableOfAction: Table.MANAGER,
      affectedRowID: managerData.MngID,
      nameInRow: managerData.accountName,
    });
  } catch (error) {
    next({ status: 400, message: error.message });
    return;
  }
};

exports.changePassword = async (req, res, next) => {
  console.log(req.body);
  if (!req.body.newPassword || !req.body.oldPassword || !req.body.confirmPassword) {
    next({ status: 400, message: lang.general.error._400 });
    return;
  }

  const { newPassword, oldPassword, confirmPassword } = req.body;

  if (!validator.isAscii(oldPassword)) {
    next({ status: 400, message: 'Mật khẩu không hợp lệ' });
    return;
  }

  if (!validator.isAscii(newPassword) || !validator.isAscii(confirmPassword)) {
    next({ status: 400, message: 'Mật khẩu mới không hợp lệ' });
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
      attributes: ['password'],
    });

    if (!managerData || _.isEmpty(managerData)) {
      next({ status: 404, message: lang.general.error.accountNotFound });
      return;
    }

    //compare password
    const result = bcrypt.compare(oldPassword, managerData.password);
    if (!result) {
      next({ status: 401, message: lang.general.error.notSamePassword });
      return;
    } else {
      const hashNewPassword = await bcrypt.hash(newPassword, constants.SALT_ROUNDS);
      const manager = {
        password: hashNewPassword,
        updatedAt: new Date(),
      };

      Manager.update(manager, {
        where: { MngID: req.userId },
      })
        .then(num => {
          if (parseInt(num) === 1) {
            res.send(common.returnAPIData(undefined, 'Cập nhật mật khẩu thành công!'));
          } else {
            next({
              status: 400,
              message: `Không thể cập nhật mật khẩu! Có thể không tìm thấy thông tin người quản lí hoặc req.body trống!`,
            });
            return;
          }
        })
        .catch(err => {
          next({
            status: 400,
            message: err.message,
            method: 'put',
            name: 'người quản lí',
            id: req.userId,
          });
          return;
        });
    }
  } catch (err) {
    next({
      status: 400,
      message: err.message,
      method: 'put',
      name: 'người quản lí',
      id: req.userId,
    });
    return;
  }
};
