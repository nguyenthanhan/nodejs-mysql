const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const common = require('./app/utils/common');
const lang = require('./app/lang/index');
const cluster = require('cluster');
const logger = require('morgan');
const numCPUs = require('os').cpus().length;
const isDev = process.env.NODE_ENV !== 'prod';
const PORT = process.env.PORT || 5000;
const faker = require('./app/faker');

// Multi-process to utilize all CPU cores.
if (!isDev && cluster.isMaster) {
  console.error(`Node cluster master ${process.pid} is running`);

  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.error(`Node cluster worker ${worker.process.pid} exited: code ${code}, signal ${signal}`);
  });
} else {
  const app = express();

  if (isDev) {
    let corsOptions = {
      origin: 'http://localhost:5000',
      allowedHeaders: ['sessionId', 'Content-Type'],
      exposedHeaders: ['sessionId'],
      origin: '*',
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      preflightContinue: false,
    };

    app.use(cors(corsOptions));
  }
  app.use(logger('dev'));

  // parse requests of content-type - application/json
  app.use(bodyParser.json());

  // parse requests of content-type - application/x-www-form-urlencoded
  app.use(bodyParser.urlencoded({ extended: true }));

  const db = require('./app/models/db');

  if (process.env.RESET_DB === 'true') {
    // drop the table if it already exists
    db.sequelize.sync({ force: true }).then(async () => {
      const admin = await faker.admin();
      await db.category.bulkCreate(faker.categories);
      await db.product.bulkCreate(faker.products);
      await db.shelf.bulkCreate(faker.shelves);
      await db.categoryShelf.bulkCreate(faker.categoriesShelves);
      await db.supplier.bulkCreate(faker.suppliers);
      await db.manager.create(admin);
    });
  } else {
    db.sequelize.sync();
  }

  // index
  app.get('/api', (req, res, next) => {
    res.json({
      title: lang.general.app,
      ...common.returnAPIData({}, ''),
    });
  });

  // Answer API requests.
  require('./app/routes/auth.routes')(app);
  require('./app/routes/manager.routes')(app);
  require('./app/routes/discount.routes')(app);
  require('./app/routes/products.routes')(app);
  require('./app/routes/category.routes')(app);
  require('./app/routes/shelf.routes')(app);
  require('./app/routes/bill.routes')(app);
  require('./app/routes/supplier.routes')(app);
  require('./app/routes/import.routes')(app);
  require('./app/routes/export.routes')(app);
  require('./app/routes/log.routes')(app);

  // Catch 404 Errors and forward them to error handler
  app.use((req, res, next) => {
    const err = new Error(req.originalUrl + ' not found');
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
    console.warn(`Node ${isDev ? 'dev server' : 'cluster worker ' + process.pid}: listening on port ${PORT}`);
    console.warn(`Time start:`, new Date());
    console.warn(`Environment:`, process.env.ENV);
    console.warn(`----------------------------------`);
  });
}
