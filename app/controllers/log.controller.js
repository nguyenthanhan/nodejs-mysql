"use strict";
const common = require("../utils/common");
const db = require("../models/db");
const Logs = db.log;
// const Manager = db.manager;
const Op = db.Sequelize.Op;

// Retrieve all logs from the database.
exports.getAll = async (req, res) => {
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
  //   return res
  //     .status(400)
  //     .send(
  //       common.returnAPIError(
  //         400,
  //         "",
  //         "",
  //         id,
  //         "Không tìm thấy người quản lí này!"
  //       )
  //     );
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
      res
        .status(400)
        .send(common.returnAPIError(400, "get", "sản phẩm", 0, err.message));
    });
};

exports.log = async (userID, action, tableOfAction, idOfAffectedObject) => {
  const createLogs = {
    MngID: userID,
    action,
    tableOfAction,
    idOfAffectedObject,
  };
  Logs.create(createLogs).catch((err) =>
    console.log("Ghi log thất bại. Lý do: ", err)
  );
};
