"use strict";
const common = require("../utils/common");
const db = require("../models/db");
const lang = require("../lang");
const Lot = db.lot;
const Op = db.Sequelize.Op;

// Create and Save a new lot
exports.create = async (req, res, next) => {
  // Validate request
  if (
    !req.body.proID ||
    !req.body.name ||
    !req.body.quantity ||
    !req.body.Exp
  ) {
    next({
      status: 400,
      message: lang.general.error._400,
    });
    return;
  }

  // Create a lot
  const lot = {
    proID: req.body.proID,
    name: req.body.name,
    quantity: req.body.quantity,
    Exp: req.body.Exp,
  };

  // Save lot in the database
  Lot.create(lot)
    .then((data) => {
      res.send(common.returnAPIData({}, ""));
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
  const cus_name = req.query.cus_name;
  let condition = cus_name
    ? { cus_name: { [Op.like]: `%${cus_name}%` } }
    : null;

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
        res.send(common.returnAPIData({}));
      } else {
        next({
          status: 400,
          message: `Không thể cập nhật hoá đơn với id này. hoá đơn không tìm thấy hoặc req.body trống!`,
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
  const id = req.params.id;

  Lot.destroy({
    where: { BID: id },
  })
    .then((num) => {
      if (num == 1) {
        res.send(common.returnAPIData({}));
      } else {
        next({
          status: 400,
          message: `Không thể xoá hoá đơn với id này. Có thể không tìm thấy hoá đơn!`,
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
