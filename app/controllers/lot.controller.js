"use strict";
const common = require("../utils/common");
const db = require("../models/db");
const lang = require("../lang");
const Lot = db.lot;
const Op = db.Sequelize.Op;

// Create and Save a new lot
exports.create = async (req, res, next) => {
  console.log(req.body);
  // Validate request
  if (!req.body.name || !req.body.quantity || !req.body.Exp) {
    next({
      status: 400,
      message: lang.general.error._400,
    });
    return;
  }

  // Create a lot
  const lot = {
    name: req.body.name,
    quantity: req.body.quantity,
    expires: req.body.expires,
  };

  // Save lot in the database
  Lot.create(lot)
    .then((data) => {
      res.send(common.returnAPIData(data));
    })
    .catch((err) => {
      next({
        status: 400,
        message: err.message,
        method: "post",
        name: "hoá đơn",
        id: 0,
      });
      return;
    });
};

// Retrieve all lots from the database.
exports.findAll = async (req, res, next) => {
  const name = req.query.nameKeyword;
  let condition = name ? { name: { [Op.like]: `%${name}%` } } : null;

  Lot.findAll({ where: condition })
    .then((data) => {
      res.send(common.returnAPIData(data));
    })
    .catch((err) => {
      next({
        status: 400,
        message: err.message,
        method: "get",
        name: "hoá đơn",
        id: 0,
      });
      return;
    });
};

// Find a single lot with an id
exports.findOne = async (req, res, next) => {
  const id = req.params.id;

  Lot.findByPk(id)
    .then((data) => {
      if (data) {
        res.send(common.returnAPIData(data));
      } else {
        next({
          status: 400,
          message: "Không tìm thấy thông tin lô hàng",
        });
        return;
      }
    })
    .catch((err) => {
      next({
        status: 400,
        message: err.message,
        method: "get",
        name: "hoá đơn",
        id: id,
      });
      return;
    });
};

// Update a lot by the id in the request
exports.update = async (req, res, next) => {
  const id = req.params.id;
  const newBody = { ...req.body, updatedAt: new Date() };

  Lot.update(newBody, {
    where: { BID: id },
  })
    .then((num) => {
      if (num == 1) {
        res.send(common.returnAPIData({}, "Cập nhật hoá đơn thành công"));
      } else {
        next({
          status: 400,
          message: `Không thể cập nhật hoá đơn này. hoá đơn không thể tìm thấy!`,
        });
        return;
      }
    })
    .catch((err) => {
      next({
        status: 400,
        message: err.message,
        method: "put",
        name: "hoá đơn",
        id: id,
      });
      return;
    });
};

// Delete a lot with the specified id in the request
exports.delete = async (req, res, next) => {
  const { arrayIds = [] } = req.body;

  Lot.destroy({
    where: { proID: { [Op.or]: arrayIds } },
  })
    .then((num) => {
      if (num >= 1) {
        res.send(common.returnAPIData({}, `${num} lô hàng đã bị xoá!`));
      } else {
        next({
          status: 400,
          message: `Không thể xoá hoá đơn này. Có thể không tìm thấy hoá đơn!`,
        });
        return;
      }
    })
    .catch((err) => {
      next({
        status: 400,
        message: err.message,
        method: "delete",
        name: "hoá đơn",
        id: id,
      });
      return;
    });
};
