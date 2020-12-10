"use strict";
const common = require("../utils/common");
const db = require("../models/db");
const lang = require("../lang");
const Discount = db.discount;
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
      res.send(common.returnAPIData({}, ""));
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
