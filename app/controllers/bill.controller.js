'use strict';
const common = require('../utils/common');
const db = require('../models/db');
const lang = require('../lang');
const { bill: Bill, manager: Manager, product: Product, productOnBill: ProductOnBill } = db;
const Op = db.Sequelize.Op;
const _ = require('lodash');
const moment = require('moment');
const LogController = require('./log.controller');
const { Table, ActionOnTable } = require('../constants');

const updateProductsInStore = async sellProducts => {
  try {
    const oldProducts = await Product.findAll({
      where: {
        PID: {
          [Op.or]: sellProducts.map(sellProduct => sellProduct.PID),
        },
      },
      raw: true,
    });

    oldProducts.map(async oldProduct => {
      const foundSellProduct = sellProducts.filter(sellProduct => sellProduct.PID === oldProduct.PID);

      if (foundSellProduct.length > 0) {
        Product.update(
          { S_curr_qtt: oldProduct.S_curr_qtt - foundSellProduct[0].quantity },
          {
            where: { PID: oldProduct.PID },
          }
        );
      }
    });
  } catch (error) {
    next({
      status: 400,
      message: error.message,
      id: 0,
      name: 'hoá đơn',
      method: 'post',
    });
    return;
  }
};

const asyncUpdateItemProductOnBill = (sellProduct, billId) => {
  return ProductOnBill.create({
    productId: sellProduct.PID,
    quantity: sellProduct.quantity,
    billId: billId,
  });
};

const updateProductsOnBill = (sellProducts, billId) => {
  return Promise.all(sellProducts.map(sellProduct => asyncUpdateItemProductOnBill(sellProduct, billId)));
};

// Create and Save a new bill
exports.create = async (req, res, next) => {
  // Validate request
  if (!req.body.cus_name || !req.body.total) {
    next({ status: 400, message: lang.general.error._400 });
    return;
  }

  if (req.body.sellProducts && req.body.sellProducts.length === 0) {
    next({ status: 400, message: 'Đơn hàng phải có ít nhất một sản phẩm!' });
    return;
  }

  try {
    // Create a bill
    const { cus_name, total } = req.body;
    const date = moment.now();
    const bill = {
      cus_name: cus_name,
      total: total,
      MngID: req.userId,
      createdAt: date,
    };

    // Save bill in the database
    const _currentBill = await Bill.create(bill, { raw: true });

    if (_currentBill) {
      const currentBill = _currentBill.get({ plain: true });

      LogController.createLog({
        MngID: req.userId,
        action: ActionOnTable.ADD,
        tableOfAction: Table.BILL,
        affectedRowID: currentBill.BID,
        nameInRow: currentBill.cus_name,
      });

      const createProductsOnBill = await updateProductsOnBill(req.body.sellProducts, currentBill.BID);

      // updateProductsInStore(req.body.sellProducts);

      res.send(common.returnAPIData(currentBill, 'Tạo thành công đơn hàng'));
    }
  } catch (error) {
    next({
      status: 400,
      message: error.message,
      id: 0,
      name: 'hoá đơn',
      method: 'post',
    });
    return;
  }
};

// Retrieve all bills from the database.
exports.findAll = async (req, res, next) => {
  const cus_name = req.query.cusNameKeyword;
  let condition = cus_name ? { cus_name: { [Op.like]: `%${cus_name}%` } } : null;

  Bill.findAll({
    where: condition,
    include: [
      {
        model: Manager,
        as: 'manager',
        attributes: ['accountName', 'FName', 'LName'],
      },
      {
        model: Product,
        as: 'products',
        attributes: ['PID'],
      },
    ],
  })
    .then(data => {
      res.send(common.returnAPIData(data));
    })
    .catch(err => {
      next({
        status: 400,
        message: err.message,
        id: 0,
        name: 'hoá đơn',
        method: 'get',
      });
      return;
    });
};

// Find a single bill with an id
exports.findOne = async (req, res, next) => {
  const id = req.params.id;

  Bill.findByPk(id, {
    include: [
      {
        model: Manager,
        as: 'manager',
        attributes: ['accountName', 'FName', 'LName'],
      },
      {
        model: Product,
        as: 'products',
      },
    ],
  })
    .then(data => {
      if (data) {
        res.send(common.returnAPIData(data));
      } else {
        next({
          status: 400,
          message: 'Không tìm thấy hoá đơn này',
        });
        return;
      }
    })
    .catch(err => {
      next({
        status: 400,
        message: err.message,
        id: req.params.id,
        name: 'hoá đơn',
        method: 'get',
      });
      return;
    });
};

// Update a bill by the id in the request
exports.update = async (req, res, next) => {
  const id = req.params.id;
  const newBody = { ...req.body, updatedAt: new Date() };

  Bill.update(newBody, {
    where: { BID: id },
  })
    .then(num => {
      if (num == 1) {
        res.send(common.returnAPIData({}, 'Cập nhật đơn hàng thành công!'));
      } else {
        next({
          status: 400,
          message: `Không thể cập nhật hoá đơn này. hoá đơn không thể tìm thấy!`,
        });
        return;
      }
      Bill.findByPk(id, { raw: true }).then(data => {
        LogController.createLog({
          MngID: req.userId,
          action: ActionOnTable.EDIT,
          tableOfAction: Table.BILL,
          affectedRowID: data.BID,
          nameInRow: data.cus_name,
        });
      });
    })
    .catch(err => {
      next({
        status: 400,
        message: err.message,
        id: req.params.id,
        name: 'hoá đơn',
        method: 'put',
      });
      return;
    });
};

// Delete a bill with the specified id in the request
exports.delete = async (req, res, next) => {
  const { arrayIds = [] } = req.body;

  const deleteProductOnBill = await ProductOnBill.destroy({
    where: { billId: { [Op.or]: arrayIds } },
  });

  Bill.destroy({
    where: { BID: { [Op.or]: arrayIds } },
  })
    .then(num => {
      if (num > 0) {
        res.send(
          common.returnAPIData(
            { deletedProductOnBillCount: parseInt(deleteProductOnBill) },
            `${num} hoá đơn đã bị xoá!`
          )
        );

        Bill.findAll({
          where: { BID: { [Op.or]: arrayIds } },
          raw: true,
          paranoid: false,
        }).then(data => {
          data.forEach(item => {
            LogController.createLog({
              MngID: req.userId,
              action: ActionOnTable.DELETE,
              tableOfAction: Table.BILL,
              affectedRowID: item.BID,
              nameInRow: item.cus_name,
            });
          });
        });
      } else {
        next({
          status: 400,
          message: `Không thể xoá hoá đơn này. Có thể không tìm thấy hoá đơn!`,
        });
        return;
      }
    })
    .catch(err => {
      next({
        status: 400,
        message: err.message,
        id: arrayIds.length === 1 ? arrayIds[0] : 0,
        name: 'hoá đơn',
        method: 'delete',
      });
      return;
    });
};
