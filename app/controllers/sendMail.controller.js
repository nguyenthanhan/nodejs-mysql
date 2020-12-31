'use strict';
const common = require('../utils/common');
const db = require('../models/db');
const Manager = db.manager;
let nodemailer = require('nodemailer');
const QuickChart = require('quickchart-js');
let handlebars = require('handlebars');
let fs = require('fs');
const path = require('path');

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

    //chart
    const myChart = new QuickChart();
    myChart.setConfig({
      type: 'bar',
      data: {
        labels: ['January', 'February', 'March', 'April', 'May'],
        datasets: [
          {
            label: 'Dogs',
            data: [50, 60, 70, 180, 190],
          },
        ],
      },
      options: {
        scales: {
          yAxes: [
            {
              ticks: {
                callback: function (value) {
                  return '$' + value;
                },
              },
            },
          ],
        },
      },
    });
    myChart.setWidth(500).setHeight(300).setBackgroundColor('transparent');

    // const chartUrl = await myChart.getShortUrl();
    const chartUrl = myChart.getUrl();
    console.log(chartUrl);

    const html = await fs.readFileSync(path.dirname(__dirname) + '/templates/email.html', 'utf8');

    console.log(path.dirname(__dirname) + '/templates/email.html');
    const template = handlebars.compile(html);

    const htmlToSend = template({
      img_url: chartUrl,
    });

    let mailOptions = {
      from: '"Grocery Store" <an.ngth.1996@gmail.com>',
      to: mails,
      subject: '[Grocery Store] - Báo cáo cuối ngày',
      text: 'Fail to load html',
      html: htmlToSend,
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
