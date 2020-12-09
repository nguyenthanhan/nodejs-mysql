const db = require("../models/db");
const ROLES = db.ROLES;
const Manager = db.manager;
const common = require("../utils/common");
const lang = require("../lang");

checkDuplicateUsernameOrEmail = (req, res, next) => {
  // Username
  Manager.findOne({
    where: {
      accountName: req.body.accountName,
    },
  }).then((user) => {
    if (user) {
      next({
        status: 400,
        message: lang.general.error.accountInvalid,
      });
      return;
    }

    if (req.body.email) {
      // Email
      Manager.findOne({
        where: {
          email: req.body.email,
        },
      }).then((user) => {
        if (user) {
          next({
            status: 400,
            message: lang.general.error.accountInvalid,
          });
          return;
        }

        next();
      });
    } else {
      next();
    }
  });
};

const verifyManager = {
  checkDuplicateUsernameOrEmail: checkDuplicateUsernameOrEmail,
};

module.exports = verifyManager;
