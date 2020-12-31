module.exports = app => {
  let router = require('express').Router();
  const mailer = require('../controllers/sendMail.controller.js');

  // app.use(function (req, res, next) {
  //   res.header('Access-Control-Allow-Headers', 'x-access-token, Origin, Content-Type, Accept');
  //   next();
  // });

  router.post('/', mailer.sendMail);

  app.use('/api/send_mails', router);
};
