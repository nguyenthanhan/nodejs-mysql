"use strict";
const common = require("../utils/common");
const db = require("../models/db");
const lang = require("../lang");
const Discount = db.discount;
const moment = require("moment");

// Create and Save a new Discount
exports.create = async (req, res, next) => {
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

  if (parseInt(req.body.rate) > 0 && parseInt(req.body.rate) <= 100) {
    next({
      status: 400,
      message: "NHập sai phần trăm giảm giá",
    });
    return;
  }

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
  Discount.create(discount)
    .then((data) => {
      res.send(common.returnAPIData({}, "Tạo mã giảm giá thành công"));
    })
    .catch((err) => {
      next({
        status: 400,
        message: err.message,
        method: "post",
        name: "giảm giá",
        id: 0,
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
