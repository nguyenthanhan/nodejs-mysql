'use strict';
const common = require('../utils/common');
const db = require('../models/db');
const { manager: Manager, export: Export, product: Product, lot: Lot, productInExport: ProductInExport } = db;
const Op = db.Sequelize.Op;
const moment = require('moment');
const _ = require('lodash');
const LogController = require('./log.controller');
const { Table, ActionOnTable } = require('../constants');

// Create and Save a new export
exports.create = async (req, res, next) => {
  console.log(req.body);

  if (_.isArray(req.body.exportProducts) && req.body.exportProducts.length === 0) {
    next({
      status: 400,
      message: 'Không có sản phẩm nào được chọn!',
    });
    return;
  }

  // Create a export
  try {
    const _export = {
      state: 'request',
      requesterId: req.userId,
      urgent_level: req.body.urgent_level ? req.body.urgent_level : 'normal',
      request_export_date: moment(req.body.request_export_date) || new Date(),
      bonus: req.body.bonus,
    };

    // Save export in the database
    const _createExport = await Export.create(_export);
    const createExport = _createExport.get({ plain: true });

    const prepareExportProducts = req.body.exportProducts.map(exportProduct => {
      return {
        productId: exportProduct.productId,
        request_total_unit: parseInt(exportProduct.request_total_unit),
        exportId: createExport.ExID,
      };
    });

    const productsWithExport = await ProductInExport.bulkCreate(prepareExportProducts);

    res.send(common.returnAPIData({ ...createExport, productsWithExport }, 'Tạo đơn xuất hàng thành công!'));

    LogController.createLog({
      MngID: req.userId,
      action: ActionOnTable.ADD,
      tableOfAction: Table.EXPORT,
      affectedRowID: createExport.ExID,
      nameInRow: null,
    });
  } catch (error) {
    next({
      status: 400,
      message: error.message,
      method: 'post',
      name: 'thông tin xuất hàng',
      id: 0,
    });
    return;
  }
};

// Retrieve all exports from the database.
exports.findAll = async (req, res, next) => {
  try {
    // const mngID = req.query.mngID;
    // let condition = mngID ? { mngID: { [Op.like]: `%${mngID}%` } } : null;

    const _newExport = await Export.findAll({
      // where: condition,
      attributes: { exclude: ['deletedAt'] },
      include: [
        {
          model: Product,
          as: 'products',
          attributes: ['PID', 'name'],
        },
      ],
    });
    const newExport = _newExport.map(el => el.get({ plain: true }));

    res.send(common.returnAPIData(newExport, newExport.length === 0 ? 'Không có đơn xuất hàng nào!' : ''));
  } catch (error) {
    next({
      status: 400,
      message: error.message,
      method: 'get',
      name: 'thông tin xuất hàng',
      id: 0,
    });
    return;
  }
};

// Find a single export with an id
exports.findOne = async (req, res, next) => {
  try {
    const id = req.params.id;

    const data = await Export.findByPk(id, {
      attributes: { exclude: ['deletedAt'] },
      include: [
        {
          model: Product,
          as: 'products',
          attributes: ['PID', 'name'],
        },
      ],
    });
    if (data) {
      res.send(common.returnAPIData(data));
    } else {
      next({
        status: 400,
        message: 'Không tìm thấy thông tin của đơn xuất hàng này',
      });
      return;
    }
  } catch (error) {
    next({
      status: 400,
      message: error.message,
      method: 'get',
      name: 'thông tin xuất hàng',
      id: id,
    });
    return;
  }
};

const log = req => {
  LogController.createLog({
    MngID: req.userId,
    action: ActionOnTable.EDIT,
    tableOfAction: Table.EXPORT,
    affectedRowID: req.params.id,
    nameInRow: null,
  });
};

// Update a export by the id in the request
exports.update = async (req, res, next) => {
  console.log(req.body);
  try {
    const _findExport = await Export.findByPk(req.params.id);
    if (!_findExport) {
      next({
        status: 400,
        message: `Không thể tìm thấy đơn xuất hàng`,
      });
      return;
    }

    const findExport = _findExport.get({ plain: true });

    if (findExport.state === 'close') {
      return res.send(common.returnAPIData({}, `Tình trạng đơn này đã đóng, không thể cập nhập!`));
    }

    if (
      !req.body.export_date &&
      !findExport.export_date &&
      findExport.state === 'request' &&
      req.body.state === 'executed'
    ) {
      next({
        status: 400,
        message: 'Thiếu ngày thực hiện xuất hàng',
      });
      return;
    }

    if (
      (findExport.state === 'request' && req.body.state === 'request') ||
      (findExport.state === 'executed' && req.body.state === 'request') ||
      (findExport.state === 'request' && !req.body.state)
    ) {
      const _export = {
        state: 'request',
        requesterId: req.userId,
        urgent_level: req.body.urgent_level || undefined,
        request_export_date: moment(req.body.request_export_date) || undefined,
        bonus: req.body.bonus,
        updatedAt: new Date(),
      };

      const updateExport = await Export.update(_export, {
        where: { ExID: req.params.id },
      });

      let updateProductsInExport = 0;
      if (parseInt(updateExport) === 1) {
        const _updateProductsInExport = await Promise.all(
          req.body.exportProducts.map(async exportProduct => {
            if (exportProduct.request_total_unit) {
              return ProductInExport.update(
                {
                  request_total_unit: parseInt(exportProduct.request_total_unit),
                  updatedAt: moment(),
                },
                {
                  where: { exportId: req.params.id, productId: exportProduct.productId },
                  silent: true,
                }
              );
            } else {
              return 0;
            }
          })
        );
        console.log(`updateProductsInExport`, _updateProductsInExport);
        updateProductsInExport = _updateProductsInExport.reduce((sum, item) => sum + parseInt(item), 0);
      }

      log(req);
      return res.send(common.returnAPIData({ updateProductsInExport }, `Cập nhật thông tin nhập hàng thành công`));
    }

    const body = {
      request_export_date: moment(req.body.request_export_date) || undefined,
      state: req.body.state,
      export_date: moment(req.body.export_date) || moment(),
      updatedAt: new Date(),
      urgent_level: req.body.urgent_level ? req.body.urgent_level : undefined,
      checkerId: req.body.state === 'close' ? req.userId : undefined,
      executorId: req.userId,
      bonus: req.body.bonus || undefined,
    };

    const updateExport = await Export.update(body, {
      where: { ExID: req.params.id },
    });

    if (parseInt(updateExport) === 1 && _.isArray(req.body.exportProducts) && req.body.exportProducts.length > 0) {
      let updateProductsInExportAndLot;
      if (
        (findExport.state === 'request' && req.body.state === 'executed') ||
        (findExport.state === 'executed' && req.body.state === 'executed') ||
        (findExport.state === 'request' && !req.body.state)
      ) {
        updateProductsInExportAndLot = await Promise.all(
          req.body.exportProducts.map(async exportProduct => {
            let remain_total_unit = exportProduct.request_total_unit;

            const _findLot = await Lot.findAll({ where: { productId: exportProduct.productId } });
            if (_findLot && _findLot.length > 0) {
              const sortedLots = common.sortedByDate(
                _findLot.map(el => el.get({ plain: true })),
                true
              );

              sortedLots.forEach(eachLot => {
                if (remain_total_unit === 0) {
                  return { ...eachLot, isUpdated: true };
                }
                let newLot = _.cloneDeep(eachLot);
                if (remain_total_unit > newLot.qttLotInWarehouse) {
                  remain_total_unit -= newLot.qttLotInWarehouse;
                  newLot.qttProductInStore += newLot.qttLotInWarehouse * newLot.conversionRate;
                  newLot.qttLotInWarehouse = 0;
                } else {
                  newLot.qttLotInWarehouse -= remain_total_unit;
                  newLot.qttProductInStore += remain_total_unit * newLot.conversionRate;
                  remain_total_unit = 0;
                }
              });
            }

            let isUpdatedProductsInExport = 0;
            if (exportProduct.request_total_unit) {
              const productInExport = await ProductInExport.update(
                {
                  request_total_unit: parseInt(exportProduct.request_total_unit),
                  real_total_unit: exportProduct.request_total_unit - remain_total_unit,
                  updatedAt: moment(),
                },
                {
                  where: { exportId: req.params.id, productId: exportProduct.productId },
                  silent: true,
                }
              );

              isUpdatedProductsInExport = parseInt(productInExport);
            }

            return {
              productId: exportProduct.productId,
              isUpdatedProductsInExport: isUpdatedProductsInExport === 1 ? true : false,
            };
          })
        );
      }

      if (findExport.state === 'executed' && req.body.state === 'close') {
        updateProductsInExportAndLot = await Promise.all(
          req.body.exportProducts.map(async exportProduct => {
            //find all lot with product id to cal sum product
            let remain_total_unit = exportProduct.request_total_unit;

            const _findLot = await Lot.findAll({ where: { productId: exportProduct.productId } });
            const sortedLots = common.sortedByDate(
              _findLot.map(el => el.get({ plain: true })),
              true
            );

            const lots = await Promise.all(
              sortedLots.map(async eachLot => {
                if (remain_total_unit === 0) {
                  return { ...eachLot, isUpdated: true };
                }
                let newLot = _.cloneDeep(eachLot);
                if (remain_total_unit > newLot.qttLotInWarehouse) {
                  remain_total_unit -= newLot.qttLotInWarehouse;
                  newLot.qttProductInStore += newLot.qttLotInWarehouse * newLot.conversionRate;
                  newLot.qttLotInWarehouse = 0;
                } else {
                  newLot.qttLotInWarehouse -= remain_total_unit;
                  newLot.qttProductInStore += remain_total_unit * newLot.conversionRate;
                  remain_total_unit = 0;
                }

                const updateLotInDB = await Lot.update(
                  {
                    qttLotInWarehouse: newLot.qttLotInWarehouse,
                    qttProductInStore: newLot.qttProductInStore,
                    updatedAt: new Date(),
                  },
                  {
                    where: {
                      lotId: newLot.lotId,
                    },
                  }
                );

                if (parseInt(updateLotInDB) === 1) {
                  return { ...newLot, isUpdated: true };
                } else {
                  return { ...newLot, isUpdated: false };
                }
              })
            );

            //-----
            let isUpdatedProductsInExport = 0;
            if (exportProduct.request_total_unit) {
              const _productInExport = await ProductInExport.update(
                {
                  request_total_unit: parseInt(exportProduct.request_total_unit),
                  real_total_unit: exportProduct.request_total_unit - remain_total_unit,
                  updatedAt: moment(),
                },
                {
                  where: { exportId: req.params.id, productId: exportProduct.productId },
                  silent: true,
                }
              );
              isUpdatedProductsInExport = parseInt(_productInExport);
            }
            //-----

            //update count product
            const _oldProduct = await Product.findByPk(exportProduct.productId, {
              attributes: ['PID'],
              include: [
                {
                  model: Lot,
                  as: 'lots',
                  attributes: ['qttLotInWarehouse', 'qttProductInStore', 'conversionRate'],
                },
              ],
            });
            let updatedProductCount;
            if (_oldProduct) {
              const oldProduct = _oldProduct.get({ plain: true });

              const warehouse_curr_qtt = oldProduct.lots.reduce((sum, productLot) => {
                return sum + productLot.qttLotInWarehouse * productLot.conversionRate;
              }, 0);

              const store_curr_qtt = oldProduct.lots.reduce((sum, productLot) => {
                return sum + productLot.qttProductInStore * productLot.conversionRate;
              }, 0);

              updatedProductCount = await Product.update(
                { warehouse_curr_qtt, store_curr_qtt },
                { where: { PID: exportProduct.productId } }
              );
            }
            //-----

            return {
              productId: exportProduct.productId,
              real_total_unit: exportProduct.request_total_unit - remain_total_unit,
              isUpdatedProductsInExport: isUpdatedProductsInExport === 1 ? true : false,
              isUpdatedProductCount: parseInt(updatedProductCount) === 1,
              lots,
            };
          })
        );
      }

      console.log('updateProductsInExportAndLot', updateProductsInExportAndLot);
      res.send(common.returnAPIData(updateProductsInExportAndLot, `Cập nhật thông tin nhập hàng thành công`));
      log(req);
    } else {
      next({
        status: 400,
        message: 'Không có sản phẩm trong đơn xuất hàng',
      });
      return;
    }
  } catch (error) {
    next({
      status: 400,
      message: error.message,
      method: 'put',
      name: 'thông tin xuất hàng',
      id: req.params.id,
    });
    return;
  }
};

// Delete a export with the specified id in the request
exports.delete = async (req, res, next) => {
  try {
    const { arrayIds = [] } = req.body;

    // const count_deleted_product_in_export = await ProductInExport.destroy({
    //   where: { exportId: { [Op.or]: arrayIds } },
    // });

    const count_deleted_export = await Export.destroy({
      where: { ExID: { [Op.or]: arrayIds } },
    });

    res.send(common.returnAPIData(`${count_deleted_export} phiếu xuất đã bị xoá!`));

    arrayIds.forEach(id => {
      LogController.createLog({
        MngID: req.userId,
        action: ActionOnTable.DELETE,
        tableOfAction: Table.EXPORT,
        affectedRowID: id,
        nameInRow: null,
      });
    });
  } catch (error) {
    next({
      status: 400,
      message: error.message,
      method: 'delete',
      name: 'thông tin xuất hàng',
      id: id,
    });
    return;
  }
};
