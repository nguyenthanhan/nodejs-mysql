"use strict";
const common = require("../utils/common");
const db = require("../models/db");
const lang = require("../lang");
const { discount: Discount, productOnDiscount: ProductOnDiscount } = db;
const moment = require("moment");

// Create and Save a new Discount
exports.create = async (req, res, next) => {
  console.log(req.body);
  // Validate request
  if (
    !req.body.rate ||
    !req.body.title ||
    !req.body.start_date ||
    !req.body.end_date ||
    !req.body.discountCode
  ) {
    next({
      status: 400,
      message: lang.general.error._400,
    });
    return;
  }

  if (!moment(req.body.end_date).isAfter(req.body.start_date)) {
    next({
      status: 400,
      message: "Ngày bắt đầu và kết thúc không đúng!",
    });
    return;
  }

  if (parseInt(req.body.rate) < 0 && parseInt(req.body.rate) >= 100) {
    next({
      status: 400,
      message: "NHập sai phần trăm giảm giá",
    });
    return;
  }

  try {
    // Create a Discount
    const discount = {
      rate: req.body.rate,
      title: req.body.title,
      description: req.body.description,
      start_date: moment(req.body.start_date),
      end_date: moment(req.body.end_date),
      discount_code: req.body.discountCode,
    };
    // Save discount in the database
    await Discount.create(discount);

    // applyProducts
    const createdDiscount = await Discount.findOne(discount);
    if (createdDiscount && createdDiscount.discountId) {
      const newDiscountsWithProduct = await createDiscountsWithProduct(
        req.body.applyProducts,
        createdDiscount.discountId
      );

      if (newDiscountsWithProduct) {
        res.send(common.returnAPIData({}, "Tạo mã giảm giá thành công"));
      }
    }
  } catch (error) {
    next({
      status: 400,
      message: error.message,
      method: "post",
      name: "giảm giá",
      id: 0,
    });
    return;
  }
};

const asyncUpdateItemProductOnDiscount = (discountProduct, discountId) => {
  return ProductOnDiscount.create({
    productId: discountProduct.productId,
    requirementQuantity: discountProduct.requirementQuantity,
    discountId: discountId,
  });
};

const createDiscountsWithProduct = async (discountProducts, discountId) => {
  return Promise.all(
    discountProducts.map((discountProduct) =>
      asyncUpdateItemProductOnDiscount(discountProduct, discountId)
    )
  );
};

exports.update = async (req, res, next) => {
  const id = req.params.id;
  let body = { ...req.body, updatedAt: new Date() };

  Discount.update(body, {
    where: { discountId: id },
  })
    .then((num) => {
      if (num == 1) {
        res.send(
          common.returnAPIData({}, "Cập nhật sản phẩm giảm giá thành công")
        );
      } else {
        next({
          status: 400,
          message: `Không thể cập nhật sản phẩm giảm giá với id này. Phân loại hàng không tìm thấy hoặc req.body trống!`,
        });
        return;
      }
    })
    .catch((err) => {
      next({
        status: 400,
        message: err.message,
        method: "put",
        name: "sản phẩm giảm giá",
        id: id,
      });
      return;
    });
};

exports.deleteExpiresDiscount = async (arrayIds) => {
  try {
    const discounts = await Discount.findAll();
    console.log(discounts);
  } catch (error) {
    next({
      status: 400,
      message: error.message,
      method: "delete",
      name: "giảm giá",
      id: 0,
    });
    return;
  }
};
