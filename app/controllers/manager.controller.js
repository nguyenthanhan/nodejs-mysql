"use strict";
const bcrypt = require("bcrypt");
const cloudinary = require("../models/cloudinary.model");
const _ = require("lodash");
const moment = require("moment");
const common = require("../utils/common");
var validator = require("validator");
const db = require("../models/db");
const lang = require("../lang");
const Manager = db.manager;
const Op = db.Sequelize.Op;
const saltRounds = 10;

// Create and Save a new manager
exports.create = async (req, res, next) => {
  // Validate request
  if (
    !req.body.FName ||
    !req.body.LName ||
    !req.body.accountName ||
    !req.body.password ||
    !req.body.managerType
  ) {
    next({
      status: 400,
      message: lang.general.error._400,
    });
    return;
  }

  if (req.body.email && !validator.isEmail(req.body.email)) {
    next({
      status: 400,
      message: "Email không hợp lệ",
    });
    return;
  }

  if (!validator.isAlphanumeric(req.body.accountName)) {
    next({
      status: 400,
      message: "Tên tài khoản không hợp lệ",
    });
    return;
  }

  if (!validator.isAscii(req.body.password)) {
    next({
      status: 400,
      message: "Mật khẩu không hợp lệ",
    });
    return;
  }

  if (
    !validator.isAlpha(req.body.FName.replace(" ", "a")) ||
    !validator.isAlpha(req.body.LName.replace(" ", "a"))
  ) {
    next({
      status: 400,
      message: "Tài khoản không hợp lệ",
    });
    return;
  }

  try {
    //hash password to store
    const hashPassword = await bcrypt.hash(req.body.password, saltRounds);

    // Create a manager
    const manager = {
      FName: req.body.FName,
      LName: req.body.LName,
      accountName: req.body.accountName,
      password: hashPassword,
      Address: req.body.Address,
      BDay: moment(req.body.BDay),
      gender: req.body.gender,
      email: req.body.email,
      salary: req.body.salary,
      // avt_url: req.body.avt_url,
      date_start_working: moment(req.body.BDay),
      createdDay: moment(req.body.BDay),
      managerType: req.body.managerType,
      creatorID: req.body.creatorID,
    };

    // Save manager in the database
    Manager.create(manager)
      .then((data) => {
        Manager.findOne({
          where: {
            accountName: req.body.accountName,
          },
          raw: true,
        })
          .then((data) => {
            res.send(common.returnAPIData(_.omit(data, "password")));
          })
          .catch((err) => {
            next({
              status: 400,
              message: err.message,
              method: "post",
              name: "người quản lí",
              id: 0,
            });
            return;
          });
      })
      .catch((err) => {
        next({
          status: 400,
          message: err.message,
          method: "post",
          name: "người quản lí",
          id: 0,
        });
        return;
      });
  } catch (err) {
    next({
      status: 400,
      message: err.message,
      method: "post",
      name: "người quản lí",
      id: 0,
    });
    return;
  }
};

// Retrieve all managers from the database.
exports.findAll = async (req, res, next) => {
  console.log("req.quer", req.query);
  //sort by createdAt
  const sortByCreatedAt = common.checkValidSortString(req.query.sortByCreatedAt)
    ? ["createdAt", req.query.sortByCreatedAt]
    : null;

  //sort by updatedAt
  const sortByUpdatedAt = common.checkValidSortString(req.query.sortByUpdatedAt)
    ? ["updatedAt", req.query.sortByUpdatedAt]
    : null;

  const defaultSort =
    sortByCreatedAt || sortByUpdatedAt ? null : ["accountName", "ASC"];
  //sort name product
  const sortName = common.checkValidSortString(req.query.sortName)
    ? ["accountName", req.query.sortName]
    : defaultSort;

  const accountName = req.query.accountKeyword;
  const condition = accountName
    ? { accountName: { [Op.like]: `%${accountName}%` } }
    : null;

  Manager.findAll({
    where: condition,
    attributes: { exclude: ["password"] },
    raw: true,
    order: _.compact([sortName, sortByCreatedAt, sortByUpdatedAt]),
  })
    .then((data) => {
      res.send(common.returnAPIData(data));
    })
    .catch((err) => {
      next({
        status: 400,
        message: err.message,
        method: "get",
        name: "người quản lí",
        id: 0,
      });
      return;
    });
};

// Find a single manager with an id
exports.findOne = async (req, res, next) => {
  const id = req.params.id;

  Manager.findByPk(id)
    .then((data) => {
      if (data) {
        res.send(common.returnAPIData(data));
      } else {
        next({
          status: 400,
          message: "Không tìm thấy người quản lí này",
        });
        return;
      }
    })
    .catch((err) => {
      next({
        status: 400,
        message: err.message,
        method: "get",
        name: "người quản lí",
        id: id,
      });
      return;
    });
};

exports.findMe = async (req, res, next) => {
  const id = req.userId;

  Manager.findByPk(id, { raw: true })
    .then((data) => {
      if (data) {
        res.send(common.returnAPIData(_.omit(data, "password")));
      } else {
        next({
          status: 400,
          message: "Không tìm thấy thông tin của bạn",
        });
        return;
      }
    })
    .catch((err) => {
      next({
        status: 400,
        message: err.message,
        method: "get",
        name: "người quản lí",
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
    convertImageResult = await cloudinary.uploadSingle(
      req.file.path,
      "avatar",
      300,
      300
    );
  }

  //can't change accountName and password
  const { accountName, password, ...remain } = req.body;
  const newBody = {
    ...remain,
    avt_url: convertImageResult.url ? convertImageResult.url : "",
    updatedAt: new Date(),
  };

  Manager.update(newBody, {
    where: { MngID: id },
  })
    .then((num) => {
      if (num == 1) {
        res.send(common.returnAPIData({}));
      } else {
        next({
          status: 400,
          message: `Không thể cập nhật người quản lí với id này. người quản lí không tìm thấy hoặc req.body trống!`,
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
        id: id,
      });
      return;
    });
};

// Update a manager by the id in the request
exports.update = async (req, res, next) => {
  const id = req.params.id;
  let convertImageResult = {};

  if (!_.isEmpty(req.file)) {
    convertImageResult = await cloudinary.uploadSingle(
      req.file.path,
      "avatar",
      300,
      300
    );
  }

  //can't change accountName
  const { accountName, password, ...remain } = req.body;
  const newBody = {
    ...remain,
    avt_url: convertImageResult.url ? convertImageResult.url : "",
  };

  Manager.update(newBody, {
    where: { MngID: id },
  })
    .then((num) => {
      if (num == 1) {
        res.send(
          common.returnAPIData(
            {},
            "Cập nhật thông tin người quản lí thành công"
          )
        );
      } else {
        next({
          status: 400,
          message: `Không thể cập nhật người quản lí với id này. người quản lí không tìm thấy hoặc req.body trống!`,
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
        id: id,
      });
      return;
    });
};

// Delete a manager with the specified id in the request
exports.delete = async (req, res, next) => {
  const { arrayIds = [] } = req.body;

  Manager.destroy({
    where: { MngID: { [Op.or]: arrayIds } },
  })
    .then((num) => {
      if (num >= 1) {
        res.send(common.returnAPIData({}, `${num} quản lí đã bị xoá!`));
      } else {
        next({
          status: 400,
          message: `Không thể xoá người quản lí với id này. Có thể không tìm thấy người quản lí!`,
        });
        return;
      }
    })
    .catch((err) => {
      next({
        status: 400,
        message: err.message,
        method: "delete",
        name: "người quản lí",
        id: id,
      });
      return;
    });
};
