const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const common = require("./app/utils/common");
const lang = require("./app/lang/index");

// const axios = require('axios');

const app = express();

var corsOptions = {
  origin: "http://localhost:8081",
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(bodyParser.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

const db = require("./app/models");

db.sequelize.sync();
// // drop the table if it already exists
// db.sequelize.sync({ force: true }).then(() => {
//   console.log("Drop and re-sync db.");
// });

// simple route
app.get("/", (req, res) => {
  res.json(common.returnAPIData(200, true, lang.general.app));
});

// app.get('/users', (req, res) => {
//   axios.get('https://randomuser.me/api/?page=1&results=10').then(response => {
//     res.send(response.data);
//   });
// });

require("./app/routes/products.routes")(app);
require("./app/routes/shelf.routes")(app);

app.use(function (req, res) {
  res
    .status(404)
    .send(
      common.returnAPIError(404, "get", "", 0, req.originalUrl + " not found")
    );
});

// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
