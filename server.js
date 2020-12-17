const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const common = require("./app/utils/common");
const lang = require("./app/lang/index");
const cluster = require("cluster");
const logger = require("morgan");
const numCPUs = require("os").cpus().length;
const isDev = process.env.NODE_ENV !== "prod";
const PORT = process.env.PORT || 5000;
var bcrypt = require("bcrypt");
const constants = require("./app/constants/index");

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
    origin: "http://localhost:5000",
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

  if (process.env.RESET_DB === "true") {
    // drop the table if it already exists
    db.sequelize.sync({ force: true }).then(async () => {
      const hashPassword = await bcrypt.hash("password", constants.SALT_ROUNDS);
      db.manager.create({
        FName: "Admin",
        LName: "",
        accountName: "admin",
        password: hashPassword,
        Address: "102 Xóm Chiếu",
        managerType: "prime",
      });
    });
  } else {
    db.sequelize.sync();
  }

  // index
  app.get("/", (req, res, next) => {
    res.json({
      title: lang.general.app,
      ...common.returnAPIData({}, ""),
    });
  });

  // app.get('/users', (req, res, next) => {
  //   axios.get('https://randomuser.me/api/?page=1&results=10').then(response => {
  //     res.send(response.data);
  //   });
  // });

  // Answer API requests.
  require("./app/routes/auth.routes")(app);
  require("./app/routes/manager.routes")(app);
  require("./app/routes/discount.routes")(app);
  require("./app/routes/products.routes")(app);
  require("./app/routes/category.routes")(app);
  require("./app/routes/shelf.routes")(app);
  require("./app/routes/bill.routes")(app);
  require("./app/routes/supplier.routes")(app);
  require("./app/routes/import.routes")(app);
  require("./app/routes/export.routes")(app);
  // require("./app/routes/lot.routes")(app);
  require("./app/routes/log.routes")(app);

  // Catch 404 Errors and forward them to error handler
  app.use((req, res, next) => {
    const err = new Error(req.originalUrl + " not found");
    err.status = 404;
    next(err);
  });

  // Error handler function
  app.use((err, req, res, next) => {
    // response to client
    return res.status(err.status || 500).send(common.returnCustomError(err));
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
    console.warn(`----------------------------------`);
  });
}
