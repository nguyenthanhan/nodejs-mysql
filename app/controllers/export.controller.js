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
      requesterId: parseInt(req.body.requesterId) || undefined,
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
          model: Manager,
          as: 'checker',
          attributes: ['MngID', 'accountName', 'LName', 'FName'],
        },
        {
          model: Manager,
          as: 'manager',
          attributes: ['MngID', 'accountName', 'LName', 'FName'],
        },
        {
          model: Product,
          as: 'products',
          attributes: ['PID', 'name'],
        },
      ],
    });
    const newExport = _newExport.map(el => el.get({ plain: true }));

    res.send(common.returnAPIData(newExport));
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
          model: Manager,
          as: 'checker',
          attributes: ['MngID', 'accountName', 'LName', 'FName'],
        },
        {
          model: Manager,
          as: 'manager',
          attributes: ['MngID', 'accountName', 'LName', 'FName'],
        },
        {
          model: Product,
          as: 'products',
          attributes: ['PID', 'name'],
        },
      ],
    });

    res.send(common.returnAPIData(data));
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

// Update a export by the id in the request
exports.update = async (req, res, next) => {
  try {
    const _findExport = await Export.findByPk(req.params.id);
    if (!_findExport) {
      res.send(common.returnAPIData({}, `Không thể cập nhập đơn xuất hàng`));
      return;
    }
    const findExport = _findExport.get({ plain: true });

    if (findExport && findExport.state === 'close') {
      return res.send(common.returnAPIData({}, `Tình trạng đơn này đã đóng, không thể cập nhập!`));
    }

    const body = {
      request_export_date: req.body.request_export_date ? moment(req.body.request_export_date) : new Date(),
      state: req.body.state === 'request' && findExport.state === 'executed' ? undefined : req.body.state,
      export_date: moment(req.body.export_date) || undefined,
      updatedAt: new Date(),
      urgent_level: req.body.urgent_level ? req.body.urgent_level : undefined,
      requesterId: parseInt(req.body.supplierId) || undefined,
      checkerId: parseInt(req.body.supplierId) || undefined,
      executorId: parseInt(req.body.supplierId) || undefined,
      supplierId: parseInt(req.body.supplierId) || undefined,
      bonus: req.body.bonus || undefined,
    };

    const updateExport = await Export.update(body, {
      where: { ExID: req.params.id },
    });

    if (parseInt(updateExport, 10) === 1 && updateExport.state === 'close') {
      res.send(common.returnAPIData({}, `Cập nhật thông tin nhập hàng thành công`));
      return;
    }

    if (
      parseInt(updateExport, 10) === 1 &&
      req.body.exportProducts &&
      _.isArray(req.body.exportProducts) &&
      req.body.exportProducts.length > 0
    ) {
      if (updateExport.state === 'request') {
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
        return res.send(common.returnAPIData({}, `Cập nhật thông tin nhập hàng thành công`));
      }

      const updateProductsInExportAndLot = await Promise.all(
        req.body.exportProducts.map(async exportProduct => {
          //find all lot with product id to cal sum product
          let remain_total_unit = exportProduct.request_total_unit;
          let productId = null;

          const _findLot = await Lot.findAll({ where: { productId: exportProduct.productId } });
          const sortedLots = common.sortedByDate(
            _findLot.map(el => el.get({ plain: true })),
            true
          );

          const lots = await Promise.all(
            sortedLots.map(async eachLot => {
              productId = eachLot.productId;
              if (remain_total_unit === 0) {
                return { ...eachLot, isUpdated: true };
              }
              let newLot = _.cloneDeep(eachLot);
              if (remain_total_unit > newLot.qttLotInWarehouse) {
                remain_total_unit = remain_total_unit - newLot.qttLotInWarehouse;
                newLot.qttProductInStore = newLot.qttLotInWarehouse * newLot.conversionRate;
                newLot.qttLotInWarehouse = 0;
              } else {
                newLot.qttLotInWarehouse = newLot.qttLotInWarehouse - remain_total_unit;
                newLot.qttProductInStore = remain_total_unit * newLot.conversionRate;
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

          const productsInExport = await Promise.all(
            req.body.exportProducts.map(async exportProduct => {
              if (exportProduct.request_total_unit) {
                const productInExport = await ProductInExport.update(
                  {
                    request_total_unit: parseInt(exportProduct.request_total_unit),
                    real_total_unit: remain_total_unit,
                    updatedAt: moment(),
                  },
                  {
                    where: { exportId: req.params.id, productId: exportProduct.productId },
                    silent: true,
                  }
                );
                //TODO
                return productInExport;
              } else {
                return 0;
              }
            })
          );

          return {
            productId,
            productsInExport,
            lots,
          };
        })
      );

      res.send(common.returnAPIData(updateProductsInExportAndLot, `Cập nhật thông tin nhập hàng thành công`));

      LogController.createLog({
        MngID: req.userId,
        action: ActionOnTable.EDIT,
        tableOfAction: Table.EXPORT,
        affectedRowID: req.params.id,
        nameInRow: null,
      });
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
