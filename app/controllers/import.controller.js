"use strict";
const common = require("../utils/common");
const db = require("../models/db");
const lang = require("../lang");
const Import = db.import;
const Op = db.Sequelize.Op;

// Create and Save a new import
exports.create = async (req, res, next) => {
  // Validate request
  if (!req.body.mngID || !req.body.date || !req.body.state) {
    next({
      status: 400,
      message: lang.general.error._400,
    });
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
      next({
        status: 400,
        message: err.message,
        method: "post",
        name: "thông tin nhập hàng",
        id: 0,
      });
      return;
    });
};

// Retrieve all imports from the database.
exports.findAll = async (req, res, next) => {
  //TODO: need find by other exp: accountName, not id
  const mngID = req.query.mngID;
  let condition = mngID ? { mngID: { [Op.like]: `%${mngID}%` } } : null;

  Import.findAll({ where: condition })
    .then((data) => {
      res.send(common.returnAPIData(data));
    })
    .catch((err) => {
      next({
        status: 400,
        message: err.message,
        method: "get",
        name: "thông tin nhập hàng",
        id: 0,
      });
      return;
    });
};

// Find a single import with an id
exports.findOne = async (req, res, next) => {
  const id = req.params.id;

  Import.findByPk(id)
    .then((data) => {
      res.send(common.returnAPIData(data));
    })
    .catch((err) => {
      next({
        status: 400,
        message: err.message,
        method: "get",
        name: "thông tin nhập hàng",
        id: id,
      });
      return;
    });
};

// Update a import by the id in the request
exports.update = async (req, res, next) => {
  const id = req.params.id;
  const newBody = { ...req.body, updatedAt: new Date() };

  Import.update(newBody, {
    where: { ImID: id },
  })
    .then((num) => {
      if (num == 1) {
        res.send(
          common.returnAPIData({}, "Cập nhật thông tin nhập hàng thành công")
        );
      } else {
        next({
          status: 400,
          message: `Không thể cập nhật thông tin nhập hàng với id này. Thông tin nhập hàng không tìm thấy hoặc req.body trống!`,
        });
        return;
      }
    })
    .catch((err) => {
      next({
        status: 400,
        message: err.message,
        method: "put",
        name: "thông tin nhập hàng",
        id: id,
      });
      return;
    });
};

// Delete a import with the specified id in the request
exports.delete = async (req, res, next) => {
  const { arrayIds = [] } = req.body;

  Import.destroy({
    where: { ImID: { [Op.or]: arrayIds } },
  })
    .then((num) => {
      if (num > 0) {
        res.send(common.returnAPIData({}, `${num} phiếu nhập đã bị xoá!`));
      } else {
        next({
          status: 400,
          message: `Không thể xoá thông tin nhập hàng với id này. Có thể không tìm thấy thông tin nhập hàng!`,
        });
        return;
      }
    })
    .catch((err) => {
      next({
        status: 400,
        message: err.message,
        method: "delete",
        name: "thông tin nhập hàng",
        id: id,
      });
      return;
    });
};
