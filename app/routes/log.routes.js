module.exports = app => {
  const logs = require('../controllers/log.controller.js');
  const { authJwt } = require('../middleware/');

  let router = require('express').Router();

  app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Headers', 'x-access-token, Origin, Content-Type, Accept');
    next();
  });
  router.post('/', logs.create);

  router.get('/', [authJwt.verifyToken], logs.getAll);

  app.use('/api/logs', router);
};
