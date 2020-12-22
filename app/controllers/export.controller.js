'use strict';
const common = require('../utils/common');
const db = require('../models/db');
const { manager: Manager, export: Export, product: Product, lot: Lot, productInExport: ProductInExport } = db;
const Op = db.Sequelize.Op;
const moment = require('moment');
const _ = require('lodash');

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

    //handle logic export
    res.send(common.returnAPIData({ ...createExport, productsWithExport }, 'Tạo đơn xuất hàng thành công!'));
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
    const id = req.params.id;
    const newBody = { ...req.body, updatedAt: new Date() };

    const createExport = await Export.update(newBody, {
      where: { ExID: id },
    });

    if (createExport && createExport.ExID) {
      res.send(common.returnAPIData({}, 'Cập nhật thông tin xuất hàng thành công'));
    } else {
      next({
        status: 400,
        message: `Không thể cập nhật thông tin xuất hàng này. thông tin xuất hàng không thể tìm thấy!`,
      });
      return;
    }
  } catch (error) {
    next({
      status: 400,
      message: error.message,
      method: 'put',
      name: 'thông tin xuất hàng',
      id: id,
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
