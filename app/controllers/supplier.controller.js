"use strict";
const common = require("../utils/common");
const db = require("../models/db");
const lang = require("../lang");
const Supplier = db.supplier;
const Op = db.Sequelize.Op;

// Create and Save a new supplier
exports.create = async (req, res, next) => {
  // Validate request
  if (
    !req.body.name ||
    !req.body.Address ||
    !req.body.Tax_ID ||
    !req.body.Email
  ) {
    next({
      status: 400,
      message: lang.general.error._400,
    });
    return;
  }

  // Create a supplier
  const supplier = {
    name: req.body.name,
    Address: req.body.Address,
    Tax_ID: req.body.Tax_ID,
    Email: req.body.Email,
  };

  // Save supplier in the database
  Supplier.create(supplier)
    .then((data) => {
      res.send(common.returnAPIData({}, ""));
    })
    .catch((err) => {
      next({
        status: 400,
        message: err.message,
        method: "post",
        name: "nhà cung cấp",
        id: 0,
      });
      return;
    });
};

// Retrieve all shelves from the database.
exports.findAll = async (req, res, next) => {
  const name = req.query.name;
  let condition = name ? { name: { [Op.like]: `%${name}%` } } : null;

  Supplier.findAll({ where: condition })
    .then((data) => {
      res.send(common.returnAPIData(data));
    })
    .catch((err) => {
      next({
        status: 400,
        message: err.message,
        method: "get",
        name: "nhà cung cấp",
        id: 0,
      });
      return;
    });
};

// Find a single supplier with an id
exports.findOne = async (req, res, next) => {
  const id = req.params.id;

  Supplier.findByPk(id)
    .then((data) => {
      if (data) {
        res.send(common.returnAPIData(data));
      } else {
        next({
          status: 400,
          message: "Không tìm thấy thông tin nhà cung cấp",
        });
        return;
      }
    })
    .catch((err) => {
      next({
        status: 400,
        message: err.message,
        method: "get",
        name: "nhà cung cấp",
        id: id,
      });
      return;
    });
};

// Update a supplier by the id in the request
exports.update = async (req, res, next) => {
  const id = req.params.id;
  const newBody = { ...req.body, updatedAt: new Date() };

  Supplier.update(newBody, {
    where: { SupID: id },
  })
    .then((num) => {
      if (num == 1) {
        res.send(common.returnAPIData({}));
      } else {
        next({
          status: 400,
          message: `Không thể cập nhật nhà cung cấp với id này. nhà cung cấp không tìm thấy hoặc req.body trống!`,
        });
        return;
      }
    })
    .catch((err) => {
      next({
        status: 400,
        message: err.message,
        method: "put",
        name: "nhà cung cấp",
        id: id,
      });
      return;
    });
};

// Delete a supplier with the specified id in the request
exports.delete = async (req, res, next) => {
  const { arrayIds = [] } = req.body;

  Supplier.destroy({
    where: { SupID: { [Op.or]: arrayIds } },
  })
    .then((num) => {
      if (num >= 1) {
        res.send(common.returnAPIData({}));
      } else {
        next({
          status: 400,
          message: `Không thể xoá nhà cung cấp với id này. Có thể không tìm thấy nhà cung cấp!`,
        });
        return;
      }
    })
    .catch((err) => {
      next({
        status: 400,
        message: err.message,
        method: "delete",
        name: "nhà cung cấp",
        id: id,
      });
      return;
    });
};
