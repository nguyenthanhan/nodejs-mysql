module.exports = app => {
  const _imports = require('../controllers/import.controller.js');
  const { authJwt } = require('../middleware/');

  let router = require('express').Router();

  app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Headers', 'x-access-token, Origin, Content-Type, Accept');
    next();
  });

  router.post('/', [authJwt.verifyToken], _imports.create);

  router.get('/', [authJwt.verifyToken], _imports.findAll);

  router.get('/:id', [authJwt.verifyToken], _imports.findOne);

  router.put('/:id', [authJwt.verifyToken], _imports.update);

  router.delete('/', [authJwt.verifyToken], _imports.delete);

  app.use('/api/imports', router);
};
