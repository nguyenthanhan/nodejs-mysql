module.exports = app => {
  const uploadMulter = require('../models/multer.model');
  const { verifyManager, authJwt } = require('../middleware/');
  const managers = require('../controllers/manager.controller.js');

  let router = require('express').Router();

  app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Headers', 'x-access-token, Origin, Content-Type, Accept');
    next();
  });

  router.get('/me', [authJwt.verifyToken], managers.findMe);

  router.put('/me', [authJwt.verifyToken], uploadMulter.single('avatar'), managers.updateMe);

  router.post(
    '/',
    [authJwt.verifyToken, authJwt.isAdmin, verifyManager.checkDuplicateUsernameOrEmail],
    managers.create
  );

  router.get('/', [authJwt.verifyToken, authJwt.isAdmin], managers.findAll);

  router.get('/:id', [authJwt.verifyToken, authJwt.isAdmin], managers.findOne);

  router.put('/:id', [authJwt.verifyToken, authJwt.isAdmin], uploadMulter.single('avatar'), managers.update);

  router.delete('/', [authJwt.verifyToken, authJwt.isAdmin], managers.delete);

  app.use('/api/managers', router);
};
