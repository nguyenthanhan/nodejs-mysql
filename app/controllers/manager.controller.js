'use strict';
const bcrypt = require('bcrypt');
const cloudinary = require('../models/cloudinary.model');
const _ = require('lodash');
const moment = require('moment');
const common = require('../utils/common');
var validator = require('validator');
const db = require('../models/db');
const lang = require('../lang');
const Manager = db.manager;
const Op = db.Sequelize.Op;
const constants = require('../constants');
const LogController = require('./log.controller');
const { Table, ActionOnTable } = require('../constants');

// Create and Save a new manager
exports.create = async (req, res, next) => {
  // Validate request
  if (!req.body.FName || !req.body.LName || !req.body.accountName || !req.body.password || !req.body.managerType) {
    next({
      status: 400,
      message: lang.general.error._400,
    });
    return;
  }

  if (req.body.email && !validator.isEmail(req.body.email)) {
    next({
      status: 400,
      message: 'Email không hợp lệ',
    });
    return;
  }

  if (!validator.isAlphanumeric(req.body.accountName)) {
    next({
      status: 400,
      message: 'Tên tài khoản không hợp lệ',
    });
    return;
  }

  if (!validator.isAscii(req.body.password)) {
    next({
      status: 400,
      message: 'Mật khẩu không hợp lệ',
    });
    return;
  }

  if (!validator.isAlpha(req.body.FName.replace(' ', 'a')) || !validator.isAlpha(req.body.LName.replace(' ', 'a'))) {
    next({
      status: 400,
      message: 'Tài khoản không hợp lệ',
    });
    return;
  }

  try {
    //hash password to store
    const hashPassword = await bcrypt.hash(req.body.password, constants.SALT_ROUNDS);

    // Create a manager
    const manager = {
      FName: req.body.FName,
      LName: req.body.LName,
      accountName: req.body.accountName,
      password: hashPassword,
      Address: req.body.Address,
      telephoneNumber: req.body.telephoneNumber ? req.body.telephoneNumber : '',
      BDay: req.body.BDay ? moment(req.body.BDay) : '',
      gender: req.body.gender,
      email: req.body.email,
      salary: req.body.salary,
      date_start_working: req.body.date_start_working ? moment(req.body.date_start_working) : '',
      managerType: req.body.managerType,
      is_active: true,
    };

    // Save manager in the database
    const newManager = await Manager.create(manager);
    const newManagerJSON = newManager.toJSON();
    if (newManagerJSON) {
      res.send(common.returnAPIData(_.omit(newManagerJSON, 'password'), 'Tạo thông tin nhân viên thành công'));

      LogController.createLog({
        MngID: req.userId,
        action: ActionOnTable.ADD,
        tableOfAction: Table.MANAGER,
        affectedRowID: newManagerJSON.MngID,
        nameInRow: newManagerJSON.accountName,
      });
    }
  } catch (err) {
    next({
      status: 400,
      message: err.message,
      method: 'post',
      name: 'người quản lí',
      id: 0,
    });
    return;
  }
};

// Retrieve all managers from the database.
exports.findAll = async (req, res, next) => {
  //sort by createdAt
  const sortByCreatedAt = common.checkValidSortString(req.query.sortByCreatedAt)
    ? ['createdAt', req.query.sortByCreatedAt]
    : null;

  //sort by updatedAt
  const sortByUpdatedAt = common.checkValidSortString(req.query.sortByUpdatedAt)
    ? ['updatedAt', req.query.sortByUpdatedAt]
    : null;

  const defaultSort = sortByCreatedAt || sortByUpdatedAt ? null : ['accountName', 'ASC'];
  //sort name product
  const sortName = common.checkValidSortString(req.query.sortName) ? ['accountName', req.query.sortName] : defaultSort;

  const accountName = req.query.accountKeyword;
  const condition = accountName ? { accountName: { [Op.like]: `%${accountName}%` } } : null;

  Manager.findAll({
    where: condition,
    attributes: { exclude: ['password', 'deletedAt'] },
    raw: true,
    order: _.compact([sortName, sortByCreatedAt, sortByUpdatedAt]),
  })
    .then(data => {
      res.send(common.returnAPIData(data));
    })
    .catch(err => {
      next({
        status: 400,
        message: err.message,
        method: 'get',
        name: 'người quản lí',
        id: 0,
      });
      return;
    });
};

// Find a single manager with an id
exports.findOne = async (req, res, next) => {
  const id = req.params.id;

  Manager.findByPk(id, { attributes: { exclude: ['password', 'deletedAt'] } })
    .then(data => {
      if (data) {
        res.send(common.returnAPIData(data));
      } else {
        next({
          status: 400,
          message: 'Không tìm thấy thông tin người nhân viên này',
        });
        return;
      }
    })
    .catch(err => {
      next({
        status: 400,
        message: err.message,
        method: 'get',
        name: 'người quản lí',
        id: id,
      });
      return;
    });
};

exports.findMe = async (req, res, next) => {
  const id = req.userId;

  Manager.findByPk(id, { raw: true, attributes: { exclude: ['password', 'deletedAt'] } })
    .then(data => {
      if (data) {
        res.send(common.returnAPIData(data));
      } else {
        next({
          status: 400,
          message: 'Không tìm thấy thông tin của bạn',
        });
        return;
      }
    })
    .catch(err => {
      next({
        status: 400,
        message: err.message,
        method: 'get',
        name: 'người quản lí',
        id: id,
      });
      return;
    });
};

// Update a manager by the id in the request
exports.updateMe = async (req, res, next) => {
  const id = req.userId;
  let convertImageResult = {};

  if (req.file && req.file !== {}) {
    convertImageResult = await cloudinary.uploadSingle(req.file.path, 'avatar', 300, 300);
  }

  //can't change accountName and password
  const { accountName, password, ...remain } = req.body;
  let newBody = {
    ...remain,
    avt_url: convertImageResult.url ? convertImageResult.url : '',
    updatedAt: new Date(),
  };

  if (req.body.is_active && (req.body.is_active === 'false' || req.body.is_active === false)) {
    newBody = { ...newBody, is_active: false };
  } else if (req.body.is_active && (req.body.is_active === 'true' || req.body.is_active === true)) {
    newBody = { ...newBody, is_active: true };
  }

  Manager.update(newBody, {
    where: { MngID: id },
  })
    .then(num => {
      if (num == 1) {
        res.send(common.returnAPIData({}, 'Cập nhật tài khoản thành công!'));
      } else {
        next({
          status: 400,
          message: `Không tìm thấy thông tin nhân viên này trong hệ thông!`,
        });
        return;
      }

      Product.findByPk(id, { raw: true }).then(data => {
        LogController.createLog({
          MngID: req.userId,
          action: ActionOnTable.EDIT,
          tableOfAction: Table.MANAGER,
          affectedRowID: data.MngID,
          nameInRow: data.accountName,
        });
      });
    })
    .catch(err => {
      next({
        status: 400,
        message: err.message,
        method: 'put',
        name: 'người quản lí',
        id: id,
      });
      return;
    });
};

// Update a manager by the id in the request
exports.update = async (req, res, next) => {
  const id = req.params.id;
  let convertImageResult = {};

  if (req.file) {
    convertImageResult = await cloudinary.uploadSingle(req.file.path, 'avatar', 300, 300);
  }

  //can't change accountName
  const { accountName, password, ...remain } = req.body;
  let newBody = {
    ...remain,
    avt_url: convertImageResult.url ? convertImageResult.url : '',
    updatedAt: new Date(),
  };

  if (req.body.is_active && (req.body.is_active === 'false' || req.body.is_active === false)) {
    newBody = { ...newBody, is_active: false };
  } else if (req.body.is_active && (req.body.is_active === 'true' || req.body.is_active === true)) {
    newBody = { ...newBody, is_active: true };
  }

  Manager.update(newBody, {
    where: { MngID: id },
  })
    .then(num => {
      if (num == 1) {
        res.send(common.returnAPIData({}, 'Cập nhật thông tin người quản lí thành công'));
      } else {
        next({
          status: 400,
          message: `Không thể cập nhật người quản lí này. người quản lí không thể tìm thấy!`,
        });
        return;
      }

      Product.findByPk(id, { raw: true }).then(data => {
        LogController.createLog({
          MngID: req.userId,
          action: ActionOnTable.EDIT,
          tableOfAction: Table.MANAGER,
          affectedRowID: data.MngID,
          nameInRow: data.accountName,
        });
      });
    })
    .catch(err => {
      next({
        status: 400,
        message: err.message,
        method: 'put',
        name: 'người quản lí',
        id: id,
      });
      return;
    });
};

// Delete a manager with the specified id in the request
exports.delete = async (req, res, next) => {
  try {
    const { arrayIds = [] } = req.body;

    if (arrayIds.indexOf(req.userId) !== -1) {
      next({
        status: 400,
        message: 'Không thể xoá tài khoản của chính bạn!',
      });
      return;
    }

    const _num = Manager.destroy({
      where: { MngID: { [Op.or]: arrayIds } },
    });
    const num = _num.get({ plain: true });
    console.log(num);

    if (num >= 1) {
      res.send(common.returnAPIData({}, `${num} quản lí đã bị xoá!`));
    } else {
      next({
        status: 400,
        message: `Không thể xoá người quản lí này. Có thể không tìm thấy người quản lí!`,
      });
      return;
    }

    Product.findAll({
      where: { MngID: { [Op.or]: arrayIds } },
      raw: true,
      paranoid: false,
    }).then(data => {
      data.forEach(item => {
        LogController.createLog({
          MngID: req.userId,
          action: ActionOnTable.DELETE,
          tableOfAction: Table.MANAGER,
          affectedRowID: item.MngID,
          nameInRow: item.accountName,
        });
      });
    });
  } catch (error) {
    next({
      status: 400,
      message: err.message,
      method: 'delete',
      name: 'người quản lí',
      id: 0,
    });
    return;
  }
};
