"use strict";
const common = require("../utils/common");
const db = require("../models/db");
const lang = require("../lang");
const Lot = db.lot;
const Op = db.Sequelize.Op;

// Create and Save a new lot
exports.create = async (req, res) => {
  // Validate request
  if (
    !req.body.proID ||
    !req.body.name ||
    !req.body.quantity ||
    !req.body.Exp
  ) {
    res
      .status(400)
      .send(
        common.returnAPIError(
          400,
          "post",
          "hoá đơn",
          0,
          lang.general.error._400
        )
      );
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
      res
        .status(400)
        .send(common.returnAPIError(400, "post", "hoá đơn", 0, err.message));
    });
};

// Retrieve all lots from the database.
exports.findAll = async (req, res) => {
  const cus_name = req.query.cus_name;
  let condition = cus_name
    ? { cus_name: { [Op.like]: `%${cus_name}%` } }
    : null;

  Lot.findAll({ where: condition })
    .then((data) => {
      res.send(common.returnAPIData(data));
    })
    .catch((err) => {
      res
        .status(400)
        .send(common.returnAPIError(400, "get", "hoá đơn", 0, err.message));
    });
};

// Find a single lot with an id
exports.findOne = async (req, res) => {
  const id = req.params.id;

  Lot.findByPk(id)
    .then((data) => {
      res.send(common.returnAPIData(data));
    })
    .catch((err) => {
      res
        .status(400)
        .send(common.returnAPIError(400, "get", "hoá đơn", id, err.message));
    });
};

// Update a lot by the id in the request
exports.update = async (req, res) => {
  const id = req.params.id;
  const newBody = { ...req.body, updatedAt: new Date() };

  Lot.update(newBody, {
    where: { BID: id },
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
              "hoá đơn",
              id,
              `Không thể cập nhật hoá đơn với id=${id}. hoá đơn không tìm thấy hoặc req.body trống!`
            )
          );
      }
    })
    .catch((err) => {
      res
        .status(400)
        .send(common.returnAPIError(400, "put", "hoá đơn", id, err.message));
    });
};

// Delete a lot with the specified id in the request
exports.delete = async (req, res) => {
  const id = req.params.id;

  Lot.destroy({
    where: { BID: id },
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
              "hoá đơn",
              id,
              `Không thể xoá hoá đơn với id=${id}. Có thể không tìm thấy hoá đơn!`
            )
          );
      }
    })
    .catch((err) => {
      res
        .status(400)
        .send(common.returnAPIError(400, "delete", "hoá đơn", id, err.message));
    });
};
