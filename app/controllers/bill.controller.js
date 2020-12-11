"use strict";
const common = require("../utils/common");
const db = require("../models/db");
const lang = require("../lang");
const Bill = db.bill;
const Manager = db.manager;
const Op = db.Sequelize.Op;

// Create and Save a new bill
exports.create = async (req, res, next) => {
  // Validate request
  if (!req.body.cus_name || !req.body.total) {
    next({ status: 400, message: lang.general.error._400 });
    return;
  }

  // Create a bill
  const bill = {
    cus_name: req.body.cus_name,
    total: req.body.total,
    MngID: req.userId,
  };

  // Save bill in the database
  Bill.create(bill)
    .then((data) => {
      res.send(common.returnAPIData({}));
    })
    .catch((err) => {
      next({
        status: 400,
        message: err.message,
        id: 0,
        name: "hoá đơn",
        method: "post",
      });
      return;
    });
};

// Retrieve all bills from the database.
exports.findAll = async (req, res, next) => {
  const cus_name = req.query.cusNameKeyword;
  let condition = cus_name
    ? { cus_name: { [Op.like]: `%${cus_name}%` } }
    : null;

  Bill.findAll({
    where: condition,
    include: [
      {
        model: Manager,
        as: "manager",
        attributes: ["accountName", "FName", "LName"],
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
        id: 0,
        name: "hoá đơn",
        method: "get",
      });
      return;
    });
};

// Find a single bill with an id
exports.findOne = async (req, res, next) => {
  const id = req.params.id;

  Bill.findByPk(id)
    .then((data) => {
      if (data) {
        res.send(common.returnAPIData(data));
      } else {
        next({
          status: 400,
          message: "Không tìm thấy hoá đơn này",
        });
        return;
      }
    })
    .catch((err) => {
      next({
        status: 400,
        message: err.message,
        id: id,
        name: "hoá đơn",
        method: "get",
      });
      return;
    });
};

// Update a bill by the id in the request
exports.update = async (req, res, next) => {
  const id = req.params.id;
  const newBody = { ...req.body, updatedAt: new Date() };

  Bill.update(newBody, {
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
        id: id,
        name: "hoá đơn",
        method: "put",
      });
      return;
    });
};

// Delete a bill with the specified id in the request
exports.delete = async (req, res, next) => {
  const { arrayIds = [] } = req.body;
  Bill.destroy({
    where: { BID: { [Op.or]: arrayIds } },
  })
    .then((num) => {
      if (num > 0) {
        res.send(common.returnAPIData({}, `${num} hoá đơn đã bị xoá!`));
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
        id: arrayIds.length === 1 ? arrayIds[0] : 0,
        name: "hoá đơn",
        method: "delete",
      });
      return;
    });
};
