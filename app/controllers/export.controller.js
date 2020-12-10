"use strict";
const common = require("../utils/common");
const db = require("../models/db");
const lang = require("../lang");
const Export = db.export;
const Op = db.Sequelize.Op;

// Create and Save a new export
exports.create = async (req, res, next) => {
  // Validate request
  if (!req.body.mngID) {
    next({
      status: 400,
      message: lang.general.error._400,
    });
    return;
  }

  // Create a export
  const _export = {
    mngID: req.body.mngID,
    date: req.body.date ? moment(req.body.date) : new Date(),
    state: req.body.state ? req.body.state : "ready",
    urgent_level: req.body.urgent_level ? req.body.urgent_level : "normal",
  };

  // Save export in the database
  Export.create(_export)
    .then((data) => {
      res.send(common.returnAPIData({}, ""));
    })
    .catch((err) => {
      next({
        status: 400,
        message: err.message,
        method: "post",
        name: "thông tin xuất hàng",
        id: 0,
      });
      return;
    });
};

// Retrieve all exports from the database.
exports.findAll = async (req, res, next) => {
  //TODO: need find by other exp: accountName, not id
  const mngID = req.query.mngID;
  let condition = mngID ? { mngID: { [Op.like]: `%${mngID}%` } } : null;

  Export.findAll({ where: condition })
    .then((data) => {
      if (data) {
        res.send(common.returnAPIData(data));
      } else {
        next({
          status: 400,
          message: "Không tìm thấy thông tin xuất hàng",
        });
        return;
      }
    })
    .catch((err) => {
      next({
        status: 400,
        message: err.message,
        method: "get",
        name: "thông tin xuất hàng",
        id: 0,
      });
      return;
    });
};

// Find a single export with an id
exports.findOne = async (req, res, next) => {
  const id = req.params.id;

  Export.findByPk(id)
    .then((data) => {
      res.send(common.returnAPIData(data));
    })
    .catch((err) => {
      next({
        status: 400,
        message: err.message,
        method: "get",
        name: "thông tin xuất hàng",
        id: id,
      });
      return;
    });
};

// Update a export by the id in the request
exports.update = async (req, res, next) => {
  const id = req.params.id;
  const newBody = { ...req.body, updatedAt: new Date() };

  Export.update(newBody, {
    where: { ExID: id },
  })
    .then((num) => {
      if (num == 1) {
        res.send(
          common.returnAPIData({}, "Cập nhật thông tin xuất hàng thành công")
        );
      } else {
        next({
          status: 400,
          message: `Không thể cập nhật thông tin xuất hàng với id này. thông tin xuất hàng không tìm thấy hoặc req.body trống!`,
        });
        return;
      }
    })
    .catch((err) => {
      next({
        status: 400,
        message: err.message,
        method: "put",
        name: "thông tin xuất hàng",
        id: id,
      });
      return;
    });
};

// Delete a export with the specified id in the request
exports.delete = async (req, res, next) => {
  const { arrayIds = [] } = req.body;

  Export.destroy({
    where: { ExID: { [Op.or]: arrayIds } },
  })
    .then((num) => {
      if (num > 0) {
        res.send(common.returnAPIData({}, `${num} phiếu xuất đã bị xoá!`));
      } else {
        next({
          status: 400,
          message: `Không thể xoá thông tin xuất hàng với id này. Có thể không tìm thấy thông tin xuất hàng!`,
        });
        return;
      }
    })
    .catch((err) => {
      next({
        status: 400,
        message: err.message,
        method: "delete",
        name: "thông tin xuất hàng",
        id: id,
      });
      return;
    });
};
