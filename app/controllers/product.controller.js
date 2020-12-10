"use strict";
const common = require("../utils/common");
const db = require("../models/db");
const lang = require("../lang");
const cloudinary = require("../models/cloudinary.model");
const _ = require("lodash");
const Product = db.products;
const Op = db.Sequelize.Op;
const moment = require("moment");
// Create and Save a new product
exports.create = async (req, res, next) => {
  // Validate request
  if (
    !req.body.name ||
    !req.body.W_curr_qtt ||
    !req.body.W_max_qtt ||
    !req.body.W_min_qtt ||
    !req.body.S_curr_qtt ||
    !req.body.S_max_qtt ||
    !req.body.S_min_qtt ||
    !req.body.sell_price ||
    !req.body.import_price ||
    !req.body.brand
  ) {
    next({
      status: 400,
      message: lang.general.error._400,
    });
    return;
  }

  let convertImageResult = {};
  if (req.file) {
    convertImageResult = await cloudinary.uploadSingle(req.file.path);
  }

  // Create a product
  const product = {
    name: req.body.name,
    barcode: req.body.barcode,
    img_url: convertImageResult.url ? convertImageResult.url : "",
    W_curr_qtt: req.body.W_curr_qtt,
    W_max_qtt: req.body.W_max_qtt,
    W_min_qtt: req.body.W_min_qtt,
    S_curr_qtt: req.body.S_curr_qtt,
    S_max_qtt: req.body.S_max_qtt,
    S_min_qtt: req.body.S_min_qtt,
    sell_price: req.body.sell_price,
    import_price: req.body.import_price,
    brand: req.body.brand,
    catID: req.body.catID,
    shID: req.body.shID,
  };

  // Save product in the database
  Product.create(product)
    .then((data) => {
      res.send(common.returnAPIData({}, ""));
    })
    .catch((err) => {
      next({
        status: 400,
        message: err.message,
        method: "post",
        name: "sản phẩm",
        id: 0,
      });
      return;
    });
};

// Retrieve all products from the database.
exports.findAll = async (req, res, next) => {
  //pagination
  const limit = parseInt(req.query.per_page) || 10;
  const offset = (parseInt(req.query.page) - 1) * limit || 0;

  //sort by createdAt
  const sortByCreatedAt = common.checkValidSortString(req.query.sortByCreatedAt)
    ? ["createdAt", req.query.sortByCreatedAt]
    : null;

  //sort by updatedAt
  const sortByUpdatedAt = common.checkValidSortString(req.query.sortByUpdatedAt)
    ? ["updatedAt", req.query.sortByUpdatedAt]
    : null;

  const defaultSort =
    sortByCreatedAt || sortByUpdatedAt ? null : ["name", "ASC"];
  //sort name product
  const sortName = common.checkValidSortString(req.query.sortName)
    ? ["name", req.query.sortName]
    : defaultSort;

  //search name products
  const name = req.query.nameKeyword;
  let condition = name ? { name: { [Op.like]: `%${name}%` } } : null;

  Product.findAll({
    limit,
    offset,
    where: condition,
    raw: true,
    order: _.compact([sortName, sortByCreatedAt, sortByUpdatedAt]),
  })
    .then((data) => {
      const message = data.length === 0 ? "Không có sản phẩm nào" : "";
      res.send(
        common.returnAPIData(data, message, {
          page: parseInt(req.query.page),
          per_page: parseInt(req.query.per_page),
        })
      );
    })
    .catch((err) => {
      next({
        status: 400,
        message: err.message,
        method: "get",
        name: "sản phẩm",
        id: 0,
      });
      return;
    });
};

// Find a single product with an id
exports.findOne = async (req, res, next) => {
  const id = req.params.id;

  Product.findByPk(id)
    .then((data) => {
      if (data) {
        res.send(common.returnAPIData(data));
      } else {
        next({
          status: 400,
          message: "Không tìm thấy thông tin sản phẩm",
        });
        return;
      }
    })
    .catch((err) => {
      next({
        status: 400,
        message: err.message,
        method: "get",
        name: "sản phẩm",
        id: id,
      });
      return;
    });
};

// Update a product by the id in the request
exports.update = async (req, res, next) => {
  const id = req.params.id;
  let body = { ...req.body, updatedAt: new Date() };

  if (req.file) {
    const convertImageResult = await cloudinary.uploadSingle(req.file.path);
    if (convertImageResult.url) {
      body = { ...body, img_url: convertImageResult.url };
    }
  }

  Product.update(body, {
    where: { PID: id },
  })
    .then((num) => {
      if (num == 1) {
        res.send(common.returnAPIData({}, "Cập nhật sản phẩm thành công"));
      } else {
        next({
          status: 400,
          message: `Không thể update sản phẩm với id này. Có thể sản phẩm không tìm thấy hoặc req.body trống!`,
        });
        return;
      }
    })
    .catch((err) => {
      next({
        status: 400,
        message: err.message,
        method: "put",
        name: "sản phẩm",
        id: id,
      });
      return;
    });
};

// Delete a product with the specified id in the request
exports.delete = async (req, res, next) => {
  const { arrayIds = [] } = req.body;

  Product.destroy({
    where: { PID: { [Op.or]: arrayIds } },
  })
    .then((num) => {
      if (num >= 1) {
        res.send(common.returnAPIData({}, `${num} sản phẩm đã bị xoá!`));
      } else {
        next({
          status: 400,
          message: `Không thể xoá sản phẩm với id này. Có thể không tìm thấy sản phẩm!`,
        });
        return;
      }
    })
    .catch((err) => {
      next({
        status: 400,
        message: err.message,
        method: "delete",
        name: "sản phẩm",
        id: id,
      });
      return;
    });
};

// Delete all products from the database.
exports.deleteAll = async (req, res, next) => {
  Product.destroy({
    where: {},
    truncate: false,
  })
    .then((nums) => {
      res
        .status(200)
        .send(common.returnAPIData({}, `${nums} sản phẩm đã bị xoá!`));
    })
    .catch((err) => {
      next({
        status: 400,
        message: err.message || "Xảy ra lỗi khi xoá tất cả sản phẩm",
        method: "delete",
        name: "sản phẩm",
        id: 0,
      });
      return;
    });
};
