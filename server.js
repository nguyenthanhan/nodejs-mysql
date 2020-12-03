const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const common = require("./app/utils/common");
const lang = require("./app/lang/index");
let logger = require("morgan");

// const axios = require('axios');

const app = express();

let corsOptions = {
  origin: "http://localhost:3000",
  allowedHeaders: ["sessionId", "Content-Type"],
  exposedHeaders: ["sessionId"],
  origin: "*",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  preflightContinue: false,
};

app.use(cors(corsOptions));

app.use(logger("dev"));

// parse requests of content-type - application/json
app.use(bodyParser.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

const db = require("./app/models/db");

db.sequelize.sync();
// // drop the table if it already exists
// db.sequelize.sync({ force: true }).then(() => {
//   console.log("Drop and re-sync db.");
// });

// simple route
app.get("/", (req, res) => {
  res.json({
    title: "Welcome to Grocery App",
    ...common.returnAPIData({}, "", lang.general.app),
  });
});

// app.get('/users', (req, res) => {
//   axios.get('https://randomuser.me/api/?page=1&results=10').then(response => {
//     res.send(response.data);
//   });
// });

require("./app/routes/manager.routes")(app);
require("./app/routes/products.routes")(app);
require("./app/routes/category.routes")(app);
require("./app/routes/shelf.routes")(app);
require("./app/routes/bill.routes")(app);
require("./app/routes/supplier.routes")(app);
require("./app/routes/import.routes")(app);
require("./app/routes/export.routes")(app);
require("./app/routes/lot.routes")(app);

app.use(function (req, res) {
  res
    .status(404)
    .send(
      common.returnAPIError(404, "get", "", 0, req.originalUrl + " not found")
    );
});

// set port, listen for requests
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`----------------------------------`);
  console.log(`Server is running on port ${PORT}.`);
  console.log(`Time start:`, new Date());
  console.log(`Environment:`, process.env.ENV);
  console.log(`Host:`, process.env.DB_HOST);
  console.log(`----------------------------------`);
});
