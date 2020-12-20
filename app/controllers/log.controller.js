"use strict";
const common = require("../utils/common");
const db = require("../models/db");
const Logs = db.log;
const _ = require("lodash");
// const Op = db.Sequelize.Op;

// Retrieve all logs from the database.
exports.getAll = async (req, res, next) => {
  try {
    const per_page = parseInt(req.query.per_page) || 10;
    const page = parseInt(req.query.page) || 1;

    const limit = per_page;
    const offset = (per_page - 1) * limit;

    const getLogs = await Logs.findAll({
      // limit,
      // offset,
      // where: condition,
      raw: true,
    });
    if (getLogs) {
      const message = getLogs.length > 0 ? "" : "Không có bản ghi nào!";
      res.send(common.returnAPIData(getLogs, message));
      // res.send(
      //   common.returnAPIData(getLogs, message, {
      //     page: page,
      //     per_page: per_page,
      //   })
      // );
    }
  } catch (error) {
    next({
      status: 400,
      message: err.message,
      method: "get",
      name: "bản ghi",
      id: 0,
    });
    return;
  }
};

exports.createLog = ({
  MngID,
  action,
  tableOfAction,
  affectedRowID,
  nameInRow,
}) => {
  const createLogs = {
    MngID,
    action,
    tableOfAction,
    nameInRow,
    affectedRowID,
  };
  Logs.create(createLogs).catch((err) =>
    console.log("--Write log fail: ", err)
  );
};
