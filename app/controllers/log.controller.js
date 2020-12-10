"use strict";
const common = require("../utils/common");
const db = require("../models/db");
const Logs = db.log;
// const Op = db.Sequelize.Op;

// Retrieve all logs from the database.
exports.getAll = async (req, res, next) => {
  const per_page = parseInt(req.query.per_page) || 10;
  const page = parseInt(req.query.page) || 1;

  const limit = per_page;
  const offset = (per_page - 1) * limit;

  //Find by account
  // const accountName = req.query.accountName;
  // const findByAccountCondition = accountName
  //   ? { accountName: { [Op.like]: `%${accountName}%` } }
  //   : null;

  // const managerData = await Manager.findOne({findByAccountCondition});

  // if (_.isEmpty(managerData)) {

  // }

  // const id = managerData.MngID;
  // let condition = name ? { id: { [Op.like]: `%${id}%` } } : null;

  Logs.findAll({
    limit,
    offset,
    // where: condition,
    raw: true,
  })
    .then((data) => {
      res.send(
        common.returnAPIData(data, "", {
          page: page,
          per_page: per_page,
        })
      );
    })
    .catch((err) => {
      next({
        status: 400,
        message: err.message,
        method: "get",
        name: "bản ghi",
        id: 0,
      });
      return;
    });
};

exports.log = async ({
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
  Logs.create(createLogs).catch((err) => console.log("Write log fail: ", err));
};
