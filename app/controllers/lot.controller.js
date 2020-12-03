"use strict";
const common = require("../utils/common");
const db = require("../models/db");
const lang = require("../lang");
const Shelf = db.shelf;
const Op = db.Sequelize.Op;

// Create and Save a new Shelf
exports.create = async (req, res) => {
  // Validate request
  if (!req.body.name || !req.body.capacity || !req.body.state) {
    res
      .status(400)
      .send(
        common.returnAPIError(
          400,
          "post",
          "kệ hàng",
          0,
          lang.general.error._400
        )
      );
    return;
  }

  // Create a shelf
  const shelf = {
    name: req.body.name,
    type: req.body.type ? req.body.type : "store",
    capacity: req.body.capacity,
    state: req.body.state,
  };

  // Save shelf in the database
  Shelf.create(shelf)
    .then((data) => {
      res.send(common.returnAPIData({}, ""));
    })
    .catch((err) => {
      res
        .status(500)
        .send(common.returnAPIError(500, "post", "kệ hàng", 0, err.message));
    });
};

// Retrieve all shelves from the database.
exports.findAll = async (req, res) => {
  const name = req.query.name;
  let condition = name ? { name: { [Op.like]: `%${name}%` } } : null;

  Shelf.findAll({ where: condition })
    .then((data) => {
      res.send(common.returnAPIData(data));
    })
    .catch((err) => {
      res
        .status(500)
        .send(common.returnAPIError(500, "get", "kệ hàng", 0, err.message));
    });
};

// Find a single shelf with an id
exports.findOne = async (req, res) => {
  const id = req.params.id;

  Shelf.findByPk(id)
    .then((data) => {
      res.send(common.returnAPIData(data));
    })
    .catch((err) => {
      res
        .status(500)
        .send(common.returnAPIError(500, "get", "kệ hàng", id, err.message));
    });
};

// Update a Shelf by the id in the request
exports.update = async (req, res) => {
  const id = req.params.id;

  Shelf.update(req.body, {
    where: { ShID: id },
  })
    .then((num) => {
      if (num == 1) {
        res.send(common.returnAPIData({}));
      } else {
        res.send(
          common.returnAPIError(
            400,
            "put",
            "kệ hàng",
            id,
            `Không thể update kệ hàng với id=${id}. Có thể kệ hàng không tìm thấy hoặc req.body trống!`
          )
        );
      }
    })
    .catch((err) => {
      res
        .status(500)
        .send(common.returnAPIError(500, "put", "kệ hàng", id, err.message));
    });
};

// Delete a Shelf with the specified id in the request
exports.delete = async (req, res) => {
  const id = req.params.id;

  Shelf.destroy({
    where: { ShID: id },
  })
    .then((num) => {
      if (num == 1) {
        res.send(common.returnAPIData({}));
      } else {
        res.send(
          common.returnAPIError(
            400,
            "delete",
            "kệ hàng",
            id,
            `Không thể xoá kệ hàng với id=${id}. Có thể không tìm thấy kệ hàng!`
          )
        );
      }
    })
    .catch((err) => {
      res
        .status(500)
        .send(common.returnAPIError(500, "delete", "kệ hàng", id, err.message));
    });
};

// Delete all Shelves from the database.
exports.deleteAll = async (req, res) => {
  Shelf.destroy({
    where: {},
    truncate: false,
  })
    .then((nums) => {
      res.send(common.returnAPIData({}, `${nums} kệ hàng đã bị xoá!`));
    })
    .catch((err) => {
      res
        .status(500)
        .send(
          common.returnAPIError(
            500,
            "delete",
            "kệ hàng",
            0,
            err.message || "Xảy ra lỗi khi xoá tất cả kệ hàng"
          )
        );
    });
};
