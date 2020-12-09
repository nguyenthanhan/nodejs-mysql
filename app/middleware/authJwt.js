const jwt = require("jsonwebtoken");
const config = require("../config/auth.config");
const db = require("../models/db");
const Manager = db.manager;
const common = require("../utils/common");

verifyToken = (req, res, next) => {
  let token = req.headers["x-access-token"];

  if (!token) {
    next({ status: 400, message: "Thiếu mã truy cập (token)!" });
    return;
  }

  jwt.verify(token, config.secret, (err, decoded) => {
    if (err) {
      next({
        status: 401,
        message: "Không có quyèn truy cập. Xác thực bị lỗi!",
      });
    }
    req.userId = decoded.id;
    next();
  });
};

isAdmin = (req, res, next) => {
  Manager.findByPk(req.userId, {
    attributes: { include: ["managerType"] },
    raw: true,
  }).then((data) => {
    if (data.managerType === "prime") {
      next();
      return;
    }

    next({ status: 403, message: "Cần quyền quản trị!" });
    return;
  });
};

const authJwt = {
  verifyToken: verifyToken,
  isAdmin: isAdmin,
};
module.exports = authJwt;
