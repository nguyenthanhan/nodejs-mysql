const jwt = require("jsonwebtoken");
const config = require("../config/auth.config");
const db = require("../models/db");
const Manager = db.manager;
const common = require("../utils/common");

verifyToken = (req, res, next) => {
  let token = req.headers["x-access-token"];

  if (!token) {
    return res
      .status(403)
      .send(
        common.returnAPIError(400, "", "", 0, "Thiếu mã truy cập (token)!")
      );
  }

  jwt.verify(token, config.secret, (err, decoded) => {
    if (err) {
      return res.status(401).send({
        message: "Không có quyèn truy cập. Xác thực bị lỗi!",
      });
    }
    req.userId = decoded.id;
    next();
  });
};

isAdmin = (req, res, next) => {
  Manager.findByPk(req.userId, { raw: true }).then((data) => {
    if (data.managerType === "prime") {
      next();
      return;
    }

    res
      .status(403)
      .send(common.returnAPIError(400, "", "", 0, "Cần quyền quản trị!"));
    return;
  });
};

const authJwt = {
  verifyToken: verifyToken,
  isAdmin: isAdmin,
};
module.exports = authJwt;
