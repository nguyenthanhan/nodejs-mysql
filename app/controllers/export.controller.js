"use strict";
const common = require("../utils/common");
const db = require("../models/db");
const lang = require("../lang");
const Export = db.export;
const Op = db.Sequelize.Op;

// Create and Save a new export
exports.create = async (req, res) => {
  // Validate request
  if (!req.body.mngID || !req.body.date) {
    res
      .status(400)
      .send(
        common.returnAPIError(
          400,
          "post",
          "thông tin xuất hàng",
          0,
          lang.general.error._400
        )
      );
    return;
  }

  // Create a export
  const _export = {
    mngID: req.body.mngID,
    date: req.body.date,
  };

  // Save export in the database
  Export.create(_export)
    .then((data) => {
      res.send(common.returnAPIData({}, ""));
    })
    .catch((err) => {
      res
        .status(400)
        .send(
          common.returnAPIError(
            400,
            "post",
            "thông tin xuất hàng",
            0,
            err.message
          )
        );
    });
};

// Retrieve all exports from the database.
exports.findAll = async (req, res) => {
  const mngID = req.query.mngID;
  let condition = mngID ? { mngID: { [Op.like]: `%${mngID}%` } } : null;

  Export.findAll({ where: condition })
    .then((data) => {
      res.send(common.returnAPIData(data));
    })
    .catch((err) => {
      res
        .status(400)
        .send(
          common.returnAPIError(
            400,
            "get",
            "thông tin xuất hàng",
            0,
            err.message
          )
        );
    });
};

// Find a single export with an id
exports.findOne = async (req, res) => {
  const id = req.params.id;

  Export.findByPk(id)
    .then((data) => {
      res.send(common.returnAPIData(data));
    })
    .catch((err) => {
      res
        .status(400)
        .send(
          common.returnAPIError(
            400,
            "get",
            "thông tin xuất hàng",
            id,
            err.message
          )
        );
    });
};

// Update a export by the id in the request
exports.update = async (req, res) => {
  const id = req.params.id;
  const newBody = { ...req.body, updatedAt: new Date() };

  Export.update(newBody, {
    where: { ExID: id },
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
              "thông tin xuất hàng",
              id,
              `Không thể cập nhật thông tin xuất hàng với id=${id}. thông tin xuất hàng không tìm thấy hoặc req.body trống!`
            )
          );
      }
    })
    .catch((err) => {
      res
        .status(400)
        .send(
          common.returnAPIError(
            500,
            "put",
            "thông tin xuất hàng",
            id,
            err.message
          )
        );
    });
};

// Delete a export with the specified id in the request
exports.delete = async (req, res) => {
  const id = req.params.id;

  Export.destroy({
    where: { ExID: id },
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
              "thông tin xuất hàng",
              id,
              `Không thể xoá thông tin xuất hàng với id=${id}. Có thể không tìm thấy thông tin xuất hàng!`
            )
          );
      }
    })
    .catch((err) => {
      res
        .status(400)
        .send(
          common.returnAPIError(
            500,
            "delete",
            "thông tin xuất hàng",
            id,
            err.message
          )
        );
    });
};
