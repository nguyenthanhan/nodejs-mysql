"use strict";
const common = require("../utils/common");
const db = require("../models/db");
const lang = require("../lang");
const Import = db.import;
const Op = db.Sequelize.Op;

// Create and Save a new import
exports.create = async (req, res) => {
  // Validate request
  if (!req.body.mngID || !req.body.date || !req.body.state) {
    res
      .status(400)
      .send(
        common.returnAPIError(
          400,
          "post",
          "thông tin nhập hàng",
          0,
          lang.general.error._400
        )
      );
    return;
  }

  // Create a import
  const _import = {
    mngID: req.body.mngID,
    date: req.body.date,
    total: req.body.total,
    state: req.body.state,
  };

  // Save import in the database
  Import.create(_import)
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
            "thông tin nhập hàng",
            0,
            err.message
          )
        );
    });
};

// Retrieve all imports from the database.
exports.findAll = async (req, res) => {
  const mngID = req.query.mngID;
  let condition = mngID ? { mngID: { [Op.like]: `%${mngID}%` } } : null;

  Import.findAll({ where: condition })
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
            "thông tin nhập hàng",
            0,
            err.message
          )
        );
    });
};

// Find a single import with an id
exports.findOne = async (req, res) => {
  const id = req.params.id;

  Import.findByPk(id)
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
            "thông tin nhập hàng",
            id,
            err.message
          )
        );
    });
};

// Update a import by the id in the request
exports.update = async (req, res) => {
  const id = req.params.id;

  Import.update(req.body, {
    where: { ImID: id },
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
              "thông tin nhập hàng",
              id,
              `Không thể cập nhật thông tin nhập hàng với id=${id}. thông tin nhập hàng không tìm thấy hoặc req.body trống!`
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
            "put",
            "thông tin nhập hàng",
            id,
            err.message
          )
        );
    });
};

// Delete a import with the specified id in the request
exports.delete = async (req, res) => {
  const id = req.params.id;

  Import.destroy({
    where: { ImID: id },
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
              "thông tin nhập hàng",
              id,
              `Không thể xoá thông tin nhập hàng với id=${id}. Có thể không tìm thấy thông tin nhập hàng!`
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
            "thông tin nhập hàng",
            id,
            err.message
          )
        );
    });
};
