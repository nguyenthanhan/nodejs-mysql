'use strict';
const common = require('../utils/common');
const db = require('../models/db');
const Manager = db.manager;
let nodemailer = require('nodemailer');

exports.sendMail = async (req, res, next) => {
  try {
    console.log(req.body.content);
    const gmailAcc = process.env.GMAIL_ACC;
    const gmailPass = process.env.GMAIL_PASS;
    if (!gmailAcc || !gmailPass) {
      console.log('No mail env');
      next({
        status: 400,
        message: 'No mail env',
      });
      return;
    }

    const _managers = await Manager.findAll({
      where: { managerType: 'prime' },
      raw: true,
    });
    if (!_managers && _managers.length === 0) {
      return;
    }
    const mails = _managers.map(manager => manager.email).join(', ');
    console.log('mails', mails);

    let mailOptions = {
      from: 'an.ngth.1996@gmail.com',
      to: mails,
      subject: 'Email from Node-App: A Test Message!',
      text: 'Some content to send',
    };

    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'an.ngth.1996@gmail.com',
        pass: 'I11dEQ%bPA8F',
      },
    });

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        next({
          status: 400,
          message: error.message || '',
        });
        return;
      } else {
        res.send(common.returnAPIData({}, `Email sent: ${info.response}`));
      }
    });
  } catch (error) {
    next({
      status: 400,
      message: error.message || '',
    });
    return;
  }
};
