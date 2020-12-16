"use strict";
const common = require("../utils/common");
const db = require("../models/db");
const lang = require("../lang");
const Import = db.import;
const Manager = db.manager;
const Op = db.Sequelize.Op;
const moment = require("moment");
const _ = require("lodash");

// Create and Save a new import
exports.create = async (req, res, next) => {
  // Validate request
  if (!req.body.total) {
    next({
      status: 400,
      message: lang.general.error._400,
    });
    return;
  }

  // Create a import
  const newImport = {
    date: req.body.date ? moment(req.body.date) : new Date(),
    total: req.body.total,
    state: req.body.state ? req.body.state : "ready",
    urgent_level: req.body.urgent_level ? req.body.urgent_level : "normal",
    checkerId: req.body.checkerId,
    bonus: req.body.bonus,
    mngID: req.userId,
  };

  // Save import in the database
  Import.create(newImport)
    .then((data) => {
      res.send(common.returnAPIData(data, "Tạo đơn nhập hàng thành công"));
    })
    .catch((err) => {
      next({
        status: 400,
        message: err.message,
        method: "post",
        name: "thông tin nhập hàng",
        id: 0,
      });
      return;
    });
};

// Retrieve all imports from the database.
exports.findAll = async (req, res, next) => {
  //TODO: need find by other exp: accountName, not id
  // const mngID = req.query.mngID;
  // let condition = mngID ? { mngID: { [Op.like]: `%${mngID}%` } } : null;

  Import.findAll({
    // where: condition,
    include: [
      {
        model: Manager,
        as: "checker",
        attributes: ["accountName", "LName", "FName"],
      },
      {
        model: Manager,
        as: "manager",
        attributes: ["accountName", "LName", "FName"],
      },
    ],
  })
    .then((data) => {
      res.send(common.returnAPIData(data));
    })
    .catch((err) => {
      next({
        status: 400,
        message: err.message,
        method: "get",
        name: "thông tin nhập hàng",
        id: 0,
      });
      return;
    });
};

// Find a single import with an id
exports.findOne = async (req, res, next) => {
  const id = req.params.id;

  Import.findByPk(id)
    .then((data) => {
      res.send(common.returnAPIData(data));
    })
    .catch((err) => {
      next({
        status: 400,
        message: err.message,
        method: "get",
        name: "thông tin nhập hàng",
        id: id,
      });
      return;
    });
};

// Update a import by the id in the request
exports.update = async (req, res, next) => {
  const id = req.params.id;
  const newBody = { ...req.body, updatedAt: new Date() };

  Import.update(newBody, {
    where: { ImID: id },
  })
    .then((num) => {
      if (num == 1) {
        res.send(
          common.returnAPIData({}, "Cập nhật thông tin nhập hàng thành công")
        );
      } else {
        next({
          status: 400,
          message: `Không thể cập nhật thông tin nhập hàng này. Thông tin nhập hàng không thể tìm thấy!`,
        });
        return;
      }
    })
    .catch((err) => {
      next({
        status: 400,
        message: err.message,
        method: "put",
        name: "thông tin nhập hàng",
        id: id,
      });
      return;
    });
};

// Delete a import with the specified id in the request
exports.delete = async (req, res, next) => {
  const { arrayIds = [] } = req.body;

  Import.destroy({
    where: { ImID: { [Op.or]: arrayIds } },
  })
    .then((num) => {
      if (num > 0) {
        res.send(common.returnAPIData({}, `${num} phiếu nhập đã bị xoá!`));
      } else {
        next({
          status: 400,
          message: `Không thể xoá thông tin nhập hàng này. Có thể không tìm thấy thông tin nhập hàng!`,
        });
        return;
      }
    })
    .catch((err) => {
      next({
        status: 400,
        message: err.message,
        method: "delete",
        name: "thông tin nhập hàng",
        id: id,
      });
      return;
    });
};
