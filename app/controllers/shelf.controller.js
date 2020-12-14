"use strict";
const common = require("../utils/common");
const db = require("../models/db");
const lang = require("../lang");
const Shelf = db.shelf;
const Op = db.Sequelize.Op;

// Create and Save a new Shelf
exports.create = async (req, res, next) => {
  console.log(req.body);
  // Validate request
  if (!req.body.name) {
    next({
      status: 400,
      message: lang.general.error._400,
    });
    return;
  }

  // Create a shelf
  const shelf = {
    name: req.body.name,
    type: req.body.type ? req.body.type : "small",
    state: req.body.state ? req.body.state : "available",
    location: req.body.location ? req.body.location : "wareHouse",
  };

  // Save shelf in the database
  Shelf.create(shelf)
    .then((data) => {
      res.send(common.returnAPIData({}, ""));
    })
    .catch((err) => {
      next({
        status: 400,
        message: err.message,
        method: "post",
        name: "kệ hàng",
        id: 0,
      });
      return;
    });
};

// Retrieve all shelves from the database.
exports.findAll = async (req, res, next) => {
  const name = req.query.name;
  let condition = name ? { name: { [Op.like]: `%${name}%` } } : null;

  Shelf.findAll({ where: condition, includes: ["categories"] })
    .then((data) => {
      res.send(common.returnAPIData(data));
    })
    .catch((err) => {
      next({
        status: 400,
        message: err.message,
        method: "get",
        name: "kệ hàng",
        id: 0,
      });
      return;
    });
};

// Find a single shelf with an id
exports.findOne = async (req, res, next) => {
  const id = req.params.id;

  Shelf.findByPk(id, { includes: ["categories"] })
    .then((data) => {
      if (data) {
        res.send(common.returnAPIData(data, "Tạo kệ hàng thành công"));
      } else {
        next({
          status: 400,
          message: "Không tìm thấy thông tin kệ hàng",
        });
        return;
      }
    })
    .catch((err) => {
      next({
        status: 400,
        message: err.message,
        method: "get",
        name: "kệ hàng",
        id: id,
      });
      return;
    });
};

// Update a Shelf by the id in the request
exports.update = async (req, res, next) => {
  const id = req.params.id;
  const newBody = { ...req.body, updatedAt: new Date() };

  Shelf.update(newBody, {
    where: { ShID: id },
  })
    .then((num) => {
      if (num == 1) {
        res.send(common.returnAPIData({}, "Cập nhật kệ hàng thành công"));
      } else {
        next({
          status: 400,
          message: `Không thể update kệ hàng với id này. Có thể kệ hàng không tìm thấy hoặc req.body trống!`,
        });
        return;
      }
    })
    .catch((err) => {
      next({
        status: 400,
        message: err.message,
        method: "put",
        name: "kệ hàng",
        id: id,
      });
      return;
    });
};

// Delete a Shelf with the specified id in the request
exports.delete = async (req, res, next) => {
  const { arrayIds = [] } = req.body;

  Shelf.destroy({
    where: { ShID: { [Op.or]: arrayIds } },
  })
    .then((num) => {
      if (num >= 1) {
        res.send(common.returnAPIData({}, `${num} kệ hàng đã bị xoá!`));
      } else {
        next({
          status: 400,
          message: `Không thể xoá kệ hàng. Có thể không tìm thấy kệ hàng!`,
        });
        return;
      }
    })
    .catch((err) => {
      next({
        status: 400,
        message: err.message,
        method: "delete",
        name: "kệ hàng",
        id: id,
      });
      return;
    });
};
