const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const common = require("./app/utils/common");
const lang = require("./app/lang/index");
const cluster = require("cluster");
const logger = require("morgan");
const numCPUs = require("os").cpus().length;
const isDev = process.env.NODE_ENV !== "prod";
const PORT = process.env.PORT || 3000;
// const axios = require('axios');

// Multi-process to utilize all CPU cores.
if (!isDev && cluster.isMaster) {
  console.error(`Node cluster master ${process.pid} is running`);

  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker, code, signal) => {
    console.error(
      `Node cluster worker ${worker.process.pid} exited: code ${code}, signal ${signal}`
    );
  });
} else {
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

  // index
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

  // Answer API requests.
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
  app.listen(PORT, () => {
    console.warn(`----------------------------------`);
    console.warn(
      `Node ${
        isDev ? "dev server" : "cluster worker " + process.pid
      }: listening on port ${PORT}`
    );
    console.warn(`Time start:`, new Date());
    console.warn(`Environment:`, process.env.ENV);
    console.warn(`Host DB:`, process.env.DB_HOST);
    console.warn(`----------------------------------`);
  });
}
