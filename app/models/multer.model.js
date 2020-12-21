const multer = require('multer');
const path = require('path');
// const common = require("../utils/common");

let storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    // cb(null, common.createImageName(file.originalname));
    cb(null, file.originalname);
  },
});

let upload = multer({ storage: storage });

module.exports = upload;
