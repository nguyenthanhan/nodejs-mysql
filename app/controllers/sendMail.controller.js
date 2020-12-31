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
      from: '"Grocery Store" <foo@example.com>',
      to: mails,
      subject: 'Báo cáo cuối ngày - Grocery Store',
      text: 'Some content to send',
      html: '<b>Hello world?</b>', // html body
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
        res.send(common.returnAPIData({ content: req.body.content }, `Email sent ${info.response}`));
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
