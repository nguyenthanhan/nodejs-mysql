module.exports = app => {
  const _exports = require('../controllers/export.controller.js');
  const { authJwt } = require('../middleware/');

  let router = require('express').Router();

  app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Headers', 'x-access-token, Origin, Content-Type, Accept');
    next();
  });

  router.post('/', [authJwt.verifyToken], _exports.create);

  router.get('/', [authJwt.verifyToken], _exports.findAll);

  router.get('/:id', [authJwt.verifyToken], _exports.findOne);

  router.put('/:id', [authJwt.verifyToken], _exports.update);

  router.delete('/', [authJwt.verifyToken], _exports.delete);

  app.use('/api/exports', router);
};
