module.exports = app => {
  const bills = require('../controllers/bill.controller.js');
  const { authJwt } = require('../middleware/');

  let router = require('express').Router();

  app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Headers', 'x-access-token, Origin, Content-Type, Accept');
    next();
  });

  router.post('/', [authJwt.verifyToken], bills.create);

  router.get('/', [authJwt.verifyToken], bills.findAll);

  router.get('/:id', [authJwt.verifyToken], bills.findOne);

  router.put('/:id', [authJwt.verifyToken], bills.update);

  router.delete('/', [authJwt.verifyToken], bills.delete);

  app.use('/api/bills', router);
};
