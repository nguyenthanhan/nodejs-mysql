'use strict';
const common = require('../utils/common');
const db = require('../models/db');
const lang = require('../lang');
const { manager: Manager, export: Export, product: Product, lot: Lot, productInImport: ProductInImport } = db;
const Op = db.Sequelize.Op;
const moment = require('moment');
const _ = require('lodash');

// Create and Save a new export
exports.create = async (req, res, next) => {
  console.log(req.body);

  if (!req.body.export_number) {
    next({
      status: 400,
      message: lang.general.error._400,
    });
    return;
  }

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
      mngID: req.userId,
      export_number: req.body.export_number,
      export_action_date: req.body.export_action_date ? moment(req.body.export_action_date) : new Date(),
      state: req.body.state ? req.body.state : 'request',
      urgent_level: req.body.urgent_level ? req.body.urgent_level : 'normal',
      checkerId: req.body.checkerId ? parseInt(req.body.checkerId) : null,
    };

    // Save export in the database
    const _createExport = await Export.create(_export);
    const createExport = _createExport.get({ plain: true });

    const productListWithLots = await getProductListWithLots(req.body.exportProducts);
    console.log(JSON.stringify(productListWithLots));

    //handle logic export

    res.send(common.returnAPIData(createExport, 'Tạo đơn xuất hàng thành công!'));
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

const getProductListWithLots = async exportProducts => {
  const arrayIds = exportProducts.map(product => product.productId);

  const _productsList = await Product.findAll({
    where: { PID: { [Op.or]: arrayIds } },
    include: [
      {
        model: Lot,
        as: 'lots',
        attributes: {
          exclude: ['productId', 'createdAt', 'updatedAt', 'deletedAt'],
        },
      },
    ],
  });
  const productsList = _productsList.map(product => product.get({ plain: true }));

  const _newProductsImport = await ProductInImport.findAll({
    where: { productId: { [Op.or]: arrayIds } },
  });
  const newProductsImport = _newProductsImport.map(product => product.get({ plain: true }));

  const newProductList = productsList.map(product => {
    if (product.lots.length === 0) {
      return product;
    }
    const { lots, ...newProduct } = product;
    const newLots = lots.map(lot => {
      let newLot = lot;
      newProductsImport.forEach(productImport => {
        if (product.PID === productImport.productId && lot.importId === productImport.importId) {
          const { expires, import_price_product } = productImport;
          newLot = {
            ...lot,
            expires,
            import_price_product,
          };
        }
      });

      return newLot;
    });
    console.log('lots', newLots);
    return {
      ...newProduct,
      lots: common.sortedByDate(newLots, true),
    };
  });

  return newProductList;
};

// Retrieve all exports from the database.
exports.findAll = async (req, res, next) => {
  //TODO: need find by other exp: accountName, not id
  // const mngID = req.query.mngID;
  // let condition = mngID ? { mngID: { [Op.like]: `%${mngID}%` } } : null;

  Export.findAll({
    // where: condition,
    include: [
      {
        model: Manager,
        as: 'manager',
        attributes: {
          exclude: ['productId', 'createdAt', 'updatedAt', 'deletedAt'],
        },
      },
    ],
  })
    .then(data => {
      if (data) {
        res.send(common.returnAPIData(data));
      } else {
        next({
          status: 400,
          message: 'Không tìm thấy thông tin xuất hàng',
        });
        return;
      }
    })
    .catch(err => {
      next({
        status: 400,
        message: err.message,
        method: 'get',
        name: 'thông tin xuất hàng',
        id: 0,
      });
      return;
    });
};

// Find a single export with an id
exports.findOne = async (req, res, next) => {
  const id = req.params.id;

  Export.findByPk(id)
    .then(data => {
      res.send(common.returnAPIData(data));
    })
    .catch(err => {
      next({
        status: 400,
        message: err.message,
        method: 'get',
        name: 'thông tin xuất hàng',
        id: id,
      });
      return;
    });
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
  const { arrayIds = [] } = req.body;

  Export.destroy({
    where: { ExID: { [Op.or]: arrayIds } },
  })
    .then(num => {
      if (num > 0) {
        res.send(common.returnAPIData({}, `${num} phiếu xuất đã bị xoá!`));
      } else {
        next({
          status: 400,
          message: `Không thể xoá thông tin xuất hàng này. Có thể không tìm thấy thông tin xuất hàng!`,
        });
        return;
      }
    })
    .catch(err => {
      next({
        status: 400,
        message: err.message,
        method: 'delete',
        name: 'thông tin xuất hàng',
        id: id,
      });
      return;
    });
};
