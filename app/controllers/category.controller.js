"use strict";
const cloudinary = require("../models/cloudinary.model");
const common = require("../utils/common");
const db = require("../models/db");
const lang = require("../lang");
const Category = db.category;
const Op = db.Sequelize.Op;

// Create and Save a new Category
exports.create = async (req, res, next) => {
  // Validate request
  if (!req.body.name) {
    next({
      status: 400,
      message: lang.general.error._400,
    });
    return;
  }

  let convertImageResult = {};
  if (req.file) {
    convertImageResult = await cloudinary.uploadSingle(
      req.file.path,
      "category"
    );
  }
  const message = convertImageResult.url
    ? ""
    : "Không tạo được url cho hình ảnh";

  // Create a Category
  const category = {
    name: req.body.name,
    img_url: convertImageResult.url ? convertImageResult.url : "",
  };

  // Save category in the database
  Category.create(category)
    .then((data) => {
      res.send(common.returnAPIData({}, message));
    })
    .catch((err) => {
      next({
        status: 400,
        message: err.message,
        method: "post",
        name: "phân loại hàng",
        id: 0,
      });
      return;
    });
};

// Retrieve all shelves from the database.
exports.findAll = async (req, res, next) => {
  const name = req.query.nameKeyword;
  let condition = name ? { name: { [Op.like]: `%${name}%` } } : null;

  Category.findAll({ where: condition })
    .then((data) => {
      res.send(common.returnAPIData(data));
    })
    .catch((err) => {
      next({
        status: 400,
        message: err.message,
        method: "get",
        name: "phân loại hàng",
        id: 0,
      });
      return;
    });
};

// Find a single category with an id
exports.findOne = async (req, res, next) => {
  const id = req.params.id;

  Category.findByPk(id, { include: ["products"] })
    .then((data) => {
      if (data) {
        res.send(common.returnAPIData(data));
      } else {
        next({
          status: 400,
          message: "Không tìm thấy danh mục hàng này",
        });
        return;
      }
    })
    .catch((err) => {
      next({
        status: 400,
        message: err.message,
        method: "get",
        name: "phân loại hàng",
        id: id,
      });
      return;
    });
};

// Update a category by the id in the request
exports.update = async (req, res, next) => {
  const id = req.params.id;
  let body = { ...req.body, updatedAt: new Date() };

  if (req.file) {
    const convertImageResult = await cloudinary.uploadSingle(
      req.file.path,
      "category"
    );
    if (convertImageResult.url) {
      body = { ...body, img_url: convertImageResult.url };
    }
  }

  Category.update(newBody, {
    where: { CID: id },
  })
    .then((num) => {
      if (num == 1) {
        res.send(
          common.returnAPIData({}, "Cập nhật phân loại hàng thành công")
        );
      } else {
        next({
          status: 400,
          message: `Không thể cập nhật phân loại hàng với id này. Phân loại hàng không tìm thấy hoặc req.body trống!`,
        });
        return;
      }
    })
    .catch((err) => {
      next({
        status: 400,
        message: err.message,
        method: "put",
        name: "phân loại hàng",
        id: id,
      });
      return;
    });
};

// Delete a category with the specified id in the request
exports.delete = async (req, res, next) => {
  const { arrayIds = [] } = req.body;

  Category.destroy({
    where: { CID: { [Op.or]: arrayIds } },
  })
    .then((num) => {
      if (num > 0) {
        res.send(common.returnAPIData({}, `${num} phân loại hàng đã bị xoá!`));
      } else {
        next({
          status: 400,
          message: `Không thể xoá phân loại hàng với id này. Có thể không tìm thấy phân loại hàng!`,
        });
        return;
      }
    })
    .catch((err) => {
      next({
        status: 400,
        message: err.message,
        method: "delete",
        name: "phân loại hàng",
        id: id,
      });
      return;
    });
};
