'use strict';
const common = require('../utils/common');
const db = require('../models/db');
const lang = require('../lang');
const { bill: Bill, manager: Manager, product: Product, lot: Lot, productOnBill: ProductOnBill } = db;
const Op = db.Sequelize.Op;
const _ = require('lodash');
const moment = require('moment');
const LogController = require('./log.controller');
const { Table, ActionOnTable } = require('../constants');
const { bill } = require('../models/db');

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
    const bill = {
      cus_name: cus_name,
      total: total,
      MngID: req.userId,
    };

    // Save bill in the database
    const _currentBill = await Bill.create(bill, { raw: true });

    if (_currentBill) {
      const currentBill = _currentBill.get({ plain: true });

      const createProductsOnBillAndUpdateLots = await Promise.all(
        req.body.sellProducts.map(async sellProduct => {
          // Get and update lots
          let remainProduct = sellProduct.quantity;
          let remainProduct2 = sellProduct.quantity;

          let productsFromLots = [];
          const _findLot = await Lot.findAll({
            where: { productId: sellProduct.PID },
            attributes: ['lotId', 'qttLotInWarehouse', 'qttProductInStore', 'conversionRate'],
          });
          const sortedLots = common.sortedByDate(
            _findLot.map(el => el.get({ plain: true })),
            false
          );

          sortedLots.forEach(eachLot => {
            if (remainProduct2 === 0) {
              return;
            }

            if (remainProduct2 <= eachLot.qttProductInStore) {
              const tempRemain = remainProduct2;
              productsFromLots = [...productsFromLots, { lotId: eachLot.lotId, gotProductCount: tempRemain }];
              remainProduct2 = 0;
            } else {
              productsFromLots = [
                ...productsFromLots,
                { lotId: eachLot.lotId, gotProductCount: eachLot.qttProductInStore },
              ];
              remainProduct2 -= eachLot.qttProductInStore;
            }
          });

          const _updatedLots = await Promise.all(
            sortedLots.map(async eachLot => {
              let qttProductInStore = eachLot.qttProductInStore;

              if (remainProduct === 0) {
                return 0;
              }

              if (remainProduct <= eachLot.qttProductInStore) {
                qttProductInStore -= remainProduct;
                remainProduct = 0;
              } else {
                remainProduct -= eachLot.qttProductInStore;
                qttProductInStore = 0;
              }

              const updateLotInDB = await Lot.update(
                {
                  qttProductInStore,
                  updatedAt: new Date(),
                },
                {
                  where: {
                    lotId: parseInt(eachLot.lotId),
                  },
                }
              );

              return parseInt(updateLotInDB);
            })
          );

          const updatedNumberOfLots = _updatedLots.reduce((sum, bool) => sum + parseInt(bool), 0);

          const _getPrice = await Product.findByPk(sellProduct.PID, {
            attributes: ['sell_price'],
          });
          let sellPrice = 0;
          if (_getPrice) {
            const getPrice = _getPrice.get({ plain: true });
            sellPrice = getPrice.sell_price;
          }

          //create productOnBill
          const _createProductOnBill = await ProductOnBill.create({
            productId: sellProduct.PID,
            quantity: sellProduct.quantity,
            billId: currentBill.BID,
            productsFromLots: JSON.stringify(productsFromLots),
            static_price: sellPrice,
          });
          const createProductOnBill = _createProductOnBill.get({ plain: true });

          //update count product
          const _oldProduct = await Product.findByPk(sellProduct.PID, {
            attributes: ['PID'],
            include: [
              {
                model: Lot,
                as: 'lots',
                attributes: ['qttProductInStore', 'conversionRate'],
              },
            ],
          });
          let updatedProductCount;
          if (_oldProduct) {
            const oldProduct = _oldProduct.get({ plain: true });
            const store_curr_qtt = oldProduct.lots.reduce((sum, productLot) => {
              return sum + productLot.qttProductInStore * productLot.conversionRate;
            }, 0);
            updatedProductCount = await Product.update(
              { store_curr_qtt },
              { where: { PID: parseInt(sellProduct.PID) } }
            );
          }
          //-----

          return {
            ...createProductOnBill,
            updatedNumberOfLots,
            productsFromLots,
            updatedProductQuantity: parseInt(updatedProductCount) === 1,
          };
        })
      );

      res.send(
        common.returnAPIData(
          { ...currentBill, productsOnBill: createProductsOnBillAndUpdateLots },
          'Tạo đơn hàng thành công'
        )
      );

      LogController.createLog({
        MngID: req.userId,
        action: ActionOnTable.ADD,
        tableOfAction: Table.BILL,
        affectedRowID: currentBill.BID,
        nameInRow: currentBill.cus_name,
      });
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
  try {
    const cus_name = req.query.cusNameKeyword;
    let condition = cus_name ? { cus_name: { [Op.like]: `%${cus_name}%` } } : null;

    const _getBill = await Bill.findAll({
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
          attributes: { exclude: ['deletedAt'] },
          include: [
            {
              model: Lot,
              as: 'lots',
              attributes: [
                'lotId',
                'qttLotInWarehouse',
                'qttProductInStore',
                'importId',
                'expires',
                'unit_name',
                'conversionRate',
                'import_price_unit',
                'import_price_product',
              ],
            },
          ],
        },
      ],
    });

    if (!_getBill) {
      next({
        status: 400,
        message: 'Có lỗi xảy ra khi lấy thông tin hoá đơn!',
      });
      return;
    }
    const getBill = _getBill
      .map(el => el.get({ plain: true }))
      .map(getABill => {
        return {
          ...getABill,
          products: getABill.products.map(product => {
            return {
              ...product,
              ProductOnBill: {
                ...product.ProductOnBill,
                productsFromLots: JSON.parse(product.ProductOnBill.productsFromLots),
              },
            };
          }),
        };
      });

    res.send(common.returnAPIData(getBill));
  } catch (error) {
    next({
      status: 400,
      message: error.message,
      id: 0,
      name: 'hoá đơn',
      method: 'get',
    });
    return;
  }
};

// Find a single bill with an id
exports.findOne = async (req, res, next) => {
  try {
    const id = req.params.id;

    const _getABill = await Bill.findByPk(id, {
      include: [
        {
          model: Manager,
          as: 'manager',
          attributes: ['accountName', 'FName', 'LName'],
        },
        {
          model: Product,
          as: 'products',
          attributes: { exclude: ['deletedAt'] },
          include: [
            {
              model: Lot,
              as: 'lots',
              attributes: [
                'lotId',
                'qttLotInWarehouse',
                'qttProductInStore',
                'importId',
                'expires',
                'unit_name',
                'conversionRate',
                'import_price_unit',
                'import_price_product',
              ],
            },
          ],
        },
      ],
    });

    if (!_getABill) {
      next({
        status: 400,
        message: 'Không tìm thấy hoá đơn này',
      });
      return;
    }
    const getABill = _getABill.get({ plain: true });
    const newBill = {
      ...getABill,
      products: getABill.products.map(product => {
        return {
          ...product,
          ProductOnBill: {
            ...product.ProductOnBill,
            productsFromLots: JSON.parse(product.ProductOnBill.productsFromLots),
          },
        };
      }),
    };
    res.send(common.returnAPIData(newBill));
  } catch (error) {
    next({
      status: 400,
      message: error.message,
      id: req.params.id,
      name: 'hoá đơn',
      method: 'get',
    });
    return;
  }
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
