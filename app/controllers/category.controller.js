"use strict";
const common = require("../utils/common");
const db = require("../models/db");
const lang = require("../lang");
const Category = db.category;
const Op = db.Sequelize.Op;

// Create and Save a new Category
exports.create = async (req, res) => {
  // Validate request
  if (!req.body.name || !req.body.shelfID) {
    res
      .status(400)
      .send(
        common.returnAPIError(
          400,
          "post",
          "phân loại hàng",
          0,
          lang.general.error._400
        )
      );
    return;
  }

  // Create a Category
  const category = {
    name: req.body.name,
    shelfID: req.body.shelfID,
  };

  // Save category in the database
  Category.create(category)
    .then((data) => {
      res.send(common.returnAPIData({}, ""));
    })
    .catch((err) => {
      res
        .status(400)
        .send(
          common.returnAPIError(400, "post", "phân loại hàng", 0, err.message)
        );
    });
};

// Retrieve all shelves from the database.
exports.findAll = async (req, res) => {
  const name = req.query.name;
  let condition = name ? { name: { [Op.like]: `%${name}%` } } : null;

  Category.findAll({ where: condition })
    .then((data) => {
      res.send(common.returnAPIData(data));
    })
    .catch((err) => {
      res
        .status(400)
        .send(
          common.returnAPIError(400, "get", "phân loại hàng", 0, err.message)
        );
    });
};

// Find a single category with an id
exports.findOne = async (req, res) => {
  const id = req.params.id;

  Category.findByPk(id)
    .then((data) => {
      res.send(common.returnAPIData(data));
    })
    .catch((err) => {
      res
        .status(400)
        .send(
          common.returnAPIError(400, "get", "phân loại hàng", id, err.message)
        );
    });
};

// Update a category by the id in the request
exports.update = async (req, res) => {
  const id = req.params.id;
  const newBody = { ...req.body, updatedAt: new Date() };

  Category.update(newBody, {
    where: { CID: id },
  })
    .then((num) => {
      if (num == 1) {
        res.send(common.returnAPIData({}));
      } else {
        res
          .status(400)
          .send(
            common.returnAPIError(
              400,
              "put",
              "phân loại hàng",
              id,
              `Không thể cập nhật phân loại hàng với id=${id}. Phân loại hàng không tìm thấy hoặc req.body trống!`
            )
          );
      }
    })
    .catch((err) => {
      res
        .status(400)
        .send(
          common.returnAPIError(400, "put", "phân loại hàng", id, err.message)
        );
    });
};

// Delete a category with the specified id in the request
exports.delete = async (req, res) => {
  const id = req.params.id;

  Category.destroy({
    where: { CID: id },
  })
    .then((num) => {
      if (num == 1) {
        res.send(common.returnAPIData({}));
      } else {
        res
          .status(400)
          .send(
            common.returnAPIError(
              400,
              "delete",
              "phân loại hàng",
              id,
              `Không thể xoá phân loại hàng với id=${id}. Có thể không tìm thấy phân loại hàng!`
            )
          );
      }
    })
    .catch((err) => {
      res
        .status(400)
        .send(
          common.returnAPIError(
            400,
            "delete",
            "phân loại hàng",
            id,
            err.message
          )
        );
    });
};
