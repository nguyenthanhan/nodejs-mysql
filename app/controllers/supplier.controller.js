"use strict";
const common = require("../utils/common");
const db = require("../models/db");
const lang = require("../lang");
const Supplier = db.supplier;
const Op = db.Sequelize.Op;

// Create and Save a new supplier
exports.create = async (req, res) => {
  // Validate request
  if (
    !req.body.name ||
    !req.body.Address ||
    !req.body.Tax_ID ||
    !req.body.Email
  ) {
    res
      .status(400)
      .send(
        common.returnAPIError(
          400,
          "post",
          "nhà cung cấp",
          0,
          lang.general.error._400
        )
      );
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
      res
        .status(400)
        .send(
          common.returnAPIError(400, "post", "nhà cung cấp", 0, err.message)
        );
    });
};

// Retrieve all shelves from the database.
exports.findAll = async (req, res) => {
  const name = req.query.name;
  let condition = name ? { name: { [Op.like]: `%${name}%` } } : null;

  Supplier.findAll({ where: condition })
    .then((data) => {
      res.send(common.returnAPIData(data));
    })
    .catch((err) => {
      res
        .status(400)
        .send(
          common.returnAPIError(400, "get", "nhà cung cấp", 0, err.message)
        );
    });
};

// Find a single supplier with an id
exports.findOne = async (req, res) => {
  const id = req.params.id;

  Supplier.findByPk(id)
    .then((data) => {
      res.send(common.returnAPIData(data));
    })
    .catch((err) => {
      res
        .status(400)
        .send(
          common.returnAPIError(400, "get", "nhà cung cấp", id, err.message)
        );
    });
};

// Update a supplier by the id in the request
exports.update = async (req, res) => {
  const id = req.params.id;
  const newBody = { ...req.body, updatedAt: new Date() };

  Supplier.update(newBody, {
    where: { SupID: id },
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
              "nhà cung cấp",
              id,
              `Không thể cập nhật nhà cung cấp với id=${id}. nhà cung cấp không tìm thấy hoặc req.body trống!`
            )
          );
      }
    })
    .catch((err) => {
      res
        .status(400)
        .send(
          common.returnAPIError(400, "put", "nhà cung cấp", id, err.message)
        );
    });
};

// Delete a supplier with the specified id in the request
exports.delete = async (req, res) => {
  const id = req.params.id;

  Supplier.destroy({
    where: { SupID: id },
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
              "nhà cung cấp",
              id,
              `Không thể xoá nhà cung cấp với id=${id}. Có thể không tìm thấy nhà cung cấp!`
            )
          );
      }
    })
    .catch((err) => {
      res
        .status(400)
        .send(
          common.returnAPIError(400, "delete", "nhà cung cấp", id, err.message)
        );
    });
};
