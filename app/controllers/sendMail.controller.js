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
    const timeChart = new QuickChart();
    timeChart.setConfig({
      type: 'bar',
      data: {
        labels: [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21],

        datasets: [
          {
            label: 'Số đơn hàng',
            data: [2, 6, 5, 18, 12, 5, 3, 8, 9, 1, 9, 11, 15, 17, 12, 7],
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
            borderColor: 'rgb(54, 162, 235)',
            borderWidth: 1,
          },
        ],
      },
      options: {
        plugins: {
          datalabels: {
            anchor: 'center',
            align: 'center',
            color: '#fff',
            font: {
              weight: 'bold',
            },
          },
        },
      },
    });
    timeChart.setWidth(500).setHeight(300).setBackgroundColor('transparent');

    // const timeChartUrl = await timeChart.getShortUrl();
    const timeChartUrl = timeChart.getUrl();

    //chart
    const circleChart = new QuickChart();
    circleChart.setConfig({
      type: 'pie',
      data: {
        datasets: [
          {
            data: [112, null, null, null, null, null, null, 20, null, null, null, null, 200],
            backgroundColor: [
              '#beef00',
              '#edf756',
              '#DDAF94',
              '#ffa8B6',
              '#ff8928',
              '#007CC7',
              '#4DA8DA',
              '#EEFBFB',
              '#59ce8f',
              '#9DC88D',
              '#DADED4',
              '#51e2f5',
              '#d0bdf4',
            ],
            label: 'Dataset 1',
          },
        ],
        labels: [
          'Đồ uống',
          'Đồ ăn nhanh',
          'Đồ ăn lạnh',
          'Thực phẩm khô',
          'Thực phẩm đóng hộp',
          'Gia vị',
          'Lương thực',
          'Rau củ',
          'Khăn giấy, giấy vệ sinh, tã em bé',
          'Hóa mỹ phẩm',
          'Văn phòng phẩm',
          'Đồ sinh hoạt cá nhân',
          'Thẻ cào điện thoại',
        ],
      },
    });
    circleChart.setWidth(400).setHeight(400).setBackgroundColor('transparent');

    // const timeChartUrl = await timeChart.getShortUrl();
    const circleChartUrl = circleChart.getUrl();

    const html = await fs.readFileSync(path.dirname(__dirname) + '/templates/email.html', 'utf8');

    console.log(path.dirname(__dirname) + '/templates/email.html');
    const template = handlebars.compile(html);

    const htmlToSend = template({
      img_url: timeChartUrl,
      img_url2: circleChartUrl,
    });

    let mailOptions = {
      from: '"Grocery Store Support" <an.ngth.1996@gmail.com>',
      to: mails,
      subject: '[Grocery Store] - Báo cáo cuối ngày',
      text: 'Fail to load html',
      html: htmlToSend,
    };

    let transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
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
