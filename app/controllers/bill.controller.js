"use strict";
const common = require("../utils/common");
const db = require("../models/db");
const lang = require("../lang");
const Bill = db.bill;
const Op = db.Sequelize.Op;

// Create and Save a new bill
exports.create = (req, res) => {
  // Validate request
  if (!req.body.cus_name || !req.body.total || !req.body.M_ID) {
    res
      .status(400)
      .send(
        common.returnAPIError(400, "put", "hoá đơn", 0, lang.general.error._400)
      );
    return;
  }

  // Create a bill
  const bill = {
    cus_name: req.body.cus_name,
    total: req.body.total,
    M_ID: req.body.M_ID,
  };

  // Save bill in the database
  Bill.create(bill)
    .then((data) => {
      res.send(common.returnAPIData({}, ""));
    })
    .catch((err) => {
      res
        .status(500)
        .send(common.returnAPIError(500, "put", "hoá đơn", 0, err.message));
    });
};

// Retrieve all bills from the database.
exports.findAll = (req, res) => {
  const cus_name = req.query.cus_name;
  let condition = cus_name
    ? { cus_name: { [Op.like]: `%${cus_name}%` } }
    : null;

  Bill.findAll({ where: condition })
    .then((data) => {
      res.send(common.returnAPIData(data));
    })
    .catch((err) => {
      res
        .status(500)
        .send(common.returnAPIError(500, "get", "hoá đơn", 0, err.message));
    });
};

// Find a single bill with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  Bill.findByPk(id)
    .then((data) => {
      res.send(common.returnAPIData(data));
    })
    .catch((err) => {
      res
        .status(500)
        .send(common.returnAPIError(500, "get", "hoá đơn", id, err.message));
    });
};

// Update a bill by the id in the request
exports.update = (req, res) => {
  const id = req.params.id;

  Bill.update(req.body, {
    where: { BID: id },
  })
    .then((num) => {
      if (num == 1) {
        res.send(common.returnAPIData({}));
      } else {
        res.send(
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
        .status(500)
        .send(common.returnAPIError(500, "put", "hoá đơn", id, err.message));
    });
};

// Delete a bill with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;

  Bill.destroy({
    where: { BID: id },
  })
    .then((num) => {
      if (num == 1) {
        res.send(common.returnAPIData({}));
      } else {
        res.send(
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
        .status(500)
        .send(common.returnAPIError(500, "delete", "hoá đơn", id, err.message));
    });
};
