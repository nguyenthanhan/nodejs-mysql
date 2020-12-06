"use strict";
const common = require("../utils/common");
const db = require("../models/db");
const lang = require("../lang");
const cloudinary = require("../models/cloudinary.model");
const { raw } = require("body-parser");
const Product = db.products;
const Op = db.Sequelize.Op;

// Create and Save a new product
exports.create = async (req, res) => {
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
    res
      .status(400)
      .send(
        common.returnAPIError(
          400,
          "post",
          "sản phẩm",
          0,
          lang.general.error._400
        )
      );
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
      res
        .status(400)
        .send(common.returnAPIError(400, "post", "sản phẩm", 0, err.message));
    });
};

// Retrieve all products from the database.
exports.findAll = async (req, res) => {
  const limit = parseInt(req.query.per_page) || 10;
  const offset = (parseInt(req.query.page) - 1) * limit || 0;

  const name = req.query.name;
  let condition = name ? { name: { [Op.like]: `%${name}%` } } : null;

  Product.findAll({
    limit,
    offset,
    where: condition,
    raw: true,
  })
    .then((data) => {
      res.send(
        common.returnAPIData(data, "", {
          page: parseInt(req.query.page),
          per_page: parseInt(req.query.per_page),
        })
      );
    })
    .catch((err) => {
      res
        .status(400)
        .send(common.returnAPIError(400, "get", "sản phẩm", 0, err.message));
    });
};

// Find a single product with an id
exports.findOne = async (req, res) => {
  const id = req.params.id;

  Product.findByPk(id)
    .then((data) => {
      res.send(common.returnAPIData(data));
    })
    .catch((err) => {
      res
        .status(400)
        .send(common.returnAPIError(400, "get", "sản phẩm", id, err.message));
    });
};

// Update a product by the id in the request
exports.update = async (req, res) => {
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
        res.send(common.returnAPIData({}));
      } else {
        res
          .status(400)
          .send(
            common.returnAPIError(
              400,
              "put",
              "sản phẩm",
              id,
              `Không thể update sản phẩm với id=${id}. Có thể sản phẩm không tìm thấy hoặc req.body trống!`
            )
          );
      }
    })
    .catch((err) => {
      res
        .status(400)
        .send(common.returnAPIError(400, "put", "sản phẩm", id, err.message));
    });
};

// Delete a product with the specified id in the request
exports.delete = async (req, res) => {
  const id = req.params.id;

  Product.destroy({
    where: { PID: id },
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
              "sản phẩm",
              id,
              `Không thể xoá sản phẩm với id=${id}. Có thể không tìm thấy sản phẩm!`
            )
          );
      }
    })
    .catch((err) => {
      res
        .status(400)
        .send(
          common.returnAPIError(400, "delete", "sản phẩm", id, err.message)
        );
    });
};

// Delete all products from the database.
exports.deleteAll = async (req, res) => {
  Product.destroy({
    where: {},
    truncate: false,
  })
    .then((nums) => {
      res
        .status(400)
        .send(common.returnAPIData({}, `${nums} sản phẩm đã bị xoá!`));
    })
    .catch((err) => {
      res
        .status(400)
        .send(
          common.returnAPIError(
            400,
            "delete",
            "sản phẩm",
            0,
            err.message || "Xảy ra lỗi khi xoá tất cả sản phẩm"
          )
        );
    });
};
