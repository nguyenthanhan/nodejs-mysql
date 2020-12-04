"use strict";
const bcrypt = require("bcrypt");
const cloudinary = require("../models/cloudinary.model");
const _ = require("lodash");
const moment = require("moment");
const common = require("../utils/common");
const db = require("../models/db");
const lang = require("../lang");
const Manager = db.manager;
const Op = db.Sequelize.Op;
const saltRounds = 10;

// Create and Save a new manager
exports.create = async (req, res) => {
  console.log(req.body);
  // Validate request
  if (
    !req.body.FName ||
    !req.body.LName ||
    !req.body.accountName ||
    !req.body.password ||
    !req.body.managerType
  ) {
    res
      .status(400)
      .send(
        common.returnAPIError(
          400,
          "post",
          "người quản lí",
          0,
          lang.general.error._400
        )
      );
    return;
  }

  try {
    //check username is have
    const checkUseName = await Manager.findAll({
      where: {
        accountName: req.body.accountName,
      },
      raw: true,
    });
    if (!_.isEmpty(checkUseName)) {
      res
        .status(400)
        .send(
          common.returnAPIError(
            400,
            "post",
            "",
            0,
            lang.general.error.accountInvalid
          )
        );
      return;
    }

    //hash password
    const hashPassword = await bcrypt.hash(req.body.password, saltRounds);

    // Create a manager
    const manager = {
      FName: req.body.FName,
      LName: req.body.LName,
      accountName: req.body.accountName,
      password: hashPassword,
      Address: req.body.Address,
      BDay: moment(req.body.BDay),
      gender: req.body.gender,
      salary: req.body.salary,
      // avt_url: req.body.avt_url,
      date_start_working: moment(req.body.BDay),
      createdDay: moment(req.body.BDay),
      managerType: req.body.managerType,
      creatorID: req.body.creatorID,
    };

    // Save manager in the database
    Manager.create(manager)
      .then((data) => {
        res.send(common.returnAPIData({}, ""));
      })
      .catch((err) => {
        res
          .status(400)
          .send(
            common.returnAPIError(400, "post", "người quản lí", 0, err.message)
          );
      });
  } catch (err) {
    res
      .status(400)
      .send(
        common.returnAPIError(400, "post", "người quản lí", 0, err.message)
      );
  }
};

// Retrieve all managers from the database.
exports.findAll = async (req, res) => {
  const accountName = req.query.accountName;
  let condition = accountName
    ? { accountName: { [Op.like]: `%${accountName}%` } }
    : null;

  Manager.findAll({
    where: condition,
    attributes: { exclude: ["password"] },
    raw: true,
  })
    .then((data) => {
      res.send(common.returnAPIData(data));
    })
    .catch((err) => {
      res
        .status(400)
        .send(
          common.returnAPIError(400, "get", "người quản lí", 0, err.message)
        );
    });
};

// Find a single manager with an id
exports.findOne = async (req, res) => {
  const id = req.params.id;

  Manager.findByPk(id)
    .then((data) => {
      res.send(common.returnAPIData(data));
    })
    .catch((err) => {
      res
        .status(400)
        .send(
          common.returnAPIError(400, "get", "người quản lí", id, err.message)
        );
    });
};

// Update a manager by the id in the request
exports.update = async (req, res) => {
  const id = req.params.id;
  let convertImageResult = {};

  if (req.file && req.file !== {}) {
    convertImageResult = await cloudinary.uploadSingle(
      req.file.path,
      "avatar",
      300,
      300
    );
  }

  //can't change accountName
  const { accountName, ...remain } = req.body;
  const newBody = {
    ...remain,
    avt_url: convertImageResult.url ? convertImageResult.url : "",
  };

  Manager.update(newBody, {
    where: { MngID: id },
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
              "người quản lí",
              id,
              `Không thể cập nhật người quản lí với id=${id}. người quản lí không tìm thấy hoặc req.body trống!`
            )
          );
      }
    })
    .catch((err) => {
      res
        .status(400)
        .send(
          common.returnAPIError(400, "put", "người quản lí", id, err.message)
        );
    });
};

// Delete a manager with the specified id in the request
exports.delete = async (req, res) => {
  const id = req.params.id;

  Manager.destroy({
    where: { MngID: id },
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
              "người quản lí",
              id,
              `Không thể xoá người quản lí với id=${id}. Có thể không tìm thấy người quản lí!`
            )
          );
      }
    })
    .catch((err) => {
      res
        .status(400)
        .send(
          common.returnAPIError(400, "delete", "người quản lí", id, err.message)
        );
    });
};